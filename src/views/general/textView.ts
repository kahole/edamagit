import { View } from './view';
import { Range } from 'vscode';
import * as Constants from '../../common/constants';

export class TextView extends View {

  isHighlightable = false;

  constructor(public textContent: string = '') {
    super();
  }

  render(startLineNumber: number, startCharacterNumber: number): string {
    const lines = this.textContent.split(Constants.LineSplitterRegex);
    this.range = new Range(
      startLineNumber,
      startCharacterNumber,
      startLineNumber + lines.length - 1,
      lines.length === 1 ? startCharacterNumber + lines[0].length : lines[lines.length - 1].length,
    );
    return this.textContent;
  }

  onClicked() { return undefined; }
}