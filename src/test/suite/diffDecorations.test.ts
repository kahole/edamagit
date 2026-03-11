import * as assert from 'assert';
import { execFileSync } from 'child_process';
import { getDocumentDecorations } from '../../utils/diffDecorations';
import { HunkView } from '../../views/changes/hunkView';
import { Section } from '../../views/general/sectionHeader';
import { Uri } from 'vscode';

const diffHeader = `diff --git a/src/server.ts b/src/server.ts
index 1a2b3c4..5d6e7f8 100644
--- a/src/server.ts
+++ b/src/server.ts
`;

const hunkText = `@@ -10,7 +10,8 @@ import { createLogger } from './logger';
 const app = express();
 const logger = createLogger('server');

-function startServer(port: number) {
+async function startServer(port: number): Promise<void> {
+  logger.info(\`Starting server on port \${port}\`);
   app.listen(port, () => {
     logger.info('Server started');
   });`;

let deltaAvailable: boolean | undefined;
function hasDelta(): boolean {
  if (deltaAvailable === undefined) {
    try {
      execFileSync('delta', ['--version'], { stdio: 'ignore' });
      deltaAvailable = true;
    } catch {
      deltaAvailable = false;
    }
  }
  return deltaAvailable;
}

suite('Diff Decorations – view-level integration', function () {

  test('extracts decorations in document coordinates from HunkViews', async function () {
    if (!hasDelta()) { return this.skip(); }

    const uri = Uri.parse('file:///test/src/server.ts');
    const hunkView = new HunkView(Section.Unstaged, {
      diff: hunkText,
      diffHeader,
      uri,
    });

    // Simulate the hunk appearing at line 5 in the rendered document
    const documentStartLine = 5;
    hunkView.render(documentStartLine);

    const decorations = await getDocumentDecorations([hunkView], ['delta', '--color-only', '--no-gitconfig', '--dark']);

    assert.ok(decorations.length > 0, 'Expected decoration ranges');

    // All decoration lines must be in document coordinate space
    const hunkLineCount = hunkText.split('\n').length;
    const documentEndLine = documentStartLine + hunkLineCount - 1;
    for (const d of decorations) {
      assert.ok(
        d.line >= documentStartLine && d.line <= documentEndLine,
        `Decoration line ${d.line} should be in [${documentStartLine}, ${documentEndLine}]`,
      );
    }

    // At least one range should have a foreground color (syntax highlight)
    const hasColor = decorations.some((d: { foreground?: string }) => d.foreground !== undefined);
    assert.ok(hasColor, 'Expected at least one decoration with a foreground color');
  });

  test('returns empty array when renderer is unavailable', async () => {
    const uri = Uri.parse('file:///test/src/server.ts');
    const hunkView = new HunkView(Section.Unstaged, {
      diff: hunkText,
      diffHeader,
      uri,
    });
    hunkView.render(0);

    const decorations = await getDocumentDecorations([hunkView], ['/nonexistent/delta']);
    assert.deepStrictEqual(decorations, []);
  });
});
