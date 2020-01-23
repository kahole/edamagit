import { TextView } from '../general/textView';
import { UpstreamRef } from '../../typings/git';

export class RemoteBranchHeaderView extends TextView {

  constructor(name: string, upstreamRef: UpstreamRef) {
    super();
    // TODO: ${upstreamRef.commit.message}
    // repository.state.refs INNEHOLDER commit hashen for f.eks refs: [{ name: 'origin/master', commit: 'blabla'}]
    // LOSNING: MagitBranch blir egen model. Ikke noe arv fra noe den git modellen.
    // GitTextUtils.shortCommitMessage(
    this.textContent = `${name}: ${upstreamRef.remote}/${upstreamRef.name}`;
  }
}