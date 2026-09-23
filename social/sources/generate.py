#!/usr/bin/env python3
"""Reproducible social-package renderer for the El Paso demo.

Uses only local project assets and Pillow. Run from any directory:
    python3 social/sources/generate.py
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "social"
POSTS = OUT / "posts"
SRC = ROOT / "assets" / "images"
QA = ROOT / "qa" / "screenshots"
OUT.mkdir(exist_ok=True)
POSTS.mkdir(exist_ok=True)

W = H = 1080
INK = "#201B18"
CREAM = "#F5EFE6"
SAND = "#D9C4AE"
ROSE = "#C46C67"
PLUM = "#643D51"
WHITE = "#FFFDF9"

FONT_SANS = "/System/Library/Fonts/Supplemental/Avenir Next.ttc"
FONT_SERIF = "/System/Library/Fonts/Supplemental/Didot.ttc"
if not Path(FONT_SERIF).exists():
    FONT_SERIF = "/System/Library/Fonts/Supplemental/Georgia.ttf"


def font(size, bold=False, serif=False):
    path = FONT_SERIF if serif else FONT_SANS
    try:
        return ImageFont.truetype(path, size, index=1 if bold and not serif else 0)
    except Exception:
        return ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", size)


def fit(path, size=(W, H), pos=(0.5, 0.5)):
    return ImageOps.fit(Image.open(path).convert("RGB"), size, method=Image.Resampling.LANCZOS, centering=pos)


# Keep explicit import to make dependencies obvious.
from PIL import ImageOps


def gradient(size, top=(0, 0, 0, 0), bottom=(0, 0, 0, 190)):
    w, h = size
    g = Image.new("RGBA", size)
    px = g.load()
    for y in range(h):
        t = y / max(1, h - 1)
        c = tuple(round(top[i] * (1-t) + bottom[i] * t) for i in range(4))
        for x in range(w): px[x, y] = c
    return g


def text(draw, xy, value, size, fill=INK, bold=False, serif=False, anchor="la", spacing=8, stroke=0):
    draw.multiline_text(xy, value, font=font(size, bold, serif), fill=fill, anchor=anchor,
                        spacing=spacing, stroke_width=stroke, stroke_fill=INK)


def label(draw, value, x=66, y=58, dark=False):
    fill = WHITE if dark else INK
    draw.rounded_rectangle((x, y, x+266, y+46), radius=23, fill=(32,27,24,205) if dark else (255,253,249,225))
    text(draw, (x+18, y+23), value.upper(), 19, fill=fill, bold=True, anchor="lm")


def footer(draw, dark=False, number="01"):
    c = WHITE if dark else INK
    draw.line((66, 1005, 1014, 1005), fill=c, width=2)
    text(draw, (66, 1031), "EL PASO · PROPUESTA SOCIAL", 17, fill=c, bold=True, anchor="lm")
    text(draw, (1014, 1031), number, 17, fill=c, bold=True, anchor="rm")


def save(im, name):
    im.convert("RGB").save(POSTS / name, "PNG", optimize=True)


def post_01():
    im = fit(SRC / "elpaso-04.jpg", pos=(0.50, 0.38)).convert("RGBA")
    im.alpha_composite(gradient((W,H), (19,13,12,25), (19,13,12,225)))
    d = ImageDraw.Draw(im)
    label(d, "Curaduría multimarca", dark=True)
    text(d, (66, 670), "Todo lo que\nte gusta,", 108, fill=WHITE, serif=True, spacing=-8)
    text(d, (70, 892), "EN UN SOLO LUGAR", 29, fill=WHITE, bold=True)
    footer(d, dark=True, number="01")
    save(im, "01-todo-en-un-solo-lugar.png")


def post_02():
    im = Image.new("RGB", (W,H), CREAM).convert("RGBA")
    photo = fit(SRC / "elpaso-08.jpg", (620, 860), pos=(0.5,0.35))
    mask = Image.new("L", photo.size, 0); md=ImageDraw.Draw(mask); md.rounded_rectangle((0,0,*photo.size), 38, fill=255)
    im.paste(photo, (394, 88), mask)
    d=ImageDraw.Draw(im)
    text(d,(66,88),"01 / MODA",22,fill=PLUM,bold=True)
    text(d,(66,170),"Un look.\nMuchas\nformas de\nhacerlo tuyo.",72,fill=INK,serif=True,spacing=-2)
    d.rounded_rectangle((66,670,350,752),22,fill=PLUM)
    text(d,(208,711),"MODA + ACCESORIOS",18,fill=WHITE,bold=True,anchor="mm")
    footer(d,number="02")
    save(im,"02-moda-y-accesorios.png")


def post_03():
    im = fit(SRC / "elpaso-07.jpg", pos=(0.5,0.5)).convert("RGBA")
    # Calm editorial veil to preserve legibility over the existing split visual.
    veil=Image.new("RGBA",(W,H),(82,31,50,122)); im.alpha_composite(veil)
    d=ImageDraw.Draw(im)
    label(d,"Belleza / skincare",dark=True)
    d.rounded_rectangle((58,603,1022,950),44,fill=(255,253,249,235))
    text(d,(95,661),"Tu rutina,\nmás cerca.",92,fill=PLUM,serif=True,spacing=-5)
    text(d,(98,879),"SELECCIÓN DE BELLEZA Y SKINCARE",20,fill=INK,bold=True)
    footer(d,dark=True,number="03")
    save(im,"03-belleza-skincare.png")


def post_04():
    im=fit(SRC/"elpaso-03.jpg",pos=(0.52,0.55)).convert("RGBA")
    im.alpha_composite(gradient((W,H),(20,12,7,15),(20,12,7,220)))
    d=ImageDraw.Draw(im)
    label(d,"Gourmet / café",dark=True)
    text(d,(66,720),"Un antojo\ntambién cuenta\ncomo favorito.",76,fill=WHITE,serif=True,spacing=-2)
    footer(d,dark=True,number="04")
    save(im,"04-gourmet-cafe.png")


def post_05():
    im=Image.new("RGB",(W,H),PLUM).convert("RGBA")
    d=ImageDraw.Draw(im)
    # Editorial category system, based only on categories documented in README.
    text(d,(66,62),"MÁS DE 25 MARCAS",22,fill=SAND,bold=True)
    text(d,(66,155),"Una tienda.\nCinco mundos.",90,fill=WHITE,serif=True,spacing=-4)
    cats=["MODA","ACCESORIOS","BELLEZA / SKINCARE","GOURMET / CAFÉ","EVENTOS"]
    y=468
    for i,c in enumerate(cats,1):
        d.line((66,y+52,1014,y+52),fill=(217,196,174,110),width=2)
        text(d,(66,y),f"0{i}",18,fill=SAND,bold=True)
        text(d,(152,y),c,30,fill=WHITE,bold=True)
        y+=88
    footer(d,dark=True,number="05")
    save(im,"05-cinco-mundos.png")


def post_06():
    im=fit(SRC/"elpaso-01.jpg",pos=(0.5,0.45)).convert("RGBA")
    im=im.filter(ImageFilter.GaussianBlur(1.2))
    im.alpha_composite(Image.new("RGBA",(W,H),(25,18,16,92)))
    d=ImageDraw.Draw(im)
    d.rounded_rectangle((58,90,1022,936),48,fill=(255,253,249,235),outline=(255,255,255,190),width=2)
    text(d,(96,142),"VISÍTANOS",22,fill=ROSE,bold=True)
    text(d,(96,220),"El Paso",96,fill=INK,serif=True)
    text(d,(96,352),"Casa Spazio de Talenti · local 1\nTrigal Centro, frente al Colegio\nLisandro Ramírez · Valencia",31,fill=INK,spacing=14)
    d.line((96,535,984,535),fill=SAND,width=3)
    text(d,(96,594),"LUNES A VIERNES",20,fill=PLUM,bold=True)
    text(d,(984,594),"10:00 — 17:00",28,fill=INK,bold=True,anchor="ra")
    text(d,(96,690),"SÁBADO",20,fill=PLUM,bold=True)
    text(d,(984,690),"10:00 — 16:00",28,fill=INK,bold=True,anchor="ra")
    text(d,(96,826),"Horario y ubicación documentados en el proyecto.",17,fill=INK)
    footer(d,dark=True,number="06")
    save(im,"06-visitanos.png")


def avatar():
    src=Image.open(SRC/"elpaso-01.jpg").convert("RGB")
    bg=ImageOps.fit(src,(1080,1080),Image.Resampling.LANCZOS,centering=(0.5,0.20)).filter(ImageFilter.GaussianBlur(14))
    bg=ImageEnhance.Brightness(bg).enhance(0.58).convert("RGBA")
    d=ImageDraw.Draw(bg)
    d.ellipse((102,102,978,978),fill=(245,239,230,236),outline=(255,255,255,255),width=16)
    text(d,(540,435),"El",64,fill=PLUM,serif=True,anchor="mm")
    text(d,(540,545),"PASO",150,fill=INK,serif=True,anchor="mm")
    text(d,(540,680),"TIENDA MULTIMARCA",30,fill=PLUM,bold=True,anchor="mm")
    bg.convert("RGB").save(OUT/"avatar.png","PNG",optimize=True)


def grid_mockup():
    thumbs=[Image.open(p).convert("RGB") for p in sorted(POSTS.glob("*.png"))]
    canvas=Image.new("RGB",(1440,1800),"#F1F0ED"); d=ImageDraw.Draw(canvas)
    d.rounded_rectangle((90,70,1350,1730),40,fill="white")
    av=Image.open(OUT/"avatar.png").convert("RGB").resize((190,190))
    mask=Image.new("L",(190,190),0); ImageDraw.Draw(mask).ellipse((0,0,190,190),fill=255)
    canvas.paste(av,(150,130),mask)
    text(d,(390,152),"elpasotiendamultimarca",34,bold=True)
    text(d,(390,211),"El Paso · Tienda Multimarca",26)
    text(d,(390,257),"Moda · accesorios · belleza · gourmet · eventos",22,fill="#655F5A")
    text(d,(390,296),"Valencia, Venezuela",22,fill="#655F5A")
    d.line((120,370,1320,370),fill="#DDD8D2",width=2)
    y0=400; gap=9; cell=394
    order=[0,1,2,3,4,5]
    for idx,i in enumerate(order):
        thumb=thumbs[i].resize((cell,cell),Image.Resampling.LANCZOS)
        x=120+(idx%3)*(cell+gap); y=y0+(idx//3)*(cell+gap)
        canvas.paste(thumb,(x,y))
    text(d,(720,1260),"VISTA DE PERFIL · PROPUESTA VISUAL",21,fill="#77716B",bold=True,anchor="mm")
    d.rounded_rectangle((120,1330,1320,1620),30,fill=CREAM)
    text(d,(170,1380),"Sistema editorial",20,fill=PLUM,bold=True)
    text(d,(170,1432),"Fotografía de producto + tipografía protagonista +\ncategorías claras para una cuadrícula reconocible.",35,fill=INK,serif=True,spacing=8)
    text(d,(170,1565),"CONCEPTO NO OFICIAL · NO PUBLICADO",18,fill=ROSE,bold=True)
    canvas.save(OUT/"profile-grid-mockup.png","PNG",optimize=True)


def comparison():
    canvas=Image.new("RGB",(2160,1200),"#EEE9E2"); d=ImageDraw.Draw(canvas)
    text(d,(90,72),"PRESENCIA ACTUAL / PROPUESTA WEB",46,fill=INK,bold=True)
    text(d,(90,132),"Comparación conceptual con evidencia local documentada",24,fill="#655F5A")
    left=ImageOps.fit(Image.open(SRC/"elpaso-01.jpg").convert("RGB"),(930,760),Image.Resampling.LANCZOS,centering=(0.5,0.48))
    right=ImageOps.fit(Image.open(QA/"desktop-catalog.png").convert("RGB"),(930,760),Image.Resampling.LANCZOS,centering=(0.5,0.08))
    canvas.paste(left,(90,235)); canvas.paste(right,(1140,235))
    d.rectangle((90,235,1020,320),fill=(32,27,24))
    text(d,(130,278),"PRESENCIA ACTUAL",24,fill=WHITE,bold=True,anchor="lm")
    d.rectangle((1140,235,2070,320),fill=PLUM)
    text(d,(1180,278),"PROPUESTA WEB · DEMO NO OFICIAL",24,fill=WHITE,bold=True,anchor="lm")
    text(d,(90,1040),"Referencia: activo social oficial entregado localmente.",20,fill=INK)
    text(d,(1140,1040),"Referencia: captura local de la demo conceptual.",20,fill=INK)
    text(d,(90,1115),"No representa un rediseño aprobado ni una implementación oficial.",21,fill=ROSE,bold=True)
    (OUT/"comparison").mkdir(exist_ok=True)
    canvas.save(OUT/"comparison"/"before-after.png","PNG",optimize=True)


if __name__ == "__main__":
    post_01(); post_02(); post_03(); post_04(); post_05(); post_06()
    avatar(); grid_mockup(); comparison()
    print(f"Rendered El Paso social package to {OUT}")
