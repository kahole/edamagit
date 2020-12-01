import { DocumentView } from './general/documentView';
import { Uri } from 'vscode';
import * as Constants from '../common/constants';
import { TextView } from './general/textView';
import { MagitRepository } from '../models/magitRepository';
import * as meta from '../../package.json';

export class HelpView extends DocumentView {

  static UriPath: string = 'help.magit';
  isHighlightable = false;
  needsUpdate = false;

  constructor(uri: Uri, userKeyBindings: any) {
    super(uri);

    let binds = HelpView.generateBindings(userKeyBindings);
    let diffTextView = new TextView(HelpView.createHelpText(binds));
    diffTextView.isHighlightable = false;
    this.addSubview(diffTextView);
  }

  public update(state: MagitRepository): void { }

  static encodeLocation(repository: MagitRepository): Uri {
    return Uri.parse(`${Constants.MagitUriScheme}:${HelpView.UriPath}?${repository.uri.path}#help`);
  }

  private static joinTexts(spacing: number, texts: string[]) {
    let joinedText = texts.length > 0 ? texts[0] : '';
    for (let i = 1; i < texts.length; i++) {
      const prev = texts[i - 1];
      const current = texts[i];

      const remainingSpacing = prev.length <= spacing ? spacing - prev.length : 0;
      joinedText += ' '.repeat(remainingSpacing) + current;
    }
    return joinedText;
  }

  private static keybindingToDisplayKey(bind: string): string {
    if (/shift(\+|-)[a-zA-Z]/g.test(bind)) {
      return bind.substring(6).toLocaleUpperCase();
    } else if (bind === 'enter') {
      return 'RET';
    } else if (bind === 'tab') {
      return 'TAB';
    }
    return bind;
  }

  private static generateBindings(userKeyBindings: any) {
    let binds = meta.contributes.keybindings.reduce((prev, bind) => ({
      ...prev,
      [bind.command]: HelpView.keybindingToDisplayKey(bind.key)
    }), {});

    binds = userKeyBindings.reduce((prev: any, bind: any) => ({
      ...prev,
      [bind.command]: HelpView.keybindingToDisplayKey(bind.key)
    }), binds);

    return binds;
  }

  private static createHelpText(c: any) {
    return `Popup and dwim commands
  ${HelpView.joinTexts(19, [`${c['magit.cherry-picking']} Cherry-pick`, `${c['magit.branching']} Branch`, `${c['magit.commit']} Commit`])}
  ${HelpView.joinTexts(19, [`${c['magit.diffing']} Diff`, `${c['magit.fetching']} Fetch`, `${c['magit.pulling']} Pull`])}
  ${HelpView.joinTexts(19, [`${c['magit.ignoring']} Ignore`, `${c['magit.logging']} Log`, `${c['magit.merging']} Merge`])}
  ${HelpView.joinTexts(19, [`${c['magit.remoting']} Remote`, `${c['magit.pushing']} Push`, `${c['magit.rebasing']} Rebase`])}
  ${HelpView.joinTexts(19, [`${c['magit.tagging']} Tag`, `${c['magit.reverting']} Revert`, `${c['magit.resetting']} Reset`])}
  ${HelpView.joinTexts(19, [`${c['magit.show-refs']} Show Refs`, `${c['magit.stashing']} Stash`, `${c['magit.running']} Run`])}
  ${HelpView.joinTexts(19, [`${c['magit.worktree']} Worktree`, `${c['magit.submodules']} Submodules`])}

Applying changes
  ${HelpView.joinTexts(17, [`${c['magit.apply-at-point']} Apply`, `${c['magit.stage']} Stage`, `${c['magit.unstage']} Unstage`])}
  ${HelpView.joinTexts(17, [`${c['magit.reverse-at-point']} Reverse`, `${c['magit.stage-all']} Stage all`, `${c['magit.unstage-all']} Unstage all`])}
  ${c['magit.discard-at-point']} Discard

Essential commands
  ${HelpView.joinTexts(9, [c['magit.refresh'], 'refresh current buffer'])}
  ${HelpView.joinTexts(9, [c['magit.toggle-fold'], 'toggle section at point'])}
  ${HelpView.joinTexts(9, [c['magit.visit-at-point'], 'visit thing at point'])}
  ${HelpView.joinTexts(9, [c['magit.process-log'], 'show git process view'])}
  ${HelpView.joinTexts(9, [c['magit.quit'], 'exit / close magit view'])}

  ${HelpView.joinTexts(9, [c['magit.move-next-entity'], 'Move cursor to next entity'])}
  ${HelpView.joinTexts(9, [c['magit.move-previous-entity'], 'Move cursor to previous entity'])}`;
  }
}