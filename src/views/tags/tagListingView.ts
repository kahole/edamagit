import { Ref } from '../../typings/git';
import { View } from '../general/view';
import { TextView } from '../general/textView';

export class TagListingView extends View {

  get id() { return this.ref.name?.toString() + this.ref.type.toString(); }

  constructor(public ref: Ref) {
    super();
    this.addSubview(new TextView(`  ${ref.name}`));
  }
}