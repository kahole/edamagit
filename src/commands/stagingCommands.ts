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

export async function magitStage(repository: MagitRepository, currentView: MagitStatusView) {

  // TODO:
  // Bytt til ASYNC-AWAIT!!!!!??????

  let selectedView = currentView.click(window.activeTextEditor!.selection.active);
  let currentRepository = repository!;

  if (selectedView instanceof HunkView) {
    let changeHunkDiff = (selectedView as HunkView).changeHunk.diff;

    // TODO
    var enc = new TextEncoder();
    workspace.fs.writeFile(Uri.parse("file:///tmp/minmagitdiffpatchting"),
      enc.encode(selectedView.changeHunk.diffHeader + changeHunkDiff + "\n"))
      .then(async () => {
        // stage hunk
        await currentRepository
          .apply("/tmp/minmagitdiffpatchting");

        MagitUtils.magitStatusAndUpdate(currentRepository, currentView);
      });

  } else if (selectedView instanceof ChangeView) {

    let magitChange = (selectedView as ChangeView).change;

    await currentRepository
      ._repository
      .add([magitChange.uri], { update: false/*magitChange.status !== Status.UNTRACKED*/ }); // TODO: litt usikker om update eller ikke

    MagitUtils.magitStatusAndUpdate(currentRepository, currentView);

  } else if (selectedView instanceof ChangeSectionView) {
    let section = (selectedView as ChangeSectionView).section;

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
    await window.showQuickPick([
      ...currentRepository.magitState?.workingTreeChanges!,
      ...currentRepository.magitState?.indexChanges!,
      ...currentRepository.magitState?.untrackedFiles!,
      // ...currentRepository.magitState?.mergeChanges
    ].map(c => FilePathUtils.pathRelativeTo(c.uri, currentRepository.rootUri)),
      { placeHolder: "Stage" }
    )
      .then(chosenFilePath => {

        // TODO

      });
    MagitUtils.magitStatusAndUpdate(currentRepository, currentView);
  }
}

export enum StageAllKind {
  All = "stageAll",
  AllTracked = "stageAllTracked",
  AllUntracked = "stageAllUntracked"
}

export async function magitStageAll(kind: StageAllKind = StageAllKind.AllTracked) {

  let [repository, currentView] = MagitUtils.getCurrentMagitRepoAndView();

  // if (currentView instanceof MagitStatusView) {

  if (repository && currentView) {
    await commands.executeCommand("git." + kind.valueOf());
    MagitUtils.magitStatusAndUpdate(repository, currentView as MagitStatusView);
  }
  // }
}

export function magitUnstage() {

  // TODO

  // repository._repository.reset()

}

export function magitUnstageAll(repository: MagitRepository, currentView: MagitStatusView) {

  window.showInputBox({ prompt: "Unstage all changes?" })
    .then(async response => {
      if (response !== undefined) {

        // if (currentView instanceof MagitStatusView) {

        await commands.executeCommand("git.unstageAll");
        MagitUtils.magitStatusAndUpdate(repository, currentView);
        // }
      }
    });
}