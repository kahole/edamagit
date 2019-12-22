import * as Constants from "../common/constants";
import { MagitState } from '../models/magitState';
import { ChangeSectionView } from './changes/changesSectionView';
import { Section } from './general/sectionHeader';
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

    if (magitState.HEAD?.commit) {
      this.addSubview(new BranchHeaderView("Head", magitState.HEAD));

      // TODO: refactor pull out
      // Commit hash for these is availble throught repository state REFS
      //   good opportunity to decide what to do with commit cache
      this.addSubview(new TextView("Upstream/Merge/rebase: " + magitState.HEAD.upstream?.remote + "/" + magitState.HEAD?.upstream?.name + " WHAT COMMIT MSG"));
      this.addSubview(new TextView("Push: " + magitState.HEAD.pushRemote?.remote + "/" + magitState.HEAD?.pushRemote?.name + " WHAT COMMIT MSG"));

    } else {
      this.addSubview(new TextView("In the beginning there was darkness"));
    }

    this.addSubview(new LineBreakView());

    if (magitState.untrackedFiles.length > 0) {
      this.addSubview(new ChangeSectionView(Section.Untracked, magitState.untrackedFiles));
    }

    if (magitState.workingTreeChanges.length > 0) {
      this.addSubview(new ChangeSectionView(Section.Unstaged, magitState.workingTreeChanges));
    }

    if (magitState.indexChanges.length > 0) {
      this.addSubview(new ChangeSectionView(Section.Staged, magitState.indexChanges));
    }

    if (magitState.stashes?.length > 0) {
      this.addSubview(new StashSectionView(magitState.stashes));
    }

    if (magitState.HEAD?.ahead || magitState.HEAD?.behind) {

      // TODO: umerged into section
      // and Unpulled from

    } else if (magitState.log.length > 0) {
      this.addSubview(new CommitSectionView(magitState.log));
    }
  }

  static encodeLocation(workspacePath: string): Uri {
    return Uri.parse(`${Constants.MagitUriScheme}:${MagitStatusView.UriPath}?${workspacePath}`);
  }
}