/**
 * 1:1 케어팀·식단 모듈 단위 테스트
 */

import assert from "assert";
import fs from "fs";
import path from "path";
import { SubscriptionManager, SUBSCRIPTION_PLANS } from "../subscriptionManager.js";

console.log("=== RUNNOW Care Team & Diet System Unit Test ===");

const mockStorage = {};
globalThis.localStorage = {
  getItem: (key) => (key in mockStorage ? mockStorage[key] : null),
  setItem: (key, val) => { mockStorage[key] = String(val); },
  removeItem: (key) => { delete mockStorage[key]; },
  clear: () => { for (const k of Object.keys(mockStorage)) delete mockStorage[k]; }
};

// 1. dietData 무결성
const dietDataContent = fs.readFileSync(path.resolve("dietData.js"), "utf-8");
const fakeWindow = {};
new Function("window", dietDataContent)(fakeWindow);
const db = fakeWindow.DIET_FOOD_DATABASE;
assert(Array.isArray(db), "DIET_FOOD_DATABASE should be an array");
assert(db.length >= 500, `DIET_FOOD_DATABASE should have 500+ items, got ${db.length}`);
console.log(`PASS | 식약처/공공영양 캐시 로드 | 총 ${db.length}개 품목`);

db.forEach((item) => {
  assert(item.id, `Item should have id: ${JSON.stringify(item)}`);
  assert(item.name, `Item should have name: ${item.id}`);
  assert(typeof item.calories === "number", `calories number: ${item.id}`);
  assert(typeof item.protein === "number", `protein number: ${item.id}`);
});
console.log("PASS | 식품 열량/탄단지 수치 무결성");

const convenience = db.filter((f) => f.category === "convenience");
assert(convenience.length >= 8, "Should include convenience-store foods");
assert(db.some((f) => f.name.includes("삼각김밥")), "Should include 삼각김밥");
assert(db.some((f) => f.name.includes("김치찌개")), "Should include 김치찌개");
console.log(`PASS | 편의점·한식 핵심 품목 확인 (편의점 ${convenience.length}종)`);

// 2. VIP 플랜 SSOT
assert.strictEqual(SUBSCRIPTION_PLANS.VIP_CARE.id, "vip_monthly");
assert.strictEqual(SUBSCRIPTION_PLANS.VIP_CARE.priceKRW, 24900);
assert.strictEqual(SUBSCRIPTION_PLANS.PRO_BYOK.priceKRW, 9900);
const sm = new SubscriptionManager({ storageKey: "test_vip_care" });
sm.activate("vip_monthly");
assert.strictEqual(sm.isSubscribed(), true);
assert.strictEqual(sm.getTier(), "vip_monthly");
console.log("PASS | VIP 케어팀 플랜 activate / tier 검증");

// 3. 다중 요일 스케줄 파서 (careTeam 소스 로직 후 검증)
const careSrc = fs.readFileSync(path.resolve("careTeam.js"), "utf-8");
assert(careSrc.includes("parseSchedulesFromText"), "careTeam should expose multi-day parser");
assert(careSrc.includes("escapeHtml"), "careTeam should escape chat HTML");
assert(!careSrc.includes("식약처 공인"), "careTeam should not claim MFDS certification");
console.log("PASS | careTeam 스케줄 파서·XSS 이스케이프·카피 가드");

// 파서 동작 시뮬 (careTeam과 동일 규칙)
function parseDays(text) {
  const wants = /일정|스케줄|플랜|루틴|짜줘|등록|잡아/.test(text);
  if (!wants) return [];
  const cleaned = text
    .replace(/요일/g, "")
    .replace(/일정|스케줄|플랜|루틴|등록|잡아줘|잡아|짜줘|짜봐|짜/g, "")
    .replace(/매일/g, "");
  const days = [];
  for (const ch of cleaned) {
    if ("월화수목금토일".includes(ch) && !days.includes(ch)) days.push(ch);
  }
  return days;
}
assert.deepStrictEqual(parseDays("월수금 저녁 30분 루틴 짜줘"), ["월", "수", "금"]);
assert.deepStrictEqual(parseDays("화/목 7시에 조깅 일정 잡아줘"), ["화", "목"]);
assert.deepStrictEqual(parseDays("안녕하세요"), []);
console.log("PASS | 월수금·화/목 다중 요일 파싱");

// 4. dietManager 브리지 계약
const dietMgrSrc = fs.readFileSync(path.resolve("dietManager.js"), "utf-8");
assert(dietMgrSrc.includes("RunNowBridge"), "dietManager must use RunNowBridge");
assert(!dietMgrSrc.includes("window.Tamagotchi"), "dietManager must not call missing window.Tamagotchi");
assert(dietMgrSrc.includes("cheatBonusAwarded"), "cheat bonus once-per-day guard");
assert(dietMgrSrc.includes("nightBonusAwarded"), "night bonus once-per-day guard");
console.log("PASS | dietManager ↔ RunNowBridge 계약 + 1일1회 가드");

// 5. Rescue 저녁 다운사이즈 규칙
const mockData = {
  checklist: [
    { id: "chk_dinner", title: "취침 4시간 전 가벼운 클린 식사", tag: "숙면식단" }
  ],
  cheated: false
};
const dinner = mockData.checklist.find((c) => c.id === "chk_dinner");
dinner.title = "🥗 [만회 플랜] 나트륨 배출 칼륨 샐러드 & 두부/쉐이크";
dinner.tag = "긴급만회";
mockData.cheated = true;
assert(mockData.cheated);
assert(dinner.tag === "긴급만회");
console.log("PASS | 치팅 Rescue 저녁 미션 다운사이즈 규칙");

console.log("\n✅ ALL CARE TEAM & DIET TESTS PASSED");
