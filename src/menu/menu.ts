import { window } from 'vscode';
import { MenuItem } from './menuItem';
import { MagitRepository } from '../models/magitRepository';
import { DocumentView } from '../views/general/documentView';

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

      const _quickPick = window.createQuickPick<MenuItem>();

      _quickPick.title = menu.title;
      _quickPick.ignoreFocusOut = true;

      if (menu.isSwitchesMenu) {
        _quickPick.canSelectMany = true;
        _quickPick.title = 'Switches (select with <space>)';
      }

      _quickPick.items = menu.commands;

      // Select with single key stroke

      const eventListenerDisposable = _quickPick.onDidChangeValue(async (e) => {
        if (_quickPick.value === 'q') {
          _quickPick.dispose();
          eventListenerDisposable.dispose();
          acceptListenerDisposable.dispose();
          resolve();
        }
        const chosenItems = _quickPick.activeItems.filter(i => i.label === _quickPick.value);
        _quickPick.value = '';
        _quickPick.dispose();
        eventListenerDisposable.dispose();
        acceptListenerDisposable.dispose();
        try {
          await chosenItems[0].action(menuState);
          resolve();
        } catch (error) {
          reject(error);
        }
      });

      // Select with key or with arrows + enter

      const acceptListenerDisposable = _quickPick.onDidAccept(async () => {

        if (_quickPick.activeItems.length > 0) {
          const chosenItems = _quickPick.activeItems[0] as MenuItem;
          _quickPick.dispose();
          eventListenerDisposable.dispose();
          acceptListenerDisposable.dispose();
          try {
            await chosenItems.action(menuState);
            resolve();
          } catch (error) {
            reject(error);
          }
        }
      });

      _quickPick.show();
    });
  }
}