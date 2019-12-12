import { View } from "./view";
import { Uri, EventEmitter } from "vscode";

export abstract class DocumentView extends View {

  public abstract triggerUpdate(): void;

  constructor(protected uri: Uri, protected emitter: EventEmitter<Uri>) {
    super();
  }
}