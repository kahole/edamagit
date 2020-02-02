import { sep } from 'path';
import { Uri } from 'vscode';

export default class FilePathUtils {

  private static isWindowsPath(path: string): boolean {
    return /^[a-zA-Z]:\\/.test(path);
  }

  public static isDescendant(parent: string, descendant: string): boolean {

    if (parent === descendant) {
      return true;
    }

    if (parent.charAt(parent.length - 1) !== sep) {
      parent += sep;
    }

    // Windows is case insensitive
    if (FilePathUtils.isWindowsPath(parent)) {
      parent = parent.toLowerCase();
      descendant = descendant.toLowerCase();
    }

    return descendant.startsWith(parent);
  }

  public static uriPathRelativeTo(uri: Uri, root: Uri) {
    return uri.path.slice(root.path.length + 1);
  }
}