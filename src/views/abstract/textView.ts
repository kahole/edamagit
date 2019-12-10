import { View } from "./view";
import { Range, Position } from "vscode";
import * as Constants from '../../common/constants';

export abstract class TextView extends View {

  textContent: string = "";

  render(startLineNumber: number): string[] {

    let lines = this.textContent.split(Constants.LineSplitterRegex);
    this.range = new Range(startLineNumber, 0, startLineNumber+lines.length-1, lines[lines.length-1].length);

    return [this.textContent];
  }
}