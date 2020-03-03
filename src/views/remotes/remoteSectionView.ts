import { View } from '../general/view';
import { Section, SectionHeaderView } from '../general/sectionHeader';
import { LineBreakView } from '../general/lineBreakView';
import { RemoteListingView } from './remoteListingView';
import { MagitRemote } from '../../models/magitRemote';

export class RemoteSectionView extends View {
  isFoldable = true;

  get id() { return `${Section.Remote.toString()} ${this.remote.name} (${this.remote.fetchUrl ?? this.remote.pushUrl})`; }

  constructor(private remote: MagitRemote) {
    super();
    this.subViews = [
      new SectionHeaderView(Section.Remote, remote.branches.length, `${remote.name} (${remote.fetchUrl ?? remote.pushUrl})`),
      ...remote.branches.map(branch => new RemoteListingView(branch)),
      new LineBreakView()
    ];
  }
}