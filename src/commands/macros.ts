import { commands } from "vscode";

export function saveClose() {
  commands.executeCommand("workbench.action.files.save")
    .then(() => {
      commands.executeCommand("workbench.action.closeActiveEditor");
    });
}