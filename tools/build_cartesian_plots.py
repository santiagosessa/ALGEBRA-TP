# -*- coding: utf-8 -*-
from __future__ import annotations

import math
import os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "procedimiento antigravity imagenes" / "planos_cartesianos"
OUT_DIR.mkdir(parents=True, exist_ok=True)
CROP_DIR = OUT_DIR / "recortadas"
CROP_DIR.mkdir(parents=True, exist_ok=True)

W, H = 1400, 800

# Color Palette
TEXT_WHITE = (244, 248, 246, 255)
TEXT_MUTED = (160, 185, 182, 255)
TEXT_DIM = (100, 130, 135, 200)

CYAN_GLOW = (56, 189, 248, 255)
CYAN_LINE = (117, 211, 192, 240)
CYAN_BG = (12, 36, 48, 215)
CYAN_GRID = (28, 70, 90, 140)

AMBER_GLOW = (240, 179, 108, 255)
AMBER_BG = (42, 28, 14, 215)

GREEN_GLOW = (74, 222, 128, 255)
GREEN_BG = (14, 42, 28, 215)

RED_GLOW = (248, 113, 113, 255)
RED_BG = (46, 18, 22, 215)

AXIS_COLOR = (140, 200, 215, 240)
GRID_SUB = (20, 50, 65, 90)
GRID_MAIN = (32, 80, 105, 160)

CARD_BG = (8, 24, 34, 220)
CARD_BORDER = (28, 68, 88, 220)

def get_font(name: str, size: int, bold: bool = False):
    candidates = []
    if name == "serif":
        candidates = ["C:/Windows/Fonts/georgiab.ttf" if bold else "C:/Windows/Fonts/georgia.ttf",
                      "C:/Windows/Fonts/timesbd.ttf" if bold else "C:/Windows/Fonts/times.ttf"]
    elif name == "mono":
        candidates = ["C:/Windows/Fonts/consolab.ttf" if bold else "C:/Windows/Fonts/consola.ttf",
                      "C:/Windows/Fonts/courbd.ttf" if bold else "C:/Windows/Fonts/cour.ttf"]
    else:
        candidates = ["C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
                      "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf"]
    for c in candidates:
        if os.path.exists(c):
            return ImageFont.truetype(c, size)
    return ImageFont.load_default()

def create_transparent_canvas():
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    return im, d

def draw_header_badge(d, x, y, badge_text, title_text, subtitle_text=None):
    font_badge = get_font("mono", 12, bold=True)
    badge_w = len(badge_text) * 8.5 + 20
    d.rounded_rectangle([x, y, x + badge_w, y + 26], radius=4, fill=(14, 40, 54, 220), outline=CYAN_LINE, width=1)
    d.text((x + 10, y + 5), badge_text.upper(), font=font_badge, fill=CYAN_GLOW)
    
    font_title = get_font("serif", 24, bold=True)
    d.text((x, y + 34), title_text, font=font_title, fill=TEXT_WHITE)
    if subtitle_text:
        d.text((x, y + 68), subtitle_text, font=get_font("sans", 13, bold=False), fill=TEXT_MUTED)

def draw_info_panel(d, box, title, lines, color=CYAN_GLOW, bg_color=CARD_BG, border_color=CARD_BORDER):
    d.rounded_rectangle(box, radius=8, fill=bg_color, outline=border_color, width=1)
    d.text((box[0] + 16, box[1] + 14), title, font=get_font("sans", 14, bold=True), fill=color)
    d.line([(box[0] + 16, box[1] + 38), (box[2] - 16, box[1] + 38)], fill=CARD_BORDER, width=1)
    
    y = box[1] + 48
    for line, c, is_bold in lines:
        f = get_font("mono" if any(ch in line for ch in "()=+-*/λπ[]0123456789") else "sans", 13, bold=is_bold)
        d.text((box[0] + 16, y), line, font=f, fill=c)
        y += 24

def save_and_crop(im: Image.Image, name: str):
    im.save(OUT_DIR / name)
    bbox = im.getbbox()
    if bbox:
        pad = 14
        b_pad = (max(0, bbox[0] - pad), max(0, bbox[1] - pad), min(im.width, bbox[2] + pad), min(im.height, bbox[3] + pad))
        cropped = im.crop(b_pad)
        cropped.save(CROP_DIR / name)
    print(f"Generated Cartesian Plot: {name}")

# =============================================================
# 2D CARTESIAN PLANE SYSTEM
# =============================================================
class Cartesian2D:
    def __init__(self, origin_px, scale_x, scale_y, x_min, x_max, y_min, y_max):
        self.ox, self.oy = origin_px
        self.sx = scale_x
        self.sy = scale_y
        self.x_min = x_min
        self.x_max = x_max
        self.y_min = y_min
        self.y_max = y_max

    def to_px(self, x, y):
        return int(self.ox + x * self.sx), int(self.oy - y * self.sy)

    def draw_grid_and_axes(self, d: ImageDraw.ImageDraw, x_label="X", y_label="Y", step_x=1, step_y=1):
        f_ticks = get_font("mono", 11, bold=False)
        f_axis = get_font("sans", 14, bold=True)
        
        # Grid lines X
        for x in range(int(self.x_min), int(self.x_max) + 1, step_x):
            px0, py0 = self.to_px(x, self.y_min)
            px1, py1 = self.to_px(x, self.y_max)
            col = GRID_MAIN if x % (step_x * 2) == 0 else GRID_SUB
            d.line([(px0, py0), (px1, py1)], fill=col, width=1)
            
        # Grid lines Y
        for y in range(int(self.y_min), int(self.y_max) + 1, step_y):
            px0, py0 = self.to_px(self.x_min, y)
            px1, py1 = self.to_px(self.x_max, y)
            col = GRID_MAIN if y % (step_y * 2) == 0 else GRID_SUB
            d.line([(px0, py0), (px1, py1)], fill=col, width=1)

        # Main Axis X
        px_x0, py_x0 = self.to_px(self.x_min - 0.5, 0)
        px_x1, py_x1 = self.to_px(self.x_max + 0.8, 0)
        d.line([(px_x0, py_x0), (px_x1, py_x1)], fill=AXIS_COLOR, width=2)
        # Arrow X
        d.polygon([(px_x1, py_x1), (px_x1 - 10, py_x1 - 5), (px_x1 - 10, py_x1 + 5)], fill=AXIS_COLOR)
        d.text((px_x1 + 8, py_x1 - 10), x_label, font=f_axis, fill=CYAN_GLOW)

        # Main Axis Y
        px_y0, py_y0 = self.to_px(0, self.y_min - 0.5)
        px_y1, py_y1 = self.to_px(0, self.y_max + 0.8)
        d.line([(px_y0, py_y0), (px_y1, py_y1)], fill=AXIS_COLOR, width=2)
        # Arrow Y
        d.polygon([(px_y1, py_y1), (px_y1 - 5, py_y1 + 10), (px_y1 + 5, py_y1 + 10)], fill=AXIS_COLOR)
        d.text((px_y1 - 6, py_y1 - 22), y_label, font=f_axis, fill=CYAN_GLOW)

        # Ticks and numeric labels X
        for x in range(int(self.x_min), int(self.x_max) + 1, step_x):
            if x == 0:
                continue
            px, py = self.to_px(x, 0)
            d.line([(px, py - 4), (px, py + 4)], fill=TEXT_MUTED, width=1)
            d.text((px - 5, py + 6), str(x), font=f_ticks, fill=TEXT_MUTED)

        # Ticks and numeric labels Y
        for y in range(int(self.y_min), int(self.y_max) + 1, step_y):
            if y == 0:
                continue
            px, py = self.to_px(0, y)
            d.line([(px - 4, py), (px + 4, py)], fill=TEXT_MUTED, width=1)
            d.text((px - 20, py - 6), str(y), font=f_ticks, fill=TEXT_MUTED)
            
        # Origin
        d.text((self.ox - 14, self.oy + 4), "0", font=f_ticks, fill=TEXT_MUTED)

    def plot_point(self, d: ImageDraw.ImageDraw, x, y, color=AMBER_GLOW, label=None, label_side="top_right", radius=6, drop_lines=True):
        px, py = self.to_px(x, y)
        if drop_lines:
            px0, py0 = self.to_px(x, 0)
            px_y, py_y = self.to_px(0, y)
            d.line([(px, py), (px0, py0)], fill=(color[0], color[1], color[2], 120), width=1)
            d.line([(px, py), (px_y, py_y)], fill=(color[0], color[1], color[2], 120), width=1)
            
        # Halo
        d.ellipse([px - radius - 3, py - radius - 3, px + radius + 3, py + radius + 3], fill=(color[0], color[1], color[2], 70))
        d.ellipse([px - radius, py - radius, px + radius, py + radius], fill=color, outline=TEXT_WHITE, width=1)
        
        if label:
            f = get_font("mono", 12, bold=True)
            offsets = {
                "top_right": (10, -18),
                "top_left": (-len(label)*7.5 - 10, -18),
                "bottom_right": (10, 8),
                "bottom_left": (-len(label)*7.5 - 10, 8),
                "top": (-len(label)*3.5, -20),
                "bottom": (-len(label)*3.5, 10),
            }
            ox, oy = offsets.get(label_side, (10, -18))
            d.text((px + ox, py + oy), label, font=f, fill=color)

    def plot_line(self, d: ImageDraw.ImageDraw, x0, y0, x1, y1, color=CYAN_GLOW, width=3):
        px0, py0 = self.to_px(x0, y0)
        px1, py1 = self.to_px(x1, y1)
        d.line([(px0, py0), (px1, py1)], fill=color, width=width)

    def plot_vector(self, d: ImageDraw.ImageDraw, x0, y0, dx, dy, color=GREEN_GLOW, label=None):
        px0, py0 = self.to_px(x0, y0)
        px1, py1 = self.to_px(x0 + dx, y0 + dy)
        d.line([(px0, py0), (px1, py1)], fill=color, width=3)
        
        # Arrowhead
        angle = math.atan2(-(py1 - py0), px1 - px0)
        arrow_len = 12
        a1 = angle + math.pi * 0.85
        a2 = angle - math.pi * 0.85
        p_a1 = (px1 + arrow_len * math.cos(a1), py1 - arrow_len * math.sin(a1))
        p_a2 = (px1 + arrow_len * math.cos(a2), py1 - arrow_len * math.sin(a2))
        d.polygon([(px1, py1), p_a1, p_a2], fill=color)
        
        if label:
            f = get_font("mono", 12, bold=True)
            d.text((px1 + 10, py1 - 10), label, font=f, fill=color)

# =============================================================
# 3D CARTESIAN PROJECTION SYSTEM
# =============================================================
class Cartesian3D:
    def __init__(self, center_px=(780, 430), scale=28.0, yaw=35.0, pitch=24.0):
        self.cx, self.cy = center_px
        self.scale = scale
        # Angles in radians
        self.yaw = math.radians(yaw)
        self.pitch = math.radians(pitch)

    def project(self, x, y, z):
        # 3D coordinate transformation:
        # Standard right-handed coordinate system in engineering:
        # X: Forward/Left, Y: Right, Z: Up
        # Rotate around Z (yaw) and X (pitch)
        cos_y = math.cos(self.yaw)
        sin_y = math.sin(self.yaw)
        cos_p = math.cos(self.pitch)
        sin_p = math.sin(self.pitch)
        
        # Rotated coordinates
        x_rot = x * cos_y - y * sin_y
        y_rot = x * sin_y + y * cos_y
        
        px = self.cx + self.scale * (y_rot)
        py = self.cy - self.scale * (z * cos_p - x_rot * sin_p)
        return int(px), int(py)

    def draw_axes_3d(self, d: ImageDraw.ImageDraw, x_len=10, y_len=10, z_len=10, grid_xy=True):
        f_axis = get_font("sans", 14, bold=True)
        f_ticks = get_font("mono", 10, bold=False)
        
        # Draw XY Floor Grid
        if grid_xy:
            for gx in range(-2, x_len + 1, 2):
                p0 = self.project(gx, -2, 0)
                p1 = self.project(gx, y_len, 0)
                d.line([p0, p1], fill=GRID_SUB, width=1)
            for gy in range(-2, y_len + 1, 2):
                p0 = self.project(-2, gy, 0)
                p1 = self.project(x_len, gy, 0)
                d.line([p0, p1], fill=GRID_SUB, width=1)
                
        # Origin
        o_px = self.project(0, 0, 0)
        
        # Axis X (Forward-Left)
        x_end = self.project(x_len, 0, 0)
        d.line([o_px, x_end], fill=AXIS_COLOR, width=2)
        d.text((x_end[0] - 20, x_end[1] + 6), "+X", font=f_axis, fill=CYAN_GLOW)
        
        # Axis Y (Right)
        y_end = self.project(0, y_len, 0)
        d.line([o_px, y_end], fill=AXIS_COLOR, width=2)
        d.text((y_end[0] + 8, y_end[1] - 8), "+Y", font=f_axis, fill=CYAN_GLOW)
        
        # Axis Z (Vertical Up)
        z_end = self.project(0, 0, z_len)
        z_neg = self.project(0, 0, -z_len * 0.7)
        d.line([z_neg, z_end], fill=AXIS_COLOR, width=2)
        d.text((z_end[0] - 6, z_end[1] - 22), "+Z", font=f_axis, fill=CYAN_GLOW)
        d.text((z_neg[0] - 6, z_neg[1] + 8), "−Z", font=f_ticks, fill=TEXT_MUTED)

        # Ticks along Z
        for tz in [-6, -4, -2, 2, 4, 6, 8]:
            pt = self.project(0, 0, tz)
            d.line([(pt[0] - 4, pt[1]), (pt[0] + 4, pt[1])], fill=TEXT_MUTED, width=1)
            d.text((pt[0] + 8, pt[1] - 6), str(tz), font=f_ticks, fill=TEXT_MUTED)

    def plot_point_3d(self, d: ImageDraw.ImageDraw, pt, color=AMBER_GLOW, label=None, label_offset=(10, -15), radius=6, drop_lines=True):
        x, y, z = pt
        px, py = self.project(x, y, z)
        
        if drop_lines:
            # Drop to XY plane (x, y, 0)
            p_xy = self.project(x, y, 0)
            p_z0 = self.project(0, 0, z)
            d.line([(px, py), p_xy], fill=(color[0], color[1], color[2], 140), width=1)
            d.line([p_xy, self.project(x, 0, 0)], fill=(color[0], color[1], color[2], 90), width=1)
            d.line([p_xy, self.project(0, y, 0)], fill=(color[0], color[1], color[2], 90), width=1)
            # Mark XY footprint
            d.ellipse([p_xy[0] - 3, p_xy[1] - 3, p_xy[0] + 3, p_xy[1] + 3], fill=(color[0], color[1], color[2], 120))
            
        # Point beacon & Halo
        d.ellipse([px - radius - 4, py - radius - 4, px + radius + 4, py + radius + 4], fill=(color[0], color[1], color[2], 70))
        d.ellipse([px - radius, py - radius, px + radius, py + radius], fill=color, outline=TEXT_WHITE, width=1)
        
        if label:
            f = get_font("mono", 12, bold=True)
            d.text((px + label_offset[0], py + label_offset[1]), label, font=f, fill=color)

    def plot_vector_3d(self, d: ImageDraw.ImageDraw, start_pt, vec, color=GREEN_GLOW, label=None, width=3):
        x0, y0, z0 = start_pt
        vx, vy, vz = vec
        p0 = self.project(x0, y0, z0)
        p1 = self.project(x0 + vx, y0 + vy, z0 + vz)
        d.line([p0, p1], fill=color, width=width)
        
        # Arrowhead in 2D projected space
        angle = math.atan2(-(p1[1] - p0[1]), p1[0] - p0[0])
        arrow_len = 12
        a1 = angle + math.pi * 0.85
        a2 = angle - math.pi * 0.85
        p_a1 = (p1[0] + arrow_len * math.cos(a1), p1[1] - arrow_len * math.sin(a1))
        p_a2 = (p1[0] + arrow_len * math.cos(a2), p1[1] - arrow_len * math.sin(a2))
        d.polygon([p1, p_a1, p_a2], fill=color)
        
        if label:
            f = get_font("mono", 12, bold=True)
            d.text((p1[0] + 10, p1[1] - 10), label, font=f, fill=color)

    def plot_line_segment_3d(self, d: ImageDraw.ImageDraw, pt1, pt2, color=CYAN_GLOW, width=3):
        p1 = self.project(*pt1)
        p2 = self.project(*pt2)
        d.line([p1, p2], fill=color, width=width)

    def plot_plane_polygon(self, d: ImageDraw.ImageDraw, corners, fill_color=(12, 45, 60, 110), outline_color=CYAN_LINE):
        pts = [self.project(*c) for c in corners]
        d.polygon(pts, fill=fill_color, outline=outline_color)


# =============================================================
# 1. EJERCICIO 1: INTERSECCIÓN RECTA-PLANO EN R³
# =============================================================
def plot_01_interseccion_3d():
    im, d = create_transparent_canvas()
    draw_header_badge(d, 40, 30, "Ejercicio 1 · R³", "Intersección Recta-Plano en el Espacio Cartesiano",
                      "Plano π: 2x − y + z − 6 = 0  ∩  Recta r: r(λ) = (−1+3λ, 2+λ, −2λ)")
    
    # Left Info Card
    draw_info_panel(d, [40, 130, 440, 680], "PARÁMETROS ANALÍTICOS", [
        ("Plano General π:", CYAN_GLOW, True),
        ("2x − y + z − 6 = 0", TEXT_WHITE, False),
        ("Vector Normal:", CYAN_GLOW, False),
        ("n = (2, −1, 1)", CYAN_LINE, True),
        ("", TEXT_WHITE, False),
        ("Recta Paramétrica r:", AMBER_GLOW, True),
        ("r(λ) = P0 + λ·d", TEXT_WHITE, False),
        ("P0 = (−1, 2, 0) ∈ r", TEXT_MUTED, False),
        ("d = (3, 1, −2)", AMBER_GLOW, True),
        ("", TEXT_WHITE, False),
        ("Sustitución en π:", TEXT_WHITE, True),
        ("2(−1+3λ) − (2+λ) − 2λ − 6 = 0", TEXT_MUTED, False),
        ("3λ − 10 = 0  →  λ = 10/3", AMBER_GLOW, True),
        ("", TEXT_WHITE, False),
        ("Punto de Intersección I:", GREEN_GLOW, True),
        ("I(9, 16/3, −20/3)", GREEN_GLOW, True),
        ("≈ (9, 5.33, −6.67)", TEXT_MUTED, False),
        ("", TEXT_WHITE, False),
        ("✓ Verificación en π:", GREEN_GLOW, True),
        ("2(9) − 16/3 − 20/3 − 6 = 0 ✓", GREEN_GLOW, False)
    ])
    
    # 3D Cartesian Plot
    c3 = Cartesian3D(center_px=(880, 410), scale=26.0, yaw=32.0, pitch=22.0)
    c3.draw_axes_3d(d, x_len=12, y_len=10, z_len=10)
    
    # Plane polygon vertices (satisfying 2x - y + z - 6 = 0)
    # Let x in [0, 12], y in [-2, 10], compute z = 6 - 2x + y
    corners = [
        (0, 0, 6),
        (10, 0, -14),
        (12, 10, -8),
        (0, 10, 16)
    ]
    c3.plot_plane_polygon(d, corners, fill_color=(14, 48, 64, 120), outline_color=(56, 189, 248, 180))
    
    # Normal vector n=(2, -1, 1) starting from plane center
    c3.plot_vector_3d(d, (3, 4, 4), (2*1.8, -1*1.8, 1*1.8), color=CYAN_GLOW, label="n=(2,−1,1)")
    
    # Line r through P0(-1, 2, 0) with direction d=(3, 1, -2)
    # Range of lambda from -0.5 to 4.5
    pt_start = (-1 + 3*(-0.5), 2 + 1*(-0.5), -2*(-0.5))
    pt_end = (-1 + 3*(4.5), 2 + 1*(4.5), -2*(4.5))
    c3.plot_line_segment_3d(d, pt_start, pt_end, color=AMBER_GLOW, width=4)
    
    # Plot Base Point P0
    c3.plot_point_3d(d, (-1, 2, 0), color=AMBER_GLOW, label="P0(−1,2,0)", label_offset=(-80, -15))
    
    # Plot Intersection Point I(9, 16/3, -20/3)
    I_pt = (9, 16/3, -20/3)
    c3.plot_point_3d(d, I_pt, color=GREEN_GLOW, label="I(9, 16/3, −20/3) ∈ π ∩ r", label_offset=(15, -12), radius=8)
    
    save_and_crop(im, "01_cartesiano_interseccion_3d.png")

# =============================================================
# 2. EJERCICIO 2: ÁNGULO RECTA-PLANO EN R³
# =============================================================
def plot_02_angulo_recta_plano_3d():
    im, d = create_transparent_canvas()
    draw_header_badge(d, 40, 30, "Ejercicio 2 · R³", "Geometría del Ángulo Recta-Plano y Vector Normal",
                      "d = (1, 2, 2)  |  n = (1, −2, 2)  |  Relación de complementariedad α + β = 90°")
    
    # Left Info Card
    draw_info_panel(d, [40, 130, 440, 680], "DEDUCCIÓN TRIGONOMÉTRICA", [
        ("Vector Director de la Recta:", AMBER_GLOW, True),
        ("d = (1, 2, 2)", AMBER_GLOW, False),
        ("||d|| = √(1+4+4) = 3", TEXT_MUTED, False),
        ("", TEXT_WHITE, False),
        ("Vector Normal al Plano:", CYAN_GLOW, True),
        ("n = (1, −2, 2)", CYAN_GLOW, False),
        ("||n|| = √(1+4+4) = 3", TEXT_MUTED, False),
        ("", TEXT_WHITE, False),
        ("Producto Escalar d · n:", TEXT_WHITE, True),
        ("1(1) + 2(−2) + 2(2) = 1", TEXT_MUTED, False),
        ("cos β = 1 / (3 · 3) = 1/9", CYAN_GLOW, True),
        ("", TEXT_WHITE, False),
        ("Ángulo con la Normal (β):", CYAN_GLOW, True),
        ("β = arccos(1/9) ≈ 83,62°", CYAN_GLOW, False),
        ("", TEXT_WHITE, False),
        ("Ángulo Recta-Plano (α):", GREEN_GLOW, True),
        ("sin α = cos β = 1/9", GREEN_GLOW, True),
        ("α = 90° − 83,62°", TEXT_WHITE, False),
        ("α ≈ 6,38°  (6° 22′ 46″)", GREEN_GLOW, True)
    ])
    
    # 3D Cartesian Plot
    c3 = Cartesian3D(center_px=(900, 430), scale=42.0, yaw=40.0, pitch=20.0)
    c3.draw_axes_3d(d, x_len=6, y_len=6, z_len=6)
    
    # Plane surface patch through origin with normal n=(1, -2, 2)
    # x - 2y + 2z = 0 -> z = y - 0.5x
    p_corners = [
        (-3, -2, -0.5),
        (5, -1, -3.5),
        (5, 5, 2.5),
        (-3, 4, 5.5)
    ]
    c3.plot_plane_polygon(d, p_corners, fill_color=(12, 45, 60, 120), outline_color=(56, 189, 248, 180))
    
    # Normal Vector n=(1, -2, 2)
    c3.plot_vector_3d(d, (0, 0, 0), (1, -2, 2), color=CYAN_GLOW, label="n = (1, −2, 2) [Normal]")
    
    # Direction Vector d=(1, 2, 2)
    c3.plot_vector_3d(d, (0, 0, 0), (1, 2, 2), color=AMBER_GLOW, label="d = (1, 2, 2) [Recta]")
    
    # Projected vector d_proj onto plane: d_proj = d - (d.n / |n|^2)*n = (1,2,2) - (1/9)*(1,-2,2) = (8/9, 20/9, 16/9)
    d_proj = (8/9, 20/9, 16/9)
    c3.plot_vector_3d(d, (0, 0, 0), d_proj, color=GREEN_GLOW, label="d_proj [En el Plano π]", width=2)
    
    # Perpendicular connector between d and d_proj
    c3.plot_line_segment_3d(d, (1, 2, 2), d_proj, color=(248, 113, 113, 200), width=2)
    
    # Angle annotations in 2D projected space
    p_origin = c3.project(0, 0, 0)
    d.text((p_origin[0] + 25, p_origin[1] - 45), "β ≈ 83,62° (Normal)", font=get_font("mono", 12, bold=True), fill=CYAN_GLOW)
    d.text((p_origin[0] + 55, p_origin[1] - 12), "α ≈ 6,38° (Plano)", font=get_font("mono", 12, bold=True), fill=GREEN_GLOW)
    
    save_and_crop(im, "02_cartesiano_angulo_recta_plano_3d.png")

# =============================================================
# 3. EJERCICIO 3: PARÁMETRO m (CASO PARALELO / ORTOGONAL)
# =============================================================
def plot_03_parametro_m_paralelo_3d():
    im, d = create_transparent_canvas()
    draw_header_badge(d, 40, 30, "Ejercicio 3 · Caso 3.a", "Recta Paralela al Plano (d ⊥ n en R³)",
                      "d = (m, 6, 4)  |  n = (3, 1, −2)  |  Condición: d · n = 0  →  m = 2/3")
    
    # Left Info Card
    draw_info_panel(d, [40, 130, 440, 680], "ANÁLISIS DE ORTOGONALIDAD", [
        ("Condición r || π:", GREEN_GLOW, True),
        ("El vector director d debe ser", TEXT_WHITE, False),
        ("perpendicular a la normal n:", TEXT_WHITE, False),
        ("d ⊥ n  ⟺  d · n = 0", GREEN_GLOW, True),
        ("", TEXT_WHITE, False),
        ("Planteo Escalar:", TEXT_WHITE, True),
        ("(m, 6, 4) · (3, 1, −2) = 0", TEXT_MUTED, False),
        ("3m + 6(1) + 4(−2) = 0", TEXT_MUTED, False),
        ("3m + 6 − 8 = 0", TEXT_MUTED, False),
        ("3m − 2 = 0", TEXT_MUTED, False),
        ("", TEXT_WHITE, False),
        ("Resultado Único:", GREEN_GLOW, True),
        ("m = 2/3", GREEN_GLOW, True),
        ("d = (2/3, 6, 4)", AMBER_GLOW, False),
        ("", TEXT_WHITE, False),
        ("✓ Comprobación Geométrica:", GREEN_GLOW, True),
        ("(2/3)(3) + 6(1) + 4(−2)", TEXT_MUTED, False),
        ("= 2 + 6 − 8 = 0 ✓", GREEN_GLOW, True),
        ("La recta no corta a π (es paralela).", TEXT_MUTED, False)
    ])
    
    # 3D Cartesian Plot
    c3 = Cartesian3D(center_px=(900, 420), scale=30.0, yaw=42.0, pitch=22.0)
    c3.draw_axes_3d(d, x_len=8, y_len=8, z_len=8)
    
    # Plane 3x + y - 2z = 0 -> y = 2z - 3x
    p_corners = [
        (-2, 4, -1),
        (4, -8, 2),
        (4, 0, 6),
        (-2, 12, 3)
    ]
    c3.plot_plane_polygon(d, p_corners, fill_color=(14, 48, 64, 120), outline_color=(56, 189, 248, 180))
    
    # Normal n = (3, 1, -2)
    c3.plot_vector_3d(d, (0, 0, 0), (3, 1, -2), color=CYAN_GLOW, label="n = (3, 1, −2)")
    
    # Vector d = (2/3, 6, 4) parallel to plane (contained in plane since d.n = 0)
    c3.plot_vector_3d(d, (0, 0, 0), (2/3, 6, 4), color=GREEN_GLOW, label="d = (2/3, 6, 4)  [r || π]")
    
    # Right angle marker between d and n
    p0 = c3.project(0, 0, 0)
    d.text((p0[0] + 15, p0[1] - 30), "d ⊥ n (90°)", font=get_font("mono", 12, bold=True), fill=GREEN_GLOW)
    
    save_and_crop(im, "03_cartesiano_parametro_m_paralelo_3d.png")

# =============================================================
# 4. EJERCICIO 3: PARÁMETRO m (CASO PERPENDICULAR / INCOMPATIBLE)
# =============================================================
def plot_04_parametro_m_incompatible_3d():
    im, d = create_transparent_canvas()
    draw_header_badge(d, 40, 30, "Ejercicio 3 · Caso 3.b", "Recta Perpendicular al Plano (d || n en R³)",
                      "d = (m, 6, 4)  |  n = (3, 1, −2)  |  Razón 6/1 ≠ 4/(−2)  →  Sistema Incompatible (S = ∅)")
    
    # Left Info Card
    draw_info_panel(d, [40, 130, 440, 680], "DEMOSTRACIÓN DE INCOMPATIBILIDAD", [
        ("Condición r ⊥ π:", RED_GLOW, True),
        ("El vector director d debe ser", TEXT_WHITE, False),
        ("colineal a la normal n:", TEXT_WHITE, False),
        ("d = k · n  (k ∈ ℝ)", TEXT_MUTED, False),
        ("", TEXT_WHITE, False),
        ("Sistema de Razones:", TEXT_WHITE, True),
        ("m / 3 = 6 / 1 = 4 / (−2) = k", TEXT_MUTED, False),
        ("", TEXT_WHITE, False),
        ("Comparación de Componentes Y y Z:", AMBER_GLOW, True),
        ("Razón Y:  6 / 1 = 6", CYAN_GLOW, True),
        ("Razón Z:  4 / (−2) = −2", RED_GLOW, True),
        ("", TEXT_WHITE, False),
        ("Contradicción Inmediata:", RED_GLOW, True),
        ("6 ≠ −2  (Inconsistencia)", RED_GLOW, True),
        ("No existe ningún k único en ℝ.", TEXT_WHITE, False),
        ("", TEXT_WHITE, False),
        ("Dictamen Formal:", RED_GLOW, True),
        ("∄ m ∈ ℝ  tal que  r ⊥ π", RED_GLOW, True),
        ("Conjunto Solución: S = ∅", TEXT_WHITE, True)
    ])
    
    # 3D Cartesian Plot
    c3 = Cartesian3D(center_px=(900, 420), scale=28.0, yaw=45.0, pitch=20.0)
    c3.draw_axes_3d(d, x_len=8, y_len=8, z_len=8)
    
    # Normal n = (3, 1, -2) scaled for visualization
    c3.plot_vector_3d(d, (0, 0, 0), (3, 1, -2), color=CYAN_GLOW, label="n = (3, 1, −2) [Normal π]")
    
    # Scaled collinear target if k=6 -> (18, 6, -12) (in red dashed)
    c3.plot_vector_3d(d, (0, 0, 0), (3*2, 1*2, -2*2), color=(56, 189, 248, 120), label="k=2 · n")
    
    # The actual candidate vector with components dy=6, dz=4: for m=2 -> (2, 6, 4)
    c3.plot_vector_3d(d, (0, 0, 0), (2, 6, 4), color=RED_GLOW, label="d = (m, 6, 4) [dz = +4 vs n_z = −2]", width=3)
    
    p_cand = c3.project(2, 6, 4)
    d.text((p_cand[0] + 15, p_cand[1] - 10), "⚠ Imposible alinear: 6/1 ≠ 4/(−2)", font=get_font("mono", 12, bold=True), fill=RED_GLOW)
    
    save_and_crop(im, "04_cartesiano_parametro_m_incompatible_3d.png")

# =============================================================
# 5. EJERCICIO 4: PLANO PROYECTANTE πxy EN 2D (XY)
# =============================================================
def plot_05_plano_proyectante_xy_2d():
    im, d = create_transparent_canvas()
    draw_header_badge(d, 40, 30, "Ejercicio 4 · Proyección XY", "Plano Proyectante πxy en el Plano Cartesiano 2D",
                      "Ecuación: 3x + 4y − 2 = 0  |  Forma explícita: y = −0.75x + 0.5  |  Paralelo al eje Z")
    
    # Left Info Card
    draw_info_panel(d, [40, 130, 440, 680], "ELEMENTOS DE LA PROYECCIÓN XY", [
        ("Recta del TP en Forma Continua:", CYAN_GLOW, True),
        ("(x − 2)/4 = (y + 1)/−3 = (z − 5)/1", TEXT_WHITE, False),
        ("", TEXT_WHITE, False),
        ("Igualando razones X e Y:", TEXT_WHITE, True),
        ("−3(x − 2) = 4(y + 1)", TEXT_MUTED, False),
        ("−3x + 6 = 4y + 4", TEXT_MUTED, False),
        ("3x + 4y − 2 = 0", CYAN_GLOW, True),
        ("", TEXT_WHITE, False),
        ("Puntos Notables en el Plano XY:", AMBER_GLOW, True),
        ("• Punto de paso Pxy(2, −1)", AMBER_GLOW, False),
        ("• Ordenada al origen: (0, 0.5)", TEXT_MUTED, False),
        ("• Abscisa al origen: (2/3, 0)", TEXT_MUTED, False),
        ("", TEXT_WHITE, False),
        ("Vector Director Proyectado:", GREEN_GLOW, True),
        ("d_xy = (4, −3)", GREEN_GLOW, True),
        ("Pendiente m = −3/4 = −0.75", TEXT_MUTED, False),
        ("", TEXT_WHITE, False),
        ("✓ Verificación de P(2, −1):", GREEN_GLOW, True),
        ("3(2) + 4(−1) − 2 = 6 − 4 − 2 = 0 ✓", GREEN_GLOW, False)
    ])
    
    # 2D Cartesian Grid
    c2 = Cartesian2D(origin_px=(880, 420), scale_x=55.0, scale_y=55.0, x_min=-4, x_max=6, y_min=-4, y_max=4)
    c2.draw_grid_and_axes(d, x_label="X", y_label="Y", step_x=1, step_y=1)
    
    # Line: y = -0.75x + 0.5
    # x in [-4, 6] -> y in [3.5, -4]
    c2.plot_line(d, -4, (-0.75*(-4) + 0.5), 6, (-0.75*6 + 0.5), color=CYAN_GLOW, width=4)
    
    # Key Points
    c2.plot_point(d, 2, -1, color=AMBER_GLOW, label="P(2, −1)", label_side="top_right", radius=7)
    c2.plot_point(d, 0, 0.5, color=CYAN_GLOW, label="(0, 0.5)", label_side="top_right", radius=5)
    c2.plot_point(d, 2/3, 0, color=CYAN_GLOW, label="(2/3, 0)", label_side="bottom_left", radius=5)
    
    # Vector d_xy = (4, -3) starting at P(2, -1) -> (6, -4)
    c2.plot_vector(d, 2, -1, 4*0.8, -3*0.8, color=GREEN_GLOW, label="d_xy = (4, −3)")
    
    save_and_crop(im, "05_cartesiano_2d_plano_proyectante_xy.png")

# =============================================================
# 6. EJERCICIO 4: PLANO PROYECTANTE πxz EN 2D (XZ)
# =============================================================
def plot_06_plano_proyectante_xz_2d():
    im, d = create_transparent_canvas()
    draw_header_badge(d, 40, 30, "Ejercicio 4 · Proyección XZ", "Plano Proyectante πxz en el Plano Cartesiano 2D",
                      "Ecuación: x − 4z + 18 = 0  |  Forma explícita: z = 0.25x + 4.5  |  Paralelo al eje Y")
    
    # Left Info Card
    draw_info_panel(d, [40, 130, 440, 680], "ELEMENTOS DE LA PROYECCIÓN XZ", [
        ("Recta del TP en Forma Continua:", CYAN_GLOW, True),
        ("(x − 2)/4 = (y + 1)/−3 = (z − 5)/1", TEXT_WHITE, False),
        ("", TEXT_WHITE, False),
        ("Igualando razones X y Z:", TEXT_WHITE, True),
        ("1(x − 2) = 4(z − 5)", TEXT_MUTED, False),
        ("x − 2 = 4z − 20", TEXT_MUTED, False),
        ("x − 4z + 18 = 0", AMBER_GLOW, True),
        ("", TEXT_WHITE, False),
        ("Control Crítico del Signo (+18):", AMBER_GLOW, True),
        ("−2 + 20 = +18  (Auditado)", AMBER_GLOW, False),
        ("Si fuera −18, el punto P no pertenecería.", RED_GLOW, False),
        ("", TEXT_WHITE, False),
        ("Puntos Notables en el Plano XZ:", GREEN_GLOW, True),
        ("• Punto de paso Pxz(2, 5)", AMBER_GLOW, False),
        ("• Corte eje Z: (0, 4.5)", TEXT_MUTED, False),
        ("• Corte eje X: (−18, 0)", TEXT_MUTED, False),
        ("", TEXT_WHITE, False),
        ("✓ Verificación de P(2, 5):", GREEN_GLOW, True),
        ("2 − 4(5) + 18 = 2 − 20 + 18 = 0 ✓", GREEN_GLOW, True)
    ])
    
    # 2D Cartesian Grid (X and Z)
    c2 = Cartesian2D(origin_px=(820, 520), scale_x=38.0, scale_y=38.0, x_min=-6, x_max=8, y_min=-1, y_max=9)
    c2.draw_grid_and_axes(d, x_label="X", y_label="Z", step_x=2, step_y=2)
    
    # Line: z = 0.25x + 4.5
    # x in [-6, 8] -> z in [3, 6.5]
    c2.plot_line(d, -6, (0.25*(-6) + 4.5), 8, (0.25*8 + 4.5), color=AMBER_GLOW, width=4)
    
    # Key Points
    c2.plot_point(d, 2, 5, color=GREEN_GLOW, label="P(2, 5)", label_side="top_left", radius=7)
    c2.plot_point(d, 0, 4.5, color=CYAN_GLOW, label="(0, 4.5)", label_side="top_left", radius=5)
    
    # Vector d_xz = (4, 1) starting at P(2, 5)
    c2.plot_vector(d, 2, 5, 4, 1, color=CYAN_GLOW, label="d_xz = (4, 1)")
    
    save_and_crop(im, "06_cartesiano_2d_plano_proyectante_xz.png")

# =============================================================
# 7. EJERCICIO 4: PLANO PROYECTANTE πyz EN 2D (YZ)
# =============================================================
def plot_07_plano_proyectante_yz_2d():
    im, d = create_transparent_canvas()
    draw_header_badge(d, 40, 30, "Ejercicio 4 · Proyección YZ", "Plano Proyectante πyz en el Plano Cartesiano 2D",
                      "Ecuación: y + 3z − 14 = 0  |  Forma explícita: z = −0.33y + 4.67  |  Paralelo al eje X")
    
    # Left Info Card
    draw_info_panel(d, [40, 130, 440, 680], "ELEMENTOS DE LA PROYECCIÓN YZ", [
        ("Recta del TP en Forma Continua:", CYAN_GLOW, True),
        ("(x − 2)/4 = (y + 1)/−3 = (z − 5)/1", TEXT_WHITE, False),
        ("", TEXT_WHITE, False),
        ("Igualando razones Y y Z:", TEXT_WHITE, True),
        ("1(y + 1) = −3(z − 5)", TEXT_MUTED, False),
        ("y + 1 = −3z + 15", TEXT_MUTED, False),
        ("y + 3z − 14 = 0", GREEN_GLOW, True),
        ("", TEXT_WHITE, False),
        ("Puntos Notables en el Plano YZ:", AMBER_GLOW, True),
        ("• Punto de paso Pyz(−1, 5)", AMBER_GLOW, False),
        ("• Corte eje Z: (0, 14/3) ≈ (0, 4.67)", TEXT_MUTED, False),
        ("• Corte eje Y: (14, 0)", TEXT_MUTED, False),
        ("", TEXT_WHITE, False),
        ("Vector Director Proyectado:", GREEN_GLOW, True),
        ("d_yz = (−3, 1)", GREEN_GLOW, True),
        ("Pendiente m = −1/3 ≈ −0.33", TEXT_MUTED, False),
        ("", TEXT_WHITE, False),
        ("✓ Verificación de P(−1, 5):", GREEN_GLOW, True),
        ("(−1) + 3(5) − 14 = −1 + 15 − 14 = 0 ✓", GREEN_GLOW, True)
    ])
    
    # 2D Cartesian Grid (Y and Z)
    c2 = Cartesian2D(origin_px=(860, 520), scale_x=38.0, scale_y=38.0, x_min=-6, x_max=8, y_min=-1, y_max=9)
    c2.draw_grid_and_axes(d, x_label="Y", y_label="Z", step_x=2, step_y=2)
    
    # Line: z = - (1/3)y + 14/3
    c2.plot_line(d, -6, (-1/3*(-6) + 14/3), 8, (-1/3*8 + 14/3), color=GREEN_GLOW, width=4)
    
    # Key Points
    c2.plot_point(d, -1, 5, color=AMBER_GLOW, label="P(−1, 5)", label_side="top_right", radius=7)
    c2.plot_point(d, 0, 14/3, color=CYAN_GLOW, label="(0, 4.67)", label_side="bottom_left", radius=5)
    
    # Vector d_yz = (-3, 1) starting at P(-1, 5)
    c2.plot_vector(d, -1, 5, -3, 1, color=CYAN_GLOW, label="d_yz = (−3, 1)")
    
    save_and_crop(im, "07_cartesiano_2d_plano_proyectante_yz.png")

# =============================================================
# 8. EJERCICIO 4: LOS 3 PLANOS PROYECTANTES INTERSECÁNDOSE EN R³
# =============================================================
def plot_08_planos_proyectantes_interseccion_3d():
    im, d = create_transparent_canvas()
    draw_header_badge(d, 40, 30, "Ejercicio 4 · Consolidado R³", "Intersección de los Tres Planos Proyectantes",
                      "πxy: 3x+4y−2=0 (|| Z)  |  πxz: x−4z+18=0 (|| Y)  |  πyz: y+3z−14=0 (|| X)  →  Recta r")
    
    # Left Info Card
    draw_info_panel(d, [40, 130, 440, 680], "SISTEMA DE PLANOS PROYECTANTES", [
        ("Definición de Plano Proyectante:", CYAN_GLOW, True),
        ("Plano que contiene a la recta r y", TEXT_WHITE, False),
        ("es perpendicular a un plano coordenado", TEXT_WHITE, False),
        ("(paralelo al eje de la variable ausente).", TEXT_MUTED, False),
        ("", TEXT_WHITE, False),
        ("1. Plano πxy (|| Z):", CYAN_GLOW, True),
        ("3x + 4y − 2 = 0", CYAN_GLOW, False),
        ("2. Plano πxz (|| Y):", AMBER_GLOW, True),
        ("x − 4z + 18 = 0", AMBER_GLOW, False),
        ("3. Plano πyz (|| X):", GREEN_GLOW, True),
        ("y + 3z − 14 = 0", GREEN_GLOW, False),
        ("", TEXT_WHITE, False),
        ("Intersección Triple:", TEXT_WHITE, True),
        ("πxy ∩ πxz ∩ πyz = { r }", GREEN_GLOW, True),
        ("P(2, −1, 5) ∈ r", AMBER_GLOW, True),
        ("d = (4, −3, 1)", CYAN_GLOW, False),
        ("", TEXT_WHITE, False),
        ("✓ Verificación Simultánea:", GREEN_GLOW, True),
        ("El punto P(2, −1, 5) satisface las", TEXT_MUTED, False),
        ("tres ecuaciones a la vez.", GREEN_GLOW, False)
    ])
    
    # 3D Cartesian Plot
    c3 = Cartesian3D(center_px=(880, 430), scale=28.0, yaw=38.0, pitch=22.0)
    c3.draw_axes_3d(d, x_len=10, y_len=8, z_len=10)
    
    # 1. Plane pi_xy (parallel to Z) -> extruded in Z
    # 3x + 4y - 2 = 0 -> y = 0.5 - 0.75x
    p_xy_corners = [
        (-2, 2, 0),
        (6, -4, 0),
        (6, -4, 9),
        (-2, 2, 9)
    ]
    c3.plot_plane_polygon(d, p_xy_corners, fill_color=(12, 45, 65, 80), outline_color=(56, 189, 248, 140))
    
    # 2. Plane pi_xz (parallel to Y) -> extruded in Y
    # x - 4z + 18 = 0 -> x = 4z - 18
    p_xz_corners = [
        (-2, -4, 4),
        (6, -4, 6),
        (6, 4, 6),
        (-2, 4, 4)
    ]
    c3.plot_plane_polygon(d, p_xz_corners, fill_color=(45, 30, 15, 80), outline_color=(240, 179, 108, 140))
    
    # 3. Plane pi_yz (parallel to X) -> extruded in X
    # y + 3z - 14 = 0 -> y = 14 - 3z
    p_yz_corners = [
        (-2, -1, 5),
        (8, -1, 5),
        (8, -4, 6),
        (-2, -4, 6)
    ]
    c3.plot_plane_polygon(d, p_yz_corners, fill_color=(15, 45, 25, 80), outline_color=(74, 222, 128, 140))
    
    # The common intersection line r: P(2, -1, 5) + lambda * (4, -3, 1)
    pt_r0 = (2 + 4*(-1.2), -1 - 3*(-1.2), 5 + 1*(-1.2))
    pt_r1 = (2 + 4*(1.5), -1 - 3*(1.5), 5 + 1*(1.5))
    c3.plot_line_segment_3d(d, pt_r0, pt_r1, color=TEXT_WHITE, width=4)
    
    # Point P(2, -1, 5)
    c3.plot_point_3d(d, (2, -1, 5), color=AMBER_GLOW, label="P(2, −1, 5) ∈ r", label_offset=(15, -15), radius=8)
    
    save_and_crop(im, "08_cartesiano_3d_planos_proyectantes_interseccion.png")

# =============================================================
# 9. AUDITORÍA DEL ERROR DEL GRUPO EN EL PLANO CARTESIANO 3D
# =============================================================
def plot_09_auditoria_error_tp_3d():
    im, d = create_transparent_canvas()
    draw_header_badge(d, 40, 30, "Auditoría Técnica · R³", "Contraste Cartesiano: Solución Patrón vs. Error del TP",
                      "Plano π: 2x − y + z − 6 = 0  |  Punto Correcto I ∈ π  vs.  Punto Erróneo P ∉ π (Residuo = 5)")
    
    # Left Info Card
    draw_info_panel(d, [40, 130, 440, 680], "EVIDENCIA DE AUDITORÍA", [
        ("Solución Patrón Formal:", GREEN_GLOW, True),
        ("λ = 10/3 exacto", GREEN_GLOW, False),
        ("I = (9, 16/3, −20/3) ∈ r", GREEN_GLOW, False),
        ("Sustitución en π:", TEXT_WHITE, False),
        ("2(9) − 16/3 − 20/3 − 6 = 0 ✓", GREEN_GLOW, True),
        ("(Distancia al plano d = 0)", TEXT_MUTED, False),
        ("", TEXT_WHITE, False),
        ("Error Algebraico del TP (Grupo):", RED_GLOW, True),
        ("Despeje erróneo: 2λ = 10 → λ = 5", RED_GLOW, False),
        ("Punto entregado: P(14, 7, −10) ∈ r", RED_GLOW, False),
        ("", TEXT_WHITE, False),
        ("Evaluación de P en el Plano π:", RED_GLOW, True),
        ("2(14) − (7) + (−10) − 6", TEXT_MUTED, False),
        ("= 28 − 23 = 5 ≠ 0  (P ∉ π)", RED_GLOW, True),
        ("", TEXT_WHITE, False),
        ("Conclusión de Auditoría:", AMBER_GLOW, True),
        ("P está sobre la recta r pero a", TEXT_WHITE, False),
        ("distancia d = 5/√6 del plano π.", AMBER_GLOW, False)
    ])
    
    # 3D Cartesian Plot
    c3 = Cartesian3D(center_px=(880, 420), scale=22.0, yaw=30.0, pitch=22.0)
    c3.draw_axes_3d(d, x_len=16, y_len=12, z_len=12)
    
    # Plane 2x - y + z - 6 = 0
    p_corners = [
        (4, 0, -2),
        (16, 0, -26),
        (16, 12, -14),
        (4, 12, 10)
    ]
    c3.plot_plane_polygon(d, p_corners, fill_color=(14, 48, 64, 120), outline_color=(56, 189, 248, 180))
    
    # Line r through P0(-1, 2, 0)
    # from lambda = 2 to lambda = 6
    pt_r0 = (-1 + 3*(2.5), 2 + 1*(2.5), -2*(2.5))
    pt_r1 = (-1 + 3*(5.5), 2 + 1*(5.5), -2*(5.5))
    c3.plot_line_segment_3d(d, pt_r0, pt_r1, color=AMBER_GLOW, width=4)
    
    # Correct intersection point I(9, 16/3, -20/3) [lambda = 10/3 = 3.33]
    I_pt = (9, 16/3, -20/3)
    c3.plot_point_3d(d, I_pt, color=GREEN_GLOW, label="I(9, 5.33, −6.67) ∈ π [CORRECTO]", label_offset=(15, -15), radius=8)
    
    # Erroneous point P(14, 7, -10) [lambda = 5]
    P_err = (14, 7, -10)
    c3.plot_point_3d(d, P_err, color=RED_GLOW, label="P(14, 7, −10) ∉ π [ERROR TP: Residuo=5]", label_offset=(15, -15), radius=8)
    
    # Error offset line from P_err to its true projection on plane
    # Normal is (2, -1, 1), |n|^2 = 6, distance = 5/sqrt(6)
    proj_P = (14 - 2*(5/6), 7 - (-1)*(5/6), -10 - 1*(5/6))
    c3.plot_line_segment_3d(d, P_err, proj_P, color=RED_GLOW, width=2)
    
    p_err_px = c3.project(*P_err)
    d.text((p_err_px[0] - 120, p_err_px[1] + 20), "d(P, π) = 5/√6 ≠ 0", font=get_font("mono", 12, bold=True), fill=RED_GLOW)
    
    save_and_crop(im, "09_auditoria_error_tp_3d.png")

def generate_all_cartesian_plots():
    print("Generating all Cartesian Plane plots in:", OUT_DIR)
    plot_01_interseccion_3d()
    plot_02_angulo_recta_plano_3d()
    plot_03_parametro_m_paralelo_3d()
    plot_04_parametro_m_incompatible_3d()
    plot_05_plano_proyectante_xy_2d()
    plot_06_plano_proyectante_xz_2d()
    plot_07_plano_proyectante_yz_2d()
    plot_08_planos_proyectantes_interseccion_3d()
    plot_09_auditoria_error_tp_3d()
    print("All Cartesian plots successfully generated!")

if __name__ == "__main__":
    generate_all_cartesian_plots()

