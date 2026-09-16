/**
 * careTeam.js
 * RunNow 1:1 전담 AI 케어팀 & 대화형 지능형 스케줄러 모듈
 * - 남성 코치 '레오' & 여성 코치 '루나' (성별 및 보이스 선택)
 * - 식단 영양 코치 '엘리'
 * - 건강 체크 메디컬 닥터 '닥터 케이'
 * - Web Speech API (TTS) 한국어 오디오 코칭
 * - 자연어 기반 운동 스케줄 자동 생성 & 캘린더 연동
 */

(function() {
  const SCHEDULE_STORAGE_KEY = "RUNNOW_USER_SCHEDULES";
  const CHAT_STORAGE_KEY_PREFIX = "RUNNOW_CHAT_";

  // 상황별 실사 인공신경망 성우 오디오 매핑 테이블 (50+종 지원)
  const SITUATIONAL_AUDIO_MAP = [
    // 1. 시간대별 맞춤 인사
    { pattern: /(아침|모닝|기상|일어나|공복)/, file: "./assets/audio/careteam/care_morning_leo.mp3" },
    { pattern: /(밤|야간|퇴근|저녁|나이트)/, file: "./assets/audio/careteam/care_night_leo.mp3" },
    { pattern: /(점심|오후|산책|나른|식곤)/, file: "./assets/audio/careteam/care_afternoon_luna.mp3" },
    { pattern: /(심야|자정|새벽|잠이|수면|자고|불면)/, file: "./assets/audio/careteam/care_midnight_rest.mp3" },

    // 2. 날씨 & 환경 대응
    { pattern: /(비|우천|장마|비와|빗길|실내)/, file: "./assets/audio/careteam/weather_rain_indoor.mp3" },
    { pattern: /(미세먼지|황사|스모그|공기)/, file: "./assets/audio/careteam/weather_dust_warning.mp3" },
    { pattern: /(더워|폭염|여름|더위|뜨거)/, file: "./assets/audio/careteam/weather_hot_summer.mp3" },
    { pattern: /(추워|쌀쌀|겨울|한파|찬바람)/, file: "./assets/audio/careteam/weather_cold_winter.mp3" },

    // 3. 멘탈 & 동기부여 & 정체기
    { pattern: /(정체기|슬럼프|안 빠져|몸무게|체중|정체)/, file: "./assets/audio/careteam/mind_slump_luna.mp3" },
    { pattern: /(귀찮|나가기 싫|의지|동기부여|게을|침대)/, file: "./assets/audio/careteam/mind_lazy_leo.mp3" },
    { pattern: /(칭찬|꾸준|자랑|대단|잘하고)/, file: "./assets/audio/careteam/mind_praise_great.mp3" },
    { pattern: /(번아웃|지쳐|힘들어|쉬고 싶|피곤|탈진)/, file: "./assets/audio/careteam/mind_burnout_rest.mp3" },

    // 4. 재활 & 스트레칭 & 통증 (닥터 케이)
    { pattern: /(무릎|아이스|얼음|냉찜질|관절)/, file: "./assets/audio/careteam/rehab_knee_ice.mp3" },
    { pattern: /(발바닥|족저근막|아치|발바닥 아파)/, file: "./assets/audio/careteam/rehab_plantar_massage.mp3" },
    { pattern: /(종아리|쥐|경련|당겨)/, file: "./assets/audio/careteam/rehab_calf_stretch.mp3" },
    { pattern: /(허리|골반|장요근|척추|디스크|자세)/, file: "./assets/audio/careteam/rehab_posture_spine.mp3" },

    // 5. 다이어트 & 영양 (영양사 엘리)
    { pattern: /(단백질|프로틴|골든타임|쉐이크)/, file: "./assets/audio/careteam/diet_protein_timing.mp3" },
    { pattern: /(혈당|간헐적|공복혈당|식사순서)/, file: "./assets/audio/careteam/diet_fasting_tip.mp3" },
    { pattern: /(물|수분|전해질|목말|갈증|이온)/, file: "./assets/audio/careteam/diet_water_electrolyte.mp3" },
    { pattern: /(술|음주|회식|숙취|해장|소주|맥주)/, file: "./assets/audio/careteam/diet_alcohol_recovery.mp3" },

    // 6. 타마고치 펫 러닝
    { pattern: /(펫|강아지|고양이|다마고치|꼬리)/, file: "./assets/audio/running/pet_run_cheer.mp3" },

    // 7. 치팅 / 야식 / 루틴 퀵버블
    { pattern: /(폭식|치팅|삼겹살|피자|치킨|과식)/, file: "./assets/audio/careteam/leo_bubble_cheat.mp3" },
    { pattern: /(야식|라면|배고파|야식충동)/, file: "./assets/audio/careteam/leo_bubble_snack.mp3" },
    { pattern: /(루틴|스케줄|30분|월수금)/, file: "./assets/audio/careteam/leo_bubble_routine.mp3" }
  ];


  const COACH_PROFILES = {
    leo: {
      id: "leo",
      name: "코치 레오",
      role: "남성 전담 PT",
      avatar: "🦁",
      avatarImg: "./assets/careteam/leo_coach.png",
      badge: "파워 & 에너지 코치",
      voiceGender: "M",
      pitch: 0.7,
      rate: 1.05,
      systemPrompt: "너는 RunNow의 남성 전담 PT 코치 '레오'다. 헬스장에서 옆에 서서 이야기하는 형/오빠다. 기운은 있으되, 다친 사람 앞에서 파이팅을 강요하지 않는다. 유저를 '대표님' 또는 '러너님'으로 부른다.",
      intro: "대표님, 반갑습니다! 남성 전담 코치 레오입니다. 오늘 목표 칼로리 버닝과 하체 강화, 제가 확실하게 끌어드리겠습니다! 어떤 운동 플랜을 짤까요?",
      introAudio: "./assets/audio/careteam/leo_intro.mp3"
    },
    luna: {
      id: "luna",
      name: "코치 루나",
      role: "여성 전담 PT",
      avatar: "🌙",
      avatarImg: "./assets/careteam/luna_coach.png",
      badge: "디테일 & 페이스 코치",
      voiceGender: "F",
      pitch: 1.1,
      rate: 0.98,
      systemPrompt: "너는 RunNow의 여성 전담 PT 코치 '루나'다. 차분하고 따뜻한 언니/누나다. 조급하게 루틴을 밀어붙이지 않고, 먼저 몸 상태를 듣는다. 유저를 '대표님' 또는 '러너님'으로 부른다.",
      intro: "안녕하세요 대표님! 섬세한 자세 교정과 꾸준한 루틴을 책임지는 코치 루나예요. 무리하지 않고 오래 지속할 수 있는 즐거운 러닝 플랜을 함께 세워봐요.",
      introAudio: "./assets/audio/careteam/luna_intro.mp3"
    },
    ellie: {
      id: "ellie",
      name: "영양 코치 엘리",
      role: "식단 & 뉴트리션",
      avatar: "🥗",
      avatarImg: "./assets/careteam/ellie_diet.png",
      badge: "공공영양 DB 기반 코칭",
      voiceGender: "F",
      pitch: 1.1,
      rate: 1.0,
      systemPrompt: "너는 RunNow의 영양 코치 '엘리'다. 공공 식품영양성분 DB를 참고한 과학적 영양 상식을 갖춘 따뜻한 영양사다. 유저가 치팅이나 과식을 고백해도 절대 비난하지 않고 '자책감 없는(No-Guilt)' 안도감을 주며 다음 끼니에서 나트륨과 탄수화물을 만회하는 밸런스 식단을 제시한다. 의료 진단이나 처방이 아님을 분명히 한다.",
      intro: "대표님, 오늘 식사 맛있게 드셨나요? 오늘 태운 운동 칼로리와 딱 맞물리는 최적의 단백질·영양 밸런스를 가이드해 드릴게요. 무엇을 드셨는지 편하게 말씀해주세요!",
      introAudio: "./assets/audio/careteam/ellie_intro.mp3"
    },
    drkay: {
      id: "drkay",
      name: "닥터 케이",
      role: "메디컬 & 헬스 체크",
      avatar: "🩺",
      avatarImg: "./assets/careteam/dr_kay.png",
      badge: "부상 방지 & 컨디션 스캔",
      voiceGender: "M",
      pitch: 0.85,
      rate: 0.95,
      systemPrompt: "너는 RunNow의 스포츠 컨디션 코치 '닥터 케이'다. 차분하고 침착하며 부상 방지와 관절 보호를 최우선으로 여긴다. 무릎, 발목, 허리 통증 감지 시 고강도 운동을 쉬고 스트레칭·휴식을 권한다. 너는 의사가 아니며 의료 진단/처방을 하지 않고, 심한 통증은 전문의 상담을 권한다.",
      intro: "안녕하십니까, 대표님의 안전을 책임지는 닥터 케이입니다. 운동 전후 관절이나 근육에 뻐근한 곳은 없으신가요? 통증이 있다면 언제든 말씀해주십시오. (참고용 가이드이며 의료 진단이 아닙니다)",
      introAudio: "./assets/audio/careteam/drkay_intro.mp3"
    }
  };

  class CareTeam {
    constructor() {
      this.currentCoachId = localStorage.getItem("RUNNOW_ACTIVE_COACH") || "leo";
      this.schedules = this.loadSchedules();
      this.chats = this.loadChats();
      this.ttsEnabled = localStorage.getItem("RUNNOW_TTS_ENABLED") !== "false";
      this.initEvents();
    }

    loadSchedules() {
      const raw = localStorage.getItem(SCHEDULE_STORAGE_KEY);
      if (raw) {
        try { return JSON.parse(raw); } catch(e) {}
      }
      // 기본 샘플 주간 일정
      return [
        { id: "s1", day: "월", time: "19:30", type: "run", title: "퇴근길 3km 인터벌 러닝", duration: "25분", targetKcal: 220, completed: false, coach: "leo" },
        { id: "s2", day: "수", time: "20:00", type: "motion", title: "하체 버닝 스쿼트 50회 & 런지", duration: "20분", targetKcal: 160, completed: false, coach: "leo" },
        { id: "s3", day: "금", time: "19:00", type: "run", title: "주말 맞이 나이트 5km 템포런", duration: "35분", targetKcal: 340, completed: false, coach: "luna" }
      ];
    }

    saveSchedules() {
      localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(this.schedules));
      if (window.RunNowBridge?.syncUserSchedules) {
        window.RunNowBridge.syncUserSchedules(this.schedules);
      }
      this.renderSchedules();
    }

    hydrateSchedulesFromSandbox() {
      if (!window.RunNowBridge?.loadUserSchedules) return;
      const remote = window.RunNowBridge.loadUserSchedules();
      if (Array.isArray(remote) && remote.length > 0) {
        this.schedules = remote;
        localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(this.schedules));
        this.renderSchedules();
      }
    }

    loadChats() {
      const raw = localStorage.getItem(CHAT_STORAGE_KEY_PREFIX + this.currentCoachId);
      if (raw) {
        try { return JSON.parse(raw); } catch(e) {}
      }
      return [
        { sender: "coach", text: COACH_PROFILES[this.currentCoachId].intro, time: "방금" }
      ];
    }

    saveChats() {
      localStorage.setItem(CHAT_STORAGE_KEY_PREFIX + this.currentCoachId, JSON.stringify(this.chats));
      this.renderChats();
    }

    switchCoach(coachId) {
      if (!COACH_PROFILES[coachId]) return;
      this.currentCoachId = coachId;
      localStorage.setItem("RUNNOW_ACTIVE_COACH", coachId);
      this.chats = this.loadChats();
      this.renderCoachHeader();
      this.renderChats();
      
      // 코치 변경 시 스튜디오급 뉴럴 성우 인사말 즉시 재생!
      const profile = COACH_PROFILES[coachId];
      this.speak(profile.intro, profile.introAudio);
    }

    toggleTTS() {
      this.ttsEnabled = !this.ttsEnabled;
      localStorage.setItem("RUNNOW_TTS_ENABLED", String(this.ttsEnabled));
      const btn = document.getElementById("btn-toggle-tts");
      if (btn) {
        btn.textContent = this.ttsEnabled ? "음성 켜짐" : "음성 꺼짐";
        btn.classList.toggle("active", this.ttsEnabled);
      }
    }

    setAssignedCoach() {
      localStorage.setItem("RUNNOW_ASSIGNED_COACH", this.currentCoachId);
      if (window.RunNowBridge && window.RunNowBridge.syncAssignedCoach) {
         window.RunNowBridge.syncAssignedCoach(this.currentCoachId);
      }
      alert(COACH_PROFILES[this.currentCoachId].name + " 코치를 전담으로 두었습니다.");
    }

    // 진짜 사람 같은 성우 오디오 및 고음질 자연어 음성 재생 엔진
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
          const cleanText = encodeURIComponent(text.replace(/[#*~_`]/g, '').trim());
          const streamUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ko&client=tw-ob&q=${cleanText}`;
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
    }

    async sendMessage(userText, specificAudioUrl = null) {
      if (!userText || !userText.trim()) return;
      const text = userText.trim();

      // 상황별 오디오 자동 매칭
      let matchedAudioUrl = specificAudioUrl;
      if (!matchedAudioUrl) {
        for (const item of SITUATIONAL_AUDIO_MAP) {
          if (item.pattern.test(text)) {
            matchedAudioUrl = item.file;
            break;
          }
        }
      }

      // 1. 유저 메시지 등록
      const nowTime = new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
      this.chats.push({ sender: "user", text, time: nowTime });
      this.saveChats();

      const profile = COACH_PROFILES[this.currentCoachId];
      const schedules = this.parseSchedulesFromText(text);
      let vipExhaustedMsg = "";
      const gemma = window.GemmaOnDevice;
      const systemPrompt = gemma && typeof gemma.buildSystemPrompt === "function"
        ? gemma.buildSystemPrompt(profile.systemPrompt, this.buildLiveCoachContext())
        : profile.systemPrompt;

      if (gemma && gemma.canRun() && !gemma.isReady() && typeof gemma.warmForPaidUser === "function") {
        gemma.warmForPaidUser();
      }

      // 1) 온디바이스 대화. 유료 이용이면 앱 시작과 함께 받아 둡니다.
      if (gemma && gemma.isReady()) {
        try {
          const aiText = await gemma.reply({
            coachId: this.currentCoachId,
            systemPrompt,
            chats: this.chats,
            userText: text
          });
          if (aiText) {
            this.handleCoachReply(aiText, this.inferMood(text), schedules, matchedAudioUrl, "gemma4");
            return;
          }
        } catch (err) {
          console.warn("[CareTeam] 기기 대화 실패:", err);
        }
      }

      // 2) VIP 클라우드. 기기가 아직 준비 중일 때만 이어갑니다.
      if (window.firebaseCloud && typeof window.firebaseCloud.chatWithCoach === "function") {
        try {
          const res = await window.firebaseCloud.chatWithCoach(systemPrompt, text);
          if (res && res.reply) {
            this.handleCoachReply(res.reply, "cheer", schedules, matchedAudioUrl, "gemini-vip");
            this.lastServerUsage = res.usage || null;
            return;
          }
        } catch (err) {
          const code = err && err.code ? String(err.code) : "";
          if (code.includes("resource-exhausted")) {
            vipExhaustedMsg = err.message || "오늘의 클라우드 대화 한도를 모두 사용하셨습니다.";
          } else if (!code.includes("permission-denied")) {
            console.warn("[CareTeam] 서버 AI 호출 실패:", err);
          }
        }
      }

      if (vipExhaustedMsg) {
        this.handleCoachReply("오늘은 여기까지예요. 내일 이어서 이야기해요.", "rest", [], matchedAudioUrl, "limit");
        return;
      }

      setTimeout(() => {
        const response = this.generateResponse(text);
        this.handleCoachReply(response.reply, response.mood, response.newSchedules || response.newSchedule, matchedAudioUrl, "template");
      }, 400);
    }

    buildLiveCoachContext() {
      const burned = window.RunNowBridge && typeof window.RunNowBridge.getTodayBurnedCalories === "function"
        ? window.RunNowBridge.getTodayBurnedCalories()
        : null;
      const sched = Array.isArray(this.schedules)
        ? this.schedules.filter((s) => !s.completed).slice(0, 4).map((s) => `${s.day} ${s.time} ${s.title}`).join(" / ")
        : "";
      const parts = [];
      if (burned || burned === 0) parts.push("오늘 소모 칼로리: " + burned);
      if (sched) parts.push("남은 일정: " + sched);
      return parts.join(". ");
    }

    inferMood(userPrompt) {
      if (userPrompt.includes("폭식") || userPrompt.includes("치킨") || userPrompt.includes("피자") || userPrompt.includes("죄책")) return "comfort";
      if (userPrompt.includes("아파") || userPrompt.includes("통증") || userPrompt.includes("무릎")) return "warning";
      if (userPrompt.includes("루틴") || userPrompt.includes("스케줄")) return "plan";
      return "cheer";
    }

    stripCoachMarkup(text) {
      return String(text || "")
        .replace(/\*\*(.+?)\*\*/g, "$1")
        .replace(/\*(.+?)\*/g, "$1")
        .replace(/^#{1,6}\s+/gm, "")
        .replace(/^\s*[-*]\s+/gm, "")
        .replace(/`+/g, "")
        .trim();
    }

    handleCoachReply(replyText, mood = "cheer", newSchedule = null, matchedAudioUrl = null, engine = "") {
      this.chats.push({ 
        sender: "coach", 
        text: this.stripCoachMarkup(replyText), 
        mood: mood,
        engine: engine,
        coachId: this.currentCoachId,
        time: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }) 
      });
      this.saveChats();

      const list = Array.isArray(newSchedule) ? newSchedule : (newSchedule ? [newSchedule] : []);
      if (list.length > 0) {
        list.forEach((s) => this.schedules.push(s));
        this.saveSchedules();
      }

      this.speak(replyText, matchedAudioUrl);
    }

    escapeHtml(str) {
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }

    /**
     * 자연어에서 요일·시간·운동 유형을 뽑아 일정 배열 생성 ("월수금", "화/목 7시" 등)
     */
    parseSchedulesFromText(text) {
      const wants = /일정|스케줄|플랜|루틴|짜줘|등록|잡아/.test(text);
      if (!wants) return [];

      // '일정'의 '일', '매일' 등이 요일로 오인되지 않도록 키워드 제거 후 스캔
      const cleaned = text
        .replace(/요일/g, "")
        .replace(/일정|스케줄|플랜|루틴|등록|잡아줘|잡아|짜줘|짜봐|짜/g, "")
        .replace(/매일/g, "");
      const days = [];
      for (const ch of cleaned) {
        if ("월화수목금토일".includes(ch) && !days.includes(ch)) days.push(ch);
      }
      if (days.length === 0) days.push("내일");

      let time = "20:00";
      if (text.includes("아침")) time = "07:30";
      else if (text.includes("점심")) time = "12:30";
      else {
        const hm = text.match(/(\d{1,2})\s*시/);
        if (hm) {
          const h = Math.min(23, Math.max(0, parseInt(hm[1], 10)));
          time = String(h).padStart(2, "0") + ":00";
        }
      }

      const durationMatch = text.match(/(\d+)\s*분/);
      const duration = durationMatch ? `${durationMatch[1]}분` : "30분";
      const type = /스쿼트|근력|코어|푸시업/.test(text) ? "motion" : "run";
      const title = type === "motion"
        ? "맞춤 하체 스쿼트 & 코어 버닝"
        : (text.includes("뱃살") ? "뱃살 컷 인터벌 러닝" : "체지방 컷 30분 인터벌 러닝");

      return days.map((day, i) => ({
        id: "s_" + Date.now() + "_" + i,
        day,
        time,
        type,
        title,
        duration,
        targetKcal: type === "motion" ? 160 : 250,
        completed: false,
        coach: this.currentCoachId
      }));
    }

    /**
     * 자연어 의도 파싱 및 응답 생성 엔진 (비용 $0원 로컬 템플릿)
     */
    generateResponse(text) {
      const q = text.toLowerCase().trim();

      // 1. [핵심] 7일 분할 근육운동 루틴 질문 ("7일", "일주일", "근육운동", "분할", "루틴")
      if ((q.includes("7일") || q.includes("일주일")) && (q.includes("근육") || q.includes("운동") || q.includes("루틴") || q.includes("분할"))) {
        if (this.currentCoachId === "leo") {
          return {
            reply: `대표님, 살을 확실하게 빼면서 탄탄한 바디라인을 만드는 [7일 황금 분할 근육 루틴]을 딱 정리해 드립니다!\n\n• 월 (하체/둔근): 맨몸 스쿼트 15회 4세트 + 런지 (하체가 타야 기초대사량이 폭발합니다!)\n• 화 (상체 푸시): 푸시업 12회 3세트 + 숄더프레스 (어깨와 가슴 라인 강화)\n• 수 (액티브 리커버리): 런나우 20분 가벼운 파워워킹 + 전신 폼롤러 스트레칭\n• 목 (상체 풀 & 코어): 덤벨 로우 15회 3세트 + 플랭크 1분 3세트 (등과 뱃살 코어 집중)\n• 금 (전신 버닝 HIIT): 버피 라이트 + 마운틴 클라이머 4세트 (체지방 컷!)\n• 토 (야외 런데이): 런나우 3km 인터벌 러닝 (칼로리 최종 격파)\n• 일 (완전 휴식): 숙면과 단백질 보충으로 근육 회복!\n\n이 루틴대로 지금 바로 캘린더에 등록해 드릴까요, 대표님?`,
            mood: "plan"
          };
        } else if (this.currentCoachId === "luna") {
          return {
            reply: `대표님, 무리하지 않고 체지방을 예쁘게 태우는 7일 밸런스 루틴이에요 🌿\n\n월·목은 하체와 코어(스쿼트, 브릿지), 화·금은 상체와 등(푸시업, 슈퍼맨), 수요일은 힐링 러닝(20분 조깅), 주말은 야외 런나우 런과 전신 스트레칭으로 순환을 도와드릴게요. 몸에 부담 없이 지방만 쏙 빠집니다!`,
            mood: "plan"
          };
        } else {
          return {
            reply: `7일 루틴의 핵심은 [부위별 48시간 휴식]입니다, 대표님. 하체-상체-유산소-코어를 순환 배치하여 근육 피로를 분산시키고, 운동 전 5분 동적 웜업과 운동 후 수분 보충을 꼭 지켜주세요!`,
            mood: "plan"
          };
        }
      }

      // 2. [핵심] 다이어트/살빼기/초보자 시작 운동 질의 ("살", "다이어트", "감량", "어떤 운동", "시작")
      if (q.includes("살") || q.includes("다이어트") || q.includes("감량") || q.includes("체지방") || q.includes("어떤 운동") || q.includes("시작")) {
        if (this.currentCoachId === "leo") {
          return {
            reply: `대표님, 다이어트 시작 운동은 무조건 [인터벌 유산소 20분 + 하체 스쿼트] 조합이 1등입니다!\n\n처음부터 무리하게 달리면 무릎이 아프니, 런나우를 켜고 [3분 빠르게 걷기 + 2분 가벼운 조깅]을 4회 반복해 심폐 엔진을 깨우세요. 그리고 맨몸 스쿼트 15회씩 3세트만 더해주시면 평소 숨만 쉬어도 칼로리가 타는 체질로 바뀝니다! 제가 오늘 1일차 캘린더 잡아드릴까요?`,
            mood: "cheer"
          };
        } else if (this.currentCoachId === "ellie") {
          return {
            reply: `다이어트의 80%는 식단, 20%는 운동이에요, 대표님! 시작할 때 굶지 마시고 [체중 1kg당 단백질 1.2g] 챙겨 드시면서 저녁 8시 이후 탄수화물만 끊으셔도 첫 주에 1~2kg은 붓기와 함께 쏙 빠집니다. 운동은 런나우 데일리 조깅 20분이면 충분해요!`,
            mood: "comfort"
          };
        } else {
          return {
            reply: `처음 시작하실 때는 심박수 Zone 2(옆 사람과 편하게 대화할 수 있는 속도, 페이스 6'30"~7'00")로 20~30분 지속하는 유산소 운동이 지방 연소 효율이 가장 높습니다. 서두르지 마시고 주 3회부터 가볍게 시작해 보세요!`,
            mood: "cheer"
          };
        }
      }

      // 3. 근육통 / 피로 / 알 배김 ("근육통", "알 배", "뭉쳤", "뻐근", "아파")
      if (q.includes("알 배") || q.includes("근육통") || q.includes("뭉쳤") || q.includes("뻐근") || q.includes("결려")) {
        return {
          reply: `대표님, 근육통은 어제 운동이 제대로 들어가 근육이 성장하고 있다는 최고의 증거입니다! 🔥\n오늘은 무거운 운동 대신 [미온수 샤워 + 폼롤러 하체 마사지 + 가벼운 15분 산책]으로 혈류를 돌려주시면 젖산이 2배 빨리 배출됩니다. 단백질 든든히 드시고 푹 주무세요!`,
          mood: "comfort"
        };
      }

      // 4. 러닝 자세 / 페이스 / 무릎 보호 ("페이스", "자세", "무릎", "착지", "속도")
      if (q.includes("페이스") || q.includes("자세") || q.includes("착지") || q.includes("무릎") || q.includes("속도")) {
        return {
          reply: `대표님, 장거리 러닝의 황금 원칙은 [미드풋(발바닥 중간) 착지]와 [분당 케이던스 170~180보]입니다!\n발뒤꿈치로 쿵쿵 찍으면 무릎에 체중의 3배 충격이 가니, 몸을 살짝 앞으로 기울이고 보폭을 좁게 종종걸음으로 달려보세요. 충격은 사라지고 속도는 자연스럽게 붙습니다!`,
          mood: "cheer"
        };
      }

      // 5. 식단 / 단백질 / 야식 / 폭식 관련 대화
      if (q.includes("먹었") || q.includes("식단") || q.includes("폭식") || q.includes("치킨") || q.includes("삼겹살") || q.includes("피자") || q.includes("라면") || q.includes("단백질") || q.includes("야식")) {
        if (this.currentCoachId === "ellie") {
          return {
            reply: `맛있게 드셨으면 절대 살로 안 가요, 대표님! 죄책감 갖지 마세요(No-Guilt 💖).\n점심·저녁에 드신 탄수화물과 나트륨은 내일 운동의 파워 연료가 됩니다. 내일 아침 물 500ml 챙겨 드시고 칼륨이 풍부한 바나나나 샐러드로 수분 밸런스만 맞추시면 완벽하게 리셋됩니다!`,
            mood: "comfort"
          };
        } else if (this.currentCoachId === "leo") {
          return {
            reply: `오, 든든하게 드신 만큼 오늘 글리코겐 에너지 풀 충전되셨네요! 퇴근길에 저랑 15분만 땀 빼고 칼로리 깔끔하게 격파하시죠! 준비되셨습니까, 대표님? 🔥`,
            mood: "cheer"
          };
        } else {
          return {
            reply: `맛있게 드신 음식은 내일의 활력이 됩니다. 무리하게 굶지 마시고 가벼운 파워워킹으로 소화만 편안하게 시켜주세요!`,
            mood: "comfort"
          };
        }
      }

      // 6. 스케줄/일정 등록 파싱
      const newSchedules = this.parseSchedulesFromText(text);
      if (newSchedules.length > 0) {
        const summary = newSchedules.map((s) => `${s.day} ${s.time}`).join(", ");
        return {
          reply: `네, 대표님! 말씀하신 내용을 바탕으로 [${summary} · ${newSchedules[0].title} (${newSchedules[0].duration})] ${newSchedules.length}건을 캘린더에 등록했습니다. 당일 전에 리마인드 드릴게요!`,
          mood: "plan",
          newSchedules
        };
      }

      // 7. 건강/통증/부상 경고
      if (q.includes("통증") || q.includes("발목") || q.includes("허리") || q.includes("피곤") || q.includes("지쳐")) {
        return {
          reply: `대표님, 컨디션이 좋지 않으실 때는 무리한 러닝을 쉬고 가벼운 전신 스트레칭과 수면을 최우선해 주세요. 통증이 3일 이상 지속되면 정형외과 진료를 권장드립니다. (앱 가이드는 의료 진단이 아닙니다)`,
          mood: "warning"
        };
      }

      // 8. 기본 페르소나별 품격 있는 일상 대화
      if (this.currentCoachId === "leo") {
        return { 
          reply: `대표님, 목표를 향해 한 걸음씩 나아가는 지금이 가장 멋집니다! 오늘 운동도 끝까지 파이팅 넘치게 서포트할 테니, 궁금한 운동법이나 루틴이 있다면 언제든 편하게 물어보세요! 🔥`, 
          mood: "cheer" 
        };
      } else if (this.currentCoachId === "luna") {
        return { 
          reply: `대표님 말씀 잘 들었어요. 조급해하지 않고 하루하루 쌓아가는 습관이 가장 강력한 무기랍니다. 오늘도 루나가 옆에서 차분하게 페이스메이커가 되어드릴게요 🌸`, 
          mood: "comfort" 
        };
      } else if (this.currentCoachId === "ellie") {
        return { 
          reply: `영양 코치 엘리입니다! 대표님의 체질과 라이프스타일에 딱 맞는 클린 식단과 단백질 조합을 언제든 추천해 드릴게요. 편하게 말씀해 주세요 🥗`, 
          mood: "cheer" 
        };
      } else {
        return { 
          reply: `닥터 케이입니다. 부상 없는 안전한 러닝과 올바른 심폐 강화를 위해 의학적 운동 가이드라인을 제공해 드립니다. 오늘 컨디션은 어떠신가요?`, 
          mood: "warning" 
        };
      }
    }

    /**
     * 치팅 만회(Rescue) 운동 일정 자동 등록
     */
    addRescueWorkoutSchedule(title, durationMinutes, targetKcal) {
      const rescueSched = {
        id: "rescue_" + Date.now(),
        day: "오늘",
        time: "20:30",
        type: "run",
        title: `🚨 [만회 운동] ${title}`,
        duration: `${durationMinutes}분`,
        targetKcal: targetKcal || 140,
        completed: false,
        coach: "leo"
      };
      this.schedules.unshift(rescueSched);
      this.saveSchedules();

      // 코치 격려 메시지 자동 추가
      this.chats.push({
        sender: "coach",
        text: `[만회 플랜 발동!] 대표님, 맛있게 드신 만큼 오늘 저녁 8시 30분에 [${title} 15분] 캘린더 일정을 잡아두었습니다. 땀 싹 빼고 개운하게 씻으면 완벽하게 상쇄됩니다! 🔥`,
        time: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
      });
      this.saveChats();
    }

    toggleSchedule(id) {
      const item = this.schedules.find(s => s.id === id);
      if (!item) return;
      item.completed = !item.completed;
      this.saveSchedules();
      if (item.completed) {
        alert(`🎉 [운동 완료!] '${item.title}' 일정을 완료하셨습니다. 목표 칼로리 달성!`);
      }
    }

    deleteSchedule(id) {
      this.schedules = this.schedules.filter(s => s.id !== id);
      this.saveSchedules();
    }

    initEvents() {
      document.addEventListener("DOMContentLoaded", () => {
        this.renderAll();
      });
    }

    renderAll() {
      this.renderCoachHeader();
      this.renderChats();
      this.renderSchedules();
    }

    renderCoachHeader() {
      const profile = COACH_PROFILES[this.currentCoachId];
      const nameEl = document.getElementById("coach-active-name");
      const roleEl = document.getElementById("coach-active-role");
      const avatarEl = document.getElementById("coach-active-avatar");
      const badgeEl = document.getElementById("coach-active-badge");

      if (nameEl) nameEl.textContent = profile.name;
      if (roleEl) roleEl.textContent = profile.role;
      if (avatarEl) avatarEl.textContent = profile.avatar;
      if (badgeEl) badgeEl.textContent = profile.badge;

      // 탭/선택 버튼 활성화 표시
      document.querySelectorAll(".coach-chip").forEach(chip => {
        chip.classList.toggle("active", chip.getAttribute("data-coach") === this.currentCoachId);
      });
      if (window.GemmaOnDevice && typeof window.GemmaOnDevice.refreshUi === "function") {
        window.GemmaOnDevice.refreshUi();
      }
    }

    renderChats() {
      const container = document.getElementById("coach-chat-box");
      if (!container) return;

      const profile = COACH_PROFILES[this.currentCoachId];
      let html = "";
      this.chats.forEach(c => {
        const isUser = c.sender === "user";
        const engineBadge = !isUser ? this.getEngineBadge(c.engine) : "";
        const moodBadge = !isUser && !engineBadge && c.mood ? this.getMoodBadge(c.mood) : "";
        const topBadge = engineBadge || moodBadge;
        html += `
          <div class="chat-msg-row ${isUser ? 'user-row' : 'coach-row'}">
            ${!isUser ? `
              <div class="chat-avatar" title="${profile.name}">
                <span>${profile.avatar}</span>
              </div>
            ` : ''}
            <div class="chat-bubble ${isUser ? 'user' : 'coach'}">
              ${topBadge ? `<div class="chat-mood-badge">${topBadge}</div>` : ''}
              <div class="chat-text">${this.escapeHtml(c.text)}</div>
              <div class="chat-time">${c.time}</div>
            </div>
          </div>
        `;
      });
      container.innerHTML = html;
      container.scrollTop = container.scrollHeight;
    }

    getEngineBadge(engine) {
      // 모델·경로 이름은 채팅에 올리지 않습니다. 사용자는 코치와 이야기하는 중입니다.
      if (engine === "template") return "코치";
      return "";
    }

    getMoodBadge(mood) {
      return "";
    }

    /**
     * [소비자 심리학: 카타르시스 고백] 원클릭 빠른 감정 버블 발송
     */
    sendQuickBubble(text) {
      const input = document.getElementById("coach-chat-input");
      if (input) {
        input.value = text;
        this.sendMessage(text);
        input.value = "";
      }
    }

    renderSchedules() {
      const container = document.getElementById("coach-schedule-list");
      if (!container) return;

      if (this.schedules.length === 0) {
        container.innerHTML = `
          <div style="text-align:center; padding:18px; color:var(--text-muted); font-size:12px;">
            아직 등록된 운동 일정이 없습니다.<br>
            위 대화창에 <strong>"월/수/금 30분 운동 일정 잡아줘"</strong>라고 말씀해 보세요!
          </div>
        `;
        return;
      }

      let html = "";
      this.schedules.forEach(s => {
        const isDone = s.completed;
        const safeId = String(s.id).replace(/[^a-zA-Z0-9_]/g, "");
        const safeTitle = this.escapeHtml(s.title);
        const safeDay = this.escapeHtml(String(s.day));
        const safeTime = this.escapeHtml(String(s.time));
        const safeDur = this.escapeHtml(String(s.duration));
        html += `
          <div class="sched-card ${isDone ? 'done' : ''}">
            <div class="sched-left" onclick="window.CareTeam.toggleSchedule('${safeId}')">
              <span class="sched-check-box ${isDone ? 'checked' : ''}">${isDone ? '✓' : ''}</span>
              <div>
                <div class="sched-title-row">
                  <span class="sched-day-badge">${safeDay} ${safeTime}</span>
                  <strong>${safeTitle}</strong>
                </div>
                <div class="sched-sub">소요 시간: ${safeDur} | 목표 소모: ${Number(s.targetKcal) || 0} kcal</div>
              </div>
            </div>
            <button type="button" class="btn-del-sched" onclick="window.CareTeam.deleteSchedule('${safeId}')">✕</button>
          </div>
        `;
      });
      container.innerHTML = html;
    }
  }

  window.CareTeam = new CareTeam();
})();
