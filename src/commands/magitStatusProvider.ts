import { MagitStatus } from "../model/magitStatus";

export async function magitStatus() : Promise<MagitStatus> {
  return {
    head: "",
    untrackedFiles: [],
    unstagedChanges: [],
    stashes: [],
    recentCommits: []
  };
}