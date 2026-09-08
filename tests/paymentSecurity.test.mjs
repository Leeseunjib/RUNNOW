// 결제·구독 보안 불변식 검증
// 서버 가격 정본이 클라이언트와 어긋나거나, 클라이언트가 구독을 쓸 수 있게 되면 실패합니다.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { SUBSCRIPTION_PLANS, SubscriptionManager } from "../subscriptionManager.js";

const require = createRequire(import.meta.url);
const { PLANS, getPlan } = require("../functions/plans.js");

let failed = 0;
function check(label, actual, expected) {
  const ok = actual === expected;
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"} | ${label} | got=${actual} want=${expected}`);
}

// --- 1. 서버 가격 정본이 클라이언트 표시 가격과 일치한다 -----------------
// 어긋나면 사용자가 본 금액과 실제 청구 금액이 달라집니다.
{
  const clientPlans = Object.values(SUBSCRIPTION_PLANS);
  check("서버 상품 수 = 클라이언트 상품 수", Object.keys(PLANS).length, clientPlans.length);

  for (const cp of clientPlans) {
    const sp = getPlan(cp.id);
    check(`서버에 ${cp.id} 존재`, sp !== null, true);
    if (!sp) continue;
    check(`${cp.id} 가격 일치`, sp.priceUSD, cp.priceUSD.toFixed(2));
    check(`${cp.id} 기간 일치`, sp.durationDays, cp.durationDays);
  }
}

// --- 2. 알 수 없는 상품은 서버가 거부한다 --------------------------------
{
  check("존재하지 않는 planId 거부", getPlan("pro_free_hack"), null);
  check("프로토타입 오염 방어 (__proto__)", getPlan("__proto__"), null);
  check("프로토타입 오염 방어 (constructor)", getPlan("constructor"), null);
}

// --- 3. Firestore 규칙: 클라이언트는 구독을 쓸 수 없어야 한다 ------------
{
  const rules = readFileSync(new URL("../firestore.rules", import.meta.url), "utf8");
  const subBlock = rules.split("match /subscriptions/{userId}")[1] || "";
  const orderBlock = rules.split("match /payment_orders/{orderId}")[1] || "";

  check("subscriptions 규칙 존재", subBlock.length > 0, true);
  check("subscriptions 쓰기 차단", /allow write:\s*if false/.test(subBlock.split("}")[0]), true);
  check("subscriptions 본인 읽기 허용", /allow read:\s*if isOwner\(userId\)/.test(subBlock.split("}")[0]), true);
  check("payment_orders 전면 차단", /allow read, write:\s*if false/.test(orderBlock.split("}")[0]), true);
}

// --- 4. 서버 상태가 로컬 캐시를 항상 이긴다 ------------------------------
{
  // 브라우저 콘솔로 PRO를 위조해 둔 상황을 재현합니다.
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k)
  };
  store.set(
    "runnow_subscription_state_v1",
    JSON.stringify({ status: "active", tier: "pro_ceo_vip", expiresAt: "2099-01-01T00:00:00.000Z" })
  );

  const sm = new SubscriptionManager();
  check("위조된 로컬 값은 일단 PRO로 읽힘", sm.isSubscribed(), true);
  check("서버 검증 표식 없음", sm.isServerVerified(), false);

  // 서버가 "구독 없음"이라고 응답하면 즉시 무효화되어야 합니다.
  sm.applyServerState({ status: "inactive", tier: "free" });
  check("서버 응답으로 위조 무효화", sm.isSubscribed(), false);
  check("서버 검증 표식 설정됨", sm.isServerVerified(), true);

  // 서버가 정상 구독을 내려주면 반영되어야 합니다.
  const expires = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
  sm.applyServerState({ status: "active", tier: "pro_monthly", planId: "pro_monthly", expiresAt: expires });
  check("서버 발급 구독 반영", sm.isSubscribed(), true);
  check("티어 반영", sm.getTier(), "pro_monthly");
}

console.log(failed === 0 ? "\n✅ ALL PASS" : `\n❌ ${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
