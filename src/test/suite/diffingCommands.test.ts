import * as assert from 'assert';
import { Uri } from 'vscode';
import { stashToMagitChanges } from '../../commands/diffingCommands';
import { MagitRepository } from '../../models/magitRepository';

const repository = {
  gitRepository: { rootUri: Uri.parse('file:///repo') },
} as unknown as MagitRepository;

suite('diffing commands', () => {
  test('stashToMagitChanges - diff content containing a literal "diff --git" line', () => {
    const nameStatus = 'A\0src/foo.test.ts\0M\0src/bar.ts\0';
    const diff = `diff --git a/src/foo.test.ts b/src/foo.test.ts
new file mode 100644
index 0000000..1a2b3c4
--- /dev/null
+++ b/src/foo.test.ts
@@ -0,0 +1,2 @@
+const sample = \`diff --git a/x b/x
+\`;
diff --git a/src/bar.ts b/src/bar.ts
index 1a2b3c4..5d6e7f8 100644
--- a/src/bar.ts
+++ b/src/bar.ts
@@ -1,1 +1,1 @@
-old
+new
`;

    const changes = stashToMagitChanges(repository, nameStatus, diff);
    assert.strictEqual(changes.length, 2);
    assert.strictEqual(changes[0].relativePath, 'src/foo.test.ts');
    assert.strictEqual(changes[1].relativePath, 'src/bar.ts');
  });

  test('stashToMagitChanges - NUL separated names with special characters and renames', () => {
    // Output of `git show --name-status -z`: git does not quote names in this mode
    const nameStatus = 'M\0a b"c.txt\0R100\0café.txt\0thé.txt\0';
    const diff = `diff --git "a/a b\\"c.txt" "b/a b\\"c.txt"
index 1a2b3c4..5d6e7f8 100644
--- "a/a b\\"c.txt"
+++ "b/a b\\"c.txt"
@@ -1,1 +1,1 @@
-old
+new
diff --git "a/caf\\303\\251.txt" "b/th\\303\\251.txt"
similarity index 100%
rename from "caf\\303\\251.txt"
rename to "th\\303\\251.txt"
`;

    const changes = stashToMagitChanges(repository, nameStatus, diff);
    assert.strictEqual(changes.length, 2);
    assert.strictEqual(changes[0].relativePath, 'a b"c.txt');
    assert.strictEqual(changes[0].uri.path, '/repo/a b"c.txt');
    assert.strictEqual(changes[1].relativePath, 'café.txt -> thé.txt');
    assert.strictEqual(changes[1].uri.path, '/repo/thé.txt');
  });
});
