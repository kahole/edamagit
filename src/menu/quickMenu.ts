import { window, QuickPickItem } from 'vscode';

export interface QuickItem<T> extends QuickPickItem {
  meta: T;
}

export class QuickMenuUtil {

  static showMenu<T>(quickItems: QuickItem<T>[], title?: string): Promise<T> {

    return new Promise((resolve, reject) => {

      const _quickPick = window.createQuickPick<QuickItem<T>>();

      _quickPick.items = quickItems;
      _quickPick.title = title;

      const eventListenerDisposable = _quickPick.onDidAccept(async () => {

        if (_quickPick.activeItems.length > 0) {
          const chosenItem = _quickPick.activeItems[0];
          resolve(chosenItem.meta);
          _quickPick.dispose();
          eventListenerDisposable.dispose();
        }
      });

      _quickPick.show();
    });
  }
}