import { View } from "../abstract/view";
import { Range } from "vscode";
import { MagitChange } from "../../models/magitChange";
import { HunkView } from "./HunkView";
import { Status } from "../../typings/git";
import { ChangeHeaderView } from "./changeHeaderView";

export class ChangeView extends View {

  constructor(private change: MagitChange) {
    super();
    this.subViews = [new ChangeHeaderView(change)];
    if (this.change.hunks) {
      this.subViews.push(...this.change.hunks.map(hunk => new HunkView(hunk)));
    }
  }

  onClicked(): any { }
}