import { window, QuickPickItem } from 'vscode';

export interface QuickItem<T> extends QuickPickItem {
  meta: T;
}

export class QuickMenuUtil {

  static showMenu<T>(quickItems: QuickItem<T>[], placeholder?: string): Promise<T> {

    return new Promise((resolve, reject) => {

      let resolveOnHide = true;
      const _quickPick = window.createQuickPick<QuickItem<T>>();

      _quickPick.items = quickItems;
      _quickPick.matchOnDescription = true;
      _quickPick.placeholder = placeholder;

      const eventListenerDisposable = _quickPick.onDidAccept(async () => {

        if (_quickPick.activeItems.length > 0) {
          const chosenItem = _quickPick.activeItems[0];
          resolveOnHide = false;
          _quickPick.hide();
          resolve(chosenItem.meta);
        }
      });

      const didHideDisposable = _quickPick.onDidHide(() => {
        _quickPick.dispose();
        eventListenerDisposable.dispose();
        didHideDisposable.dispose();
        if (resolveOnHide) {
          resolve();
        }
      });

      _quickPick.show();
    });
  }

  static showMenuWithFreeform<T>(quickItems: QuickItem<string>[], placeholder?: string): Promise<string> {

    return new Promise((resolve, reject) => {

      let resolveOnHide = true;
      const _quickPick = window.createQuickPick<QuickItem<string>>();

      _quickPick.items = quickItems;
      _quickPick.placeholder = placeholder;
      _quickPick.matchOnDescription = true;

      const eventListenerDisposable = _quickPick.onDidAccept(async () => {

        resolveOnHide = false;
        _quickPick.hide();
        if (_quickPick.activeItems.length > 0) {
          const chosenItem = _quickPick.activeItems[0];
          resolve(chosenItem.meta);
        } else {
          resolve(_quickPick.value);
        }
      });

      const didHideDisposable = _quickPick.onDidHide(() => {
        _quickPick.dispose();
        eventListenerDisposable.dispose();
        didHideDisposable.dispose();
        if (resolveOnHide) {
          resolve();
        }
      });

      _quickPick.show();
    });
  }
}