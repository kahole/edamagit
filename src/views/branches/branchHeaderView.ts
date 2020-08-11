import { MagitBranch } from '../../models/magitBranch';
import GitTextUtils from '../../utils/gitTextUtils';
import { SemanticTextView, Token } from '../general/semanticTextView';
import { View } from '../general/view';

export class BranchHeaderView extends View {

  constructor(name: string, branch: MagitBranch) {
    super();
    const nameLabel = `${name}:`.padEnd(10);
    this.addSubview(
      new SemanticTextView(
        nameLabel,
        new Token(branch.name ?? GitTextUtils.shortHash(branch.commit), 'magit-ref-name'),
        ` ${GitTextUtils.shortCommitMessage(branch.commitDetails.message)}`
      )
    );
  }

  onClicked() { return undefined; }
}