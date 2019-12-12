import { MagitChangeHunk } from "../models/magitChangeHunk";
import { FinalLineBreakRegex } from "../common/constants";

export default class GitTextUtils {
  
  public static diffToHunks(diff: string): MagitChangeHunk[] {

    let hunksStart = diff.indexOf("@@");
    let diffHeader = diff.slice(0, hunksStart);

    return diff
      .replace(FinalLineBreakRegex, '') // removes extra line break at the end
      .slice(hunksStart)
      .split(/\n(?=^@@.*@@.*$)/gm)
      .map(hunkText => ({ diff: hunkText, diffHeader }));
  }
}