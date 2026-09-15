// VIP 서버 AI 코치의 구독 판정과 사용량 상한 검증
// 이 로직이 틀리면 비구독자에게 비용이 나가거나, 헤비 유저에서 역마진이 납니다.
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const ai = require("../functions/aiCoach.js");

let failed = 0;
function check(label, actual, expected) {
  const ok = actual === expected;
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"} | ${label} | got=${actual} want=${expected}`);
}

const future = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
const past = new Date(Date.now() - 24 * 3600 * 1000).toISOString();

// --- 1. VIP 구독 판정 ------------------------------------------------------
{
  check("유효한 VIP", ai.isActiveVip({ status: "active", tier: "vip_monthly", expiresAt: future }), true);
  check("CEO 패스도 허용", ai.isActiveVip({ status: "active", tier: "pro_ceo_vip", isCeoPass: true, expiresAt: future }), true);

  // 비용이 나가는 기능이므로 애매한 경우는 전부 거부해야 합니다.
  check("구독 없음", ai.isActiveVip(null), false);
  check("PRO는 서버 AI 미포함", ai.isActiveVip({ status: "active", tier: "pro_monthly", expiresAt: future }), false);
  check("연간 PRO도 미포함", ai.isActiveVip({ status: "active", tier: "pro_annual", expiresAt: future }), false);
  check("만료된 VIP", ai.isActiveVip({ status: "active", tier: "vip_monthly", expiresAt: past }), false);
  check("해지된 VIP", ai.isActiveVip({ status: "revoked", tier: "vip_monthly", expiresAt: future }), false);
  check("비활성 상태", ai.isActiveVip({ status: "inactive", tier: "vip_monthly", expiresAt: future }), false);
}

// --- 2. 날짜 키는 한국 시간 기준 -------------------------------------------
// UTC로 잡으면 하루 경계가 9시간 밀려 한도가 오전 9시에 초기화됩니다.
{
  // 한국 2026-09-16 03:00 = UTC 2026-09-15 18:00
  const kstEarlyMorning = new Date(Date.UTC(2026, 8, 15, 18, 0));
  check("KST 새벽 3시는 그날 날짜", ai.todayKeyKst(kstEarlyMorning), "2026-09-16");
  check("월 키도 KST 기준", ai.monthKeyKst(kstEarlyMorning), "2026-09");

  // 한국 2026-09-15 23:00 = UTC 2026-09-15 14:00
  const kstLateNight = new Date(Date.UTC(2026, 8, 15, 14, 0));
  check("KST 밤 11시는 전날 유지", ai.todayKeyKst(kstLateNight), "2026-09-15");
}

// --- 3. 사용량 상한 --------------------------------------------------------
{
  const day = ai.todayKeyKst();
  const month = ai.monthKeyKst();

  // 처음 사용
  const first = ai.evaluateUsage(null);
  check("최초 호출 허용", first.allowed, true);
  check("최초 호출 후 카운트 1", first.next.dailyCount, 1);

  // 한도 직전
  const nearLimit = ai.evaluateUsage({ day, month, dailyCount: ai.DAILY_CALL_LIMIT - 1, monthlyCount: 10 });
  check("일 한도 직전은 허용", nearLimit.allowed, true);

  // 일 한도 도달
  const atDaily = ai.evaluateUsage({ day, month, dailyCount: ai.DAILY_CALL_LIMIT, monthlyCount: 10 });
  check("일 한도 도달 시 거부", atDaily.allowed, false);
  check("거부 사유는 daily", atDaily.reason, "daily");

  // 월 한도 도달
  const atMonthly = ai.evaluateUsage({ day, month, dailyCount: 0, monthlyCount: ai.MONTHLY_CALL_LIMIT });
  check("월 한도 도달 시 거부", atMonthly.allowed, false);
  check("거부 사유는 monthly", atMonthly.reason, "monthly");
}

// --- 4. 날짜가 바뀌면 일 한도가 초기화된다 ---------------------------------
{
  const month = ai.monthKeyKst();
  const yesterdayFull = ai.evaluateUsage({ day: "2000-01-01", month, dailyCount: ai.DAILY_CALL_LIMIT, monthlyCount: 10 });
  check("어제 한도를 채웠어도 오늘은 허용", yesterdayFull.allowed, true);
  check("새 날의 카운트는 1부터", yesterdayFull.next.dailyCount, 1);
  check("월 카운트는 이어짐", yesterdayFull.next.monthlyCount, 11);
}

{
  // 달이 바뀌면 월 한도도 초기화됩니다.
  const day = ai.todayKeyKst();
  const lastMonth = ai.evaluateUsage({ day, month: "2000-01", dailyCount: 0, monthlyCount: ai.MONTHLY_CALL_LIMIT });
  check("지난달 한도는 이번 달에 영향 없음", lastMonth.allowed, true);
  check("새 달의 월 카운트는 1부터", lastMonth.next.monthlyCount, 1);
}

// --- 5. 상한값이 손익분기 아래인지 ----------------------------------------
// 단가: 입력 200토큰 × $0.75/M + 출력 250토큰 × $3.75/M ≈ $0.00109
// VIP 매출: ₩24,900 → 결제 수수료 차감 후 약 $17.80
// 2027년 단가 2배 인상까지 감안해도 마진이 남아야 합니다.
{
  const perCall = (200 / 1e6) * 0.75 + (250 / 1e6) * 3.75;
  const perCall2027 = perCall * 2;
  const revenue = (24900 / 1350) * (1 - 0.035);

  const monthlyCost = perCall * ai.DAILY_CALL_LIMIT * 30;
  const monthlyCost2027 = perCall2027 * ai.DAILY_CALL_LIMIT * 30;

  check("현재 단가에서 흑자", monthlyCost < revenue, true);
  check("2027년 인상 후에도 흑자", monthlyCost2027 < revenue, true);
  check("현재 마진 50% 이상", (revenue - monthlyCost) / revenue > 0.5, true);

  // 월 상한이 일 상한 × 31일보다 작아야 백스톱으로 기능합니다.
  check("월 상한이 백스톱 역할", ai.MONTHLY_CALL_LIMIT < ai.DAILY_CALL_LIMIT * 31, true);
}

// --- 6. 입력 길이 제한 -----------------------------------------------------
// 긴 입력을 막지 않으면 토큰이 폭증해 단가 계산이 무너집니다.
{
  check("입력 길이 상한 존재", ai.MAX_PROMPT_CHARS > 0, true);
  check("상한이 과하지 않음", ai.MAX_PROMPT_CHARS <= 2000, true);
}

console.log(failed === 0 ? "\n✅ ALL PASS" : `\n❌ ${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
