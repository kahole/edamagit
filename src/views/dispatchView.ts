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
 A Cherry-picking    b Branching         B Bisecting         c Committing
 d Diffing           D Change diffs      e Ediff dwimming    E Ediffing
 f Fetching          F Pulling           l Logging           L Change logs
 m Merging           M Remoting          o Submodules        O Subtrees
 P Pushing           r Rebasing          t Tagging           T Notes
 V Reverting         w Apply patches     W Format patches    X Resetting
 y Show Refs         z Stashing          ! Running           % Worktree
`));
  }

  public update(state: MagitState): void { }

  static encodeLocation(repository: MagitRepository): Uri {
    return Uri.parse(`${Constants.MagitUriScheme}:${DispatchView.UriPath}?${repository.rootUri.fsPath}`);
  }
}