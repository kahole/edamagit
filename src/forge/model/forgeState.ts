import { PullRequest } from './pullRequest';

export interface ForgeState {
  readonly forgeRemote: string;
  readonly pullRequests: PullRequest[];
}