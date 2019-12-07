import { workspace, languages, window, extensions, commands, ExtensionContext, Disposable, ViewColumn, FileChangeType } from 'vscode';
import ContentProvider, { encodeLocation } from './contentProvider';
import { GitExtension } from './typings/git';
import { InflateStatus, MagitStatus } from './model/magitStatus';
import { isDescendant } from './util';

export let magitStatuses: {[id: string]: MagitStatus} = {};

export function activate(context: ExtensionContext) {

  if (workspace.workspaceFolders && workspace.workspaceFolders[0]) {

    let gitExtension = extensions.getExtension<GitExtension>('vscode.git')!.exports;
    const gitApi = gitExtension.getAPI(1);

    const rootPath = workspace.workspaceFolders[0].uri.fsPath;

    const repository = gitApi.repositories.filter(r => isDescendant(r.rootUri.fsPath, rootPath))[0];

    const provider = new ContentProvider();

    const providerRegistrations = Disposable.from(
      workspace.registerTextDocumentContentProvider(ContentProvider.scheme, provider)
    );

    let disposable = commands.registerCommand('extension.magit', async () => {

      const uri = encodeLocation(rootPath);

      InflateStatus(repository)
        .then(m => {
          magitStatuses[uri.query] = m;
          
          workspace.openTextDocument(uri).then(doc => window.showTextDocument(doc, ViewColumn.Beside));
          
        });
    });

    context.subscriptions.push(
      provider,
      providerRegistrations,
      disposable
    );
  }
}

// this method is called when your extension is deactivated
export function deactivate() { }
