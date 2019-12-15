import { Menu } from "../abstract/menu";
import { MenuItem } from "../abstract/menuItem";
import { MagitState } from "../../models/magitState";
import { BranchingMenuItem } from "./branchingMenuSelection";


export class BranchingMenu implements Menu {

  title: string = "Branching";
  items: MenuItem[];

  constructor() {
    this.items = [
      {id: BranchingMenuItem.Checkout , label: "b", description: "Checkout"},
      {id: BranchingMenuItem.Configure , label: "C", description: "Configure"},
      {id: BranchingMenuItem.CreateNewSpinoff , label: "s", description: "Create new spin-off"},
      {id: BranchingMenuItem.CheckoutNewBranch , label: "c", description: "Checkout new branch"},
      {id: BranchingMenuItem.Reset , label: "x", description: "Reset"},
      {id: BranchingMenuItem.CreateNewWorktree , label: "W", description: "Create new worktree"},
      {id: BranchingMenuItem.CheckoutPullRequest , label: "y", description: "Checkout pull-request"},
      {id: BranchingMenuItem.CheckoutLocalBranch , label: "l", description: "Checkout local branch"},
      {id: BranchingMenuItem.Rename , label: "m", description: "Rename"},
      {id: BranchingMenuItem.CreateNewBranch , label: "n", description: "Create new branch"},
      {id: BranchingMenuItem.CheckoutNewWorktree , label: "w", description: "Checkout new worktree"},
      {id: BranchingMenuItem.Delete , label: "k", description: "Delete"},
      {id: BranchingMenuItem.CreateFromPullRequest , label: "Y", description: "Create from pull-request"}
    ];
  }

  onDidAcceptItems(acceptedItems: readonly MenuItem[]): Menu | undefined {

    // Weak abstraction in this function
    let firstItem = acceptedItems[0];

    switch (firstItem.id) {
      case BranchingMenuItem.Checkout:
        // branchQuickPick.hide();
        // window.showQuickPick(["master", "exp", "origin/master"]);
      default:
        return undefined;
    }
  }
}