import { TextView } from "../general/textView";
import { MagitBranch } from "../../models/magitBranch";

// https://emacs.stackexchange.com/questions/26247/meaning-of-magit-status-buffer-head-merge-push

// https://magit.vc/manual/magit/The-Two-Remotes.html

export class BranchHeaderView extends TextView {

  constructor(name: string, branch: MagitBranch) {
    super();
    this.textContent = `${name}: ${branch.name} ${branch.commitDetails.message}`;
  }
}