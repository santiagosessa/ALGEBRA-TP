import { gsap } from "gsap";

export class ProcedimientoView {
  constructor(options) {
    this.layerEl = options.layerEl;
    this.headerEl = options.headerEl;
    this.phaseEl = options.phaseEl;
    this.titleEl = options.titleEl;
    this.subtitleEl = options.subtitleEl;
    this.gridEl = options.gridEl;
    this.scenes = options.scenes;
    this.slides = options.slides;

    this.procDomItems = [];
    this.currentSceneIndex = 0;
  }

  renderScene(index) {
    if (!this.layerEl || !this.gridEl) return;
    this.currentSceneIndex = index;
    const scene = this.scenes[index] || this.scenes[0];
    const slide = this.slides[index] || this.slides[0];

    this.procDomItems.forEach(item => gsap.killTweensOf(item));

    if (this.phaseEl) {
      this.phaseEl.textContent = (slide.phase || "Fase").toUpperCase();
    }
    if (this.titleEl) {
      this.titleEl.textContent = `${slide.index} · ${slide.title}`;
    }
    if (this.subtitleEl) {
      this.subtitleEl.textContent = slide.subtitle;
    }

    this.gridEl.className = `procedimiento-grid ${scene.layout || "grid-s1"}`;
    this.gridEl.innerHTML = "";
    this.procDomItems = [];

    scene.items.forEach((itemDef, itemIdx) => {
      const itemEl = document.createElement("div");
      itemEl.className = `proc-item${itemDef.className ? ` ${itemDef.className}` : ""}`;
      itemEl.dataset.itemId = itemDef.id;
      itemEl.dataset.itemIndex = String(itemIdx);
      itemEl.tabIndex = 0;
      itemEl.setAttribute("role", "img");
      itemEl.setAttribute("aria-label", itemDef.label);

      itemEl.innerHTML = `<img class="proc-card-img" src="./cards/${itemDef.cardFile}" alt="${itemDef.label}" draggable="false" />`;

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

      itemEl.addEventListener("mousemove", e => {
        if (isDragging) return;
        const rect = itemEl.getBoundingClientRect();
        const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        gsap.to(itemEl, {
          rotateY: nx * 4.5,
          rotateX: -ny * 4.5,
          duration: 0.25,
          ease: "power2.out",
          overwrite: "auto"
        });
      });

      itemEl.addEventListener("mouseleave", () => {
        if (isDragging) return;
        gsap.to(itemEl, {
          rotateY: 0,
          rotateX: 0,
          duration: 0.45,
          ease: "power2.out",
          overwrite: "auto"
        });
      });

      this.gridEl.appendChild(itemEl);
      this.procDomItems.push(itemEl);
    });

    // Enter animation
    gsap.fromTo(
      this.procDomItems,
      { opacity: 0, y: 16, scale: 0.97 },
      {
        opacity: 0.92,
        y: 0,
        scale: 1,
        duration: 0.42,
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

    scene.items.forEach((itemDef, idx) => {
      const itemEl = this.procDomItems[idx];
      if (!itemEl) return;
      if (!speaking) {
        if (itemEl.classList.contains("is-focused")) {
          itemEl.classList.remove("is-focused");
          gsap.to(itemEl, {
            opacity: 0.92,
            scale: 1,
            duration: 0.35,
            ease: "power2.out",
            overwrite: "auto"
          });
        }
        return;
      }

      const isTarget = itemDef.focusSteps ? itemDef.focusSteps.includes(dialogueSentenceIndex) : true;
      const wasFocused = itemEl.classList.contains("is-focused");

      if (isTarget && !wasFocused) {
        itemEl.classList.add("is-focused");
        gsap.to(itemEl, {
          opacity: 1,
          scale: 1.025,
          duration: 0.4,
          ease: "back.out(1.4)",
          overwrite: "auto"
        });
      } else if (!isTarget && wasFocused) {
        itemEl.classList.remove("is-focused");
        gsap.to(itemEl, {
          opacity: 0.25,
          scale: 1,
          duration: 0.35,
          ease: "power2.out",
          overwrite: "auto"
        });
      }
    });
  }
}
