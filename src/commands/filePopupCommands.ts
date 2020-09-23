import { Uri } from 'vscode';
import { MenuUtil, MenuState } from '../menu/menu';
import { MagitRepository } from '../models/magitRepository';
import * as Commit from './commitCommands';
import * as Staging from './stagingCommands';
import * as Blaming from './blamingCommands';
import * as Diffing from './diffingCommands';

const filePopupMenu = {
  title: 'File Actions',
  commands: [
    { label: 's', description: 'Stage', action: ({ repository, data }: MenuState) => Staging.stageFile(repository, data as Uri) },
    { label: 'u', description: 'Unstage', action: ({ repository, data }: MenuState) => Staging.unstageFile(repository, data as Uri) },
    { label: 'c', description: 'Commit', action: ({ repository }: MenuState) => Commit.magitCommit(repository) },
    // { label: 'D', description: 'Diff...', action: () => { } },
    { label: 'd', description: 'Diff', action: ({ repository, data }: MenuState) => Diffing.diffFile(repository, data as Uri) },
    // { label: 'L', description: 'Log...', action: () => { } },
    // { label: 'l', description: 'log', action: ({ repository, data }: MenuState) => logFile(repository, data as Uri)  },
    // { label: 't', description: 'trace', action: () => { } },
    // { label: 'B', description: 'Blame...', action: () => { } },
    { label: 'b', description: 'Blame', action: ({ repository, data }: MenuState) => Blaming.blameFile(repository, data as Uri) },
    // { label: 'n', description: 'prev blob', action: () => { } },
    // { label: 'n', description: 'next blob', action: () => { } }
  ]
};

export async function filePopup(repository: MagitRepository, fileUri: Uri) {
  return MenuUtil.showMenu(filePopupMenu, { repository, data: fileUri });
}