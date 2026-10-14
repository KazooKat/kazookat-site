// Safari only plays video from servers that answer byte-range requests with 206.
// Usage: node scripts/check-range.mjs BASE_URL [path=/media/long-dives.mp4]
const base = process.argv[2];
const path = process.argv[3] || '/media/long-dives.mp4';
if (!base) { console.error('usage: check-range.mjs BASE_URL [path]'); process.exit(2); }
const url = base.replace(/\/$/, '') + path;
const problems = [];

const full = await fetch(url);
const size = Number(full.headers.get('content-length'));
await full.arrayBuffer();
if (full.status !== 200 || !size) problems.push(`full GET: ${full.status}, length ${size}`);
if (full.headers.get('accept-ranges') !== 'bytes') problems.push(`full GET: accept-ranges=${full.headers.get('accept-ranges')}`);

const cases = [
  { range: 'bytes=0-1', status: 206, start: 0, end: 1 },
  { range: 'bytes=100-', status: 206, start: 100, end: size - 1 },
  { range: 'bytes=-50', status: 206, start: size - 50, end: size - 1 },
  { range: `bytes=${size + 10}-`, status: 416 },
];
for (const c of cases) {
  const r = await fetch(url, { headers: { range: c.range } });
  const body = new Uint8Array(await r.arrayBuffer());
  if (r.status !== c.status) { problems.push(`${c.range}: status ${r.status}, want ${c.status}`); continue; }
  if (c.status === 206) {
    const want = `bytes ${c.start}-${c.end}/${size}`;
    if (r.headers.get('content-range') !== want) problems.push(`${c.range}: content-range ${r.headers.get('content-range')}, want ${want}`);
    if (body.length !== c.end - c.start + 1) problems.push(`${c.range}: body ${body.length} bytes, want ${c.end - c.start + 1}`);
    if (!r.headers.get('content-type')?.startsWith('video/mp4')) problems.push(`${c.range}: content-type ${r.headers.get('content-type')}`);
  } else if (r.headers.get('content-range') !== `bytes */${size}`) {
    problems.push(`${c.range}: content-range ${r.headers.get('content-range')}, want bytes */${size}`);
  }
}

const head = await fetch(url, { method: 'HEAD', headers: { range: 'bytes=0-1' } });
if (head.status !== 206) problems.push(`HEAD with range: status ${head.status}, want 206`);

if (problems.length) { console.error(problems.join('\n')); console.error(`check-range: ${problems.length} problem(s) at ${url}`); process.exit(1); }
console.log(`check-range: ok ${url} (${size} bytes)`);
