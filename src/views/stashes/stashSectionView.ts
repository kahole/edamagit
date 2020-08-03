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

  public get section() {
    return StashItemView.getSection(this.stash); 
  }

  private static getSection(stash: Stash) {
    return `stash@{${stash.index}}`;
  }

  constructor(public stash: Stash) {
    super(`${StashItemView.getSection(stash)} ${stash.description}`);
  }
}