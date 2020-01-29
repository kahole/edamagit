import { DocumentView } from './general/documentView';
import { Uri } from 'vscode';
import * as Constants from '../common/constants';
import { TextView } from './general/textView';
import { MagitCommit } from '../models/magitCommit';
import { MagitRepository } from '../models/magitRepository';

export class CommitDetailView extends DocumentView {

  static UriPath: string = 'commit.diff';
  isHighlightable = false;
  needsUpdate = false;

  constructor(uri: Uri, private commit: MagitCommit) {
    super(uri);

    // this.addSubview(new TextView(commit.hash));
    // this.addSubview(new TextView(commit.authorEmail));
    const commitTextView = new TextView(commit.diff);
    commitTextView.isHighlightable = false;
    this.addSubview(commitTextView);
  }

  public update(repository: MagitRepository): void { }

  static encodeLocation(commitHash: string): Uri {
    return Uri.parse(`${Constants.MagitUriScheme}:${CommitDetailView.UriPath}?${commitHash}`);
  }
}