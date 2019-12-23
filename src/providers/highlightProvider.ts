import * as vscode from 'vscode';
import MagitUtils from '../utils/magitUtils';
import { views } from '../extension';

export default class HighlightProvider implements vscode.DocumentHighlightProvider {

  dispose() { }

  provideDocumentHighlights(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.DocumentHighlight[]> {

    let highlights: vscode.DocumentHighlight[] = [];

    let currentRepository = MagitUtils.getCurrentMagitRepo(document);

    if (currentRepository) {
      let currentView = views.get(document.uri.toString());
      if (currentView) {
        let clickedView = currentView.click(position);
        if (clickedView) {
          highlights.push(new vscode.DocumentHighlight(clickedView.range, vscode.DocumentHighlightKind.Text));
        }
      }
    }
    return highlights;
  }
}
