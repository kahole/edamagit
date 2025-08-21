import * as vscode from 'vscode';
import { diffWordsWithSpace } from 'diff';

const hunkHeaderDecoration = vscode.window.createTextEditorDecorationType({
  backgroundColor: '#1f3e4e',
  isWholeLine: true,
});

const addedDecoration = vscode.window.createTextEditorDecorationType({
  backgroundColor: '#4a714f',
});

const removedDecoration = vscode.window.createTextEditorDecorationType({
  backgroundColor: '#714545',
});

export default class DecorationUtils {
  public static decorateWordLevelDiff(editor: vscode.TextEditor) {
    if (!editor) {
      return;
    }

    // First, clear all existing decorations
    editor.setDecorations(hunkHeaderDecoration, []);
    editor.setDecorations(addedDecoration, []);
    editor.setDecorations(removedDecoration, []);

    // Now, start to find the added and removed ranges
    const text = editor.document.getText();
    const lines = text.split('\n');

    const hunkHeaderRanges: vscode.Range[] = [];
    const addedTextRanges: vscode.Range[] = [];
    const removedTextRanges: vscode.Range[] = [];

    let i = 0;
    while (i < lines.length) {
      if (lines[i].startsWith('@@')) {
        // Decorate diff headers
        hunkHeaderRanges.push(new vscode.Range(i, 0, i, 0));
        i++;
      } else if (lines[i].startsWith('-')) {
        // Decorate hunk
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
                removedTextRanges.push(
                  new vscode.Range(
                    oldLine.line,
                    start,
                    oldLine.line,
                    start + change.value.length
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
                addedTextRanges.push(
                  new vscode.Range(
                    newLine.line,
                    start,
                    newLine.line,
                    start + change.value.length
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
      } else {
        // No decoration
        i++;
      }
    }

    // Highlight the changes
    editor.setDecorations(hunkHeaderDecoration, hunkHeaderRanges);
    editor.setDecorations(addedDecoration, addedTextRanges);
    editor.setDecorations(removedDecoration, removedTextRanges);
  }
}
