import { MagitRepository } from "../models/magitRepository";
import { magitRepositories } from "../extension";
import { window } from "vscode";

export function getCurrentMagitRepo(): MagitRepository | undefined {
  if (window.activeTextEditor) {
    return magitRepositories[window.activeTextEditor.document.uri.query];
  }
}