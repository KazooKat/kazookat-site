"""Write every sprite strip to OUT_DIR and a contact sheet for review."""
import sys, os
from PIL import Image
from pal import overlay, to_image
import cat
import objects

out = sys.argv[1]
os.makedirs(out, exist_ok=True)

mon, led = objects.monitor()
mon.save(f"{out}/monitor.png"); led.save(f"{out}/monitor-led.png")
objects.gamepad().save(f"{out}/gamepad.png")
objects.toolbox().save(f"{out}/toolbox.png")

W, H = 28, 24
to_image(cat.BODY, w=W, h=H).save(f"{out}/cat-body.png")
objects.strip([to_image(cat.TAIL_DOWN, w=W, h=H), to_image(cat.TAIL_UP, w=W, h=H)]).save(f"{out}/cat-tail.png")
objects.strip([to_image(cat.EYE_FRAMES[k], w=W, h=H) for k in ("center", "down", "downright", "right")]).save(f"{out}/cat-eyes.png")
to_image(cat.closed(), w=W, h=H).save(f"{out}/cat-blink.png")

# contact sheet: every strip stacked, 8x
names = ["monitor", "gamepad", "toolbox", "cat-tail", "cat-eyes"]
ims = [Image.open(f"{out}/{n}.png") for n in names]
sw = max(i.width for i in ims) + 4
sh = sum(i.height + 3 for i in ims) + 3
sheet = Image.new("RGBA", (sw, sh), "#f4efe6")
y = 3
for i in ims:
    sheet.alpha_composite(i, (2, y)); y += i.height + 3
sheet.resize((sw * 6, sh * 6), Image.NEAREST).save(sys.argv[2])
