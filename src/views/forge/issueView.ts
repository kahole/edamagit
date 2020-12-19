import { DocumentView } from '../general/documentView';
import { Uri } from 'vscode';
import * as Constants from '../../common/constants';
import { TextView, UnclickableTextView } from '../general/textView';
import { Issue, IssueComment } from '../../forge/model/issue';
import { MagitRepository } from '../../models/magitRepository';
import { View } from '../general/view';
import { LineBreakView } from '../general/lineBreakView';
import formatDistanceToNowStrict from 'date-fns/formatDistanceToNowStrict';

export class IssueView extends DocumentView {

  static UriPath: string = 'issue.magit';

  constructor(uri: Uri, public issue: Issue) {
    super(uri);
    this.provideContent(issue);
  }

  provideContent(issue: Issue) {
    this.subViews = [
      new IssueHeader(issue),
      new LineBreakView(),
      new IssueCommentView({ author: issue.author, bodyText: issue.bodyText, createdAt: issue.createdAt }),
      new IssueCommentSection(issue.comments)
    ];
  }

  public update(state: MagitRepository): void {
    let updatedIssue = state.forgeState?.issues.find(i => i.number === this.issue.number);

    if (updatedIssue) {
      this.issue = updatedIssue;
      this.provideContent(this.issue);
      this.triggerUpdate();
    }
  }

  static encodeLocation(repository: MagitRepository, issue: Issue): Uri {
    return Uri.parse(`${Constants.MagitUriScheme}:${IssueView.UriPath}?${repository.uri.fsPath}#${issue.number}`);
  }
}

class IssueHeader extends View {
  isFoldable = true;

  get id() { return `issueHeader#${this.issue.number}`; }

  constructor(private issue: Issue) {
    super();
    this.addSubview(new UnclickableTextView(`#${issue.number}: ${issue.title}`));
    this.addSubview(new TextView(`Title: ${issue.title}`));
    this.addSubview(new TextView(`State: open`));
    this.addSubview(new TextView(`Labels: ${issue.labels.map(l => `[${l.name}]`).join(' ')}`));
  }
}

export class IssueCommentSection extends View {

  constructor(comments: IssueComment[]) {
    super();
    this.addSubview(...comments.map(c => new IssueCommentView(c)));
  }
}

export class IssueCommentView extends View {
  isFoldable = true;

  get id() { return `issueComment#${this.comment.author}${this.comment.createdAt}`; }

  constructor(private comment: IssueComment) {
    super();
    this.addSubview(
      new IssueCommentHeaderView(comment),
      new TextView(comment.bodyText),
      new LineBreakView(2)
    );
  }
}

class IssueCommentHeaderView extends UnclickableTextView {
  constructor(comment: IssueComment) {
    super();

    let timeDistance = formatDistanceToNowStrict(Date.parse(comment.createdAt));
    // let arrow = this.folded ? '▶' : '▼';

    this.textContent = `• ${comment.author} ${timeDistance}`;
  }
}