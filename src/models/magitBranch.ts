import { Branch, Commit, UpstreamRef, Ref } from '../typings/git';

export interface MagitBranch extends Branch {
  commitDetails: Commit;
  upstreamRemote?: MagitUpstreamRef;
  pushRemote?: MagitUpstreamRef;
  tag?: Ref;
}

export interface MagitUpstreamRef extends UpstreamRef {
  commit?: Commit;
  commitsAhead?: Commit[];
  commitsBehind?: Commit[];
}