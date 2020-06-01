import { window, workspace } from 'vscode';
import { ConfigKey, ExtensionId } from '../common/constants';
import { defaultHelpKeyConfig, HelpKeyConfig } from '../config/helpKeyConfig';
import { views } from '../extension';
import { MagitRepository } from '../models/magitRepository';
import MagitUtils from '../utils/magitUtils';
import { HelpView } from '../views/helpView';

function getCoalescedConfig() {
  const userConfig = workspace.getConfiguration(ExtensionId).get<HelpKeyConfig>(ConfigKey.HelpKeyConfig);
  return { ...defaultHelpKeyConfig, ...userConfig };
}

export async function magitHelp(repository: MagitRepository) {
  const config = getCoalescedConfig();
  const uri = HelpView.encodeLocation(repository);
  views.set(uri.toString(), new HelpView(uri, config));
  workspace.openTextDocument(uri).then(doc => window.showTextDocument(doc, { viewColumn: MagitUtils.oppositeActiveViewColumn(), preserveFocus: true, preview: false }));
}