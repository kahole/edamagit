import { commands } from 'vscode';

export async function saveClose() {
  await commands.executeCommand('workbench.action.files.save');
  return commands.executeCommand('workbench.action.closeActiveEditor');
}