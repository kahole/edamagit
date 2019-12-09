import { Range, Position } from "vscode";

export abstract class View {

  subViews: View[] = [];
  range: Range = new Range(0, 0, 0, 0);

  render(startLineNumber: number): string[] {

    let currentLineNumber = startLineNumber;
    let render: string[] = [];

    this.subViews.forEach(
      v => {
        let subViewRender = v.render(currentLineNumber);
        currentLineNumber += subViewRender.length;
        render.push(...subViewRender);
      }
    );
    this.range = new Range(startLineNumber, 0, currentLineNumber, render[render.length-1].length);

    return render;
  }

  onClickedPosition(position: Position): void {
    if (this.range.contains(position)) {
      this.subViews.forEach( subView => subView.onClickedPosition(position));
    }
  }
}