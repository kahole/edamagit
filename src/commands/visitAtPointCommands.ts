import { window, TextEditor, Range, workspace } from "vscode";
import * as Constants from '../common/constants';
import { magitRepositories } from "../extension";

export function magitVisitAtPoint() {

  if (window.activeTextEditor) {

    const editor = window.activeTextEditor;
    const currentRepository = magitRepositories[window.activeTextEditor.document.uri.query];

    if (!editor || !currentRepository) {
      return;
    }

    let currentView = currentRepository.views!.get(editor.document.uri.toString());

    if (currentView) {
      let result = currentView.click(editor.selection.active);
      console.log(editor.selection.active.line);
      console.log(result);
    }

    // let selectedLine = editor.document.getText().split(Constants.LineSplitterRegex)[editor.selection.active.line];
    // console.log(selectedLine);
  }
}

// function getRequestText(editor: TextEditor): string | null {
//   if (!editor || !editor.document) {
//       return null;
//   }

//   let selectedText: string | null;
//   if (editor.selection.isEmpty || range) {
//       const activeLine = !range ? editor.selection.active.line : range.start.line;
//       selectedText = Selector.getDelimitedText(editor.document.getText(), activeLine);
//   } else {
//       selectedText = editor.document.getText(editor.selection);
//   }

//   return selectedText;
// }