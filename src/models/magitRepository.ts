import { Repository } from "../typings/git";
import { MagitState } from "./magitState";
import { View } from "../views/general/view";

export interface MagitRepository extends Repository {
  magitState?: MagitState;
}