// Every link, image, clip, poster and CSS url() in dist/ must resolve.
// Internal: the file must exist in dist/ (/data -> data.html). External: GET without
// following redirects must return 2xx or 3xx (a sleeping Streamlit app redirects, which passes).
// Usage: node scripts/check-links.mjs [dir=dist] [--offline]
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';

const args = process.argv.slice(2);
const offline = args.includes('--offline');
const dir = args.find((a) => !a.startsWith('--')) || 'dist';
const walk = (d) => readdirSync(d).flatMap((n) => (statSync(join(d, n)).isDirectory() ? walk(join(d, n)) : [join(d, n)]));
const files = walk(dir).filter((f) => ['.html', '.css'].includes(extname(f)));

const refs = new Map(); // url -> first file that uses it
const add = (u, f) => { if (u && !refs.has(u)) refs.set(u, f); };
for (const f of files) {
  const s = readFileSync(f, 'utf8');
  for (const m of s.matchAll(/\s(?:href|src|poster)="([^"]+)"/g)) add(m[1], f);
  for (const m of s.matchAll(/\ssrcset="([^"]+)"/g)) m[1].split(',').forEach((c) => add(c.trim().split(/\s+/)[0], f));
  for (const m of s.matchAll(/url\((['"]?)([^)'"]+)\1\)/g)) add(m[2], f);
}

const internal = (u) => {
  const path = decodeURIComponent(u.split(/[?#]/)[0]);
  if (path === '/' ) return existsSync(join(dir, 'index.html'));
  const p = join(dir, path);
  return existsSync(p) && statSync(p).isFile() ? true : existsSync(p + '.html') || existsSync(join(p, 'index.html'));
};

const problems = [];
const external = [];
for (const [u, f] of refs) {
  if (u.startsWith('mailto:') || u.startsWith('data:') || u.startsWith('#')) continue;
  if (/^https?:\/\//.test(u)) { external.push([u, f]); continue; }
  if (u.startsWith('/')) { if (!internal(u)) problems.push(`${f}: missing ${u}`); continue; }
  problems.push(`${f}: relative link ${u} (use a root-relative path)`);
}

if (!offline) {
  await Promise.all(external.map(async ([u, f]) => {
    if (/fonts\.(googleapis|gstatic)\.com$/.test(new URL(u).host) && !new URL(u).pathname.startsWith('/css')) return; // preconnect hosts
    try {
      const r = await fetch(u, { redirect: 'manual', signal: AbortSignal.timeout(20000), headers: { 'user-agent': 'kazookat-link-check' } });
      if (r.status >= 400) problems.push(`${f}: ${u} -> HTTP ${r.status}`);
    } catch (e) {
      problems.push(`${f}: ${u} -> ${e.cause?.code || e.name}`);
    }
  }));
}

if (problems.length) {
  console.error(problems.join('\n'));
  console.error(`check-links: ${problems.length} problem(s)`);
  process.exit(1);
}
console.log(`check-links: ok (${refs.size} refs, ${external.length} external${offline ? ' skipped' : ' checked'})`);
