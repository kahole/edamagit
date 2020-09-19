export interface PullRequest {
  id: number;
  name: string;
  labels: Label[];
  remoteRef: string;
}

export interface Label {
  name: string;
  color: string;
}