import { TextView } from './general/textView';
import * as Constants from '../common/constants';

export class ErrorMessageView extends TextView {

  constructor(latestGitError: string) {
    let truncated = latestGitError.split(Constants.LineSplitterRegex)[0] ?? '';
    truncated = truncated.replace('\r', ' ').slice(0, 61);
    super(`GitError! ${truncated} [ $ for detailed log ]`);
  }
}
