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
    d Diffing           b Branching        c Committing
    f Fetching          F Pulling          l Logging 
    m Merging           M Remoting         t Tagging
    P Pushing           r Rebasing         X Resetting
    y Show Refs         z Stashing         % Worktree`));
  }

  public update(state: MagitState): void { }

  static encodeLocation(repository: MagitRepository): Uri {
    return Uri.parse(`${Constants.MagitUriScheme}:${DispatchView.UriPath}?${repository.rootUri.fsPath}`);
  }
}