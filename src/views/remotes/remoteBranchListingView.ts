import { Ref } from '../../typings/git';
import { TextView } from '../general/textView';

export class RemoteBranchListingView extends TextView {

  get id() { return this.ref.name?.toString() + this.ref.type.toString(); }

  constructor(public ref: Ref) {
    super();

    const [remote, ...nameParts] = ref.name?.split('/') ?? [];
    const name = nameParts.join('/');

    this.textContent = `  ${name}`;
  }
}