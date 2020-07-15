import { View } from '../general/view';
import { Section, SectionHeaderView } from '../general/sectionHeader';
import { RemoteBranchListingView } from './remoteBranchListingView';
import { MagitRemote } from '../../models/magitRemote';

export class RemoteSectionView extends View {
  isFoldable = true;
  afterMargin = 1;

  get id() { return `${Section.Remote.toString()} ${this.remote.name} (${this.remote.fetchUrl ?? this.remote.pushUrl})`; }

  constructor(private remote: MagitRemote) {
    super();
    this.subViews = [
      new SectionHeaderView(Section.Remote, remote.branches.length, `${remote.name} (${remote.fetchUrl ?? remote.pushUrl})`),
      ...remote.branches.map(branch => new RemoteBranchListingView(branch)),
    ];
  }
}