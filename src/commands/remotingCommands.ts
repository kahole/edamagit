import { MagitRepository } from '../models/magitRepository';
import { MenuUtil, MenuState } from '../menu/menu';
import { commands, window } from 'vscode';
import { gitRun } from '../utils/gitRawRunner';

const remotingMenu = {
  title: 'Remoting',
  commands: [
    { label: 'a', description: 'Add', icon: 'add', action: addRemote },
    { label: 'r', description: 'Rename', icon: 'edit', action: renameRemote },
    { label: 'k', description: 'Remove', icon: 'trash', action: removeRemote }
  ]
};

export async function remoting(repository: MagitRepository) {
  return MenuUtil.showMenu(remotingMenu, { repository });
}

async function addRemote() {
  return commands.executeCommand('git.addRemote');
}

async function renameRemote({ repository }: MenuState) {

  const remote = await window.showQuickPick(repository.remotes.map(r => r.name), { placeHolder: 'Rename remote' });

  if (remote) {

    const newName = await window.showInputBox({ prompt: `Rename ${remote} to` });

    if (newName) {
      const args = ['remote', 'rename', remote, newName];
      gitRun(repository.gitRepository, args);
    }
  }
}

async function removeRemote() {
  return commands.executeCommand('git.removeRemote');
}
