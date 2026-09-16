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

// 레벨업으로 차감된 XP까지 합산한 누적 적립량 (요구 XP 곡선 = 레벨 × 250)
function totalEarnedXp(pet) {
  let sum = pet.xp;
  for (let lv = 1; lv < pet.level; lv++) sum += lv * 250;
  return sum;
}

// --- 1. 진화 단계 경계 (10단계 / 0·2·5·10·20·35·55·80·120·180 km) ----------
const STAGE_BOUNDARIES = [0, 2, 5, 10, 20, 35, 55, 80, 120, 180];

{
  for (const stages of [DOG_STAGES, CAT_STAGES]) {
    const kind = stages === DOG_STAGES ? "강아지" : "고양이";
    check(`${kind} 단계 수`, stages.length, STAGE_BOUNDARIES.length);
    stages.forEach((s, i) => check(`${kind} ${i + 1}단계 기준 거리`, s.minKm, STAGE_BOUNDARIES[i]));

    // 기준 거리가 단조 증가하지 않으면 더 달렸는데 단계가 내려가는 역진화가 발생합니다.
    const ascending = stages.every((s, i) => i === 0 || s.minKm > stages[i - 1].minKm);
    check(`${kind} 기준 거리 단조 증가`, ascending, true);

    // stage 번호와 배열 순서가 어긋나면 getStageProgress()가 엉뚱한 다음 단계를 가리킵니다.
    const indexed = stages.every((s, i) => s.stage === i + 1);
    check(`${kind} stage 번호 = 배열 순서`, indexed, true);
  }

  // 종족이 달라도 진화 속도는 같아야 공정합니다.
  const sameSpeed = DOG_STAGES.every((s, i) => s.minKm === CAT_STAGES[i].minKm);
  check("종족 간 기준 거리 동일", sameSpeed, true);
}

{
  const pet = new TamagotchiEngine({});
  STAGE_BOUNDARIES.forEach((minKm, i) => {
    pet.totalKm = minKm;
    check(`누적 ${minKm}km → ${i + 1}단계`, pet.getStage().stage, i + 1);

    // 경계 직전에는 아직 이전 단계를 유지해야 합니다 (반올림으로 조기 진화 금지).
    if (i > 0) {
      pet.totalKm = minKm - 0.01;
      check(`누적 ${minKm - 0.01}km → ${i}단계`, pet.getStage().stage, i);
    }
  });

  pet.totalKm = 9999;
  check("최종 단계 이후 단계 고정", pet.getStage().stage, STAGE_BOUNDARIES.length);
  check("최종 단계는 isMax 표시", pet.getStageProgress().isMax, true);
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

  // 완주 모달과 워크아웃 로그가 earnedXp를 그대로 읽습니다. 필드가 비면 "+0 XP"가 뜹니다.
  check("획득 XP 보고 필드 존재", Number.isFinite(res.earnedXp), true);
  // 보고값과 실제 적립량이 다르면 사용자에게 거짓 보상을 표시하는 셈입니다.
  check("보고된 XP = 실제 적립 XP", res.earnedXp, totalEarnedXp(pet));
  checkNear("누적 거리 반영", pet.totalKm, 5, 0.001);
  check("5km 완주 후 3단계 진화", pet.getStage().stage, 3);
  check("지구력 특화로 분류", res.workoutType.includes("지구력"), true);
}

{
  // 같은 시간이라도 더 멀리 달리면 보상이 커져야 "달린 만큼 성장"이 성립합니다.
  const shortRun = new TamagotchiEngine({}).addKmAndWorkout(3, 1800, 360);
  const longRun = new TamagotchiEngine({}).addKmAndWorkout(9, 1800, 360);
  check("거리가 길면 XP도 많다", longRun.earnedXp > shortRun.earnedXp, true);
  check("거리가 길면 스탯 성장도 크다", longRun.statGrowth.might > shortRun.statGrowth.might, true);
}

{
  // 빠른 페이스는 민첩 특화로 분류되어야 합니다.
  const pet = new TamagotchiEngine({});
  const res = pet.addKmAndWorkout(5, 1500, 300); // 페이스 5분
  check("빠른 페이스 → 민첩 특화 표기", res.workoutType.includes("민첩"), true);
  check("민첩 성장이 가장 큼", res.statGrowth.agility > res.statGrowth.might, true);
}

{
  // 짧고 느린 러닝은 회복 특화로 분류되고 정신력이 가장 많이 자라야 합니다.
  const pet = new TamagotchiEngine({});
  const res = pet.addKmAndWorkout(1, 600, 600);
  check("1km 느린 페이스 → 회복 특화 표기", res.workoutType.includes("회복"), true);
  check("회복 런은 정신력 성장이 가장 큼", res.statGrowth.spirit > res.statGrowth.might, true);
}

// --- 4. 스탯 상한 100을 넘지 않는다 ---------------------------------------
// 화면 수치와 스탯 퀘스트(80/100 달성)가 0~100 스케일을 전제로 합니다.
{
  const pet = new TamagotchiEngine({ might: 95, agility: 95, spirit: 95 });
  pet.addKmAndWorkout(30, 10800, 400);
  check("근력 상한", pet.might <= 100, true);
  check("민첩 상한", pet.agility <= 100, true);
  check("정신력 상한", pet.spirit <= 100, true);
}

{
  // 돌보기 액션도 상한을 넘겨서는 안 됩니다 (쿨다운만 돌면 무한 누적 가능).
  const pet = new TamagotchiEngine({ might: 100, agility: 100, spirit: 100 });
  pet.feed();
  pet.play();
  pet.rest();
  pet.rescueVolt();
  check("돌보기 후 근력 상한", pet.might, 100);
  check("돌보기 후 민첩 상한", pet.agility, 100);
  check("돌보기 후 정신력 상한", pet.spirit, 100);
}

{
  // 상한 도입 전 저장본이 그대로 복원되면 스케일이 깨진 채로 남습니다.
  const pet = new TamagotchiEngine({ might: 480, agility: 300, spirit: 150 });
  check("복원 시 근력 정규화", pet.might, 100);
  check("복원 시 민첩 정규화", pet.agility, 100);
  check("복원 시 정신력 정규화", pet.spirit, 100);
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
// 상태값은 "돌봄이 필요하다"는 경고를 켜는 장치입니다. 게이지가 위험한데
// 건강(HEALTHY)으로 남아 있으면 사용자가 돌볼 시점을 놓칩니다.
{
  const pet = new TamagotchiEngine({ energy: 10 });
  pet.evaluateCondition();
  check("기력 위험 → 지친 상태", pet.statusCondition, "TIRED");

  const pet2 = new TamagotchiEngine({ happiness: 20 });
  pet2.evaluateCondition();
  check("행복도 위험 → 지친 상태", pet2.statusCondition, "TIRED");

  const pet3 = new TamagotchiEngine({ hunger: 15 });
  pet3.evaluateCondition();
  check("포만감 위험 → 지친 상태", pet3.statusCondition, "TIRED");

  // 게이지가 넉넉하면 건강 상태로 돌아와야 합니다.
  const pet4 = new TamagotchiEngine({ hunger: 90, happiness: 90, energy: 90 });
  pet4.evaluateCondition();
  check("게이지 양호 → 건강 상태", pet4.statusCondition, "HEALTHY");

  // 컨디션은 돌봄 게이지로만 판정합니다. 스탯이 높다고 위험 경고를 덮으면 안 됩니다.
  const pet5 = new TamagotchiEngine({ might: 90, agility: 90, spirit: 90, energy: 10 });
  pet5.evaluateCondition();
  check("스탯이 높아도 기력 위험은 경고", pet5.statusCondition, "TIRED");
}

{
  // 장거리 런으로 게이지가 바닥나면 상태 표시도 즉시 따라와야 합니다.
  const pet = new TamagotchiEngine({});
  pet.addKmAndWorkout(20, 7200, 400);
  check("장거리 런 후 지친 상태 반영", pet.statusCondition, "TIRED");
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
  // 상한은 "액션별 1회 성공분의 합"이며, 쿨다운이 풀리면 이 값을 반드시 넘습니다.
  const feedOnly = new TamagotchiEngine({});
  feedOnly.feed();
  const restOnly = new TamagotchiEngine({ energy: 40 });
  restOnly.rest();
  const playOnly = new TamagotchiEngine({});
  playOnly.play();
  const oneRoundCap = feedOnly.xp + restOnly.xp + playOnly.xp;
  check("액션 1회분 XP 합이 0보다 큼", oneRoundCap > 0, true);

  const pet = new TamagotchiEngine({});
  const startLevel = pet.level;
  for (let i = 0; i < 200; i++) {
    pet.feed();
    pet.rest();
    pet.play();
  }
  check("버튼 600회 연타 → 레벨 상승 없음", pet.level, startLevel);
  check("버튼 연타로 얻은 XP는 1회분 이하", pet.xp <= oneRoundCap, true);
  check("돌보기 1회분으로는 레벨업 불가", oneRoundCap < pet.getXpToNextLevel(), true);
}

{
  // 쿨다운은 영구 차단이 아니라 시간이 지나면 풀려야 합니다.
  const pet = new TamagotchiEngine({});
  pet.feed();
  check("먹이주기 직후 쿨다운 잔여", pet.cooldownRemaining("feed") > 0, true);

  const dayMs = 24 * 60 * 60 * 1000;
  pet.lastActionAt.feed -= dayMs;
  pet.lastMetabolicTick -= dayMs; // 하루가 실제로 흐른 상태를 재현
  pet.applyMetabolicDecay();

  check("하루 경과 후 쿨다운 해제", pet.cooldownRemaining("feed"), 0);
  check("하루 방치 시 배고파짐", pet.hunger < 100, true);
  check("쿨다운 경과 후 재사용 가능", pet.feed().success, true);
}

// --- 7. 기력 부족 시 놀아주기 거절 -----------------------------------------
{
  const pet = new TamagotchiEngine({ energy: 5 });
  const res = pet.play();
  check("기력 부족 → 놀아주기 실패", res.success, false);
  check("기력 부족 실패 시 XP 미지급", pet.xp, 0);
  check("실패한 액션은 쿨다운도 소모하지 않음", pet.cooldownRemaining("play"), 0);
}

{
  // 방치로 게이지가 저절로 오르면 간식·휴식 버튼이 의미를 잃습니다.
  // (시간 감쇠의 하한선은 더 깎지 않는 장치일 뿐, 회복 수단이 아닙니다.)
  const pet = new TamagotchiEngine({ energy: 5, hunger: 8, happiness: 6 });
  check("방치로 체력 회복 없음", pet.energy <= 5, true);
  check("방치로 포만감 회복 없음", pet.hunger <= 8, true);
  check("방치로 행복도 회복 없음", pet.happiness <= 6, true);
}

{
  // 긴급구제는 코인을 쓰는 액션입니다. 대사 타이머가 없는 런타임(Node·RN)에서는
  // 대사가 호출 시점에 몰아서 계산되므로, 구제 직후 값이 즉시 깎이면 구매가 날아갑니다.
  const pet = new TamagotchiEngine({ hunger: 30, energy: 30, happiness: 30 });
  pet.lastMetabolicTick -= 5 * 60 * 60 * 1000;
  pet.rescueVolt();
  pet.applyMetabolicDecay();
  check("긴급구제 후 포만감 유지", pet.hunger, 100);
  check("긴급구제 후 체력 유지", pet.energy, 100);
  check("긴급구제 후 행복도 유지", pet.happiness, 100);
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
  check("직렬화 후 근력 보존", restored.might, pet.might);
  check("직렬화 후 쿨다운 기록 보존", restored.lastActionAt.feed, pet.lastActionAt.feed);
}

// --- 스탯 상한을 우회하는 호출부가 없다 -----------------------------------
// tamagotchi.js 안에서 상한을 걸어도, 화면 코드가 `pet.might = pet.might + n`으로
// 직접 더하면 그대로 뚫립니다. 실제로 모션 운동 완료 경로가 그렇게 되어 있어서
// stat_all_100 퀘스트가 장거리 운동 한 번에 전부 달성됐습니다.
{
  const { readFileSync } = await import("node:fs");
  const callers = ["../app.js", "../workout.html"];

  for (const rel of callers) {
    const src = readFileSync(new URL(rel, import.meta.url), "utf8");
    const direct = /\.(might|agility|spirit)\s*=\s*\(?this\.tamagotchi/.test(src)
      || /tamagotchi\.(might|agility|spirit)\s*=\s*/.test(src);
    check(`${rel.replace("../", "")} 직접 대입 없음`, direct, false);
    check(`${rel.replace("../", "")} applyStatGrowth 사용`, src.includes("applyStatGrowth"), true);
  }
}

console.log(failed === 0 ? "\n✅ ALL PASS" : `\n❌ ${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
