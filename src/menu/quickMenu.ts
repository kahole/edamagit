import { window, QuickPickItem } from "vscode";

export interface QuickItem<T> extends QuickPickItem {
  meta: T;
}

export class QuickMenuUtil {

  static showMenu<T>(quickItems: QuickItem<T>[]): Promise<QuickItem<T>> {

    return new Promise((resolve, reject) => {

      let _quickPick = window.createQuickPick<QuickItem<T>>();

      _quickPick.items = quickItems;

      let eventListenerDisposable = _quickPick.onDidAccept(async () => {

        if (_quickPick.activeItems.length > 0) {
          let chosenItem = _quickPick.activeItems[0];
          resolve(chosenItem);
          _quickPick.dispose();
          eventListenerDisposable.dispose();
        }
      });

      _quickPick.show();
    });
  }
}