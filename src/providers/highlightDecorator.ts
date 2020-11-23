import * as vscode from 'vscode';
import * as Constants from '../common/constants';
import { views } from '../extension';

export default class HighlightDecorator {

  private static decorationTypes: { [key: string]: vscode.TextEditorDecorationType } = {};

  private static updating = new Map<vscode.TextEditor, boolean>();

  public static begin(context: vscode.ExtensionContext) {

    this.registerDecorationTypes();

    // Check if we already have a set of active windows, attempt to track these.
    // vscode.window.visibleTextEditors.forEach(e => this.applyDecorations(e));

    vscode.workspace.onDidOpenTextDocument(event => {
      this.applyDecorationsForDocument(event);
    }, null, context.subscriptions);

    vscode.workspace.onDidChangeTextDocument(event => {
      this.applyDecorationsForDocument(event.document);
    }, null, context.subscriptions);

    // vscode.window.onDidChangeVisibleTextEditors((e) => {
    //   // Any of which could be new (not just the active one).
    //   e.forEach(e => this.applyDecorations(e));

    // }, null, context.subscriptions);

    vscode.window.onDidChangeTextEditorSelection((e) => {

      this.applyDecorations(e.textEditor);

    }, null, context.subscriptions);
  }

  // public static removeDecorations(editor: vscode.TextEditor) {
  //   editor.setDecorations(HighlightDecorator.decorations['added.line'], []);
  //   editor.setDecorations(HighlightDecorator.decorations['deleted.line'], []);
  // }

  // public static removeHoverDecorations(editor: vscode.TextEditor) {
  //   editor.setDecorations(HighlightDecorator.decorations['selected.line'], []);
  // }

  private static applyDecorationsForDocument(document: vscode.TextDocument) {

    if (document.uri.scheme !== Constants.MagitUriScheme) {
      return;
    }

    for (const editor of vscode.window.visibleTextEditors) {
      if (editor.document === document) {
        this.applyDecorations(editor);
      }
    }
  }

  private static applyDecorations(editor: vscode.TextEditor) {

    // TODO: make it so dont need these checks

    if (!editor || !editor.document) { return; }

    if (editor.document.uri.scheme !== Constants.MagitUriScheme) {
      return;
    }

    // TODO: check if this makes it jittery
    if (HighlightDecorator.updating.get(editor)) {
      return;
    }

    HighlightDecorator.updating.set(editor, true);

    // Diff

    let addedRanges: vscode.Range[] = [];
    let deletedRanges: vscode.Range[] = [];

    let lines = editor.document.getText()
      .split(Constants.LineSplitterRegex);

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      if (line.length) {
        // TODO: clean up
        if (line[0] === '+') {

          let ogI = i;
          let endOfRange = i;
          while (i + 1 < lines.length && lines[i + 1].length && lines[i + 1][0] === '+') {
            endOfRange++;
            i++;
          }

          addedRanges.push(new vscode.Range(ogI, 0, endOfRange, 0));

        } else if (line[0] === '-') {

          let ogI = i;
          let endOfRange = i;
          while (i + 1 < lines.length && lines[i + 1].length && lines[i + 1][0] === '-') {
            endOfRange++;
            i++;
          }
          deletedRanges.push(new vscode.Range(ogI, 0, endOfRange, 0));
        }
      }
    }

    // Hover / Selection

    let selectedRanges: vscode.Range[] = [];

    const currentView = views.get(editor.document.uri.toString());
    if (currentView) {

      // Hover

      const clickedView = currentView.click(editor.selection.active);
      if (clickedView?.isHighlightable) {

        // clickedView.range.intersection();

        selectedRanges.push(clickedView.range);
      }


      // Selection 
      if (selectedRanges.length && (addedRanges.length || deletedRanges.length)) {
        selectedRanges = this.disjunctiveUnionsSplit(selectedRanges[0], addedRanges.concat(deletedRanges));

        if (!editor.selection.start.isEqual(editor.selection.end)) {
          // TODO: prune added/deleted that DONT intersect with editor-selection

          addedRanges = addedRanges.map(added => added.intersection(editor.selection)).filter(e => e) as vscode.Range[];
          deletedRanges = deletedRanges.map(added => added.intersection(editor.selection)).filter(e => e) as vscode.Range[];
        }
      }
    }

    editor.setDecorations(HighlightDecorator.decorationTypes['added.line'], addedRanges);
    editor.setDecorations(HighlightDecorator.decorationTypes['deleted.line'], deletedRanges);
    editor.setDecorations(HighlightDecorator.decorationTypes['selected.line'], selectedRanges);

    HighlightDecorator.updating.set(editor, false);
  }

  //

  private static disjunctiveUnionsSplit(range: vscode.Range, excludeRanges: vscode.Range[]): vscode.Range[] {

    let intersections = excludeRanges.map(e => range.intersection(e)).filter(i => i !== undefined) as vscode.Range[];

    let ranges = [];

    let current = new vscode.Range(range.start, range.start);
    for (let i = range.start.line; i <= range.end.line; i++) {
      let potential = current.with({ end: new vscode.Position(current.end.line + 1, 0) });

      let currentIntersection = intersections.find(intersection => potential.intersection(intersection));
      if (currentIntersection) {
        ranges.push(current);
        let endPlusOne = currentIntersection.end.with({ line: currentIntersection.end.line + 1 });
        current = new vscode.Range(endPlusOne, endPlusOne);

      } else {
        current = potential;
      }
    }

    return ranges;
  }

  private static registerDecorationTypes() {
    HighlightDecorator.decorationTypes['added.line'] = vscode.window.createTextEditorDecorationType(
      HighlightDecorator.generateAddedBlock()
    );
    HighlightDecorator.decorationTypes['deleted.line'] = vscode.window.createTextEditorDecorationType(
      HighlightDecorator.generateDeletedBlock()
    );

    HighlightDecorator.decorationTypes['selected.line'] = vscode.window.createTextEditorDecorationType(
      HighlightDecorator.generateHoverBlock()
    );
  }

  private static generateAddedBlock(): vscode.DecorationRenderOptions {
    return {
      // backgroundColor: new vscode.ThemeColor('merge.currentContentBackground'),
      backgroundColor: new vscode.ThemeColor('diffEditor.insertedTextBackground'),
      isWholeLine: true,
      rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
      // gutterIconPath: 
    };
  }

  private static generateDeletedBlock(): vscode.DecorationRenderOptions {
    return {
      // backgroundColor: new vscode.ThemeColor('merge.incomingContentBackground'),
      backgroundColor: new vscode.ThemeColor('diffEditor.removedTextBackground'),
      isWholeLine: true,
      rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
      // gutterIconPath: 
    };
  }

  private static generateHoverBlock(): vscode.DecorationRenderOptions {
    return {
      // backgroundColor: new vscode.ThemeColor('merge.incomingContentBackground'),
      backgroundColor: new vscode.ThemeColor('editor.hoverHighlightBackground'),
      // backgroundColor: new vscode.ThemeColor('editor.selectionBackground'),
      isWholeLine: true,
      rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
      // gutterIconPath: 
    };
  }
}


// let renderOptions: vscode.DecorationRenderOptions = {};

// if (config.enableDecorations) {
//   renderOptions.backgroundColor = new vscode.ThemeColor(backgroundColor);
//   renderOptions.isWholeLine = this.decorationUsesWholeLine;
// }

// if (config.enableEditorOverview) {
//   renderOptions.overviewRulerColor = new vscode.ThemeColor(overviewRulerColor);
//   renderOptions.overviewRulerLane = vscode.OverviewRulerLane.Full;
// }

// return renderOptions;