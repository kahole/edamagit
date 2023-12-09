import { DocumentView } from './general/documentView';
import { Uri } from 'vscode';
import * as Constants from '../common/constants';
import { TextView } from './general/textView';
import { MagitRepository } from '../models/magitRepository';

export class DiffView extends DocumentView {

  static UriPath: string = 'diff.magit';
  isHighlightable = false;
  needsUpdate = false;

  constructor(uri: Uri, private diff: string) {
    super(uri);

    const diffTextView = new TextView(diff);
    diffTextView.isHighlightable = false;
    this.addSubview(diffTextView);
  }

  static index = 0;
  static encodeLocation(repository: MagitRepository, diffId: string): Uri {
    return Uri.parse(`${Constants.MagitUriScheme}:${DiffView.UriPath}?${repository.uri.fsPath}#${diffId}${DiffView.index++}`);
  }
}