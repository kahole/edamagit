import { window, TextEditor, Range, workspace } from "vscode";
import MagitUtils from "../utils/magitUtils";
import { MagitRepository } from "../models/magitRepository";
import MagitStatusView from "../views/magitStatusView";

export async function magitVisitAtPoint(repository: MagitRepository, currentView: MagitStatusView) {

    let clickedView = currentView.click(window.activeTextEditor!.selection.active);

    console.log(window.activeTextEditor!.selection.active.line);
    console.log(clickedView);

  // let selectedLine = editor.document.getText().split(Constants.LineSplitterRegex)[editor.selection.active.line];
  // console.log(selectedLine);
}