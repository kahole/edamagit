import { View } from '../general/view';
import { TextView } from '../general/textView';
import { MagitBranch } from '../../models/magitBranch';
import GitTextUtils from '../../utils/gitTextUtils';

export class BranchHeaderView extends View {

  constructor(name: string, branch: MagitBranch) {
    super();
    const nameLabel = `${name}:`.padEnd(10);
    this.addSubview(new TextView(`${nameLabel}${branch.name ?? GitTextUtils.shortHash(branch.commit)} ${GitTextUtils.shortCommitMessage(branch.commitDetails.message)}`));
  }

  onClicked() { return undefined; }
}