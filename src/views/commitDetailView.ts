import { DocumentView } from './general/documentView';
import { Uri } from 'vscode';
import { Section } from './general/sectionHeader';
import * as Constants from '../common/constants';
import { TextView } from './general/textView';
import { MagitCommit } from '../models/magitCommit';
import { MagitRepository } from '../models/magitRepository';
import { MagitChange } from '../models/magitChange';
import { ChangeSectionView } from './changes/changesSectionView';

export class CommitDetailView extends DocumentView {

  static UriPath: string = 'commit.magit';
  isHighlightable = false;
  needsUpdate = false;

  constructor(uri: Uri, public commit: MagitCommit, header: string, diffChanges: MagitChange[]) {
    super(uri);

    const commitTextView = new ChangeSectionView(Section.Changes, diffChanges);
    const headerView = new TextView(header);
    headerView.isHighlightable = false;

    this.addSubview(headerView);
    this.addSubview(commitTextView);
  }

  public update(state: MagitRepository): void { }

  static encodeLocation(repository: MagitRepository, commitHash: string): Uri {
    return Uri.parse(`${Constants.MagitUriScheme}:${CommitDetailView.UriPath}?${repository.uri.fsPath}#${commitHash}`);
  }
}