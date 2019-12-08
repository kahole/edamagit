import { Menu } from "../abstract/menu";
import { MenuItem } from "../abstract/menuItem";
import { MagitState } from "../../models/magitStatus";
import { PushingSwitches } from "./switches";

enum Items {
  Switches
}

export class PushingMenu implements Menu {

  title: string = "Pushing";
  items: MenuItem[];

  constructor() {
    // TODO: take in some state to customize and narrow selection!
    this.items = [{id: Items.Switches, label: "-", description: "Switches"}];
  }

  onDidAcceptItems(acceptedItems: readonly MenuItem[]): Menu | undefined {

    // Weak abstraction in this function
    let firstItem = acceptedItems[0];

    switch (firstItem.id) {
      case Items.Switches:
        return new PushingSwitches();
      default:
        return undefined;
    }
  }
}