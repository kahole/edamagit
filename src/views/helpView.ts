import { Uri } from 'vscode';
import * as Constants from '../common/constants';
import { HelpKeyConfig } from '../config/helpKeyConfig';
import { MagitRepository } from '../models/magitRepository';
import { MagitState } from '../models/magitState';
import { DocumentView } from './general/documentView';
import { TextView } from './general/textView';

function createHelpText(c: HelpKeyConfig) {
  return `Popup and dwim commands
  ${c.cherryPick} Cherry-pick       ${c.branch} Branch            ${c.commit} Commit
  ${c.diff} Diff              ${c.fetch} Fetch             ${c.pull} Pull
  ${c.ignore} Ignore            ${c.log} Log               ${c.merge} Merge
  ${c.remote} Remote            ${c.push} Push              ${c.rebase} Rebase
  ${c.tag} Tag               ${c.revert} Revert            ${c.reset} Reset
  ${c.showRefs} Show Refs         ${c.stash} Stash             ${c.run} Run             ${c.worktree} Worktree

Applying changes
  ${c.apply} Apply          ${c.stage} Stage          ${c.unstage} Unstage
  ${c.reverse} Reverse        ${c.stageAll} Stage all      ${c.unstageAll} Unstage all
  ${c.discard} Discard

Essential commands
 ${c.refresh}     refresh current buffer
 TAB   toggle section at point
 RET   visit thing at point
 ${c.gitProcess}     show git process view`;
}

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
  A Cherry-pick       b Branch            c Commit
  d Diff              f Fetch             F Pull
  i Ignore            l Log               m Merge
  M Remote            P Push              r Rebase
  t Tag               V Revert            X Reset
  y Show Refs         z Stash             ! Run             % Worktree
 
Applying changes
  a Apply          s Stage          u Unstage
  v Reverse        S Stage all      U Unstage all
  k Discard
  
Essential commands
  g     refresh current buffer
  TAB   toggle section at point
  RET   visit thing at point
  $     show git process view`;

  constructor(uri: Uri, config: HelpKeyConfig) {
    super(uri);

    const diffTextView = new TextView(createHelpText(config));
    diffTextView.isHighlightable = false;
    this.addSubview(diffTextView);
  }

  public update(state: MagitState): void { }

  static encodeLocation(repository: MagitRepository): Uri {
    return Uri.parse(`${Constants.MagitUriScheme}:${HelpView.UriPath}?${repository.rootUri.path}#help`);
  }
}