import { View } from './view';
import { Range } from 'vscode';
import * as Constants from '../../common/constants';

export class TextView extends View {

  constructor(public textContent: string = '') {
    super();
  }

  render(startLineNumber: number): string[] {

    this.retrieveFold();

    const lines = this.textContent.split(Constants.LineSplitterRegex);
    this.range = new Range(startLineNumber, 0, startLineNumber + lines.length - 1, lines[lines.length - 1].length);

    return [this.folded ? lines[0] : this.textContent];
  }
}

export class UnclickableTextView extends TextView {
  onClicked() { return undefined; }
}