import { View } from "./view";
import { Uri, EventEmitter, Disposable } from "vscode";

export abstract class DocumentView extends View implements Disposable {
  
  abstract dispose(): void;

  constructor(protected uri: Uri, protected emitter: EventEmitter<Uri>) {
    super();
  }

  public triggerUpdate() {
    this.emitter.fire(this.uri);
  }
}