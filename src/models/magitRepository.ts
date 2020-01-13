import { Repository } from '../typings/git';
import { MagitState } from './magitState';

export interface MagitRepository extends Repository {
  magitState?: MagitState;
}