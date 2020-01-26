import { window, commands } from 'vscode';
import { Menu, MenuState, MenuUtil } from '../menu/menu';
import { MagitRepository } from '../models/magitRepository';
import { DocumentView } from '../views/general/documentView';
import { gitRun } from '../utils/gitRawRunner';

const mergingMenu = {
  title: 'Merging',
  commands: [
    { label: 'm', description: 'Merge', action: merge },
    { label: 'e', description: 'Merge and edit message', action: merge },
    { label: 'n', description: 'Merge, don\'t commit', action: merge },
    { label: 'a', description: 'Absorb', action: absorb },
    { label: 'p', description: 'Preview Merge', action: mergePreview },
    { label: 's', description: 'Squash Merge', action: merge },
    { label: 's', description: 'Merge into', action: merge },
  ]
};

const whileMergingMenu = {
  title: 'Merging',
  commands: [
    { label: 'm', description: 'Commit merge', action: commitMerge },
    { label: 'a', description: 'Abort merge', action: abortMerge }
  ]
};

export async function merging(repository: MagitRepository, currentView: DocumentView) {

  if (repository.magitState?.mergingState) {
    return MenuUtil.showMenu(whileMergingMenu, { repository, currentView });
  } else {
    return MenuUtil.showMenu(mergingMenu, { repository, currentView });
  }
}

async function merge({ repository }: MenuState) {
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
  // Maybe so different from the rest?
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

async function commitMerge({ repository }: MenuState) {

}

async function abortMerge({ repository }: MenuState) {
  const args = ['merge', '--abort'];
  return gitRun(repository, args);
}