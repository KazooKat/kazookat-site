"""Shared palette and grid helpers for the kazookat.dev pixel sprites."""
from PIL import Image

PAL = {
    ".": None,
    "k": "#2a2420",   # ink outline
    # cat
    "o": "#e8833a", "h": "#f5a35f", "s": "#c9682e", "d": "#b85a28", "t": "#b4562a",
    "c": "#fbe3c4", "C": "#ecc9a0", "p": "#f4a3a3", "n": "#e86f86", "w": "#fffaf0",
}

MIRROR = {"h": "s", "s": "h"}


def mirror_rows(left_rows):
    """Left half -> full rows; side highlight becomes side shade on the right."""
    out = []
    for r in left_rows:
        right = "".join(MIRROR.get(ch, ch) for ch in reversed(r))
        out.append(r + right)
    return out


def to_image(rows, pal=PAL, w=None, h=None):
    h = h or len(rows)
    w = w or max(len(r) for r in rows)
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    for y, r in enumerate(rows):
        for x, ch in enumerate(r):
            c = pal.get(ch)
            if c:
                im.putpixel((x, y), tuple(int(c[i:i + 2], 16) for i in (1, 3, 5)) + (255,))
    return im


def overlay(base_rows, top_rows):
    """Paint top_rows over base_rows; '.' in top is transparent."""
    out = []
    for y in range(max(len(base_rows), len(top_rows))):
        b = base_rows[y] if y < len(base_rows) else ""
        t = top_rows[y] if y < len(top_rows) else ""
        n = max(len(b), len(t))
        b, t = b.ljust(n, "."), t.ljust(n, ".")
        out.append("".join(tc if tc != "." else bc for bc, tc in zip(b, t)))
    return out


def preview(images, scale, path, bg="#f4efe6", gap=4):
    w = sum(i.width for i in images) + gap * (len(images) + 1)
    h = max(i.height for i in images) + gap * 2
    sheet = Image.new("RGBA", (w, h), bg)
    x = gap
    for i in images:
        sheet.alpha_composite(i, (x, gap))
        x += i.width + gap
    sheet.resize((w * scale, h * scale), Image.NEAREST).save(path)
