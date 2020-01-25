import * as Constants from '../common/constants';
import { MagitState } from '../models/magitState';
import { ChangeSectionView } from './changes/changesSectionView';
import { Section, SectionHeaderView } from './general/sectionHeader';
import { DocumentView } from './general/documentView';
import { StashSectionView } from './stashes/stashSectionView';
import { CommitSectionView } from './commits/commitSectionView';
import { BranchHeaderView } from './branches/branchHeaderView';
import { TextView } from './general/textView';
import { LineBreakView } from './general/lineBreakView';
import { Uri, EventEmitter } from 'vscode';
import { BranchSectionView } from './branches/branchSectionView';
import { MergingSectionView } from './merging/mergingSectionView';

export default class MagitStatusView extends DocumentView {

  static UriPath: string = 'status.magit';

  constructor(uri: Uri, magitState: MagitState) {
    super(uri);

    if (magitState.latestGitError) {
      this.addSubview(new TextView(`GitError! ${magitState.latestGitError}`));
    }

    this.addSubview(new BranchSectionView(magitState.HEAD));

    this.addSubview(new LineBreakView());

    if (magitState.mergingState) {
      this.addSubview(new MergingSectionView(magitState.mergingState));
    }

    // TODO: Rebasing status
    if (magitState.rebaseCommit) {
      // magitState.rebaseCommit.message

      // example:
      // Rebasing {branch} onto {branch}
      // join somethind
      // done something
      // onto something
    }

    if (magitState.untrackedFiles.length) {
      this.addSubview(new ChangeSectionView(Section.Untracked, magitState.untrackedFiles));
    }

    if (magitState.workingTreeChanges.length || magitState.mergeChanges.length) {
      this.addSubview(new ChangeSectionView(Section.Unstaged, [...magitState.mergeChanges, ...magitState.workingTreeChanges]));
    }

    if (magitState.indexChanges.length) {
      this.addSubview(new ChangeSectionView(Section.Staged, magitState.indexChanges));
    }

    if (magitState.stashes?.length) {
      this.addSubview(new StashSectionView(magitState.stashes));
    }

    if (magitState.HEAD?.ahead || magitState.HEAD?.behind) {

      if (magitState.HEAD?.commitsAhead?.length) {
        this.addSubview(
          new CommitSectionView(new TextView(`${Section.UnmergedInto} ${magitState.HEAD.upstream?.remote}/${magitState.HEAD.upstream?.name} (${magitState.HEAD?.commitsAhead?.length})`),
            magitState.HEAD.commitsAhead));
      }

      if (magitState.HEAD?.commitsBehind?.length) {
        this.addSubview(
          new CommitSectionView(new TextView(`${Section.UnpulledFrom} ${magitState.HEAD.upstream?.remote}/${magitState.HEAD.upstream?.name} (${magitState.HEAD?.commitsBehind?.length})`),
            magitState.HEAD.commitsBehind));
      }

    } else if (magitState.log.length > 0) {
      this.addSubview(new CommitSectionView(new SectionHeaderView(Section.RecentCommits), magitState.log));
    }
  }

  static encodeLocation(workspacePath: string): Uri {
    return Uri.parse(`${Constants.MagitUriScheme}:${MagitStatusView.UriPath}?${workspacePath}`);
  }
}