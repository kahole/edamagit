import * as vscode from 'vscode';
import { views } from '../extension';
import * as Constants from '../common/constants';
import FilePathUtils from '../utils/filePathUtils';
import MagitUtils from '../utils/magitUtils';
import DecorationUtils from '../utils/decorateUtils';

export default class ContentProvider implements vscode.TextDocumentContentProvider {

  public viewUpdatedEmitter = new vscode.EventEmitter<vscode.Uri>();
  onDidChange: vscode.Event<vscode.Uri>;

  private _subscriptions: vscode.Disposable;

  private _decoratedEditors: Set<vscode.TextEditor> = new Set();

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
        async doc => {
          for (const visibleEditor of vscode.window.visibleTextEditors) {
            if (visibleEditor.document.uri.scheme === Constants.MagitUriScheme) {
              if (FilePathUtils.isDescendant(visibleEditor.document.uri.query, doc.uri.fsPath)) {
                const repository = await MagitUtils.getCurrentMagitRepo(visibleEditor.document.uri);
                if (!repository) {
                  return;
                }
                return MagitUtils.magitStatusAndUpdate(repository);
              }
            }
          }
        }),
      vscode.workspace.onDidChangeTextDocument(event => {
        const editor = vscode.window.activeTextEditor;
        if (editor && event.document === editor.document) {
          DecorationUtils.decorateWordLevelDiff(editor);
        }
      }),
      vscode.window.onDidChangeVisibleTextEditors(editors => {
        for (const editor of editors) {
          if (editor && editor.document.uri.scheme === Constants.MagitUriScheme) {
            if (!this._decoratedEditors.has(editor)) {
              this._decoratedEditors.add(editor);
              DecorationUtils.decorateWordLevelDiff(editor);
            }
          }
        }
      }));
  }

  dispose() {
    this._subscriptions.dispose();
    this._decoratedEditors.clear();
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