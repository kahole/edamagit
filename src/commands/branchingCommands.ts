import { BranchingMenu } from "../menus/branching/branchingMenu";
import { MagitPicker } from "../menus/magitPicker";
import { MagitRepository } from "../models/magitRepository";
import { BranchingMenuItem } from "../menus/branching/branchingMenuSelection";
import { window } from "vscode";
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

  let ref = await window.showQuickPick(repository.state.refs.map( r => r.name!));

  if (ref) {
    try {
      await repository.checkout(ref);
      MagitUtils.magitStatusAndUpdate(repository, currentView);
    } catch (error) {
      
    }
  }
}