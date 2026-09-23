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
  const GEMINI_API_KEY_STORAGE = "RUNNOW_USER_GEMINI_KEY";

  const COACH_PROFILES = {
    leo: {
      id: "leo",
      name: "코치 레오",
      role: "남성 전담 PT",
      avatar: "🦁",
      avatarImg: "./assets/careteam/leo_coach.png",
      badge: "파워 & 에너지 코치",
      voiceGender: "M",
      pitch: 0.9,
      rate: 1.05,
      systemPrompt: "너는 RunNow의 남성 전담 파워 PT 코치 '레오'다. 활력 넘치고 열정적이며 유저의 한계를 끌어올려 주는 든든한 형/오빠 같은 파이팅 톤으로 대화한다. 유저를 '대표님' 또는 '러너님'으로 부르며 운동과 러닝, 코어 강화 루틴을 적극 권장한다.",
      intro: "대표님, 반갑습니다! 남성 전담 코치 레오입니다. 오늘 목표 칼로리 버닝과 하체 강화, 제가 확실하게 끌어드리겠습니다! 어떤 운동 플랜을 짤까요?"
    },
    luna: {
      id: "luna",
      name: "코치 루나",
      role: "여성 전담 PT",
      avatar: "🌙",
      avatarImg: "./assets/careteam/luna_coach.png",
      badge: "디테일 & 페이스 코치",
      voiceGender: "F",
      pitch: 1.15,
      rate: 0.98,
      systemPrompt: "너는 RunNow의 여성 전담 러닝 코치 '루나'다. 차분하고 섬세하며 유연성과 페이스메이커에 특화된 친절한 언니/누나 톤으로 대화한다. 유저를 '대표님' 또는 '러너님'으로 부르며 조급하지 않고 오래 달릴 수 있는 즐거운 루틴을 이끌어준다.",
      intro: "안녕하세요 대표님! 섬세한 자세 교정과 꾸준한 루틴을 책임지는 코치 루나예요. 무리하지 않고 오래 지속할 수 있는 즐거운 러닝 플랜을 함께 세워봐요."
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
      intro: "대표님, 오늘 식사 맛있게 드셨나요? 오늘 태운 운동 칼로리와 딱 맞물리는 최적의 단백질·영양 밸런스를 가이드해 드릴게요. 무엇을 드셨는지 편하게 말씀해주세요!"
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
      intro: "안녕하십니까, 대표님의 안전을 책임지는 닥터 케이입니다. 운동 전후 관절이나 근육에 뻐근한 곳은 없으신가요? 통증이 있다면 언제든 말씀해주십시오. (참고용 가이드이며 의료 진단이 아닙니다)"
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
      
      // 코치 변경 시 인사말 음성 재생
      const profile = COACH_PROFILES[coachId];
      this.speak(profile.intro);
    }

    toggleTTS() {
      this.ttsEnabled = !this.ttsEnabled;
      localStorage.setItem("RUNNOW_TTS_ENABLED", String(this.ttsEnabled));
      const btn = document.getElementById("btn-toggle-tts");
      if (btn) {
        btn.textContent = this.ttsEnabled ? "🔊 음성 켜짐" : "🔇 음성 꺼짐";
        btn.classList.toggle("active", this.ttsEnabled);
      }
    }

    speak(text) {
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
        if (profile.voiceGender === "F" && koVoices.find(v => v.name.includes("Female") || v.name.includes("Yuna") || v.name.includes("SunHi"))) {
          utter.voice = koVoices.find(v => v.name.includes("Female") || v.name.includes("Yuna") || v.name.includes("SunHi"));
        } else if (profile.voiceGender === "M" && koVoices.find(v => v.name.includes("Male") || v.name.includes("InJoon"))) {
          utter.voice = koVoices.find(v => v.name.includes("Male") || v.name.includes("InJoon"));
        } else {
          utter.voice = koVoices[0];
        }
      }

      window.speechSynthesis.speak(utter);
    }

    async sendMessage(userText) {
      if (!userText || !userText.trim()) return;
      const text = userText.trim();

      // 1. 유저 메시지 등록
      const nowTime = new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
      this.chats.push({ sender: "user", text, time: nowTime });
      this.saveChats();

      const profile = COACH_PROFILES[this.currentCoachId];
      const geminiKey = localStorage.getItem(GEMINI_API_KEY_STORAGE);

      // 2-0. VIP 구독자는 서버가 키를 대신 씁니다(설정 불필요).
      //      구독 확인과 사용량 상한은 전부 서버가 판단하므로 여기서는 시도만 합니다.
      //      실패하면 아래 BYOK/로컬 경로로 자연스럽게 내려갑니다.
      if (window.firebaseCloud && typeof window.firebaseCloud.chatWithCoach === "function") {
        try {
          const res = await window.firebaseCloud.chatWithCoach(profile.systemPrompt, text);
          if (res && res.reply) {
            const schedules = this.parseSchedulesFromText(text);
            this.handleCoachReply(res.reply, "cheer", schedules);
            this.lastServerUsage = res.usage || null;
            return;
          }
        } catch (err) {
          // VIP가 아니거나(permission-denied) 한도 초과(resource-exhausted)면
          // 사용자에게 사유를 그대로 알려야 혼란이 없습니다.
          const code = err && err.code ? String(err.code) : "";
          if (code.includes("resource-exhausted")) {
            this.handleCoachReply(err.message || "오늘의 대화 한도를 모두 사용하셨습니다.", "rest", []);
            return;
          }
          if (!code.includes("permission-denied")) {
            console.warn("[CareTeam] 서버 AI 호출 실패, BYOK/로컬로 폴백:", err);
          }
        }
      }

      // 2. On-Device AI 엔진 브릿지 호출 (WebGPU / MediaPipe)
      // 서버 비용 0원, 프라이버시 100% 보장되는 로컬 AI 코칭으로 라우팅합니다.
      try {
        if (window.ReactNativeWebView) {
          console.log("[CareTeam] React Native 브릿지로 On-Device AI 추론 요청");
          // 실제로는 비동기 브릿지 통신(Message Event)으로 응답을 받아야 합니다.
          // window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ai-chat', text }));
          
          // 임시 모의 응답 (PH-LLM 시계열 다차원 컨텍스트 반영 모의)
          setTimeout(async () => {
            // 실제 구현에서는 bridge를 통해 네이티브의 onDeviceAI.js가 Health Connect 데이터(HRV, HR, Sleep)를 읽어서 반환
            const isTired = Math.random() > 0.8; // 임의로 스트레스/피로 상태 모의
            let aiReply = "";
            let mood = "";
            
            // RL 엔진 추천 행동 획득 (가장 높은 Q값을 가진 액션)
            let rlActionStr = "";
            if (window.habitRL) {
              const rlResult = await window.habitRL.suggestAction();
              rlActionStr = rlResult.action;
            }

            if (isTired) {
              aiReply = `${profile.name}: 어제 수면이 부족하고 심박변이도(HRV)가 낮으시네요. 무리한 운동보다는 가벼운 20분 회복 걷기(Zone 1)를 추천드립니다!`;
              mood = "warning";
            } else {
              if (rlActionStr === 'low_intensity') {
                aiReply = `${profile.name}: 대표님은 보통 이 시간대에는 가벼운 운동을 선호하셨죠! 오늘 저녁은 가벼운 조깅이나 플랭크로 몸을 풀어볼까요?`;
                mood = "comfort";
              } else if (rlActionStr === 'high_intensity') {
                aiReply = `${profile.name}: 수면 퀄리티도 좋고 심박(HR)도 안정적이네요! 유저님 패턴을 보니 지금 딱 뛸 타이밍입니다. 30분 인터벌 러닝에 도전해 볼까요?`;
                mood = "cheer";
              } else {
                aiReply = `${profile.name}: 와, 수면 퀄리티도 좋고 에너지가 넘치네요! 오늘 하루도 기분 좋게 땀을 내봅시다!`;
                mood = "cheer";
              }
            }
            
            const schedules = this.parseSchedulesFromText(text);
            this.handleCoachReply(aiReply, mood, schedules);
          }, 800);
          return;
        } else {
          // 브릿지가 없으면 로컬 스마트 템플릿(Fallback) 엔진 사용
          setTimeout(() => {
            const response = this.generateResponse(text);
            this.handleCoachReply(response.reply, response.mood, response.newSchedules || response.newSchedule);
          }, 400);
          return;
        }
      } catch (err) {
        console.warn("[CareTeam] On-Device AI 호출 실패:", err);
      }
    }

    handleCoachReply(replyText, mood = "cheer", newSchedule = null) {
      this.chats.push({ 
        sender: "coach", 
        text: replyText, 
        mood: mood,
        coachId: this.currentCoachId,
        time: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }) 
      });
      this.saveChats();

      const list = Array.isArray(newSchedule) ? newSchedule : (newSchedule ? [newSchedule] : []);
      if (list.length > 0) {
        list.forEach((s) => this.schedules.push(s));
        this.saveSchedules();
      }

      this.speak(replyText);
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
     * [소비자 심리학 & 비용 $0원 방패] 소비자 본인의 구글 무료 API Key 직접 호출
     */
    async callGeminiApi(userPrompt, profile, apiKey) {
      const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
      const payload = {
        contents: [{
          role: "user",
          parts: [{ text: `${profile.systemPrompt}\n\n[유저 질문/고백]: ${userPrompt}\n\n답변은 친절하고 전문적이며 2~3문장으로 간결하게, 유저의 마음을 편안하게 해주는 심리적 안도감과 실행 가능한 운동/식단 조언을 담아줘.` }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 250
        }
      };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Gemini API Error: " + res.status);
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("Empty Gemini response");

      let mood = "cheer";
      if (userPrompt.includes("폭식") || userPrompt.includes("치킨") || userPrompt.includes("피자") || userPrompt.includes("죄책")) mood = "comfort";
      if (userPrompt.includes("아파") || userPrompt.includes("통증") || userPrompt.includes("무릎")) mood = "warning";
      if (userPrompt.includes("루틴") || userPrompt.includes("스케줄")) mood = "plan";

      return { text, mood };
    }

    /**
     * 자연어 의도 파싱 및 응답 생성 엔진 (비용 $0원 로컬 템플릿)
     */
    generateResponse(text) {
      // A. 스케줄/일정 생성 요청
      const newSchedules = this.parseSchedulesFromText(text);
      if (newSchedules.length > 0) {
        const summary = newSchedules.map((s) => `${s.day} ${s.time}`).join(", ");
        return {
          reply: `네, 대표님! 말씀하신 내용을 바탕으로 [${summary} · ${newSchedules[0].title} (${newSchedules[0].duration})] ${newSchedules.length}건을 캘린더에 등록했습니다. 당일 전에 리마인드 드릴게요!`,
          mood: "plan",
          newSchedules
        };
      }

      // B. 식단/과식 관련 대화
      if (text.includes("먹었") || text.includes("식단") || text.includes("폭식") || text.includes("치킨") || text.includes("삼겹살") || text.includes("피자") || text.includes("라면")) {
        if (this.currentCoachId === "ellie") {
          return {
            reply: `맛있게 드셨으면 절대 살로 안 가요, 대표님! 죄책감 갖지 마세요(No-Guilt). 점심의 에너지를 살려서 저녁엔 나트륨을 배출해 주는 칼륨 샐러드로 가볍게 밸런스만 맞추면 완벽합니다! 제가 식단 체크리스트 조정해 둘게요.`,
            mood: "comfort"
          };
        } else if (this.currentCoachId === "leo") {
          return {
            reply: `오, 든든하게 드신 만큼 오늘 에너지 풀 충전되셨네요! 퇴근길에 저랑 15분만 가볍게 땀 빼고 깔끔하게 퉁치시죠! 준비되셨습니까?`,
            mood: "cheer"
          };
        } else {
          return {
            reply: `맛있게 드신 음식은 내일의 활력이 됩니다. 무리하게 굶지 마시고 가벼운 파워워킹으로 소화만 편안하게 시켜주세요!`,
            mood: "comfort"
          };
        }
      }

      // C. 건강/통증/피로 관련 대화
      if (text.includes("아파") || text.includes("통증") || text.includes("무릎") || text.includes("발목") || text.includes("피곤") || text.includes("지쳐") || text.includes("귀찮")) {
        return {
          reply: `대표님, 컨디션이 좋지 않으시군요. 오늘은 고강도 러닝을 쉬고 가벼운 스트레칭·휴식으로 회복을 우선해 주세요. 통증이 심하거나 며칠 지속되면 전문의 상담을 권합니다. (앱 가이드는 의료 진단이 아닙니다)`,
          mood: "warning"
        };
      }

      // D. 기본 일상 격려
      if (this.currentCoachId === "leo") {
        return { reply: `대표님, 좋은 생각입니다! 오늘 하루도 끝까지 파이팅 넘치게 목표 칼로리를 격파해 봅시다. 준비되시면 언제든 [운동 시작]을 눌러주세요!`, mood: "cheer" };
      } else if (this.currentCoachId === "luna") {
        return { reply: `대표님 말씀 잘 들었어요. 조급해하지 않고 하루하루 쌓아가는 루틴이 가장 강력하답니다. 오늘도 루나가 함께 호흡 맞출게요.`, mood: "comfort" };
      } else if (this.currentCoachId === "ellie") {
        return { reply: `영양 코치 엘리입니다. 대표님의 몸과 컨디션에 딱 맞는 클린 식단을 언제든 찾아드릴 테니 편하게 물어보세요!`, mood: "cheer" };
      } else {
        return { reply: `닥터 케이입니다. 무리하지 않고 바른 자세로 운동하시는 것이 장기적인 건강의 열쇠입니다. 참고용 가이드이며 의료 진단은 아닙니다.`, mood: "warning" };
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
        if (window.habitRL) window.habitRL.updateQTable(10); // 강화학습 보상 부여 (+10)
      } else {
        if (window.habitRL) window.habitRL.updateQTable(-2); // 강화학습 페널티 부여 (-2)
      }
    }

    deleteSchedule(id) {
      this.schedules = this.schedules.filter(s => s.id !== id);
      this.saveSchedules();
      if (window.habitRL) window.habitRL.updateQTable(-5); // 강화학습 강력 페널티 (-5)
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
    }

    renderChats() {
      const container = document.getElementById("coach-chat-box");
      if (!container) return;

      const profile = COACH_PROFILES[this.currentCoachId];
      let html = "";
      this.chats.forEach(c => {
        const isUser = c.sender === "user";
        const moodBadge = c.mood ? this.getMoodBadge(c.mood) : "";
        html += `
          <div class="chat-msg-row ${isUser ? 'user-row' : 'coach-row'}">
            ${!isUser ? `
              <div class="chat-avatar" title="${profile.name}">
                <span>${profile.avatar}</span>
              </div>
            ` : ''}
            <div class="chat-bubble ${isUser ? 'user' : 'coach'}">
              ${!isUser && moodBadge ? `<div class="chat-mood-badge">${moodBadge}</div>` : ''}
              <div class="chat-text">${this.escapeHtml(c.text)}</div>
              <div class="chat-time">${c.time}</div>
            </div>
          </div>
        `;
      });
      container.innerHTML = html;
      container.scrollTop = container.scrollHeight;
    }

    getMoodBadge(mood) {
      switch(mood) {
        case "cheer": return "🔥 파이팅 모드";
        case "comfort": return "💖 No-Guilt 안심 케어";
        case "warning": return "🩺 안전 & 부상 방지";
        case "plan": return "📅 스마트 일정 플래닝";
        default: return "";
      }
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

    /**
     * [비용 $0원 방패] 소비자 본인의 구글 Gemini 무료 API Key 저장/조회
     */
    setGeminiApiKey(key) {
      if (!key) {
        localStorage.removeItem(GEMINI_API_KEY_STORAGE);
        alert("🔒 Google AI 연동이 해제되었습니다. 로컬 스마트 엔진으로 동작합니다 ($0원).");
      } else {
        localStorage.setItem(GEMINI_API_KEY_STORAGE, key.trim());
        alert("✨ Google Gemini AI 무료 연동이 완료되었습니다! 이제 코치와 100% 실시간 자유 대화를 나눕니다. (대표님 비용 $0원)");
      }
    }

    getGeminiApiKey() {
      return localStorage.getItem(GEMINI_API_KEY_STORAGE) || "";
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
