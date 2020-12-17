import { Label } from './label';

export interface Issue {
  number: number;
  state: IssueState,
  author: string;
  title: string;
  createdAt: string;
  bodyText: string;
  comments: IssueComment[];
  assignees: ForgeUser[],
  labels: Label[];
}

export enum IssueState {
  Open,
  Closed
}

export interface ForgeUser { displayName: string, username: string, email: string }

export interface IssueComment {
  author: string;
  createdAt: string;
  bodyText: string;
}