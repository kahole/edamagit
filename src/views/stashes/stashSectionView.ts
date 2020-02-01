import { View } from '../general/view';
import { Section, SectionHeaderView } from '../general/sectionHeader';
import { Stash } from '../../common/gitApiExtensions';
import { TextView } from '../general/textView';
import { LineBreakView } from '../general/lineBreakView';

export class StashSectionView extends View {
  isFoldable = true;

  get id() { return Section.Stashes.toString(); }

  constructor(stashes: Stash[]) {
    super();
    this.subViews = [
      new SectionHeaderView(Section.Stashes, stashes.length),
      ...stashes.map(stash => new StashItemView(stash)),
      new LineBreakView()
    ];
  }
}

export class StashItemView extends TextView {

  constructor(public stash: Stash) {
    super();
    this.textContent = `stash@{${stash.index}} ${stash.description}`;
  }
}