import { View } from './view';
import { Uri, EventEmitter } from 'vscode';
import { MagitState } from '../../models/magitState';

export abstract class DocumentView extends View {

  public emitter?: EventEmitter<Uri>;
  needsUpdate: boolean = true;

  constructor(public uri: Uri) {
    super();
  }

  public abstract update(state: MagitState): void;

  public triggerUpdate() {
    if (this.emitter) {
      this.emitter.fire(this.uri);
    }
  }
}