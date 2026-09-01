import { gsap } from "gsap";

export class ProcedimientoView {
  constructor(options) {
    this.layerEl = options.layerEl;
    this.gridEl = options.gridEl;
    this.scenes = options.scenes;
    this.slides = options.slides;

    this.procDomItems = [];
    this.procDomSurfaces = [];
    this.currentSceneIndex = 0;
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  renderScene(index) {
    if (!this.layerEl || !this.gridEl) return;
    this.currentSceneIndex = index;
    const scene = this.scenes[index] || this.scenes[0];

    this.procDomItems.forEach(item => gsap.killTweensOf(item));
    this.procDomSurfaces.forEach(surface => gsap.killTweensOf(surface));

    this.gridEl.className = `procedimiento-grid ${scene.layout || "grid-s1"}`;
    this.gridEl.innerHTML = "";
    this.procDomItems = [];
    this.procDomSurfaces = [];

    scene.items.forEach((itemDef, itemIdx) => {
      const itemEl = document.createElement("div");
      itemEl.className = `proc-item${itemDef.className ? ` ${itemDef.className}` : ""}`;
      itemEl.dataset.itemId = itemDef.id;
      itemEl.dataset.itemIndex = String(itemIdx);
      itemEl.tabIndex = 0;
      itemEl.setAttribute("role", "img");
      itemEl.setAttribute("aria-label", itemDef.label);

      itemEl.innerHTML = `
        <div class="proc-card-surface">
          <img class="proc-card-img" src="./cards/${itemDef.cardFile}" alt="${itemDef.label}" draggable="false" />
          <div class="proc-spotlight-frame" aria-hidden="true">
            <span class="spotlight-bracket top-left"></span>
            <span class="spotlight-bracket top-right"></span>
            <span class="spotlight-bracket bottom-left"></span>
            <span class="spotlight-bracket bottom-right"></span>
          </div>
        </div>
      `;

      itemEl._dragX = 0;
      itemEl._dragY = 0;
      let isDragging = false;
      let startX = 0, startY = 0, originX = 0, originY = 0;

      itemEl.addEventListener("pointerdown", e => {
        e.stopPropagation();
        isDragging = true;
        itemEl.classList.add("is-dragging");
        itemEl.setPointerCapture?.(e.pointerId);
        startX = e.clientX;
        startY = e.clientY;
        originX = itemEl._dragX || 0;
        originY = itemEl._dragY || 0;
      });

      itemEl.addEventListener("pointermove", e => {
        if (!isDragging) return;
        itemEl._dragX = originX + (e.clientX - startX);
        itemEl._dragY = originY + (e.clientY - startY);
        gsap.to(itemEl, {
          x: itemEl._dragX,
          y: itemEl._dragY,
          duration: 0.1,
          ease: "power1.out",
          overwrite: "auto"
        });
      });

      const endDrag = e => {
        if (!isDragging) return;
        isDragging = false;
        itemEl.classList.remove("is-dragging");
        itemEl.releasePointerCapture?.(e.pointerId);
      };
      itemEl.addEventListener("pointerup", endDrag);
      itemEl.addEventListener("pointercancel", endDrag);

      const surfaceEl = itemEl.querySelector(".proc-card-surface");
      this.procDomSurfaces.push(surfaceEl);
      gsap.set(surfaceEl, {
        transformPerspective: 900,
        transformOrigin: "center center",
        force3D: true
      });

      if (!this.reducedMotion) {
        // quickTo evita una cola de tweens por cada movimiento del cursor y
        // mantiene la ilusión 3D suave sin escalar ni rasterizar la imagen.
        const rotateXTo = gsap.quickTo(surfaceEl, "rotateX", {
          duration: 0.3,
          ease: "power3.out"
        });
        const rotateYTo = gsap.quickTo(surfaceEl, "rotateY", {
          duration: 0.3,
          ease: "power3.out"
        });
        const liftTo = gsap.quickTo(surfaceEl, "z", {
          duration: 0.38,
          ease: "power3.out"
        });

        surfaceEl.addEventListener("mouseenter", () => liftTo(10));
        surfaceEl.addEventListener("mousemove", e => {
          if (isDragging) return;
          const rect = surfaceEl.getBoundingClientRect();
          const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
          const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
          rotateYTo(nx * 5);
          rotateXTo(-ny * 5);
          liftTo(10 + Math.min(4, Math.abs(nx) + Math.abs(ny)));
        });

        surfaceEl.addEventListener("mouseleave", () => {
          if (isDragging) return;
          rotateYTo(0);
          rotateXTo(0);
          liftTo(0);
        });
      }

      this.gridEl.appendChild(itemEl);
      this.procDomItems.push(itemEl);
    });

    // Entrada 3D de las cards sin escala: conserva el detalle de los assets.
    gsap.fromTo(
      this.procDomSurfaces,
      { rotateX: 7, rotateY: -5, z: -24 },
      {
        rotateX: 0,
        rotateY: 0,
        z: 0,
        duration: this.reducedMotion ? 0 : 0.65,
        stagger: 0.05,
        ease: "power3.out"
      }
    );

    gsap.fromTo(
      this.procDomItems,
      { opacity: 0, y: 16 },
      {
        opacity: 0.92,
        y: 0,
        duration: this.reducedMotion ? 0 : 0.4,
        stagger: 0.05,
        ease: "power2.out"
      }
    );
  }

  updateFocus(dialogueSentenceIndex, speaking) {
    if (this.layerEl) {
      this.layerEl.classList.toggle("is-speaking", speaking);
    }
    if (!this.procDomItems.length) return;

    const scene = this.scenes[this.currentSceneIndex] || this.scenes[0];
    const highlightDef = scene.sentenceHighlights?.[dialogueSentenceIndex];

    this.procDomItems.forEach((itemEl, idx) => {
      const frameEl = itemEl.querySelector(".proc-spotlight-frame");

      if (!speaking || !highlightDef) {
        gsap.to(itemEl, {
          opacity: 0.92,
          scale: 1,
          duration: 0.35,
          ease: "power2.out",
          overwrite: "auto"
        });
        if (frameEl) {
          gsap.to(frameEl, {
            opacity: 0,
            scale: 0.95,
            duration: 0.25,
            ease: "power1.out",
            overwrite: "auto"
          });
        }
        return;
      }

      // Check if target is all cards (-1) or this specific card
      const isTargetCard = highlightDef.cardIndex === -1 || highlightDef.cardIndex === idx;

      if (isTargetCard) {
        gsap.to(itemEl, {
          opacity: 1,
          scale: 1,
          duration: 0.35,
          ease: "power2.out",
          overwrite: "auto"
        });

        if (frameEl && highlightDef.cardIndex === idx) {
          // Morph spotlight frame over the exact formula / line
          gsap.to(frameEl, {
            top: highlightDef.top,
            left: highlightDef.left,
            width: highlightDef.width,
            height: highlightDef.height,
            opacity: 1,
            scale: 1,
            duration: 0.38,
            ease: "back.out(1.2)",
            overwrite: "auto"
          });
        } else if (frameEl) {
          gsap.to(frameEl, {
            opacity: 0,
            duration: 0.2,
            overwrite: "auto"
          });
        }
      } else {
        // Dim other non-target cards
        gsap.to(itemEl, {
          opacity: 0.35,
          scale: 1,
          duration: 0.35,
          ease: "power2.out",
          overwrite: "auto"
        });
        if (frameEl) {
          gsap.to(frameEl, {
            opacity: 0,
            duration: 0.2,
            overwrite: "auto"
          });
        }
      }
    });
  }
}
