import { DocumentView } from "./general/documentView";
import { Uri, EventEmitter } from "vscode";
import * as Constants from "../common/constants";
import { TextView } from "./general/textView";
import { Commit } from "../typings/git";
import { View } from "./general/view";

export class CommitDetailView extends View { // extends DocumentView {

  static UriPath: string = "commit.magit";

  constructor(public uri: Uri, commit: Commit) {
    super();

    this.addSubview(new TextView(commit.hash));
    this.addSubview(new TextView(commit.authorEmail));

  }

  static encodeLocation(commitHash: string): Uri {
    return Uri.parse(`${Constants.MagitUriScheme}:${CommitDetailView.UriPath}?${commitHash}`);
  }
}