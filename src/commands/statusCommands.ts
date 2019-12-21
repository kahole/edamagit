import { MagitChange } from "../models/magitChange";
import { workspace, window, ViewColumn, Range, commands } from "vscode";
import { gitApi, magitRepositories } from "../extension";
import FilePathUtils from "../utils/filePathUtils";
import GitTextUtils from "../utils/gitTextUtils";
import { MagitRepository } from "../models/magitRepository";
import MagitUtils from "../utils/magitUtils";
import MagitStatusView from "../views/magitStatusView";
import { Status, Commit } from "../typings/git";
import { MagitBranch } from "../models/magitBranch";

export async function magitStatus() {

  if (window.activeTextEditor) {

    // Updating current view if inside it
    // TODO: Might move this to separate primed command
    //    makes things simpler
    let [repository, currentView] = MagitUtils.getCurrentMagitRepoAndView(window.activeTextEditor);

    if (repository && currentView) {
      return MagitUtils.magitStatusAndUpdate(repository, currentView);
    }

    const activeWorkspaceFolder = workspace.getWorkspaceFolder(window.activeTextEditor.document.uri);

    if (activeWorkspaceFolder) {

      const workspaceRootPath = activeWorkspaceFolder.uri.path;

      let repository: MagitRepository | undefined;

      // Any point in reusing repo?
      for (let [key, repo] of magitRepositories.entries()) {
        if (FilePathUtils.isDescendant(key, workspaceRootPath)) {
          repository = repo;
          break;
        }
      }

      if (repository) {
        for (let [uri, view] of repository.views ?? []) {
          if (view instanceof MagitStatusView) {
            MagitUtils.magitStatusAndUpdate(repository!, view);
            console.log("Update existing view");
            return;
          }
        }
      } else {
        console.log("load repo from git api (not map)");
        repository = gitApi.repositories.filter(r => FilePathUtils.isDescendant(r.rootUri.path, workspaceRootPath))[0];
      }

      if (repository) {
        const magitRepo: MagitRepository = repository;
        magitRepositories.set(repository.rootUri.path, repository);

        internalMagitStatus(magitRepo)
          .then(() => {
            const uri = MagitStatusView.encodeLocation(magitRepo.rootUri.path);
            workspace.openTextDocument(uri).then(doc => window.showTextDocument(doc, ViewColumn.Beside))
              // TODO: test only
              // THIS WORKS
              // Decorations should be added by the views in the view hierarchy?
              .then(e => e.setDecorations(
                window.createTextEditorDecorationType({
                  color: "rgba(100,200,100,0.5)",
                  border: "0.1px solid grey"
                })
                , [new Range(0, 7, 0, 13)]));
          });
      } else {
        // Prompt to create repo
        await commands.executeCommand("git.init");
        magitStatus();
      }
    }
    else {
      throw new Error("No workspace open");
    }
  }
}

export async function internalMagitStatus(repository: MagitRepository): Promise<void> {

  await repository.status();

  const stashTask = repository._repository.getStashes();

  const logTask = repository.state.HEAD?.commit ? repository.log({ maxEntries: 10 }) : [];

  const interestingCommits: string[] = [];

  if (repository.state.HEAD?.commit) {
    interestingCommits.push(repository.state.HEAD?.commit);
  }

  const commitTasks = Promise.all(
    interestingCommits
      .map(c => repository.getCommit(c)));

  const untrackedFiles: MagitChange[] = [];

  const workingTreeChanges_NoUntracked = repository.state.workingTreeChanges
    .filter(c => {
      if (c.status === Status.UNTRACKED) {
        untrackedFiles.push(c);
        return false;
      } else {
        return true;
      }
    });

  const workingTreeChangesTasks = Promise.all(workingTreeChanges_NoUntracked
    .map(async change => {
      let diff = await repository.diffWithHEAD(change.uri.path);
      let magitChange: MagitChange = change;
      magitChange.hunks = GitTextUtils.diffToHunks(diff, change.uri);
      return magitChange;
    }));

  const indexChangesTasks = Promise.all(repository.state.indexChanges
    .map(async change => {
      let diff = await repository.diffIndexWithHEAD(change.uri.path);
      let magitChange: MagitChange = change;
      magitChange.hunks = GitTextUtils.diffToHunks(diff, change.uri);
      return magitChange;
    }));

  const [commits, workingTreeChanges, indexChanges, stashes, log] =
    await Promise.all([
      commitTasks,
      workingTreeChangesTasks,
      indexChangesTasks,
      stashTask,
      logTask
    ]);

  let commitCache: { [id: string]: Commit; } = commits.reduce((prev, commit) => ({ ...prev, [commit.hash]: commit }), {});

  let HEAD = repository.state.HEAD as MagitBranch | undefined;

  if (HEAD?.commit) {
    HEAD.commitDetails = commitCache[HEAD.commit];

    await repository.getConfig(`branch.${HEAD.name}.pushRemote`)
      .then(remote => {
        // TODO: clean up
        HEAD!.pushRemote = { remote, name: HEAD!.name! };
      })
      .catch(console.log);
  }

  console.log(repository.state);

  repository.magitState = {
    HEAD,
    stashes,
    log,
    commitCache, // TODO: remove commit cache
    workingTreeChanges,
    indexChanges,
    mergeChanges: undefined,
    untrackedFiles
  };
}