import { window, TextEditor, Range, workspace } from "vscode";
import MagitUtils from "../utils/magitUtils";
import { MagitRepository } from "../models/magitRepository";
import MagitStatusView from "../views/magitStatusView";
import { CommitItemView } from "../views/commits/commitSectionView";

export async function magitVisitAtPoint(repository: MagitRepository, currentView: MagitStatusView) {

  let selectedView = currentView.click(window.activeTextEditor!.selection.active);

  console.log(window.activeTextEditor!.selection.active.line);
  console.log(selectedView);

  if (selectedView instanceof CommitItemView) {

    // (selectedView as CommitItemView).commit

    // TODO: open up commit view in view column 1
  }

  // TODO: important! can use VSCODE diff command to show diff for a file? or something

}