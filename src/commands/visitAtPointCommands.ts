import { window, TextEditor, Range, workspace } from "vscode";
import MagitUtils from "../utils/magitUtils";

export function magitVisitAtPoint() {

  let repository = MagitUtils.getCurrentMagitRepo();
  let currentView = repository?.views?.get(window.activeTextEditor?.document.uri.toString() ?? "");

  if (currentView) {
    let clickedView = currentView.click(window.activeTextEditor!.selection.active);
    let currentRepository = repository!;
    console.log(window.activeTextEditor!.selection.active.line);
    console.log(clickedView);
  }

  // let selectedLine = editor.document.getText().split(Constants.LineSplitterRegex)[editor.selection.active.line];
  // console.log(selectedLine);
}