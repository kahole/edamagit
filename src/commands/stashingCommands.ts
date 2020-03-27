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
    // { label: 'i', description: 'Save index', action: stashIndex },
    { label: 'w', description: 'Save worktree', action: stashWorktree },
    { label: 'x', description: 'Save keeping index', action: (menuState: MenuState) => stash(menuState, ['--keep-index']) },
  ]
};

export async function stashing(repository: MagitRepository): Promise<any> {

  const switches = [
    { shortName: '-u', longName: '--include-untracked', description: 'Also save untracked files' },
    { shortName: '-a', longName: '--all', description: 'Also save untracked files and ignored files' }
  ];

  return MenuUtil.showMenu(stashingMenu, { repository, switches });
}

async function stash({ repository, switches }: MenuState, stashArgs: string[] = []) {

  const args = ['stash', 'push', ...MenuUtil.switchesToArgs(switches), ...stashArgs];

  const messageIntro = `On ${repository.magitState?.HEAD?.name ?? GitTextUtils.shortHash(repository.magitState?.HEAD?.commit)}: `;

  const message = await window.showInputBox({ prompt: `Stash message: ${messageIntro}` });

  if (message !== undefined) {
    if (message !== '') {
      args.push('--message');
      args.push(message);
    }
    return gitRun(repository, args);
  }
}

async function stashWorktree({ repository, switches }: MenuState) {

  if (repository.magitState?.HEAD?.commit) {

    const intermediaryCommitArgs = ['commit', '--message', 'intermediary stash commit'];
    const resetCommitArgs = ['reset', '--soft', repository.magitState?.HEAD?.commit];

    try {
      try {
        await gitRun(repository, intermediaryCommitArgs);
      } catch { }
      await stash({ repository, switches });
      return gitRun(repository, resetCommitArgs);
    } catch (error) {
      await gitRun(repository, resetCommitArgs);
      throw error;
    }
  }
}

function applyStash() {
  return commands.executeCommand('git.stashApply');
}

function dropStash() {
  return commands.executeCommand('git.stashDrop');
}

function popStash() {
  return commands.executeCommand('git.stashPop');
}