#!/usr/bin/env python3
"""Create a popo-style transparent cutout for the hero header.

Takes the GTA-style artwork, crops to a bust framing (head + shoulders,
like the popolab mascot), removes the background with rembg and saves
clean webp cutouts used by .hero-visual and the contact tilt card.
"""
from rembg import remove, new_session
from PIL import Image, ImageFilter

SRC = "/home/z/my-project/public/gta-hero.webp"
OUT_BUST = "/home/z/my-project/public/gta-cut.webp"

session = new_session("isnet-general-use")

img = Image.open(SRC).convert("RGBA")
W, H = img.size
print("source:", img.size)

# --- bust crop: keep the top 66% (heads, shoulders, jacket) ------------
bust = img.crop((0, 0, W, int(H * 0.66)))

# --- background removal -------------------------------------------------
fg = remove(bust, session=session, alpha_matting=True,
            alpha_matting_foreground_threshold=240,
            alpha_matting_background_threshold=15,
            alpha_matting_erode_size=8)

# clean tiny alpha noise, keep hair edges soft
a = fg.getchannel("A").point(lambda v: 0 if v < 26 else v)
fg.putalpha(a.filter(ImageFilter.GaussianBlur(0.6)))

# --- trim to the visible bounding box ----------------------------------
bbox = fg.getbbox()
print("bbox:", bbox)
fg = fg.crop(bbox)
fg.save(OUT_BUST, "WEBP", quality=92)
print("saved", OUT_BUST, fg.size)
