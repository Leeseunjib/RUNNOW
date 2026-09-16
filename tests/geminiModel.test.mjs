// Gemini 모델명이 살아 있는지, 그리고 단가 가정이 실제 모델과 맞는지 검증
// 모델이 종료되면 404만 떨어지는데 폴백 때문에 조용히 묻힙니다. 실제로
// gemini-1.5-flash가 2025-09-29에 종료된 뒤에도 한참 남아 있었습니다.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ai = require("../functions/aiCoach.js");

let failed = 0;
function check(label, actual, expected) {
  const ok = actual === expected;
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"} | ${label} | got=${actual} want=${expected}`);
}

const careSrc = readFileSync(new URL("../careTeam.js", import.meta.url), "utf8");
const fnIndexSrc = readFileSync(new URL("../functions/index.js", import.meta.url), "utf8");
const aiCoachSrc = readFileSync(new URL("../functions/aiCoach.js", import.meta.url), "utf8");

// --- 1. 종료된 모델을 호출하지 않는다 --------------------------------------
// 구글이 셧다운한 모델은 엔드포인트 자체가 사라져 404를 돌려줍니다.
// 새 모델이 종료될 때마다 이 목록에 추가하면 다음 사고를 여기서 잡습니다.
{
  const retired = [
    "gemini-1.0",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-1.5-flash-8b",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-2.5-flash-image"
  ];

  // 모델명이 등장할 수 있는 실제 호출 경로만 검사합니다(테스트 파일 제외).
  const sources = { "careTeam.js": careSrc, "functions/index.js": fnIndexSrc, "functions/aiCoach.js": aiCoachSrc };

  const hits = [];
  for (const [name, src] of Object.entries(sources)) {
    // 주석에 과거 사고를 기록해 둘 수 있으므로 문자열/URL 안에 쓰인 것만 봅니다.
    const code = src.split("\n").filter((l) => !l.trim().startsWith("//")).join("\n");
    for (const model of retired) {
      if (code.includes(model)) hits.push(`${name}:${model}`);
    }
  }
  check(`종료된 모델 참조 (${hits.join(", ") || "없음"})`, hits.length, 0);
}

// --- 2. 기본 모델을 별칭으로 두지 않는다 -----------------------------------
// gemini-flash-latest 같은 별칭은 가리키는 모델이 예고 없이 바뀝니다.
// 모델마다 단가가 달라서 마진 계산이 조용히 무너집니다.
{
  check("서버 기본 모델이 별칭이 아님", /-latest$/.test(ai.DEFAULT_MODEL), false);
  check("서버 기본값이 aiCoach와 연결됨", fnIndexSrc.includes("default: aiCoach.DEFAULT_MODEL"), true);
}

// --- 3. 클라이언트는 구글 키를 직접 치지 않는다 ---------------------------
// 대화 기준은 온디바이스 엔진입니다. VIP 클라우드만 서버 모델을 씁니다.
{
  check("클라이언트 generateContent 없음", careSrc.includes("generativelanguage.googleapis.com"), false);
  check("클라이언트 구글 키 저장소 없음", careSrc.includes("RUNNOW_USER_GEMINI_KEY"), false);
  check("VIP는 서버 기본 모델을 씀", fnIndexSrc.includes("model: aiCoach.DEFAULT_MODEL") || fnIndexSrc.includes("default: aiCoach.DEFAULT_MODEL"), true);
}

// --- 4. 공시 단가로 다시 계산해도 VIP가 흑자다 -----------------------------
// 모델을 바꾸면서 단가를 안 고치면 여기서 걸립니다.
{
  const p = ai.MODEL_PRICE_USD_PER_1M;
  check("단가 정의 존재", typeof p?.input === "number" && typeof p?.output === "number", true);

  const perCall = (200 / 1e6) * p.input + (250 / 1e6) * p.output;
  const revenue = (24900 / 1350) * (1 - 0.035);       // VIP 월 매출에서 결제 수수료 차감
  const monthlyCost = perCall * ai.DAILY_CALL_LIMIT * 30;

  check("상한을 매일 채워도 흑자", monthlyCost < revenue, true);
  check("마진 50% 이상", (revenue - monthlyCost) / revenue > 0.5, true);

  // 별칭이 가리키던 gemini-3.5-flash($1.50/$9.00)였다면 마진이 57%까지 떨어집니다.
  // 그 값도 흑자이긴 하나, 가정과 실제가 어긋난 채 굴러가는 상태가 문제입니다.
  console.log(`  (참고) 1회 $${perCall.toFixed(5)} · 월 최대 $${monthlyCost.toFixed(2)} · 마진 ${(((revenue - monthlyCost) / revenue) * 100).toFixed(0)}%`);
}

// --- 5. 구글 키 연동 경로가 남아 있지 않다 --------------------------------
{
  check("BYOK 실패 안내 없음", careSrc.includes("function byokFailureNotice"), false);
  check("callGeminiApi 없음", careSrc.includes("callGeminiApi"), false);
  check("온디바이스가 대사집보다 앞", careSrc.indexOf("GemmaOnDevice") < careSrc.indexOf("generateResponse(text)"), true);
}

console.log(failed === 0 ? "\n✅ ALL PASS" : `\n❌ ${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
