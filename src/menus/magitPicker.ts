import { QuickPick, window } from "vscode";
import { MenuItem } from "./abstract/menuItem";
import { Menu } from "./abstract/menu";

export class MagitPicker {

  private _quickPick: QuickPick<MenuItem>;

  static showMagitPicker(menu: Menu) {
    new MagitPicker(menu).show();
  }

  constructor(private _menu: Menu) {
    this._quickPick = window.createQuickPick();

    this.loadMenu(this._menu);

    this._quickPick.onDidAccept(() => {
      let nextMenu = this._menu.onDidAcceptItems(this._quickPick.activeItems);
      if (nextMenu) {
        this._menu = nextMenu;
        this.loadMenu(this._menu);
      }
    });
  }

  loadMenu(menu: Menu) {
    this._quickPick.title = menu.title;

    if (menu.isSwitchesMenu) {
      this._quickPick.canSelectMany = true;
      this._quickPick.title = "Switches (select with <space>)";
    }

    this._quickPick.items = menu.items;
  }

  show() {
    this._quickPick.show();
  }
}