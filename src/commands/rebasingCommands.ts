import { MenuState, MenuUtil, Switch } from '../menu/menu';
import { MagitRepository } from '../models/magitRepository';
import { gitRun } from '../utils/gitRawRunner';
import MagitUtils from '../utils/magitUtils';
import { MagitError } from '../models/magitError';
import * as Commit from '../commands/commitCommands';

const whileRebasingMenu = {
  title: 'Rebasing',
  commands: [
    { label: 'r', description: 'Continue', icon: 'debug-continue', action: (state: MenuState) => rebaseContinue(state) },
    { label: 's', description: 'Skip', icon: 'debug-step-over', action: (state: MenuState) => rebaseControlCommand(state, '--skip') },
    { label: 'e', description: 'Edit', icon: 'edit', action: editTodo },
    { label: 'a', description: 'Abort', icon: 'debug-stop', action: (state: MenuState) => rebaseControlCommand(state, '--abort') }
  ]
};

export async function rebasing(repository: MagitRepository) {

  if (repository.rebasingState) {
    return MenuUtil.showMenu(whileRebasingMenu, { repository });
  } else {

    const switches = [
      { key: '-k', name: '--keep-empty', description: 'Keep empty commits', icon: 'circle-large-outline' },
      { key: '-p', name: '--preserve-merges', description: 'Preserve merges', icon: 'git-merge' },
      { key: '-c', name: '--committer-date-is-author-date', description: 'Lie about committer date', icon: 'calendar' },
      { key: '-a', name: '--autosquash', description: 'Autosquash', icon: 'gather' },
      { key: '-A', name: '--autostash', description: 'Autostash', icon: 'package' },
      { key: '-i', name: '--interactive', description: 'Interactive', icon: 'edit' },
      { key: '-h', name: '--no-verify', description: 'Disable hooks', icon: 'eye-closed' },
    ];

    const HEAD = repository.HEAD;

    const commands = [];

    if (HEAD?.pushRemote) {
      commands.push({
        label: 'p', description: `onto ${HEAD.pushRemote.remote}/${HEAD.pushRemote.name}`,
        action: ({ switches }: MenuState) => _rebase(repository, `${HEAD.pushRemote!.remote}/${HEAD.pushRemote!.name}`, switches)
      });
    }

    if (HEAD?.upstreamRemote) {
      commands.push({
        label: 'u', description: `onto ${HEAD.upstreamRemote.remote}/${HEAD.upstreamRemote.name}`,
        action: ({ switches }: MenuState) => _rebase(repository, `${HEAD.upstreamRemote!.remote}/${HEAD.upstreamRemote!.name}`, switches)
      });
    }

    commands.push(...[
      { label: 'e', description: `onto elsewhere`, action: rebase },
      { label: 'i', description: `interactively`, action: rebaseInteractively }
    ]);

    const rebasingMenu = {
      title: `Rebasing ${HEAD?.name}`,
      commands
    };

    return MenuUtil.showMenu(rebasingMenu, { repository, switches });
  }
}

async function rebase({ repository, switches }: MenuState) {
  const ref = await MagitUtils.chooseRef(repository, 'Rebase');

  if (ref) {
    return _rebase(repository, ref, switches);
  }
}

async function _rebase(repository: MagitRepository, ref: string, switches: Switch[] = []) {

  const args = ['rebase', ...MenuUtil.switchesToArgs(switches), ref];

  try {

    if (switches.find(s => s.activated && s.name === '--interactive')) {
      return Commit.runCommitLikeCommand(repository, args, { editor: 'GIT_SEQUENCE_EDITOR' });
    }

    return await gitRun(repository.gitRepository, args);
  }
  catch (e) {
    throw new MagitError('Failed to merge in the changes.', e);
  }
}

async function rebaseControlCommand({ repository }: MenuState, command: string) {
  const args = ['rebase', command];
  return gitRun(repository.gitRepository, args);
}

async function rebaseContinue({ repository }: MenuState) {
  const args = ['rebase', '--continue'];
  return Commit.runCommitLikeCommand(repository, args, { editor: 'GIT_SEQUENCE_EDITOR' });
}

async function editTodo({ repository }: MenuState) {

  const args = ['rebase', '--edit-todo'];

  return Commit.runCommitLikeCommand(repository, args, { editor: 'GIT_SEQUENCE_EDITOR', propagateErrors: true });
}

async function rebaseInteractively({ repository, switches }: MenuState) {
  const commit = await MagitUtils.chooseCommit(repository, 'Rebase commit and all above it');

  if (commit) {
    const interactiveSwitches = (switches ?? []).map(s => ({ ...s, activated: s.activated || s.name === '--interactive' }));

    const args = ['rebase', ...MenuUtil.switchesToArgs(interactiveSwitches), `${commit}^`];

    return Commit.runCommitLikeCommand(repository, args, { editor: 'GIT_SEQUENCE_EDITOR' });
  }
}
