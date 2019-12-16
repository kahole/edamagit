import { BranchingMenu } from "../menus/branching/branchingMenu";
import { MagitPicker } from "../menus/magitPicker";
import { MagitRepository } from "../models/magitRepository";
import { BranchingMenuItem } from "../menus/branching/branchingMenuSelection";
import { window, CodeLens, Range } from "vscode";
import MagitUtils from "../utils/magitUtils";
import { readFileSync } from "fs";
import MagitStatusView from "../views/magitStatusView";

export async function branching(repository: MagitRepository, currentView: MagitStatusView) {

  // let branchingMenuOutput = await MagitPicker.showMagitPicker(new BranchingMenu());

  // switch (branchingAction) {
  //   case BranchingMenuItem.Checkout:

  //     break;

  //   default:
  //     break;
  // }

  let ref = await window.showQuickPick(repository.state.refs.map(r => r.name!));

  if (ref) {
    try {
      await repository.checkout(ref);
      MagitUtils.magitStatusAndUpdate(repository, currentView);
    } catch (error) {

    }
  }
}

// TODO: 
// Alle views i magit støtter hovedmenyen
// Burde være DocumentView som sendes rundt!

// TODO: Vanskeligste
// Kan transient løses bedre med dynamic commands somehow?
// Eller decoration
// Eller code lens
// new CodeLens(new Range(0,0,0,0), "magit.whatever"");

function branchingMenu(repository: MagitRepository, currentView: MagitStatusView, switches: any = {}) {

}

const branchingMap = [
  { label: "b", description: "Checkout", action: checkout },
  { label: "l", description: "Checkout local branch" },
  { label: "c", description: "Checkout new branch" },
  { label: "w", description: "Checkout new worktree" },
  { label: "y", description: "Checkout pull-request" },
  { label: "s", description: "Create new spin-off" },
  { label: "n", description: "Create new branch" },
  { label: "W", description: "Create new worktree" },
  { label: "Y", description: "Create from pull-request" },
  { label: "C", description: "Configure" },
  { label: "m", description: "Rename" },
  { label: "x", description: "Reset" },
  { label: "k", description: "Delete" },
];

async function checkout(repository: MagitRepository, currentView: MagitStatusView) {
  let ref = await window.showQuickPick(repository.state.refs.map(r => r.name!));

  if (ref) {
    try {
      await repository.checkout(ref);
      MagitUtils.magitStatusAndUpdate(repository, currentView);
    } catch (error) {

    }
  }
}
