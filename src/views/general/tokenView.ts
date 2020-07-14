import { TextView } from './textView';
import { SemanticTokenTypes } from '../../common/constants';

export class TokenView extends TextView {

  constructor(public textContent: string = '', public tokenType: typeof SemanticTokenTypes[number]) {
    super(textContent);
  }
}
