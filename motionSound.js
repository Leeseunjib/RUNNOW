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
    this.currentCoachId = "leo"; // 기본 코치: 레오
  }

  setCoach(coachId) {
    this.currentCoachId = coachId === "luna" ? "luna" : "leo";
  }

  getCoachPitch() {
    return this.currentCoachId === "luna" ? 1.1 : 0.7;
  }

  getCoachRate() {
    return this.currentCoachId === "luna" ? 1.03 : 1.05;
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

  pickBestKoreanVoice(voices = this.voices, coachId = this.currentCoachId) {
    if (!voices || voices.length === 0) return null;
    const koVoices = voices.filter(v => v.lang && (v.lang.includes("ko") || v.lang.includes("KO")));
    if (koVoices.length === 0) return null;

    const isMale = coachId === "leo";

    // 1순위: 지정된 성별에 맞는 음성 매칭
    if (isMale) {
      const maleVoice = koVoices.find(v => v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("injoon") || v.name.includes("남성"));
      if (maleVoice) return maleVoice;
    } else {
      const femaleVoice = koVoices.find(v => v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("yuna") || v.name.toLowerCase().includes("sunhi") || v.name.includes("여성"));
      if (femaleVoice) return femaleVoice;
    }

    // 2순위: Google 인공신경망 고품질 음성 (Google 한국어) 또는 Natural / Neural 온라인 성우 음성
    const neuralVoice = koVoices.find(v => 
      v.name.includes("Google") || 
      v.name.includes("Natural") || 
      v.name.includes("Neural") || 
      v.name.includes("Online")
    );
    if (neuralVoice) return neuralVoice;

    // 3순위: 윈도우 구형 기계음(Heami)을 제외한 모바일/시스템 한국어 음성 (예: Yuna, SunHi 등)
    const modernVoice = koVoices.find(v => !v.name.includes("Heami"));
    if (modernVoice) return modernVoice;

    // 4순위: 기본 한국어
    return koVoices[0];
  }

  initTTS() {
    if (!this.synth) return;
    const loadVoices = () => {
      this.voices = this.synth.getVoices();
      this.koreanVoice = this.pickBestKoreanVoice(this.voices);
      if (this.koreanVoice) {
        console.log(`🎙️ [RUNNOW Voice] 고품질 음성 엔진 장착: ${this.koreanVoice.name} (${this.koreanVoice.lang})`);
      }
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

  // 한국어 음성 횟수 카운팅 (PT 코치 현장감 극대화)
  
  // ⚡ 100% 실제 한국인 전문 성우 오디오 에셋 무지연 재생 (Zero-Latency Studio Audio)
  playCoachAudio(key, fallbackText) {
    if (!this.soundEnabled && !this.ttsEnabled) return;
    this.ensureAudioUnlocked();

    const coach = this.currentCoachId || "leo";
    const audioPath = `assets/audio/coaches/${coach}/${key}.mp3`;

    try {
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      }
      const audio = new Audio(audioPath);
      audio.volume = 1.0;
      this.currentAudio = audio;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          if (fallbackText) this.speak(fallbackText, this.getCoachRate(), this.getCoachPitch(), true);
        });
      }
    } catch (e) {
      if (fallbackText) this.speak(fallbackText, this.getCoachRate(), this.getCoachPitch(), true);
    }
  }

  speakRep(repCount, targetReps = 10) {
    if (!this.ttsEnabled) return;

    if (repCount <= 20) {
      this.playCoachAudio(`count_${repCount}`, `${repCount}`);

      // 성우 추임새 시차 재생 (0.75초 후 자연스럽게 연결)
      if (repCount === 1) {
        setTimeout(() => this.playCoachAudio("cheer_good", "좋습니다"), 750);
      } else if (repCount === 3) {
        setTimeout(() => this.playCoachAudio("cheer_depth", "깊이 완벽합니다"), 750);
      } else if (repCount === Math.floor(targetReps / 2) && targetReps >= 6) {
        setTimeout(() => this.playCoachAudio("cheer_half", "절반 돌파"), 750);
      } else if (targetReps > 0 && repCount === targetReps - 1) {
        setTimeout(() => this.playCoachAudio("cheer_last", "마지막 하나 더"), 750);
      } else if (targetReps > 0 && repCount >= targetReps) {
        setTimeout(() => this.playCoachAudio("cheer_finish", "완벽합니다"), 750);
      }
    } else {
      this.speak(`${repCount}회!`, this.getCoachRate(), this.getCoachPitch(), true);
    }
  }

  // 실시간 코칭 음성 피드백
  speakCoaching(text) {
    if (!this.ttsEnabled || !this.synth) return;
    const now = Date.now();
    // 동일한 코칭은 최소 3초 간격으로 말하기
    if (this.lastSpokenText === text && now - this.lastSpokenTime < 3000) {
      return;
    }
    this.lastSpokenText = text;
    this.lastSpokenTime = now;
    this.speak(text, this.getCoachRate(), this.getCoachPitch(), false);
  }

  speak(text, rate = 1.02, pitch = 1.0, cancelPrevious = false) {
    if (!this.ttsEnabled || !this.synth) return;
    try {
      if (cancelPrevious) {
        this.synth.cancel();
      }

      // 비동기로 음성이 늦게 준비된 경우 재확인
      if (!this.koreanVoice) {
        this.voices = this.synth.getVoices();
        this.koreanVoice = this.pickBestKoreanVoice(this.voices, this.currentCoachId);
      } else {
        // 코치가 바뀌었을 경우 재확인
        this.koreanVoice = this.pickBestKoreanVoice(this.voices, this.currentCoachId);
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
