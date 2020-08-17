import { gitRun } from '../utils/gitRawRunner';
import { MagitRepository } from '../models/magitRepository';
import { MenuState, MenuUtil } from '../menu/menu';
import MagitUtils from '../utils/magitUtils';
import * as CommitCommands from '../commands/commitCommands';

const whileRevertingMenu = {
  title: 'Reverting',
  commands: [
    { label: 'V', description: 'Continue', action: continueRevert },
    { label: 's', description: 'Skip', action: (state: MenuState) => revertControlCommand(state, '--skip') },
    { label: 'a', description: 'Abort', action: (state: MenuState) => revertControlCommand(state, '--abort') }
  ]
};

const revertingMenu = {
  title: 'Reverting',
  commands: [
    { label: 'V', description: 'Revert commit(s)', action: revertCommit },
    { label: 'v', description: 'Revert changes', action: reverseSomeCommit },
  ]
};

export async function reverting(repository: MagitRepository) {

  if (repository.magitState?.revertingState) {
    return MenuUtil.showMenu(whileRevertingMenu, { repository });
  } else {

    const switches = [
      { key: '-e', name: '--edit', description: 'Edit commit message', activated: true },
      { key: '-E', name: '--no-edit', description: 'Don\'t edit commit message' },
    ];

    return MenuUtil.showMenu(revertingMenu, { repository, switches });
  }
}

async function revertCommit({ repository, switches }: MenuState) {
  const target = await MagitUtils.chooseRef(repository, 'Revert commit(s)', true, true);

  if (target) {
    return revert(repository, target, { edit: switches?.find(s => s.key === '-e' && s.activated) ? true : false });
  }
}

async function reverseSomeCommit({ repository }: MenuState) {
  const commit = await MagitUtils.chooseRef(repository, 'Revert changes', true, true);

  if (commit) {
    return revert(repository, commit, { noCommit: true });
  }
}

interface RevertOptions {
  noCommit?: boolean;
  edit?: boolean;
}

export async function revert(repository: MagitRepository, target: string, { noCommit, edit }: RevertOptions = {}) {

  const args = ['revert'];

  if (noCommit) {
    args.push('--no-commit');
  }

  if (edit) {
    args.push('--edit');
    args.push(target);
    return CommitCommands.runCommitLikeCommand(repository, args, { updatePostCommitTask: true });
  }

  args.push('--no-edit');
  args.push(target);
  return gitRun(repository, args);
}

async function continueRevert({ repository }: MenuState) {
  const args = ['revert', '--continue'];
  return CommitCommands.runCommitLikeCommand(repository, args);
}

async function revertControlCommand({ repository }: MenuState, command: string) {
  const args = ['revert', command];
  return gitRun(repository, args);
}