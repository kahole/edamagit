import { MenuState, MenuUtil } from '../menu/menu';
import { MagitRepository } from '../models/magitRepository';
import { gitRun } from '../utils/gitRawRunner';
import MagitUtils from '../utils/magitUtils';
import { window } from 'vscode';

const resettingMenu = {
  title: 'Resetting',
  commands: [
    // FIXME find icons?
    { label: 'm', description: 'reset mixed (HEAD and index)', action: ({ repository }: MenuState) => resetMixed(repository) },
    { label: 's', description: 'reset soft (HEAD only)', action: ({ repository }: MenuState) => _reset(repository, ['--soft'], `Soft reset ${repository.HEAD?.name} to`) },
    { label: 'h', description: 'reset hard (HEAD, index and files)', action: ({ repository }: MenuState) => resetHard(repository) },
    { label: 'i', description: 'reset index (only)', action: ({ repository }: MenuState) => _reset(repository, [], `Reset index to`) },
    { label: 'w', description: 'reset worktree (only)', action: resetWorktree }
    // { label: 'f', description: 'reset a file', action: resetFile }
  ]
};

export async function resetting(repository: MagitRepository) {
  return MenuUtil.showMenu(resettingMenu, { repository });
}

export async function resetMixed(repository: MagitRepository) {
  return _reset(repository, ['--mixed'], `Reset ${repository.HEAD?.name} to`);
}

export async function resetHard(repository: MagitRepository) {
  return _reset(repository, ['--hard'], `Hard reset ${repository.HEAD?.name} to`);
}

async function resetWorktree({ repository }: MenuState) {

  const ref = await window.showQuickPick([`${repository.HEAD?.name}`, 'HEAD'], { placeHolder: 'Reset worktree to' });

  if (ref) {
    const args = ['checkout-index', '--all', '--force'];
    return await gitRun(repository.gitRepository, args);
  }
}

async function _reset(repository: MagitRepository, switches: string[], prompt: string) {

  const ref = await MagitUtils.chooseRef(repository, prompt, true, true);

  if (ref) {

    const args = ['reset', ...switches, ref];
    return await gitRun(repository.gitRepository, args);
  }
}
