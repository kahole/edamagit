import * as vscode from 'vscode';
import { diffWordsWithSpace } from 'diff';

const hunkHeaderDecoration = vscode.window.createTextEditorDecorationType({
  backgroundColor: '#1f3e4e',
  isWholeLine: true,
});

const insertedLineDecor = vscode.window.createTextEditorDecorationType({
  backgroundColor: '#304135',
  isWholeLine: true,
});

const deletedLineDecor = vscode.window.createTextEditorDecorationType({
  backgroundColor: '#3f3239',
  isWholeLine: true,
});

const insertedWordDecor = vscode.window.createTextEditorDecorationType({
  backgroundColor: '#4a714f',
});

const deletedWordDecor = vscode.window.createTextEditorDecorationType({
  backgroundColor: '#714545',
});

export default class DecorationUtils {
  public static decorateWordLevelDiff(editor: vscode.TextEditor) {
    if (!editor) {
      return;
    }

    // First, clear all existing decorations
    editor.setDecorations(hunkHeaderDecoration, []);
    editor.setDecorations(insertedLineDecor, []);
    editor.setDecorations(deletedLineDecor, []);
    editor.setDecorations(insertedWordDecor, []);
    editor.setDecorations(deletedWordDecor, []);

    // Now, start to find the added and removed ranges
    const text = editor.document.getText();
    const lines = text.split('\n');

    const hunkHeaderRanges: vscode.Range[] = [];
    const insertedLineRanges: vscode.Range[] = [];
    const deletedLineRanges: vscode.Range[] = [];
    const insertedWordRanges: vscode.Range[] = [];
    const deletedWordRanges: vscode.Range[] = [];

    let i = 0;
    while (i < lines.length) {
      if (lines[i].startsWith('@@')) {
        // Decorate diff headers
        hunkHeaderRanges.push(new vscode.Range(i, 0, i, 0));
        i++;
      } else if (lines[i].startsWith('-')) {
        // Decorate deleted and inserted words and lines

        const deletedBlock: { text: string; line: number }[] = [];
        const insertedBlock: { text: string; line: number }[] = [];

        // collect deleted lines
        while (i < lines.length && lines[i].startsWith('-')) {
          deletedLineRanges.push(new vscode.Range(i, 0, i, 0));
          deletedBlock.push({ text: lines[i].slice(1), line: i });
          i++;
        }

        // collect inserted lines
        while (i < lines.length && lines[i].startsWith('+')) {
          insertedLineRanges.push(new vscode.Range(i, 0, i, 0));
          insertedBlock.push({ text: lines[i].slice(1), line: i });
          i++;
        }

        const pairCount = Math.min(deletedBlock.length, insertedBlock.length);

        // word-level diff for matched pairs
        for (let j = 0; j < pairCount; j++) {
          const oldLine = deletedBlock[j];
          const newLine = insertedBlock[j];

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
                deletedWordRanges.push(
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
                insertedWordRanges.push(
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
      } else if (lines[i].startsWith('+')) {
        // collect inserted lines
        while (i < lines.length && lines[i].startsWith('+')) {
          insertedLineRanges.push(new vscode.Range(i, 0, i, 0));
          i++;
        }
      } else {
        // No decoration
        i++;
      }
    }

    // Highlight the changes
    editor.setDecorations(hunkHeaderDecoration, hunkHeaderRanges);
    editor.setDecorations(insertedLineDecor, insertedLineRanges);
    editor.setDecorations(deletedLineDecor, deletedLineRanges);
    editor.setDecorations(insertedWordDecor, insertedWordRanges);
    editor.setDecorations(deletedWordDecor, deletedWordRanges);
  }
}
