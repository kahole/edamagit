import { Uri } from 'vscode';
import { MenuUtil, MenuState } from '../menu/menu';
import { MagitRepository } from '../models/magitRepository';
import { magitCommit } from './commitCommands';
import { stageFile } from './stagingCommands';

const branchingMenu = {
  title: 'File Actions',
  commands: [
    { label: 's', description: 'Stage', action: ({ repository, data }: MenuState) => stageFile(repository, data as Uri) },
    { label: 'u', description: 'Unstage', action: () => { } },
    { label: 'c', description: 'Commit', action: ({ repository }: MenuState) => magitCommit(repository) },
    // { label: 'D', description: 'Diff...', action: () => { } },
    { label: 'd', description: 'diff', action: () => { } },
    // { label: 'L', description: 'Log...', action: () => { } },
    { label: 'l', description: 'log', action: () => { } },
    { label: 't', description: 'trace', action: () => { } },
    // { label: 'B', description: 'Blame...', action: () => { } },
    { label: 'b', description: 'blame', action: () => { } },
    // { label: 'n', description: 'prev blob', action: () => { } },
    // { label: 'n', description: 'next blob', action: () => { } }
  ]
};

export async function filePopup(repository: MagitRepository, fileUri: Uri) {
  // TODO: file popup MVP remains
  return MenuUtil.showMenu(branchingMenu, { repository, data: fileUri });
}