import { window, commands } from 'vscode';
import { Menu, MenuState, MenuUtil } from '../menu/menu';
import { MagitRepository } from '../models/magitRepository';
import { DocumentView } from '../views/general/documentView';
import { gitRun } from '../utils/gitRawRunner';
import * as CommitCommands from '../commands/commitCommands';

// TODO: rebasing: some work remains for MVP

const whileRebasingMenu = {
  title: 'Rebasing',
  commands: [
    { label: 'r', description: 'Continue', action: (state: MenuState) => rebaseControlCommand(state, '--continue') },
    { label: 's', description: 'Skip', action: (state: MenuState) => rebaseControlCommand(state, '--skip') },
    { label: 'e', description: 'Edit', action: (state: MenuState) => rebaseControlCommand(state, '--edit-todo') },
    { label: 'a', description: 'Abort', action: (state: MenuState) => rebaseControlCommand(state, '--abort') }
  ]
};

export async function rebasing(repository: MagitRepository, currentView: DocumentView) {

  const HEAD = repository.magitState?.HEAD;
  const rebasingMenu = {
    title: `Rebasing ${HEAD?.name}`,
    commands: [
      { label: 'p', description: `onto ${HEAD?.pushRemote?.remote}/${HEAD?.pushRemote?.name}`, action: rebase },
      { label: 'u', description: `onto ${HEAD?.upstreamRemote?.remote}/${HEAD?.upstreamRemote?.name}`, action: rebase },
      { label: 'e', description: `onto elsewhere`, action: rebase },
      { label: 'i', description: `interactively`, action: rebase },
    ]
  };

  if (repository.magitState?.rebasingState) {
    return MenuUtil.showMenu(whileRebasingMenu, { repository, currentView });
  } else {
    return MenuUtil.showMenu(rebasingMenu, { repository, currentView });
  }
}

async function rebase({ repository }: MenuState) {
  const ref = await window.showQuickPick(repository.state.refs.map(r => r.name!), { placeHolder: 'Rebase' });

  if (ref) {
    return _rebase(repository, ref);
  }
}

async function _rebase(repository: MagitRepository, ref: string, noCommit = false, squashMerge = false) {

  const args = ['rebase', ref];

  return gitRun(repository, args);
}

async function rebaseControlCommand({ repository }: MenuState, command: string) {
  const args = ['rebase', command];
  return gitRun(repository, args);
}