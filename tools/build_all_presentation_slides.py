# -*- coding: utf-8 -*-
from __future__ import annotations

import math
import os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "procedimiento antigravity imagenes"
OUT_DIR.mkdir(parents=True, exist_ok=True)

W, H = 1920, 1080

# Colors
BG_DARK = (4, 14, 20, 255)
TEXT_WHITE = (244, 248, 246, 255)
TEXT_MUTED = (148, 170, 168, 255)
TEXT_DIM = (100, 125, 122, 255)

CYAN_GLOW = (56, 189, 248, 255)
CYAN_LINE = (117, 211, 192, 220)
TEAL_FILL = (18, 55, 62, 190)

AMBER_GLOW = (240, 179, 108, 255)
AMBER_BG = (45, 32, 18, 200)

GREEN_GLOW = (74, 222, 128, 255)
GREEN_BG = (16, 42, 26, 200)

RED_GLOW = (248, 113, 113, 255)
RED_BG = (46, 20, 22, 200)

CARD_BG = (8, 23, 32, 230)
CARD_BORDER = (24, 61, 79, 220)

def get_font(name: str, size: int, bold: bool = False):
    candidates = []
    if name == "serif":
        candidates = ["C:/Windows/Fonts/georgiab.ttf" if bold else "C:/Windows/Fonts/georgia.ttf",
                      "C:/Windows/Fonts/timesbd.ttf" if bold else "C:/Windows/Fonts/times.ttf"]
    elif name == "mono":
        candidates = ["C:/Windows/Fonts/consolab.ttf" if bold else "C:/Windows/Fonts/consola.ttf",
                      "C:/Windows/Fonts/courbd.ttf" if bold else "C:/Windows/Fonts/cour.ttf"]
    else: # sans
        candidates = ["C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
                      "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf"]
    for c in candidates:
        if os.path.exists(c):
            return ImageFont.truetype(c, size)
    return ImageFont.load_default()

avatar_path = ROOT / "avatar_extracted.png"
avatar_img = Image.open(avatar_path).convert("RGBA") if avatar_path.exists() else None

def create_base_canvas():
    top_c = np.array([3, 10, 16], dtype=float)
    mid_c = np.array([7, 24, 33], dtype=float)
    bot_c = np.array([4, 14, 20], dtype=float)
    
    arr = np.zeros((H, W, 4), dtype=np.uint8)
    for y in range(H):
        t = y / H
        if t < 0.6:
            factor = t / 0.6
            c = (1.0 - factor) * top_c + factor * mid_c
        else:
            factor = (t - 0.6) / 0.4
            c = (1.0 - factor) * mid_c + factor * bot_c
        arr[y, :, :3] = c.astype(np.uint8)
        arr[y, :, 3] = 255
        
    im = Image.fromarray(arr)
    d = ImageDraw.Draw(im)
    
    # Celestial Moon
    mx, my, mr = 940, 160, 46
    for gr in range(mr + 28, mr, -4):
        alpha = int(18 * (1.0 - (gr - mr) / 28.0))
        d.ellipse([mx - gr, my - gr, mx + gr, my + gr], fill=(120, 160, 155, alpha))
    d.ellipse([mx - mr, my - mr, mx + mr, my + mr], fill=(160, 185, 180, 55))
    
    # Stars & particles
    import random
    rng = random.Random(42)
    for _ in range(95):
        sx = rng.randint(40, W - 40)
        sy = rng.randint(30, int(H * 0.75))
        sr = rng.choice([1, 1.5, 2, 2.5])
        sa = rng.randint(40, 180)
        color = (156, 190, 187, sa) if rng.random() > 0.3 else (240, 179, 108, sa)
        d.ellipse([sx - sr, sy - sr, sx + sr, sy + sr], fill=color)
        
    # Low-poly Trees
    def draw_tree(cx, base_y, height, width, alpha=230):
        trunk_w = max(6, int(width * 0.12))
        trunk_h = int(height * 0.3)
        d.rectangle([cx - trunk_w//2, base_y - trunk_h, cx + trunk_w//2, base_y], fill=(16, 28, 26, alpha))
        
        levels = [
            (base_y - int(height * 0.22), int(height * 0.40), width),
            (base_y - int(height * 0.46), int(height * 0.38), int(width * 0.82)),
            (base_y - int(height * 0.70), int(height * 0.35), int(width * 0.62)),
        ]
        for y_bot, h_tier, w_tier in levels:
            top_pt = (cx, y_bot - h_tier)
            bot_l = (cx - w_tier // 2, y_bot)
            bot_r = (cx + w_tier // 2, y_bot)
            bot_m = (cx, y_bot + 4)
            d.polygon([top_pt, bot_l, bot_m], fill=(22, 68, 62, alpha))
            d.polygon([top_pt, bot_m, bot_r], fill=(12, 38, 35, alpha))
            d.line([top_pt, bot_m], fill=(32, 92, 84, alpha), width=1)
            
    tree_specs = [
        (130, 820, 520, 140, 230),
        (260, 840, 480, 130, 210),
        (380, 800, 420, 110, 160),
        (480, 780, 360, 95, 120),
        (1640, 820, 540, 145, 220),
        (1770, 840, 490, 135, 210),
        (1870, 810, 450, 120, 190),
    ]
    for tx, ty, th, tw, ta in tree_specs:
        draw_tree(tx, ty, th, tw, ta)
        
    if avatar_img is not None:
        av_w, av_h = avatar_img.size
        target_h = 560
        target_w = int(av_w * (target_h / av_h))
        av_resized = avatar_img.resize((target_w, target_h), Image.Resampling.LANCZOS)
        im.alpha_composite(av_resized, (1320, 130))
        
    return im, ImageDraw.Draw(im)

def draw_header(d, phase_text, title_text, subtitle_text):
    font_badge = get_font("mono", 12, bold=True)
    badge_w = len(phase_text) * 8.5 + 24
    d.rounded_rectangle([75, 42, 75 + badge_w, 68], radius=6, fill=(14, 40, 54, 220), outline=CYAN_LINE, width=1)
    d.text((87, 47), phase_text.upper(), font=font_badge, fill=CYAN_GLOW)
    
    font_title = get_font("serif", 38, bold=True)
    d.text((75, 80), title_text, font=font_title, fill=TEXT_WHITE)
    
    if subtitle_text:
        font_sub = get_font("sans", 17, bold=False)
        d.text((78, 134), subtitle_text, font=font_sub, fill=TEXT_MUTED)

def draw_footer(d, slide_num, total_slides=12):
    d.line([(75, 1025), (1845, 1025)], fill=(24, 55, 70, 200), width=1)
    font_foot = get_font("sans", 13, bold=False)
    font_num = get_font("mono", 15, bold=True)
    d.text((78, 1038), "UTN FRLP · Álgebra y Geometría Analítica · TP N° 3 · Grupo: Santiago Sessa, Mateo Rau, Lucio Pieroni, Lucas Bazan", font=font_foot, fill=TEXT_DIM)
    d.text((1760, 1036), f"{slide_num:02d} / {total_slides:02d}", font=font_num, fill=AMBER_GLOW)

def draw_teleprompter(d, script_text):
    font_quote = get_font("serif", 32, bold=True)
    font_text = get_font("sans", 15, bold=False)
    
    box = [75, 890, 1845, 995]
    d.rounded_rectangle(box, radius=12, fill=(6, 19, 27, 235), outline=(24, 61, 79, 210), width=1)
    d.rounded_rectangle([box[0], box[1], box[0] + 6, box[3]], radius=3, fill=AMBER_GLOW)
    
    d.text((95, 896), "“", font=font_quote, fill=AMBER_GLOW)
    
    words = script_text.split()
    lines = []
    curr = ""
    for w in words:
        cand = (curr + " " + w).strip()
        if len(cand) > 138:
            lines.append(curr)
            curr = w
        else:
            curr = cand
    if curr:
        lines.append(curr)
        
    for idx, l in enumerate(lines[:2]):
        d.text((125, 912 + idx * 28), l, font=font_text, fill=TEXT_WHITE)

def draw_card(d, box, title=None, subtitle=None, border_color=CARD_BORDER, bg_color=CARD_BG, radius=10):
    d.rounded_rectangle(box, radius=radius, fill=bg_color, outline=border_color, width=1)
    if title:
        f_t = get_font("sans", 15, bold=True)
        d.text((box[0] + 16, box[1] + 14), title, font=f_t, fill=TEXT_WHITE)
    if subtitle:
        f_s = get_font("sans", 12, bold=False)
        d.text((box[0] + 16, box[1] + 36), subtitle, font=f_s, fill=TEXT_MUTED)

# -------------------------------------------------------------
# SLIDE 01: APERTURA
# -------------------------------------------------------------
def build_slide_01():
    im, d = create_base_canvas()
    draw_header(d, "Fase 0 · Apertura", "Informe Técnico y Auditoría Epistemológica", "Recta y plano en R³ · El punto verificable como unidad de verdad")
    
    # Left Card: Problema y Modelado
    draw_card(d, [75, 185, 640, 530], "MODELADO ESPACIAL EN R³", "Recta paramétrica y plano general", CYAN_LINE)
    f_mono = get_font("mono", 16, bold=True)
    f_sans = get_font("sans", 14, bold=False)
    
    d.text((95, 235), "Plano π:", font=f_mono, fill=CYAN_GLOW)
    d.text((195, 235), "2x − y + z − 6 = 0", font=f_mono, fill=TEXT_WHITE)
    
    d.text((95, 275), "Recta r:", font=f_mono, fill=AMBER_GLOW)
    d.text((195, 275), "x = −1 + 3λ", font=f_mono, fill=TEXT_WHITE)
    d.text((195, 305), "y =  2 +  λ", font=f_mono, fill=TEXT_WHITE)
    d.text((195, 335), "z = −2λ", font=f_mono, fill=TEXT_WHITE)
    
    d.line([(95, 380), (620, 380)], fill=CARD_BORDER, width=1)
    d.text((95, 395), "Objetivo de la Auditoría:", font=get_font("sans", 14, bold=True), fill=TEXT_WHITE)
    d.text((95, 425), "Resolver formalmente cada ejercicio y someter", font=f_sans, fill=TEXT_MUTED)
    d.text((95, 450), "cada resultado a verificación geométrica directa.", font=f_sans, fill=TEXT_MUTED)
    d.text((95, 480), "Distinguir la cuenta del significado espacial.", font=f_sans, fill=CYAN_GLOW)
    
    # Center Card: El Principio de Verificación
    draw_card(d, [665, 185, 1260, 530], "EL PRINCIPIO DE VERIFICACIÓN DIRECTA", "Epistemología y control matemático", AMBER_GLOW)
    
    d.rounded_rectangle([685, 240, 1240, 330], radius=8, fill=(35, 25, 14, 210), outline=AMBER_GLOW, width=1)
    d.text((710, 255), "r ∩ π = { I }", font=get_font("serif", 30, bold=True), fill=AMBER_GLOW)
    d.text((710, 295), "Un punto no vale solo porque aparezca al final de una cuenta.", font=get_font("sans", 13, bold=True), fill=TEXT_WHITE)
    
    d.text((685, 355), "• 1. Resolver formalmente el sistema algebraico.", font=f_sans, fill=TEXT_WHITE)
    d.text((685, 385), "• 2. Sustituir las coordenadas obtenidas en la ecuación del plano.", font=f_sans, fill=TEXT_WHITE)
    d.text((685, 415), "• 3. Comprobar que pertenezca simultáneamente a ambos entes.", font=f_sans, fill=TEXT_WHITE)
    d.text((685, 445), "• 4. Auditar sesgos, alucinaciones y límites de los modelos de IA.", font=f_sans, fill=TEXT_WHITE)
    d.text((685, 475), "• 5. Forjar el criterio analítico del futuro ingeniero.", font=f_sans, fill=AMBER_GLOW)
    
    # Bottom Status Banner
    d.rounded_rectangle([75, 555, 1260, 650], radius=10, fill=(12, 38, 28, 220), outline=GREEN_GLOW, width=1)
    d.text((105, 572), "✓ CRITERIO CENTRAL", font=get_font("sans", 14, bold=True), fill=GREEN_GLOW)
    d.text((105, 602), "La herramienta automática acelera el cálculo; el juicio humano garantiza la coherencia geométrica.", font=get_font("sans", 15, bold=False), fill=TEXT_WHITE)
    
    script = "Bienvenidos. Para empezar, quiero mirar la idea que organiza todo el trabajo: una recta y un plano pueden encontrarse en un punto, pero ese punto no vale solo porque aparezca al final de una cuenta. En esta presentación voy a resolver los ejercicios y, al mismo tiempo, voy a comprobar que cada resultado respete la geometría. Así puedo entender qué aportan las herramientas automáticas y por qué la verificación sigue siendo necesaria."
    draw_teleprompter(d, script)
    draw_footer(d, 1)
    im.save(OUT_DIR / "01_apertura.png", quality=95)
    print("Generated 01_apertura.png")

# -------------------------------------------------------------
# SLIDE 02: PROTOCOLO
# -------------------------------------------------------------
def build_slide_02():
    im, d = create_base_canvas()
    draw_header(d, "Fase 0 · Metodología", "Protocolo de Auditoría en Cinco Fases", "Ruta de análisis: cálculo, contraste cruzado, verificación y juicio crítico")
    
    f_sans_b = get_font("sans", 14, bold=True)
    f_sans = get_font("sans", 12, bold=False)
    f_mono_num = get_font("mono", 20, bold=True)
    
    phases = [
        ("01", "RESOLVER", "Patrones Matemáticos", "Desarrollo analítico riguroso\ny planteos algebraicos formales.", CYAN_GLOW, (12, 35, 48, 220)),
        ("02", "CONTRASTAR", "Grupo vs. Modelos", "Comparación cruzada de\nrespuestas de estudiantes e IA.", AMBER_GLOW, (40, 28, 14, 220)),
        ("03", "VERIFICAR", "Puntos y Signos", "Sustitución de puntos de paso\ny relaciones espaciales directas.", GREEN_GLOW, (14, 40, 26, 220)),
        ("04", "TENSIONAR", "Prompts Adversarios", "Stress-testing con premisas falsas\ny detección de inconsistencias.", RED_GLOW, (45, 18, 22, 220)),
        ("05", "REFLEXIONAR", "Aporte Pedagógico", "Conclusiones metacognitivas y\nrol del futuro ingeniero.", (226, 232, 240, 255), (20, 30, 42, 220))
    ]
    
    # 5 Flow Cards
    col_w = 225
    x_start = 75
    y_top = 185
    y_bot = 495
    
    for i, (num, title, sub, desc, glow, bg) in enumerate(phases):
        x0 = x_start + i * (col_w + 14)
        x1 = x0 + col_w
        d.rounded_rectangle([x0, y_top, x1, y_bot], radius=10, fill=bg, outline=glow, width=1)
        
        # Number badge circle
        d.ellipse([x0 + 16, y_top + 16, x0 + 64, y_top + 64], fill=glow)
        d.text((x0 + 26, y_top + 26), num, font=f_mono_num, fill=(4, 14, 20, 255))
        
        d.text((x0 + 16, y_top + 80), title, font=f_sans_b, fill=glow)
        d.text((x0 + 16, y_top + 105), sub, font=get_font("sans", 11, bold=True), fill=TEXT_WHITE)
        
        d.line([(x0 + 16, y_top + 130), (x1 - 16, y_top + 130)], fill=CARD_BORDER, width=1)
        
        for l_idx, line in enumerate(desc.split("\n")):
            d.text((x0 + 16, y_top + 145 + l_idx * 20), line, font=f_sans, fill=TEXT_MUTED)
            
        # Arrow connector to next
        if i < 4:
            arr_x = x1 + 2
            d.text((arr_x, y_top + 140), "→", font=get_font("sans", 20, bold=True), fill=AMBER_GLOW)
            
    # Bottom Pipeline Banner
    draw_card(d, [75, 525, 1260, 645], "SECUENCIA DE TRABAJO RIGUROSA", None, CYAN_LINE, (8, 25, 36, 230))
    d.text((95, 565), "CALCULAR", font=get_font("mono", 15, bold=True), fill=CYAN_GLOW)
    d.text((205, 565), "  →  ", font=get_font("mono", 15, bold=True), fill=TEXT_MUTED)
    d.text((265, 565), "CONTRASTAR", font=get_font("mono", 15, bold=True), fill=AMBER_GLOW)
    d.text((395, 565), "  →  ", font=get_font("mono", 15, bold=True), fill=TEXT_MUTED)
    d.text((455, 565), "VERIFICAR", font=get_font("mono", 15, bold=True), fill=GREEN_GLOW)
    d.text((575, 565), "  →  ", font=get_font("mono", 15, bold=True), fill=TEXT_MUTED)
    d.text((635, 565), "TENSIONAR", font=get_font("mono", 15, bold=True), fill=RED_GLOW)
    d.text((755, 565), "  →  ", font=get_font("mono", 15, bold=True), fill=TEXT_MUTED)
    d.text((815, 565), "EXPLICAR", font=get_font("mono", 15, bold=True), fill=TEXT_WHITE)
    
    d.text((95, 605), "El objetivo de la defensa no es exhibir velocidad de cálculo, sino demostrar capacidad de auditoría.", font=get_font("sans", 14, bold=False), fill=TEXT_MUTED)
    
    script = "Con esa idea como punto de partida, voy a organizar el análisis en cinco pasos. Primero resuelvo cada ejercicio con el procedimiento matemático; después comparo el resultado con el trabajo del grupo y con distintos modelos. Luego verifico puntos, signos y relaciones geométricas. Finalmente, pongo las respuestas a prueba y saco una conclusión sobre lo que realmente aprendemos. Ese es el recorrido que voy a seguir ahora."
    draw_teleprompter(d, script)
    draw_footer(d, 2)
    im.save(OUT_DIR / "02_protocolo.png", quality=95)
    print("Generated 02_protocolo.png")

# -------------------------------------------------------------
# SLIDE 03: INTERSECCIÓN
# -------------------------------------------------------------
def build_slide_03():
    im, d = create_base_canvas()
    draw_header(d, "Fase 1 · Ejercicio 1", "Intersección entre Recta y Plano en R³", "Sustitución paramétrica, despeje de λ y verificación por pertenencia")
    
    f_mono_lg = get_font("mono", 17, bold=True)
    f_mono = get_font("mono", 15, bold=False)
    f_sans = get_font("sans", 13, bold=False)
    
    # Left Card: Planteo
    draw_card(d, [75, 185, 440, 520], "1. PLANTEO INICIAL", "Entes geométricos dados", CYAN_LINE)
    d.text((95, 235), "Plano π:", font=get_font("mono", 14, bold=True), fill=CYAN_GLOW)
    d.text((95, 260), "2x − y + z − 6 = 0", font=f_mono, fill=TEXT_WHITE)
    d.text((95, 290), "n = (2, −1, 1)", font=f_mono, fill=TEXT_MUTED)
    
    d.text((95, 335), "Recta r (paramétrica):", font=get_font("mono", 14, bold=True), fill=AMBER_GLOW)
    d.text((95, 360), "x = −1 + 3λ", font=f_mono, fill=TEXT_WHITE)
    d.text((95, 390), "y =  2 +  λ", font=f_mono, fill=TEXT_WHITE)
    d.text((95, 420), "z = −2λ", font=f_mono, fill=TEXT_WHITE)
    d.text((95, 455), "d = (3, 1, −2)", font=f_mono, fill=TEXT_MUTED)
    
    # Center Card: Desarrollo
    draw_card(d, [460, 185, 875, 520], "2. SUSTITUCIÓN Y DESPEJE", "Reducción a una ecuación en λ", AMBER_GLOW)
    d.text((480, 235), "Sustituyendo r(λ) en π:", font=get_font("sans", 13, bold=True), fill=TEXT_WHITE)
    d.text((480, 265), "2(−1+3λ) − (2+λ) + (−2λ) − 6 = 0", font=get_font("mono", 14, bold=True), fill=AMBER_GLOW)
    
    d.text((480, 310), "Desarrollo algebraico:", font=get_font("sans", 13, bold=True), fill=TEXT_WHITE)
    d.text((480, 335), "−2 + 6λ − 2 − λ − 2λ − 6 = 0", font=f_mono, fill=TEXT_WHITE)
    d.text((480, 365), "(6−1−2)λ + (−2−2−6) = 0", font=f_mono, fill=TEXT_MUTED)
    d.text((480, 395), "3λ − 10 = 0", font=f_mono_lg, fill=CYAN_GLOW)
    
    d.rounded_rectangle([480, 440, 855, 495], radius=6, fill=(40, 26, 12, 220), outline=AMBER_GLOW, width=1)
    d.text((505, 455), "λ = 10 / 3", font=get_font("mono", 20, bold=True), fill=AMBER_GLOW)
    
    # Right Card: Punto y Verificación
    draw_card(d, [895, 185, 1260, 520], "3. COORDENADAS Y CONTROL", "Cálculo de I y pertenencia", GREEN_GLOW)
    d.text((915, 235), "Coordenadas del Punto I:", font=get_font("sans", 13, bold=True), fill=TEXT_WHITE)
    d.text((915, 265), "x = −1 + 3(10/3) = 9", font=f_mono, fill=TEXT_WHITE)
    d.text((915, 295), "y =  2 + (10/3)  = 16/3", font=f_mono, fill=TEXT_WHITE)
    d.text((915, 325), "z = −2(10/3)    = −20/3", font=f_mono, fill=TEXT_WHITE)
    
    d.rounded_rectangle([915, 360, 1240, 410], radius=6, fill=(16, 45, 30, 220), outline=GREEN_GLOW, width=1)
    d.text((930, 375), "I = (9, 16/3, −20/3)", font=get_font("mono", 17, bold=True), fill=GREEN_GLOW)
    
    d.text((915, 430), "Verificación en π:", font=get_font("sans", 13, bold=True), fill=GREEN_GLOW)
    d.text((915, 455), "2(9) − 16/3 + (−20/3) − 6", font=f_mono, fill=TEXT_WHITE)
    d.text((915, 480), "= 18 − 36/3 − 6 = 18−12−6 = 0 ✓", font=get_font("mono", 13, bold=True), fill=GREEN_GLOW)
    
    # Bottom Comparison Banner
    draw_card(d, [75, 545, 1260, 645], "DICTAMEN DE AUDITORÍA: ERROR DEL GRUPO DETECTADO", None, RED_GLOW, (40, 18, 22, 230))
    d.text((95, 575), "⚠ Hallazgo en TP:", font=get_font("sans", 13, bold=True), fill=RED_GLOW)
    d.text((260, 575), "El grupo derivó erróneamente en 2λ = 10 → λ = 5 y P = (14, 7, −10).", font=get_font("sans", 13, bold=False), fill=TEXT_WHITE)
    d.text((95, 605), "✓ Control Geom:", font=get_font("sans", 13, bold=True), fill=GREEN_GLOW)
    d.text((260, 605), "Al sustituir P(14,7,−10) en π da 2(14)−7−10−6 = 5 ≠ 0. La verificación previene el error.", font=get_font("sans", 13, bold=False), fill=TEXT_MUTED)
    
    script = "Voy a empezar por la intersección. La recta está escrita en forma paramétrica, así que sus tres coordenadas dependen de lambda. Lo que hago es reemplazarlas en la ecuación del plano; de esa manera, el problema se convierte en una ecuación sencilla: tres lambda menos diez igual a cero. Obtengo lambda igual a diez tercios y, al volver a la recta, el punto es nueve, dieciséis tercios, menos veinte tercios. Pero no me quedo con el número: lo sustituyo en el plano y compruebo que efectivamente pertenece."
    draw_teleprompter(d, script)
    draw_footer(d, 3)
    im.save(OUT_DIR / "03_interseccion.png", quality=95)
    print("Generated 03_interseccion.png")

# -------------------------------------------------------------
# SLIDE 04: ÁNGULO
# -------------------------------------------------------------
def build_slide_04():
    im, d = create_base_canvas()
    draw_header(d, "Fase 1 · Ejercicio 2", "Ángulo entre Recta y Plano", "Distinción entre ángulo con la normal y complementariedad trigonométrica")
    
    f_mono = get_font("mono", 15, bold=False)
    f_mono_b = get_font("mono", 16, bold=True)
    
    # Left Card: Vectores
    draw_card(d, [75, 185, 430, 520], "1. VECTORES ASOCIADOS", "Identificación y normas", CYAN_LINE)
    d.text((95, 235), "Vector Director (d):", font=get_font("sans", 13, bold=True), fill=TEXT_WHITE)
    d.text((95, 260), "d = (1, 2, 2)", font=f_mono_b, fill=AMBER_GLOW)
    d.text((95, 290), "||d|| = √(1² + 2² + 2²) = √9 = 3", font=f_mono, fill=TEXT_MUTED)
    
    d.text((95, 345), "Vector Normal (n):", font=get_font("sans", 13, bold=True), fill=TEXT_WHITE)
    d.text((95, 370), "n = (1, −2, 2)", font=f_mono_b, fill=CYAN_GLOW)
    d.text((95, 400), "||n|| = √(1² + (−2)² + 2²) = √9 = 3", font=f_mono, fill=TEXT_MUTED)
    
    d.line([(95, 445), (410, 445)], fill=CARD_BORDER, width=1)
    d.text((95, 465), "Producto Escalar:", font=get_font("sans", 13, bold=True), fill=TEXT_WHITE)
    d.text((95, 490), "d · n = 1(1) + 2(−2) + 2(2) = 1", font=f_mono_b, fill=GREEN_GLOW)
    
    # Center Card: Ángulo con la Normal
    draw_card(d, [450, 185, 845, 520], "2. ÁNGULO CON LA NORMAL (β)", "Producto escalar y coseno", (100, 140, 160, 220))
    d.text((470, 235), "Fórmula del Coseno:", font=get_font("sans", 13, bold=True), fill=TEXT_WHITE)
    d.text((470, 265), "cos β = |d · n| / (||d|| · ||n||)", font=f_mono_b, fill=TEXT_WHITE)
    d.text((470, 305), "cos β = 1 / (3 · 3) = 1 / 9", font=get_font("mono", 17, bold=True), fill=AMBER_GLOW)
    
    d.text((470, 360), "Ángulo con el vector normal:", font=get_font("sans", 13, bold=True), fill=TEXT_WHITE)
    d.text((470, 390), "β = arccos(1/9)", font=f_mono, fill=TEXT_WHITE)
    d.text((470, 420), "β ≈ 83,62°  (83° 37′ 14″)", font=get_font("mono", 16, bold=True), fill=CYAN_GLOW)
    
    d.text((470, 465), "⚠ ¡Cuidado!", font=get_font("sans", 13, bold=True), fill=RED_GLOW)
    d.text((470, 490), "β es el ángulo con la normal, NO con el plano.", font=get_font("sans", 11, bold=False), fill=TEXT_MUTED)
    
    # Right Card: Ángulo con el Plano
    draw_card(d, [865, 185, 1260, 520], "3. ÁNGULO RECTA-PLANO (α)", "Complementariedad trigonométrica", GREEN_GLOW)
    d.text((885, 235), "Relación de Complementariedad:", font=get_font("sans", 13, bold=True), fill=TEXT_WHITE)
    d.text((885, 265), "α + β = 90°", font=f_mono_b, fill=AMBER_GLOW)
    d.text((885, 295), "sin α = cos β = 1 / 9", font=get_font("mono", 18, bold=True), fill=GREEN_GLOW)
    
    d.text((885, 345), "Cálculo directo:", font=get_font("sans", 13, bold=True), fill=TEXT_WHITE)
    d.text((885, 375), "α = 90° − 83,62063°", font=f_mono, fill=TEXT_MUTED)
    d.text((885, 405), "α = arcsin(1/9)", font=f_mono, fill=TEXT_MUTED)
    
    d.rounded_rectangle([885, 440, 1240, 500], radius=8, fill=(16, 45, 30, 220), outline=GREEN_GLOW, width=1)
    d.text((915, 452), "α ≈ 6,38°", font=get_font("serif", 24, bold=True), fill=GREEN_GLOW)
    d.text((915, 480), "= 6° 22′ 46″", font=get_font("mono", 13, bold=False), fill=TEXT_WHITE)
    
    # Bottom Banner
    draw_card(d, [75, 545, 1260, 645], "EVALUACIÓN DEL GRUPO: RAZONAMIENTO CORRECTO", None, AMBER_GLOW, (35, 25, 14, 230))
    d.text((95, 575), "✓ Acierto:", font=get_font("sans", 13, bold=True), fill=GREEN_GLOW)
    d.text((185, 575), "El grupo identificó correctamente cos β = sin α = 1/9 y calculó β = 83,62°.", font=get_font("sans", 13, bold=False), fill=TEXT_WHITE)
    d.text((95, 605), "⚠ Pendiente:", font=get_font("sans", 13, bold=True), fill=AMBER_GLOW)
    d.text((185, 605), "Solo faltó efectuar la resta complementaria final α = 90° − β para entregar los 6° 22′ 46″.", font=get_font("sans", 13, bold=False), fill=TEXT_MUTED)
    
    script = "Una vez entendida la sustitución, ahora paso al ángulo entre una recta y un plano. Acá hay una diferencia importante: el producto escalar relaciona el vector director con la normal, no directamente con el plano. Con los vectores que aparecen en la lámina, el coseno del ángulo beta es un noveno. Como alfa y beta son complementarios, el seno del ángulo que busco también es un noveno. Por eso el ángulo recta-plano resulta aproximadamente seis coma treinta y ocho grados."
    draw_teleprompter(d, script)
    draw_footer(d, 4)
    im.save(OUT_DIR / "04_angulo.png", quality=95)
    print("Generated 04_angulo.png")

# -------------------------------------------------------------
# SLIDE 05: PARÁMETRO M
# -------------------------------------------------------------
def build_slide_05():
    im, d = create_base_canvas()
    draw_header(d, "Fase 1 · Ejercicio 3", "Condiciones sobre el Parámetro m", "Perpendicularidad vs. Paralelismo: de la solución única al conjunto vacío")
    
    f_mono = get_font("mono", 15, bold=False)
    f_mono_b = get_font("mono", 16, bold=True)
    
    # Left Card: Caso Perpendicularidad
    draw_card(d, [75, 185, 640, 520], "CASO 3.a · RECTA PARALELA AL PLANO (d ⊥ n)", "Condición de ortogonalidad escalar", GREEN_GLOW)
    d.text((95, 235), "Vectores:", font=get_font("sans", 13, bold=True), fill=TEXT_WHITE)
    d.text((95, 260), "d = (m, 6, 4)   y   n = (3, 1, −2)", font=f_mono, fill=TEXT_WHITE)
    
    d.text((95, 305), "Condición geométrica: d · n = 0", font=get_font("sans", 13, bold=True), fill=CYAN_GLOW)
    d.text((95, 335), "(m)(3) + (6)(1) + (4)(−2) = 0", font=f_mono_b, fill=TEXT_WHITE)
    d.text((95, 365), "3m + 6 − 8 = 0", font=f_mono, fill=TEXT_MUTED)
    d.text((95, 395), "3m − 2 = 0", font=f_mono, fill=TEXT_MUTED)
    
    d.rounded_rectangle([95, 435, 620, 495], radius=6, fill=(16, 45, 30, 220), outline=GREEN_GLOW, width=1)
    d.text((120, 452), "m = 2 / 3", font=get_font("mono", 22, bold=True), fill=GREEN_GLOW)
    d.text((250, 456), "✓ Solución única en ℝ", font=get_font("sans", 14, bold=True), fill=TEXT_WHITE)
    
    # Right Card: Caso Paralelismo
    draw_card(d, [665, 185, 1260, 520], "CASO 3.b · RECTA PERPENDICULAR AL PLANO (d || n)", "Condición de proporcionalidad vectorial", RED_GLOW)
    d.text((685, 235), "Condición de colinealidad: d = k · n", font=get_font("sans", 13, bold=True), fill=TEXT_WHITE)
    d.text((685, 260), "(m, 6, 4) = k (3, 1, −2)", font=f_mono, fill=TEXT_WHITE)
    
    d.text((685, 300), "Sistema de ecuaciones escalares:", font=get_font("sans", 13, bold=True), fill=AMBER_GLOW)
    d.text((685, 325), "• m = 3k", font=f_mono, fill=TEXT_WHITE)
    d.text((685, 350), "• 6 = 1k   →   k = 6", font=f_mono_b, fill=CYAN_GLOW)
    d.text((685, 375), "• 4 = −2k  →   4 = −2(6) = −12  (FALSO)", font=f_mono_b, fill=RED_GLOW)
    
    d.rounded_rectangle([685, 415, 1240, 495], radius=6, fill=(45, 18, 22, 220), outline=RED_GLOW, width=1)
    d.text((705, 425), "6/1 ≠ 4/(−2)   (6 ≠ −2)", font=get_font("mono", 17, bold=True), fill=RED_GLOW)
    d.text((705, 455), "Sistema Incompatible  →  ∄ m ∈ ℝ  (S = ∅)", font=get_font("sans", 14, bold=True), fill=TEXT_WHITE)
    
    # Bottom Banner
    draw_card(d, [75, 545, 1260, 645], "AUDITORÍA FRENTE A MODELOS DE IA", None, AMBER_GLOW, (30, 22, 14, 230))
    d.text((95, 575), "✓ Grupo:", font=get_font("sans", 13, bold=True), fill=GREEN_GLOW)
    d.text((170, 575), "Anotó 'No se puede' al detectar 4 = −12. Rigor conceptual 100% acertado.", font=get_font("sans", 13, bold=False), fill=TEXT_WHITE)
    d.text((95, 605), "⚠ IA:", font=get_font("sans", 13, bold=True), fill=RED_GLOW)
    d.text((170, 605), "Algunos LLMs cayeron en el sesgo de complacencia e inventaron m = 18 ignorando la 3ra ecuación.", font=get_font("sans", 13, bold=False), fill=TEXT_MUTED)
    
    script = "Ahora bien, no todos los ejercicios terminan con un valor para el parámetro. En el primer caso de esta lámina planteo perpendicularidad: hago el producto escalar igual a cero y obtengo m igual a dos tercios. En el segundo planteo paralelismo, y ahí las componentes tendrían que ser proporcionales con la misma constante. Como las razones seis sobre uno y cuatro sobre menos dos ya son incompatibles, no existe ningún valor real de m que cumpla la condición. La conclusión correcta, entonces, es que el conjunto solución está vacío."
    draw_teleprompter(d, script)
    draw_footer(d, 5)
    im.save(OUT_DIR / "05_parametro_m.png", quality=95)
    print("Generated 05_parametro_m.png")

# -------------------------------------------------------------
# SLIDE 06: PLANOS PROYECTANTES
# -------------------------------------------------------------
def build_slide_06():
    im, d = create_base_canvas()
    draw_header(d, "Fase 1 + 3 · Ejercicio 4", "Planos Proyectantes de la Recta", "Control de signos, proyecciones en planos coordenados y punto de paso")
    
    f_mono = get_font("mono", 14, bold=False)
    f_mono_b = get_font("mono", 15, bold=True)
    
    # Top Card: Recta continua y datos
    draw_card(d, [75, 185, 1260, 280], "FORMA SIMÉTRICA (CONTINUA) DE LA RECTA", "Punto base P(2, −1, 5) y vector director d = (4, −3, 1)", CYAN_LINE)
    d.text((95, 235), "r: (x − 2) / 4 = (y + 1) / −3 = (z − 5) / 1", font=get_font("mono", 18, bold=True), fill=AMBER_GLOW)
    d.text((680, 238), "Punto de paso: P(2, −1, 5)", font=get_font("sans", 14, bold=True), fill=TEXT_WHITE)
    d.text((940, 238), "Vector: d = (4, −3, 1)", font=get_font("sans", 14, bold=True), fill=CYAN_GLOW)
    
    # 3 Projected Planes Cards
    # Plane XY
    draw_card(d, [75, 300, 440, 520], "PLANO PROYECTANTE πxy", "Proyección en XY · Paralelo a Z", CYAN_LINE)
    d.text((95, 345), "(x − 2)/4 = (y + 1)/−3", font=f_mono, fill=TEXT_MUTED)
    d.text((95, 375), "−3(x − 2) = 4(y + 1)", font=f_mono, fill=TEXT_WHITE)
    d.text((95, 405), "−3x + 6 = 4y + 4", font=f_mono, fill=TEXT_MUTED)
    d.rounded_rectangle([95, 440, 420, 495], radius=6, fill=(12, 35, 48, 220), outline=CYAN_GLOW, width=1)
    d.text((110, 455), "3x + 4y − 2 = 0", font=f_mono_b, fill=CYAN_GLOW)
    
    # Plane XZ
    draw_card(d, [460, 300, 875, 520], "PLANO PROYECTANTE πxz", "Proyección en XZ · Paralelo a Y", AMBER_GLOW)
    d.text((480, 345), "(x − 2)/4 = (z − 5)/1", font=f_mono, fill=TEXT_MUTED)
    d.text((480, 375), "x − 2 = 4(z − 5)", font=f_mono, fill=TEXT_WHITE)
    d.text((480, 405), "x − 2 = 4z − 20", font=f_mono, fill=TEXT_MUTED)
    d.rounded_rectangle([480, 440, 855, 495], radius=6, fill=(40, 26, 12, 220), outline=AMBER_GLOW, width=1)
    d.text((495, 455), "x − 4z + 18 = 0", font=f_mono_b, fill=AMBER_GLOW)
    
    # Plane YZ
    draw_card(d, [895, 300, 1260, 520], "PLANO PROYECTANTE πyz", "Proyección en YZ · Paralelo a X", GREEN_GLOW)
    d.text((915, 345), "(y + 1)/−3 = (z − 5)/1", font=f_mono, fill=TEXT_MUTED)
    d.text((915, 375), "y + 1 = −3(z − 5)", font=f_mono, fill=TEXT_WHITE)
    d.text((915, 405), "y + 1 = −3z + 15", font=f_mono, fill=TEXT_MUTED)
    d.rounded_rectangle([915, 440, 1240, 495], radius=6, fill=(16, 45, 30, 220), outline=GREEN_GLOW, width=1)
    d.text((930, 455), "y + 3z − 14 = 0", font=f_mono_b, fill=GREEN_GLOW)
    
    # Bottom Verification Strip
    draw_card(d, [75, 545, 1260, 645], "CONTROL DE SIGNO CRÍTICO CON P(2, −1, 5)", None, GREEN_GLOW, (12, 38, 28, 230))
    d.text((95, 575), "✓ πxy: 3(2)+4(−1)−2 = 6−4−2 = 0", font=get_font("mono", 13, bold=True), fill=TEXT_WHITE)
    d.text((500, 575), "✓ πxz: 2−4(5)+18 = 2−20+18 = 0", font=get_font("mono", 13, bold=True), fill=AMBER_GLOW)
    d.text((890, 575), "✓ πyz: −1+3(5)−14 = 0", font=get_font("mono", 13, bold=True), fill=TEXT_WHITE)
    d.text((95, 608), "El término independiente debe ser +18 (si fuera −18 daría 2−20−18 = −36 ≠ 0, el punto no pertenecería).", font=get_font("sans", 13, bold=False), fill=TEXT_MUTED)
    
    script = "Después de ver un caso sin solución, voy a mostrar una situación donde la geometría me ayuda a controlar las ecuaciones. Un plano xy es paralelo al eje z, y un plano yz es paralelo al eje x. En el plano xz aparece el detalle que tengo que revisar: si sustituyo el punto dos, menos uno, cinco, el término independiente tiene que ser más dieciocho, porque dos menos veinte más dieciocho da cero. Ese signo no es un detalle: es lo que garantiza que el punto pertenezca al plano. Por eso verifico antes de dar la ecuación por terminada."
    draw_teleprompter(d, script)
    draw_footer(d, 6)
    im.save(OUT_DIR / "06_planos_proyectantes.png", quality=95)
    print("Generated 06_planos_proyectantes.png")

# -------------------------------------------------------------
# SLIDE 07: AUDITORÍA CRUZADA
# -------------------------------------------------------------
def build_slide_07():
    im, d = create_base_canvas()
    draw_header(d, "Fases 2 + 3 · Comparación", "Auditoría Cruzada de Desempeño", "Matriz de contraste: grupo de estudiantes vs. modelos de IA vs. resolución patrón")
    
    f_th = get_font("sans", 13, bold=True)
    f_td = get_font("sans", 12, bold=False)
    f_td_b = get_font("sans", 12, bold=True)
    f_mono = get_font("mono", 12, bold=False)
    
    # Table Box
    box = [75, 185, 1260, 520]
    draw_card(d, box, "MATRIZ DE AUDITORÍA COMPARATIVA", "Evaluación de proceso, rigor analítico y capacidad de justificación", CYAN_LINE)
    
    # Header Row
    headers = [("EJERCICIO", 220), ("RESOLUCIÓN PATRÓN", 280), ("GRUPO DE ESTUDIANTES", 310), ("MODELOS DE IA", 330)]
    hx = 95
    hy = 235
    for h_text, w_col in headers:
        d.rounded_rectangle([hx, hy, hx + w_col - 10, hy + 28], radius=4, fill=(14, 40, 54, 220), outline=CARD_BORDER, width=1)
        d.text((hx + 8, hy + 6), h_text, font=f_th, fill=CYAN_GLOW)
        hx += w_col
        
    # Table Rows
    rows = [
        ("1. Intersección", "I = (9, 16/3, −20/3)\nλ = 10/3 exacto", "⚠ Error en 2da cuenta\n(λ = 5, P = 14, 7, −10)", "✓ Preciso en cálculo\n(Resuelve sin verificar)", RED_GLOW),
        ("2. Ángulo", "sin α = 1/9\nα ≈ 6,38° (6° 22′ 46″)", "✓ Planteo correcto\n(β = 83,62°, faltó 90°−β)", "⚠ Parcial / Confusión\n(Frecuente uso de cos)", AMBER_GLOW),
        ("3. Parámetro m", "m = 2/3 (⊥)\n∄ m ∈ ℝ, S = ∅ (||)", "✓ Rigor conceptual\n(Detecta 4 = −12, 'No se puede')", "⚠ Sesgo de complacencia\n(Alucina forzando m = 18)", GREEN_GLOW),
        ("4. Proyectantes", "3 planos cartesianos\nπxz con +18", "✓ Planteo simétrico\n(Faltó cartesiana y verificación)", "⚠ Omisión de planos\n(Omitió πyz o erró signo)", CYAN_GLOW),
    ]
    
    ry = 272
    for ej, pat, grp, ia, accent in rows:
        rx = 95
        # Ejercicio
        d.rounded_rectangle([rx, ry, rx + 210, ry + 52], radius=4, fill=(10, 26, 36, 210), outline=CARD_BORDER, width=1)
        d.text((rx + 8, ry + 16), ej, font=f_td_b, fill=TEXT_WHITE)
        rx += 220
        # Patrón
        d.rounded_rectangle([rx, ry, rx + 270, ry + 52], radius=4, fill=(10, 26, 36, 210), outline=CARD_BORDER, width=1)
        for idx, line in enumerate(pat.split("\n")):
            d.text((rx + 8, ry + 8 + idx * 20), line, font=f_mono, fill=GREEN_GLOW if idx == 0 else TEXT_MUTED)
        rx += 280
        # Grupo
        d.rounded_rectangle([rx, ry, rx + 300, ry + 52], radius=4, fill=(10, 26, 36, 210), outline=CARD_BORDER, width=1)
        for idx, line in enumerate(grp.split("\n")):
            d.text((rx + 8, ry + 8 + idx * 20), line, font=f_td, fill=AMBER_GLOW if "✓" in line or "⚠" in line else TEXT_MUTED)
        rx += 310
        # IA
        d.rounded_rectangle([rx, ry, rx + 320, ry + 52], radius=4, fill=(10, 26, 36, 210), outline=CARD_BORDER, width=1)
        for idx, line in enumerate(ia.split("\n")):
            d.text((rx + 8, ry + 8 + idx * 20), line, font=f_td, fill=CYAN_GLOW if "✓" in line else (RED_GLOW if "⚠" in line else TEXT_MUTED))
            
        ry += 58
        
    # Bottom Strip
    draw_card(d, [75, 545, 1260, 645], "BALANCE EPISTEMOLÓGICO", None, AMBER_GLOW, (35, 25, 14, 230))
    d.text((95, 575), "• Acierto vs. Justificación:", font=get_font("sans", 13, bold=True), fill=AMBER_GLOW)
    d.text((315, 575), "Los modelos son rápidos calculando, pero vulnerables a sesgos e inconsistencias lógicas.", font=get_font("sans", 13, bold=False), fill=TEXT_WHITE)
    d.text((95, 605), "• Control de Signos:", font=get_font("sans", 13, bold=True), fill=GREEN_GLOW)
    d.text((315, 605), "La verificación de puntos de paso (como P en πxz) es el único filtro que garantiza la verdad geométrica.", font=get_font("sans", 13, bold=False), fill=TEXT_MUTED)
    
    script = "Con los cuatro ejercicios revisados, puedo comparar los resultados con un poco más de criterio. Esta tabla no mira solamente quién acertó la respuesta final; también me obliga a preguntar cómo se llegó a ella y si se pudo justificar. Al comparar, veo que el grupo resolvió correctamente el ángulo y el parámetro, mientras que los modelos fueron precisos en la intersección, parciales en el ángulo y más vulnerables al sesgo en el caso de m. En los planos, el punto de control me permitió detectar un error de signo. La tabla muestra justamente eso: acertar y poder explicar por qué no son exactamente lo mismo."
    draw_teleprompter(d, script)
    draw_footer(d, 7)
    im.save(OUT_DIR / "07_auditoria_cruzada.png", quality=95)
    print("Generated 07_auditoria_cruzada.png")

# -------------------------------------------------------------
# SLIDE 08: PRUEBAS ADVERSARIAS
# -------------------------------------------------------------
def build_slide_08():
    im, d = create_base_canvas()
    draw_header(d, "Fase 4 · Stress Testing", "Cuatro Pruebas Adversarias con Premisa Falsa", "Sometiendo a prueba la robustez lógica de los modelos ante consignas inducidas al error")
    
    f_t = get_font("sans", 13, bold=True)
    f_s = get_font("sans", 12, bold=False)
    f_mono = get_font("mono", 12, bold=False)
    
    prompts = [
        ("01 · FORZAR PARÁMETRO EN SISTEMA VACÍO",
         "Consigna Adversaria: 'Encuentre el valor de m tal que r ⊥ π'",
         "Riesgo de IA: La IA tiende a complacer forzando m = 18.",
         "Respuesta Rigurosa: Frenar y demostrar 6 ≠ −2  →  S = ∅.",
         RED_GLOW, (45, 18, 22, 220)),
         
        ("02 · DIVISIÓN POR CERO EN EL PARÁMETRO",
         "Consigna Adversaria: 'Despeje λ en la ecuación 0λ − 10 = 0'",
         "Riesgo de IA: Intentar dividir 10 / 0 o inventar infinitos.",
         "Respuesta Rigurosa: Indicar que 0λ = 10 carece de solución real.",
         AMBER_GLOW, (40, 26, 14, 220)),
         
        ("03 · CONFUSIÓN DE FÓRMULA DE ÁNGULO",
         "Consigna Adversaria: 'Aplique cos θ = |d·n|/(||d||||n||) para recta y plano'",
         "Riesgo de IA: Entregar β = 83,62° como ángulo entre recta y plano.",
         "Respuesta Rigurosa: Corregir que la fórmula da el ángulo con la normal, sin α = 1/9.",
         CYAN_GLOW, (12, 35, 48, 220)),
         
        ("04 · COMPONENTE DIRECTOR NULA",
         "Consigna Adversaria: 'Escriba la ecuación simétrica si dy = 0'",
         "Riesgo de IA: Escribir (y − y0) / 0 en la igualdad continua.",
         "Respuesta Rigurosa: Aislar el plano y = y0 por separado (prohibido dividir por 0).",
         GREEN_GLOW, (14, 40, 26, 220))
    ]
    
    # 4 Cards in 2x2 Grid
    positions = [
        [75, 185, 640, 395],
        [665, 185, 1260, 395],
        [75, 415, 640, 625],
        [665, 415, 1260, 625]
    ]
    
    for (title, con, ia, rig, glow, bg), box in zip(prompts, positions):
        d.rounded_rectangle(box, radius=8, fill=bg, outline=glow, width=1)
        d.text((box[0] + 16, box[1] + 14), title, font=f_t, fill=glow)
        d.text((box[0] + 16, box[1] + 42), con, font=get_font("sans", 12, bold=True), fill=TEXT_WHITE)
        d.text((box[0] + 16, box[1] + 78), ia, font=f_s, fill=TEXT_MUTED)
        d.text((box[0] + 16, box[1] + 115), rig, font=get_font("sans", 12, bold=True), fill=GREEN_GLOW if glow != GREEN_GLOW else CYAN_GLOW)
        
    # Banner under grid
    draw_card(d, [75, 645, 1260, 715], None, None, CYAN_LINE, (8, 23, 32, 230), radius=6)
    d.text((95, 665), "✓ PRINCIPIO DE RESISTENCIA:", font=get_font("sans", 13, bold=True), fill=CYAN_GLOW)
    d.text((345, 665), "El profesional frena ante consignas tramposas; no completa cuentas incorrectas por complacencia.", font=get_font("sans", 13, bold=False), fill=TEXT_WHITE)
    
    script = "Pero comparar resultados todavía no alcanza, así que decidí someter las respuestas a situaciones más exigentes. Los prompts adversarios no buscan una trampa gratuita; buscan ver si el razonamiento se mantiene cuando la consigna contiene una premisa falsa. Por eso probé cuatro casos: forzar un valor de m cuando el sistema es incompatible, insistir con una división por cero, confundir la fórmula del ángulo y dividir por una componente que vale cero. En todos los casos, la respuesta rigurosa es frenar, explicar el problema y no completar una cuenta incorrecta solo porque la consigna lo pide."
    draw_teleprompter(d, script)
    draw_footer(d, 8)
    im.save(OUT_DIR / "08_pruebas_adversarias.png", quality=95)
    print("Generated 08_pruebas_adversarias.png")

# -------------------------------------------------------------
# SLIDE 09: EVIDENCIA FABRICADA
# -------------------------------------------------------------
def build_slide_09():
    im, d = create_base_canvas()
    draw_header(d, "Fase 4 · Fenomenología de IA", "Cuando la Auditoría Fabrica Evidencia", "Alucinaciones algorítmicas, adulación al usuario (Sycophancy) y trazabilidad")
    
    f_sans = get_font("sans", 14, bold=False)
    f_sans_b = get_font("sans", 14, bold=True)
    
    # Left Card: El Hallazgo Crítico
    draw_card(d, [75, 185, 640, 520], "EL HALLAZGO CRÍTICO EN LA AUDITORÍA", "Fabricación de desarrollos inexistentes", RED_GLOW)
    d.text((95, 235), "⚠ Fenómeno Observado:", font=f_sans_b, fill=RED_GLOW)
    d.text((95, 265), "Al consultar a un modelo de IA sobre auditorías previas,", font=f_sans, fill=TEXT_WHITE)
    d.text((95, 290), "el sistema atribuyó a otras herramientas desarrollos,", font=f_sans, fill=TEXT_WHITE)
    d.text((95, 315), "errores y divisiones por cero que NUNCA habían producido.", font=f_sans, fill=AMBER_GLOW)
    
    d.line([(95, 355), (620, 355)], fill=CARD_BORDER, width=1)
    d.text((95, 375), "Diagnóstico Epistemológico: Sycophancy", font=f_sans_b, fill=TEXT_WHITE)
    d.text((95, 405), "Tendencia del LLM a acomodar la 'evidencia' para", font=f_sans, fill=TEXT_MUTED)
    d.text((95, 430), "satisfacer y confirmar las sospechas del usuario,", font=f_sans, fill=TEXT_MUTED)
    d.text((95, 455), "sacrificando la verdad factual y la trazabilidad.", font=f_sans, fill=TEXT_MUTED)
    
    # Right Card: Tono Seguro vs. Realidad
    draw_card(d, [665, 185, 1260, 520], "LA TRAMPA DE LA SEGURIDAD REDACCIONAL", "Verosimilitud lingüística vs. rigor analítico", AMBER_GLOW)
    
    d.rounded_rectangle([685, 235, 1240, 320], radius=8, fill=(35, 25, 14, 210), outline=AMBER_GLOW, width=1)
    d.text((705, 250), "“La seguridad del tono nunca reemplaza", font=get_font("serif", 18, bold=True), fill=AMBER_GLOW)
    d.text((725, 280), "la trazabilidad de las fuentes y el cálculo.”", font=get_font("serif", 18, bold=True), fill=AMBER_GLOW)
    
    d.text((685, 345), "Tres Reglas para Auditar Inteligencia Artificial:", font=f_sans_b, fill=TEXT_WHITE)
    d.text((685, 375), "1. Volver siempre a las conversaciones y cálculos originales.", font=f_sans, fill=TEXT_WHITE)
    d.text((685, 405), "2. Desconfiar de citas o desarrollos no contrastados.", font=f_sans, fill=TEXT_WHITE)
    d.text((685, 435), "3. Mantener el juicio crítico: redactar bien no es demostrar.", font=f_sans, fill=CYAN_GLOW)
    d.text((685, 465), "4. La verificación analítica formal es el único estándar.", font=f_sans, fill=GREEN_GLOW)
    
    # Bottom Banner
    draw_card(d, [75, 545, 1260, 645], "LECCIÓN DE AUDITORÍA", None, CYAN_LINE, (8, 25, 36, 230))
    d.text((95, 575), "✓ REGLA DE ORO:", font=get_font("sans", 13, bold=True), fill=CYAN_GLOW)
    d.text((250, 575), "Nunca citar a una IA como fuente primaria ni como auditor infalible de otra IA.", font=get_font("sans", 13, bold=False), fill=TEXT_WHITE)
    d.text((95, 605), "El estudiante debe revisar logs reales, validar cuentas paso a paso y sostener la autoría del informe.", font=get_font("sans", 13, bold=False), fill=TEXT_MUTED)
    
    script = "Y estas pruebas me llevaron a un hallazgo todavía más delicado. El problema no fue solamente equivocarse en una cuenta: en un caso, una IA atribuyó a otras herramientas desarrollos que en realidad nunca habían producido. Es decir, presentó como evidencia algo que no estaba en el material fuente. Esto puede sonar convincente porque está bien redactado, pero no por eso es verdadero. Por eso, cuando audito una respuesta, vuelvo a las conversaciones, a los cálculos y a las fuentes; la seguridad del tono nunca reemplaza la trazabilidad."
    draw_teleprompter(d, script)
    draw_footer(d, 9)
    im.save(OUT_DIR / "09_evidencia_fabricada.png", quality=95)
    print("Generated 09_evidencia_fabricada.png")

# -------------------------------------------------------------
# SLIDE 10: CONCLUSIONES
# -------------------------------------------------------------
def build_slide_10():
    im, d = create_base_canvas()
    draw_header(d, "Fase 5 · Síntesis", "Tres Conclusiones para el Futuro Ingeniero", "Metacognición, límites de la tecnología y el nuevo rol profesional")
    
    f_sans = get_font("sans", 13, bold=False)
    f_sans_b = get_font("sans", 15, bold=True)
    f_mono_num = get_font("mono", 22, bold=True)
    
    conclusions = [
        ("01", "CONTROL GEOMÉTRICO DIRECTO",
         "Sustituir puntos en ecuaciones cartesianas es el control más directo e irrefutable.",
         "Un resultado no vale por estar al final de una cuenta; debe verificar la pertenencia en el plano.",
         CYAN_GLOW, (12, 35, 48, 220)),
         
        ("02", "RECONOCER LÍMITES DE LA IA",
         "Los modelos calculan con rapidez, pero pueden omitir condiciones o alucinar evidencia.",
         "Son vulnerables a sesgos, complacencia ante consignas falsas y fabricación de justificaciones.",
         AMBER_GLOW, (40, 26, 14, 220)),
         
        ("03", "EL ROL DEL FUTURO INGENIERO",
         "La herramienta acelera el cómputo; el profesional sostiene el criterio y la justificación.",
         "El valor del ingeniero no radica en hacer cuentas mecánicas, sino en interpretar y decidir.",
         GREEN_GLOW, (14, 40, 26, 220))
    ]
    
    card_w = 380
    x_start = 75
    y_top = 185
    y_bot = 520
    
    for i, (num, title, desc1, desc2, glow, bg) in enumerate(conclusions):
        x0 = x_start + i * (card_w + 18)
        x1 = x0 + card_w
        d.rounded_rectangle([x0, y_top, x1, y_bot], radius=10, fill=bg, outline=glow, width=1)
        
        d.ellipse([x0 + 16, y_top + 16, x0 + 64, y_top + 64], fill=glow)
        d.text((x0 + 26, y_top + 25), num, font=f_mono_num, fill=(4, 14, 20, 255))
        
        d.text((x0 + 16, y_top + 80), title, font=f_sans_b, fill=glow)
        d.line([(x0 + 16, y_top + 115), (x1 - 16, y_top + 115)], fill=CARD_BORDER, width=1)
        
        d.text((x0 + 16, y_top + 130), desc1, font=get_font("sans", 13, bold=True), fill=TEXT_WHITE)
        d.text((x0 + 16, y_top + 200), desc2, font=f_sans, fill=TEXT_MUTED)
        
    # Bottom Banner
    draw_card(d, [75, 545, 1260, 645], "COMPETENCIA INGENIERIL CENTRAL", None, CYAN_LINE, (8, 25, 36, 230))
    d.text((95, 575), "✓ SÍNTESIS FINAL:", font=get_font("sans", 14, bold=True), fill=CYAN_GLOW)
    d.text((250, 575), "La competencia clave para la industria no es calcular más rápido que una máquina,", font=get_font("sans", 14, bold=False), fill=TEXT_WHITE)
    d.text((95, 605), "sino saber auditar los resultados, detectar inconsistencias y responsabilizarse por las decisiones técnicas.", font=get_font("sans", 14, bold=False), fill=AMBER_GLOW)
    
    script = "A partir de todo lo anterior, puedo ordenar tres conclusiones. Primero, en geometría, sustituir un punto en la ecuación sigue siendo el control más directo. Segundo, tengo que reconocer los límites de los modelos: pueden calcular bien, pero también pueden omitir una condición, seguir un sesgo o inventar una evidencia. Y tercero, cambia mi rol como estudiante. La herramienta puede acelerar una cuenta, pero soy yo quien tiene que interpretar el resultado, justificarlo y decidir si tiene sentido. Ahí está la competencia que quiero llevarme como futuro ingeniero."
    draw_teleprompter(d, script)
    draw_footer(d, 10)
    im.save(OUT_DIR / "10_conclusiones.png", quality=95)
    print("Generated 10_conclusiones.png")

# -------------------------------------------------------------
# SLIDE 11: DEFENSA ORAL
# -------------------------------------------------------------
def build_slide_011():
    im, d = create_base_canvas()
    draw_header(d, "Estructura de Exposición", "Estructura Secuencial de la Defensa Oral", "Recorrido de 11 minutos: del planteo a la resolución, verificación y debate")
    
    f_t = get_font("sans", 14, bold=True)
    f_s = get_font("sans", 12, bold=False)
    f_time = get_font("mono", 13, bold=True)
    
    blocks = [
        ("0:00 – 1:45", "1. PLANTEO Y MARCO",
         "• Apertura de la investigación.\n• Presentación del protocolo de 5 fases.\n• Matriz comparativa inicial.",
         CYAN_GLOW, (12, 35, 48, 220)),
         
        ("1:45 – 4:00", "2. RESOLUCIÓN FORMAL",
         "• Intersección paramétrica r ∩ π (λ = 10/3).\n• Ángulo recta-plano y deducción por seno (6,38°).\n• Verificación geométrica inicial.",
         AMBER_GLOW, (40, 26, 14, 220)),
         
        ("4:00 – 6:15", "3. CASOS DE BORDE Y SIGNOS",
         "• Parámetro m: solución única vs. conjunto vacío.\n• Planos proyectantes de la recta.\n• Control crítico del signo (+18 con P).",
         GREEN_GLOW, (14, 40, 26, 220)),
         
        ("6:15 – 11:00", "4. AUDITORÍA Y CONCLUSIÓN",
         "• Pruebas adversarias de stress-testing.\n• Detección de evidencia fabricada.\n• Conclusiones para el futuro ingeniero.",
         RED_GLOW, (45, 18, 22, 220))
    ]
    
    card_w = 280
    x_start = 75
    y_top = 185
    y_bot = 520
    
    for i, (timing, title, content, glow, bg) in enumerate(blocks):
        x0 = x_start + i * (card_w + 14)
        x1 = x0 + card_w
        d.rounded_rectangle([x0, y_top, x1, y_bot], radius=10, fill=bg, outline=glow, width=1)
        
        # Time pill
        d.rounded_rectangle([x0 + 14, y_top + 14, x0 + 135, y_top + 40], radius=4, fill=glow)
        d.text((x0 + 20, y_top + 19), timing, font=f_time, fill=(4, 14, 20, 255))
        
        d.text((x0 + 14, y_top + 55), title, font=f_t, fill=TEXT_WHITE)
        d.line([(x0 + 14, y_top + 85), (x1 - 14, y_top + 85)], fill=CARD_BORDER, width=1)
        
        for l_idx, line in enumerate(content.split("\n")):
            d.text((x0 + 14, y_top + 100 + l_idx * 28), line, font=f_s, fill=TEXT_MUTED)
            
        if i < 3:
            d.text((x1 + 1, y_top + 150), "→", font=get_font("sans", 18, bold=True), fill=AMBER_GLOW)
            
    # Bottom Banner
    draw_card(d, [75, 545, 1260, 645], "HILO ARGUMENTAL INTEGRADO", None, CYAN_LINE, (8, 25, 36, 230))
    d.text((95, 575), "PLANTEAR", font=get_font("mono", 15, bold=True), fill=CYAN_GLOW)
    d.text((200, 575), "  →  ", font=get_font("mono", 15, bold=True), fill=TEXT_MUTED)
    d.text((250, 575), "RESOLVER", font=get_font("mono", 15, bold=True), fill=AMBER_GLOW)
    d.text((365, 575), "  →  ", font=get_font("mono", 15, bold=True), fill=TEXT_MUTED)
    d.text((415, 575), "VERIFICAR", font=get_font("mono", 15, bold=True), fill=GREEN_GLOW)
    d.text((535, 575), "  →  ", font=get_font("mono", 15, bold=True), fill=TEXT_MUTED)
    d.text((585, 575), "DISCUTIR", font=get_font("mono", 15, bold=True), fill=TEXT_WHITE)
    
    d.text((95, 608), "Cada parte prepara la siguiente: no son temas aislados, sino una demostración sólida paso a paso.", font=get_font("sans", 13, bold=False), fill=TEXT_MUTED)
    
    script = "Esta lámina resume el orden que sigo en la defensa. Primero presento el problema, el protocolo y la matriz; después desarrollo la intersección y el ángulo; luego analizo el parámetro y los planos; y finalmente muestro las pruebas adversarias, la fabricación de evidencia y las conclusiones. Así, cada parte prepara la siguiente: primero planteo, después resuelvo, luego verifico y finalmente discuto qué significa el resultado. No son temas aislados, sino un mismo argumento que voy desarrollando paso a paso."
    draw_teleprompter(d, script)
    draw_footer(d, 11)
    im.save(OUT_DIR / "11_defensa_oral.png", quality=95)
    print("Generated 11_defensa_oral.png")

# -------------------------------------------------------------
# SLIDE 12: CIERRE
# -------------------------------------------------------------
def build_slide_12():
    im, d = create_base_canvas()
    draw_header(d, "Cierre · Preguntas Clave", "Dos Preguntas que Condensan la Defensa", "Síntesis conceptual definitiva: justificación geométrica y rigor matemático")
    
    f_mono_b = get_font("mono", 15, bold=True)
    f_sans = get_font("sans", 13, bold=False)
    
    # Left Card: Pregunta 1 (¿Por qué seno?)
    draw_card(d, [75, 185, 640, 520], "1. ¿POR QUÉ USAMOS SENO PARA RECTA-PLANO?", "Ángulo con la normal vs. ángulo con el plano", AMBER_GLOW)
    d.text((95, 235), "El producto escalar relaciona la dirección (d)", font=f_sans, fill=TEXT_WHITE)
    d.text((95, 260), "con la normal del plano (n):", font=f_sans, fill=TEXT_WHITE)
    d.text((95, 290), "cos β = |d · n| / (||d|| ||n||) = 1/9", font=f_mono_b, fill=AMBER_GLOW)
    
    d.text((95, 335), "Como la normal es perpendicular al plano:", font=f_sans, fill=TEXT_WHITE)
    d.text((95, 360), "α y β son ángulos complementarios (α + β = 90°)", font=get_font("sans", 13, bold=True), fill=CYAN_GLOW)
    
    d.rounded_rectangle([95, 400, 620, 495], radius=6, fill=(16, 45, 30, 220), outline=GREEN_GLOW, width=1)
    d.text((115, 415), "sin α = cos β = 1 / 9", font=get_font("mono", 18, bold=True), fill=GREEN_GLOW)
    d.text((115, 455), "α = arcsin(1/9) ≈ 6,38° = 6° 22′ 46″", font=get_font("mono", 14, bold=True), fill=TEXT_WHITE)
    
    # Right Card: Pregunta 2 (¿Por qué alcanza 6 != -2?)
    draw_card(d, [665, 185, 1260, 520], "2. ¿POR QUÉ ALCANZA VER QUE 6 ≠ −2?", "Proporcionalidad vectorial e incompatibilidad", RED_GLOW)
    d.text((685, 235), "Para paralelismo vectorial (d || n):", font=f_sans, fill=TEXT_WHITE)
    d.text((685, 260), "Todas las razones deben ser iguales a una constante k:", font=f_sans, fill=TEXT_WHITE)
    d.text((685, 290), "m / 3 = 6 / 1 = 4 / (−2) = k", font=f_mono_b, fill=AMBER_GLOW)
    
    d.text((685, 335), "Comparando las dos razones numéricas:", font=f_sans, fill=TEXT_WHITE)
    d.text((685, 360), "Razón Y: 6/1 = 6   vs.   Razón Z: 4/(−2) = −2", font=f_mono_b, fill=RED_GLOW)
    
    d.rounded_rectangle([685, 400, 1240, 495], radius=6, fill=(45, 18, 22, 220), outline=RED_GLOW, width=1)
    d.text((705, 415), "6 ≠ −2  (Contradicción Inmediata)", font=get_font("mono", 17, bold=True), fill=RED_GLOW)
    d.text((705, 455), "Sistema Incompatible  →  ∄ m ∈ ℝ  (S = ∅)", font=get_font("sans", 14, bold=True), fill=TEXT_WHITE)
    
    # Bottom Banner
    draw_card(d, [75, 545, 1260, 645], "¡MUCHAS GRACIAS POR SU ATENCIÓN!", "UTN FRLP · Comisión S16 · Quedamos a disposición para preguntas", GREEN_GLOW, (12, 38, 28, 230))
    d.text((95, 575), "“Una fórmula matemática adquiere verdadero sentido cuando puede verificarse geométricamente.”", font=get_font("serif", 16, bold=True), fill=GREEN_GLOW)
    d.text((95, 608), "Santiago Sessa · Mateo Rau · Lucio Pieroni · Lucas Bazan", font=get_font("sans", 13, bold=True), fill=TEXT_WHITE)
    
    script = "Para terminar, quiero retomar dos preguntas que resumen la defensa. ¿Por qué uso seno? Porque el producto escalar me da el ángulo con la normal y el ángulo de la recta con el plano es su complementario; por eso el coseno de beta se convierte en el seno de alfa. ¿Y por qué alcanza con ver que seis no es menos dos? Porque si hay paralelismo, todas las componentes tienen que ser proporcionales con una misma constante. Si dos razones no coinciden, el sistema ya es incompatible. Con esas dos ideas vuelvo al principio: una fórmula tiene sentido cuando también puede verificarse geométricamente. Muchas gracias."
    draw_teleprompter(d, script)
    draw_footer(d, 12)
    im.save(OUT_DIR / "12_cierre.png", quality=95)
    print("Generated 12_cierre.png")

def generate_all():
    print("Generating all 12 presentation slides...")
    build_slide_01()
    build_slide_02()
    build_slide_03()
    build_slide_04()
    build_slide_05()
    build_slide_06()
    build_slide_07()
    build_slide_08()
    build_slide_09()
    build_slide_10()
    build_slide_011()
    build_slide_12()
    print("All 12 slides successfully generated in:", OUT_DIR)

if __name__ == "__main__":
    generate_all()



