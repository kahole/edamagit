import { DocumentView } from './general/documentView';
import { Uri } from 'vscode';
import * as Constants from '../common/constants';
import { TextView } from './general/textView';
import { Stash } from '../common/gitApiExtensions';
import { MagitRepository } from '../models/magitRepository';

export class StashDetailView extends DocumentView {

  static UriPath: string = 'stash.magit';
  needsUpdate = false;

  constructor(public uri: Uri, stash: Stash, diff: string) {
    super(uri);

    this.addSubview(new TextView(`Stash@{${stash.index}} ${stash.description}`));
    this.addSubview(new TextView(diff));
  }

  public update(repository: MagitRepository): void { }

  static index = 0;
  static encodeLocation(repository: MagitRepository, stash: Stash): Uri {
    return Uri.parse(`${Constants.MagitUriScheme}:${StashDetailView.UriPath}?${repository.rootUri.path}#stash@{${stash.index}}#${StashDetailView.index++}`);
  }
}