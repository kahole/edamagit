import { QuickPick, QuickPickItem, window } from "vscode";

export interface MenuItem extends QuickPickItem {
  id: number;
}