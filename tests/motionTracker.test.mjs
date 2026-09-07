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
  // 어깨는 골반 위에 일정한 몸통 길이로 붙어 함께 움직입니다.
  // (어깨를 고정해두면 몸통 길이가 0에 수렴하는 불가능한 몸이 만들어집니다)
  lm[11] = { x: hip.x - 0.05, y: hip.y - 0.25, visibility: vis };
  lm[12] = { x: hip.x + 0.05, y: hip.y - 0.25, visibility: vis };
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

// --- 10. 운동자 잠금: 여러 명 중 잠긴 사람만 따라간다 --------------------
// 랜드마크 전체를 좌우로 옮기고 크기를 바꿔 "다른 사람"을 만듭니다.
function movePerson(lm, dx, scale = 1) {
  return lm.map((p) => (p ? { ...p, x: 0.5 + (p.x - 0.5) * scale + dx, y: 0.5 + (p.y - 0.5) * scale } : p));
}

{
  const t = makeTracker("SQUAT", "intermediate");
  const me = squatLandmarks(170);
  const other = movePerson(squatLandmarks(90), 0.3, 0.75); // 옆에서 스쿼트 중인 다른 사람

  // 잠금 전에는 가운데에 크게 잡힌 사람을 고릅니다.
  const picked = t.selectSubjectPose([other, me]);
  check("잠금 전 · 화면 중앙의 큰 사람 선택", picked === me, true);

  t.lockSubject(me);
  check("잠금 후 · 두 명 중 잠긴 사람 선택", t.selectSubjectPose([other, me]) === me, true);
  check("잠금 후 · 순서를 바꿔도 동일인 선택", t.selectSubjectPose([me, other]) === me, true);
  check("잠긴 사람이 없으면 null 반환", t.selectSubjectPose([other]), null);
  check("검출된 인원수 집계", t.visiblePersonCount, 1);
}

// --- 11. 다른 사람의 동작은 카운트되지 않는다 ---------------------------
{
  const t = makeTracker("SQUAT", "intermediate");
  t.enterPhase("calibrating"); t.enterPhase("counting");
  const me = squatLandmarks(170);
  t.lockSubject(me);
  feed(t, me); // 신전 관측

  // 옆 사람이 아무리 스쿼트를 해도 selectSubjectPose가 걸러냅니다.
  const otherDown = movePerson(squatLandmarks(80), 0.3, 0.75);
  const otherUp = movePerson(squatLandmarks(170), 0.3, 0.75);
  for (let i = 0; i < 5; i++) {
    check(`옆 사람 프레임 거부 #${i + 1}`, t.selectSubjectPose([otherDown]), null);
    check(`옆 사람 프레임 거부(신전) #${i + 1}`, t.selectSubjectPose([otherUp]), null);
  }
  check("옆 사람 동작 → 내 카운트 변화 없음", t.repCount, 0);
}

// --- 12. 운동자를 놓치면 준비 페이즈로 되돌아가되 기록은 유지한다 --------
{
  const t = makeTracker("SQUAT", "intermediate");
  t.enterPhase("calibrating"); t.enterPhase("counting");
  t.lockSubject(squatLandmarks(170));
  t.repCount = 7;

  t.noteSubjectMissing();
  check("놓친 직후에는 아직 카운팅 유지", t.phase, "counting");

  // 1.2초 넘게 놓친 상황을 만듭니다.
  t.subjectMissingSince = Date.now() - 1500;
  t.noteSubjectMissing();
  check("1.2초 이상 놓침 → 준비 페이즈 복귀", t.phase, "calibrating");
  check("복귀해도 기존 횟수는 보존", t.repCount, 7);
  check("잠금은 아직 유지(같은 사람 재인식용)", t.subjectLock !== null, true);

  // 10초 넘게 사라지면 잠금 해제
  t.subjectMissingSince = Date.now() - 11000;
  t.noteSubjectMissing();
  check("10초 이상 부재 → 잠금 해제", t.subjectLock, null);
}

// --- 13. 잠금이 너무 빡빡해 본인을 놓치지 않는지 (오탐 방지) --------------
// 이 테스트가 깨지면 실사용에서 "운동 중인데 자꾸 준비로 돌아가는" 문제가 납니다.
function trackThroughMotion(label, tracker, frames) {
  let dropped = 0;
  for (const lm of frames) {
    const picked = tracker.selectSubjectPose([lm]);
    if (!picked) dropped++;
    else tracker.noteSubjectSeen(picked);
  }
  check(`${label} · 동작 중 본인을 놓친 프레임 수`, dropped, 0);
}

{
  const t = makeTracker("SQUAT", "intermediate");
  t.lockSubject(squatLandmarks(175));
  // 서기 → 완전히 앉기 → 다시 서기를 3회 반복
  const cycle = [175, 160, 140, 120, 100, 85, 75, 85, 100, 120, 140, 160, 175];
  const frames = [];
  for (let r = 0; r < 3; r++) for (const a of cycle) frames.push(squatLandmarks(a));
  trackThroughMotion("스쿼트 3회", t, frames);
}

{
  const t = makeTracker("SITUP", "intermediate");
  t.lockSubject(situpLandmarks(140));
  // 윗몸일으키기는 상체가 크게 회전해 몸통 중심이 많이 움직입니다.
  const cycle = [140, 125, 110, 95, 80, 65, 80, 95, 110, 125, 140];
  const frames = [];
  for (let r = 0; r < 3; r++) for (const a of cycle) frames.push(situpLandmarks(a));
  trackThroughMotion("윗몸일으키기 3회", t, frames);
}

{
  // 카메라 쪽으로 한 걸음 다가가는 정도(크기 15% 증가)는 동일인으로 봐야 합니다.
  const t = makeTracker("SQUAT", "intermediate");
  t.lockSubject(squatLandmarks(175));
  const frames = [1.03, 1.06, 1.09, 1.12, 1.15].map((s) => movePerson(squatLandmarks(175), 0.02, s));
  trackThroughMotion("한 걸음 이동", t, frames);
}

// --- 14. 인식 완화 모드: 준비 게이트에 영원히 갇히지 않는다 --------------
{
  const t = makeTracker("SQUAT", "intermediate");
  t.enterPhase("calibrating");
  // 관절 신뢰도 0.35 — 중급자 기준(0.55) 미달이라 준비 게이트를 통과할 수 없습니다.
  const dim = squatLandmarks(175, 0.35);

  let offered = null;
  t.onPhaseChange = (d) => { if (d.canRelax) offered = d; };

  feed(t, dim, 3);
  check("완화 모드 제안 전 · 준비 통과 불가", t.phase, "calibrating");
  check("제안은 아직 안 뜸", offered, null);

  // 12초 직전까지 막힌 상황을 만든 뒤 실제 시간을 흘려보냅니다.
  // (막힘 누적은 벽시계 delta 기반이라 타이트 루프로는 늘어나지 않습니다)
  t.calibrationBlockedMs = 11900;
  feedFor(t, dim, 250);
  check("12초 이상 막힘 → 완화 모드 제안", offered !== null, true);

  t.startRelaxedMode();
  check("완화 모드 활성", t.isRelaxed(), true);
  check("완화 후 신뢰도 기준 하향", t.getThresholds().minVisibility, 0.25);

  // 이제 같은 프레임으로 준비를 통과할 수 있어야 합니다.
  const started = Date.now();
  while (Date.now() - started < 2500 && t.phase === "calibrating") {
    t.processExerciseLogic(dim);
  }
  check("완화 모드에서 준비 게이트 통과", t.phase, "countdown");
}

// --- 15. 완화 모드가 가동범위 기준까지 풀지는 않는다 ---------------------
{
  const t = makeTracker("SQUAT", "intermediate");
  t.startRelaxedMode();
  const th = t.getThresholds();
  check("완화해도 수축 기준은 그대로", th.contracted, 95);
  check("완화해도 신전 기준은 그대로", th.extended, 155);
  check("완화해도 하단 정지 요구는 그대로", th.minHoldMs, 150);
}

// --- 16. 새 세션을 시작하면 완화 모드는 해제된다 -------------------------
{
  const t = makeTracker("SQUAT", "intermediate");
  t.startRelaxedMode();
  t.resetExerciseStats();
  check("세션 초기화 시 완화 모드 해제", t.isRelaxed(), false);
  check("세션 초기화 시 운동자 잠금 해제", t.subjectLock, null);
}

console.log(failed === 0 ? "\n✅ ALL PASS" : `\n❌ ${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
