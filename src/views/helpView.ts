import { DocumentView } from './general/documentView';
import { Uri } from 'vscode';
import * as Constants from '../common/constants';
import { TextView } from './general/textView';
import { MagitRepository } from '../models/magitRepository';

export class HelpView extends DocumentView {

  static UriPath: string = 'help.magit';
  isHighlightable = false;
  needsUpdate = false;

  //   static HelpText: string = `Popup and dwim commands
  //   A Cherry-picking    b Branching         B Bisecting         c Committing
  //   d Diffing           D Change diffs      e Ediff dwimming    E Ediffing
  //   f Fetching          F Pulling           l Logging           L Change logs
  //   m Merging           M Remoting          o Submodules        O Subtrees
  //   P Pushing           r Rebasing          t Tagging           T Notes
  //   V Reverting         w Apply patches     W Format patches    X Resetting
  //   y Show Refs         z Stashing          ! Running           % Worktree

  //  Applying changes
  //   a Apply          s Stage          u Unstage
  //   v Reverse        S Stage all      U Unstage all
  //   k Discard

  //  Essential commands
  //   g     refresh current buffer
  //   TAB   toggle section at point
  //   RET   visit thing at point
  //   C-h m show all key bindings`;

  static HelpText: string = `Popup and dwim commands
  b Branching         F Pulling           c Committing
  f Fetching          M Remoting          l Logging 
  m Merging           r Rebasing          t Tagging
  P Pushing           z Stashing          X Resetting
  y Show Refs 
 
Applying changes
  a Apply          s Stage          u Unstage
  k Discard        S Stage all      U Unstage all
  
 
Essential commands
  g     refresh current buffer
  TAB   toggle section at point
  RET   visit thing at point
  $     show git process view`;

  constructor(uri: Uri) {
    super(uri);

    const diffTextView = new TextView(HelpView.HelpText);
    diffTextView.isHighlightable = false;
    this.addSubview(diffTextView);
  }

  public update(repository: MagitRepository): void { }

  static encodeLocation(repository: MagitRepository): Uri {
    return Uri.parse(`${Constants.MagitUriScheme}:${HelpView.UriPath}?${repository.rootUri.path}#help`);
  }
}