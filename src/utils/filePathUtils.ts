import { dirname, sep } from 'path';
import { Uri } from 'vscode';

export default class FilePathUtils {

  // https://github.com/microsoft/vscode/blob/f667462a2a8a12c92dbcdd8acf92df7354063691/extensions/git/src/util.ts#L309
  private static isWindowsPath(path: string): boolean {
    return /^[a-zA-Z]:\\/.test(path);
  }

  // https://github.com/microsoft/vscode/blob/f667462a2a8a12c92dbcdd8acf92df7354063691/extensions/git/src/util.ts#L309
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

  public static pathRelativeTo(uri: Uri, root: Uri) {
    return uri.path.slice(root.path.length + 1);
  }
}