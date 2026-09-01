# -*- coding: utf-8 -*-
from __future__ import annotations

import math
import os
from pathlib import Path
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
from mpl_toolkits.mplot3d.art3d import Poly3DCollection
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "procedimiento_imagenes" / "planos_cartesianos"
OUT_DIR.mkdir(parents=True, exist_ok=True)
CROP_DIR = OUT_DIR / "recortadas"
CROP_DIR.mkdir(parents=True, exist_ok=True)

# Color Scheme matching project aesthetic
COLOR_BG = (0.02, 0.06, 0.08, 0.0)       # Transparent
PANEL_BG = "#081b24"
CYAN = "#38bdf8"
CYAN_LINE = "#75d3c0"
AMBER = "#f0b36c"
GREEN = "#4ade80"
RED = "#f87171"
WHITE = "#f4f8f6"
MUTED = "#a0b9b6"
GRID_COLOR = "#1c4458"
AXIS_COLOR = "#38bdf8"

def apply_dark_3d_style(ax: Axes3D, x_lim, y_lim, z_lim, title=""):
    ax.set_facecolor((0.03, 0.09, 0.12, 0.85))
    ax.figure.patch.set_facecolor((0.0, 0.0, 0.0, 0.0))
    
    ax.set_xlim(x_lim)
    ax.set_ylim(y_lim)
    ax.set_zlim(z_lim)
    
    # Labels with clear bold formatting
    ax.set_xlabel("Eje X", color=CYAN, fontsize=12, fontweight="bold", labelpad=10)
    ax.set_ylabel("Eje Y", color=CYAN, fontsize=12, fontweight="bold", labelpad=10)
    ax.set_zlabel("Eje Z", color=CYAN, fontsize=12, fontweight="bold", labelpad=10)
    
    # Tick colors
    ax.tick_params(colors=MUTED, labelsize=9)
    for t in ax.xaxis.get_major_ticks():
        t.label1.set_color(MUTED)
    for t in ax.yaxis.get_major_ticks():
        t.label1.set_color(MUTED)
    for t in ax.zaxis.get_major_ticks():
        t.label1.set_color(MUTED)
        
    # Panes (Walls of 3D box)
    ax.xaxis.pane.fill = True
    ax.yaxis.pane.fill = True
    ax.zaxis.pane.fill = True
    ax.xaxis.pane.set_facecolor((0.03, 0.08, 0.11, 0.6))
    ax.yaxis.pane.set_facecolor((0.02, 0.07, 0.10, 0.6))
    ax.zaxis.pane.set_facecolor((0.04, 0.09, 0.13, 0.6))
    
    ax.xaxis.pane.set_edgecolor(GRID_COLOR)
    ax.yaxis.pane.set_edgecolor(GRID_COLOR)
    ax.zaxis.pane.set_edgecolor(GRID_COLOR)
    
    ax.grid(True, linestyle="--", alpha=0.35, color=CYAN_LINE)

def crop_and_save(fig, filename):
    temp_path = OUT_DIR / filename
    fig.savefig(temp_path, dpi=200, bbox_inches="tight", transparent=True)
    plt.close(fig)
    
    # Now load with PIL and create a tight crop in recortadas
    im = Image.open(temp_path)
    bbox = im.getbbox()
    if bbox:
        pad = 12
        b_pad = (max(0, bbox[0] - pad), max(0, bbox[1] - pad), min(im.width, bbox[2] + pad), min(im.height, bbox[3] + pad))
        cropped = im.crop(b_pad)
        cropped.save(CROP_DIR / filename)
    print(f"Generated GeoGebra 3D plot: {filename}")

# -------------------------------------------------------------
# 1. EJERCICIO 1: INTERSECCIÓN RECTA-PLANO EN R³
# -------------------------------------------------------------
def plot_01_interseccion_geogebra():
    fig = plt.figure(figsize=(10, 8))
    ax = fig.add_subplot(111, projection="3d")
    
    # Plane pi: 2x - y + z - 6 = 0 -> z = 6 - 2x + y
    x_range = np.linspace(-2, 12, 30)
    y_range = np.linspace(-2, 10, 30)
    X, Y = np.meshgrid(x_range, y_range)
    Z = 6 - 2*X + Y
    
    # Clip Z to reasonable limits [-15, 15] for visual cleanliness
    Z_clipped = np.where((Z >= -14) & (Z <= 12), Z, np.nan)
    
    # Plot translucent plane surface
    surf = ax.plot_surface(X, Y, Z_clipped, color="#0284c7", alpha=0.35, edgecolor="#38bdf8", lw=0.3, antialiased=True)
    
    # Line r: x = -1 + 3λ, y = 2 + λ, z = -2λ
    lambdas = np.linspace(-1, 5, 100)
    rx = -1 + 3*lambdas
    ry = 2 + lambdas
    rz = -2*lambdas
    ax.plot(rx, ry, rz, color=AMBER, lw=3.5, label=r"Recta $r: (-1+3\lambda, 2+\lambda, -2\lambda)$")
    
    # Base Point P0(-1, 2, 0)
    ax.scatter([-1], [2], [0], color=AMBER, s=80, edgecolors=WHITE, lw=1.5, zorder=10)
    ax.text(-1, 2, 1.5, r"$P_0(-1, 2, 0)$", color=AMBER, fontsize=11, fontweight="bold")
    
    # Intersection Point I(9, 16/3, -20/3) = (9, 5.33, -6.67)
    ix, iy, iz = 9, 16/3, -20/3
    ax.scatter([ix], [iy], [iz], color=GREEN, s=150, edgecolors=WHITE, lw=2, zorder=15)
    ax.text(ix + 0.5, iy + 0.5, iz + 1.2, r"$\mathbf{I(9,\ \frac{16}{3},\ -\frac{20}{3})\ \in\ \pi \cap r}$",
            color=GREEN, fontsize=12, fontweight="bold",
            bbox=dict(boxstyle="round,pad=0.3", facecolor=PANEL_BG, edgecolor=GREEN, alpha=0.9))
    
    # Drop lines from I to coordinate planes for visual spatial perception
    ax.plot([ix, ix], [iy, iy], [iz, 0], color=GREEN, linestyle=":", lw=1.5, alpha=0.7)
    ax.plot([ix, ix], [iy, 0], [0, 0], color=GREEN, linestyle=":", lw=1.2, alpha=0.7)
    ax.plot([ix, 0], [0, 0], [0, 0], color=GREEN, linestyle=":", lw=1.2, alpha=0.7)
    
    # Normal Vector n=(2, -1, 1) anchored at plane center (4, 4, -2)
    px_c, py_c, pz_c = 4, 4, (6 - 2*4 + 4)
    ax.quiver(px_c, py_c, pz_c, 2*1.8, -1*1.8, 1*1.8, color=CYAN, lw=2.5, arrow_length_ratio=0.25)
    ax.text(px_c + 2*1.8, py_c - 1*1.8, pz_c + 1*1.8 + 1, r"$\vec{n} = (2, -1, 1)$", color=CYAN, fontsize=11, fontweight="bold")
    
    apply_dark_3d_style(ax, [-3, 13], [-3, 11], [-15, 13])
    ax.view_init(elev=22, azim=38)
    
    # Title badge in 2D
    ax.text2D(0.02, 0.95, r"PLANO $\pi: 2x - y + z - 6 = 0$  $\cap$  RECTA $r$", transform=ax.transAxes,
              color=WHITE, fontsize=14, fontweight="bold",
              bbox=dict(boxstyle="round,pad=0.4", facecolor=PANEL_BG, edgecolor=CYAN, lw=1.2, alpha=0.95))
    ax.text2D(0.02, 0.89, r"Verificación: $2(9) - (16/3) + (-20/3) - 6 = 0$  ✓", transform=ax.transAxes,
              color=GREEN, fontsize=11, fontweight="bold")
    
    crop_and_save(fig, "01_cartesiano_interseccion_3d.png")

# -------------------------------------------------------------
# 2. EJERCICIO 2: ÁNGULO RECTA-PLANO EN R³
# -------------------------------------------------------------
def plot_02_angulo_geogebra():
    fig = plt.figure(figsize=(10, 8))
    ax = fig.add_subplot(111, projection="3d")
    
    # Plane through origin with normal n=(1, -2, 2): x - 2y + 2z = 0 -> z = y - 0.5x
    x_range = np.linspace(-4, 5, 20)
    y_range = np.linspace(-4, 5, 20)
    X, Y = np.meshgrid(x_range, y_range)
    Z = Y - 0.5*X
    
    ax.plot_surface(X, Y, Z, color="#0369a1", alpha=0.35, edgecolor="#38bdf8", lw=0.3, antialiased=True)
    
    # Origin
    ax.scatter([0], [0], [0], color=WHITE, s=60, zorder=10)
    
    # Normal Vector n=(1, -2, 2)
    ax.quiver(0, 0, 0, 1, -2, 2, color=CYAN, lw=3.5, arrow_length_ratio=0.15)
    ax.text(1.1, -2.1, 2.2, r"$\vec{n} = (1, -2, 2)$ [Normal al Plano]", color=CYAN, fontsize=11, fontweight="bold")
    
    # Direction Vector d=(1, 2, 2)
    ax.quiver(0, 0, 0, 1, 2, 2, color=AMBER, lw=3.5, arrow_length_ratio=0.15)
    ax.text(1.1, 2.1, 2.2, r"$\vec{d} = (1, 2, 2)$ [Vector Director]", color=AMBER, fontsize=11, fontweight="bold")
    
    # Projected Vector d_proj on plane: (8/9, 20/9, 16/9) ≈ (0.89, 2.22, 1.78)
    d_px, d_py, d_pz = 8/9, 20/9, 16/9
    ax.quiver(0, 0, 0, d_px, d_py, d_pz, color=GREEN, lw=3, arrow_length_ratio=0.15)
    ax.text(d_px + 0.2, d_py + 0.2, d_pz - 0.3, r"$\vec{d}_{\parallel}$ [Proyección en $\pi$]", color=GREEN, fontsize=11, fontweight="bold")
    
    # Perpendicular drop line between d and d_proj
    ax.plot([1, d_px], [2, d_py], [2, d_pz], color=RED, lw=2, linestyle="--")
    
    apply_dark_3d_style(ax, [-4, 5], [-4, 5], [-4, 5])
    ax.view_init(elev=20, azim=45)
    
    ax.text2D(0.02, 0.95, r"GEOMETRÍA DEL ÁNGULO: $\vec{d}=(1,2,2)$ Y $\vec{n}=(1,-2,2)$", transform=ax.transAxes,
              color=WHITE, fontsize=14, fontweight="bold",
              bbox=dict(boxstyle="round,pad=0.4", facecolor=PANEL_BG, edgecolor=CYAN, lw=1.2, alpha=0.95))
    ax.text2D(0.02, 0.89, r"$\cos\beta = \frac{1}{9} \rightarrow \beta \approx 83,62^\circ$ (con la Normal)", transform=ax.transAxes,
              color=CYAN, fontsize=11, fontweight="bold")
    ax.text2D(0.02, 0.83, r"$\sin\alpha = \frac{1}{9} \rightarrow \alpha \approx 6,38^\circ = 6^\circ 22' 46''$ (con el Plano $\pi$)", transform=ax.transAxes,
              color=GREEN, fontsize=11, fontweight="bold")
    
    crop_and_save(fig, "02_cartesiano_angulo_recta_plano_3d.png")

# -------------------------------------------------------------
# 3. EJERCICIO 3: PARÁMETRO m (CASO PARALELO / ORTOGONAL)
# -------------------------------------------------------------
def plot_03_parametro_m_paralelo_geogebra():
    fig = plt.figure(figsize=(10, 8))
    ax = fig.add_subplot(111, projection="3d")
    
    # Plane 3x + y - 2z = 0 -> y = 2z - 3x
    x_range = np.linspace(-3, 4, 20)
    z_range = np.linspace(-2, 5, 20)
    X, Z = np.meshgrid(x_range, z_range)
    Y = 2*Z - 3*X
    
    # Clip Y to [-8, 8]
    Y_clipped = np.where((Y >= -8) & (Y <= 8), Y, np.nan)
    ax.plot_surface(X, Y_clipped, Z, color="#065f46", alpha=0.35, edgecolor="#4ade80", lw=0.3, antialiased=True)
    
    # Normal Vector n=(3, 1, -2)
    ax.quiver(0, 0, 0, 3, 1, -2, color=CYAN, lw=3.5, arrow_length_ratio=0.15)
    ax.text(3.1, 1.1, -2.1, r"$\vec{n} = (3, 1, -2)$ [Normal]", color=CYAN, fontsize=11, fontweight="bold")
    
    # Direction Vector d=(2/3, 6, 4) for m = 2/3 (in plane since d.n = 0)
    ax.quiver(0, 0, 0, 2/3, 6, 4, color=GREEN, lw=3.5, arrow_length_ratio=0.15)
    ax.text(0.8, 6.1, 4.1, r"$\vec{d} = (\frac{2}{3}, 6, 4)$  [$r \parallel \pi$]", color=GREEN, fontsize=12, fontweight="bold")
    
    apply_dark_3d_style(ax, [-3, 5], [-8, 8], [-4, 6])
    ax.view_init(elev=24, azim=40)
    
    ax.text2D(0.02, 0.95, r"CASO 3.a: RECTA PARALELA AL PLANO ($m = 2/3$)", transform=ax.transAxes,
              color=WHITE, fontsize=14, fontweight="bold",
              bbox=dict(boxstyle="round,pad=0.4", facecolor=PANEL_BG, edgecolor=GREEN, lw=1.2, alpha=0.95))
    ax.text2D(0.02, 0.89, r"Condición: $\vec{d} \cdot \vec{n} = 3(\frac{2}{3}) + 6(1) + 4(-2) = 2 + 6 - 8 = 0$  ✓", transform=ax.transAxes,
              color=GREEN, fontsize=11, fontweight="bold")
    
    crop_and_save(fig, "03_cartesiano_parametro_m_paralelo_3d.png")

# -------------------------------------------------------------
# 4. EJERCICIO 3: PARÁMETRO m (CASO PERPENDICULAR / INCOMPATIBLE)
# -------------------------------------------------------------
def plot_04_parametro_m_incompatible_geogebra():
    fig = plt.figure(figsize=(10, 8))
    ax = fig.add_subplot(111, projection="3d")
    
    # Normal vector n = (3, 1, -2)
    ax.quiver(0, 0, 0, 3, 1, -2, color=CYAN, lw=3.5, arrow_length_ratio=0.15)
    ax.text(3.1, 1.1, -2.1, r"$\vec{n} = (3, 1, -2)$ [Normal al Plano $\pi$]", color=CYAN, fontsize=11, fontweight="bold")
    
    # Target collinear vector if k=6 -> (18, 6, -12) scaled down to k=1.5 -> (4.5, 1.5, -3)
    ax.plot([0, 6], [0, 2], [0, -4], color=CYAN, linestyle="--", lw=2, label="Dirección de la Normal")
    
    # Candidate vector d=(m, 6, 4) with dy=6, dz=4 -> for m=2: (2, 6, 4)
    ax.quiver(0, 0, 0, 2, 6, 4, color=RED, lw=3.5, arrow_length_ratio=0.15)
    ax.text(2.1, 6.1, 4.1, r"$\vec{d} = (m, 6, 4)$ [Discrepancia $d_z = +4$ vs $n_z = -2$]", color=RED, fontsize=11, fontweight="bold")
    
    apply_dark_3d_style(ax, [-2, 8], [-2, 8], [-6, 6])
    ax.view_init(elev=20, azim=48)
    
    ax.text2D(0.02, 0.95, r"CASO 3.b: DEMOSTRACIÓN DE INCOMPATIBILIDAD ($\nexists m \in \mathbb{R}$)", transform=ax.transAxes,
              color=WHITE, fontsize=14, fontweight="bold",
              bbox=dict(boxstyle="round,pad=0.4", facecolor=PANEL_BG, edgecolor=RED, lw=1.2, alpha=0.95))
    ax.text2D(0.02, 0.89, r"Razones escalares: $\frac{6}{1} \neq \frac{4}{-2} \rightarrow 6 \neq -2$ (Contradicción)", transform=ax.transAxes,
              color=RED, fontsize=11, fontweight="bold")
    ax.text2D(0.02, 0.83, r"Conclusión: Es imposible que $r \perp \pi$ para cualquier valor de $m \rightarrow S = \emptyset$", transform=ax.transAxes,
              color=WHITE, fontsize=11)
    
    crop_and_save(fig, "04_cartesiano_parametro_m_incompatible_3d.png")

# -------------------------------------------------------------
# 5. EJERCICIO 4: LOS 3 PLANOS PROYECTANTES EN R³
# -------------------------------------------------------------
def plot_08_planos_proyectantes_geogebra():
    fig = plt.figure(figsize=(10, 8))
    ax = fig.add_subplot(111, projection="3d")
    
    # 1. Plane pi_xy: 3x + 4y - 2 = 0 -> y = 0.5 - 0.75x (extruded in Z from 0 to 9)
    px = np.array([-2, 6, 6, -2])
    py = 0.5 - 0.75*px
    pz_low = np.array([0, 0, 9, 9])
    
    verts_xy = [list(zip(px, py, pz_low))]
    poly_xy = Poly3DCollection(verts_xy, color="#0284c7", alpha=0.3, edgecolor="#38bdf8", lw=1.5)
    ax.add_collection3d(poly_xy)
    
    # 2. Plane pi_xz: x - 4z + 18 = 0 -> x = 4z - 18 (extruded in Y from -5 to 4)
    pz = np.array([3, 7, 7, 3])
    px_xz = 4*pz - 18
    py_xz_low = np.array([-5, -5, 4, 4])
    verts_xz = [list(zip(px_xz, py_xz_low, pz))]
    poly_xz = Poly3DCollection(verts_xz, color="#d97706", alpha=0.3, edgecolor="#f0b36c", lw=1.5)
    ax.add_collection3d(poly_xz)
    
    # 3. Plane pi_yz: y + 3z - 14 = 0 -> y = 14 - 3z (extruded in X from -2 to 8)
    pz_yz = np.array([3, 7, 7, 3])
    py_yz = 14 - 3*pz_yz
    px_yz_low = np.array([-2, -2, 8, 8])
    verts_yz = [list(zip(px_yz_low, py_yz, pz_yz))]
    poly_yz = Poly3DCollection(verts_yz, color="#059669", alpha=0.3, edgecolor="#4ade80", lw=1.5)
    ax.add_collection3d(poly_yz)
    
    # The common intersection line r: P(2, -1, 5) + lambda * (4, -3, 1)
    lambdas = np.linspace(-1.2, 1.5, 100)
    rx = 2 + 4*lambdas
    ry = -1 - 3*lambdas
    rz = 5 + 1*lambdas
    ax.plot(rx, ry, rz, color=WHITE, lw=4, label="Recta r (Intersección Triple)")
    
    # Point P(2, -1, 5)
    ax.scatter([2], [-1], [5], color=AMBER, s=160, edgecolors=WHITE, lw=2, zorder=20)
    ax.text(2.3, -0.8, 5.4, r"$\mathbf{P(2, -1, 5) \in \pi_{xy} \cap \pi_{xz} \cap \pi_{yz}}$",
            color=AMBER, fontsize=12, fontweight="bold",
            bbox=dict(boxstyle="round,pad=0.3", facecolor=PANEL_BG, edgecolor=AMBER, alpha=0.9))
    
    apply_dark_3d_style(ax, [-3, 9], [-6, 5], [1, 9])
    ax.view_init(elev=24, azim=42)
    
    ax.text2D(0.02, 0.95, "INTERSECCIÓN DE LOS 3 PLANOS PROYECTANTES", transform=ax.transAxes,
              color=WHITE, fontsize=14, fontweight="bold",
              bbox=dict(boxstyle="round,pad=0.4", facecolor=PANEL_BG, edgecolor=CYAN, lw=1.2, alpha=0.95))
    ax.text2D(0.02, 0.89, r"$\pi_{xy}: 3x+4y-2=0$  |  $\pi_{xz}: x-4z+18=0$  |  $\pi_{yz}: y+3z-14=0$", transform=ax.transAxes,
              color=CYAN_LINE, fontsize=11, fontweight="bold")
    
    crop_and_save(fig, "08_cartesiano_3d_planos_proyectantes_interseccion.png")

# -------------------------------------------------------------
# 6. AUDITORÍA DEL ERROR DEL GRUPO EN R³
# -------------------------------------------------------------
def plot_09_auditoria_error_geogebra():
    fig = plt.figure(figsize=(10, 8))
    ax = fig.add_subplot(111, projection="3d")
    
    # Plane 2x - y + z - 6 = 0 -> z = 6 - 2x + y
    x_range = np.linspace(2, 16, 25)
    y_range = np.linspace(0, 10, 25)
    X, Y = np.meshgrid(x_range, y_range)
    Z = 6 - 2*X + Y
    
    Z_clipped = np.where((Z >= -24) & (Z <= 6), Z, np.nan)
    ax.plot_surface(X, Y, Z_clipped, color="#0284c7", alpha=0.3, edgecolor="#38bdf8", lw=0.3, antialiased=True)
    
    # Line r through P0(-1, 2, 0)
    lambdas = np.linspace(2.2, 5.8, 100)
    rx = -1 + 3*lambdas
    ry = 2 + lambdas
    rz = -2*lambdas
    ax.plot(rx, ry, rz, color=AMBER, lw=3.5, label="Recta r")
    
    # Correct Point I(9, 16/3, -20/3) [lambda = 10/3]
    ix, iy, iz = 9, 16/3, -20/3
    ax.scatter([ix], [iy], [iz], color=GREEN, s=150, edgecolors=WHITE, lw=2, zorder=20)
    ax.text(ix + 0.6, iy, iz + 1.2, r"$\mathbf{I(9,\ 5.33,\ -6.67) \in \pi}$ [CORRECTO]",
            color=GREEN, fontsize=11, fontweight="bold",
            bbox=dict(boxstyle="round,pad=0.3", facecolor=PANEL_BG, edgecolor=GREEN, alpha=0.9))
    
    # Erroneous Point P(14, 7, -10) [lambda = 5]
    px_e, py_e, pz_e = 14, 7, -10
    ax.scatter([px_e], [py_e], [pz_e], color=RED, s=150, edgecolors=WHITE, lw=2, zorder=20)
    ax.text(px_e + 0.6, py_e, pz_e + 1.2, r"$\mathbf{P(14, 7, -10) \notin \pi}$ [ERROR TP: Residuo=5]",
            color=RED, fontsize=11, fontweight="bold",
            bbox=dict(boxstyle="round,pad=0.3", facecolor=PANEL_BG, edgecolor=RED, alpha=0.9))
    
    # Orthogonal projection of P onto plane
    # 2(14) - 7 - 10 - 6 = 5. Normal is (2, -1, 1), |n|^2 = 6
    proj_x = 14 - 2*(5/6)
    proj_y = 7 - (-1)*(5/6)
    proj_z = -10 - 1*(5/6)
    ax.plot([px_e, proj_x], [py_e, proj_y], [pz_e, proj_z], color=RED, lw=2.5, linestyle="--")
    ax.scatter([proj_x], [proj_y], [proj_z], color=CYAN, s=50)
    
    apply_dark_3d_style(ax, [2, 17], [-1, 11], [-22, 4])
    ax.view_init(elev=20, azim=32)
    
    ax.text2D(0.02, 0.95, "AUDITORÍA CARTESIANA: PUNTO CORRECTO vs. ERROR DEL GRUPO", transform=ax.transAxes,
              color=WHITE, fontsize=14, fontweight="bold",
              bbox=dict(boxstyle="round,pad=0.4", facecolor=PANEL_BG, edgecolor=CYAN, lw=1.2, alpha=0.95))
    ax.text2D(0.02, 0.89, r"Sustitución en $\pi$: $2(14) - 7 - 10 - 6 = 5 \neq 0 \rightarrow$ Distancia al plano $d = \frac{5}{\sqrt{6}} \neq 0$", transform=ax.transAxes,
              color=RED, fontsize=11, fontweight="bold")
    
    crop_and_save(fig, "09_auditoria_error_tp_3d.png")

def apply_dark_2d_style(ax, x_lim, y_lim, x_label="Eje X", y_label="Eje Y"):
    ax.set_facecolor((0.03, 0.09, 0.12, 0.85))
    ax.figure.patch.set_facecolor((0.0, 0.0, 0.0, 0.0))
    
    ax.set_xlim(x_lim)
    ax.set_ylim(y_lim)
    
    ax.set_xlabel(x_label, color=CYAN, fontsize=12, fontweight="bold", labelpad=8)
    ax.set_ylabel(y_label, color=CYAN, fontsize=12, fontweight="bold", labelpad=8)
    
    ax.tick_params(colors=MUTED, labelsize=9)
    ax.axhline(0, color=AXIS_COLOR, lw=1.5, zorder=3)
    ax.axvline(0, color=AXIS_COLOR, lw=1.5, zorder=3)
    
    for spine in ax.spines.values():
        spine.set_color(GRID_COLOR)
        
    ax.grid(True, linestyle="--", alpha=0.35, color=CYAN_LINE, zorder=1)

# -------------------------------------------------------------
# 5. EJERCICIO 4: PLANO PROYECTANTE πxy EN 2D (XY)
# -------------------------------------------------------------
def plot_05_plano_proyectante_xy_geogebra():
    fig, ax = plt.subplots(figsize=(10, 7))
    
    # 3x + 4y - 2 = 0 -> y = -0.75x + 0.5
    xs = np.linspace(-4, 6, 100)
    ys = -0.75*xs + 0.5
    ax.plot(xs, ys, color=CYAN, lw=3.5, label=r"$\pi_{xy}: 3x + 4y - 2 = 0$", zorder=5)
    
    # Point of passage P(2, -1)
    ax.scatter([2], [-1], color=AMBER, s=140, edgecolors=WHITE, lw=2, zorder=10)
    ax.text(2.2, -0.8, r"$\mathbf{P(2, -1)}$", color=AMBER, fontsize=12, fontweight="bold")
    
    # Intercepts
    ax.scatter([0, 2/3], [0.5, 0], color=GREEN, s=70, edgecolors=WHITE, lw=1.5, zorder=10)
    ax.text(0.15, 0.65, r"$(0, 0.5)$", color=GREEN, fontsize=10)
    ax.text(2/3 + 0.1, -0.4, r"$(\frac{2}{3}, 0)$", color=GREEN, fontsize=10)
    
    # Direction Vector d_xy = (4, -3)
    ax.quiver(2, -1, 4*0.6, -3*0.6, angles='xy', scale_units='xy', scale=1, color=GREEN, width=0.007, zorder=8)
    ax.text(3.5, -2.4, r"$\vec{d}_{xy} = (4, -3)$", color=GREEN, fontsize=11, fontweight="bold")
    
    apply_dark_2d_style(ax, [-4, 6], [-4, 4], x_label="Eje X", y_label="Eje Y")
    
    ax.text(0.03, 0.93, r"PLANO PROYECTANTE $\pi_{xy}: 3x + 4y - 2 = 0$ (Paralelo a Z)", transform=ax.transAxes,
            color=WHITE, fontsize=13, fontweight="bold",
            bbox=dict(boxstyle="round,pad=0.4", facecolor=PANEL_BG, edgecolor=CYAN, lw=1.2, alpha=0.95))
    ax.text(0.03, 0.86, r"Pendiente $m = -\frac{3}{4} = -0,75$  |  Verificación $P(2,-1)$: $3(2)+4(-1)-2=0$ ✓", transform=ax.transAxes,
            color=GREEN, fontsize=10, fontweight="bold")
    
    crop_and_save(fig, "05_cartesiano_2d_plano_proyectante_xy.png")

# -------------------------------------------------------------
# 6. EJERCICIO 4: PLANO PROYECTANTE πxz EN 2D (XZ)
# -------------------------------------------------------------
def plot_06_plano_proyectante_xz_geogebra():
    fig, ax = plt.subplots(figsize=(10, 7))
    
    # x - 4z + 18 = 0 -> z = 0.25x + 4.5
    xs = np.linspace(-6, 8, 100)
    zs = 0.25*xs + 4.5
    ax.plot(xs, zs, color=AMBER, lw=3.5, label=r"$\pi_{xz}: x - 4z + 18 = 0$", zorder=5)
    
    # Point of passage P(2, 5)
    ax.scatter([2], [5], color=GREEN, s=140, edgecolors=WHITE, lw=2, zorder=10)
    ax.text(2.2, 5.2, r"$\mathbf{P(2, 5)}$", color=GREEN, fontsize=12, fontweight="bold")
    
    # Z-intercept (0, 4.5)
    ax.scatter([0], [4.5], color=CYAN, s=70, edgecolors=WHITE, lw=1.5, zorder=10)
    ax.text(0.2, 4.2, r"$(0, 4.5)$", color=CYAN, fontsize=10)
    
    # Direction Vector d_xz = (4, 1)
    ax.quiver(2, 5, 4*0.8, 1*0.8, angles='xy', scale_units='xy', scale=1, color=CYAN, width=0.007, zorder=8)
    ax.text(4.2, 5.8, r"$\vec{d}_{xz} = (4, 1)$", color=CYAN, fontsize=11, fontweight="bold")
    
    apply_dark_2d_style(ax, [-6, 8], [-1, 9], x_label="Eje X", y_label="Eje Z")
    
    ax.text(0.03, 0.93, r"PLANO PROYECTANTE $\pi_{xz}: x - 4z + 18 = 0$ (Paralelo a Y)", transform=ax.transAxes,
            color=WHITE, fontsize=13, fontweight="bold",
            bbox=dict(boxstyle="round,pad=0.4", facecolor=PANEL_BG, edgecolor=AMBER, lw=1.2, alpha=0.95))
    ax.text(0.03, 0.86, r"Control Crítico del Signo: $+18$ (Auditado)  |  $2 - 4(5) + 18 = 0$ ✓", transform=ax.transAxes,
            color=AMBER, fontsize=10, fontweight="bold")
    
    crop_and_save(fig, "06_cartesiano_2d_plano_proyectante_xz.png")

# -------------------------------------------------------------
# 7. EJERCICIO 4: PLANO PROYECTANTE πyz EN 2D (YZ)
# -------------------------------------------------------------
def plot_07_plano_proyectante_yz_geogebra():
    fig, ax = plt.subplots(figsize=(10, 7))
    
    # y + 3z - 14 = 0 -> z = - (1/3)y + 14/3 ≈ -0.33y + 4.67
    ys = np.linspace(-6, 8, 100)
    zs = -(1/3)*ys + 14/3
    ax.plot(ys, zs, color=GREEN, lw=3.5, label=r"$\pi_{yz}: y + 3z - 14 = 0$", zorder=5)
    
    # Point of passage P(-1, 5)
    ax.scatter([-1], [5], color=AMBER, s=140, edgecolors=WHITE, lw=2, zorder=10)
    ax.text(-0.8, 5.2, r"$\mathbf{P(-1, 5)}$", color=AMBER, fontsize=12, fontweight="bold")
    
    # Z-intercept (0, 14/3)
    ax.scatter([0], [14/3], color=CYAN, s=70, edgecolors=WHITE, lw=1.5, zorder=10)
    ax.text(0.2, 4.3, r"$(0, 4.67)$", color=CYAN, fontsize=10)
    
    # Direction Vector d_yz = (-3, 1)
    ax.quiver(-1, 5, -3*0.8, 1*0.8, angles='xy', scale_units='xy', scale=1, color=CYAN, width=0.007, zorder=8)
    ax.text(-3.2, 5.8, r"$\vec{d}_{yz} = (-3, 1)$", color=CYAN, fontsize=11, fontweight="bold")
    
    apply_dark_2d_style(ax, [-6, 8], [-1, 9], x_label="Eje Y", y_label="Eje Z")
    
    ax.text(0.03, 0.93, r"PLANO PROYECTANTE $\pi_{yz}: y + 3z - 14 = 0$ (Paralelo a X)", transform=ax.transAxes,
            color=WHITE, fontsize=13, fontweight="bold",
            bbox=dict(boxstyle="round,pad=0.4", facecolor=PANEL_BG, edgecolor=GREEN, lw=1.2, alpha=0.95))
    ax.text(0.03, 0.86, r"Pendiente $m = -\frac{1}{3} \approx -0,33$  |  $(-1) + 3(5) - 14 = 0$ ✓", transform=ax.transAxes,
            color=GREEN, fontsize=10, fontweight="bold")
    
    crop_and_save(fig, "07_cartesiano_2d_plano_proyectante_yz.png")

def generate_all_geogebra_plots():
    print("Generating authentic GeoGebra-style 3D and 2D mathematical plots...")
    plot_01_interseccion_geogebra()
    plot_02_angulo_geogebra()
    plot_03_parametro_m_paralelo_geogebra()
    plot_04_parametro_m_incompatible_geogebra()
    plot_05_plano_proyectante_xy_geogebra()
    plot_06_plano_proyectante_xz_geogebra()
    plot_07_plano_proyectante_yz_geogebra()
    plot_08_planos_proyectantes_geogebra()
    plot_09_auditoria_error_geogebra()
    print("All GeoGebra-style 2D and 3D plots successfully generated!")

if __name__ == "__main__":
    generate_all_geogebra_plots()


