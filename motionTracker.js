// RUNNOW AI Motion Fitness Engine powered by Google MediaPipe Pose Landmarker
// Vision Edge Tasks WebAssembly + WebGL Acceleration

export const EXERCISE_TYPES = {
  SQUAT: {
    id: "squat",
    name: "AI 스쿼트",
    shortName: "SQUATS",
    jointLabel: "KNEE",
    tips: ["무릎이 발끝보다 앞으로 나가지 않게", "허리를 곧게 펴고 앉으세요"],
    tagline: "하체 근력 & 대퇴사두근 강화",
    icon: "🦵",
    targetStat: "might",
    statGain: { might: 5, agility: 1, spirit: 2 },
    caloriePerRep: 0.32,
    xpPerRep: 8,
    vcPerRep: 2,
    description: "골반과 무릎 각도를 90도 이하로 굽혔다 일어나는 풀 스쿼트 동작을 인식합니다.",
    cover: "./assets/exercises/squat.jpg",
    // 중급자 기준 가동범위. 난이도 오프셋이 여기에 더해집니다.
    rom: { contracted: 95, extended: 155, gaugeTop: 165 },
    requiredLandmarks: [11, 12, 23, 24, 25, 26, 27, 28]
  },
  PUSHUP: {
    id: "pushup",
    name: "AI 팔굽혀펴기",
    shortName: "PUSH-UPS",
    jointLabel: "ELBOW",
    tips: ["허리가 쳐지지 않게 코어를 조이세요", "가슴이 바닥에 가까워질 때까지"],
    tagline: "상체 파워 & 가슴·삼두근 강화",
    icon: "💪",
    targetStat: "agility",
    statGain: { might: 2, agility: 5, spirit: 2 },
    caloriePerRep: 0.38,
    xpPerRep: 10,
    vcPerRep: 3,
    description: "팔꿈치 각도를 90도까지 굽힌 후 상체를 밀어올리는 푸시업 동작을 인식합니다.",
    cover: "./assets/exercises/pushup.jpg",
    rom: { contracted: 90, extended: 150, gaugeTop: 160 },
    requiredLandmarks: [11, 12, 13, 14, 15, 16, 23, 24]
  },
  SITUP: {
    id: "situp",
    name: "AI 윗몸일으키기",
    shortName: "SIT-UPS",
    jointLabel: "HIP",
    tips: ["목이 아니라 복근으로 올라오세요", "허리를 말아 올리듯 수축하세요"],
    tagline: "코어 복근 & 척추 기립근 강화",
    icon: "🧘",
    targetStat: "spirit",
    statGain: { might: 2, agility: 1, spirit: 5 },
    caloriePerRep: 0.28,
    xpPerRep: 9,
    vcPerRep: 2,
    description: "상체와 골반 각도를 75도 이하로 끌어올리는 코어 크런치 동작을 인식합니다.",
    cover: "./assets/exercises/situp.jpg",
    rom: { contracted: 75, extended: 130, gaugeTop: 140 },
    requiredLandmarks: [11, 12, 23, 24, 25, 26]
  },
  JUMPINGJACK: {
    id: "jumpingjack",
    name: "AI 점핑잭",
    shortName: "JACKS",
    jointLabel: "ARM",
    tips: ["팔과 다리를 동시에 벌리세요", "착지 때 무릎을 살짝 굽히세요"],
    tagline: "전신 유산소 & 체지방 고속 연소",
    icon: "⭐",
    targetStat: "all",
    statGain: { might: 3, agility: 3, spirit: 3 },
    caloriePerRep: 0.20,
    xpPerRep: 6,
    vcPerRep: 1,
    description: "양팔을 머리 위로 올리고 다리를 벌렸다가 모으는 전신 유산소 카디오를 인식합니다.",
    cover: "./assets/exercises/jumpingjack.jpg",
    // 점핑잭은 각도가 아니라 "손 올림 + 발 벌림"을 0~180 합성값으로 환산해 판정합니다.
    rom: { contracted: 40, extended: 140, gaugeTop: 180 },
    requiredLandmarks: [11, 12, 15, 16, 27, 28]
  },
  PLANK: {
    id: "plank",
    name: "AI 플랭크",
    shortName: "PLANK",
    jointLabel: "BODY",
    tips: ["어깨-골반-발목을 일직선으로", "엉덩이가 뜨거나 처지지 않게"],
    tagline: "전신 코어 버티기 & 척추 안정화",
    icon: "⏱️",
    targetStat: "spirit",
    statGain: { might: 2, agility: 1, spirit: 6 },
    caloriePerRep: 0.15,
    xpPerRep: 5,
    vcPerRep: 2,
    description: "어깨-골반-발목을 일직선(160도 이상)으로 유지하며 5초마다 버티기 포인트를 획득합니다.",
    cover: "./assets/exercises/plank.jpg",
    // 플랭크는 180도를 중심으로 한 허용 밴드로 판정합니다.
    rom: { center: 180, tolerance: 25, holdBlockSec: 5 },
    requiredLandmarks: [11, 12, 23, 24, 27, 28]
  },
  LUNGE: {
    id: "lunge",
    name: "AI 런지",
    shortName: "LUNGES",
    jointLabel: "KNEE",
    tips: ["앞무릎이 발끝을 넘지 않게", "상체를 곧게 세운 채 내려가세요"],
    tagline: "하체 밸런스 & 둔근 집중 강화",
    icon: "🦵",
    targetStat: "might",
    statGain: { might: 5, agility: 2, spirit: 2 },
    caloriePerRep: 0.35,
    xpPerRep: 8,
    vcPerRep: 2,
    description: "앞무릎과 뒷무릎을 90도로 굽히는 하체 밸런스 런지 동작을 인식합니다.",
    cover: "./assets/exercises/lunge.jpg",
    rom: { contracted: 95, extended: 155, gaugeTop: 165 },
    requiredLandmarks: [11, 12, 23, 24, 25, 26, 27, 28]
  }
};

// 난이도 3단계. 임계값만이 아니라 준비 시간·디바운스·폼 엄격도까지 함께 움직입니다.
export const DIFFICULTY_LEVELS = {
  beginner: {
    id: "beginner",
    name: "초보자",
    icon: "🌱",
    summary: "가동 범위를 넉넉하게 인정합니다",
    detail: "덜 앉거나 덜 펴도 1회로 인정합니다. 동작을 처음 익히는 단계에 맞춘 설정입니다.",
    contractedOffset: 22,   // 수축 기준 완화 (+가 관대)
    extendedOffset: -14,    // 신전 기준 완화 (-가 관대)
    plankToleranceBonus: 10,
    jackReach: "shoulder",
    jackFeetRatio: 1.25,
    minVisibility: 0.4,
    minRepIntervalMs: 550,
    minHoldMs: 0,
    readyHoldMs: 1200,
    strictForm: false,
    rewardMultiplier: 0.9
  },
  intermediate: {
    id: "intermediate",
    name: "중급자",
    icon: "🔥",
    summary: "표준 가동 범위로 판정합니다",
    detail: "일반적인 풀 가동 범위 기준입니다. 반동 없이 정직하게 수행할 때 인정됩니다.",
    contractedOffset: 0,
    extendedOffset: 0,
    plankToleranceBonus: 0,
    jackReach: "nose",
    jackFeetRatio: 1.5,
    minVisibility: 0.55,
    minRepIntervalMs: 800,
    minHoldMs: 150,
    readyHoldMs: 1500,
    strictForm: false,
    rewardMultiplier: 1.0
  },
  advanced: {
    id: "advanced",
    name: "단련자",
    icon: "⚡",
    summary: "풀 ROM과 정지 구간을 요구합니다",
    detail: "더 깊게 내려가고 하단에서 잠깐 멈춰야 인정합니다. 반동 반복은 걸러집니다.",
    contractedOffset: -13,
    extendedOffset: 8,
    plankToleranceBonus: -7,
    jackReach: "overhead",
    jackFeetRatio: 1.7,
    minVisibility: 0.62,
    minRepIntervalMs: 950,
    minHoldMs: 300,
    readyHoldMs: 1800,
    strictForm: true,
    rewardMultiplier: 1.15
  }
};

export const DEFAULT_DIFFICULTY = "intermediate";

// 준비 게이트 안내 문구에 쓰는 랜드마크 한글 이름
const LANDMARK_LABELS = {
  11: "왼쪽 어깨", 12: "오른쪽 어깨",
  13: "왼쪽 팔꿈치", 14: "오른쪽 팔꿈치",
  15: "왼쪽 손목", 16: "오른쪽 손목",
  23: "왼쪽 골반", 24: "오른쪽 골반",
  25: "왼쪽 무릎", 26: "오른쪽 무릎",
  27: "왼쪽 발목", 28: "오른쪽 발목"
};

export class MotionTracker {
  constructor(options = {}) {
    this.videoEl = options.videoEl || null;
    this.canvasEl = options.canvasEl || null;
    this.ctx = this.canvasEl ? this.canvasEl.getContext("2d") : null;

    this.onRepCount = options.onRepCount || (() => {});
    this.onFeedback = options.onFeedback || (() => {});
    this.onStateUpdate = options.onStateUpdate || (() => {});
    this.onPhaseChange = options.onPhaseChange || (() => {});
    this.onError = options.onError || console.error;

    this.stream = null;
    this.isRunning = false;
    this.facingMode = "user"; // 'user' (front) or 'environment' (rear)

    this.currentExercise = EXERCISE_TYPES.SQUAT;
    this.difficulty = DIFFICULTY_LEVELS[options.difficulty] || DIFFICULTY_LEVELS[DEFAULT_DIFFICULTY];
    this.repCount = 0;
    this.motionState = "up"; // 'up', 'down', 'transition' (외부 HUD 표시용)
    this.currentAngle = 0;
    this.depthProgress = 0; // 0 to 100%
    this.lastRepTimestamp = 0;
    this.caloriesBurned = 0;
    this.startTime = 0;
    this.elapsedSeconds = 0;
    this.timerInterval = null;

    // 준비(Calibration) → 카운트다운 → 카운팅 페이즈 머신
    this.phase = "idle"; // 'idle' | 'calibrating' | 'countdown' | 'counting'
    this.readyStableMs = 0;
    this.lastReadyTickMs = 0;
    this.countdownEndsAt = 0;
    this.lastCountdownSecond = null;
    this.blockedReason = "";
    this.lastBlockedReason = null;

    // rep 사이클 상태 (신전 구간을 한 번 관측해야만 시작됩니다)
    this.repPhase = null; // null | 'extended' | 'contracted'
    this.contractedEnteredAt = 0;
    this.cycleDeepestAngle = null;
    this.cycleFormOk = true;
    this.smoothedAngle = null;
    this.plankHoldStart = 0;

    this.userWeightKg = options.weightKg || 70;
    this.lastDetectMs = 0;
    this.lastLandmarks = null;
    this.animFrameId = null;
    this.showSkeletonOverlay = true;

    // 콜백 폭주 방지용 스로틀 타임스탬프
    this.lastFeedbackText = "";
    this.lastFeedbackAt = 0;
    this.lastStateEmitAt = 0;

    this.poseDetector = null;
    this.poseLandmarker = null;
    this.engineType = null;
    this.isDetecting = false;
    this.lastLoadError = null;

    // BlazePose 33 Landmark Skeleton Connections
    this.POSE_CONNECTIONS = [
      [11, 12], [11, 13], [13, 15], // Left arm
      [12, 14], [14, 16],           // Right arm
      [11, 23], [12, 24], [23, 24], // Torso
      [23, 25], [25, 27], [27, 29], [29, 31], [27, 31], // Left leg
      [24, 26], [26, 28], [28, 30], [30, 32], [28, 32]  // Right leg
    ];
  }

  toggleSkeletonOverlay() {
    this.showSkeletonOverlay = !this.showSkeletonOverlay;
    if (!this.showSkeletonOverlay && this.ctx && this.canvasEl) {
      this.ctx.clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);
    }
    return this.showSkeletonOverlay;
  }

  setWeight(kg) {
    if (kg > 0) this.userWeightKg = kg;
  }

  setExercise(exerciseKey) {
    const ex = typeof exerciseKey === "string" ? EXERCISE_TYPES[exerciseKey.toUpperCase()] : exerciseKey;
    if (ex) {
      this.currentExercise = ex;
      this.resetExerciseStats();
    }
  }

  // 난이도 변경. 운동 중에 바꾸면 판정 기준이 섞이므로 준비 페이즈로 되돌립니다.
  setDifficulty(levelId) {
    const level = DIFFICULTY_LEVELS[levelId];
    if (!level || level.id === this.difficulty.id) return this.difficulty;
    this.difficulty = level;
    this.resetRepCycle();
    if (this.phase === "counting" || this.phase === "countdown") {
      this.enterPhase("calibrating");
    }
    return this.difficulty;
  }

  getDifficulty() {
    return this.difficulty;
  }

  // 현재 운동 × 현재 난이도의 실효 임계값
  getThresholds() {
    const rom = this.currentExercise.rom || {};
    const lv = this.difficulty;
    return {
      contracted: (rom.contracted ?? 90) + lv.contractedOffset,
      extended: (rom.extended ?? 155) + lv.extendedOffset,
      gaugeTop: (rom.gaugeTop ?? 165) + lv.extendedOffset,
      plankCenter: rom.center ?? 180,
      plankTolerance: Math.max(10, (rom.tolerance ?? 25) + lv.plankToleranceBonus),
      holdBlockSec: rom.holdBlockSec ?? 5,
      minVisibility: lv.minVisibility,
      minRepIntervalMs: lv.minRepIntervalMs,
      minHoldMs: lv.minHoldMs,
      readyHoldMs: lv.readyHoldMs,
      strictForm: lv.strictForm,
      jackReach: lv.jackReach,
      jackFeetRatio: lv.jackFeetRatio
    };
  }

  resetRepCycle() {
    this.repPhase = null;
    this.contractedEnteredAt = 0;
    this.cycleDeepestAngle = null;
    this.cycleFormOk = true;
    this.smoothedAngle = null;
    this.plankHoldStart = 0;
    this.motionState = "up";
  }

  resetExerciseStats() {
    this.repCount = 0;
    this.currentAngle = 0;
    this.depthProgress = 0;
    this.caloriesBurned = 0;
    this.elapsedSeconds = 0;
    this.lastRepTimestamp = 0;
    this.startTime = Date.now();
    this.resetRepCycle();
  }

  isIosFamily() {
    const ua = navigator.userAgent || "";
    return /iPhone|iPad|iPod/i.test(ua)
      || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  }

  async promiseWithTimeout(promise, ms, message) {
    let timer;
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(message)), ms);
    });
    try {
      return await Promise.race([promise, timeout]);
    } finally {
      clearTimeout(timer);
    }
  }

  async waitForClassicPose(timeoutMs = 1500) {
    if (window.Pose) return true;
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
      if (window.Pose) return true;
      await new Promise((resolve) => setTimeout(resolve, 60));
    }
    return Boolean(window.Pose);
  }

  async fetchModelBuffer() {
    const paths = [
      "./assets/mediapipe/pose_landmarker_lite.task",
      "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task"
    ];
    let lastErr = null;
    for (const path of paths) {
      try {
        const res = await fetch(path, { cache: "no-store", mode: "cors" });
        if (!res.ok) throw new Error(`model HTTP ${res.status}`);
        return await res.arrayBuffer();
      } catch (err) {
        lastErr = err;
      }
    }
    throw lastErr || new Error("모델 파일을 받지 못했습니다");
  }

  async loadVisionBundle() {
    const urls = [
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/vision_bundle.js",
      "https://unpkg.com/@mediapipe/tasks-vision@0.10.18/vision_bundle.js"
    ];
    let lastErr = null;
    for (const url of urls) {
      try {
        return await import(url);
      } catch (err) {
        lastErr = err;
      }
    }
    throw lastErr || new Error("vision bundle import failed");
  }

  // 1순위 Classic Pose(폰 호환), 2순위 Tasks Vision CPU 버퍼 로드
  async initMediaPipe() {
    if (this.poseDetector || this.poseLandmarker) return true;
    this.lastLoadError = null;

    if (await this.waitForClassicPose()) {
      try {
        const pose = new window.Pose({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`
        });
        pose.setOptions({
          modelComplexity: 0,
          smoothLandmarks: true,
          enableSegmentation: false,
          minDetectionConfidence: 0.3,
          minTrackingConfidence: 0.3
        });
        pose.onResults((results) => this.handlePoseResults(results));
        // 타임아웃을 두어 CDN 지연으로 인한 무한 멈춤 차단
        await this.promiseWithTimeout(pose.initialize(), 7000, "Classic Pose 초기화 시간 초과");
        this.poseDetector = pose;
        this.engineType = "classic_pose";
        console.log("⚡ MediaPipe Classic Pose Engine Ready!");
        return true;
      } catch (err) {
        console.warn("Classic Pose 초기화 실패, Tasks Vision 시도:", err);
        this.lastLoadError = err;
      }
    }

    const wasmPaths = [
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm",
      "https://unpkg.com/@mediapipe/tasks-vision@0.10.18/wasm"
    ];
    const preferCpu = this.isIosFamily() || /Android/i.test(navigator.userAgent);
    const delegates = preferCpu ? ["CPU", "GPU"] : ["GPU", "CPU"];

    try {
      const modelBuffer = await this.promiseWithTimeout(this.fetchModelBuffer(), 8000, "모델 다운로드 시간 초과");
      const visionModule = await this.loadVisionBundle();
      const { PoseLandmarker, FilesetResolver } = visionModule;

      for (const wasmPath of wasmPaths) {
        for (const delegate of delegates) {
          try {
            const vision = await FilesetResolver.forVisionTasks(wasmPath);
            const options = {
              baseOptions: {
                modelAssetBuffer: new Uint8Array(modelBuffer.slice(0)),
                delegate
              },
              runningMode: "VIDEO",
              numPoses: 1,
              minPoseDetectionConfidence: 0.3,
              minPosePresenceConfidence: 0.3,
              minTrackingConfidence: 0.3
            };
            if (preferCpu) {
              options.canvas = document.createElement("canvas");
            }
            this.poseLandmarker = await PoseLandmarker.createFromOptions(vision, options);
            this.engineType = "tasks_vision";
            this.lastLoadError = null;
            console.log("⚡ MediaPipe Tasks Vision Engine Ready:", delegate);
            return true;
          } catch (err) {
            this.lastLoadError = err;
            try { this.poseLandmarker?.close?.(); } catch (_) {}
            this.poseLandmarker = null;
          }
        }
      }
    } catch (err) {
      console.error("MediaPipe 모든 엔진 로드 실패:", err);
      this.lastLoadError = err;
      this.poseLandmarker = null;
      return false;
    }

    console.error("MediaPipe 모든 엔진 로드 실패:", this.lastLoadError);
    return false;
  }

  // 웹캠 스트림 시작 (Camera-First Flow: 카메라 즉시 실행 후 AI 모델 비동기 로드)
  async startCamera(videoElement, canvasElement, options = {}) {
    // 카메라 전환(toggleCamera)으로 재진입한 경우에는 기록을 유지해야 합니다.
    const isFreshStart = this.phase === "idle";
    if (videoElement) this.videoEl = videoElement;
    if (canvasElement) {
      this.canvasEl = canvasElement;
      this.ctx = this.canvasEl.getContext("2d");
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("현재 브라우저가 카메라 접근(WebRTC)을 지원하지 않습니다.\n스마트폰 기본 'Chrome' 또는 'Safari' 브라우저로 접속해 주세요.");
    }

    let stream = null;
    const isUserMode = this.facingMode === "user";

    // 1순위: 이상적 해상도 요청
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: isUserMode ? "user" : "environment",
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      });
    } catch (e1) {
      console.warn("Camera constraint 1 failed, trying fallback:", e1);
      // 2순위: facingMode만 요청
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: isUserMode ? "user" : "environment" },
          audio: false
        });
      } catch (e2) {
        console.warn("Camera constraint 2 failed, trying bare video constraint:", e2);
        // 3순위: 기본 video 요청
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        } catch (e3) {
          console.error("Camera access failed completely:", e3);
          if (e3.name === "NotAllowedError" || e3.name === "PermissionDeniedError") {
            throw new Error("카메라 권한이 '차단'되어 있습니다.\n브라우저 상단 주소창 좌측의 🔒(자물쇠) 또는 설정에서 '카메라 권한'을 '허용'으로 변경해 주세요.");
          } else if (e3.name === "NotReadableError" || e3.name === "TrackStartError") {
            throw new Error("다른 앱(카카오톡, 기본 카메라 등)이 카메라를 사용 중입니다. 다른 앱을 종료하고 다시 시도해 주세요.");
          } else if (e3.name === "NotFoundError" || e3.name === "DevicesNotFoundError") {
            throw new Error("기기에서 사용 가능한 카메라를 찾을 수 없습니다.");
          } else {
            throw new Error(`카메라를 실행할 수 없습니다 (${e3.name || e3.message}).\nChrome(크롬) 또는 Safari(사파리) 브라우저에서 열어주세요.`);
          }
        }
      }
    }

    if (this.stream) {
      this.stopCamera();
    }

    this.stream = stream;
    this.videoEl.srcObject = this.stream;
    this.videoEl.setAttribute("playsinline", "true");
    this.videoEl.setAttribute("webkit-playsinline", "true");
    this.videoEl.muted = true;
    
    // 카메라 비디오 준비 완료 후 즉시 화면에 렌더링
    const playVideo = async () => {
      try {
        await this.videoEl.play();
      } catch (playErr) {
        console.warn("Video play error:", playErr);
      }
      this.isRunning = true;
      this.requestWakeLock();
      this.predictWebcamLoop();
    };

    if (this.videoEl.readyState >= 1) {
      await playVideo();
    } else {
      await new Promise((resolve) => {
        let done = false;
        const onReady = async () => {
          if (done) return;
          done = true;
          cleanup();
          await playVideo();
          resolve(true);
        };
        const cleanup = () => {
          this.videoEl.removeEventListener("loadedmetadata", onReady);
          this.videoEl.removeEventListener("loadeddata", onReady);
          this.videoEl.removeEventListener("canplay", onReady);
        };
        this.videoEl.addEventListener("loadedmetadata", onReady, { once: true });
        this.videoEl.addEventListener("loadeddata", onReady, { once: true });
        this.videoEl.addEventListener("canplay", onReady, { once: true });
        setTimeout(onReady, 1200); // 1.2초 타임아웃 폴백으로 절대 무한 대기하지 않음
      });
    }

    // 카메라 화면이 재생되면 즉시 콜백 실행 (대기 오버레이 걷어냄)
    if (typeof options.onStreamReady === "function") {
      try {
        options.onStreamReady();
      } catch (cbErr) {
        console.warn("onStreamReady error:", cbErr);
      }
    }

    // AI 모델 비동기 로드
    const ready = await this.initMediaPipe();
    if (ready) {
      // 모델이 준비되면 곧바로 카운트하지 않고 준비(Calibration) 페이즈로 들어갑니다.
      if (isFreshStart) this.resetExerciseStats();
      this.enterPhase("calibrating");
      return true;
    }

    this.stopCamera();
    const detail = this.lastLoadError?.message || String(this.lastLoadError || "");
    throw new Error(
      "관절 인식 모델을 불러오지 못했습니다. 와이파이에 연결한 뒤 페이지를 새로고침하고 다시 시작해 주세요."
      + (detail ? `\n(${detail})` : "")
    );
  }

  // 화면 꺼짐 방지 (Wake Lock API)
  async requestWakeLock() {
    try {
      if ('wakeLock' in navigator) {
        this.wakeLock = await navigator.wakeLock.request('screen');
        console.log('📱 Mobile WakeLock Active: Screen will stay awake during workout!');
      }
    } catch (err) {
      console.warn('WakeLock not supported/failed:', err);
    }
  }

  releaseWakeLock() {
    if (this.wakeLock) {
      try {
        this.wakeLock.release().then(() => {
          this.wakeLock = null;
        });
      } catch (e) {}
    }
  }

  // 카메라 전환 (전면 <-> 후면)
  async toggleCamera() {
    this.facingMode = this.facingMode === "user" ? "environment" : "user";
    if (this.videoEl) {
      const transformVal = this.facingMode === "user" ? "scaleX(-1)" : "scaleX(1)";
      this.videoEl.style.transform = transformVal;
      if (this.canvasEl) this.canvasEl.style.transform = transformVal;
    }
    if (this.isRunning) {
      await this.startCamera(this.videoEl, this.canvasEl);
    }
  }

  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (!this.isRunning) return;
      this.elapsedSeconds++;
      // 실시간 칼로리 계산
      const weightFactor = this.userWeightKg / 70.0;
      this.caloriesBurned = parseFloat((this.repCount * this.currentExercise.caloriePerRep * weightFactor).toFixed(1));
      
      this.emitLiveState();
    }, 1000);
  }

  emitLiveState() {
    this.lastStateEmitAt = performance.now();
    this.onStateUpdate({
      reps: this.repCount,
      angle: this.currentAngle,
      jointLabel: this.currentExercise.jointLabel || "JOINT",
      depthProgress: this.depthProgress,
      calories: this.caloriesBurned,
      elapsedSeconds: this.elapsedSeconds,
      motionState: this.motionState,
      phase: this.phase,
      difficulty: this.difficulty,
      exercise: this.currentExercise
    });
  }

  // 화면 갱신은 초당 10회면 충분합니다 (검출 루프는 30fps).
  emitLiveStateThrottled() {
    const now = performance.now();
    if (now - this.lastStateEmitAt < 100) return;
    this.emitLiveState();
  }

  // 같은 문장을 매 프레임 다시 쏘면 TTS 큐가 밀립니다.
  emitFeedback(text, isGood) {
    if (!text) return;
    const now = performance.now();
    if (text === this.lastFeedbackText && now - this.lastFeedbackAt < 1500) return;
    this.lastFeedbackText = text;
    this.lastFeedbackAt = now;
    this.onFeedback({ text, type: isGood ? "good" : "warn", isGood });
  }

  // 일시정지 / 이어하기. 직접 isRunning을 만지면 rAF 루프가 중복 실행됩니다.
  pause() {
    this.isRunning = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  resume() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastReadyTickMs = 0;
    this.smoothedAngle = null;
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    this.animFrameId = null;
    this.predictWebcamLoop();
  }

  stopCamera() {
    this.isRunning = false;
    this.phase = "idle";
    this.readyStableMs = 0;
    this.lastReadyTickMs = 0;
    this.lastCountdownSecond = null;
    this.lastFeedbackText = "";
    this.releaseWakeLock();
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.ctx && this.canvasEl) {
      this.ctx.clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);
    }
    this.lastLandmarks = null;
    this.lastDetectMs = 0;
  }

  // 3개 랜드마크 사이의 사잇각(Degrees) 계산 벡터 공식
  calculateAngle(p1, p2, p3) {
    if (!p1 || !p2 || !p3) return null;
    const radians = Math.atan2(p3.y - p2.y, p3.x - p2.x) - Math.atan2(p1.y - p2.y, p1.x - p2.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    if (angle > 180.0) {
      angle = 360.0 - angle;
    }
    return Math.round(angle);
  }

  // 2개 포인트 거리 계산
  calculateDistance(p1, p2) {
    if (!p1 || !p2) return 0;
    return Math.hypot(p1.x - p2.x, p1.y - p2.y);
  }

  // 3점 각도 + 해당 3점 중 가장 낮은 visibility를 함께 반환
  jointAngleWithVisibility(landmarks, a, b, c) {
    const p1 = landmarks[a];
    const p2 = landmarks[b];
    const p3 = landmarks[c];
    if (!p1 || !p2 || !p3) return null;
    const angle = this.calculateAngle(p1, p2, p3);
    if (angle == null) return null;
    const vis = Math.min(p1.visibility ?? 1, p2.visibility ?? 1, p3.visibility ?? 1);
    return { angle, vis };
  }

  // 좌우를 무조건 평균내면 측면 촬영에서 가려진 쪽 추정치가 값을 오염시킵니다.
  // 양쪽 모두 선명하고 값이 비슷할 때만 평균내고, 아니면 더 잘 보이는 쪽을 씁니다.
  bestSideAngle(landmarks, leftTriple, rightTriple, minVis) {
    const l = this.jointAngleWithVisibility(landmarks, ...leftTriple);
    const r = this.jointAngleWithVisibility(landmarks, ...rightTriple);
    if (!l && !r) return null;
    if (!l) return r.vis >= minVis ? r : null;
    if (!r) return l.vis >= minVis ? l : null;
    if (l.vis >= minVis && r.vis >= minVis && Math.abs(l.angle - r.angle) <= 25) {
      return { angle: Math.round((l.angle + r.angle) / 2), vis: Math.min(l.vis, r.vis) };
    }
    const best = l.vis >= r.vis ? l : r;
    return best.vis >= minVis ? best : null;
  }

  // 프레임 지터 제거용 EMA. 임계값 근처 떨림에 의한 중복 카운트를 막습니다.
  smoothAngle(rawAngle) {
    const ALPHA = 0.4;
    this.smoothedAngle = this.smoothedAngle == null
      ? rawAngle
      : this.smoothedAngle + ALPHA * (rawAngle - this.smoothedAngle);
    return Math.round(this.smoothedAngle);
  }

  // ---------- 페이즈 머신: idle → calibrating → countdown → counting ----------

  enterPhase(next) {
    if (this.phase === next) return;
    this.phase = next;
    this.readyStableMs = 0;
    this.lastReadyTickMs = 0;
    this.lastFeedbackText = "";
    this.blockedReason = "";
    this.lastBlockedReason = null;

    if (next === "calibrating") {
      this.stopTimer();
      this.resetRepCycle();
      this.lastCountdownSecond = null;
    } else if (next === "countdown") {
      this.countdownEndsAt = Date.now() + 3000;
      // 아래 onPhaseChange가 이미 3초를 알리므로 updateCountdown이 중복 통보하지 않게 맞춥니다.
      this.lastCountdownSecond = 3;
    } else if (next === "counting") {
      // 세션 통계 초기화는 startCamera가 담당합니다.
      // 카메라 전환 등으로 재보정 후 돌아올 때 기록이 날아가면 안 됩니다.
      this.resetRepCycle();
      if (!this.startTime) this.startTime = Date.now();
      this.startTimer();
    }

    this.onPhaseChange({
      phase: next,
      secondsLeft: next === "countdown" ? 3 : 0,
      exercise: this.currentExercise,
      difficulty: this.difficulty
    });
    this.emitLiveState();
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  // 필수 관절 중 신뢰도가 낮은 것들을 돌려줍니다. 비어 있으면 전신 검출 OK.
  findMissingLandmarks(landmarks, minVis) {
    const required = this.currentExercise.requiredLandmarks || [];
    const missing = [];
    for (const idx of required) {
      const lm = landmarks[idx];
      if (!lm || (lm.visibility ?? 1) < minVis) missing.push(idx);
    }
    return missing;
  }

  describeMissing(missing) {
    if (missing.length >= 3) {
      return "전신이 화면에 다 들어오도록 뒤로 조금 물러나 주세요";
    }
    const names = missing.map((idx) => LANDMARK_LABELS[idx] || `관절 ${idx}`);
    return `${names.join(", ")}이(가) 보이지 않습니다. 위치를 조정해 주세요`;
  }

  // 준비 게이트: 전신 검출 + 시작 자세 + 난이도별 유지시간을 모두 만족해야 통과
  updateCalibration(measure, missing, thresholds) {
    const now = Date.now();
    const delta = this.lastReadyTickMs ? Math.min(400, now - this.lastReadyTickMs) : 0;
    this.lastReadyTickMs = now;

    let blocker = "";
    if (missing.length > 0) {
      blocker = this.describeMissing(missing);
    } else if (!measure) {
      blocker = "관절 인식이 불안정합니다. 조명을 밝게 하고 카메라를 정면으로 두세요";
    } else if (!measure.inStartPose) {
      blocker = measure.startPoseHint || "시작 자세를 잡아 주세요";
    }

    if (blocker) {
      this.readyStableMs = 0;
      this.blockedReason = blocker;
      this.emitFeedback(blocker, false);
    } else {
      this.readyStableMs += delta;
      this.blockedReason = "";
      this.emitFeedback("시작 자세 확인 중입니다. 그대로 유지해 주세요", true);
      if (this.readyStableMs >= thresholds.readyHoldMs) {
        this.enterPhase("countdown");
      }
    }

    // 준비 진행률은 캔버스 링이 매 프레임 그리므로, 콜백은 안내 문구가 바뀔 때만 보냅니다.
    if (this.blockedReason !== this.lastBlockedReason) {
      this.lastBlockedReason = this.blockedReason;
      this.onPhaseChange({
        phase: "calibrating",
        readyPercent: Math.min(100, Math.round((this.readyStableMs / thresholds.readyHoldMs) * 100)),
        blockedReason: this.blockedReason,
        exercise: this.currentExercise,
        difficulty: this.difficulty
      });
    }
  }

  updateCountdown() {
    const remainMs = this.countdownEndsAt - Date.now();
    const sec = Math.max(0, Math.ceil(remainMs / 1000));
    if (sec !== this.lastCountdownSecond) {
      this.lastCountdownSecond = sec;
      this.onPhaseChange({
        phase: "countdown",
        secondsLeft: sec,
        exercise: this.currentExercise,
        difficulty: this.difficulty
      });
    }
    if (remainMs <= 0) this.enterPhase("counting");
  }

  // 신전 → 수축 → 신전 사이클 공통 판정기.
  // repPhase가 null인 동안에는 어떤 경우에도 카운트되지 않습니다.
  runRepCycle(angle, th, formOk, msgs) {
    const now = Date.now();

    if (this.repPhase === null) {
      if (angle >= th.extended) {
        this.repPhase = "extended";
        this.motionState = "up";
        this.cycleDeepestAngle = angle;
        this.cycleFormOk = true;
      }
      return;
    }

    if (this.repPhase === "extended") {
      if (angle < this.cycleDeepestAngle) this.cycleDeepestAngle = angle;
      if (angle <= th.contracted) {
        this.repPhase = "contracted";
        this.motionState = "down";
        this.contractedEnteredAt = now;
        this.cycleFormOk = formOk;
        this.emitFeedback(formOk ? msgs.bottom : msgs.form, formOk);
      } else if (angle < th.extended - 10) {
        this.motionState = "transition";
        if (!formOk) this.emitFeedback(msgs.form, false);
        else this.emitFeedback(msgs.deeper, false);
      } else {
        this.motionState = "up";
        this.emitFeedback(msgs.idle, true);
      }
      return;
    }

    // contracted 구간
    if (!formOk) this.cycleFormOk = false;
    if (angle < this.cycleDeepestAngle) this.cycleDeepestAngle = angle;

    if (angle >= th.extended) {
      const heldMs = now - this.contractedEnteredAt;
      const sinceLastRep = now - (this.lastRepTimestamp || 0);
      this.repPhase = "extended";
      this.motionState = "up";
      this.cycleDeepestAngle = angle;

      if (heldMs < th.minHoldMs) {
        this.emitFeedback(msgs.tooFast, false);
        return;
      }
      if (this.lastRepTimestamp && sinceLastRep < th.minRepIntervalMs) {
        this.emitFeedback(msgs.tooFast, false);
        return;
      }
      if (th.strictForm && !this.cycleFormOk) {
        this.emitFeedback(msgs.form, false);
        this.cycleFormOk = true;
        return;
      }
      this.registerRep(msgs.success);
      this.cycleFormOk = true;
    }
  }

  // 카메라 프레임과 관절 점을 같은 캔버스에 그림 (듀얼 엔진 대응)
  async predictWebcamLoop() {
    if (!this.isRunning || !this.videoEl || !this.canvasEl) return;

    if (this.videoEl.readyState >= 2) {
      const width = this.videoEl.videoWidth || 640;
      const height = this.videoEl.videoHeight || 480;
      if (this.canvasEl.width !== width || this.canvasEl.height !== height) {
        this.canvasEl.width = width;
        this.canvasEl.height = height;
        this.ctx = this.canvasEl.getContext("2d");
      }

      this.ctx.clearRect(0, 0, width, height);
      this.ctx.drawImage(this.videoEl, 0, 0, width, height);

      // Engine 1: Classic MediaPipe Pose 처리
      if (this.engineType === "classic_pose" && this.poseDetector) {
        const nowInMs = performance.now();
        if (nowInMs - this.lastDetectMs >= 33 && !this.isDetecting) {
          this.lastDetectMs = nowInMs;
          this.isDetecting = true;
          try {
            await this.poseDetector.send({ image: this.videoEl });
          } catch (e) {
            console.warn("Classic Pose send error:", e);
          } finally {
            this.isDetecting = false;
          }
        }
      } else if (this.engineType === "tasks_vision" && this.poseLandmarker) {
        const nowInMs = performance.now();
        if (nowInMs - this.lastDetectMs >= 33) {
          this.lastDetectMs = nowInMs;
          const results = this.poseLandmarker.detectForVideo(this.videoEl, nowInMs);
          const poses = results.landmarks || results.poseLandmarks || [];
          this.lastLandmarks = poses[0] || null;
          if (this.lastLandmarks) {
            this.processExerciseLogic(this.lastLandmarks);
          }
        }
      }

      if (this.lastLandmarks) {
        this.drawSkeleton(this.lastLandmarks);
      } else if (this.engineType) {
        if (this.phase === "calibrating") {
          // 사람이 아예 안 잡히면 processExerciseLogic이 돌지 않아 안내가 갱신되지 않습니다.
          // READY 링이 문구를 대신 보여주므로 별도 힌트는 그리지 않습니다.
          this.readyStableMs = 0;
          this.blockedReason = "사람이 인식되지 않습니다. 전신이 나오게 서 주세요";
        } else {
          this.drawSeekingHint(width, height);
        }
      }

      // 준비/카운트다운 중에는 "지금 카운트되지 않는다"는 사실을 화면에 명시합니다.
      if (this.phase === "calibrating") {
        this.drawReadyGauge(width, height);
      } else if (this.phase === "countdown") {
        this.drawCountdown(width, height);
      }
    }

    this.animFrameId = requestAnimationFrame(() => this.predictWebcamLoop());
  }

  // Classic MediaPipe Pose 결과 처리 핸들러
  handlePoseResults(results) {
    if (!this.isRunning) return;
    this.lastLandmarks = results.poseLandmarks || null;
    if (this.lastLandmarks && this.lastLandmarks.length > 0) {
      this.processExerciseLogic(this.lastLandmarks);
    }
  }

  // 전면 카메라일 때 CSS가 캔버스를 좌우 반전(셀피 미러)시킵니다.
  isMirrored() {
    return this.facingMode === "user";
  }

  // 캔버스 위 글자는 CSS 미러 때문에 그대로 그리면 거울 글씨가 됩니다.
  // 기준점을 축으로 한 번 더 뒤집어 화면에서 똑바로 읽히게 합니다.
  drawTextUnmirrored(text, x, y) {
    if (!this.ctx) return;
    if (!this.isMirrored()) {
      this.ctx.fillText(text, x, y);
      return;
    }
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.scale(-1, 1);
    this.ctx.fillText(text, 0, 0);
    this.ctx.restore();
  }

  drawSeekingHint(width, height) {
    if (!this.ctx) return;
    this.ctx.save();
    this.ctx.fillStyle = "rgba(255, 214, 10, 0.92)";
    this.ctx.font = `700 ${Math.max(16, Math.round(width / 28))}px sans-serif`;
    this.ctx.textAlign = "center";
    this.drawTextUnmirrored("관절을 찾는 중 · 전신이 나오게 서 주세요", width / 2, height * 0.12);
    this.ctx.restore();
  }

  // 준비 게이지: 시작 자세를 얼마나 유지했는지 링으로 보여줍니다.
  drawReadyGauge(width, height) {
    if (!this.ctx) return;
    const th = this.getThresholds();
    const ratio = Math.max(0, Math.min(1, this.readyStableMs / th.readyHoldMs));
    const cx = width / 2;
    const cy = height * 0.5;
    const radius = Math.max(34, Math.round(Math.min(width, height) * 0.13));

    this.ctx.save();
    this.ctx.fillStyle = "rgba(8, 9, 12, 0.55)";
    this.ctx.fillRect(0, 0, width, height);

    this.ctx.lineWidth = Math.max(6, Math.round(radius * 0.18));
    this.ctx.strokeStyle = "rgba(255,255,255,0.18)";
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    this.ctx.stroke();

    if (ratio > 0) {
      this.ctx.strokeStyle = "#CCFF00";
      this.ctx.lineCap = "round";
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ratio);
      this.ctx.stroke();
    }

    this.ctx.textAlign = "center";
    this.ctx.fillStyle = "#CCFF00";
    this.ctx.font = `800 ${Math.max(15, Math.round(width / 30))}px sans-serif`;
    this.drawTextUnmirrored("READY", cx, cy + 6);

    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.font = `700 ${Math.max(13, Math.round(width / 40))}px sans-serif`;
    this.drawTextUnmirrored("아직 카운트하지 않습니다", cx, cy - radius - 18);

    const hint = this.blockedReason || "그대로 유지해 주세요";
    this.ctx.fillStyle = this.blockedReason ? "#FF9F0A" : "#CCFF00";
    this.ctx.font = `600 ${Math.max(12, Math.round(width / 44))}px sans-serif`;
    this.drawTextUnmirrored(hint, cx, cy + radius + 30);
    this.ctx.restore();
  }

  // 3-2-1 카운트다운 숫자
  drawCountdown(width, height) {
    if (!this.ctx) return;
    const sec = Math.max(0, Math.ceil((this.countdownEndsAt - Date.now()) / 1000));
    this.ctx.save();
    this.ctx.fillStyle = "rgba(8, 9, 12, 0.45)";
    this.ctx.fillRect(0, 0, width, height);
    this.ctx.textAlign = "center";
    this.ctx.fillStyle = "#CCFF00";
    this.ctx.font = `900 ${Math.round(Math.min(width, height) * 0.34)}px sans-serif`;
    this.drawTextUnmirrored(sec > 0 ? String(sec) : "GO!", width / 2, height * 0.6);
    this.ctx.font = `700 ${Math.max(13, Math.round(width / 38))}px sans-serif`;
    this.ctx.fillStyle = "#FFFFFF";
    this.drawTextUnmirrored("잠시 후 카운트를 시작합니다", width / 2, height * 0.18);
    this.ctx.restore();
  }

  // 매 검출 프레임의 진입점. 페이즈에 따라 준비 판정 / 카운트다운 / 실제 카운트로 분기합니다.
  processExerciseLogic(landmarks) {
    const th = this.getThresholds();
    const missing = this.findMissingLandmarks(landmarks, th.minVisibility);
    const measure = missing.length === 0 ? this.measurePose(landmarks, th) : null;

    if (measure) {
      this.currentAngle = measure.angle;
      this.depthProgress = measure.progress;
      if (measure.jointPoint) {
        this.drawAngleArc(measure.jointPoint, measure.refA, measure.refB, measure.angle, measure.formOk);
        this.drawAngleBadge(measure.jointPoint, measure.badgeText, measure.formOk);
      }
      if (measure.depthLabel) {
        this.drawTargetDepthGuide(
          measure.depthGuidePoint || measure.jointPoint,
          measure.isContracted,
          measure.depthLabel
        );
      }
    } else {
      // 추적이 끊기면 스무딩 히스토리를 버려야 복귀 시 옛 값이 섞이지 않습니다.
      this.smoothedAngle = null;
    }

    if (this.phase === "calibrating") {
      this.updateCalibration(measure, missing, th);
      this.emitLiveStateThrottled();
      return;
    }

    if (this.phase === "countdown") {
      this.updateCountdown();
      this.emitLiveStateThrottled();
      return;
    }

    if (this.phase !== "counting") return;

    if (!measure) {
      // 카운팅 중 전신을 놓치면 페이즈는 유지하되 판정만 멈춥니다.
      this.emitFeedback(
        missing.length ? this.describeMissing(missing) : "관절 인식이 불안정합니다. 카메라 정면으로 서 주세요",
        false
      );
      this.emitLiveStateThrottled();
      return;
    }

    if (this.currentExercise.id === "plank") {
      this.runPlankHold(measure, th);
    } else {
      this.runRepCycle(measure.angle, th, measure.formOk, measure.messages);
    }

    this.emitLiveStateThrottled();
  }

  // 운동별 관절 측정. 판정은 하지 않고 "지금 몸이 어떤 상태인가"만 반환합니다.
  // 신뢰할 수 있는 각도를 못 얻으면 null을 돌려 판정 자체를 중단시킵니다.
  measurePose(landmarks, th) {
    const exId = this.currentExercise.id;
    const minVis = th.minVisibility;
    const gaugeSpan = Math.max(1, th.gaugeTop - th.contracted);
    const rangeProgress = (angle) =>
      Math.max(0, Math.min(100, Math.round(((th.gaugeTop - angle) / gaugeSpan) * 100)));

    if (exId === "squat" || exId === "lunge") {
      const isSquat = exId === "squat";
      let raw = null;

      if (isSquat) {
        const knee = this.bestSideAngle(landmarks, [23, 25, 27], [24, 26, 28], minVis);
        if (!knee) return null;
        raw = knee.angle;
      } else {
        // 런지는 좌우 평균이 아니라 더 깊게 굽힌 앞무릎 각도를 봅니다.
        const l = this.jointAngleWithVisibility(landmarks, 23, 25, 27);
        const r = this.jointAngleWithVisibility(landmarks, 24, 26, 28);
        const usable = [l, r].filter((c) => c && c.vis >= minVis);
        if (usable.length === 0) return null;
        raw = Math.min(...usable.map((c) => c.angle));
      }

      const angle = this.smoothAngle(raw);
      const jointPoint = landmarks[25] || landmarks[26];

      return {
        angle,
        badgeText: `${angle}°`,
        progress: rangeProgress(angle),
        isContracted: angle <= th.contracted,
        inStartPose: angle >= th.extended,
        startPoseHint: isSquat
          ? "무릎을 펴고 바르게 선 자세에서 시작합니다"
          : "두 발을 모으고 바르게 선 자세에서 시작합니다",
        formOk: true,
        jointPoint,
        refA: landmarks[23] || landmarks[24],
        refB: landmarks[27] || landmarks[28],
        depthGuidePoint: jointPoint,
        depthLabel: isSquat
          ? `SQUAT ${th.contracted}° DEPTH TARGET`
          : `LUNGE ${th.contracted}° TARGET DEPTH`,
        messages: isSquat
          ? {
              bottom: "완벽한 깊이입니다! 힘차게 올라오세요! 🔥",
              deeper: "엉덩이를 조금 더 깊게 낮춰주세요!",
              idle: "시작 자세 준비 완료! 천천히 앉으세요.",
              success: "스쿼트 1회 완벽 성공! ✨",
              tooFast: "너무 빠릅니다. 하단에서 잠깐 멈췄다 올라오세요!",
              form: "허리를 곧게 펴고 무게 중심을 발 가운데에 두세요!"
            }
          : {
              bottom: "완벽한 런지 깊이! 앞발로 바닥을 밀며 일어나세요! 🦵",
              deeper: "무릎이 90도에 가까워지도록 조금 더 낮춰주세요!",
              idle: "한 발을 앞으로 크게 딛고 무릎을 굽히세요.",
              success: "런지 1회 완벽 성공! 하체 밸런스 최고! ⚡",
              tooFast: "중심이 흔들립니다. 하단에서 잠깐 멈추세요!",
              form: "상체를 곧게 세우고 앞무릎이 발끝을 넘지 않게 하세요!"
            }
      };
    }

    if (exId === "pushup") {
      const elbow = this.bestSideAngle(landmarks, [11, 13, 15], [12, 14, 16], minVis);
      if (!elbow) return null;
      const angle = this.smoothAngle(elbow.angle);
      const torso = this.bestSideAngle(landmarks, [11, 23, 27], [12, 24, 28], minVis);
      const formOk = !torso || torso.angle > 140;

      return {
        angle,
        badgeText: `${angle}°`,
        progress: rangeProgress(angle),
        isContracted: angle <= th.contracted,
        inStartPose: angle >= th.extended,
        startPoseHint: "팔을 곧게 편 플랭크 자세를 잡아 주세요",
        formOk,
        jointPoint: landmarks[13] || landmarks[14],
        refA: landmarks[11] || landmarks[12],
        refB: landmarks[15] || landmarks[16],
        depthGuidePoint: landmarks[11] || landmarks[12],
        depthLabel: "PUSHUP CHEST DEPTH",
        messages: {
          bottom: "가슴 깊이 터치 완료! 밀어올리세요! 💪",
          deeper: "가슴을 바닥 가까이 더 내려주세요!",
          idle: "플랭크 자세를 유지한 채 가슴을 낮추세요.",
          success: "푸시업 1회 성공! 팔을 곧게 폈습니다! ⚡",
          tooFast: "반동을 쓰고 있습니다. 하단에서 한 박자 멈추세요!",
          form: "허리가 쳐지지 않게 코어를 조여주세요!"
        }
      };
    }

    if (exId === "situp") {
      const hip = this.bestSideAngle(landmarks, [11, 23, 25], [12, 24, 26], minVis);
      if (!hip) return null;
      const angle = this.smoothAngle(hip.angle);

      return {
        angle,
        badgeText: `${angle}°`,
        progress: rangeProgress(angle),
        isContracted: angle <= th.contracted,
        inStartPose: angle >= th.extended,
        startPoseHint: "무릎을 세우고 등을 바닥에 댄 채 누워 주세요",
        formOk: true,
        jointPoint: landmarks[23] || landmarks[24],
        refA: landmarks[11] || landmarks[12],
        refB: landmarks[25] || landmarks[26],
        depthGuidePoint: null,
        depthLabel: "",
        messages: {
          bottom: "완벽한 복근 수축! 천천히 누우세요! 🧘",
          deeper: "상체를 끝까지 무릎 쪽으로 당겨주세요!",
          idle: "복근에 긴장을 유지하며 상체를 일으키세요.",
          success: "윗몸일으키기 1회 완벽 성공! 🔥",
          tooFast: "반동으로 튕기고 있습니다. 조금 더 천천히 올라오세요!",
          form: "손으로 목을 당기지 말고 복근으로 말아 올리세요!"
        }
      };
    }

    if (exId === "plank") {
      const line = this.bestSideAngle(landmarks, [11, 23, 27], [12, 24, 28], minVis);
      if (!line) return null;
      const angle = this.smoothAngle(line.angle);
      const diff = Math.abs(th.plankCenter - angle);
      const isStraight = diff <= th.plankTolerance;

      return {
        angle,
        badgeText: `${angle}°`,
        progress: isStraight
          ? 100
          : Math.max(10, Math.min(95, Math.round(100 - (diff - th.plankTolerance) * 2))),
        isContracted: isStraight,
        inStartPose: isStraight,
        startPoseHint: "어깨-골반-발목을 일직선으로 맞춰 주세요",
        formOk: isStraight,
        jointPoint: landmarks[23] || landmarks[24],
        refA: landmarks[11] || landmarks[12],
        refB: landmarks[27] || landmarks[28],
        depthGuidePoint: landmarks[23] || landmarks[24],
        depthLabel: `PLANK ${th.plankCenter}° HORIZONTAL LINE`,
        messages: {}
      };
    }

    if (exId === "jumpingjack") {
      const ls = landmarks[11];
      const rs = landmarks[12];
      const lw = landmarks[15];
      const rw = landmarks[16];
      const la = landmarks[27];
      const ra = landmarks[28];
      if (!ls || !rs || !lw || !rw || !la || !ra) return null;

      const shoulderY = Math.min(ls.y, rs.y);
      const headY = landmarks[0] ? landmarks[0].y : shoulderY - 0.08;
      let reachY = shoulderY;
      if (th.jackReach === "nose") reachY = headY;
      else if (th.jackReach === "overhead") reachY = headY - 0.06;

      const handsUp = lw.y < reachY && rw.y < reachY;
      const shoulderWidth = this.calculateDistance(ls, rs) || 0.2;
      const feetApart = this.calculateDistance(la, ra) > shoulderWidth * th.jackFeetRatio;

      // 손 올림 / 발 벌림을 0(완전 오픈) ~ 180(완전 클로즈) 합성값으로 환산합니다.
      const synthetic = 180 - (handsUp ? 90 : 0) - (feetApart ? 90 : 0);
      const angle = this.smoothAngle(synthetic);
      const openPercent = Math.max(0, Math.min(100, Math.round((180 - angle) / 1.8)));

      return {
        angle,
        badgeText: `${openPercent}%`,
        progress: openPercent,
        isContracted: angle <= th.contracted,
        inStartPose: angle >= th.extended,
        startPoseHint: "팔을 내리고 두 발을 모은 자세에서 시작합니다",
        formOk: true,
        jointPoint: landmarks[11],
        refA: null,
        refB: null,
        depthGuidePoint: null,
        depthLabel: "",
        messages: {
          bottom: "좋습니다! 손발을 빠르게 모으세요! ⚡",
          deeper: "팔과 다리를 동시에 끝까지 벌려주세요!",
          idle: "가볍게 뛰며 손발을 벌려주세요!",
          success: "점핑잭 1회 완벽 리듬! 🏃",
          tooFast: "리듬이 너무 빠릅니다. 정확히 벌렸다 모으세요!",
          form: "팔을 머리 위까지 끝까지 올려주세요!"
        }
      };
    }

    return null;
  }

  // 플랭크는 횟수가 아니라 유지 시간으로 포인트를 줍니다.
  runPlankHold(measure, th) {
    const now = Date.now();
    if (measure.isContracted) {
      if (!this.plankHoldStart) this.plankHoldStart = now;
      const holdSec = Math.floor((now - this.plankHoldStart) / 1000);
      this.motionState = "down";
      if (holdSec >= th.holdBlockSec) {
        this.plankHoldStart = now;
        const totalSec = (this.repCount + 1) * th.holdBlockSec;
        this.registerRep(`플랭크 ${th.holdBlockSec}초 연속 버티기 성공! (총 ${totalSec}초) ⏱️`);
      } else {
        this.emitFeedback(`코어 수평 완벽 유지 중! 🔥 (${holdSec}초 버티는 중)`, true);
      }
    } else {
      this.plankHoldStart = 0;
      this.motionState = "up";
      this.emitFeedback(
        measure.angle < th.plankCenter - th.plankTolerance
          ? "엉덩이가 처지지 않게 복근에 힘을 주세요!"
          : "엉덩이를 너무 높이 들지 말고 수평을 맞추세요!",
        false
      );
    }
  }

  // 1회 완료 등록
  registerRep(successMsg) {
    // counting 페이즈가 아니면 어떤 경로로도 카운트되지 않게 막는 최종 방어선입니다.
    if (this.phase !== "counting") return;

    this.repCount++;
    this.lastRepTimestamp = Date.now();
    const weightFactor = this.userWeightKg / 70.0;
    this.caloriesBurned = parseFloat((this.repCount * this.currentExercise.caloriePerRep * weightFactor).toFixed(1));

    this.emitFeedback(successMsg, true);
    this.onRepCount({
      reps: this.repCount,
      calories: this.caloriesBurned,
      exercise: this.currentExercise,
      difficulty: this.difficulty,
      message: successMsg
    });
  }

  // 카메라 영상 위에 초록 뼈대 + 노란 관절 점을 같이 그림
  drawSkeleton(landmarks, isGood = true) {
    if (!this.showSkeletonOverlay || !this.ctx || !this.canvasEl) return;
    const width = this.canvasEl.width;
    const height = this.canvasEl.height;
    const bone = isGood ? "#34C759" : "#FF9F0A";
    const joint = "#FFD60A";
    const minVis = 0.12;

    this.ctx.save();
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
    this.ctx.shadowBlur = 0;
    this.ctx.lineWidth = Math.max(5, Math.round(width / 90));
    this.ctx.strokeStyle = bone;

    for (const [i, j] of this.POSE_CONNECTIONS) {
      const p1 = landmarks[i];
      const p2 = landmarks[j];
      if (p1 && p2 && (p1.visibility ?? 1) > minVis && (p2.visibility ?? 1) > minVis) {
        this.ctx.beginPath();
        this.ctx.moveTo(p1.x * width, p1.y * height);
        this.ctx.lineTo(p2.x * width, p2.y * height);
        this.ctx.stroke();
      }
    }

    const radius = Math.max(6, Math.round(width / 70));
    for (let idx = 0; idx <= 32; idx++) {
      const lm = landmarks[idx];
      if (lm && (lm.visibility ?? 1) > minVis) {
        const cx = lm.x * width;
        const cy = lm.y * height;
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
        this.ctx.fillStyle = joint;
        this.ctx.fill();
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = "#111";
        this.ctx.stroke();
      }
    }
    this.ctx.restore();
  }

  // 2. 실시간 관절 각도 아크(Angle Sector) 렌더링
  drawAngleArc(pCenter, pA, pB, angle, isGood = true) {
    if (!pCenter || !pA || !pB || !this.showSkeletonOverlay || !this.ctx) return;
    const width = this.canvasEl.width;
    const height = this.canvasEl.height;

    const cx = pCenter.x * width;
    const cy = pCenter.y * height;

    const angleA = Math.atan2(pA.y * height - cy, pA.x * width - cx);
    const angleB = Math.atan2(pB.y * height - cy, pB.x * width - cx);

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy);
    this.ctx.arc(cx, cy, 32, angleA, angleB, false);
    this.ctx.closePath();
    this.ctx.fillStyle = isGood ? "rgba(204, 255, 0, 0.32)" : "rgba(0, 240, 255, 0.28)";
    this.ctx.fill();

    this.ctx.lineWidth = 2.5;
    this.ctx.strokeStyle = isGood ? "#CCFF00" : "#00F0FF";
    this.ctx.shadowColor = isGood ? "#CCFF00" : "#00F0FF";
    this.ctx.shadowBlur = 10;
    this.ctx.stroke();
    this.ctx.restore();
  }

  // 3. 레이저 목표 깊이 가이드선 렌더링
  drawTargetDepthGuide(joint, isDown, label = "TARGET DEPTH") {
    if (!joint || !this.showSkeletonOverlay || !this.ctx) return;
    const width = this.canvasEl.width;
    const height = this.canvasEl.height;
    const y = joint.y * height;

    this.ctx.save();
    this.ctx.setLineDash([8, 6]);
    this.ctx.lineWidth = isDown ? 2.5 : 1.5;
    this.ctx.strokeStyle = isDown ? "rgba(204, 255, 0, 0.95)" : "rgba(0, 240, 255, 0.45)";
    this.ctx.shadowColor = isDown ? "#CCFF00" : "#00F0FF";
    this.ctx.shadowBlur = isDown ? 12 : 4;

    this.ctx.beginPath();
    this.ctx.moveTo(width * 0.05, y);
    this.ctx.lineTo(width * 0.95, y);
    this.ctx.stroke();

    this.ctx.setLineDash([]);
    this.ctx.font = "bold 11px Inter, sans-serif";
    this.ctx.fillStyle = isDown ? "#CCFF00" : "#00F0FF";
    // 좌우 반전 화면에서도 잘리지 않도록 가운데 정렬로 그립니다.
    this.ctx.textAlign = "center";
    this.drawTextUnmirrored(`⚡ ${label}`, width / 2, y - 6);
    this.ctx.restore();
  }

  // 4. 관절 옆 실시간 각도 배지 렌더링
  drawAngleBadge(joint, text, isGood = true) {
    if (!joint || !this.showSkeletonOverlay || !this.ctx) return;
    const x = joint.x * this.canvasEl.width + 16;
    const y = joint.y * this.canvasEl.height - 10;

    this.ctx.save();
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = isGood ? "#CCFF00" : "#FF5722";

    // Badge Background
    this.ctx.fillStyle = "rgba(18, 22, 31, 0.92)";
    this.ctx.strokeStyle = isGood ? "#CCFF00" : "#FF5722";
    this.ctx.lineWidth = 1.8;

    const padX = 9;
    const padY = 4;
    this.ctx.font = "bold 13px Inter, sans-serif";
    const textWidth = this.ctx.measureText(text).width;

    this.ctx.beginPath();
    // roundRect는 구형 Safari/WebView에 없어 사각형으로 폴백합니다.
    if (typeof this.ctx.roundRect === "function") {
      this.ctx.roundRect(x - padX, y - 14, textWidth + padX * 2, 22, 6);
    } else {
      this.ctx.rect(x - padX, y - 14, textWidth + padX * 2, 22);
    }
    this.ctx.fill();
    this.ctx.stroke();

    // Badge Text (배지 박스 중앙을 기준으로 뒤집어야 글자가 박스 안에 남습니다)
    this.ctx.fillStyle = isGood ? "#CCFF00" : "#FF7043";
    this.ctx.textAlign = "center";
    this.drawTextUnmirrored(text, x + textWidth / 2, y + 1);
    this.ctx.restore();
  }

  // 운동 종료 리포트 데이터 반환
  getWorkoutSummary() {
    const durationSec = Math.max(1, this.elapsedSeconds);
    const weightFactor = this.userWeightKg / 70.0;
    const rewardMul = this.difficulty.rewardMultiplier;
    const totalCalories = parseFloat((this.repCount * this.currentExercise.caloriePerRep * weightFactor).toFixed(1));
    const totalXp = Math.round(this.repCount * this.currentExercise.xpPerRep * rewardMul);
    const totalVc = Math.round(this.repCount * this.currentExercise.vcPerRep * rewardMul);

    const statIncreases = {
      might: Math.round((this.currentExercise.statGain.might || 0) * (this.repCount / 10)),
      agility: Math.round((this.currentExercise.statGain.agility || 0) * (this.repCount / 10)),
      spirit: Math.round((this.currentExercise.statGain.spirit || 0) * (this.repCount / 10))
    };

    return {
      exerciseId: this.currentExercise.id,
      exerciseName: this.currentExercise.name,
      icon: this.currentExercise.icon,
      difficultyId: this.difficulty.id,
      difficultyName: this.difficulty.name,
      rewardMultiplier: rewardMul,
      reps: this.repCount,
      durationSec,
      calories: totalCalories,
      xpGained: totalXp,
      vcGained: totalVc,
      statIncreases,
      timestamp: new Date().toISOString()
    };
  }
}
