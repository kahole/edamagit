import { window, commands, workspace, Uri, QuickPickItem } from "vscode";
import { HunkView } from "../views/changes/HunkView";
import { ChangeView } from "../views/changes/changeView";
import MagitUtils from "../utils/magitUtils";
import FilePathUtils from "../utils/filePathUtils";
import { ChangeSectionView } from "../views/changes/changesSectionView";
import { Section } from "../views/general/sectionHeader";
import { TextEncoder } from "util";
import { MagitRepository } from "../models/magitRepository";
import { Status } from "../typings/git";
import { DocumentView } from "../views/general/documentView";
import { gitRun } from "../utils/gitRawRunner";
import { QuickItem, QuickMenuUtil } from "../menu/quickMenu";

export async function magitStage(repository: MagitRepository, currentView: DocumentView): Promise<any> {

  const selectedView = currentView.click(window.activeTextEditor!.selection.active);

  if (selectedView instanceof HunkView) {
    const changeHunk = (selectedView as HunkView).changeHunk;

    const patch = changeHunk.diffHeader + changeHunk.diff + "\n";

    const args = ["apply", "--cached"];
    return gitRun(repository, args, { input: patch });

  } else if (selectedView instanceof ChangeView) {

    const magitChange = (selectedView as ChangeView).change;

    return repository
      ._repository
      .add([magitChange.uri], { update: false });

  } else if (selectedView instanceof ChangeSectionView) {
    let section = (selectedView as ChangeSectionView).section;

    switch (section) {
      case Section.Untracked:
        return magitStageAll(repository, currentView, StageAllKind.AllUntracked);
      case Section.Unstaged:
        return magitStageAll(repository, currentView, StageAllKind.AllTracked);
      default:
        break;
    }
  } else {

    let files: QuickItem[] = [
      ...repository.magitState?.workingTreeChanges!,
      ...repository.magitState?.indexChanges!,
      ...repository.magitState?.untrackedFiles!,
      // ...currentRepository.magitState?.mergeChanges
    ].map(c => ({ label: FilePathUtils.uriPathRelativeTo(c.uri, repository.rootUri), meta: c.uri }));

    const chosenFile = await QuickMenuUtil.showMenu(files);

    if (chosenFile) {
      return repository._repository.add([chosenFile.meta], { update: false });
    }
  }
}

export enum StageAllKind {
  All = "stageAll",
  AllTracked = "stageAllTracked",
  AllUntracked = "stageAllUntracked"
}

export async function magitStageAll(repository: MagitRepository, currentView: DocumentView, kind: StageAllKind = StageAllKind.AllTracked): Promise<void> {

  return commands.executeCommand("git." + kind.valueOf());
}

export async function magitUnstage(repository: MagitRepository, currentView: DocumentView) {

  // TODO: unstage command

  // For files:
  // repository._repository.reset(, false);

  // For hunks:
  //  git apply --cached --reverse

  // return async task

  const selectedView = currentView.click(window.activeTextEditor!.selection.active);

  if (selectedView instanceof HunkView) {


  } else if (selectedView instanceof ChangeView) {


  } else if (selectedView instanceof ChangeSectionView) {

  } else {


  }
}

export async function magitUnstageAll(repository: MagitRepository, currentView: DocumentView): Promise<void> {

  let confirmed = await window.showInputBox({ prompt: "Unstage all changes?" });
  if (confirmed !== undefined) {
    return commands.executeCommand("git.unstageAll");
  }
}