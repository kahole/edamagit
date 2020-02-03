import { window, commands, workspace, Uri, QuickPickItem } from 'vscode';
import { HunkView } from '../views/changes/HunkView';
import { ChangeView } from '../views/changes/changeView';
import MagitUtils from '../utils/magitUtils';
import FilePathUtils from '../utils/filePathUtils';
import { ChangeSectionView } from '../views/changes/changesSectionView';
import { Section } from '../views/general/sectionHeader';
import { MagitRepository } from '../models/magitRepository';
import { DocumentView } from '../views/general/documentView';
import { gitRun } from '../utils/gitRawRunner';
import { QuickItem, QuickMenuUtil } from '../menu/quickMenu';
import { apply } from './applyCommands';
import GitTextUtils from '../utils/gitTextUtils';

export async function magitStage(repository: MagitRepository, currentView: DocumentView): Promise<any> {

  const selectedView = currentView.click(window.activeTextEditor!.selection.active);

  if (selectedView instanceof HunkView) {
    const changeHunk = (selectedView as HunkView).changeHunk;

    if (changeHunk.section !== Section.Staged) {
      const patch = GitTextUtils.changeHunkToPatch(changeHunk);
      return apply(repository, patch, true);

    } else {
      window.setStatusBarMessage('Already staged');
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

      const chosenFile = await QuickMenuUtil.showMenu(files);

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

  const selectedView = currentView.click(window.activeTextEditor!.selection.active);

  if (selectedView instanceof HunkView) {
    const changeHunk = (selectedView as HunkView).changeHunk;

    if (changeHunk.section === Section.Staged) {
      const patch = GitTextUtils.changeHunkToPatch(changeHunk);
      return apply(repository, patch, true, true);
    } else {
      window.setStatusBarMessage('Already unstaged');
    }
  } else if (selectedView instanceof ChangeView) {

    unstageFile(repository, selectedView.change.uri);

  } else if (selectedView instanceof ChangeSectionView) {
    if (selectedView.section === Section.Staged) {
      return magitUnstageAll(repository, currentView);
    } else {
      window.setStatusBarMessage('Already unstaged');
    }
  } else {

    const files: QuickItem<Uri>[] = repository.magitState?.indexChanges!
      .map(c => ({ label: FilePathUtils.uriPathRelativeTo(c.uri, repository.rootUri), meta: c.uri }));

    const chosenFile = await QuickMenuUtil.showMenu<Uri>(files);

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