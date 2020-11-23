import * as vscode from 'vscode';
import * as Constants from '../common/constants';
import { views } from '../extension';

export default class HighlightDecorator {

  dispose() { }

  static decorations: { [key: string]: vscode.TextEditorDecorationType } = {};

  static updating = new Map<vscode.TextEditor, boolean>();


  public static begin(context: vscode.ExtensionContext) {

    this.registerDecorationTypes();

    // Check if we already have a set of active windows, attempt to track these.
    // vscode.window.visibleTextEditors.forEach(e => this.applyDecorations(e));

    vscode.workspace.onDidOpenTextDocument(event => {
      this.applyDecorationsFromEvent(event);
    }, null, context.subscriptions);

    vscode.workspace.onDidChangeTextDocument(event => {
      this.applyDecorationsFromEvent(event.document);
    }, null, context.subscriptions);

    vscode.window.onDidChangeVisibleTextEditors((e) => {
      // Any of which could be new (not just the active one).
      e.forEach(e => this.applyDecorations(e));
    }, null, context.subscriptions);
  }

  public static removeDecorations(editor: vscode.TextEditor) {
    editor.setDecorations(HighlightDecorator.decorations['added.line'], []);
    editor.setDecorations(HighlightDecorator.decorations['deleted.line'], []);
  }

  public static removeHoverDecorations(editor: vscode.TextEditor) {
    editor.setDecorations(HighlightDecorator.decorations['hover'], []);
  }

  private static applyDecorationsFromEvent(eventDocument: vscode.TextDocument) {

    if (eventDocument.uri.scheme !== Constants.MagitUriScheme) {
      return;
    }

    for (const editor of vscode.window.visibleTextEditors) {
      if (editor.document === eventDocument) {
        // Attempt to apply
        this.applyDecorations(editor);
      }
    }
  }

  private static registerDecorationTypes() {
    HighlightDecorator.decorations['added.line'] = vscode.window.createTextEditorDecorationType(
      HighlightDecorator.generateAddedBlock()
    );
    HighlightDecorator.decorations['deleted.line'] = vscode.window.createTextEditorDecorationType(
      HighlightDecorator.generateDeletedBlock()
    );

    HighlightDecorator.decorations['hover'] = vscode.window.createTextEditorDecorationType(
      HighlightDecorator.generateHoverBlock()
    );
  }

  public static applyDecorations(editor: vscode.TextEditor) {

    if (!editor || !editor.document) { return; }

    if (editor.document.uri.scheme !== Constants.MagitUriScheme) {
      return;
    }

    if (HighlightDecorator.updating.get(editor)) {
      return;
    }

    HighlightDecorator.updating.set(editor, true);

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

    editor.setDecorations(HighlightDecorator.decorations['added.line'], addedRanges);
    editor.setDecorations(HighlightDecorator.decorations['deleted.line'], deletedRanges);

    HighlightDecorator.updating.set(editor, false);
  }

  public static applyHoverDecorations(editor: vscode.TextEditor, range: vscode.Range) {

    editor.setDecorations(HighlightDecorator.decorations['hover'], [range]);
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