import { MagitRepository } from '../models/magitRepository';
import { View } from '../views/general/view';
import { Selection, Position, Uri, workspace, window, TextDocumentShowOptions } from 'vscode';
import { Ref, RefType } from '../typings/git';
import { Token } from '../views/general/semanticTextView';
import { SemanticTokenTypes } from '../common/constants';
import GitTextUtils from './gitTextUtils';
import { DocumentView } from '../views/general/documentView';
import { views } from '../extension';
import MagitUtils from './magitUtils';

export default class ViewUtils {

  public static async showView(uri: Uri, view: DocumentView, textDocumentShowOptions: TextDocumentShowOptions = { preview: false, preserveFocus: false }) {
    views.set(uri.toString(), view);
    let doc = await workspace.openTextDocument(uri);
    return window.showTextDocument(doc, { viewColumn: MagitUtils.showDocumentColumn(), ...textDocumentShowOptions });
  }

  public static async applyActionForSelection(repository: MagitRepository, currentView: View, selection: Selection, multiSelectableViewTypes: any[], action: Function): Promise<any> {

    if (!selection.isSingleLine) {

      let clickedViews = ViewUtils.multilineClick(currentView, selection, multiSelectableViewTypes);

      if (clickedViews.length > 0) {
        let actionResults = [];
        for (const v of clickedViews) {
          actionResults.push(
            await action(repository, selection, v)
          );
        }
        return actionResults;
      }
    }

    const selectedView = currentView.click(selection.active);
    return action(repository, selection, selectedView);
  }

  private static multilineClick(currentView: View, selection: Selection, applicableViewTypes: any[]): View[] {

    let selectedViews: View[] = [];
    let type: any = null;

    for (let line = selection.start.line; line <= selection.end.line; line++) {
      let clicked = currentView.click(new Position(line, 0));

      if (clicked && applicableViewTypes.find(viewType => clicked instanceof viewType)) {
        if (!type) {
          type = clicked.constructor;
        }
        if (type === clicked.constructor) {
          selectedViews.push(clicked);
        }
      }
    }

    return selectedViews;
  }

  public static generateRefTokensLine(commitHash: string, refs?: Ref[]): (string | Token)[] {

    const matchingRefs = (refs ?? [])
      .filter(ref => ref.commit === commitHash)
      .sort(ref => ref.type.valueOf());

    let hasMatchingRemoteDict: { [name: string]: boolean } = {};

    let refsContent: (string | Token)[] = [];
    matchingRefs.forEach(ref => {

      if (!ref.name) {
        return;
      }

      if (ref.type === RefType.RemoteHead) {

        let [remotePart, namePart] = GitTextUtils.remoteBranchFullNameToSegments(ref.name);

        let m = matchingRefs.find(other => other.name === namePart && other.type === RefType.Head);
        if (m && m.name) {
          hasMatchingRemoteDict[m.name!] = true;
          refsContent.push(new Token(remotePart + '/', SemanticTokenTypes.RemoteRefName), new Token(m.name ?? '', SemanticTokenTypes.RefName));
          refsContent.push(' ');
          return;
        }
      }
      if (hasMatchingRemoteDict[ref.name]) {
        return;
      }
      refsContent.push(new Token(ref.name, ref.remote ? SemanticTokenTypes.RemoteRefName : SemanticTokenTypes.RefName));
      refsContent.push(' ');
    });

    return refsContent;
  }
}