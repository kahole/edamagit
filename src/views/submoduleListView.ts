import * as Constants from '../common/constants';
import { MagitState } from '../models/magitState';
import { DocumentView } from './general/documentView';
import { Uri } from 'vscode';
import { MagitRepository } from '../models/magitRepository';
import { TextView } from './general/textView';

export default class SubmoduleListView extends DocumentView {

  static UriPath: string = 'submodules.magit';

  constructor(uri: Uri, magitState: MagitState) {
    super(uri);
    this.provideContent(magitState);
  }

  provideContent(magitState: MagitState) {
    this.subViews = [
      ...magitState.submodules.map(submodule => new TextView(`${submodule.name}\t\t${submodule.path}\t\t${submodule.url}`)),
    ];
  }

  public update(state: MagitState): void {
    this.provideContent(state);
    this.triggerUpdate();
  }

  static encodeLocation(repository: MagitRepository): Uri {
    return Uri.parse(`${Constants.MagitUriScheme}:${SubmoduleListView.UriPath}?${repository.rootUri.fsPath}`);
  }
}