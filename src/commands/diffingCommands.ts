import { Uri, workspace, window } from 'vscode';
import { MagitRepository } from '../models/magitRepository';
import { gitRun } from '../utils/gitRawRunner';
import { views } from '../extension';
import { DiffView } from '../views/diffView';

export async function diffFile(repository: MagitRepository, fileUri: Uri, index = false) {

  const args = ['diff'];

  if (index) {
    args.push('--cached');
  }

  args.push(fileUri.fsPath);

  const diffResult = await gitRun(repository, args);

  const uri = DiffView.encodeLocation(fileUri.path);
  views.set(uri.toString(), new DiffView(uri, diffResult.stdout));
  workspace.openTextDocument(uri).then(doc => window.showTextDocument(doc));
}