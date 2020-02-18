import { window, workspace } from 'vscode';
import MagitUtils from '../utils/magitUtils';
import { HelpView } from '../views/helpView';
import { views } from '../extension';
import { MagitRepository } from '../models/magitRepository';

export async function magitHelp(repository: MagitRepository) {

  // MINOR: everywhere; Combine encode and contructor
  //  and just read helpView.uri when setting it in views
  const uri = HelpView.encodeLocation(repository);
  views.set(uri.toString(), new HelpView(uri));
  workspace.openTextDocument(uri).then(doc => window.showTextDocument(doc, MagitUtils.oppositeActiveViewColumn(), true));
  // commands.executeCommand('workbench.action.quickOpen', '>Magit ');
}