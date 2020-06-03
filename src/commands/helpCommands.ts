import { window, workspace } from 'vscode';
import MagitUtils from '../utils/magitUtils';
import { HelpView } from '../views/helpView';
import { views, logPath } from '../extension';
import { MagitRepository } from '../models/magitRepository';
import * as path from 'path';

export async function magitHelp(repository: MagitRepository) {

  let keybindingsPath = path.join(logPath, '..', '..', '..', '..', 'User', 'keybindings.json');
  let userKeyBindings = [];

  try {
    userKeyBindings = await workspace.openTextDocument(keybindingsPath).then(document =>
      JSON.parse(
        document
          .getText()
          .replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '')
      )
    );
  } catch { }

  const uri = HelpView.encodeLocation(repository);
  views.set(uri.toString(), new HelpView(uri, userKeyBindings));
  workspace.openTextDocument(uri).then(doc => window.showTextDocument(doc, { viewColumn: MagitUtils.oppositeActiveViewColumn(), preserveFocus: true, preview: false }));
}