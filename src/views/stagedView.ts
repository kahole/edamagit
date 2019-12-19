
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

import * as vscode from 'vscode';
import { MagitState } from '../models/magitState';
import { Section, SectionHeaderView } from './sectionHeader';
import { DocumentView } from './general/documentView';
import { TextView } from './general/textView';

export default class MagitStagedView extends DocumentView {

  // TODO: probably need dispose for document views
  dispose() {
    throw new Error("Method not implemented.");
  }

  constructor(uri: vscode.Uri, emitter: vscode.EventEmitter<vscode.Uri>, magitState: MagitState) {
    super(uri, emitter);

    // TODO: add the "1 file changed, 2 insertions(+)" lines

    if (magitState.indexChanges && magitState.indexChanges.length > 0) {

      this.addSubview(new SectionHeaderView(Section.Staged));

      this.addSubview(new TextView("TODO: X file changed, 2 insertions blabla"));

      // this.addSubview(new ChangeSectionView(Section.Staged, magitState.indexChanges));
    }
  }
}