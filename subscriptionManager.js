// RUNNOW PRO 구독 멤버십 상태 및 라이프사이클 관리 모듈 (SubscriptionManager)

export const SUBSCRIPTION_PLANS = {
  MONTHLY: {
    id: "pro_monthly",
    name: "RUNNOW PRO 월간 멤버십",
    badge: "부담 없는 시작",
    priceKRW: 9900,
    priceUSD: 7.99,
    periodName: "/ 월",
    durationDays: 30,
    discountTag: null,
    desc: "매월 자동 갱신 • 언제든지 위약금 없이 1클릭 해지 가능"
  },
  ANNUAL: {
    id: "pro_annual",
    name: "RUNNOW PRO 연간 멤버십",
    badge: "러너 84%의 선택",
    priceKRW: 79000,
    priceUSD: 59.99,
    periodName: "/ 연 (월 ₩6,580)",
    durationDays: 365,
    discountTag: "BEST VALUE -35%",
    desc: "연간 ₩39,800 절약 • 7일 무료 체험 후 시작"
  }
};

// 주의: localStorage는 서버 응답을 잠깐 담아두는 캐시일 뿐, 권한의 근거가 아닙니다.
// 실제 구독 여부는 Cloud Functions가 결제를 검증해 Firestore에 기록한 값이 정본입니다.
// (firestore.rules에서 subscriptions 컬렉션의 클라이언트 쓰기를 전부 막아 두었습니다)
const STORAGE_KEY = "runnow_subscription_state_v1";

export class SubscriptionManager {
  constructor(options = {}) {
    this.storageKey = options.storageKey || STORAGE_KEY;
    this.listeners = [];
    this.state = this.loadState();
  }

  // 초기 상태 로드 (로컬 스토리지 & 기본값)
  loadState() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        // 만료일 검증
        if (parsed.expiresAt && new Date(parsed.expiresAt).getTime() < Date.now()) {
          parsed.status = "expired";
          parsed.tier = "free";
        }
        return parsed;
      }
    } catch (err) {
      console.warn("[SubscriptionManager] 로컬 상태 로드 오류:", err);
    }

    return {
      status: "inactive", // 'active' | 'inactive' | 'expired'
      tier: "free",       // 'free' | 'pro_monthly' | 'pro_annual' | 'pro_ceo_vip'
      planId: null,
      startedAt: null,
      expiresAt: null,
      isCeoPass: false,
      autoRenew: false
    };
  }

  // 상태 영구 저장
  saveState() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (err) {
      console.warn("[SubscriptionManager] 로컬 상태 저장 오류:", err);
    }
    this.notifyListeners();
  }

  // 서버(Cloud Functions)가 돌려준 구독 상태를 그대로 반영합니다.
  // 서버 응답이 있으면 로컬에 무엇이 저장돼 있든 그 값으로 덮어씁니다.
  applyServerState(serverState) {
    if (!serverState || typeof serverState !== "object") return this.state;

    this.state = {
      status: serverState.status || "inactive",
      tier: serverState.tier || "free",
      planId: serverState.planId || null,
      planName: serverState.planName || null,
      startedAt: serverState.startedAt || null,
      expiresAt: serverState.expiresAt || null,
      isCeoPass: Boolean(serverState.isCeoPass),
      autoRenew: Boolean(serverState.autoRenew),
      verifiedBy: "server"
    };
    this.saveState();
    this.notifyListeners();
    return this.state;
  }

  // 이 상태가 서버 검증을 거친 것인지 여부
  isServerVerified() {
    return this.state && this.state.verifiedBy === "server";
  }

  // PRO 구독 여부 판정 (Boolean)
  isSubscribed() {
    if (this.state.status !== "active") return false;
    if (!this.state.expiresAt) return true; // 무제한
    return new Date(this.state.expiresAt).getTime() > Date.now();
  }

  // 현재 티어 조회
  getTier() {
    return this.isSubscribed() ? this.state.tier : "free";
  }

  // 잔여 일수 계산
  getRemainingDays() {
    if (!this.isSubscribed() || !this.state.expiresAt) return 0;
    const diff = new Date(this.state.expiresAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  // 구독 활성화 (결제 완료 시 호출)
  activate(planId = "pro_monthly", customDays = null) {
    const plan = planId === "pro_annual" ? SUBSCRIPTION_PLANS.ANNUAL : SUBSCRIPTION_PLANS.MONTHLY;
    const days = customDays || plan.durationDays;
    const now = new Date();
    const expires = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    this.state = {
      status: "active",
      tier: plan.id,
      planId: plan.id,
      planName: plan.name,
      startedAt: now.toISOString(),
      expiresAt: expires.toISOString(),
      isCeoPass: false,
      autoRenew: true
    };

    this.saveState();
    return this.state;
  }

  // 대표님 전용 1초 즉시 테스트 패스 토글 (CEO Instant VIP Pass)
  toggleCeoPass() {
    if (this.isSubscribed()) {
      // 이미 구독 중이면 해제
      this.state = {
        status: "inactive",
        tier: "free",
        planId: null,
        startedAt: null,
        expiresAt: null,
        isCeoPass: false,
        autoRenew: false
      };
    } else {
      // PRO 활성화 (1년 VIP 패스)
      const now = new Date();
      const expires = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
      this.state = {
        status: "active",
        tier: "pro_ceo_vip",
        planId: "pro_ceo_vip",
        planName: "이건우 대표님 VIP 마스터 패스",
        startedAt: now.toISOString(),
        expiresAt: expires.toISOString(),
        isCeoPass: true,
        autoRenew: true
      };
    }
    this.saveState();
    return this.state;
  }

  // 구독 해지
  cancel() {
    this.state = {
      status: "inactive",
      tier: "free",
      planId: null,
      startedAt: null,
      expiresAt: null,
      isCeoPass: false,
      autoRenew: false
    };
    this.saveState();
  }

  // 상태 변경 리스너 등록
  onChange(callback) {
    if (typeof callback === "function") {
      this.listeners.push(callback);
    }
  }

  notifyListeners() {
    const isPro = this.isSubscribed();
    for (const listener of this.listeners) {
      try {
        listener(this.state, isPro);
      } catch (err) {
        console.error("[SubscriptionManager] 리스너 호출 실패:", err);
      }
    }
  }
}
