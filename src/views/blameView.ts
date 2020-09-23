import { DocumentView } from './general/documentView';
import { Uri } from 'vscode';
import * as Constants from '../common/constants';
import { TextView } from './general/textView';
import { MagitRepository } from '../models/magitRepository';

export class BlameView extends DocumentView {

  static UriPath: string = 'blame.magit';
  isHighlightable = false;
  needsUpdate = false;

  constructor(uri: Uri, private blame: string) {
    super(uri);

    const blameTextView = new TextView(blame);
    blameTextView.isHighlightable = false;
    this.addSubview(blameTextView);
  }

  public update(state: MagitRepository): void { }

  static index = 0;
  static encodeLocation(repository: MagitRepository, fileUri: Uri): Uri {
    return Uri.parse(`${Constants.MagitUriScheme}:${BlameView.UriPath}?${repository.uri.fsPath}#${fileUri.path}#${BlameView.index++}`);
  }
}