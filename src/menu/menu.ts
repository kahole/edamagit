import { window, QuickPickItem } from 'vscode';
import { MenuItem } from './menuItem';
import { MagitRepository } from '../models/magitRepository';
import { DocumentView } from '../views/general/documentView';

export interface Menu {
  title: string;
  commands: MenuItem[];
}

export interface MenuState {
  repository: MagitRepository;
  switches?: Switch[];
  options?: any;
  data?: any;
}

export interface Switch {
  shortName: string;
  longName: string;
  description: string;
  activated?: boolean;
}

export function activeSwitchesArgsForm(switches?: Switch[]) {
  return switches?.filter(s => s.activated).map(s => s.longName) ?? [];
}

export class MenuUtil {

  static showMenu(menu: Menu, menuState: MenuState): Promise<void> {

    return new Promise((resolve, reject) => {

      const _quickPick = window.createQuickPick<MenuItem>();

      _quickPick.title = menu.title;
      _quickPick.ignoreFocusOut = true;
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
        if (chosenItems.length > 0) {
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
        }
      });

      // Select with arrows + enter

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

  static showSwitchesMenu(menuState: MenuState): Promise<Switch[]> {

    return new Promise((resolve, reject) => {

      const _quickPick = window.createQuickPick<QuickPickItem>();

      _quickPick.ignoreFocusOut = true;
      if (menuState.switches) {
        _quickPick.items = menuState.switches.map(s => ({ label: s.shortName, detail: s.longName, description: s.description, activated: s.activated }));
        _quickPick.selectedItems = _quickPick.items.filter(s => (s as any).activated);
        _quickPick.canSelectMany = true;
        _quickPick.title = 'Switches (select with <space>)';
      }

      const acceptListenerDisposable = _quickPick.onDidAccept(async () => {

        const updatedSwitches: Switch[] = [];

        menuState.switches!.forEach(s => {
          updatedSwitches.push({ ...s, activated: _quickPick.selectedItems.find(item => item.label === s.shortName) !== undefined });
        });

        _quickPick.dispose();
        acceptListenerDisposable.dispose();
        try {
          resolve(updatedSwitches);
        } catch (error) {
          reject(error);
        }
      });

      _quickPick.show();
    });
  }
}