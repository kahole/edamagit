import { window, QuickPickItem } from "vscode";

export interface QuickItem extends QuickPickItem {
  meta: any;
}

export class QuickMenuUtil {

  static showMenu(quickItems: QuickItem[]): Promise<QuickItem> {

    return new Promise((resolve, reject) => {

      let _quickPick = window.createQuickPick<QuickItem>();

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