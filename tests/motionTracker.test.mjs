// motionTracker의 준비 게이트 / rep FSM / 난이도 분기를 DOM 없이 검증하는 스모크 테스트
import { MotionTracker, EXERCISE_TYPES, DIFFICULTY_LEVELS } from "../motionTracker.js";

let failed = 0;
function check(label, actual, expected) {
  const ok = actual === expected;
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"} | ${label} | got=${actual} want=${expected}`);
}

// --- 랜드마크 생성 헬퍼 -------------------------------------------------
// 무릎 각도를 원하는 값으로 만드는 골반/무릎/발목 3점을 구성합니다.
function legPoints(kneeAngleDeg, vis = 0.95) {
  const rad = (kneeAngleDeg * Math.PI) / 180;
  const knee = { x: 0.5, y: 0.6, visibility: vis };
  const ankle = { x: 0.5, y: 0.9, visibility: vis };
  // 무릎→발목 방향(아래쪽)을 kneeAngleDeg만큼 회전시킨 위치에 골반을 둡니다.
  // 180도면 골반-무릎-발목이 일직선(다리를 편 상태)이 됩니다.
  const hip = {
    x: knee.x + 0.3 * Math.sin(rad),
    y: knee.y + 0.3 * Math.cos(rad),
    visibility: vis
  };
  return { hip, knee, ankle };
}

function squatLandmarks(kneeAngleDeg, vis = 0.95) {
  const { hip, knee, ankle } = legPoints(kneeAngleDeg, vis);
  const lm = [];
  for (let i = 0; i <= 32; i++) lm[i] = { x: 0.5, y: 0.5, visibility: vis };
  lm[11] = { x: 0.45, y: 0.3, visibility: vis };
  lm[12] = { x: 0.55, y: 0.3, visibility: vis };
  lm[23] = { ...hip, x: hip.x - 0.02 };
  lm[24] = { ...hip, x: hip.x + 0.02 };
  lm[25] = { ...knee, x: knee.x - 0.02 };
  lm[26] = { ...knee, x: knee.x + 0.02 };
  lm[27] = { ...ankle, x: ankle.x - 0.02 };
  lm[28] = { ...ankle, x: ankle.x + 0.02 };
  return lm;
}

function situpLandmarks(hipAngleDeg, vis = 0.95) {
  const rad = (hipAngleDeg * Math.PI) / 180;
  const lm = [];
  for (let i = 0; i <= 32; i++) lm[i] = { x: 0.5, y: 0.5, visibility: vis };
  const hip = { x: 0.5, y: 0.6, visibility: vis };
  const knee = { x: 0.8, y: 0.6, visibility: vis };
  const shoulder = {
    x: hip.x + 0.3 * Math.cos(rad),
    y: hip.y - 0.3 * Math.sin(rad),
    visibility: vis
  };
  lm[11] = { ...shoulder }; lm[12] = { ...shoulder };
  lm[23] = { ...hip };      lm[24] = { ...hip };
  lm[25] = { ...knee };     lm[26] = { ...knee };
  return lm;
}

function makeTracker(exercise, difficulty) {
  const t = new MotionTracker({ difficulty });
  t.setExercise(exercise);
  // 캔버스 렌더링은 이 테스트 범위 밖이라 무력화합니다.
  t.drawAngleArc = () => {};
  t.drawAngleBadge = () => {};
  t.drawTargetDepthGuide = () => {};
  t.startTimer = () => {};
  t.stopTimer = () => {};
  return t;
}

// EMA(alpha 0.4) 때문에 값이 수렴하려면 여러 프레임이 필요합니다.
function feed(tracker, landmarks, frames = 12) {
  for (let i = 0; i < frames; i++) tracker.processExerciseLogic(landmarks);
}

// 실제 경과 시간이 필요한 판정(하단 정지 시간 등)을 위해 벽시계 기준으로 먹입니다.
function feedFor(tracker, landmarks, ms) {
  const until = Date.now() + ms;
  while (Date.now() < until) tracker.processExerciseLogic(landmarks);
}

// --- 1. 준비 페이즈에서는 절대 카운트되지 않는다 -------------------------
{
  const t = makeTracker("SQUAT", "intermediate");
  t.enterPhase("calibrating");
  // 준비 중에 사용자가 앉았다 일어나는 동작을 반복해도 카운트는 0이어야 합니다.
  for (let i = 0; i < 3; i++) {
    feed(t, squatLandmarks(170));
    feed(t, squatLandmarks(80));
  }
  check("준비 페이즈 중 스쿼트 반복 → 카운트 0", t.repCount, 0);
}

// --- 2. 윗몸일으키기 즉발 카운트 버그(서 있는데 1회) 재발 방지 -----------
{
  const t = makeTracker("SITUP", "intermediate");
  t.enterPhase("calibrating");
  t.enterPhase("counting");
  // 서 있는 자세(어깨-골반-무릎 약 170도)를 계속 유지
  feed(t, situpLandmarks(170), 30);
  check("서 있는 상태 유지 → 윗몸일으키기 카운트 0", t.repCount, 0);
}

// --- 3. 정상 사이클 1회는 카운트된다 -------------------------------------
{
  const t = makeTracker("SQUAT", "intermediate");
  t.enterPhase("calibrating");
  t.enterPhase("counting");
  feed(t, squatLandmarks(170));            // 신전 관측
  feedFor(t, squatLandmarks(80), 250);     // 수축 + 하단 유지(중급 150ms 요구)
  feed(t, squatLandmarks(170));            // 복귀 → 1회
  check("스쿼트 정상 1사이클 → 1회", t.repCount, 1);
}

// --- 3-2. 단련자도 하단 정지를 지키면 정상 인정된다 ----------------------
{
  const t = makeTracker("SQUAT", "advanced");
  t.enterPhase("calibrating"); t.enterPhase("counting");
  feed(t, squatLandmarks(175));
  feedFor(t, squatLandmarks(70), 400);     // 단련자 300ms 정지 요구
  feed(t, squatLandmarks(175));
  check("단련자 · 하단 정지 지킨 1사이클 → 1회", t.repCount, 1);
}

// --- 3-3. 임계값 근처 떨림으로 중복 카운트되지 않는다 --------------------
{
  const t = makeTracker("SQUAT", "intermediate");
  t.enterPhase("calibrating"); t.enterPhase("counting");
  feed(t, squatLandmarks(170));
  feedFor(t, squatLandmarks(80), 250);
  feed(t, squatLandmarks(170));            // 1회
  // 신전 임계값(155) 근처에서 빠르게 떨어도 추가 카운트가 없어야 합니다.
  for (let i = 0; i < 20; i++) {
    feed(t, squatLandmarks(158), 2);
    feed(t, squatLandmarks(152), 2);
  }
  check("신전 임계값 근처 지터 20회 → 카운트 1 유지", t.repCount, 1);
}

// --- 4. 얕은 스쿼트: 중급자는 미인정, 초보자는 인정 ----------------------
{
  const mid = makeTracker("SQUAT", "intermediate");
  mid.enterPhase("calibrating"); mid.enterPhase("counting");
  feed(mid, squatLandmarks(170));
  feed(mid, squatLandmarks(112));      // 중급 기준(95) 미달, 초보 기준(117) 통과
  feed(mid, squatLandmarks(170));
  check("얕은 스쿼트(112도) · 중급자 → 미인정", mid.repCount, 0);

  const beg = makeTracker("SQUAT", "beginner");
  beg.enterPhase("calibrating"); beg.enterPhase("counting");
  feed(beg, squatLandmarks(170));
  feed(beg, squatLandmarks(112));
  feed(beg, squatLandmarks(150));      // 초보 신전 기준 141 통과
  check("얕은 스쿼트(112도) · 초보자 → 인정", beg.repCount, 1);
}

// --- 5. 단련자는 하단 정지(minHoldMs)를 요구한다 -------------------------
{
  const adv = makeTracker("SQUAT", "advanced");
  adv.enterPhase("calibrating"); adv.enterPhase("counting");
  feed(adv, squatLandmarks(175));
  feed(adv, squatLandmarks(70));       // 단련자 기준(82) 통과할 만큼 깊게
  feed(adv, squatLandmarks(175));      // 정지 없이 즉시 복귀
  check("단련자 · 하단 정지 없이 반동 → 미인정", adv.repCount, 0);
}

// --- 6. visibility 미달 시 판정 자체가 중단된다 --------------------------
{
  const t = makeTracker("SQUAT", "intermediate");
  t.enterPhase("calibrating"); t.enterPhase("counting");
  feed(t, squatLandmarks(170, 0.2));
  feed(t, squatLandmarks(80, 0.2));
  feed(t, squatLandmarks(170, 0.2));
  check("하반신 미검출(visibility 0.2) → 카운트 0", t.repCount, 0);
}

// --- 7. 준비 게이트: 시작 자세 유지 시 countdown으로 넘어간다 ------------
{
  const t = makeTracker("SQUAT", "beginner");
  t.enterPhase("calibrating");
  const lm = squatLandmarks(175);
  const started = Date.now();
  while (Date.now() - started < 2000 && t.phase === "calibrating") {
    t.processExerciseLogic(lm);
  }
  check("초보자 준비 1.2초 유지 → countdown 진입", t.phase, "countdown");
}

// --- 8. 난이도별 실효 임계값 확인 ---------------------------------------
{
  const t = makeTracker("SQUAT", "intermediate");
  check("중급자 수축 임계값", t.getThresholds().contracted, 95);
  t.setDifficulty("beginner");
  check("초보자 수축 임계값", t.getThresholds().contracted, 117);
  t.enterPhase("calibrating");
  t.enterPhase("counting");
  t.setDifficulty("advanced");
  check("단련자 수축 임계값", t.getThresholds().contracted, 82);
  check("난이도 변경 시 준비 페이즈로 복귀", t.phase, "calibrating");
}

// --- 9. 보상 배율 ------------------------------------------------------
{
  const t = makeTracker("SQUAT", "advanced");
  t.enterPhase("calibrating"); t.enterPhase("counting");
  t.repCount = 10;
  const s = t.getWorkoutSummary();
  check("단련자 XP 배율 1.15 적용", s.xpGained, Math.round(10 * EXERCISE_TYPES.SQUAT.xpPerRep * 1.15));
  check("요약에 난이도 포함", s.difficultyName, DIFFICULTY_LEVELS.advanced.name);
}

console.log(failed === 0 ? "\n✅ ALL PASS" : `\n❌ ${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
