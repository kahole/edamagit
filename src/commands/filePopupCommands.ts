import { Uri } from 'vscode';
import { MenuUtil, MenuState } from '../menu/menu';
import { MagitRepository } from '../models/magitRepository';
import { magitCommit } from './commitCommands';
import { stageFile, unstageFile } from './stagingCommands';
import { blameFile } from './blamingCommands';
import { diffFile } from './diffingCommands';

const branchingMenu = {
  title: 'File Actions',
  commands: [
    { label: 's', description: 'Stage', action: ({ repository, data }: MenuState) => stageFile(repository, data as Uri) },
    { label: 'u', description: 'Unstage', action: ({ repository, data }: MenuState) => unstageFile(repository, data as Uri) },
    { label: 'c', description: 'Commit', action: ({ repository }: MenuState) => magitCommit(repository) },
    // { label: 'D', description: 'Diff...', action: () => { } },
    { label: 'd', description: 'diff', action: ({ repository, data }: MenuState) => diffFile(repository, data as Uri)  },
    // { label: 'L', description: 'Log...', action: () => { } },
    // { label: 'l', description: 'log', action: ({ repository, data }: MenuState) => logFile(repository, data as Uri)  },
    // { label: 't', description: 'trace', action: () => { } },
    // { label: 'B', description: 'Blame...', action: () => { } },
    { label: 'b', description: 'blame', action: ({ repository, data }: MenuState) => blameFile(repository, data as Uri) },
    // { label: 'n', description: 'prev blob', action: () => { } },
    // { label: 'n', description: 'next blob', action: () => { } }
  ]
};

export async function filePopup(repository: MagitRepository, fileUri: Uri) {
  return MenuUtil.showMenu(branchingMenu, { repository, data: fileUri });
}