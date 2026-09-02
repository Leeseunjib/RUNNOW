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
    cover: "./assets/exercises/squat.jpg"
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
    cover: "./assets/exercises/pushup.jpg"
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
    cover: "./assets/exercises/situp.jpg"
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
    cover: "./assets/exercises/jumpingjack.jpg"
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
    cover: "./assets/exercises/plank.jpg"
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
    cover: "./assets/exercises/lunge.jpg"
  }
};

export class MotionTracker {
  constructor(options = {}) {
    this.videoEl = options.videoEl || null;
    this.canvasEl = options.canvasEl || null;
    this.ctx = this.canvasEl ? this.canvasEl.getContext("2d") : null;

    this.onRepCount = options.onRepCount || (() => {});
    this.onFeedback = options.onFeedback || (() => {});
    this.onStateUpdate = options.onStateUpdate || (() => {});
    this.onError = options.onError || console.error;

    this.poseLandmarker = null;
    this.stream = null;
    this.isRunning = false;
    this.facingMode = "user"; // 'user' (front) or 'environment' (rear)

    this.currentExercise = EXERCISE_TYPES.SQUAT;
    this.repCount = 0;
    this.motionState = "up"; // 'up', 'down', 'transition'
    this.currentAngle = 0;
    this.depthProgress = 0; // 0 to 100%
    this.lastRepTimestamp = 0;
    this.caloriesBurned = 0;
    this.startTime = 0;
    this.elapsedSeconds = 0;
    this.timerInterval = null;

    this.userWeightKg = options.weightKg || 70;
    this.lastDetectMs = 0;
    this.lastLandmarks = null;
    this.animFrameId = null;
    this.showSkeletonOverlay = true;

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

  resetExerciseStats() {
    this.repCount = 0;
    this.motionState = "up";
    this.currentAngle = 0;
    this.depthProgress = 0;
    this.caloriesBurned = 0;
    this.elapsedSeconds = 0;
    this.startTime = Date.now();
  }

  isIosFamily() {
    const ua = navigator.userAgent || "";
    return /iPhone|iPad|iPod/i.test(ua)
      || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  }

  async waitForClassicPose(timeoutMs = 5000) {
    if (window.Pose) return true;
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
      if (window.Pose) return true;
      await new Promise((resolve) => setTimeout(resolve, 120));
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
        await pose.initialize();
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
      const modelBuffer = await this.fetchModelBuffer();
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
  async startCamera(videoElement, canvasElement) {
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
    await new Promise((resolve, reject) => {
      this.videoEl.onloadedmetadata = async () => {
        try {
          await this.videoEl.play();
          this.isRunning = true;
          this.requestWakeLock();
          this.startTime = Date.now();
          this.startTimer();
          this.predictWebcamLoop();
          resolve(true);
        } catch (playErr) {
          console.error("Video play error:", playErr);
          this.isRunning = true;
          this.predictWebcamLoop();
          resolve(true);
        }
      };
      this.videoEl.onerror = (err) => reject(err);
    });

    // 백그라운드가 아니라 여기서 모델을 끝까지 올립니다. 실패하면 카메라를 끄고 알립니다.
    const ready = await this.initMediaPipe();
    if (ready) {
      if (this.onFeedback) {
        this.onFeedback({ text: "AI 관절 인식이 활성화되었습니다. 전신이 보이게 서주세요!", isGood: true });
      }
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
    this.onStateUpdate({
      reps: this.repCount,
      angle: this.currentAngle,
      jointLabel: this.currentExercise.jointLabel || "JOINT",
      depthProgress: this.depthProgress,
      calories: this.caloriesBurned,
      elapsedSeconds: this.elapsedSeconds,
      motionState: this.motionState,
      exercise: this.currentExercise
    });
  }

  stopCamera() {
    this.isRunning = false;
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
        this.drawSeekingHint(width, height);
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

  drawSeekingHint(width, height) {
    if (!this.ctx) return;
    this.ctx.save();
    this.ctx.fillStyle = "rgba(255, 214, 10, 0.92)";
    this.ctx.font = `700 ${Math.max(16, Math.round(width / 28))}px sans-serif`;
    this.ctx.textAlign = "center";
    this.ctx.fillText("관절을 찾는 중 · 전신이 나오게 서 주세요", width / 2, height * 0.12);
    this.ctx.restore();
  }

  // 운동별 상태 머신 & 횟수(Rep) 판별 로직
  processExerciseLogic(landmarks) {
    const exId = this.currentExercise.id;
    let angle = 0;
    let feedback = "";
    let isGood = true;
    let targetProgress = 0;
    let activeJointPoint = null;

    if (exId === "squat") {
      // 🦵 스쿼트: 골반(23/24) - 무릎(25/26) - 발목(27/28)
      const leftAngle = this.calculateAngle(landmarks[23], landmarks[25], landmarks[27]);
      const rightAngle = this.calculateAngle(landmarks[24], landmarks[26], landmarks[28]);
      
      angle = leftAngle && rightAngle ? Math.round((leftAngle + rightAngle) / 2) : (leftAngle || rightAngle || 180);
      activeJointPoint = landmarks[25] || landmarks[26];
      const hipPoint = landmarks[23] || landmarks[24];
      const anklePoint = landmarks[27] || landmarks[28];

      // 스쿼트 가동 범위: 160도(UP) ~ 90도(DOWN 수축 완료)
      targetProgress = Math.max(0, Math.min(100, Math.round(((165 - angle) / (165 - 90)) * 100)));

      if (angle <= 95) {
        if (this.motionState === "up" || this.motionState === "transition") {
          this.motionState = "down";
          feedback = "완벽한 깊이입니다! 힘차게 올라오세요! 🔥";
          isGood = true;
        }
      } else if (angle >= 155) {
        if (this.motionState === "down") {
          this.motionState = "up";
          this.registerRep("스쿼트 1회 완벽 성공! ✨");
          feedback = "나이스 스쿼트! 다음 횟수 준비!";
          isGood = true;
        } else {
          feedback = "시작 자세 준비 완료! 천천히 앉으세요.";
          isGood = true;
        }
      } else {
        if (this.motionState === "up") {
          this.motionState = "transition";
        }
        if (this.motionState === "transition" && angle > 105) {
          feedback = "엉덩이를 조금 더 깊게 낮춰주세요!";
          isGood = false;
        }
      }

      // AR 실시간 관절 각도 아크 & 깊이 가이드라인 렌더링
      this.drawAngleArc(activeJointPoint, hipPoint, anklePoint, angle, isGood);
      this.drawTargetDepthGuide(activeJointPoint, angle <= 95, "SQUAT 90° DEPTH TARGET");

    } else if (exId === "pushup") {
      // 💪 팔굽혀펴기: 어깨(11/12) - 팔꿈치(13/14) - 손목(15/16)
      const leftAngle = this.calculateAngle(landmarks[11], landmarks[13], landmarks[15]);
      const rightAngle = this.calculateAngle(landmarks[12], landmarks[14], landmarks[16]);
      angle = leftAngle && rightAngle ? Math.round((leftAngle + rightAngle) / 2) : (leftAngle || rightAngle || 180);
      activeJointPoint = landmarks[13] || landmarks[14];
      const shoulderPoint = landmarks[11] || landmarks[12];
      const wristPoint = landmarks[15] || landmarks[16];

      // 팔굽혀펴기 가동 범위: 155도(UP) ~ 90도(DOWN)
      targetProgress = Math.max(0, Math.min(100, Math.round(((160 - angle) / (160 - 90)) * 100)));

      // 허리 직선도 체크 (어깨 - 엉덩이 - 발목)
      const torsoAngle = this.calculateAngle(landmarks[11], landmarks[23], landmarks[27]);
      const isTorsoStraight = !torsoAngle || torsoAngle > 140;

      if (angle <= 90) {
        if (this.motionState === "up" || this.motionState === "transition") {
          this.motionState = "down";
          feedback = isTorsoStraight ? "가슴 깊이 터치 완료! 밀어올리세요! 💪" : "허리가 쳐지지 않게 코어를 조여주세요!";
          isGood = isTorsoStraight;
        }
      } else if (angle >= 150) {
        if (this.motionState === "down") {
          this.motionState = "up";
          this.registerRep("푸시업 1회 성공! 팔을 곧게 폈습니다! ⚡");
          feedback = "최고의 상체 파워! 다음 동작!";
          isGood = true;
        } else {
          feedback = "플랭크 자세 유지 후 가슴을 낮추세요.";
          isGood = true;
        }
      } else {
        if (this.motionState === "up") this.motionState = "transition";
        if (this.motionState === "transition") {
          feedback = "가슴을 바닥 가까이 더 내려주세요!";
          isGood = false;
        }
      }

      this.drawAngleArc(activeJointPoint, shoulderPoint, wristPoint, angle, isGood);
      this.drawTargetDepthGuide(shoulderPoint, angle <= 90, "PUSHUP CHEST DEPTH");

    } else if (exId === "situp") {
      // 🧘 윗몸일으키기: 어깨(11/12) - 골반(23/24) - 무릎(25/26)
      const leftAngle = this.calculateAngle(landmarks[11], landmarks[23], landmarks[25]);
      const rightAngle = this.calculateAngle(landmarks[12], landmarks[24], landmarks[26]);
      angle = leftAngle && rightAngle ? Math.round((leftAngle + rightAngle) / 2) : (leftAngle || rightAngle || 140);
      activeJointPoint = landmarks[23] || landmarks[24];
      const shoulderPoint = landmarks[11] || landmarks[12];
      const kneePoint = landmarks[25] || landmarks[26];

      // 가동 범위: 135도(누운 자세 DOWN) ~ 75도(일어난 자세 UP)
      targetProgress = Math.max(0, Math.min(100, Math.round(((140 - angle) / (140 - 75)) * 100)));

      if (angle <= 75) {
        if (this.motionState === "down" || this.motionState === "transition") {
          this.motionState = "up";
          feedback = "완벽한 복근 수축! 천천히 누우세요! 🧘";
          isGood = true;
        }
      } else if (angle >= 130) {
        if (this.motionState === "up") {
          this.motionState = "down";
          this.registerRep("윗몸일으키기 1회 완벽 성공! 🔥");
          feedback = "나이스 코어! 상체를 다시 일으키세요!";
          isGood = true;
        } else {
          feedback = "복근에 긴장을 유지하며 상체를 일으키세요.";
          isGood = true;
        }
      } else {
        if (this.motionState === "down") this.motionState = "transition";
        if (this.motionState === "transition") {
          feedback = "상체를 끝까지 무릎 쪽으로 당겨주세요!";
          isGood = false;
        }
      }

      this.drawAngleArc(activeJointPoint, shoulderPoint, kneePoint, angle, isGood);

    } else if (exId === "jumpingjack") {
      // ⭐ 점핑잭: 팔 높이 및 발 벌림 폭
      const leftWrist = landmarks[15];
      const rightWrist = landmarks[16];
      const leftShoulder = landmarks[11];
      const rightShoulder = landmarks[12];
      const leftAnkle = landmarks[27];
      const rightAnkle = landmarks[28];

      const handsUp = leftWrist && rightWrist && leftShoulder && rightShoulder &&
                      leftWrist.y < leftShoulder.y && rightWrist.y < rightShoulder.y;
      
      const feetDistance = this.calculateDistance(leftAnkle, rightAnkle);
      const shoulderWidth = this.calculateDistance(leftShoulder, rightShoulder) || 0.2;
      const feetApart = feetDistance > shoulderWidth * 1.5;

      angle = handsUp && feetApart ? 100 : 0;
      targetProgress = handsUp && feetApart ? 100 : (handsUp || feetApart ? 50 : 0);
      activeJointPoint = landmarks[11];

      if (handsUp && feetApart) {
        if (this.motionState === "in") {
          this.motionState = "out";
          feedback = "좋습니다! 손발을 빠르게 모으세요! ⚡";
          isGood = true;
        }
      } else if (!handsUp && !feetApart) {
        if (this.motionState === "out") {
          this.motionState = "in";
          this.registerRep("점핑잭 1회 완벽 리듬! 🏃");
          feedback = "나이스 템포! 리듬을 유지하세요!";
          isGood = true;
        } else {
          feedback = "가볍게 뛰며 손발을 벌려주세요!";
          isGood = true;
        }
      }
    } else if (exId === "plank") {
      // ⏱️ 플랭크: 어깨(11/12) - 골반(23/24) - 발목(27/28)
      const leftLine = this.calculateAngle(landmarks[11], landmarks[23], landmarks[27]);
      const rightLine = this.calculateAngle(landmarks[12], landmarks[24], landmarks[28]);
      angle = leftLine && rightLine ? Math.round((leftLine + rightLine) / 2) : (leftLine || rightLine || 170);
      activeJointPoint = landmarks[23] || landmarks[24];
      const shoulderPoint = landmarks[11] || landmarks[12];
      const anklePoint = landmarks[27] || landmarks[28];

      const isStraight = angle >= 155 && angle <= 195;
      targetProgress = isStraight ? 100 : Math.max(20, Math.min(90, Math.round((angle / 180) * 100)));

      if (isStraight) {
        const now = Date.now();
        if (!this.plankHoldStart) this.plankHoldStart = now;
        const holdDuration = Math.floor((now - this.plankHoldStart) / 1000);

        if (holdDuration >= 5) {
          this.plankHoldStart = now;
          this.registerRep(`플랭크 5초 연속 버티기 성공! (${(this.repCount + 1) * 5}초 유지) ⏱️`);
        }
        feedback = `코어 수평 완벽 유지 중! 🔥 (${holdDuration}초 버티는 중)`;
        isGood = true;
      } else {
        this.plankHoldStart = Date.now();
        if (angle < 145) {
          feedback = "엉덩이가 처지지 않게 복근에 힘을 주세요!";
        } else {
          feedback = "엉덩이를 너무 높이 들지 말고 수평을 맞추세요!";
        }
        isGood = false;
      }

      this.drawAngleArc(activeJointPoint, shoulderPoint, anklePoint, angle, isStraight);
      this.drawTargetDepthGuide(activeJointPoint, isStraight, "PLANK 180° HORIZONTAL LINE");

    } else if (exId === "lunge") {
      // 🦵 런지: 앞무릎 & 뒷무릎 90도 굴곡
      const leftKnee = this.calculateAngle(landmarks[23], landmarks[25], landmarks[27]);
      const rightKnee = this.calculateAngle(landmarks[24], landmarks[26], landmarks[28]);
      const minKnee = Math.min(leftKnee || 180, rightKnee || 180);
      angle = minKnee;
      activeJointPoint = landmarks[25] || landmarks[26];
      const hipPoint = landmarks[23] || landmarks[24];
      const anklePoint = landmarks[27] || landmarks[28];

      targetProgress = Math.max(0, Math.min(100, Math.round(((165 - angle) / (165 - 90)) * 100)));

      if (angle <= 95) {
        if (this.motionState === "up" || this.motionState === "transition") {
          this.motionState = "down";
          feedback = "완벽한 런지 깊이! 앞발로 바닥을 밀며 일어나세요! 🦵";
          isGood = true;
        }
      } else if (angle >= 155) {
        if (this.motionState === "down") {
          this.motionState = "up";
          this.registerRep("런지 1회 완벽 성공! 하체 밸런스 최고! ⚡");
          feedback = "나이스 런지! 다음 횟수 준비!";
          isGood = true;
        } else {
          feedback = "한 발을 앞으로 크게 딛고 무릎을 90도로 굽히세요.";
          isGood = true;
        }
      } else {
        if (this.motionState === "up") this.motionState = "transition";
        if (this.motionState === "transition") {
          feedback = "무릎이 90도가 되도록 조금 더 낮춰주세요!";
          isGood = false;
        }
      }

      this.drawAngleArc(activeJointPoint, hipPoint, anklePoint, angle, isGood);
      this.drawTargetDepthGuide(activeJointPoint, angle <= 95, "LUNGE 90° TARGET DEPTH");
    }

    this.currentAngle = angle;
    this.depthProgress = targetProgress;

    // 관절 위 플로팅 각도 배지 렌더링
    if (activeJointPoint) {
      this.drawAngleBadge(activeJointPoint, `${angle}°`, isGood);
    }

    this.onFeedback({
      text: feedback,
      type: isGood ? "good" : "warn",
      isGood
    });
    this.emitLiveState();
  }

  // 1회 완료 등록
  registerRep(successMsg) {
    this.repCount++;
    const weightFactor = this.userWeightKg / 70.0;
    this.caloriesBurned = parseFloat((this.repCount * this.currentExercise.caloriePerRep * weightFactor).toFixed(1));

    this.onRepCount({
      reps: this.repCount,
      calories: this.caloriesBurned,
      exercise: this.currentExercise,
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
    this.ctx.fillText(`⚡ ${label}`, width * 0.08, y - 6);
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
    this.ctx.roundRect(x - padX, y - 14, textWidth + padX * 2, 22, 6);
    this.ctx.fill();
    this.ctx.stroke();

    // Badge Text
    this.ctx.fillStyle = isGood ? "#CCFF00" : "#FF7043";
    this.ctx.fillText(text, x, y + 1);
    this.ctx.restore();
  }

  // 운동 종료 리포트 데이터 반환
  getWorkoutSummary() {
    const durationSec = Math.max(1, this.elapsedSeconds);
    const weightFactor = this.userWeightKg / 70.0;
    const totalCalories = parseFloat((this.repCount * this.currentExercise.caloriePerRep * weightFactor).toFixed(1));
    const totalXp = Math.round(this.repCount * this.currentExercise.xpPerRep);
    const totalVc = Math.round(this.repCount * this.currentExercise.vcPerRep);

    const statIncreases = {
      might: Math.round((this.currentExercise.statGain.might || 0) * (this.repCount / 10)),
      agility: Math.round((this.currentExercise.statGain.agility || 0) * (this.repCount / 10)),
      spirit: Math.round((this.currentExercise.statGain.spirit || 0) * (this.repCount / 10))
    };

    return {
      exerciseId: this.currentExercise.id,
      exerciseName: this.currentExercise.name,
      icon: this.currentExercise.icon,
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
