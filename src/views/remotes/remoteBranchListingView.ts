import { Ref } from '../../typings/git';
import { View } from '../general/view';
import { TextView } from '../general/textView';

export class RemoteBranchListingView extends View {

  get id() { return this.ref.name?.toString() + this.ref.type.toString(); }

  constructor(public ref: Ref) {
    super();

    const [remote, ...nameParts] = ref.name?.split('/') ?? [];
    const name = nameParts.join('/');

    this.addSubview(new TextView(`  ${name}`));
  }
}