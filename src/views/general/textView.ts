import { View } from './view';
import { Range } from 'vscode';
import * as Constants from '../../common/constants';

export class TextView extends View {

  constructor(public textContent: string = '') {
    super();
  }

  render(startLineNumber: number, startColumnNumber: number): string {

    this.retrieveFold();

    const content = this.folded ? this.textContent.slice(0, this.textContent.indexOf('\n')) : this.textContent;
    const lines = content.split(Constants.LineSplitterRegex);
    this.range = new Range(
      startLineNumber,
      startColumnNumber,
      startLineNumber + lines.length - 1,
      lines.length === 1 ? startColumnNumber + lines[0].length : lines[lines.length - 1].length,
    );

    return content;
  }
}