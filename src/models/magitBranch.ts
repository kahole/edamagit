import { Branch, Commit } from "../typings/git";

export interface MagitBranch extends Branch {
  commitDetails: Commit;
}