import { MenuUtil, MenuState } from '../menu/menu';
import { MagitRepository } from '../models/magitRepository';
import { gitRun } from '../utils/gitRawRunner';
import { window } from 'vscode';

const applyPatchesMenu = {
  title: 'Apply patch',
  commands: [
    { label: 'w', description: 'Apply patch', action: applyPatches }
  ]
};

export async function applyPatchesCommands(repository: MagitRepository) {

  const switches = [
    // Simple patch menu switches
    { shortName: '-i', longName: '--index', description: 'Also apply to index' },
    { shortName: '-c', longName: '--cached', description: 'Only apply to index' },
    { shortName: '-3', longName: '--3way', description: 'Fall back on 3way merge' }
    // Options for outer layer patches menu
    // { shortName: '-s', longName: '--signoff', description: 'Add Signed-off-by lines' },
    // { shortName: '-c', longName: '--scissors', description: 'Remove text before scissors line' },
    // { shortName: '-k', longName: '--keep', description: 'Inhibit removal of email cruft' },
    // { shortName: '-b', longName: '--keep-non-patch', description: 'Limit removal of email cruft' },
    // { shortName: '-d', longName: '--committer-date-is-author-date', description: 'Use author date as committer date' },
    // { shortName: '-D', longName: '--ignore-date', description: 'Use committer date as author date' },
  ];

  return MenuUtil.showMenu(applyPatchesMenu, { repository, switches });
}

async function applyPatches({ repository, switches }: MenuState) {
  const patchPath = await window.showInputBox({ prompt: `Apply patch` }); //await pickFile(repository, 'Apply patch');

  if (patchPath) {
    const args = ['apply', ...MenuUtil.switchesToArgs(switches), '--', patchPath];
    return await gitRun(repository, args);
  }
}