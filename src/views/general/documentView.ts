import { View } from "./view";
import { Uri, EventEmitter, Disposable } from "vscode";

export abstract class DocumentView extends View implements Disposable {
  
  public abstract triggerUpdate(): void;
  abstract dispose(): void;

  constructor(protected uri: Uri, protected emitter: EventEmitter<Uri>) {
    super();
  }
}