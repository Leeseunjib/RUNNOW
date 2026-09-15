// 유료 기능이 무료로 열려 있지 않은지 검증
// 요금제 상품 설명과 실제 게이팅 목록이 어긋나면 매출이 새거나 산 기능을 못 씁니다.
import { readFileSync } from "node:fs";
import { SUBSCRIPTION_PLANS } from "../subscriptionManager.js";

let failed = 0;
function check(label, actual, expected) {
  const ok = actual === expected;
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"} | ${label} | got=${actual} want=${expected}`);
}

const appSrc = readFileSync(new URL("../app.js", import.meta.url), "utf8");
const htmlSrc = readFileSync(new URL("../index.html", import.meta.url), "utf8");

// app.js에서 게이팅 목록을 추출합니다(DOM 없이 import할 수 없어 소스를 읽습니다).
function extractGatedTabs() {
  const m = appSrc.match(/export const PRO_ONLY_TABS = \[([\s\S]*?)\]/);
  if (!m) return null;
  return [...m[1].matchAll(/"(tab-[a-z0-9]+)"/g)].map((x) => x[1]);
}

// --- 1. 게이팅 목록이 존재하고 실제로 쓰인다 -------------------------------
{
  const tabs = extractGatedTabs();
  check("PRO_ONLY_TABS 정의 존재", Array.isArray(tabs), true);
  check("게이팅 분기에서 실제 사용됨", appSrc.includes("PRO_ONLY_TABS.includes(targetTabId)"), true);
  check("구독 여부를 함께 확인", /PRO_ONLY_TABS\.includes\(targetTabId\)[\s\S]{0,120}isSubscribed\(\)/.test(appSrc), true);
}

// --- 2. 유료 상품 설명에 나온 기능이 잠겨 있다 -----------------------------
// 케어팀과 식단은 두 요금제 설명에 명시된 핵심 가치입니다.
// 여기서 빠지면 무료 사용자가 그대로 사용할 수 있습니다.
{
  const tabs = extractGatedTabs() || [];
  check("AI 케어팀 잠김", tabs.includes("tab-careteam"), true);
  check("식단 가이드 잠김", tabs.includes("tab-diet"), true);
  check("다마고치 잠김", tabs.includes("tab-tamagotchi"), true);
}

// --- 3. 무료로 열려 있어야 하는 화면은 잠그지 않는다 -----------------------
// 기본 러닝은 무료라는 것이 BM의 전제입니다. 프로필도 잠그면 가입 자체가 막힙니다.
{
  const tabs = extractGatedTabs() || [];
  check("기본 러닝은 무료", tabs.includes("tab-run"), false);
  check("프로필은 무료", tabs.includes("tab-profile"), false);
}

// --- 4. 하단 네비게이션의 유료 탭이 전부 게이팅되어 있다 -------------------
// 새 탭을 추가하고 목록에 넣는 것을 잊으면 이 검사가 잡아냅니다.
{
  const navTabs = [...htmlSrc.matchAll(/data-tab="(tab-[a-z0-9]+)"/g)].map((m) => m[1]);
  const unique = [...new Set(navTabs)];
  const free = ["tab-run", "tab-profile"];
  const gated = extractGatedTabs() || [];

  const missing = unique.filter((t) => !free.includes(t) && !gated.includes(t));
  check(
    `게이팅 누락 탭 (${missing.join(", ") || "없음"})`,
    missing.length,
    0
  );
}

// --- 5. 요금제 정의가 비어 있지 않다 ---------------------------------------
{
  const plans = Object.values(SUBSCRIPTION_PLANS);
  check("요금제가 정의되어 있음", plans.length > 0, true);
  check("모든 요금제에 가격이 있음", plans.every((p) => p.priceUSD > 0), true);
  check("모든 요금제에 기간이 있음", plans.every((p) => p.durationDays > 0), true);
}

console.log(failed === 0 ? "\n✅ ALL PASS" : `\n❌ ${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
