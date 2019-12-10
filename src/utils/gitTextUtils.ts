import { MagitChangeHunk } from "../models/magitChangeHunk";
import { FinalLineBreakRegex } from "../common/constants";

export class GitTextUtils {
  public static diffToHunks(diff: string): MagitChangeHunk[] {

    return diff
      .replace(FinalLineBreakRegex, '') // remove extra line break at the end
      .substring(diff.indexOf("@@"))
      .split(/\n(?=^@@.*@@.*$)/gm)
      .map(hunkText => ({ diff: hunkText }));
  }
}