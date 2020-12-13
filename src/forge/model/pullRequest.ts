export interface PullRequest {
  id: number;
  title: string;
  labels: Label[];
  remoteRef: string;
}

export interface Label {
  name: string;
  color: string;
}