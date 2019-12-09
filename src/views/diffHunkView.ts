import { View } from "./view";
import { Position } from "vscode";
import { MagitChangeHunk } from "../models/magitChangeHunk";

export class DiffHunkView extends View {

  constructor(private changeHunk: MagitChangeHunk) {
    super();
  }

  render(): string[] {
    return [this.changeHunk.diff];
  }

  onClickedPosition(position: Position) : any {

  }
}