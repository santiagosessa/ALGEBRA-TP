function splitDialogue(text) {
  return text.replace(/\s+/g, " ").trim().split(/(?<=[.!?])\s+/).filter(Boolean);
}

const PUNCTUATION_CADENCE = {
  ",": { duck: 0.82, attack: 0.08, hold: 0.07, release: 0.2 },
  ".": { duck: 0.7, attack: 0.1, hold: 0.12, release: 0.28 },
  "?": { duck: 0.7, attack: 0.1, hold: 0.12, release: 0.28 },
  "!": { duck: 0.7, attack: 0.1, hold: 0.12, release: 0.28 }
};

export const SLIDE_AUDIO_DURATIONS = [
  34.47, // Slide 1
  36.20, // Slide 2
  38.25, // Slide 3
  38.43, // Slide 4
  40.59, // Slide 5
  41.81, // Slide 6
  46.00, // Slide 7
  43.49, // Slide 8
  38.91, // Slide 9
  38.29  // Slide 10
];

export class SpeechSystem {
  constructor(options) {
    this.slides = options.slides;
    this.dialogueEl = options.dialogueEl || null;
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
    this.audioGain = null;

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
    this.punctuationMarkers = [];
    this.nextPunctuationMarkerIndex = 0;

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

  getAudioDuration() {
    if (this.activeAudio && Number.isFinite(this.activeAudio.duration) && this.activeAudio.duration > 0) {
      return this.activeAudio.duration;
    }
    return SLIDE_AUDIO_DURATIONS[this.activeSlideIndex] || 38.0;
  }

  getCurrentAudioTime() {
    if (this.activeAudio && Number.isFinite(this.activeAudio.currentTime) && this.activeAudio.currentTime >= 0) {
      return this.activeAudio.currentTime;
    }
    if (this.speaking) {
      const elapsed = performance.now() / 1000 - this.speakStartedAt;
      return Math.min(this.getAudioDuration(), Math.max(0, elapsed));
    }
    return 0;
  }

  getCurrentMouthCue() {
    const cues = this.lipSyncCache[this.activeSlideIndex];
    if (!cues?.length) return null;
    const duration = this.getAudioDuration();
    const currentTime = this.getCurrentAudioTime();
    const cuesDuration = cues[cues.length - 1].end || 1;
    const normalizedTime = Math.max(0, Math.min(cuesDuration, (currentTime / duration) * cuesDuration));
    return cues.find(cue => normalizedTime >= cue.start && normalizedTime < cue.end) || cues[cues.length - 1];
  }

  getSpeechProgress() {
    if (!this.speaking) return 0;
    const duration = this.getAudioDuration();
    if (duration <= 0) return 0;
    return Math.max(0, Math.min(1, this.getCurrentAudioTime() / duration));
  }

  buildPunctuationMarkers() {
    const totalChars = this.dialogueSentences.reduce((acc, sentence) => acc + sentence.length, 0);
    this.punctuationMarkers = [];
    if (!totalChars) return;

    let offset = 0;
    this.dialogueSentences.forEach(sentence => {
      [...sentence].forEach((character, index) => {
        const cadence = PUNCTUATION_CADENCE[character];
        if (!cadence) return;
        this.punctuationMarkers.push({
          progress: Math.min(0.999, (offset + index + 0.9) / totalChars),
          cadence
        });
      });
      offset += sentence.length;
    });
  }

  clearPunctuationCadence() {
    if (!this.audioGain || !this.audioContext) return;
    const now = this.audioContext.currentTime;
    const gain = this.audioGain.gain;
    gain.cancelScheduledValues(now);
    gain.setValueAtTime(gain.value, now);
    gain.linearRampToValueAtTime(1, now + 0.08);
  }

  applyPunctuationCadence(currentTime, duration) {
    if (!this.speaking || this.paused || !this.activeAudio || duration <= 0) return;

    const progress = currentTime / duration;
    let lastCadence = null;
    while (this.punctuationMarkers[this.nextPunctuationMarkerIndex]?.progress <= progress) {
      lastCadence = this.punctuationMarkers[this.nextPunctuationMarkerIndex].cadence;
      this.nextPunctuationMarkerIndex += 1;
    }
    if (!lastCadence || !this.audioGain || !this.audioContext) return;

    const now = this.audioContext.currentTime;
    const gain = this.audioGain.gain;
    const attackEnd = now + lastCadence.attack;
    const holdEnd = attackEnd + lastCadence.hold;
    const releaseEnd = holdEnd + lastCadence.release;
    gain.cancelScheduledValues(now);
    gain.setValueAtTime(Math.min(1, Math.max(0.65, gain.value)), now);
    gain.linearRampToValueAtTime(lastCadence.duck, attackEnd);
    gain.setValueAtTime(lastCadence.duck, holdEnd);
    gain.linearRampToValueAtTime(1, releaseEnd);
  }

  configureAudioAnalyser() {
    if (this.audioContext) return;
    try {
      this.audioContext = new AudioContext();
      this.audioAnalyser = this.audioContext.createAnalyser();
      this.audioAnalyser.fftSize = 256;
      this.audioAnalyser.smoothingTimeConstant = 0.82;
      this.audioSource = this.audioContext.createMediaElementSource(this.audioPlayer);
      this.audioGain = this.audioContext.createGain();
      this.audioGain.gain.value = 1;
      this.audioSource.connect(this.audioGain);
      this.audioGain.connect(this.audioAnalyser);
      this.audioAnalyser.connect(this.audioContext.destination);
      this.audioData = new Uint8Array(this.audioAnalyser.frequencyBinCount);
    } catch (error) {
      console.warn("Audio reactivo no disponible", error);
      this.audioContext = null;
      this.audioAnalyser = null;
      this.audioGain = null;
    }
  }

  setSlide(index) {
    this.activeSlideIndex = index;
    this.stop();
    this.dialogueSentences = splitDialogue(this.slides[index]?.script || "");
    this.buildPunctuationMarkers();
    this.nextPunctuationMarkerIndex = 0;
    this.dialogueSentenceIndex = 0;
    this.dialogueSentenceStartedAt = performance.now() / 1000;
    this.drawDialogue("");
  }

  drawDialogue(text) {
    if (!this.dialogueEl) return;
    if (text === this.dialogueDrawnText) return;
    this.dialogueDrawnText = text;
    this.dialogueEl.textContent = text ? `“${text}”` : "";
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
    if (!this.dialogueSentences.length) return;
    const now = performance.now() / 1000;
    const audioDuration = this.getAudioDuration();
    const currentTime = this.getCurrentAudioTime();

    this.applyPunctuationCadence(currentTime, audioDuration);

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
    this.nextPunctuationMarkerIndex = 0;
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
        this.clearPunctuationCadence();
        this.activeAudio = null;
        this.speaking = false;
        this.paused = false;
        this.onStateChange("idle");
        this.onStatus("Modelo 3D: listo · Voz: lista");
        this.onEnded();
      };

      this.audioPlayer.onerror = () => {
        this.clearPunctuationCadence();
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
      this.clearPunctuationCadence();
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
    this.clearPunctuationCadence();
    if (this.activeAudio) {
      this.activeAudio.pause();
      this.activeAudio.currentTime = 0;
      this.activeAudio.removeAttribute("src");
      this.activeAudio.load();
      this.activeAudio = null;
    }
    this.speaking = false;
    this.paused = false;
    this.nextPunctuationMarkerIndex = 0;
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
