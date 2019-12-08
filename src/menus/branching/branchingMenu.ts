import { Menu } from "../abstract/menu";
import { MenuItem } from "../abstract/menuItem";
import { MagitState } from "../../model/magitStatus";

enum Items {
  Checkout,
  Configure,
  CreateNewSpinoff,
  CheckoutNewBranch,
  Reset,
  CreateNewWorktree,
  CheckoutPullRequest,
  CheckoutLocalBranch,
  Rename,
  CreateNewBranch,
  CheckoutNewWorktree,
  Delete,
  CreateFromPullRequest
}

export class BranchingMenu implements Menu {

  title: string = "Branching";
  items: MenuItem[];

  constructor() {
    this.items = [
      {id: Items.Checkout , label: "b", description: "Checkout"},
      {id: Items.Configure , label: "C", description: "Configure"},
      {id: Items.CreateNewSpinoff , label: "s", description: "Create new spin-off"},
      {id: Items.CheckoutNewBranch , label: "c", description: "Checkout new branch"},
      {id: Items.Reset , label: "x", description: "Reset"},
      {id: Items.CreateNewWorktree , label: "W", description: "Create new worktree"},
      {id: Items.CheckoutPullRequest , label: "y", description: "Checkout pull-request"},
      {id: Items.CheckoutLocalBranch , label: "l", description: "Checkout local branch"},
      {id: Items.Rename , label: "m", description: "Rename"},
      {id: Items.CreateNewBranch , label: "n", description: "Create new branch"},
      {id: Items.CheckoutNewWorktree , label: "w", description: "Checkout new worktree"},
      {id: Items.Delete , label: "k", description: "Delete"},
      {id: Items.CreateFromPullRequest , label: "Y", description: "Create from pull-request"}
    ];
  }

  onDidAcceptItems(acceptedItems: readonly MenuItem[]): Menu | undefined {

    // Weak abstraction in this function
    let firstItem = acceptedItems[0];

    switch (firstItem.id) {
      case Items.Checkout:
        // branchQuickPick.hide();
        // window.showQuickPick(["master", "exp", "origin/master"]);
      default:
        return undefined;
    }
  }
}