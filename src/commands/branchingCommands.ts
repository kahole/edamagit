import { BranchingMenu } from "../menus/branching/branchingMenu";
import { MagitPicker } from "../menus/magitPicker";

export function branching() {
  MagitPicker.showMagitPicker(new BranchingMenu());
}