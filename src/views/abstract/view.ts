import { Range, Position } from "vscode";

export abstract class View {

  subViews: View[] = [];
  range: Range = new Range(0, 0, 0, 0);
  abstract onClicked(): any;

  render(startLineNumber: number): string[] {
    let currentLineNumber = startLineNumber;
    let render: string[] = [];

    this.subViews.forEach(
      v => {
        let subViewRender = v.render(currentLineNumber);
        currentLineNumber += v.range.end.line - v.range.start.line;
        render.push(...subViewRender);
      }
    );
    this.range = new Range(startLineNumber, 0, currentLineNumber, render.length > 0 ? render[render.length-1].length : 0);

    return render;
  }

  click(position: Position): any {
    if (this.range.contains(position)) {
      let result = this.onClicked();
      let subResults = this.subViews
        .map( subView => subView.click(position))
        .filter(r => r);

      return subResults.length > 0 ? subResults[0] : result;
    }
  }
}