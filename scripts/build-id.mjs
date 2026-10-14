// Stamps every build with a unique ID so a deploy only counts as live once kazookat.dev serves it.
import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';

const sha = (() => {
  try { return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); }
  catch { return 'nogit00'; }
})();
const id = `${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z-${sha}`;

mkdirSync('public', { recursive: true });
writeFileSync('public/build.txt', id + '\n');
writeFileSync('src/build-id.json', JSON.stringify({ id }) + '\n');
console.log('build id', id);
