export class PresentationController {
  constructor(options) {
    this.slides = options.slides;
    this.els = options.elements;
    this.onSlideChange = options.onSlideChange || (() => {});
    this.onPlay = options.onPlay || (() => {});
    this.onPause = options.onPause || (() => {});
    this.onResume = options.onResume || (() => {});
    this.onStop = options.onStop || (() => {});
    this.onOpeningExit = options.onOpeningExit || (() => {});

    this.activeIndex = 0;
    this.isOpening = Boolean(options.startInOpening);
    this.speaking = false;
    this.paused = false;

    this.initEventListeners();
  }

  initEventListeners() {
    this.els.prevBtn?.addEventListener("click", () => this.prev());
    this.els.nextBtn?.addEventListener("click", () => this.next());

    this.els.speakBtn?.addEventListener("click", () => {
      this.onPlay(this.activeIndex);
    });

    this.els.stopBtn?.addEventListener("click", () => {
      this.onStop();
    });

    this.els.pauseBtn?.addEventListener("click", () => {
      if (this.paused) {
        this.onResume();
      } else {
        this.onPause();
      }
    });

    document.addEventListener("keydown", event => {
      if (event.target.matches("input, textarea, select")) return;
      if (event.key === "ArrowRight" || event.key === "PageDown") {
        event.preventDefault();
        this.next();
      }
      if (event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault();
        this.prev();
      }
      if (event.key === "Home") {
        event.preventDefault();
        this.goTo(0);
      }
      if (event.key === "End") {
        event.preventDefault();
        this.goTo(this.slides.length - 1);
      }
      if (event.code === "Space") {
        event.preventDefault();
        if (this.paused) this.onResume();
        else if (this.speaking) this.onPause();
        else this.onPlay(this.activeIndex);
      }
    });
  }

  goTo(index) {
    const nextIndex = Math.max(0, Math.min(this.slides.length - 1, index));

    if (this.isOpening) {
      if (nextIndex === 0) return;
      this.exitOpening();
      return;
    }

    if (nextIndex === this.activeIndex) return;
    this.activeIndex = nextIndex;
    this.updateUI();
    this.onSlideChange(this.activeIndex);
  }

  next() {
    this.goTo(this.activeIndex + 1);
  }

  prev() {
    this.goTo(this.activeIndex - 1);
  }

  exitOpening(autoPlay = false) {
    if (!this.isOpening) return;
    this.isOpening = false;
    this.onOpeningExit(autoPlay);
  }

  setVoiceState(state) {
    this.speaking = state === "speaking";
    this.paused = state === "paused";

    if (this.els.pauseBtn) {
      const actionLabel = this.paused ? "Reanudar" : "Pausar";
      const span = this.els.pauseBtn.querySelector("span");
      if (span) span.textContent = actionLabel;
      const svg = this.els.pauseBtn.querySelector("svg");
      if (svg) {
        if (this.paused) {
          svg.innerHTML = `<polygon points="6 4 20 12 6 20 6 4" fill="currentColor"></polygon>`;
        } else {
          svg.innerHTML = `<rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor"></rect><rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor"></rect>`;
        }
      }
      this.els.pauseBtn.setAttribute("aria-label", `${actionLabel} párrafo`);
      this.els.pauseBtn.disabled = !(this.speaking || this.paused);
      this.els.pauseBtn.setAttribute("aria-pressed", String(this.paused));
    }

    if (this.els.avatarState) {
      this.els.avatarState.textContent = this.speaking ? "Hablando" : this.paused ? "Pausado" : "En línea";
    }
    if (this.els.avatarStage) {
      this.els.avatarStage.classList.toggle("is-speaking", this.speaking);
    }
    if (this.els.talkingTopic) {
      this.els.talkingTopic.classList.toggle("is-live", this.speaking);
    }
  }

  updateUI() {
    const slide = this.slides[this.activeIndex] || this.slides[0];

    if (this.els.slideTitle) this.els.slideTitle.textContent = slide.title;
    if (this.els.stageIndex) this.els.stageIndex.textContent = slide.index;
    if (this.els.stageTitle) this.els.stageTitle.textContent = slide.title;
    if (this.els.stageSubtitle) this.els.stageSubtitle.textContent = slide.subtitle;
    if (this.els.phaseTag) this.els.phaseTag.textContent = slide.phase;
    if (this.els.talkingTopicText) this.els.talkingTopicText.textContent = slide.title;

    if (this.els.stageProgress) {
      const pct = (this.activeIndex / Math.max(1, this.slides.length - 1)) * 100;
      this.els.stageProgress.style.transform = `scaleX(${pct / 100})`;
    }

    if (this.els.railCurrent) {
      this.els.railCurrent.textContent = slide.index;
    }

    if (this.els.scriptText) {
      this.els.scriptText.textContent = slide.script;
    }

    if (this.els.prevBtn) {
      this.els.prevBtn.disabled = this.activeIndex === 0;
    }
    if (this.els.nextBtn) {
      this.els.nextBtn.disabled = this.activeIndex === this.slides.length - 1;
    }
  }
}
