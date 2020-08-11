import { MagitUpstreamRef } from '../../models/magitBranch';
import GitTextUtils from '../../utils/gitTextUtils';
import { SemanticTokenTypes } from '../../common/constants';
import { SemanticTextView, Token } from '../general/semanticTextView';

export class RemoteBranchHeaderView extends SemanticTextView {

  constructor(name: string, upstreamRef: MagitUpstreamRef) {
    super(
      `${name}:`.padEnd(10),
      new Token(`${upstreamRef.remote}/${upstreamRef.name}`, SemanticTokenTypes.RemoteRefName),
      ` ${GitTextUtils.shortCommitMessage(upstreamRef.commit?.message)}`
    );
  }
}