// 다마고치 성장·보상 로직 검증
// "달린 만큼 진화한다"는 전제가 지켜지는지, 무상 XP 획득 경로가 없는지 확인합니다.
import { TamagotchiEngine, DOG_STAGES, CAT_STAGES } from "../tamagotchi.js";

let failed = 0;
function check(label, actual, expected) {
  const ok = actual === expected;
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"} | ${label} | got=${actual} want=${expected}`);
}
function checkNear(label, actual, expected, tol) {
  const ok = Number.isFinite(actual) && Math.abs(actual - expected) <= tol;
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"} | ${label} | got=${actual} want=${expected}±${tol}`);
}

// --- 1. 진화 단계 경계 (0 / 5 / 20 / 50 / 100 km) --------------------------
{
  const boundaries = [0, 5, 20, 50, 100];
  for (const stages of [DOG_STAGES, CAT_STAGES]) {
    const kind = stages === DOG_STAGES ? "강아지" : "고양이";
    check(`${kind} 단계 수`, stages.length, 5);
    stages.forEach((s, i) => check(`${kind} ${i + 1}단계 기준 거리`, s.minKm, boundaries[i]));
  }
}

{
  const pet = new TamagotchiEngine({});
  const cases = [
    [0, 1], [4.99, 1], [5, 2], [19.99, 2], [20, 3],
    [49.99, 3], [50, 4], [99.99, 4], [100, 5], [250, 5]
  ];
  for (const [km, stage] of cases) {
    pet.totalKm = km;
    check(`누적 ${km}km → ${stage}단계`, pet.getStage().stage, stage);
  }
}

// --- 2. 레벨업 곡선 --------------------------------------------------------
{
  const pet = new TamagotchiEngine({});
  check("초기 레벨", pet.level, 1);
  check("레벨1 요구 XP", pet.getXpToNextLevel(), 250);

  pet.addXp(249);
  check("249 XP → 레벨 유지", pet.level, 1);
  pet.addXp(1);
  check("250 XP → 레벨 2", pet.level, 2);
  check("레벨업 후 XP 잔여", pet.xp, 0);

  // 한 번에 큰 XP를 받으면 여러 레벨이 연속으로 올라야 합니다.
  const pet2 = new TamagotchiEngine({});
  pet2.addXp(250 + 500 + 750); // 레벨 1→2→3→4
  check("1500 XP 일괄 → 레벨 4", pet2.level, 4);
}

// --- 3. 러닝 보상: 거리가 성장을 만든다 ------------------------------------
{
  const pet = new TamagotchiEngine({});
  const res = pet.addKmAndWorkout(5, 1800, 360); // 5km, 30분, 페이스 6분
  check("5km → 500 XP", res.earnedXp, 500);
  checkNear("누적 거리 반영", pet.totalKm, 5, 0.001);
  check("5km 완주 후 2단계 진화", pet.getStage().stage, 2);
  check("지구력 특화로 분류", res.workoutType.includes("지구력"), true);
}

{
  // 빠른 페이스는 민첩 특화로 분류되어야 합니다.
  const pet = new TamagotchiEngine({});
  const res = pet.addKmAndWorkout(5, 1500, 300); // 페이스 5분
  check("빠른 페이스 → 스피드 특화", res.workoutType.includes("스피드"), true);
  check("민첩 성장이 가장 큼", res.statGrowth.agility > res.statGrowth.might, true);
}

{
  // 짧은 거리는 힐링 산책런
  const pet = new TamagotchiEngine({});
  const res = pet.addKmAndWorkout(1, 600, 600);
  check("1km 느린 페이스 → 힐링 산책런", res.workoutType.includes("힐링"), true);
}

// --- 4. 스탯 상한 100을 넘지 않는다 ---------------------------------------
{
  const pet = new TamagotchiEngine({ might: 95, agility: 95, spirit: 95 });
  pet.addKmAndWorkout(30, 10800, 400);
  check("근력 상한", pet.might <= 100, true);
  check("민첩 상한", pet.agility <= 100, true);
  check("정신력 상한", pet.spirit <= 100, true);
}

{
  // 상한에 걸렸는데 화면에는 "+50 성장"이라고 뜨면 사용자가 속았다고 느낍니다.
  const pet = new TamagotchiEngine({ might: 98, agility: 98, spirit: 98 });
  const before = { might: pet.might, agility: pet.agility, spirit: pet.spirit };
  const res = pet.addKmAndWorkout(10, 3600, 400);
  check("보고된 근력 증가 = 실제 증가", res.statGrowth.might, pet.might - before.might);
  check("보고된 민첩 증가 = 실제 증가", res.statGrowth.agility, pet.agility - before.agility);
  check("보고된 정신력 증가 = 실제 증가", res.statGrowth.spirit, pet.spirit - before.spirit);
}

// --- 5. 컨디션 판정 --------------------------------------------------------
{
  const pet = new TamagotchiEngine({ energy: 10 });
  pet.evaluateCondition();
  check("기력 20 미만 → 탈진", pet.statusCondition, "EXHAUSTED");

  const pet2 = new TamagotchiEngine({ happiness: 20 });
  pet2.evaluateCondition();
  check("행복도 30 미만 → 우울", pet2.statusCondition, "DEPRESSED");

  const pet3 = new TamagotchiEngine({ might: 90, agility: 90 });
  pet3.evaluateCondition();
  check("근력·민첩 80 초과 → 최상 컨디션", pet3.statusCondition, "BEST_CONDITION");
}

// --- 6. 돌보기 액션에 쿨다운이 있어야 한다 (XP 무한 획득 차단) -------------
// 이 앱의 전제는 "달린 만큼 진화"입니다. 버튼 연타로 레벨이 오르면 전제가 깨집니다.
{
  const pet = new TamagotchiEngine({});
  const first = pet.feed();
  check("첫 먹이주기 성공", first.success, true);
  const second = pet.feed();
  check("연속 먹이주기 차단", second.success, false);
}

{
  const pet = new TamagotchiEngine({});
  pet.rest();
  check("연속 휴식 차단", pet.rest().success, false);
}

{
  const pet = new TamagotchiEngine({});
  pet.play();
  check("연속 놀아주기 차단", pet.play().success, false);
}

{
  const pet = new TamagotchiEngine({});
  pet.rescueVolt();
  check("연속 힐링 케어 차단", pet.rescueVolt().success, false);
}

{
  // 핵심 회귀 방지: 먹이 → 휴식 → 놀기를 반복해도 XP가 무한히 오르면 안 됩니다.
  const pet = new TamagotchiEngine({});
  const startLevel = pet.level;
  for (let i = 0; i < 200; i++) {
    pet.feed();
    pet.rest();
    pet.play();
  }
  check("버튼 600회 연타 → 레벨 상승 없음", pet.level, startLevel);
  check("버튼 연타로 얻은 XP는 1회분 이하", pet.xp <= 45, true);
}

{
  // 쿨다운이 지나면 다시 사용할 수 있어야 합니다.
  const pet = new TamagotchiEngine({});
  pet.feed();
  pet.lastActionAt.feed -= 24 * 60 * 60 * 1000; // 하루 전으로 되돌림
  check("쿨다운 경과 후 재사용 가능", pet.feed().success, true);
}

// --- 7. 기력 부족 시 놀아주기 거절 -----------------------------------------
{
  const pet = new TamagotchiEngine({ energy: 5 });
  const res = pet.play();
  check("기력 부족 → 놀아주기 실패", res.success, false);
  check("기력 부족 실패 시 XP 미지급", pet.xp, 0);
}

// --- 8. 직렬화 왕복 --------------------------------------------------------
{
  const pet = new TamagotchiEngine({});
  pet.addKmAndWorkout(12.5, 4000, 320);
  const restored = new TamagotchiEngine(pet.toJSON());
  check("직렬화 후 레벨 보존", restored.level, pet.level);
  check("직렬화 후 XP 보존", restored.xp, pet.xp);
  check("직렬화 후 거리 보존", restored.totalKm, pet.totalKm);
  check("직렬화 후 단계 보존", restored.getStage().stage, pet.getStage().stage);
}

console.log(failed === 0 ? "\n✅ ALL PASS" : `\n❌ ${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
