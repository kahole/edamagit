import { TextView } from './textView';

export class PlainTextView extends TextView {

  isClickable = false;
  newlineByDefault = false;

  constructor(public textContent: string = '') {
    super(textContent);
  }

  onClicked() { return undefined; }
}
