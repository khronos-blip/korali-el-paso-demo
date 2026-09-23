#!/usr/bin/env python3
"""Deterministic QA for the generated social package."""
from pathlib import Path
from PIL import Image
import re, sys
ROOT=Path(__file__).resolve().parents[1]
errors=[]
posts=sorted((ROOT/"posts").glob("*.png"))
if len(posts)!=6: errors.append(f"expected 6 posts, found {len(posts)}")
for p in posts:
    with Image.open(p) as im:
        if im.size!=(1080,1080): errors.append(f"{p.name}: expected 1080x1080, got {im.size}")
        if im.mode not in ("RGB","RGBA"): errors.append(f"{p.name}: unexpected mode {im.mode}")
        if len(im.convert("RGB").getcolors(maxcolors=2_000_000) or [])<16: errors.append(f"{p.name}: insufficient visual variation")
expected={"avatar.png":(1080,1080),"profile-grid-mockup.png":(1440,1800),"comparison/before-after.png":(2160,1200)}
for rel,size in expected.items():
    p=ROOT/rel
    if not p.exists(): errors.append(f"missing {rel}"); continue
    with Image.open(p) as im:
        if im.size!=size: errors.append(f"{rel}: expected {size}, got {im.size}")
for rel in ("bio.md","captions.md","sources/generate.py"):
    if not (ROOT/rel).exists(): errors.append(f"missing {rel}")
text="\n".join((ROOT/rel).read_text(errors="ignore") for rel in ("bio.md","captions.md","sources/generate.py"))
for token in (r"lorem ipsum",r"\bplaceholder\b",r"\bTBD\b",r"dummy text",r"sample text"):
    if re.search(token,text,re.I): errors.append(f"placeholder token found: {token}")
if len(re.findall(r"^## 0[1-6]",(ROOT/"captions.md").read_text(),re.M))!=6: errors.append("captions.md must contain six numbered captions")
if errors:
    print("FAIL")
    for e in errors: print("-",e)
    sys.exit(1)
print("PASS: 6 square posts, avatar, grid, comparison, sources and copy verified")
