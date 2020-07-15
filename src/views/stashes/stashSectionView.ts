import { View } from '../general/view';
import { Section, SectionHeaderView } from '../general/sectionHeader';
import { Stash } from '../../common/gitApiExtensions';
import { TextView } from '../general/textView';

export class StashSectionView extends View {
  isFoldable = true;
  afterMargin = 1;

  get id() { return Section.Stashes.toString(); }

  constructor(stashes: Stash[]) {
    super();
    this.subViews = [
      new SectionHeaderView(Section.Stashes, stashes.length),
      ...stashes.map(stash => new StashItemView(stash)),
    ];
  }
}

export class StashItemView extends View {

  constructor(public stash: Stash) {
    super();
    this.addSubview(new TextView(`stash@{${stash.index}} ${stash.description}`));
  }
}