import { MagitRepository } from '../models/magitRepository';
import { MenuUtil, MenuState } from '../menu/menu';
import { gitRun } from '../utils/gitRawRunner';
import MagitUtils from '../utils/magitUtils';
import { window } from 'vscode';

const worktreeMenu = {
  title: 'Worktree',
  commands: [
    { label: 'b', description: 'Create new worktree', action: createWorktree },
    { label: 'c', description: 'Create new branch and worktree', action: createWorktreeAndBranch },
    { label: 'k', description: 'Delete worktree', action: deleteWorktree }
  ]
};

export async function worktree(repository: MagitRepository) {

  return MenuUtil.showMenu(worktreeMenu, { repository });
}

async function createWorktree({ repository }: MenuState) {

  const ref = await MagitUtils.chooseRef(repository, 'Checkout ', false, false);

  if (ref) {
    const worktreePath = await window.showInputBox({ value: repository.rootUri.fsPath, prompt: 'Create worktree' });

    if (worktreePath) {
      const args = ['worktree', 'add', worktreePath, ref];
      return await gitRun(repository, args);
    }
  }
}

async function createWorktreeAndBranch({ repository }: MenuState) {

  const worktreePath = await window.showInputBox({ value: repository.rootUri.fsPath, prompt: 'Create worktree' });

  if (worktreePath) {

    const ref = await MagitUtils.chooseRef(repository, 'Create and checkout branch starting at', false, false);

    if (ref) {

      const branchName = await window.showInputBox({ prompt: 'Name for new branch' });

      if (branchName) {
        const args = ['worktree', 'add', '-b', branchName, worktreePath, ref];
        return await gitRun(repository, args);
      }
    }
  }
}

async function deleteWorktree({ repository }: MenuState) {


}