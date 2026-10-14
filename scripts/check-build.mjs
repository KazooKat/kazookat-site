// Fails unless dist/ has the pages we expect and every page carries the build ID from dist/build.txt.
import { readFileSync, existsSync } from 'node:fs';

const pages = process.argv.slice(2).length ? process.argv.slice(2) : ['index.html'];
const fail = (m) => { console.error('check-build: ' + m); process.exit(1); };

if (!existsSync('dist/build.txt')) fail('dist/build.txt missing');
const id = readFileSync('dist/build.txt', 'utf8').trim();
if (!/^\d{8}T\d{6}Z-[0-9a-f]{7,}$/.test(id)) fail(`bad build id "${id}"`);

for (const p of pages) {
  const f = `dist/${p}`;
  if (!existsSync(f)) fail(`${f} missing`);
  const m = readFileSync(f, 'utf8').match(/<meta name="build" content="([^"]+)"/);
  if (!m) fail(`${f} has no build meta`);
  if (m[1] !== id) fail(`${f} build meta ${m[1]} != ${id}`);
}
console.log(`check-build: ok ${id} (${pages.join(', ')})`);
