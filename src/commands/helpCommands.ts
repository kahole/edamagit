import { workspace } from 'vscode';
import { HelpView } from '../views/helpView';
import { MagitRepository } from '../models/magitRepository';
import * as path from 'path';
import * as JSONC from 'jsonc-parser';
import ViewUtils from '../utils/viewUtils';
import { logPath } from '../extension';

export async function magitHelp(repository: MagitRepository) {
  return openHelpView(repository);
}

export async function magitDispatch(repository: MagitRepository) {
  return openHelpView(repository);
}

async function openHelpView(repository: MagitRepository) {
  let keybindingsPath = path.join(logPath, '..', '..', '..', '..', 'User', 'keybindings.json');
  let userKeyBindings = [];

  try {
    const userKeyBindingsDoc = await workspace.openTextDocument(keybindingsPath);
    const userKeyBindingsText = userKeyBindingsDoc.getText().replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
    userKeyBindings = JSONC.parse(userKeyBindingsText);
  } catch (e) { console.error(e); }

  const uri = HelpView.encodeLocation(repository);
  return ViewUtils.showView(uri, new HelpView(uri, userKeyBindings));
}