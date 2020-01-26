import { MagitChange } from '../models/magitChange';
import { workspace, window, ViewColumn, Range, commands, Uri } from 'vscode';
import { gitApi, magitRepositories, views } from '../extension';
import FilePathUtils from '../utils/filePathUtils';
import GitTextUtils from '../utils/gitTextUtils';
import { MagitRepository } from '../models/magitRepository';
import MagitUtils from '../utils/magitUtils';
import MagitStatusView from '../views/magitStatusView';
import { Status, Commit, RefType } from '../typings/git';
import { MagitBranch } from '../models/magitBranch';
import { Section } from '../views/general/sectionHeader';
import { gitRun } from '../utils/gitRawRunner';

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
              // TODO ?FUTURE?: branch highlighting...
              // THIS WORKS
              // Decorations could be added by the views in the view hierarchy?
              // yes as we go down the hierarchy make these decorations at exactly the points wanted
              // and should be pretty simple to collect them and set the editors decorations
              // needs something super smart.. https://github.com/Microsoft/vscode/issues/585
              .then(e => e.setDecorations(
                window.createTextEditorDecorationType({
                  color: 'rgba(100,200,100,0.5)',
                  border: '0.1px solid grey'
                }), [new Range(0, 11, 0, 17)]))
              // MINOR: clean up all of this
              .then(() => {
                return commands.executeCommand('editor.foldLevel2');
              });
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

  const interestingCommits: string[] = [];

  const stashTask = repository._repository.getStashes();

  const logTask = repository.state.HEAD?.commit ? repository.log({ maxEntries: 10 }) : [];

  if (repository.state.HEAD?.commit) {
    interestingCommits.push(repository.state.HEAD?.commit);
  }

  let commitsAhead: string[] = [], commitsBehind: string[] = [];
  if (repository.state.HEAD?.ahead || repository.state.HEAD?.behind) {
    const ref = repository.state.HEAD.name;
    const args = ['rev-list', '--left-right', `${ref}...${ref}@{u}`];
    const res = (await gitRun(repository, args)).stdout;
    [commitsAhead, commitsBehind] = GitTextUtils.parseRevListLeftRight(res);
    interestingCommits.push(...[...commitsAhead, ...commitsBehind]);
  }

  const untrackedFiles: MagitChange[] = [];

  const workingTreeChanges_NoUntracked = repository.state.workingTreeChanges
    .filter(c => {
      if (c.status === Status.UNTRACKED) {
        const magitChange: MagitChange = c;
        magitChange.section = Section.Untracked;
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
      magitChange.section = Section.Unstaged;
      magitChange.relativePath = FilePathUtils.uriPathRelativeTo(change.uri, repository.rootUri);
      magitChange.hunks = GitTextUtils.diffToHunks(diff, change.uri, Section.Unstaged);
      return magitChange;
    }));

  const indexChangesTasks = Promise.all(repository.state.indexChanges
    .map(async change => {
      const diff = await repository.diffIndexWithHEAD(change.uri.path);
      const magitChange: MagitChange = change;
      magitChange.section = Section.Staged;
      magitChange.relativePath = FilePathUtils.uriPathRelativeTo(change.uri, repository.rootUri);
      magitChange.hunks = GitTextUtils.diffToHunks(diff, change.uri, Section.Staged);
      return magitChange;
    }));

  const mergeChangesTasks = Promise.all(repository.state.mergeChanges
    .map(async change => {
      const diff = await repository.diffWithHEAD(change.uri.path);
      const magitChange: MagitChange = change;
      magitChange.section = Section.Staged;
      magitChange.relativePath = FilePathUtils.uriPathRelativeTo(change.uri, repository.rootUri);
      magitChange.hunks = GitTextUtils.diffToHunks(diff, change.uri, Section.Staged);
      return magitChange;
    }));

  const mergeHeadPath = Uri.parse(repository.rootUri + '/.git/' + 'MERGE_HEAD');
  const mergeMsgPath = Uri.parse(repository.rootUri + '/.git/' + 'MERGE_MSG');
  const mergeHeadTask = workspace.fs.readFile(mergeHeadPath);
  const mergeMsgTask = workspace.fs.readFile(mergeMsgPath);

  const commitTasks = Promise.all(
    interestingCommits
      .map(c => repository.getCommit(c)));

  const [commits, workingTreeChanges, indexChanges, mergeChanges, stashes, log] =
    await Promise.all([
      commitTasks,
      workingTreeChangesTasks,
      indexChangesTasks,
      mergeChangesTasks,
      stashTask,
      logTask
    ]);

  // TODO: load details about the merging commits, ONLY if there is a mergingState !
  // make a nice chain of commands that can be awaited for, like the ones above.
  let mergingState;
  try {
    mergingState =
      await Promise.all([
        mergeHeadTask,
        mergeMsgTask
      ])
        .then(([mergeHeadFile, mergeMsgFile]) => (GitTextUtils.parseMergeStatus(mergeHeadFile.toString(), mergeMsgFile.toString())));
  } catch { }

  const commitMap: { [id: string]: Commit; } = commits.reduce((prev, commit) => ({ ...prev, [commit.hash]: commit }), {});

  const HEAD = repository.state.HEAD as MagitBranch | undefined;

  if (HEAD?.commit) {
    HEAD.commitDetails = commitMap[HEAD.commit];
    // Resolve tag at HEAD
    HEAD.tag = repository.state.refs.find(r => HEAD?.commit === r.commit && r.type === RefType.Tag);

    HEAD.commitsAhead = commitsAhead.map(hash => commitMap[hash]);
    HEAD.commitsBehind = commitsBehind.map(hash => commitMap[hash]);

    // MINOR: clean up?
    try {
      const remote = await repository.getConfig(`branch.${HEAD.name}.pushRemote`);
      HEAD.pushRemote = { remote, name: HEAD!.name! };
    } catch { }
  }

  // MINOR: state ONchange might be interesting
  // repository.state.onDidChange
  // Use instead of onDidSave document? might be better to let vscode handle it, instead of doubling up potentially
  // just need to re-render without calling repository.status()

  repository.magitState = {
    HEAD,
    stashes,
    log,
    workingTreeChanges,
    indexChanges,
    mergeChanges,
    untrackedFiles,
    rebaseCommit: repository.state.rebaseCommit,
    mergingState,
    latestGitError: repository.magitState?.latestGitError
  };
}