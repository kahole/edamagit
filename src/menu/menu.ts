import { QuickPick, window, QuickPickItem } from "vscode";
import { MenuItem } from "./menuItem";
import { MagitRepository } from "../models/magitRepository";
import MagitStatusView from "../views/magitStatusView";


export class Menu {

  private _quickPick: QuickPick<any>;
  activeSwitches: any[] = [];
  
  constructor(menu: MenuItem[], isSwitchesMenu: boolean, repository: MagitRepository, currentView: MagitStatusView) {
    
    this._quickPick = window.createQuickPick();

    if (isSwitchesMenu) {
      this._quickPick.canSelectMany = true;
      this._quickPick.title = "Switches (select with <space>)";
    }

    this._quickPick.items = menu;

    this._quickPick.onDidAccept(() => {

      if (this._quickPick.activeItems.length > 0) {
        let chosenItem = this._quickPick.activeItems[0] as MenuItem;
        chosenItem.action(repository, currentView);
      }

      // må ha funksjon for this? elns


    });
  }

  static show(menu: MenuItem[], isSwitchesMenu: boolean) {
    
    
  }

}