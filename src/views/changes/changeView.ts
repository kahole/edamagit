import { View } from "../general/view";
import { Range } from "vscode";
import { MagitChange } from "../../models/magitChange";
import { HunkView } from "./HunkView";
import { Status } from "../../typings/git";
import { ChangeHeaderView } from "./changeHeaderView";

export class ChangeView extends View {
  isFoldable = true;

  constructor(public change: MagitChange) {
    super();
    this.addSubview(new ChangeHeaderView(change));
    if (this.change.hunks) {
      this.addSubview(...this.change.hunks.map(hunk => new HunkView(hunk)));
    }
  }
}