import { TextView } from '../general/textView';
import { UpstreamRef } from '../../typings/git';

export class RemoteBranchHeaderView extends TextView {

  constructor(name: string, upstreamRef: UpstreamRef) {
    super();
    // TODO: ${upstreamRef.commit.message}
    // repository.state.refs INNEHOLDER commit hashen for f.eks refs: [{ name: 'origin/master', commit: 'blabla'}]
    // LOSNING: MagitBranch blir egen model. Ikke noe arv fra noe den git modellen.
    // GitTextUtils.shortCommitMessage(
    const nameLabel = `${name}:`.padEnd(10);
    this.textContent = `${nameLabel}${upstreamRef.remote}/${upstreamRef.name}`;
  }
}