import * as THREE from "three";
import { openingNarration, slides } from "./data/slides.js";
import { procedimientoScenes } from "./data/procedimiento-scenes.js";
import { ForestEnvironment } from "./avatar/forest-env.js";
import { AvatarController } from "./avatar/avatar-controller.js";
import { SpeechSystem } from "./audio/speech-system.js";
import { ProcedimientoView } from "./ui/procedimiento-view.js";
import { PresentationController } from "./ui/presentation-controller.js";
import { BiblioModal } from "./ui/biblio-modal.js";
import { Cartesian3DExplorer } from "../cartesian-3d-explorer.js";

class App {
  constructor() {
    this.canvas = document.querySelector("#avatar-canvas");
    this.avatarStage = document.querySelector("#avatar-stage");

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(36, 1, 0.01, 100);
    this.camera.position.set(0, 0.08, 6.2);
    this.camera.lookAt(0, 0.02, 0);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });

    const mobile = window.matchMedia("(max-width: 820px)").matches;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 0.85 : 1));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.shadowMap.enabled = false;

    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.lastFrameAt = 0;
    this.elapsedTime = 0;
    this.openingUtterance = null;
    this.openingVoiceActive = false;
    this.appShell = document.querySelector(".app-shell");

    this.initLighting();
    this.initModules();
    this.initCartesian3D();
    this.initResize();
    this.start();
  }

  initLighting() {
    this.scene.add(new THREE.HemisphereLight(0xb5d8d2, 0x071018, 1.5));
    const key = new THREE.DirectionalLight(0xffe9c5, 2.8);
    key.position.set(1.4, 3.8, 5);
    this.scene.add(key);

    const rim = new THREE.PointLight(0x75d3c0, 12, 9, 2);
    rim.position.set(3.4, 1.1, 2.8);
    this.scene.add(rim);

    const warm = new THREE.PointLight(0xf0b36c, 9, 7, 2);
    warm.position.set(-1.8, 0.4, 3);
    this.scene.add(warm);
  }

  initModules() {
    const statusEl = document.querySelector("#live-status");
    const moodEl = document.querySelector("#avatar-mood");

    this.forestEnv = new ForestEnvironment(this.scene);

    this.avatar = new AvatarController({
      canvas: this.canvas,
      scene: this.scene,
      camera: this.camera,
      renderer: this.renderer,
      onStatus: text => {
        if (statusEl) statusEl.textContent = text;
      },
      onMood: (title, desc) => {
        if (moodEl) moodEl.innerHTML = `<span>${title}</span><strong>${desc}</strong>`;
      }
    });

    this.speech = new SpeechSystem({
      slides,
      dialogueEl: document.querySelector("#dialogue-overlay"),
      onStatus: text => {
        if (statusEl) statusEl.textContent = text;
      },
      onStateChange: state => {
        this.presentation.setVoiceState(state);
        this.avatar.speaking = state === "speaking";
        this.procedimientoView.updateFocus(this.speech.dialogueSentenceIndex, state === "speaking");
      },
      onSentenceChange: sentenceIdx => {
        this.procedimientoView.updateFocus(sentenceIdx, this.speech.speaking);
      },
      onEnded: () => {
        if (this.presentation.activeIndex === slides.length - 1) {
          this.avatar.triggerFinalSmile();
        } else {
          window.setTimeout(() => {
            if (!this.speech.speaking && !this.speech.paused) {
              this.presentation.next();
              this.speech.play();
            }
          }, 850);
        }
      }
    });

    this.procedimientoView = new ProcedimientoView({
      layerEl: document.querySelector("#procedimiento-layer"),
      gridEl: document.querySelector("#procedimiento-grid"),
      scenes: procedimientoScenes,
      slides
    });

    this.presentation = new PresentationController({
      slides,
      elements: {
        slideTitle: document.querySelector("#slide-title"),
        prevBtn: document.querySelector("#prev-btn"),
        nextBtn: document.querySelector("#next-btn"),
        speakBtn: document.querySelector("#speak-btn"),
        stopBtn: document.querySelector("#stop-btn"),
        pauseBtn: document.querySelector("#pause-btn"),
        avatarState: document.querySelector("#avatar-state"),
        avatarStage: document.querySelector("#avatar-stage")
      },
      startInOpening: true,
      onOpeningExit: autoPlay => this.enterPresentation(autoPlay),
      onSlideChange: index => {
        this.speech.setSlide(index);
        this.procedimientoView.renderScene(index);
        if (statusEl) statusEl.textContent = "Modelo 3D: listo · Voz: lista";

        if (this.c3dExplorer) {
          const slideTo3DScene = {
            0: "interseccion", 1: "interseccion", 2: "interseccion",
            3: "angulo", 4: "parametro_paralelo", 5: "proyectantes",
            6: "auditoria", 7: "parametro_incompatible", 8: "auditoria", 9: "proyectantes"
          };
          const sceneKey = slideTo3DScene[index] || "interseccion";
          this.c3dExplorer.loadScene(sceneKey);
        }
      },
      onPlay: () => {
        if (this.presentation.isOpening) this.playOpeningNarration();
        else this.speech.play();
      },
      onPause: () => {
        if (this.presentation.isOpening) this.pauseOpeningNarration();
        else this.speech.pause();
      },
      onResume: () => {
        if (this.presentation.isOpening) this.resumeOpeningNarration();
        else this.speech.resume();
      },
      onStop: () => {
        if (this.presentation.isOpening) this.stopOpeningNarration();
        else this.speech.stop();
      }
    });

    this.biblioModal = new BiblioModal();
  }

  initCartesian3D() {
    const slideTo3DScene = {
      0: "interseccion",
      1: "interseccion",
      2: "interseccion",
      3: "angulo",
      4: "parametro_paralelo",
      5: "proyectantes",
      6: "auditoria",
      7: "parametro_incompatible",
      8: "auditoria",
      9: "proyectantes"
    };

    const appShell = document.querySelector(".app-shell");
    const c3dContainer = document.querySelector("#cartesian-3d-container");
    if (c3dContainer) {
      this.c3dExplorer = new Cartesian3DExplorer(c3dContainer);
    }

    const btnToggle3D = document.querySelector("#btn-toggle-3d");
    if (btnToggle3D && this.c3dExplorer) {
      btnToggle3D.addEventListener("click", () => {
        const isVisible = appShell?.classList.contains("has-active-3d-graph");
        if (isVisible) {
          appShell?.classList.remove("has-active-3d-graph");
          btnToggle3D.classList.remove("is-active");
          this.c3dExplorer.hide();
        } else {
          appShell?.classList.add("has-active-3d-graph");
          btnToggle3D.classList.add("is-active");
          const sceneKey = slideTo3DScene[this.presentation.activeIndex] || "interseccion";
          this.c3dExplorer.show(sceneKey);
        }
      });

      // Also listen to close button inside 3D explorer
      c3dContainer.addEventListener("click", e => {
        if (e.target.closest(".c3d-btn-close")) {
          appShell?.classList.remove("has-active-3d-graph");
          btnToggle3D.classList.remove("is-active");
          this.c3dExplorer.hide();
        }
      });
    }
  }

  initResize() {
    const handleResize = () => {
      if (!this.renderer || !this.avatarStage) return;
      const rect = this.avatarStage.getBoundingClientRect();
      this.camera.aspect = Math.max(rect.width, 1) / Math.max(rect.height, 1);
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(Math.max(rect.width, 1), Math.max(rect.height, 1), false);
    };

    new ResizeObserver(handleResize).observe(this.avatarStage);
    window.addEventListener("resize", handleResize);
    handleResize();
  }

  async start() {
    this.presentation.updateUI();
    this.appShell?.classList.add("is-opening");
    this.avatar.setOpeningMode(true);
    this.speech.setSlide(0);

    const loaded = await this.avatar.load();
    if (loaded) {
      const fallback = document.querySelector("#avatar-fallback");
      if (fallback) fallback.hidden = true;
      this.avatar.triggerOpeningSmile();
    }

    this.animate();
  }

  setOpeningVoiceState(state) {
    const isSpeaking = state === "speaking";
    this.openingVoiceActive = isSpeaking;
    this.avatar.speaking = isSpeaking;
    this.presentation.setVoiceState(state);
  }

  playOpeningNarration() {
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
      this.presentation.exitOpening(true);
      return;
    }

    this.openingUtterance = null;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(openingNarration.script);
    utterance.lang = "es-AR";
    utterance.rate = 0.92;
    utterance.pitch = 0.98;
    utterance.volume = 1;
    const voices = window.speechSynthesis.getVoices();
    utterance.voice = voices.find(voice => voice.lang.toLowerCase().startsWith("es-ar"))
      || voices.find(voice => voice.lang.toLowerCase().startsWith("es"))
      || null;

    utterance.onstart = () => this.setOpeningVoiceState("speaking");
    utterance.onend = () => {
      if (this.openingUtterance !== utterance) return;
      this.openingUtterance = null;
      this.setOpeningVoiceState("idle");
      this.presentation.exitOpening(true);
    };
    utterance.onerror = () => {
      if (this.openingUtterance !== utterance) return;
      this.openingUtterance = null;
      this.setOpeningVoiceState("idle");
      this.presentation.exitOpening(true);
    };

    this.openingUtterance = utterance;
    this.setOpeningVoiceState("speaking");
    window.speechSynthesis.speak(utterance);
  }

  pauseOpeningNarration() {
    if (!this.openingUtterance) return;
    window.speechSynthesis.pause();
    this.setOpeningVoiceState("paused");
  }

  resumeOpeningNarration() {
    if (!this.openingUtterance) return;
    window.speechSynthesis.resume();
    this.setOpeningVoiceState("speaking");
  }

  stopOpeningNarration() {
    window.speechSynthesis?.cancel();
    this.openingUtterance = null;
    this.setOpeningVoiceState("idle");
  }

  enterPresentation(autoPlay = false) {
    this.stopOpeningNarration();
    this.appShell?.classList.remove("is-opening");
    this.avatar.setOpeningMode(false);
    this.procedimientoView.renderScene(this.presentation.activeIndex);
    this.speech.setSlide(this.presentation.activeIndex);
    if (this.c3dExplorer) {
      this.appShell?.classList.add("has-active-3d-graph");
      document.querySelector("#btn-toggle-3d")?.classList.add("is-active");
      const slideTo3DScene = {
        0: "interseccion", 1: "interseccion", 2: "interseccion",
        3: "angulo", 4: "parametro_paralelo", 5: "proyectantes",
        6: "auditoria", 7: "parametro_incompatible", 8: "auditoria", 9: "proyectantes"
      };
      this.c3dExplorer.show(slideTo3DScene[this.presentation.activeIndex] || "interseccion");
    }
    if (autoPlay) this.speech.play();
  }

  animate(now = performance.now()) {
    requestAnimationFrame(time => this.animate(time));
    if (document.hidden) return;

    const delta = Math.min(this.lastFrameAt ? (now - this.lastFrameAt) / 1000 : 0.016, 0.05);
    this.lastFrameAt = now;
    this.elapsedTime += delta;

    this.forestEnv.update(this.elapsedTime, this.reducedMotion);
    this.speech.updateDialogue();
    this.speech.updateAudioReactive();

    const currentCue = this.avatar.speaking ? this.speech.getCurrentMouthCue() : null;
    const speechProgress = this.speech.getSpeechProgress();
    this.avatar.voiceEnergy = this.openingVoiceActive ? 0.34 : this.speech.voiceEnergy;

    this.avatar.update(delta, this.elapsedTime, this.reducedMotion, currentCue, speechProgress);

    if (this.renderer) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}

// Instantiate immediately or on DOM ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    window.app = new App();
  });
} else {
  window.app = new App();
}
