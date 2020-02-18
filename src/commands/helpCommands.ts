import { window, workspace } from 'vscode';
import MagitUtils from '../utils/magitUtils';
import { HelpView } from '../views/helpView';
import { views } from '../extension';
import { MagitRepository } from '../models/magitRepository';

export async function magitHelp(repository: MagitRepository) {

  const uri = HelpView.encodeLocation(repository);
  views.set(uri.toString(), new HelpView(uri));
  workspace.openTextDocument(uri).then(doc => window.showTextDocument(doc, MagitUtils.oppositeActiveViewColumn(), true));
}