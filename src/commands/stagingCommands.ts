import { window, commands, workspace, Uri } from "vscode";
import { HunkView } from "../views/changes/HunkView";
import { ChangeView } from "../views/changes/changeView";
import MagitUtils from "../utils/magitUtils";
import FilePathUtils from "../utils/filePathUtils";
import { ChangeSectionView } from "../views/changes/changesSectionView";
import { Section } from "../views/sectionHeader";
import { TextEncoder } from "util";
import { MagitRepository } from "../models/magitRepository";
import { View } from "../views/general/view";

export function magitStage(repository: MagitRepository, currentView: View) {

  // TODO:
  // Bytt til ASYNC-AWAIT!!!!!??????

  let clickedView = currentView.click(window.activeTextEditor!.selection.active);
  let currentRepository = repository!;

  if (clickedView instanceof HunkView) {
    let changeHunkDiff = (clickedView as HunkView).changeHunk.diff;

    // TODO
    var enc = new TextEncoder();
    workspace.fs.writeFile(Uri.parse("file:///tmp/minmagitdiffpatchting"),
      enc.encode(clickedView.changeHunk.diffHeader + changeHunkDiff + "\n"))
      .then(() => {
        // stage hunk
        currentRepository
          .apply("/tmp/minmagitdiffpatchting")
          .then(MagitUtils.magitStatusAndUpdate(currentRepository, currentView));
      });

  } else if (clickedView instanceof ChangeView) {

    let magitChange = (clickedView as ChangeView).change;

    currentRepository
      ._repository
      .add([magitChange.uri], { update: true }) // TODO: litt usikker om update eller ikke
      .then(MagitUtils.magitStatusAndUpdate(currentRepository, currentView));

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

        // TODO

      })
      .then(MagitUtils.magitStatusAndUpdate(currentRepository, currentView));
  }
}

export enum StageAllKind {
  All = "stageAll",
  AllTracked = "stageAllTracked",
  AllUntracked = "stageAllUntracked"
}

export function magitStageAll(kind: StageAllKind = StageAllKind.AllTracked) {

  let [repository, currentView] = MagitUtils.getCurrentMagitRepoAndView();

  // if (currentView instanceof MagitStatusView) {

  commands.executeCommand("git." + kind.valueOf())
    .then(MagitUtils.magitStatusAndUpdate(repository, currentView));
  // }
}

export function magitUnstage() {

  // TODO

  // repository._repository.reset()

}

export function magitUnstageAll() {

  window.showInputBox({ prompt: "Unstage all changes?" })
    .then(response => {
      if (response !== undefined) {
        let [repository, currentView] = MagitUtils.getCurrentMagitRepoAndView();

        // if (currentView instanceof MagitStatusView) {

        commands.executeCommand("git.unstageAll")
          .then(MagitUtils.magitStatusAndUpdate(repository, currentView));
        // }
      }
    });
}