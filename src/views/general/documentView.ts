import { View } from "./view";
import { Uri, EventEmitter, Disposable } from "vscode";

export abstract class DocumentView extends View {

  abstract encodeLocation(workspacePath: string): Uri;

  constructor(protected uri: Uri, protected emitter: EventEmitter<Uri>) {
    super();
  }

  public triggerUpdate() {
    this.emitter.fire(this.uri);
  }
}