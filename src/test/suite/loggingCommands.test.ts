import * as assert from 'assert';
import { _private } from '../../commands/loggingCommands';
import { MagitLogEntry } from '../../models/magitLogCommit';

const parseLog = _private.parseLog;

suite('logging commands', () => {
  test('parseLog - basic commit', () => {
    const stdout = `6c14d032e1a0b04df3b5aabd62a0a3a8a0e1a2b1 [John Doe] [1717171717]Commit message`;
    const entries = parseLog(stdout);
    assert.strictEqual(entries.length, 1);
    const entry = entries[0];
    assert.strictEqual(entry.commit.hash, '6c14d032e1a0b04df3b5aabd62a0a3a8a0e1a2b1');
    assert.strictEqual(entry.author, 'John Doe');
    assert.strictEqual(entry.time.getTime(), 1717171717000);
    assert.strictEqual(entry.commit.message, 'Commit message');
    assert.strictEqual(entry.refs.length, 0);
    assert.strictEqual(entry.graph, undefined);
  });

  test('parseLog - commit with refs', () => {
    const stdout = `6c14d032e1a0b04df3b5aabd62a0a3a8a0e1a2b1 (HEAD -> master, origin/master) [John Doe] [1717171717]Commit message`;
    const entries = parseLog(stdout);
    assert.strictEqual(entries.length, 1);
    const entry = entries[0];
    assert.deepStrictEqual(entry.refs, ['HEAD -> master', 'origin/master']);
  });

  test('parseLog - commit with graph', () => {
    const stdout = `* 6c14d032e1a0b04df3b5aabd62a0a3a8a0e1a2b1 [John Doe] [1717171717]Commit message`;
    const entries = parseLog(stdout);
    assert.strictEqual(entries.length, 1);
    const entry = entries[0];
    assert.deepStrictEqual(entry.graph, ['* ']);
  });

  test('parseLog - graph only line', () => {
    const stdout = `* 6c14d032e1a0b04df3b5aabd62a0a3a8a0e1a2b1 [John Doe] [1717171717]Commit message\n|\\`;
    const entries = parseLog(stdout);
    assert.strictEqual(entries.length, 1);
    const entry = entries[0];
    assert.deepStrictEqual(entry.graph, ['* ', '|\\']);
  });

  test('parseLog - multiple refs', () => {
    const stdout = `6c14d032e1a0b04df3b5aabd62a0a3a8a0e1a2b1 (tag: v1.0, origin/feature) [John Doe] [1717171717]Commit message`;
    const entries = parseLog(stdout);
    assert.strictEqual(entries.length, 1);
    const entry = entries[0];
    assert.deepStrictEqual(entry.refs, ['tag: v1.0', 'origin/feature']);
  });

  test('parseLog - special characters in message', () => {
    const stdout = `6c14d032e1a0b04df3b5aabd62a0a3a8a0e1a2b1 [John Doe] [1717171717] [Fix] issue #123: "critical" bug`;
    const entries = parseLog(stdout);
    assert.strictEqual(entries.length, 1);
    const entry = entries[0];
    assert.strictEqual(entry.commit.message, ' [Fix] issue #123: "critical" bug');
  });
});
