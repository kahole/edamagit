import { DocumentView } from './general/documentView';
import { Uri } from 'vscode';
import * as Constants from '../common/constants';
import { TextView } from './general/textView';
import { MagitRepository } from '../models/magitRepository';
import { MagitState } from '../models/magitState';

export class DispatchView extends DocumentView {

  static UriPath: string = 'dispatch.magit';
  needsUpdate = false;

  constructor(public uri: Uri) {
    super(uri);

    this.addSubview(new TextView(`Popup and dwim commands
    A Cherry-pick       b Branch            c Commit
    d Diff              f Fetch             F Pull
    i Ignore            l Log               m Merge
    M Remote            P Push              r Rebase
    t Tag               V Revert            X Reset
    y Show Refs         z Stash             ! Run             % Worktree`));
  }

  public update(state: MagitState): void { }

  static encodeLocation(repository: MagitRepository): Uri {
    return Uri.parse(`${Constants.MagitUriScheme}:${DispatchView.UriPath}?${repository.magitState.uri.fsPath}`);
  }
}