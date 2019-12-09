import { View } from "./view";
import { Range } from "vscode";
import { MagitChange } from "../models/magitChange";
import { HunkView } from "./HunkView";
import { Status } from "../typings/git";

export class ChangeView extends View {

  constructor(private change: MagitChange) {
    super();
    if (this.change.hunks) {
      this.subViews = this.change.hunks.map(hunk => new HunkView(hunk));
    }
  }

  render(startLineNumber: number): string[] {
    let render = [
      `${mapFileStatusToLabel(this.change.status)} ${this.change.uri.path}`,
      ...super.render(startLineNumber + 1)];

    // TODO: broken abstraction. Pass in extra content array as optional to render?
    this.range = new Range(startLineNumber, 0, this.range.end.line, this.range.end.character);

    return render;
  }
}

function mapFileStatusToLabel(status: Status): string {
  switch (status) {
    case Status.INDEX_MODIFIED:
    case Status.MODIFIED:
      return "modified";
    case Status.INDEX_ADDED:
      return "added";
    case Status.INDEX_DELETED:
    case Status.DELETED:
      return "deleted";
    case Status.INDEX_RENAMED:
      return "renamed";
    case Status.INDEX_COPIED:
      return "copied";
    case Status.UNTRACKED:
      return "";
    default:
      return "";
  }
}