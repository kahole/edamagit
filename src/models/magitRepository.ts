import { Repository } from "../typings/git";
import { MagitState } from "./magitStatus";
import { View } from "../views/abstract/view";

export interface MagitRepository extends Repository {
  magitState?: MagitState;
  views?: Map<string, View>;
}