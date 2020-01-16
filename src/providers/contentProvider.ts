import * as vscode from 'vscode';
import { views } from '../extension';
import * as Constants from '../common/constants';
import MagitStatusView from '../views/magitStatusView';
import { magitStatus } from '../commands/statusCommands';

export default class ContentProvider implements vscode.TextDocumentContentProvider {

  private viewUpdatedEmitter = new vscode.EventEmitter<vscode.Uri>();
  onDidChange: vscode.Event<vscode.Uri>;

  private _subscriptions: vscode.Disposable;

  constructor() {

    this.onDidChange = this.viewUpdatedEmitter.event;

    this._subscriptions = vscode.Disposable.from(
      vscode.workspace.onDidCloseTextDocument(
        doc => {
          if (doc.uri.scheme === Constants.MagitUriScheme) {
            views.delete(doc.uri.toString());
          }
        }),
      vscode.workspace.onDidSaveTextDocument(
        doc => {
          for (let visibleEditor of vscode.window.visibleTextEditors) {
            if (visibleEditor.document.uri.scheme == Constants.MagitUriScheme) {
              return magitStatus(true);
            }
          }
        }));
  }

  dispose() {
    this._subscriptions.dispose();
    this.viewUpdatedEmitter.dispose();
  }

  provideTextDocumentContent(uri: vscode.Uri): string | Thenable<string> {

    const view = views.get(uri.toString());

    if (view) {
      view.emitter = this.viewUpdatedEmitter;
      return view.render(0).join('\n');
    }
    return '';
  }
}