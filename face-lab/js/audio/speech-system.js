import * as THREE from "three";

function splitDialogue(text) {
  return text.replace(/\s+/g, " ").trim().split(/(?<=[.!?])\s+/).filter(Boolean);
}

function wrapInfoText(ctx, text, maxWidth) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = candidate;
  }
  if (line) lines.push(line);
  return lines;
}

export class SpeechSystem {
  constructor(options) {
    this.slides = options.slides;
    this.scene = options.scene;
    this.onStatus = options.onStatus || (() => {});
    this.onStateChange = options.onStateChange || (() => {});
    this.onSentenceChange = options.onSentenceChange || (() => {});
    this.onEnded = options.onEnded || (() => {});

    this.audioPlayer = new Audio();
    this.audioPlayer.preload = "auto";
    this.audioPlayer.setAttribute("aria-hidden", "true");

    this.audioContext = null;
    this.audioAnalyser = null;
    this.audioData = null;
    this.audioSource = null;

    this.activeAudio = null;
    this.speaking = false;
    this.paused = false;
    this.activeSlideIndex = 0;
    this.speakStartedAt = 0;
    this.voiceEnergy = 0;

    this.lipSyncCache = this.slides.map(() => null);
    this.dialogueSentences = [];
    this.dialogueSentenceIndex = 0;
    this.dialogueSentenceStartedAt = 0;
    this.dialogueDrawnText = "";

    this.infoGroup = new THREE.Group();
    this.scene.add(this.infoGroup);
    this.dialogueSprite = null;
    this.dialogueCanvas = null;
    this.dialogueContext = null;
    this.dialogueTexture = null;

    this.loadLipSyncCues();
  }

  async loadLipSyncCues() {
    await Promise.all(
      this.slides.map(async (_, index) => {
        try {
          const response = await fetch(`./lipsync/slide-${String(index + 1).padStart(2, "0")}.json`);
          if (!response.ok) return;
          const payload = await response.json();
          this.lipSyncCache[index] = payload.mouthCues || [];
        } catch {
          this.lipSyncCache[index] = null;
        }
      })
    );
  }

  getCurrentMouthCue() {
    const cues = this.lipSyncCache[this.activeSlideIndex];
    if (!cues?.length) return null;
    const audioDuration = this.activeAudio && Number.isFinite(this.activeAudio.duration) && this.activeAudio.duration > 0
      ? this.activeAudio.duration
      : cues[cues.length - 1].end;
    const currentTime = this.activeAudio && Number.isFinite(this.activeAudio.currentTime)
      ? this.activeAudio.currentTime
      : this.getSpeechProgress() * audioDuration;
    return cues.find(cue => currentTime >= cue.start && currentTime < cue.end) || cues[cues.length - 1];
  }

  getSpeechProgress() {
    if (!this.speaking) return 0;
    if (this.activeAudio && Number.isFinite(this.activeAudio.duration) && this.activeAudio.duration > 0) {
      return this.activeAudio.currentTime / this.activeAudio.duration;
    }
    const currentScript = this.slides[this.activeSlideIndex]?.script || "";
    const elapsed = performance.now() / 1000 - this.speakStartedAt;
    return Math.min(1, elapsed / Math.max(5, currentScript.length * 0.055));
  }

  configureAudioAnalyser() {
    if (this.audioContext) return;
    try {
      this.audioContext = new AudioContext();
      this.audioAnalyser = this.audioContext.createAnalyser();
      this.audioAnalyser.fftSize = 256;
      this.audioAnalyser.smoothingTimeConstant = 0.82;
      this.audioSource = this.audioContext.createMediaElementSource(this.audioPlayer);
      this.audioSource.connect(this.audioAnalyser);
      this.audioAnalyser.connect(this.audioContext.destination);
      this.audioData = new Uint8Array(this.audioAnalyser.frequencyBinCount);
    } catch (error) {
      console.warn("Audio reactivo no disponible", error);
      this.audioContext = null;
      this.audioAnalyser = null;
    }
  }

  createDialogueSprite(position) {
    const surface = document.createElement("canvas");
    surface.width = 860;
    surface.height = 260;
    const ctx = surface.getContext("2d");
    const texture = new THREE.CanvasTexture(surface);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;

    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      side: THREE.DoubleSide,
      color: 0xffffff,
      opacity: 0.98
    });

    const sprite = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
    sprite.position.set(...position);
    sprite.rotation.set(-0.012, -0.02, -0.01);
    sprite.scale.set(2.45, 2.45 * (surface.height / surface.width), 1);
    sprite.userData.baseScale = sprite.scale.clone();
    sprite.userData.baseRotationZ = sprite.rotation.z;
    sprite.userData.hover = 0;

    this.infoGroup.add(sprite);
    this.dialogueSprite = sprite;
    this.dialogueCanvas = surface;
    this.dialogueContext = ctx;
    this.dialogueTexture = texture;
    this.dialogueDrawnText = "";
  }

  setSlide(index) {
    this.activeSlideIndex = index;
    this.stop();
    this.infoGroup.clear();
    this.dialogueSprite = null;
    this.dialogueCanvas = null;
    this.dialogueContext = null;
    this.dialogueTexture = null;
    this.dialogueSentences = splitDialogue(this.slides[index]?.script || "");
    this.dialogueSentenceIndex = 0;
    this.dialogueSentenceStartedAt = performance.now() / 1000;
    this.infoGroup.position.set(0, 0, -0.18);

    const position = window.innerWidth < 900 ? [0.65, -1.48, 0.16] : [2.26, -1.56, 0.18];
    this.createDialogueSprite(position);
    this.drawDialogue("");
  }

  drawDialogue(text) {
    if (!this.dialogueContext || !this.dialogueCanvas || !this.dialogueTexture) return;
    if (text === this.dialogueDrawnText) return;
    this.dialogueDrawnText = text;
    const ctx = this.dialogueContext;
    ctx.clearRect(0, 0, this.dialogueCanvas.width, this.dialogueCanvas.height);
    ctx.font = "500 27px Arial, sans-serif";
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    ctx.fillStyle = "#f3f4ed";
    ctx.shadowColor = "rgba(240,179,108,.9)";
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 3;
    const lines = wrapInfoText(ctx, `“${text}”`, 810).slice(0, 4);
    lines.forEach((line, index) => ctx.fillText(line, 24, 22 + index * 36));
    this.dialogueTexture.needsUpdate = true;
  }

  getSentenceIndexAndProgress(currentTime, duration) {
    if (!this.dialogueSentences.length) return { index: 0, sentenceProgress: 0 };
    if (!duration || duration <= 0) return { index: 0, sentenceProgress: 0 };

    const totalChars = this.dialogueSentences.reduce((acc, s) => acc + s.length, 0);
    if (totalChars === 0) return { index: 0, sentenceProgress: 0 };

    let prevChars = 0;
    for (let i = 0; i < this.dialogueSentences.length; i++) {
      const len = this.dialogueSentences[i].length;
      const startSec = (prevChars / totalChars) * duration;
      const endSec = ((prevChars + len) / totalChars) * duration;
      if (currentTime < endSec || i === this.dialogueSentences.length - 1) {
        const sentenceDur = Math.max(0.1, endSec - startSec);
        const sProg = Math.max(0, Math.min(1, (currentTime - startSec) / sentenceDur));
        return { index: i, sentenceProgress: sProg };
      }
      prevChars += len;
    }
    return { index: 0, sentenceProgress: 0 };
  }

  updateDialogue() {
    if (!this.dialogueSprite || !this.dialogueSentences.length) return;
    const now = performance.now() / 1000;
    const audioDuration = this.activeAudio && Number.isFinite(this.activeAudio.duration) && this.activeAudio.duration > 0
      ? this.activeAudio.duration
      : (this.lipSyncCache[this.activeSlideIndex]?.[this.lipSyncCache[this.activeSlideIndex]?.length - 1]?.end || 16.0);

    const currentTime = this.activeAudio && Number.isFinite(this.activeAudio.currentTime)
      ? this.activeAudio.currentTime
      : (this.speaking ? Math.min(audioDuration, now - this.speakStartedAt) : 0);

    const { index: wantedIndex, sentenceProgress } = this.speaking
      ? this.getSentenceIndexAndProgress(currentTime, audioDuration)
      : { index: this.dialogueSentenceIndex, sentenceProgress: 1 };

    if (wantedIndex !== this.dialogueSentenceIndex) {
      this.dialogueSentenceIndex = wantedIndex;
      this.dialogueSentenceStartedAt = now;
      this.dialogueDrawnText = "";
      this.drawDialogue("");
      this.onSentenceChange(this.dialogueSentenceIndex);
    }

    const sentence = this.dialogueSentences[this.dialogueSentenceIndex] || "";
    const amount = this.paused
      ? sentence.length
      : Math.min(sentence.length, Math.floor(sentenceProgress * sentence.length));
    this.drawDialogue(sentence.slice(0, amount));
  }

  async play() {
    this.stop();
    this.speaking = true;
    this.paused = false;
    this.speakStartedAt = performance.now() / 1000;
    this.dialogueSentenceIndex = 0;
    this.dialogueSentenceStartedAt = this.speakStartedAt;
    this.onStateChange("speaking");
    this.onStatus("Modelo 3D: cargando voz local…");

    try {
      this.activeAudio = this.audioPlayer;
      this.audioPlayer.src = `./voice/slide-${String(this.activeSlideIndex + 1).padStart(2, "0")}.wav`;
      this.audioPlayer.currentTime = 0;

      this.audioPlayer.onended = () => {
        this.activeAudio = null;
        this.speaking = false;
        this.paused = false;
        this.onStateChange("idle");
        this.onStatus("Modelo 3D: listo · Voz: lista");
        this.onEnded();
      };

      this.audioPlayer.onerror = () => {
        this.activeAudio = null;
        this.speaking = false;
        this.paused = false;
        this.onStateChange("idle");
        this.onStatus("Voz local no disponible para esta lámina");
      };

      this.configureAudioAnalyser();
      if (this.audioContext?.state === "suspended") await this.audioContext.resume();
      await this.audioPlayer.play();
      this.onStatus("Modelo 3D: listo · Voz presentando lámina");
    } catch (error) {
      console.warn("Fallo al reproducir audio:", error);
      this.stop();
    }
  }

  pause() {
    if (this.activeAudio) {
      this.activeAudio.pause();
      this.speaking = false;
      this.paused = true;
      this.onStateChange("paused");
      this.onStatus("Modelo 3D: listo · Voz: pausada");
    }
  }

  resume() {
    if (this.activeAudio) {
      this.activeAudio.play().then(() => {
        this.speaking = true;
        this.paused = false;
        this.onStateChange("speaking");
        this.onStatus("Modelo 3D: listo · Voz presentando");
      });
    }
  }

  stop() {
    if (this.activeAudio) {
      this.activeAudio.pause();
      this.activeAudio.currentTime = 0;
      this.activeAudio.removeAttribute("src");
      this.activeAudio.load();
      this.activeAudio = null;
    }
    this.speaking = false;
    this.paused = false;
    if (this.dialogueSentences.length) {
      this.dialogueSentenceIndex = 0;
      this.dialogueSentenceStartedAt = performance.now() / 1000;
      this.dialogueDrawnText = "";
      this.drawDialogue("");
    }
    this.onStateChange("idle");
    this.onStatus("Modelo 3D: listo · Voz: lista");
  }

  updateAudioReactive() {
    if (!this.audioAnalyser || !this.audioData) {
      this.voiceEnergy = this.speaking ? 0.16 : 0;
      return;
    }
    this.audioAnalyser.getByteFrequencyData(this.audioData);
    let sum = 0;
    for (let index = 4; index < Math.min(28, this.audioData.length); index++) {
      sum += this.audioData[index];
    }
    this.voiceEnergy = Math.min(1, (sum / Math.max(1, 24 * 255)) * 1.8);
  }
}
