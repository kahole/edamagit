import { View } from '../general/view';
import { Section, SectionHeaderView } from '../general/sectionHeader';
import { LineBreakView } from '../general/lineBreakView';
import { PullRequest } from '../../forge/model/pullRequest';
import { TextView } from '../general/textView';

export class PullRequestSectionView extends View {
  isFoldable = true;

  get id() { return Section.PullRequests.toString(); }

  constructor(pullRequests: PullRequest[]) {
    super();
    this.subViews = [
      new SectionHeaderView(Section.PullRequests, pullRequests.length),
      ...pullRequests.map(pr => new PullRequestItemView(pr)),
      new LineBreakView()
    ];
  }
}

export class PullRequestItemView extends TextView {
  public get section() {
    return PullRequestItemView.getSection(this.pullRequest);
  }

  private static getSection(pullRequest: PullRequest) {
    return `#${pullRequest.number}`;
  }

  constructor(public pullRequest: PullRequest) {
    super();
    let labels = pullRequest.labels.map(label => `[${label.name}]`).join(' ');

    this.textContent = `${PullRequestItemView.getSection(pullRequest)} ${pullRequest.title}${labels.length ? ' ' + labels : ''}`;
  }
}