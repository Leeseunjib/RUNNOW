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

function checkNear2(label, actual, expected, tol) {
  const ok = Number.isFinite(actual) && Math.abs(actual - expected) <= tol;
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"} | ${label} | got=${actual} want=${expected}±${tol}`);
}

// 실제 앱은 약 30fps로 검출합니다. 테스트는 순식간에 돌아 프레임 간격이 0이 되므로,
// 직전 인정 시각을 되돌려 33ms 간격을 흉내냅니다. 연속성 판정이 프레임 간격에
// 비례하기 때문에 이 재현이 없으면 실제와 다른 결과가 나옵니다.
const FRAME_MS = 33;
function simulateFrame(tracker, candidates) {
  if (tracker.lastAcceptedAt) tracker.lastAcceptedAt -= FRAME_MS;
  const picked = tracker.selectSubjectPose(candidates);
  if (picked) tracker.noteSubjectSeen(picked);
  return picked;
}

// 대부분의 테스트는 엄격한 판정 기준을 검증하므로 자동 보정을 끄고 만듭니다.
// 제품 기본값이 On이라는 사실은 아래 14번 섹션에서 따로 검증합니다.
function makeTracker(exercise, difficulty, options = {}) {
  const t = new MotionTracker({ difficulty, relaxed: false, ...options });
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
  check("검출된 인원수 집계", t.visiblePersonCount, 2);

  // 혼자 남으면 고를 것이 없으므로 거부하지 않습니다.
  // 절대 임계값으로 거부하면 혼자 운동하는 사용자가 자기 동작 때문에 카운트를 놓칩니다.
  check("한 명만 있으면 거부하지 않음", t.selectSubjectPose([me]) === me, true);
}

// --- 11. 다른 사람의 동작은 카운트되지 않는다 ---------------------------
{
  const t = makeTracker("SQUAT", "intermediate");
  t.enterPhase("calibrating"); t.enterPhase("counting");
  const me = squatLandmarks(170);
  t.lockSubject(me);
  feed(t, me); // 신전 관측

  // 둘 다 화면에 있을 때, 옆 사람이 스쿼트를 해도 나를 계속 따라가야 합니다.
  const otherDown = movePerson(squatLandmarks(80), 0.3, 0.75);
  const otherUp = movePerson(squatLandmarks(170), 0.3, 0.75);
  for (let i = 0; i < 5; i++) {
    check(`옆 사람이 앉아도 나를 선택 #${i + 1}`, t.selectSubjectPose([otherDown, me]) === me, true);
    check(`옆 사람이 서도 나를 선택 #${i + 1}`, t.selectSubjectPose([otherUp, me]) === me, true);
  }
  check("옆 사람 동작 → 내 카운트 변화 없음", t.repCount, 0);
}

// --- 11-2. 혼자 운동할 때는 어떤 프레임도 거부되지 않는다 -----------------
// 가장 흔한 사용 상황입니다. 여기서 거부가 생기면 카운트가 어긋납니다.
// 실측상 스쿼트 중 본인의 서명 거리가 1.78까지 올라가므로, 절대 임계값을 두면
// 자기 동작 때문에 스스로 걸러집니다.
{
  const t = makeTracker("SQUAT", "intermediate");
  // 실제로는 카운트 중에 일어나는 판정이므로 같은 단계로 맞춥니다.
  t.lastLandmarks = squatLandmarks(175);
  t.lockSubject(squatLandmarks(175));
  t.enterPhase("calibrating"); t.enterPhase("counting");

  // 30fps 기준: 스쿼트 1회 1.5초 → 프레임당 약 4.4도
  const cycle = [];
  for (let a = 175; a >= 75; a -= 4.4) cycle.push(a);
  for (let a = 75; a <= 175; a += 4.4) cycle.push(a);
  let rejected = 0;
  for (let r = 0; r < 5; r++) {
    for (let i = 0; i < cycle.length; i++) {
      // 자연스러운 좌우 흔들림까지 포함
      const sway = Math.sin((r * cycle.length + i) * 0.5) * 0.02;
      const frame = movePerson(squatLandmarks(cycle[i]), sway, 1);
      const picked = simulateFrame(t, [frame]);
      if (!picked) rejected++;
    }
  }
  check("혼자 스쿼트 5회 · 거부된 프레임 수", rejected, 0);
}

// --- 11-3. 옆 사람이 함께 운동해도 나를 계속 따라간다 ---------------------
// 세로 가중치를 낮추기 전에는 45프레임 중 5건에서 옆 사람을 골랐습니다.
// 운동 중 몸 중심의 세로 이동이 사람 사이 가로 거리보다 커서 생긴 역전이었습니다.
{
  const t = makeTracker("SQUAT", "intermediate");
  const me0 = squatLandmarks(175);
  t.lastLandmarks = me0;
  t.lockSubject(me0);
  t.enterPhase("calibrating"); t.enterPhase("counting");

  const cycle = [];
  for (let a = 175; a >= 75; a -= 4.4) cycle.push(a);
  for (let a = 75; a <= 175; a += 4.4) cycle.push(a);
  let wrong = 0;
  for (let r = 0; r < 5; r++) {
    for (let i = 0; i < cycle.length; i++) {
      const sway = Math.sin((r * cycle.length + i) * 0.5) * 0.02;
      const mine = movePerson(squatLandmarks(cycle[i]), sway, 1);
      // 옆 사람은 다른 박자로 스쿼트 중
      const other = movePerson(squatLandmarks(cycle[(i + 4) % cycle.length]), 0.3, 0.75);
      const picked = simulateFrame(t, [other, mine]);
      if (picked !== mine) wrong++;
    }
  }
  check("옆 사람도 운동 중 · 45프레임 오선택 수", wrong, 0);
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
  // 운동 중 판정이므로 카운트 단계로 맞춥니다.
  if (tracker.phase === "idle") { tracker.enterPhase("calibrating"); tracker.enterPhase("counting"); }
  let dropped = 0;
  for (const lm of frames) {
    if (!simulateFrame(tracker, [lm])) dropped++;
  }
  check(`${label} · 동작 중 본인을 놓친 프레임 수`, dropped, 0);
}

{
  const t = makeTracker("SQUAT", "intermediate");
  t.lockSubject(squatLandmarks(175));
  // 서기 → 완전히 앉기 → 다시 서기를 3회 반복
  const cycle = [];
  for (let a = 175; a >= 75; a -= 4.4) cycle.push(a);
  for (let a = 75; a <= 175; a += 4.4) cycle.push(a);
  const frames = [];
  for (let r = 0; r < 3; r++) for (const a of cycle) frames.push(squatLandmarks(a));
  trackThroughMotion("스쿼트 3회", t, frames);
}

{
  const t = makeTracker("SITUP", "intermediate");
  t.lockSubject(situpLandmarks(140));
  // 윗몸일으키기는 상체가 크게 회전해 몸통 중심이 많이 움직입니다.
  const cycle = [];
  for (let a = 140; a >= 65; a -= 3.3) cycle.push(a);
  for (let a = 65; a <= 140; a += 3.3) cycle.push(a);
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

// --- 13-1. 앉거나 서 있는 자세는 푸시업·플랭크로 세지 않는다 --------------
// 대표님 제보 영상: 의자에 앉아 손만 흔드는 2분 동안 팔굽혀펴기 9회가 카운트됐습니다.
// 팔꿈치 각도만 보면 손을 뻗었다 당기는 동작이 완전한 1회로 성립합니다.
{
  // 앉은 사람. 어깨가 골반보다 위에 있어 몸통이 수직(약 90도)입니다.
  // 팔꿈치 각도는 원하는 값으로 만들어, 각도만으로는 푸시업과 구별되지 않게 합니다.
  function seatedLandmarks(elbowAngleDeg, vis = 0.95) {
    const rad = (elbowAngleDeg * Math.PI) / 180;
    const lm = [];
    for (let i = 0; i <= 32; i++) lm[i] = { x: 0.5, y: 0.5, visibility: vis };
    const shoulder = { x: 0.5, y: 0.35, visibility: vis };
    const elbow = { x: 0.35, y: 0.5, visibility: vis };
    // 팔꿈치를 기준으로 손목을 회전시켜 원하는 팔꿈치 각도를 만듭니다.
    const baseAngle = Math.atan2(shoulder.y - elbow.y, shoulder.x - elbow.x);
    const wrist = {
      x: elbow.x + 0.2 * Math.cos(baseAngle - rad),
      y: elbow.y + 0.2 * Math.sin(baseAngle - rad),
      visibility: vis
    };
    lm[11] = { ...shoulder, x: shoulder.x - 0.05 };
    lm[12] = { ...shoulder, x: shoulder.x + 0.05 };
    lm[13] = { ...elbow };  lm[14] = { ...elbow, x: elbow.x + 0.3 };
    lm[15] = { ...wrist };  lm[16] = { ...wrist, x: wrist.x + 0.3 };
    // 골반은 어깨 아래. 앉은 사람의 몸통은 화면에서 수직입니다.
    lm[23] = { x: 0.48, y: 0.75, visibility: vis };
    lm[24] = { x: 0.52, y: 0.75, visibility: vis };
    lm[27] = { x: 0.48, y: 0.95, visibility: vis };
    lm[28] = { x: 0.52, y: 0.95, visibility: vis };
    return lm;
  }

  const t = makeTracker("PUSHUP", "intermediate");
  const seatedTilt = t.torsoTiltFromHorizontal(seatedLandmarks(170), 0.25);
  check("앉은 몸통은 수직으로 판정", seatedTilt.tilt > 45, true);
  check("앉은 자세는 측정 자체를 거부", t.measurePose(seatedLandmarks(170), t.getThresholds()), null);
  check("거부 사유를 화면에 전달", t.postureBlockHint.length > 0, true);

  // 준비 게이트를 강제로 통과시킨 뒤 팔만 접었다 펴도 카운트되어선 안 됩니다.
  t.enterPhase("calibrating"); t.enterPhase("counting");
  for (let cycle = 0; cycle < 4; cycle++) {
    for (const a of [175, 140, 100, 60, 100, 140, 175]) {
      feedFor(t, seatedLandmarks(a), 60);
    }
  }
  check("앉아서 팔만 흔든 4사이클 → 카운트 0", t.repCount, 0);

  // 플랭크도 같은 구멍이 있었습니다. 바르게 선 사람은 어깨-골반-발목이 180도입니다.
  const p = makeTracker("PLANK", "intermediate");
  check("선 자세는 플랭크로 측정하지 않음", p.measurePose(seatedLandmarks(175), p.getThresholds()), null);

  // 엎드린 자세는 정상적으로 측정되어야 합니다. 게이트가 전부를 막으면 안 됩니다.
  function proneLandmarks(elbowAngleDeg, vis = 0.95) {
    const rad = (elbowAngleDeg * Math.PI) / 180;
    const lm = [];
    for (let i = 0; i <= 32; i++) lm[i] = { x: 0.5, y: 0.5, visibility: vis };
    // 몸통이 화면에서 수평입니다. 어깨가 왼쪽, 골반·발목이 오른쪽.
    const shoulder = { x: 0.25, y: 0.5, visibility: vis };
    const elbow = { x: 0.25, y: 0.65, visibility: vis };
    const baseAngle = Math.atan2(shoulder.y - elbow.y, shoulder.x - elbow.x);
    const wrist = {
      x: elbow.x + 0.18 * Math.cos(baseAngle - rad),
      y: elbow.y + 0.18 * Math.sin(baseAngle - rad),
      visibility: vis
    };
    lm[11] = { ...shoulder, y: shoulder.y - 0.02 };
    lm[12] = { ...shoulder, y: shoulder.y + 0.02 };
    lm[13] = { ...elbow };  lm[14] = { ...elbow, y: elbow.y + 0.02 };
    lm[15] = { ...wrist };  lm[16] = { ...wrist, y: wrist.y + 0.02 };
    lm[23] = { x: 0.55, y: 0.5, visibility: vis };
    lm[24] = { x: 0.55, y: 0.54, visibility: vis };
    lm[27] = { x: 0.85, y: 0.5, visibility: vis };
    lm[28] = { x: 0.85, y: 0.54, visibility: vis };
    return lm;
  }

  const ok = makeTracker("PUSHUP", "intermediate");
  const proneTilt = ok.torsoTiltFromHorizontal(proneLandmarks(170), 0.25);
  check("엎드린 몸통은 수평으로 판정", proneTilt.tilt <= 45, true);
  check("엎드린 자세는 정상 측정", ok.measurePose(proneLandmarks(170), ok.getThresholds()) !== null, true);

  // 영상에서는 상반신만 보여 모델이 골반을 가슴 부근에 뭉쳐 놓았습니다.
  // 거의 겹친 두 점의 기울기는 방향이 아니라 노이즈라 판정에 쓰면 안 됩니다.
  const collapsed = proneLandmarks(170);
  collapsed[23] = { x: 0.26, y: 0.51, visibility: 0.95 };
  collapsed[24] = { x: 0.26, y: 0.53, visibility: 0.95 };
  check("관절이 한 점에 뭉치면 기울기 계산 거부",
    makeTracker("PUSHUP", "intermediate").torsoTiltFromHorizontal(collapsed, 0.25), null);
  check("뭉친 관절로는 카운트 불가",
    makeTracker("PUSHUP", "intermediate").measurePose(collapsed, ok.getThresholds()), null);
}

// --- 14. 조명·거리 자동 보정은 기본으로 켜져 있다 -------------------------
// 기본이 꺼져 있으면 좁은 방·어두운 조명에서 12초를 막힌 뒤에야 시작할 수 있습니다.
{
  const t = new MotionTracker({ difficulty: "intermediate" });
  t.setExercise("SQUAT");
  check("옵션 없이 생성하면 자동 보정 On", t.isRelaxed(), true);
  check("기본 상태의 신뢰도 하한", t.getThresholds().minVisibility, 0.25);

  // 중급자 기준(0.55)에는 미달이지만 보정 하한(0.25)은 넘는 관절입니다.
  // 기본값이 On이므로 사용자가 아무것도 누르지 않아도 준비를 통과해야 합니다.
  t.drawAngleArc = () => {}; t.drawAngleBadge = () => {}; t.drawTargetDepthGuide = () => {};
  t.startTimer = () => {}; t.stopTimer = () => {};
  t.enterPhase("calibrating");
  const dim = squatLandmarks(175, 0.35);
  const started = Date.now();
  while (Date.now() - started < 2500 && t.phase === "calibrating") {
    t.processExerciseLogic(dim);
  }
  check("버튼을 누르지 않아도 준비 게이트 통과", t.phase, "countdown");

  // 보정을 끄면 같은 프레임으로는 통과할 수 없어야 합니다.
  t.setRelaxedTracking(false);
  check("보정 Off 전환", t.isRelaxed(), false);
  check("Off 시 신뢰도 하한 복귀", t.getThresholds().minVisibility, 0.55);
  check("세트 중간에 끄면 준비 단계로 복귀", t.phase, "calibrating");
  feed(t, dim, 20);
  check("정밀 모드에서는 어두운 프레임 통과 불가", t.phase, "calibrating");
}

// --- 14-1. 보정은 내부 판정일 뿐, 안내 문구의 근거가 된다 -----------------
// 화면에 "보정 중"을 띄우지는 않습니다. 이 플래그는 엔진이 완화된 기준으로
// 살리고 있는지를 테스트가 확인할 때만 씁니다.
{
  const t = makeTracker("SQUAT", "intermediate", { relaxed: true });
  feed(t, squatLandmarks(175, 0.95), 3);
  check("관절이 선명하면 보정 안내 없음", t.relaxAssisting, false);
  feed(t, squatLandmarks(175, 0.35), 3);
  check("기준 미달 관절을 보정으로 살릴 때만 안내", t.relaxAssisting, true);
}

// --- 14-2. 정밀 판정 모드는 준비 게이트에 영원히 갇히지 않는다 ------------
{
  const t = makeTracker("SQUAT", "intermediate");
  check("테스트 기본값은 보정 Off", t.isRelaxed(), false);
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
  check("12초 이상 막힘 → 보정이 자동으로 켜짐", t.isRelaxed(), true);
  check("자동 켜진 뒤 신뢰도 기준 하향", t.getThresholds().minVisibility, 0.25);

  // 이제 같은 프레임으로 준비를 통과할 수 있어야 합니다.
  const started = Date.now();
  while (Date.now() - started < 2500 && t.phase === "calibrating") {
    t.processExerciseLogic(dim);
  }
  check("자동 보정 후 준비 게이트 통과", t.phase, "countdown");
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

// --- 16. 보정 설정은 새 세션에도 이어진다 --------------------------------
// 매 세션 초기화하면 사용자가 정한 값이 조용히 되돌아가 같은 불편이 반복됩니다.
{
  const t = makeTracker("SQUAT", "intermediate");
  t.startRelaxedMode();
  t.resetExerciseStats();
  check("보정 On 선택이 세션 초기화 후에도 유지", t.isRelaxed(), true);
  check("세션 초기화 시 운동자 잠금 해제", t.subjectLock, null);

  t.setRelaxedTracking(false);
  t.resetExerciseStats();
  check("보정 Off 선택도 세션 초기화 후 유지", t.isRelaxed(), false);
}

// --- 17. 폼 리포트: 회차 기록이 실제로 쌓이고 집계된다 -------------------
{
  const t = makeTracker("SQUAT", "intermediate");
  t.enterPhase("calibrating"); t.enterPhase("counting");

  // 깊이를 일부러 다르게 3회 수행 (85 / 70 / 78도)
  // 실제 사람처럼 중간 각도를 거쳐 내려갔다 올라와야 템포가 측정됩니다.
  const depths = [85, 70, 78];
  for (const d of depths) {
    feedFor(t, squatLandmarks(170), 60);
    for (const a of [150, 125, 105, d]) feedFor(t, squatLandmarks(a), 80); // 하강
    feedFor(t, squatLandmarks(d), 260);                                     // 하단 유지
    for (const a of [105, 125, 150]) feedFor(t, squatLandmarks(a), 80);     // 상승
    feedFor(t, squatLandmarks(170), 900);                                   // 복귀 + rep 간격 확보
  }
  check("3회 모두 카운트", t.repCount, 3);
  check("회차 기록 3건 누적", t.repLog.length, 3);

  const r = t.buildFormReport();
  check("리포트 생성됨", r !== null, true);
  check("분석 회차 수", r.repsAnalyzed, 3);
  check("목표 깊이는 현재 난이도 기준", r.targetDepth, 95);
  check("가장 얕았던 회차 = 1회차(85도)", r.shallowest.rep, 1);
  check("가장 깊었던 회차 = 2회차(70도)", r.deepest.rep, 2);
  check("평균 깊이 집계", r.avgDepth, Math.round((85 + 70 + 78) / 3));
  check("하강/상승 시간 측정됨", r.avgDescentMs > 0 && r.avgAscentMs > 0, true);
}

// --- 18. 회차가 부족하면 리포트를 만들지 않는다 -------------------------
{
  const t = makeTracker("SQUAT", "intermediate");
  t.enterPhase("calibrating"); t.enterPhase("counting");
  feed(t, squatLandmarks(170));
  feedFor(t, squatLandmarks(80), 260);
  feed(t, squatLandmarks(170));
  check("1회만 했을 때 리포트 없음", t.buildFormReport(), null);
  check("요약에도 formReport가 null", t.getWorkoutSummary().formReport, null);
}

// --- 19. 난이도 상향 제안은 여유 있게 깊었을 때만 -----------------------
{
  // 전 회차가 기준(95°)보다 12° 이상 깊은 경우 → 제안
  const deep = makeTracker("SQUAT", "beginner");
  deep.enterPhase("calibrating"); deep.enterPhase("counting");
  deep.repLog = [{ deepest: 70, descentMs: 900, ascentMs: 700, sideDelta: 1 },
                 { deepest: 72, descentMs: 900, ascentMs: 700, sideDelta: 2 },
                 { deepest: 68, descentMs: 900, ascentMs: 700, sideDelta: 0 }];
  check("초보자 · 전 회차 깊음 → 중급자 제안", deep.buildFormReport().levelUpSuggestion, "중급자");

  // 기준을 겨우 통과한 경우 → 제안 없음
  const shallow = makeTracker("SQUAT", "intermediate");
  shallow.enterPhase("calibrating"); shallow.enterPhase("counting");
  shallow.repLog = [{ deepest: 94, descentMs: 900, ascentMs: 700, sideDelta: 1 },
                    { deepest: 90, descentMs: 900, ascentMs: 700, sideDelta: 2 },
                    { deepest: 92, descentMs: 900, ascentMs: 700, sideDelta: 0 }];
  check("겨우 통과 → 제안 없음", shallow.buildFormReport().levelUpSuggestion, null);

  // 단련자는 더 올릴 곳이 없음
  const adv = makeTracker("SQUAT", "advanced");
  adv.enterPhase("calibrating"); adv.enterPhase("counting");
  adv.repLog = [{ deepest: 60, descentMs: 900, ascentMs: 700, sideDelta: 0 },
                { deepest: 62, descentMs: 900, ascentMs: 700, sideDelta: 0 },
                { deepest: 58, descentMs: 900, ascentMs: 700, sideDelta: 0 }];
  check("단련자는 상향 제안 없음", adv.buildFormReport().levelUpSuggestion, null);
}

// --- 20. 좌우 불균형은 의미 있는 차이일 때만 보고한다 -------------------
{
  const t = makeTracker("SQUAT", "intermediate");
  const base = { descentMs: 900, ascentMs: 700 };

  t.repLog = [{ deepest: 85, ...base, sideDelta: 12 },
              { deepest: 84, ...base, sideDelta: 10 },
              { deepest: 86, ...base, sideDelta: 14 }];
  const biased = t.buildFormReport();
  check("왼쪽이 덜 굽혀진 경우 감지", biased.sideBias?.side, "왼쪽");
  check("평균 편차 각도", biased.sideBias?.avgDelta, 12);

  t.repLog = [{ deepest: 85, ...base, sideDelta: 2 },
              { deepest: 84, ...base, sideDelta: -1 },
              { deepest: 86, ...base, sideDelta: 3 }];
  check("미세한 차이는 보고하지 않음", t.buildFormReport().sideBias, null);
}

// --- 21. 활동 칼로리는 MET × 시간으로 계산된다 ---------------------------
// 기존은 "회당 고정값 × 횟수"였습니다. 같은 횟수를 빠르게 하든 천천히 하든
// 같은 값이 나와 실제 소비와 어긋났습니다.
{
  const t = makeTracker("SQUAT", "intermediate");
  t.setWeight(70);
  t.enterPhase("calibrating"); t.enterPhase("counting");

  t.repCount = 20;
  t.elapsedSeconds = 600;                     // 20회를 10분에 걸쳐
  // 스쿼트 5.0 MET → (5-1) × 3.5 × 70 / 200 × 10분 = 49 kcal
  checkNear2("스쿼트 20회 / 10분", t.computeCalories(), 49, 1);

  t.elapsedSeconds = 300;                     // 같은 20회를 5분에
  checkNear2("같은 20회라도 5분이면 절반", t.computeCalories(), 24.5, 1);

  t.setWeight(100);
  check("체중 반영", t.computeCalories() > 24.5, true);
}

{
  // 종목별 MET가 다르게 반영되어야 합니다 (푸시업 8.0 > 스쿼트 5.0 > 플랭크 3.8)
  const mk = (ex) => {
    const t = makeTracker(ex, "intermediate");
    t.setWeight(70);
    t.enterPhase("calibrating"); t.enterPhase("counting");
    t.elapsedSeconds = 600;
    return t.computeCalories();
  };
  const push = mk("PUSHUP"), squat = mk("SQUAT"), plank = mk("PLANK");
  check("푸시업이 스쿼트보다 높음", push > squat, true);
  check("스쿼트가 플랭크보다 높음", squat > plank, true);
}

// --- 22. 실기기 회귀: 다른 사람이 앞을 가로막아도 세지 않는다 -------------
// 실기기 테스트에서 "다른 사람이 앞을 가로막았을 때 숫자가 막 세어졌다"는 보고를
// 받았습니다. 화면에 한 명뿐이면 무조건 인정하던 규칙 때문이었습니다.
//
// 사람은 1/30초 만에 순간이동할 수 없습니다. 실측 프레임 간 변화량은
//   내 스쿼트(흔들림 포함) 0.188 / 옆에서 끼어듦 0.411 / 앞을 가로막음 1.55~2.14
// 로 확실히 갈리므로, 연속성으로 판정합니다.
{
  const squatCycle = [];
  for (let a = 175; a >= 75; a -= 5) squatCycle.push(a);
  for (let a = 75; a <= 175; a += 5) squatCycle.push(a);

  const startTracking = () => {
    const t = makeTracker("SQUAT", "intermediate");
    t.lastLandmarks = squatLandmarks(175);
    t.lockSubject(squatLandmarks(175));
    t.enterPhase("calibrating");
    t.enterPhase("counting");
    return t;
  };

  // (1) 혼자 운동은 절대 놓치지 않는다
  {
    const t = startTracking();
    let rejected = 0;
    let n = 0;
    for (let r = 0; r < 5; r++) {
      for (const a of squatCycle) {
        const frame = movePerson(squatLandmarks(a), Math.sin(n * 0.3) * 0.015, 1);
        n++;
        if (!simulateFrame(t, [frame])) rejected++;
      }
    }
    check("혼자 스쿼트 5회 · 거부 프레임", rejected, 0);
  }

  // (2) 가로막은 사람만 보이면 한 프레임도 인정하지 않는다
  {
    const t = startTracking();
    for (const a of squatCycle.slice(0, 10)) simulateFrame(t, [squatLandmarks(a)]);
    let accepted = 0;
    for (let i = 0; i < 20; i++) {
      // 앞을 가로막은 사람은 더 크게(1.4배) 잡힙니다
      if (t.lastAcceptedAt) t.lastAcceptedAt -= FRAME_MS;
      if (t.selectSubjectPose([movePerson(squatLandmarks(170 - i * 2), 0.02, 1.4)])) accepted++;
    }
    check("가로막은 사람만 보임 · 인정 프레임", accepted, 0);
  }

  // (3) 나와 끼어든 사람이 동시에 보이면 나를 고른다
  {
    const t = startTracking();
    let wrong = 0;
    let n = 0;
    for (let r = 0; r < 3; r++) {
      for (const a of squatCycle) {
        const me = squatLandmarks(a);
        const other = movePerson(squatLandmarks(squatCycle[(n + 10) % squatCycle.length]), 0.28, 1.3);
        n++;
        const picked = simulateFrame(t, [other, me]);
        if (picked !== me) wrong++;
      }
    }
    check("나 + 끼어든 사람 · 오선택", wrong, 0);
  }

  // (4) 가로막은 사람이 스쿼트를 해도 내 카운트는 오르지 않는다
  {
    const t = startTracking();
    for (const a of squatCycle.slice(0, 10)) simulateFrame(t, [squatLandmarks(a)]);
    for (let r = 0; r < 5; r++) {
      for (const a of squatCycle) {
        if (t.lastAcceptedAt) t.lastAcceptedAt -= FRAME_MS;
        const picked = t.selectSubjectPose([movePerson(squatLandmarks(a), 0.02, 1.4)]);
        if (picked) t.processExerciseLogic(picked);
      }
    }
    check("가로막은 사람이 스쿼트 5회 → 내 카운트", t.repCount, 0);
  }

  // (5) 추적 상실 후 준비 단계에서 다른 사람이 운동자로 승격되면 안 된다
  // 스쿼트의 시작 자세는 "서 있기"라, 지나가던 사람이 서 있기만 해도 준비 게이트를
  // 통과해 새 운동자가 되던 문제가 있었습니다.
  {
    const t = startTracking();
    t.subjectMissingSince = Date.now() - 2000;
    t.noteSubjectMissing();
    check("추적 상실 후 준비 단계로 복귀", t.phase, "calibrating");

    const other = movePerson(squatLandmarks(175), 0.02, 1.4);
    check("준비 단계에서 다른 사람 거부", t.selectSubjectPose([other]), null);

    // 같은 자리로 돌아온 본인은 다시 인식되어야 합니다.
    const meBack = movePerson(squatLandmarks(175), 0.01, 1.02);
    check("같은 자리로 돌아온 본인은 재인식", t.selectSubjectPose([meBack]) === meBack, true);
  }

  // (6) 추적이 오래 끊기면 아무도 인정하지 않고 재준비로 넘어간다
  {
    const t = startTracking();
    simulateFrame(t, [squatLandmarks(170)]);
    t.lastAcceptedAt = Date.now() - 2000;   // 2초 공백
    check("2초 공백 후에는 인정하지 않음", t.selectSubjectPose([squatLandmarks(170)]), null);
  }
}

// --- 16. 종목별 자세 게이트: 다른 자세로는 세지 않는다 -------------------
// 실제 사고. 의자에 앉아 손을 휘저었더니 푸시업 9회가 세어졌습니다. 관절 각도만
// 보면 종목과 무관한 동작도 같은 구간을 오갑니다. 푸시업·플랭크에 엎드림 게이트를
// 붙인 뒤, 남은 종목에 같은 구멍이 있는지 확인하고 막은 결과를 고정합니다.
{
  // (헬퍼) 바닥에 누워 무릎을 세운 실제 윗몸일으키기 자세.
  // 골반과 발목이 바닥에 있고 무릎만 올라와 있습니다.
  function lyingSitupLandmarks(hipAngleDeg, vis = 0.95) {
    const lm = [];
    for (let i = 0; i <= 32; i++) lm[i] = { x: 0.5, y: 0.8, visibility: vis };
    const hip = { x: 0.45, y: 0.80, visibility: vis };
    const knee = { x: 0.65, y: 0.65, visibility: vis };

    // 골반→무릎 방향에서 hipAngleDeg만큼 벌어진 위치에 어깨를 둡니다.
    const thighDir = Math.atan2(-(knee.y - hip.y), knee.x - hip.x);   // 화면 y는 아래로 증가
    const shoulderDir = thighDir + (hipAngleDeg * Math.PI) / 180;
    const shoulder = {
      x: hip.x + 0.28 * Math.cos(shoulderDir),
      y: hip.y - 0.28 * Math.sin(shoulderDir),
      visibility: vis
    };

    lm[11] = { ...shoulder }; lm[12] = { ...shoulder };
    lm[23] = { ...hip };      lm[24] = { ...hip };
    lm[25] = { ...knee };     lm[26] = { ...knee };
    return lm;
  }

  // (헬퍼) 사무용 의자에 앉은 자세. 허벅지가 수평이고 몸통만 앞뒤로 움직입니다.
  function seatedLandmarks(torsoFromThighDeg, vis = 0.95) {
    const lm = [];
    for (let i = 0; i <= 32; i++) lm[i] = { x: 0.5, y: 0.6, visibility: vis };
    const hip = { x: 0.50, y: 0.55, visibility: vis };
    const knee = { x: 0.75, y: 0.55, visibility: vis };   // 허벅지 수평
    const ankle = { x: 0.75, y: 0.85, visibility: vis };  // 정강이 수직(발은 바닥)
    const rad = (torsoFromThighDeg * Math.PI) / 180;
    const shoulder = {
      x: hip.x + 0.28 * Math.cos(rad),
      y: hip.y - 0.28 * Math.sin(rad),
      visibility: vis
    };
    lm[11] = { ...shoulder }; lm[12] = { ...shoulder };
    lm[23] = { ...hip };      lm[24] = { ...hip };
    lm[25] = { ...knee };     lm[26] = { ...knee };
    lm[27] = { ...ankle };    lm[28] = { ...ankle };
    return lm;
  }

  // (헬퍼) 책상 아래에서 다리만 뻗었다 당기는 자세.
  // 몸통은 세워져 있고 무릎 각도만 바뀝니다. 정강이는 화면에서 거의 수평입니다.
  function seatedLegKickLandmarks(kneeAngleDeg, vis = 0.95) {
    const lm = [];
    for (let i = 0; i <= 32; i++) lm[i] = { x: 0.5, y: 0.6, visibility: vis };
    const hip = { x: 0.40, y: 0.55, visibility: vis };
    const knee = { x: 0.62, y: 0.55, visibility: vis };
    // 무릎→골반 방향에서 kneeAngleDeg만큼 벌어진 곳에 발목을 둡니다.
    const toHip = Math.atan2(-(hip.y - knee.y), hip.x - knee.x);
    const dir = toHip - (kneeAngleDeg * Math.PI) / 180;
    const ankle = {
      x: knee.x + 0.28 * Math.cos(dir),
      y: knee.y - 0.28 * Math.sin(dir),
      visibility: vis
    };
    lm[11] = { x: hip.x, y: hip.y - 0.28, visibility: vis };
    lm[12] = { x: hip.x, y: hip.y - 0.28, visibility: vis };
    lm[23] = { ...hip };   lm[24] = { ...hip };
    lm[25] = { ...knee };  lm[26] = { ...knee };
    lm[27] = { ...ankle }; lm[28] = { ...ankle };
    return lm;
  }

  // (헬퍼) 누워서 팔다리를 휘젓는 자세(스노우 엔젤). 점핑잭 조건만 보면 성립합니다.
  function lyingJackLandmarks(open, vis = 0.95) {
    const lm = [];
    for (let i = 0; i <= 32; i++) lm[i] = { x: 0.5, y: 0.5, visibility: vis };
    // 머리가 화면 위, 몸이 아래로 누운 상태. 몸통이 수평입니다.
    lm[0]  = { x: 0.30, y: 0.50, visibility: vis };
    lm[11] = { x: 0.40, y: 0.45, visibility: vis };
    lm[12] = { x: 0.40, y: 0.55, visibility: vis };
    lm[23] = { x: 0.62, y: 0.46, visibility: vis };   // 골반이 어깨 옆 → 몸통 수평
    lm[24] = { x: 0.62, y: 0.54, visibility: vis };
    // 팔을 머리 위(화면 위쪽)로 뻗으면 손목 y가 머리보다 작아집니다.
    lm[15] = { x: 0.25, y: open ? 0.30 : 0.60, visibility: vis };
    lm[16] = { x: 0.25, y: open ? 0.32 : 0.62, visibility: vis };
    lm[27] = { x: 0.85, y: open ? 0.28 : 0.49, visibility: vis };
    lm[28] = { x: 0.85, y: open ? 0.72 : 0.51, visibility: vis };
    return lm;
  }

  // (1) 윗몸일으키기: 누운 자세는 인정, 앉은 자세는 거부
  {
    const t = makeTracker("SITUP", "intermediate");
    const th = t.getThresholds();

    // 누워서 등을 바닥에 댄 시작 자세는 측정돼야 합니다.
    const lyingStart = t.measurePose(lyingSitupLandmarks(150), th);
    check("윗몸: 누운 시작 자세 측정됨", Boolean(lyingStart), true);
    check("윗몸: 누운 시작 자세가 신전 구간", lyingStart ? lyingStart.angle >= th.extended : false, true);

    // 의자에 기댄 자세는 골반 각도가 같아도 거부돼야 합니다.
    const seatedBack = seatedLandmarks(140);
    const hipAngle = t.bestSideAngle(seatedBack, [11, 23, 25], [12, 24, 26], t.difficulty.minVisibility);
    check("윗몸: 앉아 기댄 자세도 골반 각도는 신전 구간", hipAngle ? hipAngle.angle >= th.extended : false, true);
    check("윗몸: 그래도 측정 거부", t.measurePose(seatedBack, th), null);
    check("윗몸: 거부 이유를 안내", /누운|앉은/.test(t.postureBlockHint), true);
  }

  // (2) 윗몸일으키기: 의자에서 앞뒤로 흔들어도 카운트되지 않는다
  {
    const t = makeTracker("SITUP", "intermediate");
    t.enterPhase("counting");
    for (let r = 0; r < 6; r++) {
      feed(t, seatedLandmarks(140), 10);   // 등받이에 기댐
      feed(t, seatedLandmarks(60), 10);    // 앞으로 숙임
    }
    check("윗몸: 의자에서 6회 흔들기 → 카운트", t.repCount, 0);
  }

  // (3) 스쿼트: 앉아서 다리만 뻗었다 당기면 카운트되지 않는다
  {
    const t = makeTracker("SQUAT", "intermediate");
    const th = t.getThresholds();

    const extendedLeg = seatedLegKickLandmarks(172);
    const knee = t.bestSideAngle(extendedLeg, [23, 25, 27], [24, 26, 28], t.difficulty.minVisibility);
    check("스쿼트: 앉아 다리 뻗기도 무릎 각도는 신전 구간", knee ? knee.angle >= th.extended : false, true);
    check("스쿼트: 그래도 측정 거부", t.measurePose(extendedLeg, th), null);
    check("스쿼트: 거부 이유를 안내", /앉은|일어서/.test(t.postureBlockHint), true);

    t.enterPhase("counting");
    for (let r = 0; r < 6; r++) {
      feed(t, seatedLegKickLandmarks(172), 10);
      feed(t, seatedLegKickLandmarks(85), 10);
    }
    check("스쿼트: 앉아서 다리 6회 뻗기 → 카운트", t.repCount, 0);
  }

  // (4) 스쿼트: 서서 하는 정상 동작은 그대로 세어진다 (게이트가 과하지 않은지)
  {
    const t = makeTracker("SQUAT", "intermediate");
    t.enterPhase("calibrating"); t.enterPhase("counting");
    for (let r = 0; r < 3; r++) {
      feedFor(t, squatLandmarks(170), 60);
      for (const a of [150, 125, 105, 85]) feedFor(t, squatLandmarks(a), 80);
      feedFor(t, squatLandmarks(85), 260);
      for (const a of [105, 125, 150]) feedFor(t, squatLandmarks(a), 80);
      feedFor(t, squatLandmarks(170), 900);   // 복귀 + rep 간격 확보
    }
    check("스쿼트: 서서 3회 → 카운트", t.repCount, 3);
  }

  // (5) 런지도 같은 게이트를 쓴다
  {
    const t = makeTracker("LUNGE", "intermediate");
    t.enterPhase("counting");
    for (let r = 0; r < 6; r++) {
      feed(t, seatedLegKickLandmarks(172), 10);
      feed(t, seatedLegKickLandmarks(85), 10);
    }
    check("런지: 앉아서 다리 6회 뻗기 → 카운트", t.repCount, 0);
  }

  // (6) 점핑잭: 누워서 팔다리를 휘저어도 카운트되지 않는다
  {
    const t = makeTracker("JUMPINGJACK", "intermediate");
    const th = t.getThresholds();
    check("점핑잭: 누운 자세 측정 거부", t.measurePose(lyingJackLandmarks(false), th), null);
    check("점핑잭: 거부 이유를 안내", /누운|서서/.test(t.postureBlockHint), true);

    t.enterPhase("counting");
    for (let r = 0; r < 6; r++) {
      feed(t, lyingJackLandmarks(false), 10);
      feed(t, lyingJackLandmarks(true), 10);
    }
    check("점핑잭: 누워서 6회 휘젓기 → 카운트", t.repCount, 0);
  }

  // (7) 런지: 서서 한쪽 무릎만 접었다 펴도 카운트되지 않는다
  // 판정값이 좌우 최소값이라, 기립 게이트를 통과한 채로 한 다리만 굽히면
  // 사이클이 완성됐습니다. 런지는 뒷무릎도 함께 내려가야 합니다.
  {
    // 왼다리는 kneeL도로 굽히고 오른다리는 rightKnee도로 두는 서 있는 자세.
    function twoLegLandmarks(kneeL, kneeR, vis = 0.95) {
      const lm = [];
      for (let i = 0; i <= 32; i++) lm[i] = { x: 0.5, y: 0.5, visibility: vis };
      const hip = { x: 0.5, y: 0.50 };
      lm[11] = { x: hip.x - 0.05, y: hip.y - 0.25, visibility: vis };
      lm[12] = { x: hip.x + 0.05, y: hip.y - 0.25, visibility: vis };
      lm[23] = { x: hip.x - 0.04, y: hip.y, visibility: vis };
      lm[24] = { x: hip.x + 0.04, y: hip.y, visibility: vis };

      // 무릎은 골반 아래, 발목은 무릎에서 kneeAngle만큼 벌어진 방향에 둡니다.
      const place = (hipPt, kneeX, angleDeg, kneeIdx, ankleIdx) => {
        const knee = { x: kneeX, y: hipPt.y + 0.22, visibility: vis };
        const toHip = Math.atan2(-(hipPt.y - knee.y), hipPt.x - knee.x);
        const dir = toHip - (angleDeg * Math.PI) / 180;
        lm[kneeIdx] = knee;
        lm[ankleIdx] = {
          x: knee.x + 0.22 * Math.cos(dir),
          y: knee.y - 0.22 * Math.sin(dir),
          visibility: vis
        };
      };
      place(lm[23], hip.x - 0.04, kneeL, 25, 27);
      place(lm[24], hip.x + 0.04, kneeR, 26, 28);
      return lm;
    }

    const t = makeTracker("LUNGE", "intermediate");
    const th = t.getThresholds();

    // 한쪽만 굽힌 순간: 최소값은 수축 구간이지만 뒷무릎이 그대로 펴져 있습니다.
    const oneLeg = twoLegLandmarks(85, 178);
    check("런지: 한쪽만 굽힘 측정 거부", t.measurePose(oneLeg, th), null);
    check("런지: 거부 이유를 안내", /뒷무릎/.test(t.postureBlockHint), true);

    // 양쪽이 함께 내려간 정상 런지는 그대로 측정돼야 합니다.
    const both = makeTracker("LUNGE", "intermediate");
    const m = both.measurePose(twoLegLandmarks(85, 120), both.getThresholds());
    check("런지: 뒷무릎도 내려가면 측정됨", Boolean(m), true);
    check("런지: 정상 런지는 수축으로 인정", m ? m.isContracted : false, true);

    const t2 = makeTracker("LUNGE", "intermediate");
    t2.enterPhase("calibrating"); t2.enterPhase("counting");
    for (let r = 0; r < 6; r++) {
      feed(t2, twoLegLandmarks(178, 178), 10);
      feed(t2, twoLegLandmarks(85, 178), 10);   // 한 다리만 굽힘
    }
    check("런지: 서서 한쪽 무릎 6회 → 카운트", t2.repCount, 0);
  }

  // (8) 점핑잭: 측면 촬영은 영구 오누락이 아니라 안내로 끝난다
  // 옆으로 서면 두 어깨가 겹쳐 어깨폭이 0.02까지 내려갑니다. 예전에는 그 값이
  // 발 벌림 기준이 되어 발을 모아도 "벌림"으로 읽혀 합성값이 90에 갇혔고,
  // 한 번도 카운트되지 않으면서 이유도 알려주지 않았습니다.
  {
    function sideViewJackLandmarks(vis = 0.95) {
      const lm = [];
      for (let i = 0; i <= 32; i++) lm[i] = { x: 0.5, y: 0.5, visibility: vis };
      lm[0]  = { x: 0.50, y: 0.20, visibility: vis };
      lm[11] = { x: 0.50, y: 0.32, visibility: vis };   // 두 어깨가 겹침
      lm[12] = { x: 0.51, y: 0.32, visibility: vis };
      lm[23] = { x: 0.50, y: 0.57, visibility: vis };
      lm[24] = { x: 0.51, y: 0.57, visibility: vis };
      lm[15] = { x: 0.50, y: 0.55, visibility: vis };
      lm[16] = { x: 0.51, y: 0.55, visibility: vis };
      lm[27] = { x: 0.50, y: 0.92, visibility: vis };
      lm[28] = { x: 0.51, y: 0.92, visibility: vis };
      return lm;
    }

    const t = makeTracker("JUMPINGJACK", "intermediate");
    check("점핑잭: 측면 촬영 측정 거부", t.measurePose(sideViewJackLandmarks(), t.getThresholds()), null);
    check("점핑잭: 정면으로 서라고 안내", /정면/.test(t.postureBlockHint), true);
  }

  // (9) 점핑잭: 저신뢰 코 좌표를 기준선으로 쓰지 않는다
  // 머리가 화면 위로 잘리면 모델이 얼굴을 몸통 쪽으로 뭉칩니다. 그 좌표를 쓰면
  // 기준선이 내려와 가슴 높이의 손도 "머리 위"로 읽힙니다.
  {
    function standingJack(noseY, noseVis, wristY, feetSpread, vis = 0.95) {
      const lm = [];
      for (let i = 0; i <= 32; i++) lm[i] = { x: 0.5, y: 0.5, visibility: vis };
      lm[0]  = { x: 0.50, y: noseY, visibility: noseVis };
      lm[11] = { x: 0.42, y: 0.32, visibility: vis };
      lm[12] = { x: 0.58, y: 0.32, visibility: vis };
      lm[23] = { x: 0.45, y: 0.55, visibility: vis };
      lm[24] = { x: 0.55, y: 0.55, visibility: vis };
      lm[15] = { x: 0.35, y: wristY, visibility: vis };
      lm[16] = { x: 0.65, y: wristY, visibility: vis };
      lm[27] = { x: 0.50 - feetSpread / 2, y: 0.92, visibility: vis };
      lm[28] = { x: 0.50 + feetSpread / 2, y: 0.92, visibility: vis };
      return lm;
    }

    const t = makeTracker("JUMPINGJACK", "intermediate");   // jackReach: "nose"
    const th = t.getThresholds();

    // 코가 몸통 쪽(0.34)으로 뭉친 저신뢰 추측치. 손은 가슴 높이(0.45)에 있습니다.
    const bad = t.measurePose(standingJack(0.34, 0.1, 0.45, 0.10), th);
    check("점핑잭: 저신뢰 코를 무시하고 어깨 기준으로 폴백", bad ? bad.angle : null, 180);

    // 같은 좌표를 신뢰할 수 있게 주면 가슴 높이 손이 "머리 위"로 읽힙니다.
    // 이 대비가 코 가드가 실제로 일하고 있다는 증거입니다.
    const t3 = makeTracker("JUMPINGJACK", "intermediate");
    const trusted = t3.measurePose(standingJack(0.34, 0.95, 0.30, 0.10), t3.getThresholds());
    check("점핑잭: 신뢰 가능한 코는 기준선으로 사용", trusted ? trusted.angle : null, 90);
  }
}

console.log(failed === 0 ? "\n✅ ALL PASS" : `\n❌ ${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
