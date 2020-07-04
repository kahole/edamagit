import { View } from './view';
import { TextView } from './textView';

export class LineBreakView extends View {

  constructor(number: number = 1) {
    super();
    this.addSubview(new TextView('\n'.repeat(number - 1)));
  }
}