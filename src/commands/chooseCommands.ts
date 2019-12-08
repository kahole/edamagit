import { window, TextEditor, Range } from "vscode";
import * as Constants from '../common/constants';

export function magitChoose() {

  const editor = window.activeTextEditor;
  // const document = getCurrentTextDocument();
  if (!editor/* || !document*/) {
      return;
  }

  let selectedLine = editor.document.getText().split(Constants.LineSplitterRegex)[editor.selection.active.line];
  console.log(selectedLine);
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