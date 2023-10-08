import { Range, Position } from 'vscode';

const viewFoldStatusMemory: Map<string, boolean> = new Map<string, boolean>();

export abstract class View {

  private _range: Range = new Range(0, 0, 0, 0);
  private _folded: boolean = false;
  subViews: View[] = [];
  isFoldable: boolean = false;
  foldedByDefault: boolean = false;
  isHighlightable: boolean = true;

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
      return new Range(new Position(this._range.start.line, this._range.start.character), new Position(this._range.start.line, 300));
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

  render(startLineNumber: number): string[] {

    this.retrieveFold();

    let currentLineNumber = startLineNumber;
    const renderedContent: string[] = [];

    this.subViews.forEach(
      v => {
        const subViewRender = v.render(currentLineNumber);
        currentLineNumber += (v.range.end.line - v.range.start.line) + 1;
        renderedContent.push(...subViewRender);
      }
    );
    this.range = new Range(startLineNumber, 0, currentLineNumber - 1, renderedContent.length > 0 ? renderedContent[renderedContent.length - 1].length : 0);

    return this.folded ? renderedContent.slice(0, 1) : renderedContent;
  }

  get id(): string | undefined { return undefined; }

  onClicked(): View | undefined { return this; }

  click(position: Position): View | undefined {
    if (this.range.contains(position)) {
      const result = this.onClicked();

      if (this.folded) {
        return result;
      }

      let subResult: View | undefined = undefined;
      for (const subView of this.subViews) {
        subResult = subView.click(position);
        if (subResult) {
          break;
        }
      }

      return subResult ?? result;
    }
  }

  addSubview(...views: View[]) {
    this.subViews.push(...views);
  }

  *walkAllSubViews(): Generator<View> {
    for (let subView of this.subViews) {
      yield subView;
      yield* subView.walkAllSubViews();
    }
  }
}
