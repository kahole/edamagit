import * as vscode from 'vscode';
import { views } from '../extension';
import HighlightDecorator from './highlightDecorator';

export default class HighlightProvider implements vscode.DocumentHighlightProvider {

  dispose() { }

  provideDocumentHighlights(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.DocumentHighlight[]> {

    // const highlights: vscode.DocumentHighlight[] = [];

    const currentView = views.get(document.uri.toString());
    if (currentView) {
      const clickedView = currentView.click(position);
      if (clickedView?.isHighlightable) {
        // highlights.push(new vscode.DocumentHighlight(clickedView.range, vscode.DocumentHighlightKind.Text));

        // TODO: activeTextEditor is probably not good enough here
        HighlightDecorator.applyHoverDecorations(vscode.window.activeTextEditor!, clickedView.range);
        return [];
      }
    }
    // return highlights;

    HighlightDecorator.removeHoverDecorations(vscode.window.activeTextEditor!);

    return [];
  }
}
