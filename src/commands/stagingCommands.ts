import { window, commands, workspace, Uri } from "vscode";
import { HunkView } from "../views/changes/HunkView";
import { ChangeView } from "../views/changes/changeView";
import MagitUtils from "../utils/magitUtils";
import FilePathUtils from "../utils/filePathUtils";
import { ChangeSectionView } from "../views/changes/changesSectionView";
import { Section } from "../views/sectionHeader";
import { TextEncoder } from "util";
import { MagitRepository } from "../models/magitRepository";
import MagitStatusView from "../views/magitStatusView";
import { Status } from "../typings/git";

export async function magitStage(repository: MagitRepository, currentView: MagitStatusView): Promise<any> {

  const selectedView = currentView.click(window.activeTextEditor!.selection.active);

  if (selectedView instanceof HunkView) {
    const changeHunk = (selectedView as HunkView).changeHunk;

    const patch = changeHunk.diffHeader + changeHunk.diff + "\n";

    // TODO: this needs to be wrapped, and it needs to decide between run and exec!
    const args = ["apply", "--cached"];
    return repository._repository.repository.run(args, { input: patch });


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

    const choosenFilePath = await window.showQuickPick([
      ...repository.magitState?.workingTreeChanges!,
      ...repository.magitState?.indexChanges!,
      ...repository.magitState?.untrackedFiles!,
      // ...currentRepository.magitState?.mergeChanges
    ].map(c => FilePathUtils.uriPathRelativeTo(c.uri, repository.rootUri)),
      { placeHolder: "Stage" }
    );

    // TODO: stage file
    // return repo . add ( filePath )

  }
}

export enum StageAllKind {
  All = "stageAll",
  AllTracked = "stageAllTracked",
  AllUntracked = "stageAllUntracked"
}

export async function magitStageAll(repository: MagitRepository, currentView: MagitStatusView, kind: StageAllKind = StageAllKind.AllTracked): Promise<void> {

  return commands.executeCommand("git." + kind.valueOf());
}

export async function magitUnstage(repository: MagitRepository, currentView: MagitStatusView) {

  // TODO: unstage command

  // For files:
  // repository._repository.reset(, false);

  // For hunks:
  //  git apply --cached --reverse

  // return async task

}

export async function magitUnstageAll(repository: MagitRepository, currentView: MagitStatusView): Promise<void> {

  let confirmed = await window.showInputBox({ prompt: "Unstage all changes?" });
  if (confirmed !== undefined) {
    return commands.executeCommand("git.unstageAll");
  }
}