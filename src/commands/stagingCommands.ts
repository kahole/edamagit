import { window, commands, Uri, Range } from 'vscode';
import { HunkView } from '../views/changes/hunkView';
import { ChangeView } from '../views/changes/changeView';
import MagitUtils from '../utils/magitUtils';
import FilePathUtils from '../utils/filePathUtils';
import { ChangeSectionView } from '../views/changes/changesSectionView';
import { Section } from '../views/general/sectionHeader';
import { MagitRepository } from '../models/magitRepository';
import { DocumentView } from '../views/general/documentView';
import { gitRun } from '../utils/gitRawRunner';
import { QuickItem, QuickMenuUtil } from '../menu/quickMenu';
import { apply } from './applyAtPointCommands';
import GitTextUtils from '../utils/gitTextUtils';
import * as Constants from '../common/constants';

export async function magitStage(repository: MagitRepository, currentView: DocumentView): Promise<any> {

  const selection = window.activeTextEditor!.selection;
  const selectedView = currentView.click(selection.active);

  if (selectedView instanceof HunkView) {
    const changeHunk = (selectedView as HunkView).changeHunk;

    if (changeHunk.section !== Section.Staged) {

      const patch = GitTextUtils.generatePatchFromChangeHunkView(selectedView, selection);
      return apply(repository, patch, { index: true });

    } else {
      window.setStatusBarMessage('Already staged', Constants.StatusMessageDisplayTimeout);
    }

  } else if (selectedView instanceof ChangeView) {

    const magitChange = (selectedView as ChangeView).change;

    return stageFile(repository, magitChange.uri, magitChange.section === Section.Unstaged);

  } else if (selectedView instanceof ChangeSectionView) {
    const section = (selectedView as ChangeSectionView).section;

    switch (section) {
      case Section.Untracked:
        return magitStageAll(repository, currentView, StageAllKind.AllUntracked);
      case Section.Unstaged:
        return magitStageAll(repository, currentView, StageAllKind.AllTracked);
      default:
        break;
    }
  } else {

    if (repository.magitState?.workingTreeChanges.length || repository.magitState?.untrackedFiles.length) {

      const files: QuickItem<Uri>[] = [
        ...repository.magitState?.workingTreeChanges,
        ...repository.magitState?.untrackedFiles,
        // ...currentRepository.magitState?.mergeChanges
      ].map(c => ({ label: FilePathUtils.uriPathRelativeTo(c.uri, repository.rootUri), meta: c.uri }));

      const chosenFile = await QuickMenuUtil.showMenu(files, 'Stage file');

      if (chosenFile) {
        return stageFile(repository, chosenFile);
      }

    }
  }
}

export enum StageAllKind {
  All = 'stageAll',
  AllTracked = 'stageAllTracked',
  AllUntracked = 'stageAllUntracked'
}

export async function magitStageAll(repository: MagitRepository, currentView: DocumentView, kind: StageAllKind = StageAllKind.AllTracked): Promise<void> {
  return commands.executeCommand('git.' + kind.valueOf());
}

export async function magitUnstage(repository: MagitRepository, currentView: DocumentView): Promise<any> {

  const selection = window.activeTextEditor!.selection;
  const selectedView = currentView.click(selection.active);

  if (selectedView instanceof HunkView) {
    const changeHunk = (selectedView as HunkView).changeHunk;

    if (changeHunk.section === Section.Staged) {
      const patch = GitTextUtils.generatePatchFromChangeHunkView(selectedView, selection, true);
      return apply(repository, patch, { index: true, reverse: true });
    } else {
      window.setStatusBarMessage('Already unstaged', Constants.StatusMessageDisplayTimeout);
    }
  } else if (selectedView instanceof ChangeView) {

    return unstageFile(repository, selectedView.change.uri);

  } else if (selectedView instanceof ChangeSectionView) {
    if (selectedView.section === Section.Staged) {
      return magitUnstageAll(repository, currentView);
    } else {
      window.setStatusBarMessage('Already unstaged', Constants.StatusMessageDisplayTimeout);
    }
  } else {

    const files: QuickItem<Uri>[] = repository.magitState?.indexChanges!
      .map(c => ({ label: FilePathUtils.uriPathRelativeTo(c.uri, repository.rootUri), meta: c.uri }));

    const chosenFile = await QuickMenuUtil.showMenu<Uri>(files, 'Unstage file');

    if (chosenFile) {
      return unstageFile(repository, chosenFile);
    }
  }
}

export async function magitUnstageAll(repository: MagitRepository, currentView: DocumentView): Promise<void> {

  if (await MagitUtils.confirmAction('Unstage all changes?')) {
    return commands.executeCommand('git.unstageAll');
  }
}

export async function stageFile(repository: MagitRepository, fileUri: Uri, update = false) {
  return repository
    ._repository
    .add([fileUri], { update });
}

export async function unstageFile(repository: MagitRepository, fileUri: Uri) {
  const args = ['reset', '--', fileUri.fsPath];
  return gitRun(repository, args);
}