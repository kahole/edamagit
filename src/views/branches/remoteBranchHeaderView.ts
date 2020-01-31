import { TextView } from '../general/textView';
import { MagitUpstreamRef } from '../../models/magitBranch';

export class RemoteBranchHeaderView extends TextView {

  constructor(name: string, upstreamRef: MagitUpstreamRef) {
    super();
    const nameLabel = `${name}:`.padEnd(10);
    this.textContent = `${nameLabel}${upstreamRef.remote}/${upstreamRef.name} ${upstreamRef.commit?.message}`;
  }
}