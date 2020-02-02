import { window, commands, workspace } from 'vscode';
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
import GitTextUtils from '../utils/gitTextUtils';
import { apply } from './applyCommands';
import { Status } from '../typings/git';
import { MagitChangeHunk } from '../models/magitChangeHunk';
import { magitUnstageAll } from './stagingCommands';

export async function magitDiscardAtPoint(repository: MagitRepository, currentView: DocumentView): Promise<any> {

  const selectedView = currentView.click(window.activeTextEditor!.selection.active);

  if (selectedView instanceof HunkView) {

    const changeHunk = (selectedView as HunkView).changeHunk;

    return discardHunk(repository, changeHunk);

  } else if (selectedView instanceof ChangeView) {

    const change = (selectedView as ChangeView).change;

    if (change.status === Status.UNTRACKED) {

      if (await MagitUtils.confirmAction(`Trash ${change.relativePath}?`)) {
        return workspace.fs.delete(change.uri, { recursive: true, useTrash: false });
      }

    } else {

      const sectionLabel = change.section === Section.Staged ? 'staged' : 'unstaged';

      if (await MagitUtils.confirmAction(`Discard ${sectionLabel} ${change.relativePath}?`)) {

        const discardTasks = change.hunks?.map(hunk => discardHunk(repository, hunk));

        return discardTasks ? Promise.all(discardTasks) : undefined;
      }
    }

  } else if (selectedView instanceof ChangeSectionView) {
    const changeSectionView = (selectedView as ChangeSectionView);
    const section = changeSectionView.section;

    switch (section) {
      case Section.Untracked:
        // MINOR: list which files will be trashed
        // accessed by looping changeSectionView.changes
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
          await commands.executeCommand('git.unstageAll');
          return commands.executeCommand('git.cleanAllTracked');
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

async function discardHunk(repository: MagitRepository, changeHunk: MagitChangeHunk): Promise<any> {

  const patch = GitTextUtils.changeHunkToPatch(changeHunk);

  if (changeHunk.section === Section.Unstaged) {
    return apply(repository, patch, false, true);

  } else if (changeHunk.section === Section.Staged) {
    await apply(repository, patch, true, true);
    return apply(repository, patch, false, true);
  }

  return Promise.reject();
}