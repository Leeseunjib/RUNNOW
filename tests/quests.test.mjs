// 퀘스트 달성 판정 검증
// 렌더와 보상 수령이 같은 기준을 쓰는지, 미달성 퀘스트에 보상이 나가지 않는지 확인합니다.
import {
  DAILY_QUESTS, WEEKLY_QUESTS, BOUNTY_QUESTS,
  isDailyQuestAchieved, isWeeklyQuestAchieved, countDailyDone
} from "../quests.js";

let failed = 0;
function check(label, actual, expected) {
  const ok = actual === expected;
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"} | ${label} | got=${actual} want=${expected}`);
}

// --- 1. 퀘스트 데이터 무결성 ----------------------------------------------
{
  const all = [...DAILY_QUESTS, ...WEEKLY_QUESTS, ...BOUNTY_QUESTS];
  const ids = all.map((q) => q.id);
  check("퀘스트 id 중복 없음", new Set(ids).size, ids.length);

  const badReward = all.filter((q) => !(q.xpReward >= 0) || !(q.coinReward >= 0));
  check("모든 퀘스트에 유효한 보상 존재", badReward.length, 0);

  const noTitle = all.filter((q) => !q.title || !q.desc);
  check("모든 퀘스트에 제목·설명 존재", noTitle.length, 0);
}

// --- 2. 일일 퀘스트 경계값 ------------------------------------------------
{
  check("dq_01 출석은 항상 달성", isDailyQuestAchieved("dq_01", {}), true);

  check("dq_02 0.99km → 미달성", isDailyQuestAchieved("dq_02", { todayKm: 0.99 }), false);
  check("dq_02 1.0km → 달성", isDailyQuestAchieved("dq_02", { todayKm: 1.0 }), true);

  check("dq_03 포만감 89 → 미달성", isDailyQuestAchieved("dq_03", { petHunger: 89 }), false);
  check("dq_03 포만감 90 → 달성", isDailyQuestAchieved("dq_03", { petHunger: 90 }), true);

  check("dq_04 행복도 89 → 미달성", isDailyQuestAchieved("dq_04", { petHappiness: 89 }), false);
  check("dq_04 행복도 90 → 달성", isDailyQuestAchieved("dq_04", { petHappiness: 90 }), true);

  check("dq_05 칼로리 99 → 미달성", isDailyQuestAchieved("dq_05", { todayCalories: 99 }), false);
  check("dq_05 칼로리 100 → 달성", isDailyQuestAchieved("dq_05", { todayCalories: 100 }), true);
}

// --- 3. 빈 통계로는 아무것도 달성되지 않는다 (출석 제외) -------------------
// stats가 비어 있을 때 undefined 비교로 true가 나오면 무상 보상이 됩니다.
{
  for (const q of DAILY_QUESTS) {
    if (q.id === "dq_01") continue;
    check(`빈 통계에서 ${q.id} 미달성`, isDailyQuestAchieved(q.id, {}), false);
  }
  for (const q of WEEKLY_QUESTS) {
    check(`빈 통계에서 ${q.id} 미달성`, isWeeklyQuestAchieved(q.id, {}), false);
  }
}

// --- 4. 올클리어 보너스(dq_06) -------------------------------------------
{
  const none = { todayKm: 0, todayCalories: 0, petHunger: 0, petHappiness: 0, claimedIds: [] };
  check("아무것도 안 했을 때 완료 수", countDailyDone(none), 1); // 출석만
  check("dq_06 미달성", isDailyQuestAchieved("dq_06", none), false);

  const all = { todayKm: 2, todayCalories: 200, petHunger: 95, petHappiness: 95, claimedIds: [] };
  check("5개 모두 달성 시 완료 수", countDailyDone(all), 5);
  check("dq_06 달성", isDailyQuestAchieved("dq_06", all), true);

  // 이미 수령한 퀘스트도 달성으로 세어야 합니다(수령했다고 올클리어가 깨지면 안 됨).
  const claimed = {
    todayKm: 0, todayCalories: 0, petHunger: 0, petHappiness: 0,
    claimedIds: ["dq_02", "dq_03", "dq_04", "dq_05"]
  };
  check("수령한 퀘스트도 완료로 집계", countDailyDone(claimed), 5);
  check("수령 후에도 dq_06 달성 유지", isDailyQuestAchieved("dq_06", claimed), true);
}

// --- 5. 주간 퀘스트 경계값 ------------------------------------------------
{
  check("wq_01 9.99km → 미달성", isWeeklyQuestAchieved("wq_01", { totalKm: 9.99 }), false);
  check("wq_01 10km → 달성", isWeeklyQuestAchieved("wq_01", { totalKm: 10 }), true);

  check("wq_02 스트릭 2 → 미달성", isWeeklyQuestAchieved("wq_02", { streak: 2 }), false);
  check("wq_02 스트릭 3 → 달성", isWeeklyQuestAchieved("wq_02", { streak: 3 }), true);

  check("wq_03 칼로리 599 → 미달성", isWeeklyQuestAchieved("wq_03", { weekCalories: 599 }), false);
  check("wq_03 칼로리 600 → 달성", isWeeklyQuestAchieved("wq_03", { weekCalories: 600 }), true);

  check("wq_04 챌린지 2회 → 미달성", isWeeklyQuestAchieved("wq_04", { challengeClears: 2 }), false);
  check("wq_04 챌린지 3회 → 달성", isWeeklyQuestAchieved("wq_04", { challengeClears: 3 }), true);

  check("wq_05 레벨 1 → 미달성", isWeeklyQuestAchieved("wq_05", { petLevel: 1 }), false);
  check("wq_05 레벨 2 → 달성", isWeeklyQuestAchieved("wq_05", { petLevel: 2 }), true);
}

// --- 6. 알 수 없는 퀘스트 id는 절대 달성되지 않는다 -----------------------
{
  check("존재하지 않는 일일 퀘스트", isDailyQuestAchieved("dq_hack", { todayKm: 999 }), false);
  check("존재하지 않는 주간 퀘스트", isWeeklyQuestAchieved("wq_hack", { totalKm: 999 }), false);
  check("프로토타입 오염 방어", isDailyQuestAchieved("__proto__", {}), false);
}

console.log(failed === 0 ? "\n✅ ALL PASS" : `\n❌ ${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
