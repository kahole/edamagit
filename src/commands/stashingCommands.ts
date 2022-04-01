import { MagitRepository } from '../models/magitRepository';
import { MenuUtil, MenuState } from '../menu/menu';
import { commands, window } from 'vscode';
import { gitRun } from '../utils/gitRawRunner';
import GitTextUtils from '../utils/gitTextUtils';

const stashingMenu = {
  title: 'Stashing',
  commands: [
    { label: 'z', description: 'Save', action: stash },
    { label: 'p', description: 'Pop', action: popStash },
    { label: 'a', description: 'Apply', action: applyStash },
    { label: 'k', description: 'Drop', action: dropStash },
    { label: 'i', description: 'Save index', action: stashWorktree },
    { label: 'w', description: 'Save worktree', action: stashIndex },
    { label: 'x', description: 'Save keeping index', action: (menuState: MenuState) => stash(menuState, ['--keep-index']) },
  ]
};

export async function stashing(repository: MagitRepository): Promise<any> {

  const switches = [
    { key: '-u', name: '--include-untracked', description: 'Also save untracked files' },
    { key: '-a', name: '--all', description: 'Also save untracked files and ignored files' }
  ];

  return MenuUtil.showMenu(stashingMenu, { repository, switches });
}

async function stash({ repository, switches }: MenuState, stashArgs: string[] = []) {

  const message = await askForStashMessage(repository);
  if (message !== undefined) {
    return _stash({ repository, switches }, message, stashArgs);
  }
}

async function _stash({ repository, switches }: MenuState, message: string, stashArgs: string[] = []) {

  const args = ['stash', 'push', ...MenuUtil.switchesToArgs(switches), ...stashArgs];

  if (message !== undefined) {
    if (message !== '') {
      args.push('--message');
      args.push(message);
    }
    return gitRun(repository.gitRepository, args);
  }
}

async function stashWorktree({ repository, switches }: MenuState) {

  if (repository.HEAD?.commit) {

    const message = await askForStashMessage(repository);

    if (message !== undefined) {

      const intermediaryCommitArgs = ['commit', '--message', 'intermediary stash commit'];
      const resetCommitArgs = ['reset', '--soft', repository.HEAD?.commit];

      try {
        try {
          await gitRun(repository.gitRepository, intermediaryCommitArgs);
        } catch { }
        await _stash({ repository, switches }, message);
        return gitRun(repository.gitRepository, resetCommitArgs);
      } catch (error) {
        await gitRun(repository.gitRepository, resetCommitArgs);
        throw error;
      }
    }
  }
}

async function stashIndex({ repository, switches }: MenuState) {

  if (repository.HEAD?.commit) {

    const message = await askForStashMessage(repository);

    if (message !== undefined) {

      const intermediaryCommitArgs = ['commit', '--no-verify', '--message', 'intermediary stash commit'];
      const stashWorktree = ['stash', 'push', '--message', 'intermediary stash'];
      const resetCommitArgs = ['reset', '--soft', repository.HEAD?.commit];
      const popIntermediateStashArgs = ['stash', 'pop', '--index', 'stash@{1}'];

      try {
        try {
          await gitRun(repository.gitRepository, intermediaryCommitArgs);
          await gitRun(repository.gitRepository, stashWorktree);
          await gitRun(repository.gitRepository, resetCommitArgs);
        } catch { }
        await _stash({ repository, switches }, message);
        return gitRun(repository.gitRepository, popIntermediateStashArgs);
      } catch (error) {
        await gitRun(repository.gitRepository, popIntermediateStashArgs);
        throw error;
      }
    }
  }
}

async function applyStash() {
  return commands.executeCommand('git.stashApply');
}

async function dropStash() {
  return commands.executeCommand('git.stashDrop');
}

async function popStash() {
  return commands.executeCommand('git.stashPop');
}

function askForStashMessage(repository: MagitRepository): Thenable<string | undefined> {
  const messageIntro = `On ${repository.HEAD?.name ?? GitTextUtils.shortHash(repository.HEAD?.commit)}: `;
  return window.showInputBox({ prompt: `Stash message: ${messageIntro}` });
}
