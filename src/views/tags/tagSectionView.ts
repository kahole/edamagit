import { View } from '../general/view';
import { Section, SectionHeaderView } from '../general/sectionHeader';
import { TagListingView } from './tagListingView';
import { Ref } from '../../typings/git';

export class TagSectionView extends View {
  isFoldable = true;
  afterMargin = 1;

  get id() { return Section.Tags.toString(); }

  constructor(tags: Ref[]) {
    super();
    this.subViews = [
      new SectionHeaderView(Section.Tags, tags.length),
      ...tags.map(tag => new TagListingView(tag)),
    ];
  }
}