import * as vscode from 'vscode';
import { View } from '../views/general/view';
import MagitUtils from '../utils/magitUtils';
import { views } from '../extension';

export default class FoldingRangeProvider implements vscode.FoldingRangeProvider {

  dispose() { }

  provideFoldingRanges(document: vscode.TextDocument, context: vscode.FoldingContext, token: vscode.CancellationToken): vscode.ProviderResult<vscode.FoldingRange[]> {

    let foldingRanges: vscode.FoldingRange[] = [];

    let currentView = views.get(document.uri.toString());
    if (currentView) {
      let views = this.flattenSubviews(currentView.subViews);

      views.forEach(v => {
        if (v.isFoldable) {
          foldingRanges.push(new vscode.FoldingRange(v.range.start.line, v.range.end.line));
        }
      });
    }

    return foldingRanges;
  }

  private flattenSubviews(subviews: View[]): View[] {

    let flattened = [];
    subviews.forEach(sv => flattened.push(...this.flattenSubviews(sv.subViews)));

    flattened.push(...subviews);

    return flattened;
  }
}
