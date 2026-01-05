import * as assert from 'assert';
import * as vscode from 'vscode';
import * as extension from '../../extension';
import { RefType } from '../../typings/git';
import MagitStatusView from '../../views/magitStatusView';

const TEST_REPO_FILE1 = '/README.md';
const TEST_REPO_FILE2 = '/another.txt';

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.');
  // TODO - integration tests for the extension can go here.
  test('Magit Status View render test', async () => {
  });
});
