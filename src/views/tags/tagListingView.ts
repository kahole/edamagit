import { View } from '../general/view';
import { Ref } from '../../typings/git';
import { TextView } from '../general/textView';

export class TagListingView extends View {

  get id() { return this.tag.name?.toString() + this.tag.type.toString(); }

  constructor(public tag: Ref) {
    super();

    this.addSubview(
      new TextView(`  ${tag.name}`)
    );
  }
}