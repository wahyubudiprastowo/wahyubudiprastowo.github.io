#!/usr/bin/env python3
"""Chroma-key the green-screen repaint into a transparent popo-style cutout."""
from PIL import Image, ImageFilter
import numpy as np

SRC = "/home/z/my-project/scripts/key-green.png"
OUT = "/home/z/my-project/public/gta-cut.webp"

img = Image.open(SRC).convert("RGB")
a = np.asarray(img).astype(np.float32)
R, G, B = a[..., 0], a[..., 1], a[..., 2]

# greenness: how much G exceeds the other channels (0 = not green, 1 = pure key)
g = np.clip((G - np.maximum(R, B)) / 110.0, 0, 1)

# alpha: fully opaque when greenness < 0.22, transparent when > 0.55
alpha = np.clip((0.55 - g) / 0.33, 0, 1)

# despill edge pixels: clamp green to the average of R/B
spill = np.clip((G - (R + B) / 2.0), 0, None)
G2 = G - spill * np.clip(g * 1.6, 0, 1)
out = np.stack([R, G2, B], axis=-1)

rgba = np.dstack([np.clip(out, 0, 255).astype(np.uint8), (alpha * 255).astype(np.uint8)])
res = Image.fromarray(rgba, "RGBA")

# soften the alpha edge a touch
res.putalpha(res.getchannel("A").filter(ImageFilter.GaussianBlur(0.7)))

bbox = res.getbbox()
res = res.crop(bbox)
res.save(OUT, "WEBP", quality=93)
print("saved", OUT, res.size)
