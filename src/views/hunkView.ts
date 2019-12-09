import { Position } from "vscode";
import { MagitChangeHunk } from "../models/magitChangeHunk";
import { TextView } from "./textView";

export class HunkView extends TextView {

  constructor(private changeHunk: MagitChangeHunk) {
    super();
    this.content = changeHunk.diff;
  }

  onClickedPosition(position: Position) : any {

  }
}