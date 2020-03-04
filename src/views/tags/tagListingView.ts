import { Ref } from '../../typings/git';
import { TextView } from '../general/textView';

export class TagListingView extends TextView {

  get id() { return this.ref.name?.toString() + this.ref.type.toString(); }

  constructor(public ref: Ref) {
    super(`  ${ref.name}`);
  }
}