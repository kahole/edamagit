import { View } from "./view";

export class TextView extends View {

  content: string = "";

  render(startLineNumber: number): string[] {
    return [this.content];
  }
}