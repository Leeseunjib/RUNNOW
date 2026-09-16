// 케어팀용 온디바이스 대화 엔진 (LiteRT-LM · WebGPU)
// 화면에는 모델 이름을 올리지 않습니다. 실패해도 코치 대화는 다른 경로로 이어집니다.
(function () {
  const MODEL_ID = "gemma-4-E2B-it";
  const MODEL_URL = "https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm/resolve/main/gemma-4-E2B-it-web.litertlm";
  // 최신 +esm은 배포마다 WASM 초기화 방식이 바뀝니다. 버전을 고정합니다.
  const ENGINE_CDN = "https://cdn.jsdelivr.net/npm/@litert-lm/core@0.17.0/+esm";
  const HISTORY_LIMIT = 8;

  let engine = null;
  let conversation = null;
  let conversationCoachId = null;
  let state = "idle"; // idle | downloading | ready | error | unsupported
  let lastError = "";
  let loadPromise = null;

  function canRun() {
    return typeof navigator !== "undefined" && Boolean(navigator.gpu);
  }

  function isReady() {
    return state === "ready" && engine;
  }

  // WASM/엔진 내부 문구는 사용자에게 그대로 보여 주지 않습니다.
  function userSafeError(err) {
    const raw = String((err && err.message) || err || "");
    if (/noExitRuntime|Aborted|WebAssembly|JSPI|Suspending/i.test(raw)) {
      return "이 브라우저에서는 기기 대화를 켤 수 없습니다";
    }
    if (/WebGPU|gpu/i.test(raw)) {
      return "이 기기에서는 기기 대화를 켤 수 없습니다";
    }
    if (/fetch|network|Failed to fetch|status/i.test(raw)) {
      return "지금은 연결이 불안정합니다. 코치와는 바로 이야기할 수 있습니다";
    }
    return "지금은 바로 대화로 이어갑니다";
  }

  function buildSystemPrompt(coachPrompt, extras) {
    const extra = extras ? String(extras).trim() : "";
    return `${coachPrompt}

너는 미리 적어 둔 대본을 읽지 않는다. 바로 앞 대화를 이어서 답한다. 정보가 부족하면 한 가지만 되묻는다. 같은 응원 문장을 반복하지 않는다.

다치거나 수술·통증 이야기를 들으면 축하하지 않는다. 대단하다, 강한 의지다, 기회다 같은 말을 쓰지 않는다. 먼저 고생했다고 짧게 공감하고, 지금은 어떤지 하나만 묻는다. 운동 처방을 바로 나열하지 않는다. 수술·통증 직후에는 점프, 런지, 한 발 운동, 스쿼트를 권하지 않는다.

마크다운과 번호 목록을 쓰지 않는다. 별표로 강조하지 않는다. 옆에서 이야기하듯 2~5문장으로 답한다. 앱 가이드는 의료 진단이 아니다.
${extra}`.trim();
  }

  function historyToPreface(chats, limit) {
    const cap = Number(limit) > 0 ? Number(limit) : HISTORY_LIMIT;
    const list = Array.isArray(chats) ? chats : [];
    const prior = list.slice(0, Math.max(0, list.length - 1)).slice(-cap);
    return prior
      .filter((c) => c && c.text)
      .map((c) => ({
        role: c.sender === "user" ? "user" : "model",
        content: String(c.text)
      }));
  }

  function refreshUi() {
    const statusEl = document.getElementById("gemma-engine-status");
    const btn = document.getElementById("btn-gemma-load");
    if (!statusEl) return;
    if (!canRun()) state = "unsupported";
    if (btn) btn.style.display = "none";
    statusEl.textContent = "";
  }

  async function load() {
    if (isReady()) return;
    if (loadPromise) return loadPromise;
    if (!canRun()) {
      state = "unsupported";
      lastError = "이 기기에서는 기기 대화를 켤 수 없습니다";
      throw new Error(lastError);
    }

    state = "downloading";
    lastError = "";

    loadPromise = (async () => {
      try {
        // Module.noExitRuntime을 우리가 만지면 WASM이 바로 죽습니다.
        // 공식 예시는 모델 URL만 넘깁니다.
        if (navigator.gpu && typeof navigator.gpu.requestAdapter === "function") {
          const adapter = await navigator.gpu.requestAdapter();
          if (!adapter) throw new Error("WebGPU");
        }

        const mod = await import(ENGINE_CDN);
        const Engine = mod.Engine || (mod.default && mod.default.Engine);
        if (!Engine || typeof Engine.create !== "function") {
          throw new Error("LiteRT 엔진을 찾지 못했습니다.");
        }

        engine = await Engine.create({
          model: MODEL_URL,
          mainExecutorSettings: { maxNumTokens: 4096 }
        });
        conversation = null;
        conversationCoachId = null;
        state = "ready";
      } catch (err) {
        state = "error";
        lastError = userSafeError(err);
        engine = null;
        console.warn("[GemmaOnDevice] 로드 실패:", err);
        throw err;
      } finally {
        if (!isReady()) loadPromise = null;
      }
    })();

    return loadPromise;
  }

  async function requestInstall() {
    if (isReady()) return true;
    if (!canRun()) return false;
    try {
      await load();
    } catch (e) {
      return false;
    }
    return isReady();
  }

  // 유료·테스트 권한이면 확인 없이 받아 둡니다. 화면에는 받지 버튼을 두지 않습니다.
  function warmForPaidUser() {
    if (isReady() || !canRun()) return;
    load().catch(() => {});
  }

  async function ensureConversation(coachId, systemPrompt, chats) {
    if (!engine) throw new Error("Gemma 엔진이 없습니다.");
    if (conversation && conversationCoachId === coachId) return conversation;

    const prefaceMessages = [
      { role: "system", content: systemPrompt },
      ...historyToPreface(chats, HISTORY_LIMIT)
    ];

    try {
      conversation = await engine.createConversation({
        preface: { messages: prefaceMessages },
        sessionConfig: { maxOutputTokens: 512 }
      });
    } catch (err) {
      conversation = await engine.createConversation({
        preface: { messages: [{ role: "system", content: systemPrompt }] },
        sessionConfig: { maxOutputTokens: 512 }
      });
    }
    conversationCoachId = coachId;
    return conversation;
  }

  function readReplyText(response) {
    if (!response) return "";
    if (typeof response === "string") return response.trim();
    const parts = Array.isArray(response.content) ? response.content : [];
    const text = parts.map((p) => {
      if (!p) return "";
      if (typeof p === "string") return p;
      if (p.text) return p.text;
      if (p.type === "text" && p.text) return p.text;
      return "";
    }).join("");
    return String(text || "").trim();
  }

  async function reply({ coachId, systemPrompt, chats, userText }) {
    if (!isReady()) return null;
    const chat = await ensureConversation(coachId, systemPrompt, chats);
    const response = await chat.sendMessage(String(userText || ""));
    const text = readReplyText(response);
    return text || null;
  }

  function bindUi() {
    if (!canRun()) state = "unsupported";
    refreshUi();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindUi);
  } else {
    bindUi();
  }

  window.GemmaOnDevice = {
    MODEL_ID,
    MODEL_URL,
    SIZE_HINT: "약 2GB",
    HISTORY_LIMIT,
    canRun,
    isReady,
    getState: () => state,
    getLastError: () => lastError,
    buildSystemPrompt,
    historyToPreface,
    load,
    requestInstall,
    warmForPaidUser,
    reply,
    refreshUi
  };
})();
