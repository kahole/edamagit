import * as Constants from '../common/constants';
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
import { BranchSectionView } from './branches/branchSectionView';

export default class MagitStatusView extends DocumentView {

  static UriPath: string = 'status.magit';

  constructor(uri: Uri, magitState: MagitState) {
    super(uri);

    if (magitState.latestGitError) {
      this.addSubview(new TextView(`GitError! ${magitState.latestGitError}`));
    }

    this.addSubview(new BranchSectionView(magitState.HEAD));

    this.addSubview(new LineBreakView());

    // TODO: Rebasing status. Instead of upstream or how does that go? same for merge
    if (magitState.rebaseCommit) {
      // magitState.rebaseCommit.message

      // example:
      // Rebasing {branch} onto {branch}
      // join somethind
      // done something
      // onto something
    }

    // TODO: Merging status
    if (magitState.mergeChanges.length > 0) {
      // this.addSubview(new BranchHeaderView('Merging', { name: magitState.mergeBase }));
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

      // TODO: these dont get data yet in statusCommands.ts
      // umerged into section
      // and Unpulled from
      if (magitState.HEAD?.commitsAhead) {
        this.addSubview(new CommitSectionView(Section.UnmergedInto, magitState.HEAD.commitsAhead));
      }

      if (magitState.HEAD?.commitsBehind) {
        this.addSubview(new CommitSectionView(Section.UnpulledFrom, magitState.HEAD.commitsBehind));
      }

    } else if (magitState.log.length > 0) {
      this.addSubview(new CommitSectionView(Section.RecentCommits, magitState.log));
    }
  }

  static encodeLocation(workspacePath: string): Uri {
    return Uri.parse(`${Constants.MagitUriScheme}:${MagitStatusView.UriPath}?${workspacePath}`);
  }
}