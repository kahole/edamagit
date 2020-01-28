import { View } from './view';
import { Uri, EventEmitter } from 'vscode';
import { MagitRepository } from '../../models/magitRepository';

export abstract class DocumentView extends View {

  public emitter?: EventEmitter<Uri>;

  constructor(public uri: Uri) {
    super();
  }

  public abstract update(repository: MagitRepository): void;

  protected triggerUpdate() {
    if (this.emitter) {
      this.emitter.fire(this.uri);
    }
  }
}