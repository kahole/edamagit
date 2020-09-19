import { View } from '../general/view';
import { Section, SectionHeaderView } from '../general/sectionHeader';
import { LineBreakView } from '../general/lineBreakView';
import { PullRequest } from '../../models/pullRequest';
import { TextView } from '../general/textView';

export class PullRequestSectionView extends View {
  isFoldable = true;

  get id() { return Section.Stashes.toString(); }

  constructor(prs: PullRequest[]) {
    super();
    this.subViews = [
      new SectionHeaderView(Section.PullRequests, prs.length),
      ...prs.map(pr => new PullRequestItemView(pr)),
      new LineBreakView()
    ];
  }
}

export class PullRequestItemView extends TextView {
  public get section() {
    return PullRequestItemView.getSection(this.pr);
  }

  private static getSection(pr: PullRequest) {
    return `#${pr.id}`;
  }

  constructor(public pr: PullRequest) {
    super(`${PullRequestItemView.getSection(pr)} ${pr.name}`);
  }
}