import { Range } from 'vscode';
import { SemanticTokenTypes } from '../../common/constants';
import { TextView } from './textView';

// This view is used to provide tokens with intra-line character ranges for the SemanticTokensProvider
export class SemanticTextView extends TextView {

  public content: (string | Token)[];
  public tokens: Token[] = [];

  constructor(...content: (string | Token)[]) {
    super();
    this.content = content;
  }

  render(startLineNumber: number): string[] {

    this.tokens = [];
    let textContent = '';

    this.content.forEach(part => {
      if (typeof part === 'string' || part instanceof String) {
        textContent += part;
      } else {
        let startChar = textContent.length;
        // Doesn't support multiline tokens:
        let endChar = startChar + part.textContent.length;
        textContent += part.textContent;
        this.tokens.push(new Token(part.textContent,
          part.tokenType,
          new Range(startLineNumber, startChar, startLineNumber, endChar)));
      }
    });

    super.textContent = textContent;

    return super.render(startLineNumber);
  }
}

export class Token {
  constructor(public textContent: string,
    public tokenType: SemanticTokenTypes,
    public range: Range = new Range(0, 0, 0, 0)) { }
  public get length() {
    return this.textContent.length;
  }
}