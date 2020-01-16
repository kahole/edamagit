import { DocumentView } from './general/documentView';
import { Uri } from 'vscode';
import * as Constants from '../common/constants';
import { TextView } from './general/textView';
import { MagitCommit } from '../models/magitCommit';

export class CommitDetailView extends DocumentView {

  static UriPath: string = 'commit.diff';
  isHighlightable = false;

  constructor(public uri: Uri, commit: MagitCommit) {
    super(uri);

    // this.addSubview(new TextView(commit.hash));
    // this.addSubview(new TextView(commit.authorEmail));
    const commitTextView = new TextView(commit.diff);
    commitTextView.isHighlightable = false;
    this.addSubview(commitTextView);
  }

  static encodeLocation(commitHash: string): Uri {
    return Uri.parse(`${Constants.MagitUriScheme}:${CommitDetailView.UriPath}?${commitHash}`);
  }
}