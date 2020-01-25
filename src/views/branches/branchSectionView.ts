import { View } from '../general/view';
import { MagitState } from '../../models/magitState';
import { BranchHeaderView } from './branchHeaderView';
import { RemoteBranchHeaderView } from './remoteBranchHeaderView';
import { TextView } from '../general/textView';
import { MagitBranch } from '../../models/magitBranch';

export class BranchSectionView extends View {
  isFoldable = true;

  constructor(HEAD?: MagitBranch) {
    super();
    if (HEAD?.commit) {
      this.addSubview(new BranchHeaderView('Head', HEAD));

      if (HEAD.upstream) {
        this.addSubview(new RemoteBranchHeaderView('Merge', HEAD.upstream));
      }

      if (HEAD.pushRemote) {
        this.addSubview(new RemoteBranchHeaderView('Push', HEAD.pushRemote));
      }

      if (HEAD.tag) {
        this.addSubview(new TextView('Tag: '.padEnd(10) + HEAD.tag.name));
      }
    } else {
      this.addSubview(new TextView('In the beginning there was darkness'));
    }
  }
}