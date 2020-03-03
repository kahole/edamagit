import { View } from '../general/view';
import { Ref } from '../../typings/git';
import { TextView } from '../general/textView';

export class BranchListingView extends View {

  get id() { return this.branch.name?.toString() + this.branch.type.toString(); }

  constructor(public branch: Ref, active = false) {
    super();

    this.addSubview(
      new TextView(`${active ? '*' : ' '} ${branch.name}`)
    );
  }
}