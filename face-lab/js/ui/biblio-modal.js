export class BiblioModal {
  constructor() {
    this.toggleBtn = document.querySelector("#btn-biblio");
    this.backdrop = document.querySelector("#biblio-modal-backdrop");
    this.closeBtn = document.querySelector("#biblio-modal-close");
    this.tabButtons = document.querySelectorAll(".biblio-tab-btn");
    this.tabContents = document.querySelectorAll(".biblio-tab-content");

    this.isOpen = false;
    this.initEventListeners();
  }

  initEventListeners() {
    this.toggleBtn?.addEventListener("click", () => this.open());
    this.closeBtn?.addEventListener("click", () => this.close());

    this.backdrop?.addEventListener("click", event => {
      if (event.target === this.backdrop) {
        this.close();
      }
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && this.isOpen) {
        event.preventDefault();
        this.close();
      }
    });

    this.tabButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const targetTab = btn.dataset.tab;
        this.switchTab(targetTab);
      });
    });
  }

  open() {
    this.isOpen = true;
    this.backdrop?.classList.add("is-open");
    this.backdrop?.setAttribute("aria-hidden", "false");
    this.toggleBtn?.setAttribute("aria-expanded", "true");
    this.closeBtn?.focus();
  }

  close() {
    this.isOpen = false;
    this.backdrop?.classList.remove("is-open");
    this.backdrop?.setAttribute("aria-hidden", "true");
    this.toggleBtn?.setAttribute("aria-expanded", "false");
    this.toggleBtn?.focus();
  }

  switchTab(tabId) {
    this.tabButtons.forEach(btn => {
      const isActive = btn.dataset.tab === tabId;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-selected", String(isActive));
    });

    this.tabContents.forEach(content => {
      const isActive = content.id === `tab-${tabId}`;
      content.classList.toggle("is-active", isActive);
      content.hidden = !isActive;
    });
  }
}
