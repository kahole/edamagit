import * as vscode from 'vscode';
import { views } from '../extension';
import { TokenView } from '../views/general/tokenView';
import { View } from '../views/general/view';
import { SemanticTokenTypes } from '../common/constants';

export default class SemanticTokensProvider implements vscode.DocumentSemanticTokensProvider {

  readonly legend = new vscode.SemanticTokensLegend([...SemanticTokenTypes], []);

  dispose() { }

  provideDocumentSemanticTokens(document: vscode.TextDocument): vscode.ProviderResult<vscode.SemanticTokens> {
    const currentView = views.get(document.uri.toString());
    const builder = new vscode.SemanticTokensBuilder(this.legend);
    if (currentView) {
      this.visitNode(currentView, builder);
    }
    return builder.build();
  }

  visitNode(view: View, builder: vscode.SemanticTokensBuilder) {
    if (view instanceof TokenView) {
      builder.push(view.range, view.tokenType);
    }
    if (!view.folded) {
      view.subViews.forEach(v => this.visitNode(v, builder));
    }
  }
}
