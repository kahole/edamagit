import { window, workspace, commands } from "vscode";
import { HunkView } from "../views/changes/HunkView";
import { ChangeView } from "../views/changes/changeView";
import MagitUtils from "../utils/magitUtils";
import FilePathUtils from "../utils/filePathUtils";
import { ChangeSectionView } from "../views/changes/changesSectionView";
import { Section } from "../views/sectionHeader";
import { internalMagitStatus } from "./statusCommands";
import MagitStatusView from "../views/magitStatusView";

export function magitStage() {

  let repository = MagitUtils.getCurrentMagitRepo();
  let currentView = repository?.views?.get(window.activeTextEditor?.document.uri.toString() ?? "");

  if (currentView) {
    let clickedView = currentView.click(window.activeTextEditor!.selection.active);
    let currentRepository = repository!;

    // TODO: Is this a good way of solving this?
    if (clickedView instanceof HunkView) {
      let changeHunkDiff = (clickedView as HunkView).changeHunk.diff;

      // Apply diff
      // currentRepository
      //   .apply((clickedView as HunkView).changeHunk.diffHeader + changeHunkDiff)
      //   .catch(err => { console.log(err); });

    } else if (clickedView instanceof ChangeView) {

      let magitChange = (clickedView as ChangeView).change;

      currentRepository
        ._repository
        .add([magitChange.uri], { update: true }) // TODO: litt usikker om update eller ikke
        .then(() => internalMagitStatus(currentRepository))
        .then(() => (currentView as MagitStatusView).triggerUpdate())
        .catch(err => { console.log(err); });

    } else if (clickedView instanceof ChangeSectionView) {
      let section = (clickedView as ChangeSectionView).section;

      switch (section) {
        case Section.Untracked:
          magitStageAll(StageAllKind.AllUntracked);
          break;
        case Section.Unstaged:
          magitStageAll(StageAllKind.AllTracked);
          break;
        default:
          break;
      }
    } else {
      // TODO:
      // Switch to a quick pick where i can pass data, and have a title
      // Maybe make a simple wrapper
      // This should NOT be the same as a menu!
      window.showQuickPick([
        ...currentRepository.magitState?.workingTreeChanges!,
        ...currentRepository.magitState?.indexChanges!,
        ...currentRepository.magitState?.untrackedFiles!,
        // ...currentRepository.magitState?.mergeChanges
      ].map(c => FilePathUtils.pathRelativeTo(c.uri, currentRepository.rootUri)),
        { placeHolder: "Stage" }
      )
        .then(chosenFilePath => {

        })
        .then(() => internalMagitStatus(currentRepository))
        .then(() => (currentView as MagitStatusView).triggerUpdate());
    }

    // NB! Trenger kanskje headeren til hele diffen for å utføre disse.
    //       Den kan hektes på i et eget felt i Hunk-modellen, null stress joggedress!
  }
}

export enum StageAllKind {
  All = "stageAll",
  AllTracked = "stageAllTracked",
  AllUntracked = "stageAllUntracked"
}

export function magitStageAll(kind: StageAllKind = StageAllKind.AllTracked) {

  const editor = window.activeTextEditor;
  const currentRepository = MagitUtils.getCurrentMagitRepo();

  if (!editor || !currentRepository) {
    return;
  }

  let currentView = currentRepository.views?.get(editor.document.uri.toString());

  if (currentView instanceof MagitStatusView) {

    commands.executeCommand("git." + kind.valueOf())
      .then(() => internalMagitStatus(currentRepository))
      .then(() => (currentView as MagitStatusView).triggerUpdate());
  }
}