import { Range, Position } from 'vscode';

const viewFoldStatusMemory: Map<string, boolean> = new Map<string, boolean>();

export abstract class View {

  private _range: Range = new Range(0, 0, 0, 0);
  private _folded: boolean = false;
  subViews: View[] = [];
  isFoldable: boolean = false;
  foldedByDefault: boolean = false;
  isHighlightable: boolean = true;
  newlineByDefault: boolean = true;

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
    if (this.folded) {
      return new Range(this._range.start, new Position(this._range.start.line, 300));
    }
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

  render(startLineNumber: number, startColumnNumber: number): string {

    this.retrieveFold();

    let currentLineNumber = startLineNumber;
    let currentColumnNumber = startColumnNumber;
    let renderedContent: string = '';

    for (const [idx, v] of this.subViews.entries()) {
      if (v.newlineByDefault && idx !== 0) {
        if (this.folded) {
          break;
        }
        currentLineNumber += 1;
        currentColumnNumber = 0;
        renderedContent += '\n';
      }
      let subViewRender = v.render(currentLineNumber, currentColumnNumber);
      let foundNewline = -1;
      if (this.folded) {
        const foundNewline = subViewRender.indexOf('\n');
        if (foundNewline !== -1 && idx !== 0) {
          subViewRender = subViewRender.slice(0, foundNewline);
        }
      }
      currentLineNumber += v.range.end.line - v.range.start.line;
      currentColumnNumber += v.range.end.character - v.range.start.character;
      renderedContent += subViewRender;
      if (this.folded && foundNewline !== -1 && idx !== 0) {
        break;
      }
    }
    this.range = new Range(startLineNumber, startColumnNumber, currentLineNumber, currentColumnNumber);

    return renderedContent;
  }

  get id(): string | undefined { return undefined; }

  onClicked(): View | undefined { return this; }

  click(position: Position): View | undefined {
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