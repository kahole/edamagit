import { TextView } from "./general/textView";

export class LineBreakView extends TextView {

  constructor(number: number = 1) {
    super();
    this.textContent = "\n".repeat(number-1);
  }
}