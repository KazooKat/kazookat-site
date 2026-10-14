"""KazooKat cat: front-facing, sitting. 24x24 body on a 28-wide canvas (tail room)."""
from pal import mirror_rows, overlay, to_image, preview

LEFT = [
    "...kk.......",  # 0 ear tips
    "..khok......",
    "..kppok.....",
    ".khppook....",
    ".khpooookkkk",  # 4 head top
    ".khooooootot",  # 5 forehead stripes
    "khooooooooot",
    "khoooooooooo",
    "khoooooooooo",  # 8 eyes live on their own layer
    "khoooooooooo",
    "khooooooocnn",  # 10 nose
    "khopoooccckc",  # 11 blush + mouth
    ".kdooooccccc",
    "..kkkkkkkkkk",  # 13 chin line: head sits on the body
    "...khooocccc",  # 14 body, narrower than the head
    "...khotooccc",
    "..khootooccc",
    "..khoooooccc",
    "..khotoooccc",
    "..khoooooccc",
    "..khoooooccc",  # 20
    "..kdoookccck",  # 21 front paws, split down the middle
    "..kdddkcCcck",  # 22 toe line
    "...kkkkkkkkk",  # 23
]
BODY = [r + "...." for r in mirror_rows(LEFT)]  # 28 wide

# eyes: dark 2x3 with a highlight pixel; look frames shift by one pixel
def eyes(dx=0, dy=0):
    rows = ["." * 28 for _ in range(24)]
    rows = [list(r) for r in rows]
    for ex in (5, 17):
        for y in range(8, 11):
            for x in range(ex, ex + 2):
                rows[y + dy][x + dx] = "k"
        rows[8 + dy][ex + dx] = "w"
    return ["".join(r) for r in rows]

EYE_FRAMES = {"center": eyes(), "down": eyes(0, 1), "downright": eyes(1, 1), "right": eyes(1, 0)}

# closed eyes: fur over the whole eye zone, then a flat lid line
def closed():
    rows = [list("." * 28) for _ in range(24)]
    for ex in (4, 16):
        for y in range(8, 12):
            for x in range(ex, ex + 4):
                rows[y][x] = "o"
        for x in range(ex, ex + 3):
            rows[10][x + (1 if ex == 16 else 0)] = "k"
    return ["".join(r) for r in rows]

# tail frames, drawn to the right of the body
TAIL_DOWN = [""] * 17 + [
    "........................kk..",
    ".......................khok.",
    ".......................kook.",
    ".....................kkkotk.",
    "....................khooook.",
    "....................kdddddk.",
    ".....................kkkkk..",
]
TAIL_UP = [""] * 9 + [
    "......................kk....",
    ".....................khok...",
    ".....................kotk...",
    ".....................kook...",
    "......................kook..",
    "......................kotk..",
    "......................kook..",
    "......................kook..",
    ".....................kotk...",
    ".....................kook...",
    "....................khok....",
    "....................kook....",
    "....................kook....",
    "....................kdkk....",
    "",
]

if __name__ == "__main__":
    base = BODY
    frames = [
        to_image(overlay(overlay(base, TAIL_DOWN), EYE_FRAMES["center"]), w=28, h=24),
        to_image(overlay(overlay(base, TAIL_UP), EYE_FRAMES["downright"]), w=28, h=24),
        to_image(overlay(overlay(base, TAIL_DOWN), closed()), w=28, h=24),
    ]
    preview(frames, 12, "cat_preview.png")
