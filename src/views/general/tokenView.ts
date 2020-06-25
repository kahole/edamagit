import { PlainTextView } from './plainTextView';
import { SemanticTokenTypes } from '../../common/constants';

export class TokenView extends PlainTextView {

  constructor(public textContent: string = '', public tokenType: typeof SemanticTokenTypes[number]) {
    super(textContent);
  }
}
