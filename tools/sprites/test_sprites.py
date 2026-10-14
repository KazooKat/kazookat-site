"""Checks the sprite strips the site loads from public/sprites/."""
import pathlib

from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / "public" / "sprites"
# name: (frames, frame width, frame height)
SPEC = {
    "monitor.png": (5, 36, 31),
    "monitor-led.png": (1, 36, 31),
    "gamepad.png": (5, 40, 30),
    "toolbox.png": (4, 38, 40),
    "me.png": (2, 29, 33),
    "head.png": (1, 24, 17),
}


def test_strip_sizes():
    for name, (n, w, h) in SPEC.items():
        im = Image.open(OUT / name)
        assert im.size == (n * w, h), (name, im.size)
        assert im.mode == "RGBA", (name, im.mode)


def test_frames_differ():
    for name, (n, w, h) in SPEC.items():
        im = Image.open(OUT / name)
        frames = [im.crop((i * w, 0, (i + 1) * w, h)).tobytes() for i in range(n)]
        assert len(set(frames)) == n, f"{name} has duplicate frames"


def test_no_semitransparent_pixels():
    # Soft alpha would show as fringes once scaled with image-rendering: pixelated.
    for name in SPEC:
        alphas = set(Image.open(OUT / name).getchannel("A").tobytes())
        assert alphas <= {0, 255}, f"{name} has soft alpha {sorted(alphas)[:5]}"


def test_favicon_is_square_head():
    im = Image.open(ROOT / "public" / "favicon.png")
    assert im.size == (24, 24)
    assert im.getbbox() is not None
