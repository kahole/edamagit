import { window, TextEditor, Range, workspace } from "vscode";
import * as Constants from '../common/constants';
import { magitRepositories } from "../extension";
import { HunkView } from "../views/changes/HunkView";

export function magitVisitAtPoint() {

  if (window.activeTextEditor) {

    const editor = window.activeTextEditor;
    const currentRepository = magitRepositories[window.activeTextEditor.document.uri.query];

    if (!editor || !currentRepository) {
      return;
    }

    let currentView = currentRepository.views!.get(editor.document.uri.toString());

    if (currentView) {
      let clickedView = currentView.click(editor.selection.active);
      console.log(editor.selection.active.line);
      console.log(clickedView);

      // TODO: Is this a good way of solving this?
      if (clickedView instanceof HunkView) {
        // (clickedView as HunkView).changeHunk.diff
      }


    }

    // let selectedLine = editor.document.getText().split(Constants.LineSplitterRegex)[editor.selection.active.line];
    // console.log(selectedLine);
  }
}