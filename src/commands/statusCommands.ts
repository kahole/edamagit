import { MagitChange } from '../models/magitChange';
import { workspace, window, ViewColumn, Range, commands } from 'vscode';
import { gitApi, magitRepositories, views } from '../extension';
import FilePathUtils from '../utils/filePathUtils';
import GitTextUtils from '../utils/gitTextUtils';
import { MagitRepository } from '../models/magitRepository';
import MagitUtils from '../utils/magitUtils';
import MagitStatusView from '../views/magitStatusView';
import { Status, Commit } from '../typings/git';
import { MagitBranch } from '../models/magitBranch';
import { Section } from '../views/general/sectionHeader';

export async function magitRefresh() {
  return;
}

export async function magitStatus(preserveFocus = false) {

  if (window.activeTextEditor) {

    const activeWorkspaceFolder = workspace.getWorkspaceFolder(window.activeTextEditor.document.uri);

    if (activeWorkspaceFolder) {

      const workspaceRootPath = activeWorkspaceFolder.uri.path;

      let repository: MagitRepository | undefined;

      // MINOR: Any point in reusing repo?
      // This might make magit LESS resilient to changes in workspace etc.
      for (const [key, repo] of magitRepositories.entries()) {
        if (FilePathUtils.isDescendant(key, workspaceRootPath)) {
          repository = repo;
          break;
        }
      }

      if (repository) {
        for (const [uri, view] of views ?? []) {
          if (view instanceof MagitStatusView) {
            // Resuses doc, if still exists. Which it should if the view still exists
            // Open and focus magit status view
            // Run update
            await MagitUtils.magitStatusAndUpdate(repository, view);
            workspace.openTextDocument(view.uri).then(doc => window.showTextDocument(doc, { viewColumn: ViewColumn.Beside, preserveFocus, preview: false }));
            console.log('Update existing view');
            return;
          }
        }
      } else {
        console.log('load repo from git api (not map)');
        repository = gitApi.repositories.filter(r => FilePathUtils.isDescendant(r.rootUri.path, workspaceRootPath))[0];
      }

      if (repository) {
        const magitRepo: MagitRepository = repository;
        magitRepositories.set(repository.rootUri.path, repository);

        internalMagitStatus(magitRepo)
          .then(() => {
            // MINOR: Pull out, make general? for every place this is done
            const uri = MagitStatusView.encodeLocation(magitRepo.rootUri.path);
            views.set(uri.toString(), new MagitStatusView(uri, magitRepo.magitState!));
            workspace.openTextDocument(uri).then(doc => window.showTextDocument(doc, { viewColumn: ViewColumn.Beside, preserveFocus, preview: false }))
              // TODO: test only
              // THIS WORKS
              // Decorations should be added by the views in the view hierarchy?
              // yes as we go down the hierarchy make these decorations at exactly the points wanted
              // and should be pretty simple to collect them and set the editors decorations
              // needs something super smart.. https://github.com/Microsoft/vscode/issues/585
              .then(e => e.setDecorations(
                window.createTextEditorDecorationType({
                  color: 'rgba(100,200,100,0.5)',
                  border: '0.1px solid grey'
                }), [new Range(0, 7, 0, 13)]));
          });
      } else {
        // Prompt to create repo
        await commands.executeCommand('git.init');
        magitStatus();
      }
    }
    else {
      throw new Error('No workspace open');
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
        const magitChange: MagitChange = c;
        magitChange.relativePath = FilePathUtils.uriPathRelativeTo(c.uri, repository.rootUri);
        untrackedFiles.push(magitChange);
        return false;
      }
      return true;
    });

  const workingTreeChangesTasks = Promise.all(workingTreeChanges_NoUntracked
    .map(async change => {
      const diff = await repository.diffWithHEAD(change.uri.path);
      const magitChange: MagitChange = change;
      magitChange.relativePath = FilePathUtils.uriPathRelativeTo(change.uri, repository.rootUri);
      magitChange.hunks = GitTextUtils.diffToHunks(diff, change.uri, Section.Unstaged);
      return magitChange;
    }));

  const indexChangesTasks = Promise.all(repository.state.indexChanges
    .map(async change => {
      const diff = await repository.diffIndexWithHEAD(change.uri.path);
      const magitChange: MagitChange = change;
      magitChange.relativePath = FilePathUtils.uriPathRelativeTo(change.uri, repository.rootUri);
      magitChange.hunks = GitTextUtils.diffToHunks(diff, change.uri, Section.Staged);
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

  const commitCache: { [id: string]: Commit; } = commits.reduce((prev, commit) => ({ ...prev, [commit.hash]: commit }), {});

  const HEAD = repository.state.HEAD as MagitBranch | undefined;

  if (HEAD?.commit) {
    HEAD.commitDetails = commitCache[HEAD.commit];
    // MINOR: clean up?
    try {
      const remote = await repository.getConfig(`branch.${HEAD.name}.pushRemote`);
      HEAD.pushRemote = { remote, name: HEAD!.name! };
    } catch { }
  }

  repository.magitState = {
    HEAD,
    stashes,
    log,
    commitCache,
    workingTreeChanges,
    indexChanges,
    mergeChanges: [],
    untrackedFiles,
    latestGitError: repository.magitState?.latestGitError
  };
}