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
    A Cherry-picking    b Branching         c Committing
    d Diffing           f Fetching          F Pulling
    i Ignoring          l Logging           m Merging
    M Remoting          P Pushing           r Rebasing
    t Tagging           V Reverting         X Resetting
    y Show Refs         z Stashing          ! Running           % Worktree`));
  }

  public update(state: MagitState): void { }

  static encodeLocation(repository: MagitRepository): Uri {
    return Uri.parse(`${Constants.MagitUriScheme}:${DispatchView.UriPath}?${repository.rootUri.fsPath}`);
  }
}