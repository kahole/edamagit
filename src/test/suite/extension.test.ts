import * as assert from 'assert';
import * as vscode from 'vscode';
import * as extension from '../../extension';
import { MagitState } from '../../models/magitState';
import { RefType } from '../../typings/git';
import MagitStatusView from '../../views/magitStatusView';

const TEST_REPO_FILE1 = '/README.md';
const TEST_REPO_FILE2 = '/another.txt';

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.');

  test('Magit Status View render test', async () => {

    const expected = `Head:     somebranch ok\n`;

    const magitState: MagitState = {
      indexChanges: [],
      log: [],
      mergeChanges: [],
      stashes: [],
      untrackedFiles: [],
      workingTreeChanges: [],
      branches: [],
      remotes: [],
      tags: [],
      submodules: [],
      HEAD: {
        name: 'somebranch',
        type: RefType.Head,
        commitDetails: {
          hash: '1111111111',
          message: 'ok',
          parents: []
        }
      }
    };

    const statusView = new MagitStatusView(vscode.Uri.parse(''), magitState);

    const result = statusView.render(0).join('\n');

    assert.equal(result, expected);
  });
});
