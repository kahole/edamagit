import { MagitChange } from '../models/magitChange';
import { workspace, window, Uri, TextEditor } from 'vscode';
import { views } from '../extension';
import FilePathUtils from '../utils/filePathUtils';
import GitTextUtils from '../utils/gitTextUtils';
import { MagitRepository } from '../models/magitRepository';
import MagitUtils from '../utils/magitUtils';
import MagitStatusView from '../views/magitStatusView';
import { Status, Commit, RefType, Repository, Change } from '../typings/git';
import { MagitBranch, MagitUpstreamRef } from '../models/magitBranch';
import { Section } from '../views/general/sectionHeader';
import { gitRun, LogLevel } from '../utils/gitRawRunner';
import * as Constants from '../common/constants';
import { getCommit } from '../utils/commitCache';
import { MagitRemote } from '../models/magitRemote';
import { MagitRebasingState } from '../models/magitRebasingState';
import { MagitMergingState } from '../models/magitMergingState';
import { MagitRevertingState } from '../models/magitRevertingState';

export async function magitRefresh() { }

export async function magitStatus(editor: TextEditor, preserveFocus = false): Promise<any> {

  const repository = await MagitUtils.getCurrentMagitRepo(editor.document.uri);

  if (repository) {

    // Checks for existing Magit status view
    for (const [uri, view] of views ?? []) {
      if (view instanceof MagitStatusView) {

        await MagitUtils.magitStatusAndUpdate(repository);
        if (editor.document.uri.path === MagitStatusView.UriPath) {
          return;
        }
        return workspace.openTextDocument(view.uri).then(doc => window.showTextDocument(doc, { viewColumn: MagitUtils.oppositeActiveViewColumn(), preserveFocus, preview: false }));
      }
    }

    await internalMagitStatus(repository);

    const uri = MagitStatusView.encodeLocation(repository);
    views.set(uri.toString(), new MagitStatusView(uri, repository.magitState!));

    return workspace.openTextDocument(uri).then(doc => window.showTextDocument(doc, { viewColumn: MagitUtils.oppositeActiveViewColumn(), preserveFocus, preview: false }));
  }
}

export async function internalMagitStatus(repository: MagitRepository): Promise<void> {

  await repository.status();

  const dotGitPath = repository.rootUri + '/.git/';

  const stashTask = repository._repository.getStashes();

  const logTask = repository.state.HEAD?.commit ? repository.log({ maxEntries: 100 }) : Promise.resolve([]);

  if (repository.state.HEAD?.commit) {
    getCommit(repository, repository.state.HEAD?.commit);
  }

  let commitsAheadUpstream: string[] = [], commitsBehindUpstream: string[] = [];
  if (repository.state.HEAD?.ahead || repository.state.HEAD?.behind) {
    const ref = repository.state.HEAD.name;
    const args = ['rev-list', '--left-right', `${ref}...${ref}@{u}`];
    const res = (await gitRun(repository, args, {}, LogLevel.None)).stdout;
    [commitsAheadUpstream, commitsBehindUpstream] = GitTextUtils.parseRevListLeftRight(res);
    commitsAheadUpstream.map(c => getCommit(repository, c));
    commitsBehindUpstream.map(c => getCommit(repository, c));
  }

  const workingTreeChanges_NoUntracked = repository.state.workingTreeChanges
    .filter(c => (c.status !== Status.UNTRACKED));

  const untrackedFiles: MagitChange[] =
    repository.state.workingTreeChanges.length > workingTreeChanges_NoUntracked.length ?
      (await gitRun(repository, ['ls-files', '--others', '--exclude-standard', '--directory', '--no-empty-directory']))
        .stdout
        .replace(Constants.FinalLineBreakRegex, '')
        .split(Constants.LineSplitterRegex)
        .map(untrackedPath => {
          const uri = Uri.parse(repository.rootUri.fsPath + '/' + untrackedPath);
          return {
            originalUri: uri,
            renameUri: uri,
            uri: uri,
            status: Status.UNTRACKED,
            relativePath: FilePathUtils.uriPathRelativeTo(uri, repository.rootUri),
            section: Section.Untracked
          };
        }) : [];

  const workingTreeChangesTasks = Promise.all(workingTreeChanges_NoUntracked
    .map(async change => {
      const diff = await repository.diffWithHEAD(change.uri.fsPath);
      return toMagitChange(repository, change, Section.Unstaged, diff);
    }));

  const indexChangesTasks = Promise.all(repository.state.indexChanges
    .map(async change => {
      const diff = await repository.diffIndexWithHEAD(change.uri.fsPath);
      return toMagitChange(repository, change, Section.Staged, diff);
    }));

  const mergeChangesTasks = Promise.all(repository.state.mergeChanges
    .map(async change => {
      const diff = await repository.diffWithHEAD(change.uri.fsPath);
      return toMagitChange(repository, change, Section.Unstaged, diff);
    }));

  const sequencerTodoPath = Uri.parse(dotGitPath + 'sequencer/todo');
  const sequencerHeadPath = Uri.parse(dotGitPath + 'sequencer/head');

  const mergingStateTask = mergingStatus(repository, dotGitPath);
  const rebasingStateTask = rebasingStatus(repository, dotGitPath, logTask);
  const cherryPickingStateTask = cherryPickingStatus(repository, dotGitPath, sequencerTodoPath, sequencerHeadPath);
  const revertingStateTask = revertingStatus(repository, dotGitPath, sequencerTodoPath, sequencerHeadPath);

  const HEAD = repository.state.HEAD as MagitBranch | undefined;

  if (HEAD?.commit) {
    HEAD.commitDetails = await getCommit(repository, HEAD.commit);

    HEAD.tag = repository.state.refs.find(r => HEAD?.commit === r.commit && r.type === RefType.Tag);

    try {
      if (HEAD.upstream?.remote) {
        const upstreamRemote = HEAD.upstream.remote;

        const upstreamRemoteCommit = repository.state.refs.find(ref => ref.remote === upstreamRemote && ref.name === `${upstreamRemote}/${HEAD.upstream?.name}`)?.commit;
        const upstreamRemoteCommitDetails = upstreamRemoteCommit ? getCommit(repository, upstreamRemoteCommit) : undefined;

        const isRebaseUpstream = repository.getConfig(`branch.${HEAD.upstream.name}.rebase`);

        HEAD.upstreamRemote = HEAD.upstream;
        HEAD.upstreamRemote.commit = await upstreamRemoteCommitDetails;
        HEAD.upstreamRemote.commitsAhead = await Promise.all(commitsAheadUpstream.map(hash => getCommit(repository, hash)));
        HEAD.upstreamRemote.commitsBehind = await Promise.all(commitsBehindUpstream.map(hash => getCommit(repository, hash)));
        HEAD.upstreamRemote.rebase = (await isRebaseUpstream) === 'true';
      }
    } catch { }

    HEAD.pushRemote = await pushRemoteStatus(repository);
  }

  const remoteBranches = repository.state.refs.filter(ref => ref.type === RefType.RemoteHead);

  const remotes: MagitRemote[] = repository.state.remotes.map(remote => ({
    ...remote,
    branches: remoteBranches.filter(remoteBranch => remoteBranch.remote === remote.name)
  }));

  repository.magitState = {
    HEAD,
    stashes: await stashTask,
    log: await logTask,
    workingTreeChanges: await workingTreeChangesTasks,
    indexChanges: await indexChangesTasks,
    mergeChanges: await mergeChangesTasks,
    untrackedFiles,
    rebasingState: await rebasingStateTask,
    mergingState: await mergingStateTask,
    cherryPickingState: await cherryPickingStateTask,
    revertingState: await revertingStateTask,
    branches: repository.state.refs.filter(ref => ref.type === RefType.Head),
    remotes,
    tags: repository.state.refs.filter(ref => ref.type === RefType.Tag),
    latestGitError: repository.magitState?.latestGitError
  };
}

function toMagitChange(repository: Repository, change: Change, section: Section, diff?: string): MagitChange {
  const magitChange: MagitChange = change;
  magitChange.section = section;
  magitChange.relativePath = FilePathUtils.uriPathRelativeTo(change.uri, repository.rootUri);
  magitChange.hunks = diff ? GitTextUtils.diffToHunks(diff, change.uri, section) : undefined;
  return magitChange;
}

async function pushRemoteStatus(repository: Repository): Promise<MagitUpstreamRef | undefined> {
  try {
    const HEAD = repository.state.HEAD;
    const pushRemote = await repository.getConfig(`branch.${HEAD!.name}.pushRemote`);

    if (HEAD?.name && pushRemote) {

      const args = ['rev-list', '--left-right', `${HEAD.name}...${pushRemote}/${HEAD.name}`];
      const res = (await gitRun(repository, args, {}, LogLevel.None)).stdout;
      const [commitsAheadPushRemote, commitsBehindPushRemote] = GitTextUtils.parseRevListLeftRight(res);
      const commitsAhead = await Promise.all(commitsAheadPushRemote.map(c => getCommit(repository, c)));
      const commitsBehind = await Promise.all(commitsBehindPushRemote.map(c => getCommit(repository, c)));

      const pushRemoteCommit = repository.state.refs.find(ref => ref.remote === pushRemote && ref.name === `${pushRemote}/${HEAD.name}`)?.commit;
      const pushRemoteCommitDetails = pushRemoteCommit ? getCommit(repository, pushRemoteCommit) : Promise.resolve(undefined);

      return { remote: pushRemote, name: HEAD.name, commit: await pushRemoteCommitDetails, commitsAhead, commitsBehind };
    }
  } catch { }
}

async function mergingStatus(repository: Repository, dotGitPath: string): Promise<MagitMergingState | undefined> {

  const mergeHeadPath = Uri.parse(dotGitPath + 'MERGE_HEAD');
  const mergeMsgPath = Uri.parse(dotGitPath + 'MERGE_MSG');

  const mergeHeadFileTask = workspace.fs.readFile(mergeHeadPath).then(f => f.toString(), err => undefined);
  const mergeMsgFileTask = workspace.fs.readFile(mergeMsgPath).then(f => f.toString(), err => undefined);

  try {
    const mergeHeadText = await mergeHeadFileTask;
    const mergeMsgText = await mergeMsgFileTask;
    if (mergeHeadText && mergeMsgText) {
      const parsedMergeState = GitTextUtils.parseMergeStatus(mergeHeadText, mergeMsgText);

      if (parsedMergeState) {
        const [mergeHeadCommit, mergingBranches] = parsedMergeState;

        const mergeCommitsText = (await gitRun(repository, ['rev-list', `HEAD..${mergeHeadCommit}`])).stdout;
        const mergeCommits = mergeCommitsText
          .replace(Constants.FinalLineBreakRegex, '')
          .split(Constants.LineSplitterRegex);

        return {
          mergingBranches,
          commits: await Promise.all(mergeCommits.map(c => getCommit(repository, c)))
        };
      }
    }
  } catch { }
}

async function rebasingStatus(repository: Repository, dotGitPath: string, logTask: Promise<Commit[]>): Promise<MagitRebasingState | undefined> {
  try {

    if (repository.state.rebaseCommit) {

      let activeRebasingDirectory: Uri;
      let interactive = false;
      const rebasingDirectory = Uri.parse(dotGitPath + 'rebase-apply/');
      const interactiveRebasingDirectory = Uri.parse(dotGitPath + 'rebase-merge/');

      if (await workspace.fs.readDirectory(rebasingDirectory).then(res => res.length, err => undefined)) {
        activeRebasingDirectory = rebasingDirectory;
      } else {
        interactive = true;
        activeRebasingDirectory = interactiveRebasingDirectory;
      }

      const rebaseHeadNamePath = Uri.parse(activeRebasingDirectory + 'head-name');
      const rebaseOntoPath = Uri.parse(activeRebasingDirectory + 'onto');

      const rebaseHeadNameFileTask = workspace.fs.readFile(rebaseHeadNamePath).then(f => f.toString().replace(Constants.FinalLineBreakRegex, ''));
      const rebaseOntoPathFileTask = workspace.fs.readFile(rebaseOntoPath).then(f => f.toString().replace(Constants.FinalLineBreakRegex, ''));

      let rebaseNextIndex: number;
      let rebaseCommitListTask: Thenable<Commit[]>;

      if (interactive) {

        rebaseNextIndex = await workspace.fs.readFile(Uri.parse(dotGitPath + 'rebase-merge/msgnum'))
          .then(f => f.toString().replace(Constants.FinalLineBreakRegex, '')).then(Number.parseInt);

        rebaseCommitListTask = workspace.fs.readFile(Uri.parse(dotGitPath + 'rebase-merge/git-rebase-todo'))
          .then(f => f.toString().replace(Constants.FinalLineBreakRegex, ''), err => undefined)
          .then(GitTextUtils.parseSequencerTodo).then(commits => commits.reverse());

      } else {

        const rebaseLastIndexTask = workspace.fs.readFile(Uri.parse(dotGitPath + 'rebase-apply/last')).then(f => f.toString().replace(Constants.FinalLineBreakRegex, '')).then(Number.parseInt);
        rebaseNextIndex = await workspace.fs.readFile(Uri.parse(dotGitPath + 'rebase-apply/next')).then(f => f.toString().replace(Constants.FinalLineBreakRegex, '')).then(Number.parseInt);

        const indices: number[] = [];

        for (let i = await rebaseLastIndexTask; i > rebaseNextIndex; i--) {
          indices.push(i);
        }

        rebaseCommitListTask =
          Promise.all(
            indices.map(
              index => workspace.fs.readFile(Uri.parse(dotGitPath + 'rebase-apply/' + index.toString().padStart(4, '0'))).then(f => f.toString().replace(Constants.FinalLineBreakRegex, ''))
                .then(GitTextUtils.commitDetailTextToCommit)
            ));
      }

      const ontoCommit = await getCommit(repository, await rebaseOntoPathFileTask!);
      const ontoBranch = repository.state.refs.find(ref => ref.commit === ontoCommit.hash && ref.type !== RefType.RemoteHead) as MagitBranch;
      ontoBranch.commitDetails = ontoCommit;

      const doneCommits: Commit[] = (await logTask).slice(0, rebaseNextIndex - 1);
      const upcomingCommits: Commit[] = (await rebaseCommitListTask) ?? [];

      return {
        currentCommit: repository.state.rebaseCommit,
        origBranchName: (await rebaseHeadNameFileTask!).split('/')[2],
        ontoBranch,
        doneCommits,
        upcomingCommits
      };
    }
  } catch { }
}


async function cherryPickingStatus(repository: Repository, dotGitPath: string, sequencerTodoPath: Uri, sequencerHeadPath: Uri): Promise<MagitRevertingState | undefined> {
  try {

    const cherryPickHeadPath = Uri.parse(dotGitPath + 'CHERRY_PICK_HEAD');
    const cherryPickHeadCommitHash = await workspace.fs.readFile(cherryPickHeadPath).then(f => f.toString().replace(Constants.FinalLineBreakRegex, ''), err => undefined);

    if (cherryPickHeadCommitHash) {

      const sequencerTodoPathFileTask = workspace.fs.readFile(sequencerTodoPath)
        .then(f => f.toString().replace(Constants.FinalLineBreakRegex, ''), err => undefined);
      const sequencerHeadPathFileTask = workspace.fs.readFile(sequencerHeadPath)
        .then(f => f.toString().replace(Constants.FinalLineBreakRegex, ''), err => undefined);

      const todo = await sequencerTodoPathFileTask;
      const head = await sequencerHeadPathFileTask;

      const currentCommitTask = getCommit(repository, cherryPickHeadCommitHash);
      const originalHeadTask = head ? getCommit(repository, head) : getCommit(repository, repository.state.HEAD!.commit!);

      return {
        originalHead: await originalHeadTask,
        currentCommit: await currentCommitTask,
        upcomingCommits: GitTextUtils.parseSequencerTodo(todo).slice(1).reverse()
      };
    }
  } catch { }
}

async function revertingStatus(repository: Repository, dotGitPath: string, sequencerTodoPath: Uri, sequencerHeadPath: Uri): Promise<MagitRevertingState | undefined> {
  try {

    const revertHeadPath = Uri.parse(dotGitPath + 'REVERT_HEAD');
    const revertHeadCommitHash = await workspace.fs.readFile(revertHeadPath).then(f => f.toString().replace(Constants.FinalLineBreakRegex, ''), err => undefined);

    if (revertHeadCommitHash) {
      const sequencerTodoPathFileTask = workspace.fs.readFile(sequencerTodoPath)
        .then(f => f.toString().replace(Constants.FinalLineBreakRegex, ''), err => undefined);
      const sequencerHeadPathFileTask = workspace.fs.readFile(sequencerHeadPath)
        .then(f => f.toString().replace(Constants.FinalLineBreakRegex, ''), err => undefined);

      const todo = await sequencerTodoPathFileTask;
      const head = await sequencerHeadPathFileTask;

      const currentCommitTask = getCommit(repository, revertHeadCommitHash);
      const originalHeadTask = head ? getCommit(repository, head) : getCommit(repository, repository.state.HEAD!.commit!);

      return {
        originalHead: await originalHeadTask,
        currentCommit: await currentCommitTask,
        upcomingCommits: GitTextUtils.parseSequencerTodo(todo).slice(1).reverse()
      };
    }
  } catch { }
}
