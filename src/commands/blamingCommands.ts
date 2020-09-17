import { Uri, workspace, window } from 'vscode';
import { MagitRepository } from '../models/magitRepository';
import { gitRun } from '../utils/gitRawRunner';
import { BlameView } from '../views/blameView';
import { views } from '../extension';

export async function blameFile(repository: MagitRepository, fileUri: Uri) {

  const blameResult = await gitRun(repository.gitRepository, ['blame', fileUri.fsPath]);

  const uri = BlameView.encodeLocation(repository, fileUri);
  views.set(uri.toString(), new BlameView(uri, blameResult.stdout));
  workspace.openTextDocument(uri).then(doc => window.showTextDocument(doc, { preview: false }));
}