import { TextView } from '../general/textView';
import { MagitBranch } from '../../models/magitBranch';
import GitTextUtils from '../../utils/gitTextUtils';

export class BranchHeaderView extends TextView {

  constructor(name: string, branch: MagitBranch) {
    super();
    const nameLabel = `${name}:`.padEnd(10);
    this.textContent = `${nameLabel}${branch.name ?? GitTextUtils.shortHash(branch.commit)} ${GitTextUtils.shortCommitMessage(branch.commitDetails.message)}`;
  }

  onClicked() { return undefined; }
}