// RUNNOW AI Motion Fitness Sound & Voice Coaching Engine (Web Audio API & Web Speech TTS)

export class MotionSound {
  constructor() {
    this.audioCtx = null;
    this.ttsEnabled = true;
    this.soundEnabled = true;
    this.synth = window.speechSynthesis || null;
    this.voices = [];
    this.koreanVoice = null;
    this.lastSpokenText = "";
    this.lastSpokenTime = 0;

    this.initAudioContext();
    this.initTTS();
  }

  initAudioContext() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    } catch (e) {
      console.warn("Web Audio API not supported:", e);
    }
  }

  ensureAudioUnlocked() {
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
  }

  initTTS() {
    if (!this.synth) return;
    const loadVoices = () => {
      this.voices = this.synth.getVoices();
      this.koreanVoice = this.voices.find(v => v.lang.includes("ko") || v.lang.includes("KO")) || null;
    };
    loadVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  setTtsEnabled(enabled) {
    this.ttsEnabled = !!enabled;
  }

  setSoundEnabled(enabled) {
    this.soundEnabled = !!enabled;
  }

  // 횟수 달성 시 경쾌한 신디사이저 사운드
  playRepBeep(repCount = 1) {
    if (!this.soundEnabled) return;
    this.ensureAudioUnlocked();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = "sine";
      // 횟수가 올라갈수록 살짝 음이 높아지는 도파민 효과 (523Hz C5 ~ 880Hz A5)
      const baseFreq = 523.25;
      const pitchOffset = Math.min((repCount % 10) * 35, 350);
      osc.frequency.setValueAtTime(baseFreq + pitchOffset, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq + pitchOffset + 120, now + 0.12);

      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.18);
    } catch (e) {
      console.warn("Error playing rep beep:", e);
    }
  }

  // 자세 수축(Down) 도달 시 알림 틱 사운드
  playDepthClick() {
    if (!this.soundEnabled) return;
    this.ensureAudioUnlocked();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(380, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.06);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch (e) {}
  }

  // 운동 완료 팡파레 사운드
  playFinishFanfare() {
    if (!this.soundEnabled) return;
    this.ensureAudioUnlocked();
    if (!this.audioCtx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      const now = this.audioCtx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        const startTime = now + idx * 0.1;
        const duration = 0.3;

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    } catch (e) {}
  }

  // 한국어 음성 횟수 카운팅
  speakRep(repCount) {
    if (!this.ttsEnabled || !this.synth) return;

    const koreanNumbers = [
      "", "하나", "둘", "셋", "넷", "다섯", "여섯", "일곱", "여덟", "아홉", "열",
      "열하나", "열둘", "열셋", "열넷", "열다섯", "열여섯", "열일곱", "열여덟", "열아홉", "스물",
      "스물하나", "스물둘", "스물셋", "스물넷", "스물다섯", "스물여섯", "스물일곱", "스물여덟", "스물아홉", "서른",
      "서른하나", "서른둘", "서른셋", "서른넷", "서른다섯", "서른여섯", "서른일곱", "서른여덟", "서른아홉", "마흔",
      "마흔하나", "마흔둘", "마흔셋", "마흔넷", "마흔다섯", "마흔여섯", "마흔일곱", "마흔여덟", "마흔아홉", "쉰"
    ];

    let phrase = "";
    if (repCount <= 50) {
      phrase = koreanNumbers[repCount] || `${repCount}개`;
    } else {
      phrase = `${repCount}회`;
    }

    if (repCount % 5 === 0 && repCount > 0) {
      phrase += "! 나이스!";
    }

    this.speak(phrase, 1.2, 1.1, true);
  }

  // 실시간 코칭 음성 피드백
  speakCoaching(text) {
    if (!this.ttsEnabled || !this.synth) return;
    const now = Date.now();
    // 동일한 코칭은 최소 3.5초 간격으로 말하기
    if (this.lastSpokenText === text && now - this.lastSpokenTime < 3500) {
      return;
    }
    this.lastSpokenText = text;
    this.lastSpokenTime = now;
    this.speak(text, 1.1, 1.0, false);
  }

  speak(text, rate = 1.1, pitch = 1.0, cancelPrevious = false) {
    if (!this.ttsEnabled || !this.synth) return;
    try {
      if (cancelPrevious) {
        this.synth.cancel();
      }
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "ko-KR";
      utter.rate = rate;
      utter.pitch = pitch;
      if (this.koreanVoice) {
        utter.voice = this.koreanVoice;
      }
      this.synth.speak(utter);
    } catch (e) {
      console.warn("TTS Error:", e);
    }
  }
}
