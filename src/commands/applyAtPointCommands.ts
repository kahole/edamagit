import { window } from 'vscode';
import { MagitRepository } from '../models/magitRepository';
import { CommitItemView } from '../views/commits/commitSectionView';
import { DocumentView } from '../views/general/documentView';
import { gitRun } from '../utils/gitRawRunner';
import { StashItemView } from '../views/stashes/stashSectionView';
import { cherryPick } from './cherryPickingCommands';
import { BranchListingView } from '../views/branches/branchListingView';
import { RemoteBranchListingView } from '../views/remotes/remoteBranchListingView';
import { TagListingView } from '../views/tags/tagListingView';

export async function magitApplyEntityAtPoint(repository: MagitRepository, currentView: DocumentView): Promise<any> {

  const selectedView = currentView.click(window.activeTextEditor!.selection.active);

  if (selectedView instanceof CommitItemView) {

    const commit = (selectedView as CommitItemView).commit;

    return cherryPick(repository, commit.hash, { noCommit: true });

  } else if (selectedView instanceof BranchListingView ||
    selectedView instanceof RemoteBranchListingView ||
    selectedView instanceof TagListingView) {

    const ref = (selectedView as BranchListingView).ref;

    // TODO: something wrong with show-refs view, it gets stale and doesnt click on views after some time!!!

    if (ref.commit) {
      return cherryPick(repository, ref.commit, { noCommit: true });
    }

  } else if (selectedView instanceof StashItemView) {

    const stash = (selectedView as StashItemView).stash;

    const args = ['stash', 'apply', '--index', stash.index.toString()];
    return gitRun(repository, args);
  }
}

interface ApplyOptions {
  index?: boolean;
  reverse?: boolean;
}

export async function apply(repository: MagitRepository, patch: string, { index, reverse }: ApplyOptions) {

  const args = ['apply', '--ignore-space-change'];

  if (index) {
    args.push('--cached');
  }

  if (reverse) {
    args.push('--reverse');
  }

  return gitRun(repository, args, { input: patch });
}