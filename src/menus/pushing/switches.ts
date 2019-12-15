import { Menu } from "../abstract/menu";
import { MenuItem } from "../abstract/menuItem";
import { MagitState } from "../../models/magitState";

enum Items {
  ForceWithLease,
  Force,
  DisableHooks,
  DryRun
}

export class PushingSwitches implements Menu {

  items: MenuItem[];
  isSwitchesMenu = true;

  constructor() {
    this.items = [
      { id: Items.ForceWithLease, label: "-f", description: "force with lease (--force-with-lease)" },
      { id: Items.Force, label: "-F", description: "force (--force)" },
      { id: Items.DisableHooks, label: "-h", description: "disable hooks (--no-verify)" },
      { id: Items.DryRun, label: "-d", description: "Dry run (--dry-run)" },
    ];
  }

  onDidAcceptItems(acceptedItems: readonly MenuItem[]): Menu | undefined {

    // Weak abstraction in this function
    let firstItem = acceptedItems[0];

    switch (firstItem.id) {
      case Items.ForceWithLease:
        return undefined;
      case Items.Force:
        return undefined;
      case Items.DisableHooks:
        return undefined;
      case Items.DryRun:
        return undefined;
      default:
        return undefined;
    }
  }
}