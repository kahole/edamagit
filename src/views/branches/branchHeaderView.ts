import { View } from '../general/view';
import { TextView } from '../general/textView';
import { MagitBranch } from '../../models/magitBranch';
import GitTextUtils from '../../utils/gitTextUtils';
import { TokenView } from '../general/tokenView';

export class BranchHeaderView extends View {

  constructor(name: string, branch: MagitBranch) {
    super();
    const nameLabel = `${name}:`.padEnd(10);
    this.addSubview(new TextView(nameLabel));
    this.addSubview(new TokenView(branch.name ?? GitTextUtils.shortHash(branch.commit), 'magit-ref-name'));
    this.addSubview(new TextView(` ${GitTextUtils.shortCommitMessage(branch.commitDetails.message)}`));
  }

  onClicked() { return undefined; }
}