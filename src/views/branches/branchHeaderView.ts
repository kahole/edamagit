import { TextView } from '../general/textView';
import { MagitBranch } from '../../models/magitBranch';
import GitTextUtils from '../../utils/gitTextUtils';

export class BranchHeaderView extends TextView {

  constructor(name: string, branch: MagitBranch) {
    super();
    this.textContent = `${name}: ${branch.name} ${GitTextUtils.shortCommitMessage(branch.commitDetails.message)}`;
  }
}