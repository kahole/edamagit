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

  test('parseLog - brackets in author', () => {
    const stdout = `6c14d032e1a0b04df3b5aabd62a0a3a8a0e1a2b1 [renovate[bot]] [1717171717][Fix] Commit message`;
    const entries = parseLog(stdout);
    assert.strictEqual(entries.length, 1);
    const entry = entries[0];
    assert.strictEqual(entry.author, 'renovate[bot]');
    assert.strictEqual(entry.commit.message, '[Fix] Commit message');
  });

  test('parseLog - stacked branches', () => {
    const stdout = `* 1ecd4d86541061443256f182c66e50dd41149dc4 (HEAD -> master) [John Doe] [1767627918]More on master
| * a87ae81140bd5e67b09e48898ccd6574e6d7eb14 (branch_1_a) [John Doe] [1767627879]A line from branch_1_a
| * 1f2d2f198ba7455e61368987d8f6192af3022cea (branch_1) [John Doe] [1767627835]branch 1 commit
|/
* 9b1e93cc66e93107d71627dd1fe8eb708f540e08 [John Doe] [1767627194]Edit`

    const entries = parseLog(stdout);
    assert.strictEqual(entries.length, 4);
  });

});
