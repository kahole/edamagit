import { MagitChange } from "../models/magitChange";
import { encodeLocation } from "../providers/contentProvider";
import { workspace, window, ViewColumn, Range } from "vscode";
import { gitApi, magitRepositories } from "../extension";
import FilePathUtils from "../utils/filePathUtils";
import GitTextUtils from "../utils/gitTextUtils";
import { MagitRepository } from "../models/magitRepository";
import MagitUtils from "../utils/magitUtils";
import MagitStatusView from "../views/magitStatusView";
import { Status, Commit } from "../typings/git";
import { MagitBranch } from "../models/magitBranch";

export function magitStatus() {

  // Magit status already open?
  let [repository, currentView] = MagitUtils.getCurrentMagitRepoAndView();

  if (currentView instanceof MagitStatusView) {
    let currentRepository = repository!;
    internalMagitStatus(currentRepository)
      .then(() => (currentView as MagitStatusView).triggerUpdate());
    return;
  }

  // New magit status document
  if (workspace.workspaceFolders && workspace.workspaceFolders[0]) {

    const rootPath = workspace.workspaceFolders[0].uri.fsPath;

    let repository: MagitRepository | undefined;

    // TODO: clean up this mess

    let repos = Object.entries(magitRepositories).filter(
      ([key, repo]) => FilePathUtils.isDescendant(key, rootPath));

    if (repos.length > 0) {
      console.log("reuse repo");
      [, repository] = repos[0];
    }

    if (!repository) {
      repository = gitApi.repositories.filter(r => FilePathUtils.isDescendant(r.rootUri.fsPath, rootPath))[0];
    }

    if (repository) {
      let magitRepo: MagitRepository = repository;
      magitRepositories[repository.rootUri.fsPath] = repository;

      internalMagitStatus(magitRepo)
        .then(() => {
          const uri = encodeLocation(magitRepo.rootUri.fsPath);
          workspace.openTextDocument(uri).then(doc => window.showTextDocument(doc, ViewColumn.Beside));
        });
    }
  }
  else {
    throw new Error("No workspace open");
  }
}

export async function internalMagitStatus(repository: MagitRepository): Promise<void> {

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
    .map(async change => {
      let diff = await repository.diffWithHEAD(change.uri.path);
      let magitChange: MagitChange = change;
      magitChange.hunks = GitTextUtils.diffToHunks(diff, change.uri);
      return magitChange;
    }));

  let indexChangesTasks = Promise.all(repository.state.indexChanges
    .map(async change => {
      let diff = await repository.diffIndexWithHEAD(change.uri.path);
      let magitChange: MagitChange = change;
      magitChange.hunks = GitTextUtils.diffToHunks(diff, change.uri);
      return magitChange;
    }));

  let [commits, workingTreeChanges, indexChanges, stashes, log] =
    await Promise.all([
      commitTasks,
      workingTreeChangesTasks,
      indexChangesTasks,
      stashTask,
      logTask
    ]);

  let commitCache: { [id: string]: Commit; } = commits.reduce((prev, commit) => ({ ...prev, [commit.hash]: commit }), {});

  let HEAD = repository.state.HEAD as MagitBranch;
  if (HEAD) {
    HEAD.commitDetails = commitCache[HEAD!.commit!];
  }

  repository.magitState = {
    _state: repository.state,
    HEAD,
    stashes,
    log,
    commitCache,
    workingTreeChanges,
    indexChanges,
    mergeChanges: undefined,
    untrackedFiles
  };
}