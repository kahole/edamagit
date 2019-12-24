import * as vscode from 'vscode';
import { views } from '../extension';
import * as Constants from "../common/constants";

export default class ContentProvider implements vscode.TextDocumentContentProvider {

  private viewUpdatedEmitter = new vscode.EventEmitter<vscode.Uri>();
  onDidChange: vscode.Event<vscode.Uri>;

  private _subscriptions: vscode.Disposable;

  constructor() {

    this.onDidChange = this.viewUpdatedEmitter.event;

    this._subscriptions = vscode.workspace.onDidCloseTextDocument(
      doc => {
        if (doc.uri.scheme === Constants.MagitUriScheme) {
          views.delete(doc.uri.toString());
        }
      });
  }

  dispose() {
    this._subscriptions.dispose();
    // this._documents.clear();
    // this._editorDecoration.dispose();
    this.viewUpdatedEmitter.dispose();
  }

  provideTextDocumentContent(uri: vscode.Uri): string | Thenable<string> {

    console.log("call to provide");

    const view = views.get(uri.toString());

    if (view) {
      view.emitter = this.viewUpdatedEmitter;
      return view.render(0).join('\n');
    }
    return "";
  }
}