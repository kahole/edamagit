import { commands, TextEditor, Range } from 'vscode';

export async function saveClose() {
  await commands.executeCommand('workbench.action.files.save');
  return commands.executeCommand('workbench.action.closeActiveEditor');
}

export async function clearSaveClose(editor: TextEditor) {
  await editor.edit(editBuilder => {
    editBuilder.delete(new Range(0, 0, 100, 100));
  });
  return saveClose();
}