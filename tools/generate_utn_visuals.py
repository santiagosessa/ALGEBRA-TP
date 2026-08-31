from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


OUT = Path(__file__).resolve().parents[1] / "assets_utn_visuales"
OUT.mkdir(parents=True, exist_ok=True)

W, H = 1920, 1080
BG = (248, 250, 252, 255)
NAVY = (15, 23, 42, 255)
SLATE = (51, 65, 85, 255)
MUTED = (100, 116, 139, 255)
LINE = (226, 232, 240, 255)
SKY = (14, 165, 233, 255)
BLUE = (3, 105, 161, 255)
PALE_BLUE = (224, 242, 254, 255)
PALE_SKY = (240, 249, 255, 255)
RED = (185, 28, 28, 255)
PALE_RED = (254, 242, 242, 255)
AMBER = (180, 83, 9, 255)
PALE_AMBER = (255, 247, 237, 255)
GREEN = (21, 128, 61, 255)
PALE_GREEN = (240, 253, 244, 255)


def font(size: int, bold: bool = False):
    candidates = [
        "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
    ]
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def mono(size: int, bold: bool = False):
    candidates = [
        "C:/Windows/Fonts/consolab.ttf" if bold else "C:/Windows/Fonts/consola.ttf",
        "C:/Windows/Fonts/courbd.ttf" if bold else "C:/Windows/Fonts/cour.ttf",
    ]
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return font(size, bold)


def canvas() -> tuple[Image.Image, ImageDraw.ImageDraw]:
    im = Image.new("RGBA", (W, H), BG)
    return im, ImageDraw.Draw(im)


def text(draw, xy, value, size, fill=NAVY, bold=False, anchor=None):
    draw.text(xy, value, font=font(size, bold), fill=fill, anchor=anchor)


def mono_text(draw, xy, value, size, fill=NAVY, bold=False, anchor=None):
    draw.text(xy, value, font=mono(size, bold), fill=fill, anchor=anchor)


def arrow(draw, start, end, fill, width=6, head=20):
    draw.line([start, end], fill=fill, width=width)
    ang = math.atan2(end[1] - start[1], end[0] - start[0])
    left = (end[0] - head * math.cos(ang - math.pi / 6), end[1] - head * math.sin(ang - math.pi / 6))
    right = (end[0] - head * math.cos(ang + math.pi / 6), end[1] - head * math.sin(ang + math.pi / 6))
    draw.polygon([end, left, right], fill=fill)


def line_with_dashes(draw, start, end, fill, width=3, dash=14, gap=10):
    x1, y1 = start
    x2, y2 = end
    length = math.hypot(x2 - x1, y2 - y1)
    if length == 0:
        return
    ux, uy = (x2 - x1) / length, (y2 - y1) / length
    pos = 0.0
    while pos < length:
        a = (x1 + ux * pos, y1 + uy * pos)
        b = (x1 + ux * min(pos + dash, length), y1 + uy * min(pos + dash, length))
        draw.line([a, b], fill=fill, width=width)
        pos += dash + gap


def rounded(draw, box, radius, fill, outline=None, width=2):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def project(x, y, z, origin=(1100, 620), scale=30):
    # Camera chosen so the plane normal n=(2,-1,1) has a visible component.
    # The previous oblique camera was almost parallel to the plane, flattening it.
    u = -0.776 * x - 0.630 * y
    v = -0.317 * x + 0.390 * y + 0.866 * z
    return origin[0] + u * scale, origin[1] - v * scale


def save(im: Image.Image, name: str):
    im.save(OUT / name, format="PNG", optimize=True)


def glow_line(layer, points, color, width=8, blur=22):
    sharp = Image.new("RGBA", layer.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(sharp)
    sd.line(points, fill=color, width=width, joint="curve")
    from PIL import ImageFilter
    halo = sharp.filter(ImageFilter.GaussianBlur(blur))
    layer.alpha_composite(halo)
    layer.alpha_composite(sharp)


def overlay_interseccion():
    w, h = 1400, 900
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    glows = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    origin = (950, 500)

    def p(x, y, z):
        return project(x, y, z, origin=(950, 500), scale=30)

    # translucent plane and grid, designed to remain visible on a dark background
    plane = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    pd = ImageDraw.Draw(plane)
    corners = [p(0, 2 * 0 - 7 - 6, -7), p(10, 2 * 10 - 7 - 6, -7), p(10, 2 * 10 + 1 - 6, 1), p(0, 2 * 0 + 1 - 6, 1)]
    pd.polygon(corners, fill=(14, 165, 233, 46), outline=(56, 189, 248, 230))
    for x in [0, 2, 4, 6, 8, 10]:
        pd.line([p(x, 2 * x - 7 - 6, -7), p(x, 2 * x + 1 - 6, 1)], fill=(56, 189, 248, 125), width=2)
    for z in [-7, -5, -3, -1, 1]:
        pd.line([p(0, z - 6, z), p(10, 20 + z - 6, z)], fill=(56, 189, 248, 125), width=2)
    im.alpha_composite(plane)
    # Axes in pale blue.
    axes = (226, 232, 240, 210)
    for end in [p(10, 0, 0), p(0, 8, 0), p(0, 0, 6)]:
        d.line([origin, end], fill=axes, width=4)
    # Exact line r and intersection I.
    line_pts = [p(-1 + 3 * lam, 2 + lam, -2 * lam) for lam in [0.0 + 4.4 * i / 80 for i in range(81)]]
    glow_line(glows, line_pts, (14, 165, 233, 115), width=22, blur=34)
    glow_line(im, line_pts, (226, 232, 240, 235), width=8, blur=10)
    I = p(9, 16 / 3, -20 / 3)
    halo = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    hd = ImageDraw.Draw(halo)
    hd.ellipse((I[0] - 48, I[1] - 48, I[0] + 48, I[1] + 48), fill=(239, 68, 68, 125))
    from PIL import ImageFilter
    im.alpha_composite(halo.filter(ImageFilter.GaussianBlur(28)))
    d.ellipse((I[0] - 16, I[1] - 16, I[0] + 16, I[1] + 16), fill=(248, 113, 113, 255), outline=(255, 255, 255, 230), width=3)
    im.alpha_composite(glows)
    im.save(OUT / "08_overlay_interseccion_transparente.png", format="PNG", optimize=True)


def overlay_angle():
    w, h = 1200, 800
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    glows = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    o = (300, 560)
    plane_end = (1040, 560)
    normal_end = (510, 135)
    alpha = math.asin(1 / 9)
    direction_end = (o[0] + 740 * math.cos(alpha), o[1] - 740 * math.sin(alpha))
    glow_line(glows, [o, plane_end], (14, 165, 233, 135), width=22, blur=28)
    glow_line(glows, [o, normal_end], (239, 68, 68, 125), width=22, blur=28)
    glow_line(glows, [o, direction_end], (226, 232, 240, 145), width=18, blur=28)
    im.alpha_composite(glows)
    d.line([o, plane_end], fill=(14, 165, 233, 235), width=9)
    d.line([o, normal_end], fill=(248, 113, 113, 235), width=9)
    d.line([o, direction_end], fill=(226, 232, 240, 240), width=9)
    # Complementary angle arcs, no text baked in so the overlay can be reused.
    d.arc((o[0] - 140, o[1] - 140, o[0] + 140, o[1] + 140), 360 - math.degrees(alpha), 360, fill=(56, 189, 248, 255), width=7)
    d.arc((o[0] - 170, o[1] - 170, o[0] + 170, o[1] + 170), 270, 360 - math.degrees(alpha), fill=(248, 113, 113, 235), width=6)
    # Right angle marker.
    q = 62
    d.line([(o[0] + q, o[1]), (o[0] + q, o[1] - q), (o[0], o[1] - q)], fill=(226, 232, 240, 190), width=4)
    im.save(OUT / "09_overlay_angulo_normal_transparente.png", format="PNG", optimize=True)


def overlay_auditoria():
    w, h = 1400, 900
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    glows = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    nodes = [(700, 120), (1060, 350), (930, 730), (470, 730), (340, 350)]
    colors = [(56, 189, 248, 240), (14, 165, 233, 240), (239, 68, 68, 240), (226, 232, 240, 220), (51, 65, 85, 235)]
    for i in range(len(nodes)):
        a, b = nodes[i], nodes[(i + 1) % len(nodes)]
        d.line([a, b], fill=(148, 163, 184, 85), width=4)
        d.line([a, b], fill=(56, 189, 248, 85), width=1)
    for pnt, col in zip(nodes, colors):
        r = 55
        hd = ImageDraw.Draw(glows)
        hd.ellipse((pnt[0] - r, pnt[1] - r, pnt[0] + r, pnt[1] + r), fill=col[:3] + (120,))
    from PIL import ImageFilter
    im.alpha_composite(glows.filter(ImageFilter.GaussianBlur(24)))
    for pnt, col in zip(nodes, colors):
        d.ellipse((pnt[0] - 25, pnt[1] - 25, pnt[0] + 25, pnt[1] + 25), fill=col, outline=(226, 232, 240, 220), width=3)
    # A single red break indicates the point where a claim must be checked.
    d.line([(640, 510), (760, 510)], fill=(248, 113, 113, 220), width=8)
    d.ellipse((690, 480, 710, 500), fill=(248, 113, 113, 255))
    im.save(OUT / "10_overlay_auditoria_nodos_transparente.png", format="PNG", optimize=True)


def interseccion():
    im, d = canvas()
    text(d, (92, 72), "Intersección en R³", 48, NAVY, True)
    text(d, (94, 132), "La recta r atraviesa el plano π en un único punto verificable.", 25, SLATE)
    # Plane surface: y = 2x + z - 6.
    x0, x1, z0, z1 = 0.0, 10.0, -7.0, 1.0
    corners = [project(x0, 2 * x0 + z0 - 6, z0), project(x1, 2 * x1 + z0 - 6, z0),
               project(x1, 2 * x1 + z1 - 6, z1), project(x0, 2 * x0 + z1 - 6, z1)]
    plane_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    plane_draw = ImageDraw.Draw(plane_layer)
    plane_draw.polygon(corners, fill=(14, 165, 233, 58), outline=(3, 105, 161, 230))
    im.alpha_composite(plane_layer)
    # Plane grid.
    for x in [0, 2, 4, 6, 8, 10]:
        d.line([project(x, 2 * x + z0 - 6, z0), project(x, 2 * x + z1 - 6, z1)], fill=(3, 105, 161, 150), width=2)
    for z in [-8, -6, -4, -2, 0, 2]:
        d.line([project(x0, 2 * x0 + z - 6, z), project(x1, 2 * x1 + z - 6, z)], fill=(3, 105, 161, 150), width=2)
    # Axes.
    O = project(0, 0, 0)
    arrow(d, O, project(10, 0, 0), SLATE, 4, 16)
    arrow(d, O, project(0, 8, 0), SLATE, 4, 16)
    arrow(d, O, project(0, 0, 6), SLATE, 4, 16)
    text(d, project(10.2, 0, 0), "x", 28, SLATE, True, "lm")
    text(d, project(0, 8.4, 0), "y", 28, SLATE, True, "lm")
    text(d, project(0, 0, 6.4), "z", 28, SLATE, True, "lm")
    # Line r.
    line_pts = [project(-1 + 3 * lam, 2 + lam, -2 * lam) for lam in [0.0 + 4.4 * i / 80 for i in range(81)]]
    d.line(line_pts, fill=NAVY, width=10, joint="curve")
    # Intersection point λ=10/3.
    I = project(9, 16 / 3, -20 / 3)
    d.ellipse((I[0] - 15, I[1] - 15, I[0] + 15, I[1] + 15), fill=RED)
    arrow(d, (I[0] + 18, I[1] - 58), (I[0] + 4, I[1] - 16), RED, 4, 14)
    text(d, (I[0] + 28, I[1] - 88), "I = (9, 16/3, −20/3)", 27, RED, True)
    rounded(d, (1420, 172, 1810, 310), 20, PALE_BLUE, outline=(125, 211, 252, 255), width=2)
    text(d, (1450, 202), "PLANO π", 20, BLUE, True)
    mono_text(d, (1450, 242), "2x − y + z − 6 = 0", 25, NAVY, True)
    rounded(d, (1420, 348, 1810, 494), 20, (241, 245, 249, 255), outline=LINE, width=2)
    text(d, (1450, 378), "RECTA r", 20, NAVY, True)
    mono_text(d, (1450, 418), "x = −1 + 3λ", 23, NAVY)
    mono_text(d, (1450, 452), "y = 2 + λ   z = −2λ", 23, NAVY)
    rounded(d, (1420, 532, 1810, 686), 20, PALE_RED, outline=(252, 165, 165, 255), width=2)
    text(d, (1450, 562), "FILTRO", 20, RED, True)
    text(d, (1450, 602), "Sustituir y verificar", 27, NAVY, True)
    text(d, (1450, 640), "antes de cerrar la cuenta.", 24, SLATE)
    save(im, "01_interseccion_recta_plano_r3.png")


def angle():
    im, d = canvas()
    text(d, (92, 72), "Ángulo entre recta y plano", 48, NAVY, True)
    text(d, (94, 132), "El producto escalar mide primero el ángulo con la normal.", 25, SLATE)
    origin = (660, 690)
    plane_end = (1510, 690)
    normal_end = (890, 190)
    d.line([origin, plane_end], fill=BLUE, width=10)
    arrow(d, (1330, 690), plane_end, BLUE, 10, 26)
    d.line([origin, normal_end], fill=RED, width=10)
    arrow(d, (835, 275), normal_end, RED, 10, 26)
    # Direction vector at the exact angle α=arcsin(1/9).
    alpha = math.asin(1 / 9)
    direction_end = (origin[0] + 850 * math.cos(alpha), origin[1] - 850 * math.sin(alpha))
    d.line([origin, direction_end], fill=NAVY, width=10)
    arrow(d, (direction_end[0] - 125 * math.cos(alpha), direction_end[1] + 125 * math.sin(alpha)), direction_end, NAVY, 10, 26)
    # Right angle marker between plane and normal.
    q = 70
    d.line([origin[0] + q, origin[1], origin[0] + q, origin[1] - q, origin[0], origin[1] - q], fill=SLATE, width=4)
    # α arc.
    d.arc((origin[0] - 170, origin[1] - 170, origin[0] + 170, origin[1] + 170), 360 - math.degrees(alpha), 360, fill=SKY, width=8)
    # β arc between direction and normal (visual complement).
    d.arc((origin[0] - 210, origin[1] - 210, origin[0] + 210, origin[1] + 210), 270, 360 - math.degrees(alpha), fill=RED, width=7)
    text(d, (1010, 610), "α", 38, SKY, True)
    text(d, (820, 395), "β", 38, RED, True)
    text(d, (1450, 720), "plano π", 28, BLUE, True)
    text(d, (942, 164), "normal n", 28, RED, True)
    text(d, (1390, 355), "dirección d", 28, NAVY, True)
    rounded(d, (1120, 170, 1780, 390), 24, PALE_BLUE, outline=(125, 211, 252, 255), width=2)
    mono_text(d, (1160, 212), "n = (1, −2, 2)", 28, RED, True)
    mono_text(d, (1160, 260), "d = (1, 2, 2)", 28, NAVY, True)
    mono_text(d, (1160, 308), "sin α = |n · d| / (‖n‖‖d‖)", 24, SLATE)
    rounded(d, (1120, 450, 1780, 670), 24, PALE_RED, outline=(252, 165, 165, 255), width=2)
    text(d, (1160, 486), "ÁNGULO REAL", 21, RED, True)
    text(d, (1160, 534), "α = 6,38°", 42, NAVY, True)
    text(d, (1160, 590), "= 6° 22′ 46″", 29, SLATE)
    save(im, "02_angulo_recta_plano.png")


def projected_plane(draw, center, label, equation, plane_color, note=None):
    cx, cy = center
    # Small isometric square plane with axes.
    sx, sy = 170, 115
    pts = [(cx - sx, cy + sy), (cx + sx, cy + sy), (cx + sx + 90, cy - 5), (cx - sx + 90, cy - 5)]
    draw.polygon(pts, fill=plane_color, outline=BLUE)
    draw.line([(cx, cy + 155), (cx, cy - 105)], fill=SLATE, width=4)
    draw.line([(cx - 145, cy + 90), (cx + 180, cy + 90)], fill=SLATE, width=4)
    draw.line([(cx - 100, cy + 155), (cx + 180, cy - 35)], fill=SLATE, width=4)
    text(draw, (cx - 230, cy - 220), label, 30, NAVY, True)
    mono_text(draw, (cx - 230, cy - 175), equation, 24, BLUE, True)
    if note:
        text(draw, (cx - 230, cy + 175), note, 22, SLATE)


def planes():
    im, d = canvas()
    text(d, (92, 72), "Tres planos cartesianos, un filtro", 48, NAVY, True)
    text(d, (94, 132), "La pertenencia del punto P obliga a revisar el signo antes de aceptar el resultado.", 25, SLATE)
    projected_plane(d, (410, 510), "πxy", "3x + 4y − 2 = 0", (224, 242, 254, 255), "paralelo a Z")
    projected_plane(d, (960, 510), "πxz", "x − 4z + 18 = 0", (240, 249, 255, 255), "corregido: −18 → +18")
    projected_plane(d, (1510, 510), "πyz", "y + 3z − 14 = 0", (224, 242, 254, 255), "paralelo a X")
    rounded(d, (520, 820, 1400, 974), 22, PALE_RED, outline=(252, 165, 165, 255), width=2)
    text(d, (570, 855), "P(2, −1, 5)", 34, NAVY, True)
    mono_text(d, (850, 857), "−36 ≠ 0", 34, RED, True)
    text(d, (1110, 860), "→ revisar término independiente", 27, RED, True)
    save(im, "03_planos_proyectantes_xyz.png")


def workflow():
    im, d = canvas()
    text(d, (92, 72), "Protocolo de auditoría en cinco fases", 48, NAVY, True)
    text(d, (94, 132), "Una ruta visual para que el expositor narre problema, contraste y juicio crítico.", 25, SLATE)
    xs = [220, 575, 930, 1285, 1640]
    labels = ["Resolver", "Contrastar", "Verificar", "Tensionar", "Reflexionar"]
    subs = ["patrones\nmatemáticos", "grupo vs.\nmodelos", "puntos y\nsignos", "prompts\nadversarios", "aporte\npedagógico"]
    colors = [BLUE, SKY, GREEN, RED, NAVY]
    for i in range(4):
        arrow(d, (xs[i] + 90, 510), (xs[i + 1] - 90, 510), LINE, 8, 22)
    for i, x in enumerate(xs):
        d.ellipse((x - 72, 438, x + 72, 582), fill=colors[i])
        text(d, (x, 510), f"0{i + 1}", 30, (255, 255, 255, 255), True, "mm")
        text(d, (x, 650), labels[i], 30, NAVY, True, "mm")
        text(d, (x, 704), subs[i], 23, SLATE, anchor="ma")
    rounded(d, (555, 855, 1365, 972), 20, PALE_BLUE, outline=(125, 211, 252, 255), width=2)
    text(d, (960, 913), "calcular  →  contrastar  →  verificar  →  explicar", 27, NAVY, True, "mm")
    save(im, "04_protocolo_auditoria_5_fases.png")


def matrix():
    im, d = canvas()
    text(d, (92, 72), "Auditoría cruzada de desempeño", 48, NAVY, True)
    text(d, (94, 132), "La comparación no mira solo el resultado: también mira el proceso y la verificación.", 25, SLATE)
    x0, y0 = 160, 300
    col_w = [440, 500, 560]
    row_h = 112
    headers = ["Ejercicio", "Grupo de estudiantes", "Modelos de IA"]
    for j, header in enumerate(headers):
        x = x0 + sum(col_w[:j])
        rounded(d, (x, y0, x + col_w[j] - 8, y0 + 72), 14, NAVY if j == 0 else BLUE)
        text(d, (x + 24, y0 + 21), header, 23, (255, 255, 255, 255), True)
    rows = [
        ("1 · Intersección", "OK · punto exacto", "OK · preciso"),
        ("2 · Ángulo", "OK · usa seno", "PARCIAL · coseno"),
        ("3 · Parámetro m", "OK · detecta absurdo", "ALERTA · m = 18"),
        ("4 · Proyectantes", "ALERTA · corrige −18 → +18", "OK · omisión πyz"),
    ]
    fills = [(255, 255, 255, 255), (240, 249, 255, 255), (255, 247, 237, 255), (254, 242, 242, 255)]
    for i, row in enumerate(rows):
        y = y0 + 88 + i * row_h
        for j, value in enumerate(row):
            x = x0 + sum(col_w[:j])
            rounded(d, (x, y, x + col_w[j] - 8, y + row_h - 10), 12, fills[i], outline=LINE, width=2)
            fill = NAVY if j == 0 else (GREEN if value.startswith("OK") else (AMBER if value.startswith("PARCIAL") else RED))
            text(d, (x + 24, y + 31), value, 24, fill, j == 0)
    rounded(d, (430, 870, 1490, 968), 20, PALE_BLUE, outline=(125, 211, 252, 255), width=2)
    text(d, (960, 919), "OK consistente    PARCIAL    ALERTA requiere corrección", 25, NAVY, True, "mm")
    save(im, "05_matriz_auditoria_humano_ia.png")


def loop():
    im, d = canvas()
    text(d, (92, 72), "El ciclo que sostiene el criterio", 48, NAVY, True)
    text(d, (94, 132), "La herramienta acelera el cálculo; el estudiante decide si el resultado resiste la evidencia.", 25, SLATE)
    center = (960, 570)
    positions = [(960, 285), (1390, 570), (960, 855), (530, 570)]
    labels = ["Resolver", "Sustituir", "Contrastar", "Decidir"]
    subs = ["obtener una\nrespuesta", "revisar puntos\ny signos", "comparar grupo,\nmodelos y fuente", "aceptar, corregir\no declarar vacío"]
    cols = [BLUE, SKY, RED, NAVY]
    for i in range(4):
        a = positions[i]
        b = positions[(i + 1) % 4]
        # shortened arrow between nodes
        ux, uy = (b[0] - a[0], b[1] - a[1])
        L = math.hypot(ux, uy)
        ux, uy = ux / L, uy / L
        arrow(d, (a[0] + ux * 95, a[1] + uy * 95), (b[0] - ux * 95, b[1] - uy * 95), LINE, 8, 22)
    for (x, y), lab, sub, col in zip(positions, labels, subs, cols):
        d.ellipse((x - 88, y - 88, x + 88, y + 88), fill=col)
        text(d, (x, y - 5), lab, 28, (255, 255, 255, 255), True, "mm")
        text(d, (x, y + 145), sub, 23, SLATE, anchor="ma")
    rounded(d, (720, 475, 1200, 665), 24, PALE_BLUE, outline=(125, 211, 252, 255), width=2)
    text(d, (960, 525), "No aceptar", 34, NAVY, True, "ma")
    text(d, (960, 575), "sin verificar", 34, RED, True, "ma")
    save(im, "06_ciclo_verificacion_humana.png")


def contact_sheet():
    files = [
        "01_interseccion_recta_plano_r3.png",
        "02_angulo_recta_plano.png",
        "03_planos_proyectantes_xyz.png",
        "04_protocolo_auditoria_5_fases.png",
        "05_matriz_auditoria_humano_ia.png",
        "06_ciclo_verificacion_humana.png",
    ]
    thumb_w, thumb_h = 480, 270
    sheet = Image.new("RGB", (thumb_w * 2, (thumb_h + 54) * 3), (241, 245, 249))
    sd = ImageDraw.Draw(sheet)
    for i, name in enumerate(files):
        im = Image.open(OUT / name).convert("RGB")
        im.thumbnail((thumb_w, thumb_h))
        x = (i % 2) * thumb_w
        y = (i // 2) * (thumb_h + 54)
        sheet.paste(im, (x, y))
        sd.text((x + 12, y + thumb_h + 12), name[:38], font=font(16, True), fill=NAVY)
    sheet.save(OUT / "00_contact_sheet.png", format="PNG", optimize=True)


def dark_overlay_sheet():
    files = [
        "08_overlay_interseccion_transparente.png",
        "09_overlay_angulo_normal_transparente.png",
        "10_overlay_auditoria_nodos_transparente.png",
    ]
    sheet = Image.new("RGB", (1600, 640), (5, 15, 23))
    sd = ImageDraw.Draw(sheet)
    for i, name in enumerate(files):
        overlay = Image.open(OUT / name).convert("RGBA")
        overlay.thumbnail((490, 470))
        x = 40 + i * 520
        y = 55
        sheet.paste(overlay, (x, y), overlay)
        sd.text((x, 565), name.replace("_transparente", "")[:28], font=font(18, True), fill=(226, 232, 240))
    sheet.save(OUT / "11_contact_sheet_overlays_oscuros.png", format="PNG", optimize=True)


if __name__ == "__main__":
    interseccion()
    angle()
    planes()
    workflow()
    matrix()
    loop()
    overlay_interseccion()
    overlay_angle()
    overlay_auditoria()
    contact_sheet()
    dark_overlay_sheet()
    print(OUT)
