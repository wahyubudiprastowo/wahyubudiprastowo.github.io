"""Make the GTA-6-style hero cutout from the uploaded masked-tech-leader portrait.

Background is pure black (connected to the top/left/right edges, plus gaps at
the bottom between the legs). Strategy:
  1. luminance threshold -> "dark" mask
  2. flood fill (binary propagation) from border pixels through the dark mask
     -> background region only (enclosed dark areas like the black tee stay)
  3. de-fringe: erode the subject mask ~1px, then feather ~1px
  4. crop to subject bbox (flush bottom — character rises from the bottom edge,
     GTA-style), resize, save webp with alpha
"""
import numpy as np
from PIL import Image, ImageFilter
import scipy.ndimage as ndi

SRC = "upload/Masked technology leader with red pocket square.png"
OUT = "public/gta-cut.webp"

im = Image.open(SRC).convert("RGB")
a = np.asarray(im).astype(np.float32)
lum = a[..., 0] * 0.299 + a[..., 1] * 0.587 + a[..., 2] * 0.114

dark = lum < 12
seed = np.zeros_like(dark)
seed[0, :] = dark[0, :]
seed[-1, :] = dark[-1, :]
seed[:, 0] = dark[:, 0]
seed[:, -1] = dark[:, -1]
bg = ndi.binary_propagation(seed, mask=dark)
print("background fraction:", bg.mean().round(3))

subject = ~bg

# drop tiny detached islands (specks above the hair, noise)
lab, n = ndi.label(subject)
if n > 1:
    sizes = ndi.sum(subject, lab, range(1, n + 1))
    keep = np.zeros(n + 1, dtype=bool)
    keep[1:][sizes >= 600] = True
    subject = keep[lab]
    print("islands removed:", n - 1 - int((sizes >= 600).sum()))

# de-fringe: erode subject 1px, then smooth the edge for anti-aliasing
subject_er = ndi.binary_erosion(subject, iterations=1)
mask_img = Image.fromarray((subject_er * 255).astype(np.uint8), "L")
mask_img = mask_img.filter(ImageFilter.GaussianBlur(0.9))
m = np.asarray(mask_img).astype(np.float32) / 255.0

rgba = np.dstack([np.asarray(im), (m * 255).astype(np.uint8)])

# crop to bbox, keep flush to the bottom edge
ys, xs = np.where(m > 0.02)
y0, y1 = ys.min(), ys.max()
x0, x1 = xs.min(), xs.max()
pad = 12
y0 = max(0, y0 - pad)
x0 = max(0, x0 - pad)
x1 = min(rgba.shape[1] - 1, x1 + pad)
crop = rgba[y0 : rgba.shape[0], x0 : x1 + 1]  # keep bottom edge flush
print("crop box:", x0, y0, x1 + 1, rgba.shape[0], "size:", crop.shape)

out = Image.fromarray(crop, "RGBA")
target_w = 940
target_h = round(out.height * target_w / out.width)
out = out.resize((target_w, target_h), Image.LANCZOS)
out.save(OUT, "WEBP", quality=90, method=4)
print("saved", OUT, out.size)
