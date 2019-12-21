import { window } from "vscode";
import { MenuItem } from "./menuItem";
import { MagitRepository } from "../models/magitRepository";
import { DocumentView } from "../views/general/documentView";

export interface Menu {
  title: string;
  commands: MenuItem[];
  isSwitchesMenu?: boolean;
}

export interface MenuState {
  repository: MagitRepository;
  currentView: DocumentView;
  switches?: any;
}

export class MenuUtil {

  static showMenu(menu: Menu, menuState: MenuState): Promise<void> {

    return new Promise((resolve, reject) => {

      let _quickPick = window.createQuickPick<MenuItem>();

      _quickPick.title = menu.title;
      _quickPick.ignoreFocusOut = true;

      if (menu.isSwitchesMenu) {
        _quickPick.canSelectMany = true;
        _quickPick.title = "Switches (select with <space>)";
      }

      _quickPick.items = menu.commands;

      let eventListenerDisposable = _quickPick.onDidChangeValue(async (e) => {
        let chosenItems = _quickPick.activeItems.filter(i => i.label === _quickPick.value);
        _quickPick.value = "";
        try {
          await chosenItems[0].action(menuState);
          resolve();
        } catch (error) {
          reject(error);
        }
        _quickPick.dispose();
        eventListenerDisposable.dispose();
      });

      // Keep both of these (Select with key or with arrows + enter)

      _quickPick.onDidAccept(async () => {

        if (_quickPick.activeItems.length > 0) {
          let chosenItems = _quickPick.activeItems[0] as MenuItem;
          try {
            await chosenItems.action(menuState);
            resolve();
          } catch (error) {
            reject(error);
          }
          _quickPick.dispose();
          eventListenerDisposable.dispose();
        }
      });

      _quickPick.show();
    });
  }
}