// 21일 챌린지 잠금 해제·스트릭 계산 검증
// 스트릭은 주간 퀘스트 보상(wq_02)과 화면 표시에 직접 쓰이므로 정확해야 합니다.
import { ChallengeManager, CHALLENGE_DAYS, localDateStr, daysBetween, formatRunTime } from "../challenge.js";

let failed = 0;
function check(label, actual, expected) {
  const ok = actual === expected;
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"} | ${label} | got=${actual} want=${expected}`);
}

// 오늘 기준으로 n일 전 날짜 문자열
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return localDateStr(d);
}

function makeWorkout(km, id = "w1") {
  return { id, distanceKm: km, elapsedSeconds: 1800, calories: 200 };
}

// --- 1. 날짜 헬퍼 ---------------------------------------------------------
{
  // localDateStr은 로컬 시간 기준이어야 합니다.
  // toISOString().slice(0,10)을 쓰면 한국(UTC+9)에서 자정~오전 9시 사이에
  // 전날 날짜가 나와 "하루"의 경계가 밀립니다.
  const d = new Date(2026, 8, 7, 1, 30); // 2026-09-07 01:30 로컬
  check("localDateStr은 로컬 날짜", localDateStr(d), "2026-09-07");

  check("같은 날 차이 0", daysBetween("2026-09-07", "2026-09-07"), 0);
  check("하루 차이", daysBetween("2026-09-07", "2026-09-08"), 1);
  check("월 경계 넘김", daysBetween("2026-08-31", "2026-09-01"), 1);
  check("역방향은 음수", daysBetween("2026-09-08", "2026-09-07"), -1);
}

{
  check("시간 포맷 (분:초)", formatRunTime(125), "02:05");
  check("시간 포맷 (시:분:초)", formatRunTime(3725), "1:02:05");
  check("0초", formatRunTime(0), "00:00");
}

// --- 2. 미션 데이터 무결성 ------------------------------------------------
{
  check("21일 미션 수", CHALLENGE_DAYS.length, 21);
  const days = CHALLENGE_DAYS.map((d) => d.day);
  check("day 번호 1~21 연속", days.join(","), Array.from({ length: 21 }, (_, i) => i + 1).join(","));
  check("모든 미션에 목표 거리 존재", CHALLENGE_DAYS.every((d) => d.targetKm > 0), true);
}

// --- 3. 하루에 여러 미션을 몰아서 깰 수 없다 ------------------------------
{
  const cm = new ChallengeManager({});
  const r1 = cm.tryCompleteFromWorkout(1, makeWorkout(10, "a"));
  check("1일차 완료", r1.ok, true);

  const r2 = cm.tryCompleteFromWorkout(2, makeWorkout(10, "b"));
  check("같은 날 2일차 시도 차단", r2.ok, false);
  check("차단 사유는 '내일'", r2.reason, "tomorrow");
}

// --- 4. 미달성 운동은 인정되지 않는다 -------------------------------------
{
  const cm = new ChallengeManager({});
  const target = CHALLENGE_DAYS[0].targetKm;
  check("목표 미달 거리 거부", cm.tryCompleteFromWorkout(1, makeWorkout(target - 0.1)).ok, false);
  check("시간 0인 기록 거부", cm.tryCompleteFromWorkout(1, { id: "x", distanceKm: 99, elapsedSeconds: 0 }).ok, false);
  check("운동 기록 없음 거부", cm.tryCompleteFromWorkout(1, null).ok, false);
  check("실패해도 완료일 추가 안 됨", cm.completedDays.length, 0);
}

// --- 5. 같은 운동 기록을 재사용할 수 없다 ---------------------------------
{
  const cm = new ChallengeManager({ startDate: daysAgo(5) });
  const used = makeWorkout(10, "same-run");
  cm.tryCompleteFromWorkout(1, used);
  const found = cm.findQualifyingWorkout([used], 2);
  check("이미 쓴 운동은 다음 미션에 재사용 불가", found, null);
}

// --- 6. 스트릭 계산 -------------------------------------------------------
{
  // 연속 완료 → 증가
  const cm = new ChallengeManager({ startDate: daysAgo(3) });
  cm.completedDays = [1, 2];
  cm.streak = 2;
  cm.lastCompletedDate = daysAgo(1); // 어제 완료
  const r = cm.tryCompleteFromWorkout(3, makeWorkout(10, "c"));
  check("연속 완료 시 스트릭 증가", r.ok && cm.streak === 3, true);
}

{
  // 이틀 이상 비면 → 1로 리셋
  const cm = new ChallengeManager({ startDate: daysAgo(10) });
  cm.completedDays = [1, 2, 3];
  cm.streak = 3;
  cm.lastCompletedDate = daysAgo(4); // 나흘 전
  cm.tryCompleteFromWorkout(4, makeWorkout(10, "d"));
  check("공백 후 완료 시 스트릭 1로 리셋", cm.streak, 1);
}

// --- 7. 끊긴 스트릭이 그대로 남아 보상을 주면 안 된다 ---------------------
// streak은 완료 시점에만 갱신되므로, 중단한 뒤에도 옛 값이 남습니다.
// 이 값이 화면 표시와 주간 퀘스트(wq_02: streak >= 3) 판정에 쓰입니다.
{
  const cm = new ChallengeManager({ startDate: daysAgo(30) });
  cm.completedDays = [1, 2, 3];
  cm.streak = 3;
  cm.lastCompletedDate = daysAgo(14); // 2주 전에 중단

  check("저장된 스트릭은 옛 값 유지", cm.streak, 3);
  check("현재 스트릭은 끊어진 상태", cm.getCurrentStreak(), 0);
}

{
  const cm = new ChallengeManager({ startDate: daysAgo(5) });
  cm.completedDays = [1, 2];
  cm.streak = 2;
  cm.lastCompletedDate = daysAgo(1); // 어제 완료 → 아직 살아 있음
  check("어제 완료면 스트릭 유지", cm.getCurrentStreak(), 2);

  cm.lastCompletedDate = localDateStr(); // 오늘 완료
  check("오늘 완료면 스트릭 유지", cm.getCurrentStreak(), 2);

  cm.lastCompletedDate = daysAgo(2); // 이틀 전 → 끊김
  check("이틀 전이면 스트릭 끊김", cm.getCurrentStreak(), 0);
}

{
  const cm = new ChallengeManager({});
  check("한 번도 완료 안 했으면 스트릭 0", cm.getCurrentStreak(), 0);
}

// --- 8. 진행률과 직렬화 ---------------------------------------------------
{
  const cm = new ChallengeManager({ startDate: daysAgo(30) });
  cm.completedDays = [1, 2, 3, 4, 5, 6, 7];
  check("7/21 진행률", cm.getProgressPercentage(), 33);

  cm.completedDays = Array.from({ length: 21 }, (_, i) => i + 1);
  check("완주 시 100%", cm.getProgressPercentage(), 100);
  check("완주 후 활성 일차는 21", cm.getActiveDay(), 21);

  const restored = new ChallengeManager(cm.toJSON());
  check("직렬화 후 완료일 보존", restored.completedDays.length, 21);
  check("직렬화 후 스트릭 보존", restored.streak, cm.streak);
}

// --- 9. 리셋 --------------------------------------------------------------
{
  const cm = new ChallengeManager({ startDate: daysAgo(10) });
  cm.completedDays = [1, 2, 3];
  cm.streak = 3;
  cm.reset();
  check("리셋 후 완료일 비움", cm.completedDays.length, 0);
  check("리셋 후 스트릭 0", cm.streak, 0);
  check("리셋 후 1일차부터", cm.getActiveDay(), 1);
  check("리셋 후 현재 스트릭 0", cm.getCurrentStreak(), 0);
}

console.log(failed === 0 ? "\n✅ ALL PASS" : `\n❌ ${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
