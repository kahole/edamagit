import { View } from "./view";
import { Uri, EventEmitter, Disposable } from "vscode";

export abstract class DocumentView extends View {

  public emitter?: EventEmitter<Uri>;

  constructor(public uri: Uri) {
    super();
  }

  public triggerUpdate() {
    if (this.emitter) {
      this.emitter.fire(this.uri);
    }
  }
}