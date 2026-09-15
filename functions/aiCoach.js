// VIP 전용 서버 AI 코치 (사용자가 키를 준비하지 않아도 되는 경로)
//
// PRO는 사용자 본인의 구글 AI 키(BYOK)를 씁니다. VIP는 서버가 키를 대신 쓰므로
// 설정이 필요 없습니다. 다만 비용이 실제로 발생하므로 반드시 두 가지를 지킵니다.
//   1) 구독 여부를 서버에서 직접 확인한다 (클라이언트 주장 불신)
//   2) 사용량 상한을 서버에서 강제한다 (역마진 방지)
//
// 단가 근거 (2026-09 기준, Gemini Flash $0.75/$3.75 per 1M tokens)
//   1회 호출 ≈ 입력 200토큰 + 출력 250토큰 ≈ $0.00109
//   VIP 월 매출 ₩24,900 → 결제 수수료 차감 후 약 $17.80
//   손익분기 16,366회/월(약 545회/일)
//   일 100회 상한 시 월 $3.26 → 마진 82% (2027년 단가 인상 후에도 63%)
// 일반적인 헤비 유저도 하루 20~50회 수준이라 상한이 체감되지 않습니다.

const DAILY_CALL_LIMIT = 100;
const MONTHLY_CALL_LIMIT = 1500;   // 일 상한을 매일 채워도 넘지 않는 안전장치

const MAX_PROMPT_CHARS = 1000;     // 입력 토큰 폭증 방지
const MAX_OUTPUT_TOKENS = 250;     // 클라이언트 BYOK 경로와 동일

// 오늘 날짜 키 (한국 시간 기준). UTC로 잡으면 하루 경계가 9시간 밀립니다.
function todayKeyKst(now = new Date()) {
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
}

function monthKeyKst(now = new Date()) {
  return todayKeyKst(now).slice(0, 7);
}

// 구독 문서가 지금 이 순간 유효한 VIP인지 판정합니다.
function isActiveVip(sub, now = new Date()) {
  if (!sub) return false;
  if (sub.status !== "active") return false;
  if (sub.tier !== "vip_monthly" && !sub.isCeoPass) return false;
  if (sub.expiresAt && new Date(sub.expiresAt).getTime() < now.getTime()) return false;
  return true;
}

// 사용량을 확인하고 한도 내이면 1회 차감한 결과를 돌려줍니다.
// 실제 차감은 호출자가 트랜잭션 안에서 수행합니다.
function evaluateUsage(usage, now = new Date()) {
  const day = todayKeyKst(now);
  const month = monthKeyKst(now);

  const daily = usage && usage.day === day ? (usage.dailyCount || 0) : 0;
  const monthly = usage && usage.month === month ? (usage.monthlyCount || 0) : 0;

  if (daily >= DAILY_CALL_LIMIT) {
    return { allowed: false, reason: "daily", daily, monthly, day, month };
  }
  if (monthly >= MONTHLY_CALL_LIMIT) {
    return { allowed: false, reason: "monthly", daily, monthly, day, month };
  }
  return {
    allowed: true,
    daily,
    monthly,
    day,
    month,
    next: { day, month, dailyCount: daily + 1, monthlyCount: monthly + 1 }
  };
}

// Gemini 호출. 모델명은 배포 시점에 사용 가능한 값으로 설정해야 합니다.
async function callGemini({ apiKey, model, systemPrompt, userText }) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        role: "user",
        parts: [{
          text: `${systemPrompt}\n\n[유저 질문/고백]: ${userText}\n\n답변은 친절하고 전문적이며 2~3문장으로 간결하게, 유저의 마음을 편안하게 해주는 심리적 안도감과 실행 가능한 운동/식단 조언을 담아줘.`
        }]
      }],
      generationConfig: { maxOutputTokens: MAX_OUTPUT_TOKENS }
    })
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(`Gemini ${res.status}: ${JSON.stringify(json).slice(0, 300)}`);
  }

  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini 응답에 텍스트가 없습니다");
  return text.trim();
}

module.exports = {
  DAILY_CALL_LIMIT,
  MONTHLY_CALL_LIMIT,
  MAX_PROMPT_CHARS,
  todayKeyKst,
  monthKeyKst,
  isActiveVip,
  evaluateUsage,
  callGemini
};
