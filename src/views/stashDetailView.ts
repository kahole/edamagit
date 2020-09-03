import { DocumentView } from './general/documentView';
import { Uri } from 'vscode';
import * as Constants from '../common/constants';
import { TextView } from './general/textView';
import { Stash } from '../common/gitApiExtensions';
import { MagitRepository } from '../models/magitRepository';
import { MagitState } from '../models/magitState';
import { ChangeSectionView } from './changes/changesSectionView';
import { Section } from './general/sectionHeader';
import { MagitChange } from '../models/magitChange';

export class StashDetailView extends DocumentView {

  static UriPath: string = 'stash.magit';
  needsUpdate = false;

  constructor(public uri: Uri, stash: Stash, diff: string, untrackedFiles: MagitChange[]) {
    super(uri);

    this.addSubview(new TextView(`Stash@{${stash.index}} ${stash.description}`));

    if (untrackedFiles.length) {
      this.addSubview(new ChangeSectionView(Section.Untracked, untrackedFiles, `-stashDetail@{${stash.index}}`));
    }

    this.addSubview(new TextView(diff));
  }

  public update(state: MagitState): void { }

  static index = 0;
  static encodeLocation(repository: MagitRepository, stash: Stash): Uri {
    return Uri.parse(`${Constants.MagitUriScheme}:${StashDetailView.UriPath}?${repository.rootUri.fsPath}#stash@{${stash.index}}#${StashDetailView.index++}`);
  }
}