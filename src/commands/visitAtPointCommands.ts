import { window, TextEditor, Range, workspace } from "vscode";
import MagitUtils from "../utils/magitUtils";
import { MagitRepository } from "../models/magitRepository";
import { CommitItemView } from "../views/commits/commitSectionView";
import { DocumentView } from "../views/general/documentView";

export async function magitVisitAtPoint(repository: MagitRepository, currentView: DocumentView) {

  let selectedView = currentView.click(window.activeTextEditor!.selection.active);

  console.log(window.activeTextEditor!.selection.active.line);
  console.log(selectedView);

  if (selectedView instanceof CommitItemView) {

    // (selectedView as CommitItemView).commit

    // TODO: open up commit view in view column 1
  }

  // TODO: UNRELATED TO visitAtPoint. relevant for diff: can use VSCODE diff command to show diff for a file? or something


  // Link-provider can be used for file links.. but it brings with it a lot of functionality and style

}