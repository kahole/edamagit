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
  const ref = await window.showQuickPick(repository.state.refs.map(r => r.name!), { placeHolder: 'Merge' });

  if (ref) {
    return _merge(repository, ref);
  }
}

async function absorb({ repository }: MenuState) {
  const ref = await window.showQuickPick(repository.state.refs.map(r => r.name!), { placeHolder: 'Merge' });

  if (ref) {
    await _merge(repository, ref);
    return await repository.deleteBranch(ref, false);
  }
}

async function mergePreview() {
  // Commands to preview a merge between ref1 and ref2:
  // git merge-base HEAD {ref2}
  // git merge-tree {MERGE-BASE} HEAD {ref2}
  // https://stackoverflow.com/questions/501407/is-there-a-git-merge-dry-run-option/6283843#6283843
}

async function _merge(repository: MagitRepository, ref: string, noCommit = false, squashMerge = false, editMessage = false) {

  const args = ['merge', ref];

  if (noCommit) {
    args.push(...['--no-commit', '--no-ff']);
  }

  if (squashMerge) {
    args.push('--squash');
  }

  if (editMessage) {
    // TODO: This might need a separate handler, because of message editing??
    args.push(...['--edit', '--no-ff']);
  } else {
    args.push('--no-edit');
  }

  return gitRun(repository, args);
}

async function rebaseControlCommand({ repository }: MenuState, command: string) {
  const args = ['rebase', command];
  return gitRun(repository, args);
}