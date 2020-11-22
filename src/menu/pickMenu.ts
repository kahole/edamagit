import { window, QuickPickItem } from 'vscode';

export interface PickMenuItem<T> extends QuickPickItem {
  meta: T;
}

export class PickMenuUtil {

  static showMenu<T>(pickItems: PickMenuItem<T>[], placeholder?: string, freeformResolver?: (s: string) => T): Promise<T> {

    return new Promise((resolve, reject) => {

      let resolveOnHide = true;
      const _quickPick = window.createQuickPick<PickMenuItem<T>>();

      _quickPick.items = pickItems;
      _quickPick.matchOnDescription = true;
      _quickPick.placeholder = placeholder;

      const eventListenerDisposable = _quickPick.onDidAccept(async () => {

        if (_quickPick.activeItems.length > 0) {
          const chosenItem = _quickPick.activeItems[0];
          resolveOnHide = false;
          _quickPick.hide();
          resolve(chosenItem.meta);
        } else if (freeformResolver) {
          let freeformVal = _quickPick.value;
          resolveOnHide = false;
          _quickPick.hide();
          resolve(freeformResolver(freeformVal));
        }
      });

      const didHideDisposable = _quickPick.onDidHide(() => {
        _quickPick.dispose();
        eventListenerDisposable.dispose();
        didHideDisposable.dispose();
        if (resolveOnHide) {
          resolve(undefined!);
        }
      });

      _quickPick.show();
    });
  }

  static showMenuWithFreeform(pickItems: PickMenuItem<string>[], placeholder?: string): Promise<string> {
    return PickMenuUtil.showMenu<string>(pickItems, placeholder, s => s);
  }
}