import { window, commands } from 'vscode';
import { MagitRepository } from '../models/magitRepository';
import { CommitItemView } from '../views/commits/commitSectionView';
import { DocumentView } from '../views/general/documentView';
import { gitRun } from '../utils/gitRawRunner';
import { StashItemView, StashSectionView } from '../views/stashes/stashSectionView';
import { ChangeView } from '../views/changes/changeView';
import { HunkView } from '../views/changes/HunkView';
import MagitUtils from '../utils/magitUtils';
import { ChangeSectionView } from '../views/changes/changesSectionView';
import { Section } from '../views/general/sectionHeader';

export async function magitDiscardAtPoint(repository: MagitRepository, currentView: DocumentView): Promise<any> {

  const selectedView = currentView.click(window.activeTextEditor!.selection.active);

  if (selectedView instanceof HunkView) {

  } else if (selectedView instanceof ChangeView) {

  } else if (selectedView instanceof ChangeSectionView) {
    const section = (selectedView as ChangeSectionView).section;

    switch (section) {
      case Section.Untracked:
        // MINOr: list which files will be trashed
        if (await MagitUtils.confirmAction('Trash all untracked files?')) {
          return commands.executeCommand('git.cleanAllUntracked');
        }

      break;
      case Section.Unstaged:
        if (await MagitUtils.confirmAction('Discard all unstaged changes?')) {
          return commands.executeCommand('git.cleanAllTracked');
        }
        break;
      case Section.Staged:
        if (await MagitUtils.confirmAction('Discard all staged changes?')) {
          // TODO: implement discarding of staged changes
        }
        break;
      default:
        break;
    }

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