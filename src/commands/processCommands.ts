import ProcessView from '../views/processView';
import { views } from '../extension';
import { workspace, window } from 'vscode';
import MagitUtils from '../utils/magitUtils';
import { MagitRepository } from '../models/magitRepository';

export async function processView(repository: MagitRepository) {
  const uri = ProcessView.encodeLocation(repository);

  const existingView = views.get(uri.toString());

  if (existingView) {
    existingView.update(repository.magitState);
  } else {
    views.set(uri.toString(), new ProcessView(uri));
  }

  return workspace.openTextDocument(uri).then(doc => window.showTextDocument(doc, { viewColumn: MagitUtils.showDocumentColumn(), preview: false }));
}
