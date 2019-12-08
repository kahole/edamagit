import { Repository } from "./typings/git";

export interface BaseRepository extends Repository {
  getStashes(): Promise<Stash[]>;
  pushTo(remote?: string, name?: string, setUpstream?: boolean, forcePushMode?: ForcePushMode): Promise<void>;
}

// Repository.prototype.getStashes = function(this: any) {
//   return this._repository.getStashes();
// };

declare module "./typings/git" {
  export interface Repository {
    readonly _repository: BaseRepository;
  }
}

// Repository.prototype.getStashes = function(this: any) {
//   return this._repository.getStashes();
// };

// (Repository.fn as any).getStashes = function () {
//   const _self = this as moment.Moment;
//   return _self.year() - 1911;
// }

// types from /extensions/git/src/git.ts

export interface Stash {
	index: number;
	description: string;
}

export enum ForcePushMode {
	Force,
	ForceWithLease
}