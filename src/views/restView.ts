import { MagitState } from "../models/magitStatus";
import { TextView } from "./abstract/textView";

export class RestView extends TextView {

  private _lines: string[] = [];

  constructor(private magitStatus: MagitState) {
    super();

    this._lines.push(`Head: ${magitStatus._state.HEAD!.name} ${magitStatus.commitCache[magitStatus._state.HEAD!.commit!].message}`);
    this._lines.push('');

    this.textContent = this._lines.join('\n');
  }
}