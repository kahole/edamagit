import { window } from "vscode";

// TODO:
// to be dynamic
// Just show the keymap for vscode magit
// that way its updated with users changes

export function magitHelp() {
  window.showInformationMessage(`Popup and dwim commands
  A Cherry-picking    b Branching         B Bisecting         c Committing
  d Diffing           D Change diffs      e Ediff dwimming    E Ediffing
  f Fetching          F Pulling           l Logging           L Change logs
  m Merging           M Remoting          o Submodules        O Subtrees
  P Pushing           r Rebasing          t Tagging           T Notes
  V Reverting         w Apply patches     W Format patches    X Resetting
  y Show Refs         z Stashing          ! Running           % Worktree
  
  Applying changes
  a Apply          s Stage          u Unstage
  v Reverse        S Stage all      U Unstage all
  k Discard
  
  Essential commands
  g     refresh current buffer
  TAB   toggle section at point
  RET   visit thing at point
  C-h m show all key bindings     `);
}