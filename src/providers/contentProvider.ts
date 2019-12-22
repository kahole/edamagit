import * as vscode from 'vscode';
import MagitStatusView from '../views/magitStatusView';
import { magitRepositories } from '../extension';
import { View } from '../views/general/view';
import { DocumentView } from '../views/general/documentView';
import MagitStagedView from '../views/stagedView';
import * as Constants from "../common/constants";

export default class ContentProvider implements vscode.TextDocumentContentProvider {

  private _onDidChange = new vscode.EventEmitter<vscode.Uri>();
  onDidChange = this._onDidChange.event;

  private _subscriptions: vscode.Disposable;

  constructor() {

    this._subscriptions = vscode.workspace.onDidCloseTextDocument(
      doc => {
        if (doc.uri.scheme === Constants.MagitUriScheme) {
          magitRepositories.get(doc.uri.query)?.views?.delete(doc.uri.toString());
        }
      });
  }

  dispose() {
    this._subscriptions.dispose();
    // this._documents.clear();
    // this._editorDecoration.dispose();
    this._onDidChange.dispose();
  }

  provideTextDocumentContent(uri: vscode.Uri): string | Thenable<string> {

    // TODO: caching of documents?
    //   if document with uri is still open, what happens
    //   if document is closed, should it be deleted?
    //     if not, how to utilize cached views

    // already loaded?
    // let document = this._documents.get(uri.toString());
    // if (document) {
    // 	return document.value;
    // }

    console.log("call to provide");

    let magitRepo = magitRepositories.get(uri.query);

    if (magitRepo) {

      let documentView: DocumentView | undefined;

      if (magitRepo.views === undefined) {
        magitRepo.views = new Map<string, View>();
      }

      // Multiplexing should happen here

      switch (uri.path) {
        case MagitStatusView.UriPath:
          documentView = new MagitStatusView(uri, this._onDidChange, magitRepo.magitState!);
          break;
        case MagitStagedView.UriPath:
          documentView = new MagitStagedView(uri, this._onDidChange, magitRepo.magitState!);
          break;

        default:
          break;
      }

      if (documentView) {
        magitRepo.views.set(uri.toString(), documentView);
        return documentView.render(0).join('\n');
      }

    }
    // End multiplexing
    return "";
  }
}