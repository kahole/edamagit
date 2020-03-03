import { Ref } from '../typings/git';

export interface MagitRemote {
  readonly name: string;
  readonly fetchUrl?: string;
  readonly pushUrl?: string;
  readonly isReadOnly: boolean;
  readonly branches: Ref[];
}