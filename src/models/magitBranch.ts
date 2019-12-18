import { Branch, Commit, UpstreamRef } from "../typings/git";

export interface MagitBranch extends Branch {
  commitDetails: Commit;
  pushRemote?: UpstreamRef;
}