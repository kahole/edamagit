import { View } from '../general/view';
import { Section, SectionHeaderView } from '../general/sectionHeader';
import { LineBreakView } from '../general/lineBreakView';
import { TextView } from '../general/textView';
import { Issue } from '../../forge/model/issue';

export class IssueSectionView extends View {
  isFoldable = true;

  get id() { return Section.Issues.toString(); }

  constructor(issues: Issue[]) {
    super();
    this.subViews = [
      new SectionHeaderView(Section.Issues, issues.length),
      ...issues.map(issue => new IssueItemView(issue)),
      new LineBreakView()
    ];
  }
}

export class IssueItemView extends TextView {
  public get section() {
    return IssueItemView.getSection(this.issue);
  }

  private static getSection(issue: Issue) {
    return `#${issue.number}`;
  }

  constructor(public issue: Issue) {
    super();
    let labels = issue.labels.map(label => `[${label.name}]`).join(' ');

    this.textContent = `${IssueItemView.getSection(issue)} ${issue.title}${labels.length ? ' ' + labels : ''}`;
  }
}