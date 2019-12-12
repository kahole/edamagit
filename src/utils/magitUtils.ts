import { MagitRepository } from "../models/magitRepository";
import { magitRepositories } from "../extension";
import { window } from "vscode";


export default class MagitUtils {
  public static getCurrentMagitRepo(): MagitRepository | undefined {
    if (window.activeTextEditor) {
      return magitRepositories[window.activeTextEditor.document.uri.query];
    }
  }
}