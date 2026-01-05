import { Commit } from "../typings/git";

export interface MagitBisectState {
  bisecting: boolean;
  good?: Commit['hash'];
  bad?: Commit['hash'];
}
