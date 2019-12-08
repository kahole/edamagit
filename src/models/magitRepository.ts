import { Repository } from "../typings/git";
import { MagitState } from "./magitStatus";

export interface MagitRepository extends Repository {
  magitState?: MagitState;
}