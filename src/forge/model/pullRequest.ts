import { ForgeUser, IssueComment } from './issue';
import { Label } from './label';

export interface PullRequest {
  number: number;
  title: string;
  remoteRef: string;
  author: string;
  createdAt: string;
  bodyText: string;
  comments: IssueComment[];
  assignees: ForgeUser[],
  labels: Label[];
}
