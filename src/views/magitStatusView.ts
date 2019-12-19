import * as Constants from "../common/constants";
import { MagitState } from '../models/magitState';
import { ChangeSectionView } from './changes/changesSectionView';
import { Section } from './sectionHeader';
import { DocumentView } from './general/documentView';
import { StashSectionView } from './stashes/stashSectionView';
import { CommitSectionView } from './commits/commitSectionView';
import { BranchHeaderView } from './branches/branchHeaderView';
import { TextView } from './general/textView';
import { LineBreakView } from './general/lineBreakView';
import { Uri, EventEmitter } from 'vscode';

export default class MagitStatusView extends DocumentView {

  static UriPath: string = "status.magit";

  constructor(uri: Uri, emitter: EventEmitter<Uri>, magitState: MagitState) {
    super(uri, emitter);

    if (magitState.HEAD) {
      this.addSubview(new BranchHeaderView("Head", magitState.HEAD));

      this.addSubview(new TextView("Upstream/Merge/rebase: " + magitState.HEAD.upstream?.remote + "/" + magitState.HEAD?.upstream?.name + " WHAT COMMIT MSG"));
      this.addSubview(new TextView("Push: " + magitState.HEAD.pushRemote?.remote + "/" + magitState.HEAD?.pushRemote?.name + " WHAT COMMIT MSG"));

    } else {
      this.addSubview(new TextView("In the beginning there was darkness"));
    }

    this.addSubview(new LineBreakView());

    if (magitState.untrackedFiles && magitState.untrackedFiles.length > 0) {
      this.addSubview(new ChangeSectionView(Section.Untracked, magitState.untrackedFiles));
    }

    if (magitState.workingTreeChanges && magitState.workingTreeChanges.length > 0) {
      this.addSubview(new ChangeSectionView(Section.Unstaged, magitState.workingTreeChanges));
    }

    if (magitState.indexChanges && magitState.indexChanges.length > 0) {
      this.addSubview(new ChangeSectionView(Section.Staged, magitState.indexChanges));
    }

    if (magitState.stashes && magitState.stashes?.length > 0) {
      this.addSubview(new StashSectionView(magitState.stashes));
    }

    // TODO: This has to do with TRACKING? 
    //   if Unmerged into origin/master, show that section
    //    probably something for Unpulled changes as well
    //  otherwise Recent commits:

    if (magitState.log && magitState.log.length > 0) {
      this.addSubview(new CommitSectionView(magitState.log));
    }
  }

  encodeLocation(workspacePath: string): Uri {
    return Uri.parse(`${Constants.MagitUriScheme}:${MagitStatusView.UriPath}?${workspacePath}`);
  }
}