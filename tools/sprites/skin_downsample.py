"""Turn SkinSprite Studio renders (sss.1m3.jp, 800x800) back into native pixel sprites.

The renders are made of exact square blocks (24px for full-body poses, 33px for
head-only), so sampling the centre of each block recovers the sprite at one
pixel per block with no guessing. Prints a count of non-uniform blocks; anything
above 0 means the block size or grid offset is wrong.

Usage: python skin_downsample.py RENDER.png BLOCK OUT.png
"""
import sys
from collections import Counter
from PIL import Image


def native(path, block, out):
    im = Image.open(path).convert("RGBA")
    w, h = im.size
    px = im.load()
    cx, cy = Counter(), Counter()
    for y in range(0, h, 5):
        for x in range(1, w):
            if px[x, y] != px[x - 1, y]:
                cx[x % block] += 1
    for x in range(0, w, 5):
        for y in range(1, h):
            if px[x, y] != px[x, y - 1]:
                cy[y % block] += 1
    ox, oy = cx.most_common(1)[0][0], cy.most_common(1)[0][0]
    xs = ([ox - block] if ox else []) + list(range(ox, w, block))
    ys = ([oy - block] if oy else []) + list(range(oy, h, block))
    sm = Image.new("RGBA", (len(xs), len(ys)), (0, 0, 0, 0))
    bad = 0
    clamp = lambda v, hi: min(max(v, 0), hi - 1)
    for j, y0 in enumerate(ys):
        for i, x0 in enumerate(xs):
            c = px[clamp(x0 + block // 2, w), clamp(y0 + block // 2, h)]
            corners = [px[clamp(x0 + a, w), clamp(y0 + b, h)] for a in (2, block - 3) for b in (2, block - 3)]
            if x0 + 2 >= 0 and y0 + 2 >= 0 and any(p != c for p in corners):
                bad += 1
            sm.putpixel((i, j), c)
    sm = sm.crop(sm.getbbox())
    sm.save(out)
    print(f"{path}: offset {ox},{oy} native {sm.size} non-uniform blocks {bad}")


if __name__ == "__main__":
    native(sys.argv[1], int(sys.argv[2]), sys.argv[3])
