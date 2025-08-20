import * as vscode from 'vscode';
import { diffWordsWithSpace } from 'diff';

const addedDecoration = vscode.window.createTextEditorDecorationType({
  backgroundColor: 'rgba(0,255,0,0.3)',
});

const removedDecoration = vscode.window.createTextEditorDecorationType({
  backgroundColor: 'rgba(255,0,0,0.5)',
});


export default class DecorationUtils {
  public static decorateWordLevelDiff(editor: vscode.TextEditor) {
    if (!editor) {
      return;
    }

    // First, clear all existing highlighting of refined changes
    editor.setDecorations(addedDecoration, []);
    editor.setDecorations(removedDecoration, []);

    // Now, start to find the added and removed ranges
    const text = editor.document.getText();
    const lines = text.split('\n');

    const addedRanges: vscode.Range[] = [];
    const removedRanges: vscode.Range[] = [];

    let i = 0;
    while (i < lines.length) {
      if (!lines[i].startsWith('-')) {
        // Not in a diff hunk, skip
        i++;
        continue;
      }

      // Inside a diff hunk, prepare to collect changes
      const removedBlock: { text: string; line: number }[] = [];
      const addedBlock: { text: string; line: number }[] = [];

      // collect removed lines
      while (i < lines.length && lines[i].startsWith('-')) {
        removedBlock.push({ text: lines[i].slice(1), line: i });
        i++;
      }

      // collect added lines
      while (i < lines.length && lines[i].startsWith('+')) {
        addedBlock.push({ text: lines[i].slice(1), line: i });
        i++;
      }

      const pairCount = Math.min(removedBlock.length, addedBlock.length);

      // word-level diff for matched pairs
      for (let j = 0; j < pairCount; j++) {
        const oldLine = removedBlock[j];
        const newLine = addedBlock[j];

        const changes = diffWordsWithSpace(oldLine.text, newLine.text);

        let oldOffset = 1;
        let newOffset = 1;

        for (const change of changes) {
          if (change.removed) {
            const start = lines[oldLine.line].indexOf(
              change.value,
              oldOffset
            );
            if (start !== -1) {
              removedRanges.push(
                new vscode.Range(
                  new vscode.Position(oldLine.line, start),
                  new vscode.Position(
                    oldLine.line,
                    start + change.value.length
                  )
                )
              );
            }
            oldOffset += change.value.length;
          } else if (change.added) {
            const start = lines[newLine.line].indexOf(
              change.value,
              newOffset
            );
            if (start !== -1) {
              addedRanges.push(
                new vscode.Range(
                  new vscode.Position(newLine.line, start),
                  new vscode.Position(
                    newLine.line,
                    start + change.value.length
                  )
                )
              );
            }
            newOffset += change.value.length;
          } else {
            oldOffset += change.value.length;
            newOffset += change.value.length;
          }
        }
      }
    }

    // Highlight the changes
    editor.setDecorations(addedDecoration, addedRanges);
    editor.setDecorations(removedDecoration, removedRanges);
  }
}
