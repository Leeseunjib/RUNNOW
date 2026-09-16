const fs = require('fs');

// 1. careTeam.js 업그레이드 (뉴럴 실사 오디오 에셋 매핑 및 고품질 재생 엔진)
const careTeamPath = 'C:\\BeausCreators\\02.BSC_Branch\\projects\\Runnow\\careTeam.js';
let code = fs.readFileSync(careTeamPath, 'utf8');

// COACH_PROFILES에 오디오 경로 추가
const oldLeoIntro = `intro: "대표님, 반갑습니다! 남성 전담 코치 레오입니다. 오늘 목표 칼로리 버닝과 하체 강화, 제가 확실하게 끌어드리겠습니다! 어떤 운동 플랜을 짤까요?"`;
const newLeoIntro = `intro: "대표님, 반갑습니다! 남성 전담 코치 레오입니다. 오늘 목표 칼로리 버닝과 하체 강화, 제가 확실하게 끌어드리겠습니다! 어떤 운동 플랜을 짤까요?",
      introAudio: "./assets/audio/careteam/leo_intro.mp3"`;

const oldLunaIntro = `intro: "안녕하세요 대표님! 섬세한 자세 교정과 꾸준한 루틴을 책임지는 코치 루나예요. 무리하지 않고 오래 지속할 수 있는 즐거운 러닝 플랜을 함께 세워봐요."`;
const newLunaIntro = `intro: "안녕하세요 대표님! 섬세한 자세 교정과 꾸준한 루틴을 책임지는 코치 루나예요. 무리하지 않고 오래 지속할 수 있는 즐거운 러닝 플랜을 함께 세워봐요.",
      introAudio: "./assets/audio/careteam/luna_intro.mp3"`;

const oldEllieIntro = `intro: "대표님, 오늘 식사 맛있게 드셨나요? 오늘 태운 운동 칼로리와 딱 맞물리는 최적의 단백질·영양 밸런스를 가이드해 드릴게요. 무엇을 드셨는지 편하게 말씀해주세요!"`;
const newEllieIntro = `intro: "대표님, 오늘 식사 맛있게 드셨나요? 오늘 태운 운동 칼로리와 딱 맞물리는 최적의 단백질·영양 밸런스를 가이드해 드릴게요. 무엇을 드셨는지 편하게 말씀해주세요!",
      introAudio: "./assets/audio/careteam/ellie_intro.mp3"`;

const oldDrkayIntro = `intro: "안녕하십니까, 대표님의 안전을 책임지는 닥터 케이입니다. 운동 전후 관절이나 근육에 뻐근한 곳은 없으신가요? 통증이 있다면 언제든 말씀해주십시오. (참고용 가이드이며 의료 진단이 아닙니다)"`;
const newDrkayIntro = `intro: "안녕하십니까, 대표님의 안전을 책임지는 닥터 케이입니다. 운동 전후 관절이나 근육에 뻐근한 곳은 없으신가요? 통증이 있다면 언제든 말씀해주십시오. (참고용 가이드이며 의료 진단이 아닙니다)",
      introAudio: "./assets/audio/careteam/drkay_intro.mp3"`;

let normCode = code.replace(/\r\n/g, '\n');
normCode = normCode.replace(oldLeoIntro, newLeoIntro);
normCode = normCode.replace(oldLunaIntro, newLunaIntro);
normCode = normCode.replace(oldEllieIntro, newEllieIntro);
normCode = normCode.replace(oldDrkayIntro, newDrkayIntro);

// speak 및 오디오 재생 함수 교체
const oldSpeakBlock = `    speak(text) {
      if (!this.ttsEnabled || !window.speechSynthesis) return;
      window.speechSynthesis.cancel(); // 이전 재생 중단

      const profile = COACH_PROFILES[this.currentCoachId];
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "ko-KR";
      utter.pitch = profile.pitch;
      utter.rate = profile.rate;

      // 가능한 경우 한국어 음성 탐색
      const voices = window.speechSynthesis.getVoices();
      const koVoices = voices.filter(v => v.lang.includes("ko"));
      if (koVoices.length > 0) {
        // 남/여 힌트가 있는 음성 우선 매칭
        if (profile.voiceGender === "F" && koVoices.find(v => v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("yuna") || v.name.toLowerCase().includes("sunhi") || v.name.includes("여성"))) {
          utter.voice = koVoices.find(v => v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("yuna") || v.name.toLowerCase().includes("sunhi") || v.name.includes("여성"));
        } else if (profile.voiceGender === "M" && koVoices.find(v => v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("injoon") || v.name.includes("남성"))) {
          utter.voice = koVoices.find(v => v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("injoon") || v.name.includes("남성"));
        } else {
          utter.voice = koVoices[0];
        }
      }

      window.speechSynthesis.speak(utter);
    }`;

const newSpeakBlock = `    // 진짜 사람 같은 성우 오디오 및 고음질 자연어 음성 재생 엔진
    speak(text, specificAudioUrl = null) {
      if (!this.ttsEnabled) return;

      // 이전 오디오 재생 정지
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio = null;
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }

      // 1. 지정된 뉴럴 성우 오디오 파일이 있으면 최우선으로 즉시 재생 (0ms 지연, 100% 실사 성우)
      if (specificAudioUrl) {
        try {
          const audio = new Audio(specificAudioUrl);
          audio.volume = 1.0;
          this.currentAudio = audio;
          audio.play().catch(() => {
            // 자동 재생 정책 차단 시 폴백
            this.speakFallbackSpeech(text);
          });
          return;
        } catch (_) {}
      }

      // 2. 고품질 구글 자연어 스트림 오디오 재생 시도 (기계 로봇음 차단)
      if (text && text.length <= 150) {
        try {
          const cleanText = encodeURIComponent(text.replace(/[#*~_\`]/g, '').trim());
          const streamUrl = \`https://translate.google.com/translate_tts?ie=UTF-8&tl=ko&client=tw-ob&q=\${cleanText}\`;
          const audio = new Audio(streamUrl);
          audio.volume = 1.0;
          this.currentAudio = audio;
          audio.play().catch(() => {
            this.speakFallbackSpeech(text);
          });
          return;
        } catch (_) {}
      }

      // 3. 로컬 Web Speech API 폴백
      this.speakFallbackSpeech(text);
    }

    speakFallbackSpeech(text) {
      if (!window.speechSynthesis) return;
      const profile = COACH_PROFILES[this.currentCoachId];
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "ko-KR";
      utter.pitch = profile.pitch;
      utter.rate = profile.rate;

      const voices = window.speechSynthesis.getVoices();
      const koVoices = voices.filter(v => v.lang.includes("ko"));
      if (koVoices.length > 0) {
        if (profile.voiceGender === "F") {
          const fVoice = koVoices.find(v => v.name.toLowerCase().includes("sunhi") || v.name.toLowerCase().includes("yuna") || v.name.toLowerCase().includes("female"));
          utter.voice = fVoice || koVoices[0];
        } else {
          const mVoice = koVoices.find(v => v.name.toLowerCase().includes("injoon") || v.name.toLowerCase().includes("male"));
          utter.voice = mVoice || koVoices[0];
        }
      }
      window.speechSynthesis.speak(utter);
    }`;

normCode = normCode.replace(oldSpeakBlock, newSpeakBlock);

// switchCoach 인사말 오디오 연결
const oldSwitchIntro = `      // 코치 변경 시 인사말 음성 재생
      const profile = COACH_PROFILES[coachId];
      this.speak(profile.intro);`;

const newSwitchIntro = `      // 코치 변경 시 스튜디오급 뉴럴 성우 인사말 즉시 재생!
      const profile = COACH_PROFILES[coachId];
      this.speak(profile.intro, profile.introAudio);`;

normCode = normCode.replace(oldSwitchIntro, newSwitchIntro);

// sendQuickBubble 개선 (해당 버블 5종에 대한 고음질 뉴럴 성우 오디오 즉시 매칭)
const oldQuickBubble = `    sendQuickBubble(promptText) {
      this.sendMessage(promptText);
    }`;

const newQuickBubble = `    sendQuickBubble(promptText) {
      // 5대 퀵 버블에 대한 실사 성우 오디오 매핑
      let audioKey = null;
      if (promptText.includes('폭식') || promptText.includes('삼겹살')) audioKey = 'cheat';
      else if (promptText.includes('지치') || promptText.includes('귀찮')) audioKey = 'tired';
      else if (promptText.includes('무릎') || promptText.includes('시큰')) audioKey = 'knee';
      else if (promptText.includes('루틴') || promptText.includes('뱃살')) audioKey = 'routine';
      else if (promptText.includes('야식') || promptText.includes('라면')) audioKey = 'snack';

      const coach = (this.currentCoachId === 'luna' || this.currentCoachId === 'ellie') ? 'luna' : 'leo';
      const audioUrl = audioKey ? \`./assets/audio/careteam/\${coach}_bubble_\${audioKey}.mp3\` : null;

      this.sendMessage(promptText, audioUrl);
    }`;

normCode = normCode.replace(oldQuickBubble, newQuickBubble);

// sendMessage에 matchedAudioUrl 인자 추가 및 응답 시 재생
const oldSendMsgHead = `    async sendMessage(userText) {`;
const newSendMsgHead = `    async sendMessage(userText, matchedAudioUrl = null) {`;
normCode = normCode.replace(oldSendMsgHead, newSendMsgHead);

// sendMessage 내부의 this.speak(replyText) 호출 부분 교체
normCode = normCode.replace(`this.speak(replyText);`, `this.speak(replyText, matchedAudioUrl);`);

fs.writeFileSync(careTeamPath, normCode, 'utf8');
console.log('SUCCESS: careTeam.js updated with neural audio engine!');

// legacy_web careTeam.js 동기화
const careTeamPath2 = 'C:\\BeausCreators\\02.BSC_Branch\\sandbox\\Runnow_APP_V\\legacy_web\\careTeam.js';
fs.writeFileSync(careTeamPath2, normCode, 'utf8');
console.log('SUCCESS: Synced careTeam.js to legacy_web');
