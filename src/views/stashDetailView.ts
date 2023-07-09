import { DocumentView } from './general/documentView';
import { Uri } from 'vscode';
import * as Constants from '../common/constants';
import { TextView } from './general/textView';
import { MagitRepository } from '../models/magitRepository';
import { ChangeSectionView } from './changes/changesSectionView';
import { Section } from './general/sectionHeader';
import { MagitChange } from '../models/magitChange';
import { Stash } from '../models/stash';

export class StashDetailView extends DocumentView {

  static UriPath: string = 'stash.magit';
  needsUpdate = false;

  constructor(public uri: Uri, stash: Stash, diffChanges: MagitChange[], untrackedFiles: MagitChange[] ) {
    super(uri);

    this.addSubview(new TextView(`Stash@{${stash.index}} ${stash.description}`));

    if (untrackedFiles.length) {
      this.addSubview(new ChangeSectionView(Section.Untracked, untrackedFiles, `-stashDetail@{${stash.index}}`));
    }

    this.addSubview(new ChangeSectionView(Section.Changes, diffChanges, `-stashDetail@{${stash.index}}`));
  }

  public update(state: MagitRepository): void { }

  static index = 0;
  static encodeLocation(repository: MagitRepository, stash: Stash): Uri {
    return Uri.parse(`${Constants.MagitUriScheme}:${StashDetailView.UriPath}?${repository.uri.fsPath}#stash@{${stash.index}}#${StashDetailView.index++}`);
  }
}