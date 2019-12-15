import { View } from "./view";
import { Range, Position } from "vscode";
import * as Constants from '../../common/constants';

export class TextView extends View {

  constructor(public textContent: string = "") {
    super();
  }

  render(startLineNumber: number): string[] {

    let lines = this.textContent.split(Constants.LineSplitterRegex);
    this.range = new Range(startLineNumber, 0, startLineNumber+lines.length-1, lines[lines.length-1].length);

    return [this.textContent];
  }
}