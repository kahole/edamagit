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
        // TODO: this is some fucking bullshit
        //  how tf can i check if a view is open or not then?
        doc => {
          if (doc.uri.scheme === Constants.MagitUriScheme) {
            views.delete(doc.uri.toString());
          }
        }),
      vscode.workspace.onDidSaveTextDocument(
        doc => {
          let statusViewOpen = false;
          views.forEach((view) => {
            if (view instanceof MagitStatusView) {
              statusViewOpen = true;
            }
          });
          if (statusViewOpen) {
            // magitStatus(true);
          }
        }));
  }

  dispose() {
    this._subscriptions.dispose();
    // this._documents.clear();
    // this._editorDecoration.dispose();
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