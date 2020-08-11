import { View } from '../general/view';
import { BranchHeaderView } from './branchHeaderView';
import { RemoteBranchHeaderView } from './remoteBranchHeaderView';
import { TextView } from '../general/textView';
import { MagitBranch } from '../../models/magitBranch';
import { SemanticTextView, Token } from '../general/semanticTextView';
import { SemanticTokenTypes } from '../../common/constants';

export class BranchHeaderSectionView extends View {
  isFoldable = true;

  get id() { return 'HEAD_section'; }

  constructor(HEAD?: MagitBranch) {
    super();
    if (HEAD?.commitDetails) {
      this.addSubview(new BranchHeaderView('Head', HEAD));

      if (HEAD.upstreamRemote) {
        this.addSubview(new RemoteBranchHeaderView(HEAD.upstreamRemote.rebase ? 'Rebase' : 'Merge', HEAD.upstreamRemote));
      }

      if (HEAD.pushRemote) {
        this.addSubview(new RemoteBranchHeaderView('Push', HEAD.pushRemote));
      }

      if (HEAD.tag?.name) {
        this.addSubview(new SemanticTextView('Tag: '.padEnd(10), new Token(HEAD.tag.name!, SemanticTokenTypes.TagName)));
      }
    } else {
      this.addSubview(new TextView('In the beginning there was darkness'));
    }
  }
}