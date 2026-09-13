import * as assert from 'assert';
import { execFileSync } from 'child_process';
import { renderDiff, DecorationRange } from '../../utils/diffRenderer';

const sampleDiff = `diff --git a/src/server.ts b/src/server.ts
index 1a2b3c4..5d6e7f8 100644
--- a/src/server.ts
+++ b/src/server.ts
@@ -10,7 +10,8 @@ import { createLogger } from './logger';
 const app = express();
 const logger = createLogger('server');

-function startServer(port: number) {
+async function startServer(port: number): Promise<void> {
+  logger.info(\`Starting server on port \${port}\`);
   app.listen(port, () => {
     logger.info('Server started');
   });
`;

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

suite('Diff Renderer', function () {

  test('produces decoration ranges with syntax colors for a TypeScript diff', async function () {
    if (!hasDelta()) { return this.skip(); }

    const ranges: DecorationRange[] = await renderDiff(sampleDiff, 'src/server.ts', ['delta', '--color-only', '--no-gitconfig', '--dark']);

    assert.ok(ranges.length > 0, 'Expected at least one decoration range');

    const hasColor = ranges.some(r => r.foreground !== undefined || r.background !== undefined);
    assert.ok(hasColor, 'Expected at least one range with a foreground or background color');
  });

  test('preserves diff structure (line count unchanged)', async function () {
    if (!hasDelta()) { return this.skip(); }

    const ranges: DecorationRange[] = await renderDiff(sampleDiff, 'src/server.ts', ['delta', '--color-only', '--no-gitconfig', '--dark']);

    const maxLine = Math.max(...ranges.map(r => r.line));
    const inputLines = sampleDiff.split('\n').length - 1; // trailing newline
    assert.ok(maxLine < inputLines, 'Decoration line numbers must be within diff bounds');
  });

  test('returns empty array when renderer is not installed', async () => {
    const ranges = await renderDiff(sampleDiff, 'src/server.ts', ['/nonexistent/delta']);
    assert.deepStrictEqual(ranges, [], 'Should gracefully return empty array');
  });
});
