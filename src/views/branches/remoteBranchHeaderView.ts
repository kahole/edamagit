import { TextView } from '../general/textView';
import { UpstreamRef } from '../../typings/git';

export class RemoteBranchHeaderView extends TextView {

  constructor(name: string, upstreamRef: UpstreamRef) {
    super();
    // TODO: ${upstreamRef.commit.message} JUST FILL OUT THE MODEL A LITTLE MORE, WITH SOME COMMIT DETAILS. EASY ENOUGH
    // GitTextUtils.shortCommitMessage(
    this.textContent = `${name}: ${upstreamRef.remote}/${upstreamRef.name}`;
  }
}