import * as vscode from 'vscode';
import MagitStatusView from '../views/magitStatusView';
import { magitRepositories } from '../extension';
import { View } from '../views/general/view';

export default class ContentProvider implements vscode.TextDocumentContentProvider {

  static scheme = 'magit';

  private _onDidChange = new vscode.EventEmitter<vscode.Uri>();
  onDidChange = this._onDidChange.event;

  // TODO: can be used for BOLD, gutter displays, and other bonus styles:
  // private _editorDecoration = vscode.window.createTextEditorDecorationType({ textDecoration: 'underline' });

  // private _subscriptions: vscode.Disposable;

  constructor() {

    // TODO: VIEW DELETION
    // Might not need to delete all views. Keep magitStatus view?
    //                             and then just update
    //   might wanna delete other types of views though

    // this._subscriptions = vscode.workspace.onDidCloseTextDocument(
      // doc => magitRepositories[doc.uri.query].views!.delete(doc.uri.toString()));
  }

  // TODO: manage dispose properly
  dispose() {
    // this._subscriptions.dispose();
    // this._documents.clear();
    // this._editorDecoration.dispose();
    this._onDidChange.dispose();
  }

  provideTextDocumentContent(uri: vscode.Uri): string | Thenable<string> {

    // already loaded?
    // let document = this._documents.get(uri.toString());
    // if (document) {
    // 	return document.value;
    // }

    let magitRepo = magitRepositories[uri.query];

    if (!magitRepo.views) {
      magitRepo.views = new Map<string, View>();
    }

    let statusView = new MagitStatusView(uri, this._onDidChange, magitRepo.magitState!);
    magitRepo.views.set(uri.toString(), statusView);

    return statusView.render(0).join('\n');
  }

  // TODO: links might be useful
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

// TODO: 
//  - Creation of new views shouldnt be done from this class
//  - Only getting views from view stock based on uri.
//  - Uri generation should probably happen in the view class itself
//    or somewhere else
// - This way to perfect multiplexing
// Updating:
//  - View lifecycle management: care about existing views?
//       simpler to just replace
//  - Need to get onDidChange into the views somehow.
//  - Maybe this class should be responsible for all view creation after all.. hmm

export function encodeLocation(uri: string): vscode.Uri {
  const query = uri;
  return vscode.Uri.parse(`${ContentProvider.scheme}:status.magit?${query}`);
  //return vscode.Uri.parse(`${ContentProvider.scheme}:status.magit?${query}#${seq++}`);
}

// export function decodeLocation(uri: vscode.Uri): [vscode.Uri, vscode.Position] {
//   let [target, line, character] = <[string, number, number]>JSON.parse(uri.query);
//   return [vscode.Uri.parse(target), new vscode.Position(line, character)];
// }