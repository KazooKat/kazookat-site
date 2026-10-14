// Runs only for /media/* (see run_worker_first in wrangler.jsonc); every other path is served
// straight from static assets. Workers static assets answers Range requests with the whole file
// and a 200, and Safari will not play video without 206 Partial Content, so this adds byte ranges.

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
}

/** Parse a single "bytes=a-b", "bytes=a-" or "bytes=-n" range. Multi-range is not supported. */
export function parseRange(header: string, size: number): { start: number; end: number } | 'unsatisfiable' | null {
  const m = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!m || (m[1] === '' && m[2] === '')) return null;
  let start: number;
  let end: number;
  if (m[1] === '') {
    const n = Number(m[2]);
    if (n === 0) return 'unsatisfiable';
    start = Math.max(0, size - n);
    end = size - 1;
  } else {
    start = Number(m[1]);
    end = m[2] === '' ? size - 1 : Math.min(Number(m[2]), size - 1);
  }
  if (start >= size || start > end) return 'unsatisfiable';
  return { start, end };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const head = request.method === 'HEAD';
    const asset = await env.ASSETS.fetch(new Request(request.url, { method: 'GET' }));
    const headers = new Headers(asset.headers);
    headers.set('accept-ranges', 'bytes');
    const rangeHeader = request.headers.get('range');

    if (!asset.ok || !rangeHeader) {
      return new Response(head ? null : asset.body, { status: asset.status, headers });
    }

    const buf = await asset.arrayBuffer();
    const range = parseRange(rangeHeader, buf.byteLength);
    if (range === null) {
      return new Response(head ? null : buf, { status: 200, headers });
    }
    if (range === 'unsatisfiable') {
      headers.set('content-range', `bytes */${buf.byteLength}`);
      headers.delete('content-length');
      return new Response(null, { status: 416, headers });
    }
    const slice = buf.slice(range.start, range.end + 1);
    headers.set('content-range', `bytes ${range.start}-${range.end}/${buf.byteLength}`);
    headers.set('content-length', String(slice.byteLength));
    return new Response(head ? null : slice, { status: 206, headers });
  },
};
