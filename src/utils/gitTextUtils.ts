
export class GitTextUtils {  
  public static keepOnlyChunksFromDiff(diff: string): string {
    return diff.substring(diff.indexOf("@@"));
  }
}