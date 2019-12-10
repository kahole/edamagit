import { MagitState } from "../models/magitStatus";
import { TextView } from "./abstract/textView";

export class RestView extends TextView {

  private _lines: string[] = [];
  private readonly SECTION_FOLD_REGION_END: string = '.';

  constructor(private magitStatus: MagitState) {
    super();

    this._lines.push(`Head: ${magitStatus._state.HEAD!.name} ${magitStatus.commitCache[magitStatus._state.HEAD!.commit!].message}`);
    this._lines.push('');
    
    if (magitStatus.stashes) {
      this._lines.push(`Stashes (${magitStatus.stashes.length})`);
      magitStatus.stashes
        .forEach(stash => {
          this._lines.push(`stash@{${stash.index}} ${stash.description}`);
        });
      this._lines.push(this.SECTION_FOLD_REGION_END);
    }

    if (magitStatus.log) {
      this._lines.push(`Recent commits`);
      magitStatus.log
        .forEach(commit => {
          this._lines.push(`${commit.hash.slice(0, 7)} ${commit.message}`);
        });
      this._lines.push(this.SECTION_FOLD_REGION_END);
    }

    this._lines.push('');


    this.textContent = this._lines.join('\n');
  }

  onClicked(): any {
    return "rest view";
  }
}