import { window, commands, workspace, Selection } from 'vscode';
import { MagitRepository } from '../models/magitRepository';
import { DocumentView } from '../views/general/documentView';
import { gitRun } from '../utils/gitRawRunner';
import { StashItemView, StashSectionView } from '../views/stashes/stashSectionView';
import { ChangeView } from '../views/changes/changeView';
import { HunkView } from '../views/changes/hunkView';
import MagitUtils from '../utils/magitUtils';
import { ChangeSectionView } from '../views/changes/changesSectionView';
import { Section } from '../views/general/sectionHeader';
import GitTextUtils from '../utils/gitTextUtils';
import * as ApplyAtPoint from './applyAtPointCommands';
import { Status, GitErrorCodes } from '../typings/git';
import FilePathUtils from '../utils/filePathUtils';
import { TagListingView } from '../views/tags/tagListingView';
import { BranchListingView } from '../views/branches/branchListingView';
import { RemoteBranchListingView } from '../views/remotes/remoteBranchListingView';
import * as Constants from '../common/constants';
import ViewUtils from '../utils/viewUtils';
import { View } from '../views/general/view';


export async function magitDiscardAtPoint(repository: MagitRepository, currentView: DocumentView): Promise<any> {

  const selection = window.activeTextEditor!.selection;
  // Warning, anything with relative referencing is dangerous here, e.g. stash@{1}:
  return ViewUtils.applyActionForSelection(repository, currentView, selection, [ChangeView, ChangeSectionView, BranchListingView, RemoteBranchListingView, TagListingView], discard);
}

async function discard(repository: MagitRepository, selection: Selection, selectedView?: View): Promise<any> {

  if (selectedView instanceof HunkView) {

    if (await MagitUtils.confirmAction('Discard hunk?')) {
      return discardHunk(repository, selectedView as HunkView, selection);
    }

  } else if (selectedView instanceof ChangeView) {

    let changeView = selectedView as ChangeView;
    let change = changeView.change;

    if (change.status === Status.UNTRACKED) {

      if (await MagitUtils.confirmAction(`Trash ${change.relativePath}?`)) {
        return workspace.fs.delete(change.uri, { recursive: true, useTrash: false });
      }

    } else {

      const sectionLabel = changeView.section === Section.Staged ? 'staged' : 'unstaged';

      if (await MagitUtils.confirmAction(`Discard ${sectionLabel} ${change.relativePath}?`)) {

        const args = ['checkout', 'HEAD', '--', change.uri.fsPath];
        return gitRun(repository.gitRepository, args);
      }
    }

  } else if (selectedView instanceof ChangeSectionView) {
    const changeSectionView = (selectedView as ChangeSectionView);
    const section = changeSectionView.section;

    let fileNameList;

    switch (section) {
      case Section.Untracked:
        fileNameList = changeSectionView.changes.map(change => FilePathUtils.fileName(change.uri)).join(', ');
        if (await MagitUtils.confirmAction(`Trash ${fileNameList}?`)) {
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
          const args = ['checkout', 'HEAD', '--', ...changeSectionView.changes.map(change => change.uri.fsPath)];
          return gitRun(repository.gitRepository, args);
        }
        break;
      default:
        break;
    }

  } else if (selectedView instanceof StashSectionView) {

    if (await MagitUtils.confirmAction('Drop all stashes in ref/stash?')) {
      const args = ['stash', 'clear'];
      return gitRun(repository.gitRepository, args);
    }
  } else if (selectedView instanceof StashItemView) {

    const stash = (selectedView as StashItemView).stash;

    if (await MagitUtils.confirmAction(`Drop stash stash@{${stash.index}}?`)) {
      const args = ['stash', 'drop', `stash@{${stash.index}}`];
      return gitRun(repository.gitRepository, args);
    }
  } else if (selectedView instanceof BranchListingView) {

    const branch = (selectedView as BranchListingView).ref;

    if (branch.name) {

      if (await MagitUtils.confirmAction(`Delete branch ${branch.name}?`)) {
        try {
          await gitRun(repository.gitRepository, ['branch', '--delete', branch.name]);
        } catch (error) {
          if (error.gitErrorCode === GitErrorCodes.BranchNotFullyMerged) {
            if (await MagitUtils.confirmAction(`Delete unmerged branch ${branch.name}?`)) {
              return gitRun(repository.gitRepository, ['branch', '--delete', '--force', branch.name]);
            }
          }
        }
      }
    }
  } else if (selectedView instanceof RemoteBranchListingView) {

    const branch = (selectedView as RemoteBranchListingView).ref;

    if (branch.name) {

      if (await MagitUtils.confirmAction(`Delete branch ${branch.name}?`)) {
        const [remote, name] = GitTextUtils.remoteBranchFullNameToSegments(branch.name);
        try {
          await gitRun(repository.gitRepository, ['push', '--delete', remote, name]);
        } catch (error) {
          if (error.gitErrorCode === GitErrorCodes.BranchNotFullyMerged) {
            if (await MagitUtils.confirmAction(`Delete unmerged branch ${branch.name}?`)) {
              return gitRun(repository.gitRepository, ['push', '--delete', remote, name]);
            }
          }
        }
      }
    }
  } else if (selectedView instanceof TagListingView) {

    const tag = (selectedView as TagListingView).ref;

    if (await MagitUtils.confirmAction(`Delete tag ${tag.name}?`)) {
      const args = ['tag', '--delete', `${tag.name}`];
      return gitRun(repository.gitRepository, args);
    }
  } else {
    window.setStatusBarMessage('There is no thing at point that could be deleted', Constants.StatusMessageDisplayTimeout);
  }
}

async function discardHunk(repository: MagitRepository, hunkView: HunkView, selection: Selection): Promise<any> {

  const patch = GitTextUtils.generatePatchFromChangeHunkView(hunkView, selection, true);

  if (hunkView.section === Section.Unstaged) {
    return ApplyAtPoint.apply(repository, patch, { reverse: true });

  } else if (hunkView.section === Section.Staged) {
    await ApplyAtPoint.apply(repository, patch, { index: true, reverse: true });
    return ApplyAtPoint.apply(repository, patch, { reverse: true });
  }

  return Promise.reject();
}