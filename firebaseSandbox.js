// Firebase Local Sandbox & Mock Firestore Engine (Zero-Cloud Testing Engine)
// 대표님께서 별도의 클라우드 인증 없이 로컬 브라우저 환경에서 100% 완벽하게 테스트할 수 있는 샌드박스 엔진입니다.

export class FirebaseSandbox {
  constructor() {
    this.storageKey = "RUNNOW_CORE_DB_V2";
    this.authKey = "RUNNOW_AUTH_SESSION";
    this.latencyMs = 0;

    // 이전 레거시 더미 데이터(1250 VC, Lv3) 전량 강제 삭제
    localStorage.removeItem("RUNGOTCHI_SANDBOX_FIRESTORE_DB");
    localStorage.removeItem("RUNGOTCHI_SANDBOX_AUTH_USER");

    this.initDatabase();
  }

  // 초기 샌드박스 DB 스키마 셋업 (완전 초기 백지 상태: 0 VC / Lv 1)
  initDatabase() {
    const existing = localStorage.getItem(this.storageKey);
    if (!existing) {
      this.resetSandbox();
    }
  }

  // 샌드박스 전체 데이터 초기화 및 0-State 시드 생성
  resetSandbox() {
    const initialDB = {
      users: {
        "user_geonu_ceo": {
          uid: "user_geonu_ceo",
          displayName: "이건우 대표님",
          email: "dnswlq456@gmail.com",
          heightCm: 175,
          weightKg: 70,
          age: 30,
          coins: 0,
          bmi: 22.9,
          onboarded: false,
          createdAt: new Date().toISOString()
        }
      },
      tamagotchi: {
        "user_geonu_ceo": {
          name: "볼트몽",
          level: 1,
          xp: 0,
          totalKm: 0.0,
          hunger: 100,
          happiness: 100,
          energy: 100,
          might: 10,
          agility: 10,
          spirit: 10,
          statusCondition: "HEALTHY",
          updatedAt: new Date().toISOString()
        }
      },
      challenges_progress: {
        "user_geonu_ceo": {
          completedDays: [],
          currentDay: 1,
          streak: 0,
          habitCue: "퇴근 후 현관에서 러닝화 신고 바로 출발",
          updatedAt: new Date().toISOString()
        }
      },
      workouts: []
    };
    localStorage.setItem(this.storageKey, JSON.stringify(initialDB));
    return initialDB;
  }

  getDB() {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey)) || {};
    } catch {
      return {};
    }
  }

  saveDB(db) {
    localStorage.setItem(this.storageKey, JSON.stringify(db));
  }

  getDoc(collection, docId) {
    const db = this.getDB();
    if (db[collection] && db[collection][docId]) {
      return { exists: true, data: () => db[collection][docId] };
    }
    return { exists: false, data: () => null };
  }

  setDoc(collection, docId, data, merge = true) {
    const db = this.getDB();
    if (!db[collection]) db[collection] = {};

    if (merge && db[collection][docId]) {
      db[collection][docId] = { ...db[collection][docId], ...data, updatedAt: new Date().toISOString() };
    } else {
      db[collection][docId] = { ...data, updatedAt: new Date().toISOString() };
    }
    this.saveDB(db);
    return { success: true };
  }

  addWorkoutLog(userId, workoutData) {
    const db = this.getDB();
    if (!db.workouts) db.workouts = [];

    const newLog = {
      id: "run_" + Date.now(),
      userId,
      ...workoutData,
      timestamp: new Date().toISOString()
    };
    db.workouts.unshift(newLog);
    this.saveDB(db);
    return newLog;
  }

  // 네트워크 딜레이 시뮬레이터
  _simulateNetwork() {
    return new Promise((resolve) => setTimeout(resolve, this.latencyMs));
  }
}
