import { QuickPickItem } from "vscode";
import { MagitRepository } from "../models/magitRepository";
import MagitStatusView from "../views/magitStatusView";

export interface MenuItem extends QuickPickItem {
  action: (repository: MagitRepository, view: MagitStatusView) => void;
}