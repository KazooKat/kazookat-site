// Copy rules for everything a visitor or a repo reader can see.
// Fails on: an em dash, the "X, not Y" pattern, or any private term (real name, phone,
// visa status, salary) in dist/ text or tracked files. Private terms live in a gitignored
// file (PRIVATE_TERMS env var, default .private-terms) so the public repo never contains them.
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, extname } from 'node:path';

const termsFile = process.env.PRIVATE_TERMS || '.private-terms';
const roots = process.argv.slice(2);
const problems = [];

if (!existsSync(termsFile)) {
  console.error(`check-copy: ${termsFile} is missing, so private terms cannot be checked`);
  process.exit(1);
}
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const terms = readFileSync(termsFile, 'utf8').split('\n').map((t) => t.trim()).filter((t) => t && !t.startsWith('#'));
const termRes = terms.map((t) => ({ t, re: new RegExp(`(?<![\\w])${escape(t)}(?![\\w])`, 'i') }));

const textOf = (file) => {
  const raw = readFileSync(file, 'utf8');
  if (extname(file) !== '.html') return raw;
  return raw
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
};

const walk = (dir) => readdirSync(dir).flatMap((n) => {
  const p = join(dir, n);
  return statSync(p).isDirectory() ? walk(p) : [p];
});

const TEXT_EXT = new Set(['.html', '.md', '.mjs', '.js', '.ts', '.astro', '.css', '.json', '.jsonc', '.py', '.sh', '.txt', '.yml', '.yaml']);
let files = [];
if (roots.length) files = roots.flatMap((r) => (statSync(r).isDirectory() ? walk(r) : [r]));
else {
  files = existsSync('dist') ? walk('dist').filter((f) => extname(f) === '.html') : [];
  files.push(...execSync('git ls-files', { encoding: 'utf8' }).split('\n').filter(Boolean));
}
files = files.filter((f) => TEXT_EXT.has(extname(f)) && existsSync(f) && !f.endsWith('package-lock.json'));

for (const f of files) {
  const text = textOf(f);
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    if (line.includes('\u2014')) problems.push(`${f}:${i + 1} em dash`);
    // Only visible site copy is held to the voice rule; code and docs can say "not".
    if (f.startsWith('dist') || f.startsWith('src/content')) {
      const m = line.match(/\b\w+, not \w+/i);
      if (m) problems.push(`${f}:${i + 1} "X, not Y": ${m[0]}`);
    }
    for (const { t, re } of termRes) if (re.test(line)) problems.push(`${f}:${i + 1} private term "${t}"`);
  });
}

if (problems.length) {
  console.error(problems.join('\n'));
  console.error(`check-copy: ${problems.length} problem(s) in ${files.length} files`);
  process.exit(1);
}
console.log(`check-copy: ok (${files.length} files, ${terms.length} private terms)`);
