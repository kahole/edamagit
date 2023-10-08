import { MagitRepository } from '../models/magitRepository';
import { View } from '../views/general/view';
import { Selection, Position, Uri, workspace, window, TextDocumentShowOptions, ViewColumn } from 'vscode';
import { Ref, RefType } from '../typings/git';
import { Token } from '../views/general/semanticTextView';
import { SemanticTokenTypes } from '../common/constants';
import GitTextUtils from './gitTextUtils';
import { DocumentView } from '../views/general/documentView';
import { magitConfig, views } from '../extension';

export default class ViewUtils {

  public static createOrUpdateView(repository: MagitRepository, uri: Uri, viewFactory: () => DocumentView) {
    const existingView = views.get(uri.toString());

    if (existingView) {
      existingView.update(repository);
      return existingView;
    }
    return viewFactory();
  }

  public static async showView(uri: Uri, view: DocumentView, textDocumentShowOptions: TextDocumentShowOptions = { preview: false, preserveFocus: false }) {
    views.set(uri.toString(), view);
    let doc = await workspace.openTextDocument(uri);
    return window.showTextDocument(doc, { viewColumn: ViewUtils.showDocumentColumn(), ...textDocumentShowOptions });
  }

  public static showDocumentColumn(): ViewColumn {
    const activeColumn = window.activeTextEditor?.viewColumn;

    if (magitConfig.displayBufferSameColumn) {
      return activeColumn ?? ViewColumn.Active;
    }

    if ((activeColumn ?? 0) > ViewColumn.One) {
      return ViewColumn.One;
    }
    return ViewColumn.Two;
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

  public static generateRefTokensLine(commitHash: string, refs?: Ref[], headName?: string, defaultBranches?: { [remoteName: string]: string }): (string | Token)[] {

    const matchingRefs = (refs ?? [])
      .filter(ref => ref.commit === commitHash)
      .sort(ref => ref.type.valueOf());

    let hasMatchingRemoteBranch: { [name: string]: boolean } = {};

    let refsContent: (string | Token)[] = [];
    matchingRefs.forEach(ref => {

      if (!ref.name) {
        return;
      }

      if (ref.type === RefType.RemoteHead) {

        let [remotePart, namePart] = GitTextUtils.remoteBranchFullNameToSegments(ref.name);

        let m = matchingRefs.find(other => other.name === namePart && other.type === RefType.Head);
        if (m && m.name) {
          hasMatchingRemoteBranch[m.name!] = true;

          // Determine if local or remote branches are HEADs
          let remoteRefTokenType = SemanticTokenTypes.RemoteRefName;
          if (defaultBranches && ref.remote && defaultBranches[ref.remote] === namePart) {
            remoteRefTokenType = SemanticTokenTypes.RemoteHeadName;
          }

          let refTokenType = SemanticTokenTypes.RefName;
          if (m.name === headName) {
            refTokenType = SemanticTokenTypes.HeadName;
          }

          refsContent.push(new Token(remotePart + '/', remoteRefTokenType), new Token(m.name ?? '', refTokenType));
          refsContent.push(' ');
          return;
        }
      }
      if (hasMatchingRemoteBranch[ref.name]) {
        return;
      }

      let refTokenType = SemanticTokenTypes.RefName;

      if (ref.name === headName) {
        refTokenType = SemanticTokenTypes.HeadName;
      } else if (ref.remote) {
        refTokenType = SemanticTokenTypes.RemoteRefName;
        if (defaultBranches && ref.remote && ref.remote + '/' + defaultBranches[ref.remote] === ref.name) {
          refTokenType = SemanticTokenTypes.RemoteHeadName;
        }
      } else if (ref.type === RefType.Tag) {
        refTokenType = SemanticTokenTypes.TagName;
      }

      refsContent.push(new Token(ref.name, refTokenType));
      refsContent.push(' ');
    });

    return refsContent;
  }
}
