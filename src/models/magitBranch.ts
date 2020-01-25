import { Branch, Commit, UpstreamRef, Ref } from '../typings/git';

export interface MagitBranch extends Branch {
  commitDetails: Commit;
  pushRemote?: UpstreamRef;
  commitsAhead?: Commit[];
  commitsBehind?: Commit[];
  tag?: Ref;
}