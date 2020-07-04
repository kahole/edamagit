import { Ref } from '../../typings/git';
import { View } from '../general/view';
import { TextView } from '../general/textView';

export class BranchListingView extends View {

  get id() { return this.ref.name?.toString() + this.ref.type.toString(); }

  constructor(public ref: Ref, active = false) {
    super();
    this.addSubview(new TextView(`${active ? '*' : ' '} ${ref.name}`));
  }
}