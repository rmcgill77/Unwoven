"""Build step: every embedded PNG data URI in the bundle is re-encoded as lossless WebP when that is at least 15% smaller.
Pixel-identical; cached by content hash so rebuilds stay fast. Usage: python3 webp_pack.py build/game.min.js"""
import base64, hashlib, io, os, re, sys
from PIL import Image
CACHE = os.environ.get("WEBP_CACHE") or os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "build", ".webpcache"); os.makedirs(CACHE, exist_ok=True)
p = sys.argv[1]; s = open(p, encoding="utf8").read(); before = len(s); n = [0, 0]
def sub(m):
    b64 = m.group(m.lastindex); h = hashlib.sha1(b64.encode()).hexdigest(); c = os.path.join(CACHE, h)
    if os.path.exists(c): out = open(c).read()
    else:
        raw = base64.b64decode(b64); im = Image.open(io.BytesIO(raw)); im.load()
        if im.mode not in ("RGB", "RGBA"): im = im.convert("RGBA")
        o = io.BytesIO(); im.save(o, "WEBP", lossless=True, quality=100, method=6); w = o.getvalue()
        out = "data:image/webp;base64," + base64.b64encode(w).decode() if len(w) < len(raw) * 0.85 else ""
        open(c, "w").write(out)
    n[0] += 1
    if out: n[1] += 1; return out
    return m.group(0)
s = re.sub(r"data:image/png;base64,([A-Za-z0-9+/=]+)", sub, s)
def sub_raw(m):   # the chibi sheets carry bare base64 under "png" and get their prefix in code (02d_chibi.js knows WebP)
    r = sub(m); return m.group(1) + (r.split(",", 1)[1] if r.startswith("data:image/webp") else m.group(2)) + '"'
s = re.sub(r'("?png"?:")([A-Za-z0-9+/=]{200,})"', lambda m: sub_raw(m), s)
open(p, "w", encoding="utf8").write(s)
print(f"webp: {n[1]}/{n[0]} images re-encoded, {before} -> {len(s)} bytes")
