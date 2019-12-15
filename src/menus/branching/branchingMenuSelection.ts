import { BranchingMenu } from "./branchingMenu";

export enum BranchingMenuItem {
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

export interface BranchingMenuSelection {
  item: BranchingMenuItem;
}