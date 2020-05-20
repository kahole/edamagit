import { window, QuickPickItem } from 'vscode';
import { MenuItem } from './menuItem';
import { MagitRepository } from '../models/magitRepository';

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

export class MenuUtil {

  static showMenu(menu: Menu, menuState: MenuState): Promise<void> {

    return new Promise((resolve, reject) => {

      let quickItems: MenuItem[] = menu.commands.map(item => ({ ...item, description: `\t${item.description}` }));

      if (menuState.switches) {

        const activeSwitches = menuState.switches.filter(s => s.activated).map(s => s.longName).join(' ');
        const activeSwitchesPresentation = `[ ${activeSwitches} ]`;

        quickItems.push({
          label: '-',
          description: `\tSwitches ${activeSwitches.length > 0 ? activeSwitchesPresentation : ''}`,
          action: async (menuState: MenuState) => {

            const updatedSwitches = await MenuUtil.showSwitchesMenu(menuState);

            return MenuUtil.showMenu(menu, { repository: menuState.repository, switches: updatedSwitches });
          }
        });
      }

      const _quickPick = window.createQuickPick<MenuItem>();

      _quickPick.title = menu.title;
      _quickPick.items = quickItems;

      // Select with single key stroke

      const eventListenerDisposable = _quickPick.onDidChangeValue(async (e) => {
        if (_quickPick.value === 'q') {
          _quickPick.dispose();
          eventListenerDisposable.dispose();
          acceptListenerDisposable.dispose();
          resolve();
        }
        const chosenItems = _quickPick.items.filter(i => i.label === _quickPick.value);
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

      if (!menuState.switches) {
        return reject('No switches present in menu');
      }

      const _quickPick = window.createQuickPick<QuickPickItem>();

      _quickPick.canSelectMany = true;
      _quickPick.title = 'Switches (type shortname of switches you want to enable)';
      _quickPick.items = menuState.switches.map(s => ({ label: s.shortName, detail: s.longName, description: `\t${s.description}`, picked: s.activated }));
      _quickPick.selectedItems = _quickPick.items.filter(s => s.picked);

      const eventListenerDisposable = _quickPick.onDidChangeValue((e) => {

        if (_quickPick.value === 'q') {
          return _quickPick.hide();
        }
        if (_quickPick.value === '-') {
          return;
        }
        let quickPickValue = _quickPick.value;
        _quickPick.value = '';

        _quickPick.items = _quickPick.items.map(item => ({ ...item, picked: MenuUtil.matchesSwitch(quickPickValue, item.label) ? !item.picked : item.picked }));
        _quickPick.selectedItems = _quickPick.items.filter(s => s.picked);
      });

      const acceptListenerDisposable = _quickPick.onDidAccept(async () => {

        const updatedSwitches: Switch[] = menuState.switches!.map(s =>
          ({
            ...s,
            activated: _quickPick.selectedItems.find(item => item.label === s.shortName) !== undefined
          })
        );

        _quickPick.dispose();
        eventListenerDisposable.dispose();
        acceptListenerDisposable.dispose();
        resolve(updatedSwitches);
      });

      _quickPick.show();
    });
  }

  static matchesSwitch(input: string, switchShortName: string): boolean {
    return input === switchShortName || input === switchShortName.replace('-', '');
  }

  static switchesToArgs(switches?: Switch[]): string[] {
    return switches?.filter(s => s.activated).map(s => s.longName) ?? [];
  }
}