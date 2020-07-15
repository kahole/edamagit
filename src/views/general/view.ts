import { Range, Position } from 'vscode';
import * as Constants from '../../common/constants';

const viewFoldStatusMemory: Map<string, boolean> = new Map<string, boolean>();

export abstract class View {

  private _range: Range = new Range(0, 0, 0, 0);
  private _folded: boolean = false;
  subViews: View[] = [];
  isFoldable: boolean = false;
  foldedByDefault: boolean = false;
  isHighlightable: boolean = true;
  // A number of blank lines to add between this view and the sibling view after it. Doesn't affect this view's range.
  afterMargin = 0;

  get folded(): boolean {
    return this._folded;
  }

  set folded(value: boolean) {
    if (this.id) {
      viewFoldStatusMemory.set(this.id, value);
    }
    this._folded = value;
  }

  get range(): Range {
    return this._range;
  }

  set range(value: Range) {
    this._range = value;
  }

  protected retrieveFold() {
    if (this.isFoldable && this.id) {
      this._folded = viewFoldStatusMemory.get(this.id) ?? this.foldedByDefault;
    }
  }

  render(startLineNumber: number, startCharacterNumber: number): string {

    this.retrieveFold();

    let renderedContent: string = '';
    // If we're not at the beginning of a line, add a new line.
    // This view's range begins at the start of this new line.
    if (startCharacterNumber !== 0) {
      startLineNumber += 1;
      startCharacterNumber = 0;
      renderedContent += '\n';
    }

    let currentLineNumber = startLineNumber;
    let currentCharacterNumber = startCharacterNumber;

    for (const [idx, v] of this.subViews.entries()) {
      const subViewRender = v.render(currentLineNumber, currentCharacterNumber);
      // If this view is folded, trim whatever the subviews render to only the first line, and adjust
      // the range accordingly.
      const foldEnding = this.folded ? subViewRender.search(Constants.LineSplitterRegex) : -1;
      if (foldEnding !== -1) {
        const foldedRender = subViewRender.slice(0, foldEnding);
        currentCharacterNumber += foldedRender.length;
        renderedContent += foldedRender;
        // If this view is folded and we've already rendered a full line, then there's no point rendering any more.
        break;
      }
      currentLineNumber = v.range.end.line;
      currentCharacterNumber = v.range.end.character;
      renderedContent += subViewRender;
      // Further operations only apply if we're going to render another subview after this one.
      if (idx === this.subViews.length - 1) {
        break;
      }
      // If the subview we just rendered ends in a newline, its range will exclude that newline.
      // That means the range of our next subview will start on the line after the last subview's range.
      const subViewEndsInNewline = Constants.FinalLineBreakRegex.test(subViewRender ?? '');
      if (subViewEndsInNewline) {
        currentLineNumber += 1;
        currentCharacterNumber = 0;
      }
      // Apply the subview's afterMargin if it has one. If the subview is folded, also collapse its margin.
      if (!v.folded && v.afterMargin) {
        // If the subview doesn't end in a newline, we need to add an additional one to ensure there's one empty
        // line between this subview and the next one.
        const marginSize = v.afterMargin + (subViewEndsInNewline ? 0 : 1);
        currentLineNumber += marginSize;
        currentCharacterNumber = 0;
        renderedContent += '\n'.repeat(marginSize);
      }
    }
    this.range = new Range(startLineNumber, startCharacterNumber, currentLineNumber, currentCharacterNumber);

    return renderedContent;
  }

  get id(): string | undefined { return undefined; }

  onClicked(): View | undefined { return this; }

  click(position: Position | Range): View | undefined {
    if (this.range.contains(position)) {
      const result = this.onClicked();

      if (this.folded) {
        return result;
      }

      const subResults = this.subViews
        .map(subView => subView.click(position))
        .filter(r => r);

      return subResults.length > 0 ? subResults[0] : result;
    }
  }

  addSubview(...views: View[]) {
    this.subViews.push(...views);
  }
}