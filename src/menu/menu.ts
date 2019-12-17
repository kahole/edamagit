import { QuickPick, window, QuickPickItem, Disposable } from "vscode";
import { MenuItem } from "./menuItem";
import { MagitRepository } from "../models/magitRepository";
import MagitStatusView from "../views/magitStatusView";
import { DocumentView } from "../views/general/documentView";


export interface MenuState {
  repository: MagitRepository;
  // currentView: DocumentView;
  currentView: MagitStatusView;
  switches?: any;
}

export class Menu {

  private _quickPick: QuickPick<MenuItem>;
  activeSwitches: any[] = [];
  
  constructor(menu: MenuItem[], menuState: MenuState, isSwitchesMenu?: boolean) {
    
    this._quickPick = window.createQuickPick<MenuItem>();

    this._quickPick.title = "Wow wow we we   C - Configure";

    if (isSwitchesMenu) {
      this._quickPick.canSelectMany = true;
      this._quickPick.title = "Switches (select with <space>)";
    }

    this._quickPick.items = menu;

    // Experiments
    // TODO: THIS ALSO WORKS PRETTY NICELY
    //    no duplicate definitions of keybindings+menu keys
    //      menu becomes actual menu, not just a visual element
    //        and if it cant be enabled=false anyways, might as well just do it like this
    //          but keep the notes about the other method
    this._quickPick.onDidChangeValue( (e) => {
      console.log(e);
      console.log(this._quickPick.value);
      // TODO
      // clean up
      let selectedItem = this._quickPick.activeItems.filter(i => i.label === this._quickPick.value);
      this._quickPick.value = "";
      console.log(selectedItem);
      selectedItem[0].action(menuState);
      this._quickPick.dispose(); //??
    });

    // end Experiments

    this._quickPick.onDidAccept(() => {

      if (this._quickPick.activeItems.length > 0) {
        let chosenItem = this._quickPick.activeItems[0] as MenuItem;
        chosenItem.action(menuState);
      }
    });
  }
  
  show() {
    
    this._quickPick.show();
    this._quickPick.ignoreFocusOut = true;
    // this._quickPick.enabled = false;

    // this._quickPick.dispose(); 
    
  }

  static showMenu(menu: MenuItem[], menuState: MenuState, isSwitchesMenu?: boolean) {
    new Menu(menu, menuState, isSwitchesMenu).show();
  }

}