"""Write every sprite strip the site loads into public/sprites/, plus public/favicon.png.

Desk objects are drawn in objects.py. The character comes from the SkinSprite Studio
renders in skin/, turned back into native pixels by skin_downsample.native().

Usage: python tools/sprites/build.py
"""
import pathlib
import tempfile

from PIL import Image

import objects
from skin_downsample import native

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[1]
OUT = ROOT / "public" / "sprites"
SKIN = HERE / "skin"


def skin_sprites():
    with tempfile.TemporaryDirectory() as tmp:
        tmp = pathlib.Path(tmp)
        native(str(SKIN / "mc-basic.png"), 24, str(tmp / "basic.png"))
        native(str(SKIN / "mc-wave.png"), 24, str(tmp / "wave.png"))
        native(str(SKIN / "mc-head.png"), 33, str(tmp / "head.png"))
        basic, wave, head = (Image.open(tmp / f).copy() for f in ("basic.png", "wave.png", "head.png"))
    # Both poses share the left edge, so frames line up when padded to the wider one.
    w, h = max(basic.width, wave.width), max(basic.height, wave.height)
    me = Image.new("RGBA", (w * 2, h), (0, 0, 0, 0))
    me.alpha_composite(basic, (0, h - basic.height))
    me.alpha_composite(wave, (w, h - wave.height))
    return me, head


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    mon, led = objects.monitor()
    mon.save(OUT / "monitor.png")
    led.save(OUT / "monitor-led.png")
    objects.gamepad().save(OUT / "gamepad.png")
    objects.toolbox().save(OUT / "toolbox.png")

    me, head = skin_sprites()
    me.save(OUT / "me.png")
    head.save(OUT / "head.png")

    icon = Image.new("RGBA", (24, 24), (0, 0, 0, 0))
    icon.alpha_composite(head, ((24 - head.width) // 2, (24 - head.height) // 2))
    icon.save(ROOT / "public" / "favicon.png")
    print("wrote", ", ".join(sorted(p.name for p in OUT.glob("*.png"))), "+ favicon.png")


if __name__ == "__main__":
    main()
