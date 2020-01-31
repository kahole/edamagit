import { Branch, Commit, UpstreamRef, Ref } from '../typings/git';

export interface MagitBranch extends Branch {
  commitDetails: Commit;
  upstreamRemote: MagitUpstreamRef;
  pushRemote?: MagitUpstreamRef;
  commitsAhead?: Commit[];
  commitsBehind?: Commit[];
  tag?: Ref;
}

export interface MagitUpstreamRef extends UpstreamRef {
  commit?: Commit;
}