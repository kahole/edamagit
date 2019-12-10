import { TextView } from "../abstract/textView";
import { MagitChange } from "../../models/magitChange";
import { Status } from "../../typings/git";

export class ChangeHeaderView extends TextView {

  constructor(private change: MagitChange) {
    super();
    let statusLabel = mapFileStatusToLabel(this.change.status);
    this.textContent = `${statusLabel ? statusLabel + " " : ""}${this.change.uri.path}`;
  }

  onClicked(): any {
    return this.change;
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