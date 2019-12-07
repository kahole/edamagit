import * as vscode from 'vscode';
import StatusDocument from './documents/statusDocument';
import { MagitState } from './model/magitStatus';
import { magitStates } from './extension';

export default class ContentProvider implements vscode.TextDocumentContentProvider {

  static scheme = 'magit';

  private _onDidChange = new vscode.EventEmitter<vscode.Uri>();
  private _documents = new Map<string, StatusDocument>();
  private _editorDecoration = vscode.window.createTextEditorDecorationType({ textDecoration: 'underline' });
  private _subscriptions: vscode.Disposable;

  constructor() {

    // Listen to the `closeTextDocument`-event which means we must
    // clear the corresponding model object - `ReferencesDocument`
    this._subscriptions = vscode.workspace.onDidCloseTextDocument(doc => this._documents.delete(doc.uri.toString()));
  }

  dispose() {
    this._subscriptions.dispose();
    this._documents.clear();
    this._editorDecoration.dispose();
    this._onDidChange.dispose();
  }

  // Expose an event to signal changes of _virtual_ documents
  // to the editor
  get onDidChange() {
    return this._onDidChange.event;
  }

  // Provider method that takes an uri of the `references`-scheme and
  // resolves its content by (1) running the reference search command
  // and (2) formatting the results
  provideTextDocumentContent(uri: vscode.Uri): string | Thenable<string> {

    // already loaded?
    // let document = this._documents.get(uri.toString());
    // if (document) {
    // 	return document.value;
    // }

    // Decode target-uri and target-position from the provided uri and execute the
    // `reference provider` command (https://code.visualstudio.com/api/references/commands).
    // From the result create a references document which is in charge of loading,
    // printing, and formatting references
    let document = new StatusDocument(uri, magitStates[uri.query], this._onDidChange);

    this._documents.set(uri.query, document);
    return document.value;
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