import { View } from '../general/view';
import { TextView } from '../general/textView';
import { MagitUpstreamRef } from '../../models/magitBranch';
import GitTextUtils from '../../utils/gitTextUtils';

export class RemoteBranchHeaderView extends View {

  constructor(name: string, upstreamRef: MagitUpstreamRef) {
    super();
    const nameLabel = `${name}:`.padEnd(10);
    this.addSubview(new TextView(`${nameLabel}${upstreamRef.remote}/${upstreamRef.name} ${GitTextUtils.shortCommitMessage(upstreamRef.commit?.message)}`));
  }
}