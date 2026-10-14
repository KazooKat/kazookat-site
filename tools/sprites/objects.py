"""Desk objects as PNG frame strips. Every frame is a full redraw on the
pixel grid, so animation never rotates or scales anything."""
from PIL import Image

K = "#101738"  # ink outline, matches --ink


def rgba(c):
    return tuple(int(c[i:i + 2], 16) for i in (1, 3, 5)) + (255,)


class Canvas:
    def __init__(self, w, h):
        self.w, self.h, self.p = w, h, {}

    def px(self, x, y, c):
        if 0 <= x < self.w and 0 <= y < self.h:
            self.p[(x, y)] = c

    def rect(self, x0, y0, x1, y1, c):
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                self.px(x, y, c)

    def image(self):
        im = Image.new("RGBA", (self.w, self.h), (0, 0, 0, 0))
        for (x, y), c in self.p.items():
            im.putpixel((x, y), rgba(c))
        return im


def rr(x0, y0, x1, y1, r=0, dy=0):
    m = set()
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            if min(x - x0, x1 - x) + min(y - y0, y1 - y) >= r:
                m.add((x, y + dy))
    return m


def shade(cv, mask, fill, hi=None, sh=None):
    ins = lambda x, y: (x, y) in mask
    for (x, y) in mask:
        if not all(ins(x + a, y + b) for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1))):
            cv.px(x, y, K)
            continue
        up = not ins(x, y - 2) or not ins(x - 2, y)
        dn = not ins(x, y + 2) or not ins(x + 2, y)
        cv.px(x, y, hi if hi and up and not dn else sh if sh and dn and not up else fill)


def line(cv, a, b, c):
    """Bresenham: 8-connected, no gaps."""
    (x0, y0), (x1, y1) = a, b
    dx, dy = abs(x1 - x0), -abs(y1 - y0)
    sx, sy = (1 if x0 < x1 else -1), (1 if y0 < y1 else -1)
    err = dx + dy
    while True:
        cv.px(x0, y0, c)
        if (x0, y0) == (x1, y1):
            break
        e2 = 2 * err
        if e2 >= dy:
            err += dy; x0 += sx
        if e2 <= dx:
            err += dx; y0 += sy


def strip(frames):
    w, h = frames[0].width, frames[0].height
    s = Image.new("RGBA", (w * len(frames), h), (0, 0, 0, 0))
    for i, f in enumerate(frames):
        s.alpha_composite(f, (i * w, 0))
    return s


# ---------------------------------------------------------------- monitor
MON_W, MON_H = 36, 31
HEIGHTS = [5, 8, 6, 10, 12]


def monitor_frame(grow, trend):
    cv = Canvas(MON_W, MON_H)
    shade(cv, rr(9, 26, 26, 30, 2), "#e4e7ef", "#ffffff", "#b9bfcd")
    shade(cv, rr(15, 23, 20, 27, 0), "#ccd1dc", None, "#a9b0c0")
    shade(cv, rr(0, 0, 35, 24, 3), "#e4e7ef", "#ffffff", "#b9bfcd")
    for (x, y) in rr(4, 3, 31, 20, 1):
        cv.px(x, y, "#132433")
    for (x, y) in rr(5, 4, 30, 19, 0):
        cv.px(x, y, "#1d3346" if y % 2 == 0 else "#1a2e40")
    for x, y in [(6, 5), (7, 5), (6, 6)]:
        cv.px(x, y, "#2c4a64")
    cv.rect(15, 22, 20, 22, "#b9bfcd")
    cv.px(31, 22, "#3f6b4c")  # LED socket, lit by its own overlay
    tops = []
    for i, h in enumerate(HEIGHTS):
        hh = max(1, round(h * grow))
        x0 = 8 + i * 4
        cv.rect(x0, 18 - hh, x0 + 2, 18, "#4fb3d9")
        cv.rect(x0 + 2, 18 - hh, x0 + 2, 18, "#3a8fb3")
        cv.rect(x0, 18 - hh, x0 + 2, 18 - hh, "#a8e6f7")
        tops.append((x0 + 1, 18 - hh - 2))
    if trend:
        pts = [(6, tops[0][1] + 1)] + tops + [(29, tops[-1][1] - 1)]
        for a, b in zip(pts, pts[1:]):
            line(cv, (a[0], a[1] + 1), (b[0], b[1] + 1), "#b8862a")  # drop shadow
        for a, b in zip(pts, pts[1:]):
            line(cv, a, b, "#ffd166")
    return cv.image()


def monitor():
    frames = [monitor_frame(g, False) for g in (0.45, 0.6, 0.75, 0.9)] + [monitor_frame(1.0, True)]
    led = Canvas(MON_W, MON_H)
    led.px(31, 22, "#7bd389")
    return strip(frames), led.image()


# ---------------------------------------------------------------- gamepad
PAD_W, PAD_H = 40, 30   # 8 rows of headroom for sparkles
BTNS = [((30, 15), "#ffd166"), ((33, 18), "#e05a47"), ((30, 21), "#7bd389"), ((27, 18), "#4fb3d9")]


def sparkle(cv, x, y, big):
    c = "#ffd166"
    cv.px(x, y, "#fffaf0")
    for d in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        cv.px(x + d[0], y + d[1], c)
    if big:
        for d in ((2, 0), (-2, 0), (0, 2), (0, -2)):
            cv.px(x + d[0], y + d[1], c)


def pad_frame(pressed=None, sparks=0):
    cv = Canvas(PAD_W, PAD_H)
    o = 8
    m = rr(3, 2, 36, 13, 4, o) | rr(0, 6, 14, 21, 5, o) | rr(25, 6, 39, 21, 5, o)
    m = {(x, y) for (x, y) in m if y < PAD_H}
    shade(cv, m, "#3550b0", "#5a74d0", "#233a96")
    for (x, y) in rr(4, 7, 14, 17, 3, o) | rr(26, 6, 36, 16, 3, o):
        if cv.p.get((x, y)) != K:
            cv.px(x, y, "#2c45a6")
    cv.rect(16, 10 + o, 18, 10 + o, "#13225e")
    cv.rect(21, 10 + o, 23, 10 + o, "#13225e")
    for x, y in [(19, 14), (20, 14), (19, 13), (20, 13), (18, 12), (21, 12)]:
        cv.px(x, y, "#f7b85b")
    cv.rect(8, 8 + o, 10, 16 + o, K)
    cv.rect(5, 11 + o, 13, 13 + o, K)
    cv.rect(9, 9 + o, 9, 10 + o, "#4a4038")
    cv.rect(6, 12 + o, 7, 12 + o, "#4a4038")
    for i, ((x, y), c) in enumerate(BTNS):
        if i == pressed:
            cv.rect(x, y + 1, x + 1, y + 2, c)          # sunk by one pixel, no rim below
        else:
            cv.rect(x, y, x + 1, y + 1, c)
            cv.px(x, y, "#fffaf0")
            cv.rect(x, y + 2, x + 1, y + 2, "#13225e")
    if sparks == 1:
        sparkle(cv, 6, 3, False); sparkle(cv, 33, 5, True)
    elif sparks == 2:
        sparkle(cv, 6, 3, True); sparkle(cv, 33, 5, False); sparkle(cv, 20, 1, False)
    return cv.image()


def gamepad():
    idle = pad_frame()
    loop = [pad_frame(i, 1 + i % 2) for i in range(4)]
    return strip([idle] + loop)


# ---------------------------------------------------------------- toolbox
BOX_W, BOX_H = 38, 40   # 10 rows of headroom for the lid and tools
TOP = 10


def tools(cv, lift):
    o = TOP - lift
    shade(cv, rr(9, 14, 12, 28, 0, o), "#c9d3dc", "#eef3f7", "#97a3ae")
    shade(cv, rr(6, 10, 15, 15, 2, o) - rr(9, 10, 12, 12, 0, o), "#c9d3dc", "#eef3f7", "#97a3ae")
    shade(cv, rr(25, 11, 28, 20, 0, o), "#c9d3dc", "#eef3f7", "#97a3ae")
    shade(cv, rr(24, 19, 29, 28, 1, o), "#ffd166", "#ffe6a3", "#c99a2e")
    # hammer: wooden handle, steel head with a claw on the right
    shade(cv, rr(18, 15, 21, 28, 0, o), "#b07a4a", "#d39a63", "#8a5a32")
    shade(cv, rr(14, 10, 24, 15, 1, o) - {(23, 14 + o), (24, 14 + o), (23, 13 + o)}, "#c9d3dc", "#eef3f7", "#97a3ae")


def box_body(cv, open_):
    o = TOP
    shade(cv, rr(1, 14, 36, 29, 2, o), "#9c2a24", "#c2453b", "#6e1a16")
    if open_:
        cv.rect(3, 15 + o, 34, 16 + o, "#39110f")   # dark inside of the box
        cv.rect(3, 17 + o, 34, 17 + o, "#6e1a16")
    cv.rect(3, 19 + o, 34, 19 + o, "#6e1a16")
    cv.rect(3, 20 + o, 34, 20 + o, "#c2453b")
    shade(cv, rr(16, 14, 21, 18, 1, o), "#ffd166", "#ffe6a3", "#c99a2e")
    cv.px(18, 16 + o, K); cv.px(19, 16 + o, K)


def box_frame(stage):
    """0 closed, 1 lid cracked, 2-3 lid flipped back with tools rising."""
    cv = Canvas(BOX_W, BOX_H)
    if stage <= 1:
        lift = stage * 2
        tools(cv, lift)
        box_body(cv, False)
        lo = TOP - lift
        shade(cv, rr(12, 3, 25, 10, 2, lo) - rr(15, 6, 22, 10, 0, lo), "#b8c2cc", "#e2e8ee", "#8996a3")
        shade(cv, rr(0, 9, 37, 15, 2, lo), "#9c2a24", "#c2453b", "#6e1a16")
    else:
        # lid flipped back: we see its inside face standing up behind the box
        panel = rr(1, 3, 36, 14, 2, TOP - 0)
        panel = {(x, y) for (x, y) in panel if y <= TOP + 14}
        shade(cv, panel, "#7d1e19", "#9c2a24", "#4e1512")
        cv.rect(4, TOP + 6, 33, TOP + 11, "#641b17")          # inner recess
        cv.rect(4, TOP + 6, 33, TOP + 6, "#491613")
        tools(cv, 6 if stage == 2 else 9)
        box_body(cv, True)
    return cv.image()


def toolbox():
    return strip([box_frame(i) for i in range(4)])
