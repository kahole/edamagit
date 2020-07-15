import { View } from './view';
import { Uri, EventEmitter } from 'vscode';
import { MagitState } from '../../models/magitState';
import * as Constants from '../../common/constants';

export abstract class DocumentView extends View {

  isHighlightable = false;

  public emitter?: EventEmitter<Uri>;
  needsUpdate: boolean = true;

  constructor(public uri: Uri) {
    super();
  }

  render(startLineNumber: number, startCharacterNumber: number) {
    let rendered = super.render(startLineNumber, startCharacterNumber);
    if (Constants.FinalLineBreakRegex.test(rendered)) {
      return rendered;
    }
    rendered += '\n';
    this.range = this.range.with(undefined, this.range.end.with(this.range.end.line + 1, 0));
    return rendered;
  }

  public abstract update(state: MagitState): void;

  public triggerUpdate() {
    if (this.emitter) {
      this.emitter.fire(this.uri);
    }
  }
}