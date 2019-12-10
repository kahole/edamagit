import * as vscode from 'vscode';
import MagitStatusView from './views/magitStatusView';
import { magitRepositories } from './extension';
import { View } from './views/abstract/view';

export default class ContentProvider implements vscode.TextDocumentContentProvider {

  static scheme = 'magit';

  private _onDidChange = new vscode.EventEmitter<vscode.Uri>();
  onDidChange = this._onDidChange.event;

  // private _documents = new Map<string, MagitStatusView>();

  // TODO: can be used for BOLD, gutter displays, and other bonus styles:
  // private _editorDecoration = vscode.window.createTextEditorDecorationType({ textDecoration: 'underline' });
  private _subscriptions: vscode.Disposable;

  constructor() {

    // Listen to the `closeTextDocument`-event which means we must
    // clear the corresponding View
    this._subscriptions = vscode.workspace.onDidCloseTextDocument(
      doc => magitRepositories[doc.uri.query].views!.delete(doc.uri.toString()));
  }

  dispose() {
    this._subscriptions.dispose();
    // this._documents.clear();
    // this._editorDecoration.dispose();
    this._onDidChange.dispose();
  }

  provideTextDocumentContent(uri: vscode.Uri): string | Thenable<string> {

    console.log("provide text content call");
    // already loaded?
    // let document = this._documents.get(uri.toString());
    // if (document) {
    // 	return document.value;
    // }

    let magitRepo = magitRepositories[uri.query];

    let statusView = new MagitStatusView(uri, magitRepo.magitState!, this._onDidChange);

    if (!magitRepo.views) {
      magitRepo.views = new Map<string, View>();
    }

    magitRepo.views!.set(uri.toString(), statusView);

    // this._documents.set(uri.toString(), statusView);
    return statusView.value;
  }

  // provideDocumentLinks(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.DocumentLink[] | undefined {
  // 	// While building the virtual document we have already created the links.
  // 	// Those are composed from the range inside the document and a target uri
  // 	// to which they point
  // 	const doc = this._documents.get(document.uri.toString());
  // 	if (doc) {
  // 		return doc.links;
  // 	}
  // }
}

let seq = 0;

export function encodeLocation(uri: string): vscode.Uri {
  const query = uri;
  return vscode.Uri.parse(`${ContentProvider.scheme}:status.magit?${query}`);
  //return vscode.Uri.parse(`${ContentProvider.scheme}:status.magit?${query}#${seq++}`);
}

// export function decodeLocation(uri: vscode.Uri): [vscode.Uri, vscode.Position] {
//   let [target, line, character] = <[string, number, number]>JSON.parse(uri.query);
//   return [vscode.Uri.parse(target), new vscode.Position(line, character)];
// }