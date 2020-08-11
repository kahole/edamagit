import { Range } from 'vscode';
import { SemanticTokenTypes } from '../../common/constants';
import { TextView } from './textView';

export class Token {
  constructor(public textContent: string,
    public tokenType: typeof SemanticTokenTypes[number],
    public range: Range = new Range(0, 0, 0, 0)) { }
}

export class SemanticTextView extends TextView {

  public textContent: string = '';
  private content: (string | Token)[];
  public tokens: Token[] = [];

  constructor(...content: (string | Token)[]) {
    super();
    this.content = content;
  }

  onClicked() { return undefined; }

  render(startLineNumber: number): string[] {

    let textContent = '';

    this.content.forEach(part => {
      if (typeof part === 'string' || part instanceof String) {
        textContent += part;
      } else {
        // TODO: need to consider multi line strings
        //let lines = textContent.split(Constants.LineSplitterRegex);
        let startChar = textContent.length;
        textContent += part.textContent;
        let endChar = textContent.length;
        this.tokens.push(new Token(part.textContent,
          part.tokenType,
          new Range(startLineNumber, startChar, startLineNumber, endChar)));
      }
    });

    super.textContent = textContent;

    return super.render(0);
  }
}