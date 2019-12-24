
// Staged changes
// 1 file changed, 2 insertions(+)
// lib/oving2/application.ex | 2 ++

// modified   lib/oving2/application.ex
// @@ -16,6 +16,8 @@ defmodule Oving2.Application do
//      # for other strategies and supported options
//      opts = [strategy: :one_for_one, name: Oving2.Supervisor]
//      Supervisor.start_link(children, opts)
// +
// +    # Adding some comment

//    end
//  end

import * as Constants from "../common/constants";
import { MagitState } from '../models/magitState';
import { Section } from './general/sectionHeader';
import { DocumentView } from './general/documentView';
import { Uri, EventEmitter } from "vscode";
import { ChangeSectionView } from "./changes/changesSectionView";

export default class MagitStagedView extends DocumentView {

  static UriPath: string = "staged.magit";

  constructor(uri: Uri, magitState: MagitState) {
    super(uri);

    if (magitState.indexChanges && magitState.indexChanges.length > 0) {

      this.subViews = [
        new ChangeSectionView(Section.Staged, magitState.indexChanges)
        // without count of changes:
        // new SectionHeaderView(Section.Staged),
        // ...magitState.indexChanges.map(change => new ChangeView(change))
      ];
    }
  }

  static encodeLocation(workspacePath: string): Uri {
    return Uri.parse(`${Constants.MagitUriScheme}:${MagitStagedView.UriPath}?${workspacePath}`);
  }
}