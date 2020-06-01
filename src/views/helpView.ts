import { Uri, TextEditorCursorStyle } from 'vscode';
import * as Constants from '../common/constants';
import { HelpKeyConfig } from '../config/helpKeyConfig';
import { MagitRepository } from '../models/magitRepository';
import { MagitState } from '../models/magitState';
import { DocumentView } from './general/documentView';
import { TextView } from './general/textView';

function joinTexts(spacing: number, texts: string[]) {
  let joinedText = texts.length > 0 ? texts[0] : '';
  for (let i = 1; i < texts.length; i++) {
    const prev = texts[i - 1];
    const current = texts[i];

    const remainingSpacing = prev.length <= spacing ? spacing - prev.length : 0;
    joinedText += ' '.repeat(remainingSpacing) + current;
  }
  return joinedText;
}

function createHelpText(c: HelpKeyConfig) {
  return `Popup and dwim commands
  ${joinTexts(19, [`${c.cherryPick} Cherry-pick`, `${c.branch} Branch`, `${c.commit} Commit`])}
  ${joinTexts(19, [`${c.diff} Diff`, `${c.fetch} Fetch`, `${c.pull} Pull`])}
  ${joinTexts(19, [`${c.ignore} Ignore`, `${c.log} Log`, `${c.merge} Merge`])}
  ${joinTexts(19, [`${c.remote} Remote`, `${c.push} Push`, `${c.rebase} Rebase`])}
  ${joinTexts(19, [`${c.tag} Tag`, `${c.revert} Revert`, `${c.reset} Reset`])}
  ${joinTexts(19, [`${c.showRefs} Show Refs`, `${c.stash} Stash`, `${c.run} Run`, `${c.worktree} Worktree`])}

Applying changes
  ${joinTexts(17, [`${c.apply} Apply`, `${c.stage} Stage`, `${c.unstage} Unstage`])}
  ${joinTexts(17, [`${c.reverse} Reverse`, `${c.stageAll} Stage all`, `${c.unstageAll} Unstage all`])}
  ${c.discard} Discard

Essential commands
  ${joinTexts(6, [c.refresh, 'refresh current buffer'])}
  ${joinTexts(6, ['TAB', 'toggle section at point'])}
  ${joinTexts(6, ['RET', 'visit thing at point'])}
  ${joinTexts(6, [c.gitProcess, 'show git process view'])}`;
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