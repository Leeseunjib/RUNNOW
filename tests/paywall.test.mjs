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

// --- 6. 상품 설명이 실제 기능과 어긋나지 않는다 ---------------------------
// AI 코치는 사용자 본인의 구글 키 연동(BYOK)이 필요합니다. 서버가 키를 제공하는
// 경로가 없는 동안 "설정 없이 즉시"라고 파는 것은 사실과 다릅니다.
{
  const careSrc = readFileSync(new URL("../careTeam.js", import.meta.url), "utf8");
  const fnSrc = readFileSync(new URL("../functions/index.js", import.meta.url), "utf8");

  // 서버가 키를 대신 쓰는 경로가 실제로 존재하는가.
  // 클라이언트 호출과 서버 함수가 둘 다 있어야 성립합니다.
  const hasServerKeyPath = careSrc.includes("chatWithCoach")
    && fnSrc.includes("exports.chatWithCoach");

  check("VIP 서버 AI 경로 존재", hasServerKeyPath, true);
  check("PRO용 BYOK 경로도 유지", careSrc.includes("RUNNOW_USER_GEMINI_KEY"), true);

  // 서버 경로가 없다면 "설정 없이"라고 팔 수 없습니다.
  if (!hasServerKeyPath) {
    const planText = Object.values(SUBSCRIPTION_PLANS)
      .map((p) => `${p.name} ${p.badge || ""} ${p.desc || ""} ${p.discountTag || ""}`)
      .join(" ");
    const noSetupClaim = /설정\s*(없이|0%|불필요)|즉시\s*무제한/.test(planText);
    check("요금제 설명에 '설정 없이' 주장 없음", noSetupClaim, false);

    const uiNoSetup = /설정\s*0%|설정\s*없이/.test(htmlSrc);
    check("판매 화면에 '설정 없이' 주장 없음", uiNoSetup, false);
  } else {
    // 서버 경로가 있으면 "설정 불필요"는 정당합니다. 대신 사용량 상한을
    // 숨기고 "무제한"이라고 팔면 한도에 걸린 사용자가 속았다고 느낍니다.
    const require2 = (await import("node:module")).createRequire(import.meta.url);
    const ai = require2("../functions/aiCoach.js");

    const vip = SUBSCRIPTION_PLANS.VIP_CARE;
    check("VIP 설명에 상한 명시", vip.desc.includes(String(ai.DAILY_CALL_LIMIT)), true);
    check("VIP 설명에 '무제한' 표현 없음", /무제한/.test(vip.desc), false);
    check("판매 화면에 상한 안내", htmlSrc.includes(`하루 ${ai.DAILY_CALL_LIMIT}회`), true);
  }
}

// --- 7. 종전가격(정가) 표시가 없다 ----------------------------------------
// 실제로 그 가격에 판매한 이력이 없는 금액을 취소선으로 붙이면 표시광고법상
// 허위 종전가격 표시가 됩니다. 판매 이력이 생기기 전까지는 표기하지 않습니다.
{
  const strikePrice = /text-decoration:\s*line-through[^>]*>\s*₩[\d,]+/.test(htmlSrc);
  check("판매 화면에 취소선 가격 없음", strikePrice, false);

  const plans2 = Object.values(SUBSCRIPTION_PLANS);
  const refPrice = plans2.some((p) => /정가|원가|할인\s*전/.test(`${p.periodName || ""} ${p.badge || ""} ${p.desc || ""} ${p.discountTag || ""}`));
  check("요금제 정의에 '정가' 표기 없음", refPrice, false);
}

console.log(failed === 0 ? "\n✅ ALL PASS" : `\n❌ ${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
