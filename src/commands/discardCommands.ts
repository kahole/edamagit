import { window } from 'vscode';
import { MagitRepository } from '../models/magitRepository';
import { CommitItemView } from '../views/commits/commitSectionView';
import { DocumentView } from '../views/general/documentView';
import { gitRun } from '../utils/gitRawRunner';
import { StashItemView, StashSectionView } from '../views/stashes/stashSectionView';
import { ChangeView } from '../views/changes/changeView';
import { HunkView } from '../views/changes/HunkView';
import MagitUtils from '../utils/magitUtils';

export async function magitDiscardAtPoint(repository: MagitRepository, currentView: DocumentView): Promise<any> {

  const selectedView = currentView.click(window.activeTextEditor!.selection.active);

  if (selectedView instanceof HunkView) {

  } else if (selectedView instanceof ChangeView) {

  } else if (selectedView instanceof StashSectionView) {

    if (await MagitUtils.confirmAction('Drop all stashes in ref/stash?')) {
      const args = ['stash', 'clear'];
      return gitRun(repository, args);
    }
  } else if (selectedView instanceof StashItemView) {

    const stash = (selectedView as StashItemView).stash;

    if (await MagitUtils.confirmAction(`Drop stash stash@{${stash.index}}?`)) {
      const args = ['stash', 'drop', `stash@{${stash.index}}`];
      return gitRun(repository, args);
    }
  }
}