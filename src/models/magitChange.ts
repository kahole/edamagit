import { Change } from "../typings/git";

export interface MagitChange extends Change {
  diff?: string;
}
