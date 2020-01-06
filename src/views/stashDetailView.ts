import { DocumentView } from "./general/documentView";
import { Uri, EventEmitter } from "vscode";
import * as Constants from "../common/constants";
import { TextView } from "./general/textView";
import { Commit } from "../typings/git";
import { Stash } from "../common/gitApiExtensions";

export class StashDetailView extends DocumentView {

  static UriPath: string = "stash.magit";

  constructor(public uri: Uri, stash: Stash) {
    super(uri);

    this.addSubview(new TextView(stash.index + ''));
    this.addSubview(new TextView(stash.description));
  }

  static encodeLocation(stash: Stash): Uri {
    return Uri.parse(`${Constants.MagitUriScheme}:${StashDetailView.UriPath}?${stash.index}`);
  }
}