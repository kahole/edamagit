import * as assert from 'assert';
import { Uri } from 'vscode';
import { stashToMagitChanges } from '../../commands/diffingCommands';
import { MagitRepository } from '../../models/magitRepository';

const repository = {
  gitRepository: { rootUri: Uri.parse('file:///repo') },
} as unknown as MagitRepository;

suite('diffing commands', () => {
  test('stashToMagitChanges - diff content containing a literal "diff --git" line', () => {
    const nameStatus = 'A\tsrc/foo.test.ts\nM\tsrc/bar.ts';
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
});
