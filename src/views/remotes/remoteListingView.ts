import { View } from '../general/view';
import { Ref } from '../../typings/git';
import { TextView } from '../general/textView';

export class RemoteListingView extends View {

  get id() { return this.branch.name?.toString() + this.branch.type.toString(); }

  constructor(public branch: Ref) {
    super();

    const [remote, ...nameParts] = branch.name?.split('/') ?? [];
    const name = nameParts.join('/');

    this.addSubview(
      new TextView(`  ${name}`)
    );
  }
}