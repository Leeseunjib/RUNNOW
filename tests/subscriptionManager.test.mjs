// subscriptionManager 검증 테스트
import { SubscriptionManager, SUBSCRIPTION_PLANS } from "../subscriptionManager.js";

// Mock localStorage for Node.js
const mockStorage = {};
globalThis.localStorage = {
  getItem: (key) => mockStorage[key] || null,
  setItem: (key, val) => { mockStorage[key] = String(val); },
  removeItem: (key) => { delete mockStorage[key]; },
  clear: () => { for (const k in mockStorage) delete mockStorage[k]; }
};

let failed = 0;
function check(label, actual, expected) {
  const ok = actual === expected;
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"} | ${label} | got=${actual} want=${expected}`);
}

console.log("=== RUNNOW SubscriptionManager Unit Test ===");

// 1. 초기 상태: 미구독 (Free)
const sm = new SubscriptionManager({ storageKey: "test_sub_key" });
check("초기 상태 미구독", sm.isSubscribed(), false);
check("초기 티어는 free", sm.getTier(), "free");
check("초기 잔여 일수는 0", sm.getRemainingDays(), 0);

// 2. 월간 플랜 활성화
sm.activate("pro_monthly");
check("월간 활성화 후 isSubscribed", sm.isSubscribed(), true);
check("월간 티어 확인", sm.getTier(), "pro_monthly");
check("30일 잔여일 계산", sm.getRemainingDays() >= 29, true);

// 3. 연간 플랜 전환
sm.activate("pro_annual");
check("연간 활성화 후 isSubscribed", sm.isSubscribed(), true);
check("연간 티어 확인", sm.getTier(), "pro_annual");
check("365일 잔여일 계산", sm.getRemainingDays() >= 364, true);

// 4. 구독 해지
sm.cancel();
check("해지 후 isSubscribed", sm.isSubscribed(), false);
check("해지 후 티어는 free", sm.getTier(), "free");

// 5. 대표님 VIP 패스 토글
sm.toggleCeoPass();
check("대표님 VIP 패스 활성화 후 isSubscribed", sm.isSubscribed(), true);
check("대표님 VIP 티어 확인", sm.getTier(), "pro_ceo_vip");

// 다시 토글 시 해제
sm.toggleCeoPass();
check("대표님 VIP 패스 재토글 후 isSubscribed", sm.isSubscribed(), false);

// 6. 만료된 구독 상태 처리
const expiredState = {
  status: "active",
  tier: "pro_monthly",
  expiresAt: new Date(Date.now() - 1000 * 60 * 60).toISOString() // 1시간 전 만료
};
localStorage.setItem("test_sub_key_expired", JSON.stringify(expiredState));
const smExpired = new SubscriptionManager({ storageKey: "test_sub_key_expired" });
check("만료된 구독 판정", smExpired.isSubscribed(), false);
check("만료 시 티어는 free", smExpired.getTier(), "free");

if (failed === 0) {
  console.log("\n>>> ALL SUBSCRIPTION TESTS PASSED (100%) <<<");
  process.exit(0);
} else {
  console.error(`\n>>> ${failed} TEST(S) FAILED <<<`);
  process.exit(1);
}
