import { Ref } from '../../typings/git';
import { TextView } from '../general/textView';

export class BranchListingView extends TextView {

  get id() { return this.ref.name?.toString() + this.ref.type.toString(); }

  constructor(public ref: Ref, active = false) {
    super(`${active ? '*' : ' '} ${ref.name}`);
  }
}