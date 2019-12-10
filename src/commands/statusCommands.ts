import { MagitState } from "../models/magitStatus";
import { MagitChange } from "../models/magitChange";
import { encodeLocation } from "../contentProvider";
import { workspace, window, ViewColumn, Range } from "vscode";
import { gitApi, magitRepositories } from "../extension";
import { Repository, Status, Change } from "../typings/git";
import { FilePathUtils } from "../utils/filePathUtils";
import { GitTextUtils } from "../utils/gitTextUtils";
import { MagitRepository } from "../models/magitRepository";

export function magitStatus() {

  if (workspace.workspaceFolders && workspace.workspaceFolders[0]) {

    const rootPath = workspace.workspaceFolders[0].uri.fsPath;

    let repository: MagitRepository | undefined;
    
    // TODO: clean up this mess

    // [, repository] = Object.entries(magitRepositories).filter(
      // ([key, repo]) => FilePathUtils.isDescendant(key, rootPath))[0];

    if (!repository) {
      repository = gitApi.repositories.filter(r => FilePathUtils.isDescendant(r.rootUri.fsPath, rootPath))[0];
    }

    if (repository) {
      let magitRepo: MagitRepository = repository;
      magitRepositories[repository.rootUri.fsPath] = repository;

      MagitStatus(repository)
        .then(m => {
          magitRepo.magitState = m;
          const uri = encodeLocation(magitRepo.rootUri.fsPath);
          workspace.openTextDocument(uri).then(doc => window.showTextDocument(doc, ViewColumn.Beside));
        });
    }
  }
  else {
    throw new Error("No workspace open");
  }
}

async function MagitStatus(repository: Repository): Promise<MagitState> {

  await repository.status();

  let stashTask = repository._repository.getStashes();

  let logTask = repository.log({ maxEntries: 10 });

  let commitTasks = Promise.all(
    [repository.state.HEAD!.commit!]
      .map(c => repository.getCommit(c)));
  // .map(repository.getCommit));

  let untrackedFiles: MagitChange[] = [];

  let workingTreeChanges_NoUntracked = repository.state.workingTreeChanges
    .filter(c => {
      if (c.status === Status.UNTRACKED) {
        untrackedFiles.push(c);
        return false;
      } else {
        return true;
      }
    });

  let workingTreeChangesTasks = Promise.all(workingTreeChanges_NoUntracked
    .map(change =>
      repository.diffWithHEAD(change.uri.path)
        .then(GitTextUtils.diffToHunks)
        .then<MagitChange>(hunks => {
          let magitChange: MagitChange = change;
          magitChange.hunks = hunks;
          return magitChange;
        })
    ));

  let indexChangesTasks = Promise.all(repository.state.indexChanges
    .map(change =>
      repository.diffIndexWithHEAD(change.uri.path)
        .then(GitTextUtils.diffToHunks)
        .then<MagitChange>(hunks => {
          let magitChange: MagitChange = change;
          magitChange.hunks = hunks;
          return magitChange;
        })
    ));

  let [commits, workingTreeChanges, indexChanges, stashes, log] =
    await Promise.all([
      commitTasks,
      workingTreeChangesTasks,
      indexChangesTasks,
      stashTask,
      logTask
    ]);

  let commitCache = commits.reduce((prev, commit) => ({ ...prev, [commit.hash]: commit }), {});

  return {
    _state: repository.state,
    stashes,
    log,
    commitCache,
    workingTreeChanges,
    indexChanges,
    mergeChanges: undefined,
    untrackedFiles
  };
}