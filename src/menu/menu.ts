import { window, QuickPickItem, QuickPick } from 'vscode';
import { magitConfig } from '../extension';
import { MagitRepository } from '../models/magitRepository';

export interface Menu {
  title: string;
  commands: MenuItem[];
}

export interface MenuItem extends QuickPickItem {
  icon?: string;
  action: (menuState: MenuState) => Promise<any>;
}

export interface MenuState {
  repository: MagitRepository;
  switches?: Switch[];
  options?: Option[];
  data?: any;
}

export interface Switch {
  key: string;
  name: string;
  description: string;
  activated?: boolean;
  icon?: string;
}

export interface Option extends Switch {
  value?: string;
}

export class MenuUtil {

  static showMenu(menu: Menu, menuState: MenuState): Promise<void> {

    let menuItems: MenuItem[] = menu.commands.map(item => ({ ...item, description: MenuUtil.description(item) }));

    if (menuState.switches) {

      const activeSwitches = menuState.switches.filter(s => s.activated).map(s => s.name).join(' ');
      const activeSwitchesPresentation = `[ ${activeSwitches} ]`;

      menuItems.push({
        label: '-',
        // FIXME make sure this is configurable if we add a setting
        description: `\t$(settings)   Switches ${activeSwitches.length > 0 ? activeSwitchesPresentation : ''}`,
        action: async (menuState: MenuState) => {

          const updatedSwitches = await MenuUtil.showSwitchesMenu(menuState);
          return MenuUtil.showMenu(menu, { ...menuState, switches: updatedSwitches });
        }
      });
    }

    if (menuState.options) {

      const activeOptions = menuState.options.filter(s => s.activated).map(s => `${s.name}"${s.value}"`).join(' ');
      const activeOptionsPresentation = `[ ${activeOptions} ]`;

      menuItems.push({
        label: '=',
        // FIXME make sure this is configurable if we add a setting
        description: `\t$(gear)   Options ${activeOptions.length > 0 ? activeOptionsPresentation : ''}`,
        action: async (menuState: MenuState) => {

          const updatedOptions = await MenuUtil.showOptionsMenu(menuState);
          return MenuUtil.showMenu(menu, { ...menuState, options: updatedOptions });
        }
      });
    }

    return MenuUtil.runMenu({ ...menu, commands: menuItems }, menuState);
  }

  private static description(item: MenuItem | Switch) {
    return item.icon ? `\t\$(${item.icon})   ${item.description}` : `\t${item.description}`;
  }

  static switchesToArgs(switches?: Switch[]): string[] {
    return switches?.filter(s => s.activated).map(s => s.name) ?? [];
  }

  static optionsToArgs(options?: Option[]): string[] {
    return options?.filter(s => s.activated).map(s => `${s.name}${s.value}`) ?? [];
  }

  private static runMenu(menu: Menu, menuState: MenuState): Promise<void> {

    return new Promise((resolve, reject) => {

      let resolveOnHide = true;
      const _quickPick = window.createQuickPick<MenuItem>();

      _quickPick.title = menu.title;
      _quickPick.items = menu.commands;

      // Select with single key stroke

      const eventListenerDisposable = _quickPick.onDidChangeValue(async (e) => {
        if (_quickPick.value === 'q') {
          return _quickPick.hide();
        }
        const chosenItems = _quickPick.items.filter(i => i.label === _quickPick.value);
        if (chosenItems.length > 0) {
          _quickPick.value = '';
          resolveOnHide = false;
          _quickPick.hide();
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
          resolveOnHide = false;
          _quickPick.hide();
          try {
            await chosenItems.action(menuState);
            resolve();
          } catch (error) {
            reject(error);
          }
        }
      });

      const didHideDisposable = _quickPick.onDidHide(() => {
        _quickPick.dispose();
        eventListenerDisposable.dispose();
        acceptListenerDisposable.dispose();
        didHideDisposable.dispose();
        if (resolveOnHide) {
          resolve();
        }
      });

      _quickPick.show();
    });
  }

  private static showSwitchesMenu(menuState: MenuState): Promise<Switch[]> {

    let getUpdatedSwitches = (quickPick: QuickPick<QuickPickItem>, { switches }: MenuState) => switches!.map(s =>
      ({
        ...s,
        activated: quickPick.selectedItems.find(item => item.label === s.key) !== undefined
      })
    );

    let items = menuState.switches!.map(s => ({ label: s.key, detail: s.name, description: MenuUtil.description(s), picked: s.activated }));

    return MenuUtil.showSwitchLikeMenu<Switch[]>(items, menuState,
      async (item) => {
        return { ...item, picked: !item.picked };
      },
      getUpdatedSwitches,
      'Switches (press letter for switches you want to enable)',
      true,
      '-'
    );
  }

  private static showOptionsMenu(menuState: MenuState): Promise<Option[]> {

    let items = menuState.options!.map(s => ({ label: s.key, detail: s.activated ? `${s.name}"${s.value}"` : s.name, description: MenuUtil.description(s), picked: s.activated }));

    let getUpdatedOptions = (quickPick: QuickPick<QuickPickItem>, { options }: MenuState) => options!.map(s => {
      let selectedItem = quickPick.selectedItems.find(item => item.label === s.key);
      return {
        ...s,
        activated: selectedItem !== undefined,
        value: selectedItem?.detail?.split('"')[1]
      };
    });

    return MenuUtil.showSwitchLikeMenu<Option[]>(items, menuState,
      async (item) => {
        let [prompt, oldVal, ...rest] = item.detail!.split('"');
        let val = !item.picked ? await window.showInputBox({ prompt: `${prompt}=` }) : oldVal;
        return { ...item, picked: !item.picked, detail: `${prompt}"${val}"` };
      },
      getUpdatedOptions,
      'Options (press the letter of the option you want to set)',
      true,
      '='
    );
  }

  private static matchesSwitchOrOption(input: string, switchkey: string): boolean {
    return input === switchkey ||
      input === switchkey.replace('-', '') ||
      input === switchkey.replace('=', '');
  }

  private static showSwitchLikeMenu<T>(
    items: QuickPickItem[],
    menuState: MenuState,
    processItemSelection: (q: QuickPickItem) => Promise<QuickPickItem>,
    getUpdatedState: (q: QuickPick<QuickPickItem>, m: MenuState) => T,
    title = '',
    canSelectMany = false,
    ignoreKey?: string): Promise<T> {

    return new Promise((resolve, reject) => {

      let resolveOnHide = true;
      let shouldDispose = true;
      const _quickPick = window.createQuickPick<QuickPickItem>();

      _quickPick.canSelectMany = canSelectMany;
      _quickPick.title = title;
      _quickPick.items = items;
      if (canSelectMany) {
        _quickPick.selectedItems = _quickPick.items.filter(s => s.picked);
      }

      const eventListenerDisposable = _quickPick.onDidChangeValue(async (e) => {

        if (_quickPick.value === 'q') {
          return _quickPick.hide();
        }
        if (ignoreKey && _quickPick.value === ignoreKey) {
          return;
        }
        let quickPickValue = _quickPick.value;
        _quickPick.value = '';

        shouldDispose = false;

        let updated: QuickPickItem[] = [];

        for (let item of _quickPick.items) {
          if (MenuUtil.matchesSwitchOrOption(quickPickValue, item.label)) {
            updated.push(await processItemSelection(item));
            if (magitConfig.quickSwitchEnabled) {
              _quickPick.hide();
            }
          } else {
            updated.push({ ...item });
          }
        }

        _quickPick.items = updated;
        if (canSelectMany) {
          _quickPick.selectedItems = _quickPick.items.filter(s => s.picked);
        }

        shouldDispose = true;
        _quickPick.show();
      });

      const acceptListenerDisposable = _quickPick.onDidAccept(() => {
        resolveOnHide = false;
        _quickPick.hide();
        resolve(getUpdatedState(_quickPick, menuState));
      });

      const didHideDisposable = _quickPick.onDidHide(() => {
        if (!shouldDispose) {
          return;
        }
        _quickPick.dispose();
        eventListenerDisposable.dispose();
        acceptListenerDisposable.dispose();
        didHideDisposable.dispose();
        if (resolveOnHide) {
          resolve(getUpdatedState(_quickPick, menuState));
        }
      });

      _quickPick.show();
    });
  }
}
