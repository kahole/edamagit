import { window } from 'vscode';
import { MagitRepository } from '../models/magitRepository';
import { CommitItemView } from '../views/commits/commitSectionView';
import { DocumentView } from '../views/general/documentView';
import { gitRun } from '../utils/gitRawRunner';
import { StashItemView } from '../views/stashes/stashSectionView';

export async function magitApplyEntityAtPoint(repository: MagitRepository, currentView: DocumentView): Promise<any> {

  const selectedView = currentView.click(window.activeTextEditor!.selection.active);

  if (selectedView instanceof CommitItemView) {

  } else if (selectedView instanceof StashItemView) {

    const stash = (selectedView as StashItemView).stash;

    const args = ['stash', 'apply', '--index', stash.index.toString()];
    return gitRun(repository, args);
  }
}

export async function apply(repository: MagitRepository, patch: string, index = false, reverse = false) {

  const args = ['apply'];

  if (index) {
    args.push('--cached');
  }

  if (reverse) {
    args.push('--reverse');
  }

  return gitRun(repository, args, { input: patch });
}