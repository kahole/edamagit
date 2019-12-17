import { QuickPickItem } from "vscode";
import { MenuState } from "./menu";

export interface MenuItem extends QuickPickItem {
  action: (menuState: MenuState) => void;
}