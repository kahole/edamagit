import { MagitBranch } from '../../models/magitBranch';
import GitTextUtils from '../../utils/gitTextUtils';
import { SemanticTextView, Token } from '../general/semanticTextView';
import { SemanticTokenTypes } from '../../common/constants';

export class BranchHeaderView extends SemanticTextView {

  constructor(name: string, branch: MagitBranch) {
    super(
      `${name}:`.padEnd(10),
      new Token(branch.name ?? GitTextUtils.shortHash(branch.commit), SemanticTokenTypes.RefName),
      ` ${GitTextUtils.shortCommitMessage(branch.commitDetails.message)}`
    );
  }

  onClicked() { return undefined; }
}