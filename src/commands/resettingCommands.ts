import { MenuState, MenuUtil } from '../menu/menu';
import { MagitRepository } from '../models/magitRepository';
import { gitRun } from '../utils/gitRawRunner';
import MagitUtils from '../utils/magitUtils';

const resettingMenu = {
  title: 'Resetting',
  commands: [
    { label: 'm', description: 'reset mixed (HEAD and index)', action: ({ repository }: MenuState) => _reset(repository, ['--mixed']) },
    { label: 's', description: 'reset soft (HEAD only)', action: ({ repository }: MenuState) => _reset(repository, ['--soft']) },
    { label: 'h', description: 'reset hard (HEAD, index and files)', action: ({ repository }: MenuState) => _reset(repository, ['--hard']) },
    { label: 'i', description: 'reset index (only)', action: ({ repository }: MenuState) => _reset(repository, []) },
    { label: 'w', description: 'reset worktree (only)', action: resetWorktree }
    // { label: 'f', description: 'reset a file', action: resetFile }
  ]
};

export async function resetting(repository: MagitRepository) {
  return MenuUtil.showMenu(resettingMenu, { repository });
}

async function resetWorktree({ repository }: MenuState) {

  const args = ['checkout-index', '--all', '--force'];
  return await gitRun(repository, args);
}

async function _reset(repository: MagitRepository, switches: string[]) {

  const ref = await MagitUtils.chooseRef(repository, 'Reset to', true, true);

  if (ref) {

    const args = ['reset', ...switches, ref];
    return await gitRun(repository, args);
  }
}