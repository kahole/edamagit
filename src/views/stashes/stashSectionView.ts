import { View } from "../abstract/view";
import { Section, SectionHeaderView } from "../sectionHeader";
import { LineBreakView } from "../lineBreakView";
import { Stash } from "../../common/gitApiExtensions";
import { TextView } from "../abstract/textView";

export class StashSectionView extends View {
  isFoldable = true;

  constructor(private stashes: Stash[]) {
    super();
    this.subViews = [
      new SectionHeaderView(Section.Stashes, stashes.length),
      ...stashes.map(stash => new StashItemView(stash)),
      new LineBreakView()
    ];
  }
}

export class StashItemView extends TextView {

  constructor (private stash: Stash) {
    super();
    this.textContent = `stash@{${stash.index}} ${stash.description}`;
  }
}