import { View } from '../general/view';
import { TextView } from '../general/textView';
import { TokenView } from '../general/tokenView';
import { MagitUpstreamRef } from '../../models/magitBranch';
import GitTextUtils from '../../utils/gitTextUtils';

export class RemoteBranchHeaderView extends View {

  constructor(name: string, upstreamRef: MagitUpstreamRef) {
    super();
    const nameLabel = `${name}:`.padEnd(10);
    this.addSubview(new TextView(`${nameLabel }`));
    this.addSubview(new TokenView(`${upstreamRef.remote}/${upstreamRef.name}`, 'magit-remote-ref-name'));
    this.addSubview(new TextView(` ${GitTextUtils.shortCommitMessage(upstreamRef.commit?.message)}`));
  }
}