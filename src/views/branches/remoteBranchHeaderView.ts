import { TextView } from '../general/textView';
import { UpstreamRef } from '../../typings/git';

export class RemoteBranchHeaderView extends TextView {

  constructor(name: string, upstreamRef: UpstreamRef) {
    super();
    // TODO: ${upstreamRef.commit.message} PROPER COMMIT CACHE IMPLEMENTATION CAN SOLVE ALL OF THIS I THINK. GLOBAL CACHE?
    this.textContent = `${name}: ${upstreamRef.remote}/${upstreamRef.name}`;
  }
}