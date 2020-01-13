import { TextView } from "../general/textView";
import { MagitBranch } from "../../models/magitBranch";
import { UpstreamRef } from "../../typings/git";

export class RemoteBranchHeaderView extends TextView {

  constructor(name: string, upstreamRef: UpstreamRef) {
    super();
    // TODO: ${upstreamRef.commit.message}
    this.textContent = `${name}: ${upstreamRef.remote}/${upstreamRef.name}`;
  }
}