// GPS 거리 계산 · 노이즈 필터 · 안티치트 · 페이스/칼로리 집계를 브라우저 없이 검증
import { GPSRunner, calculateDistanceMeters } from "../gpsRunner.js";

let failed = 0;
function check(label, actual, expected) {
  const ok = actual === expected;
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"} | ${label} | got=${actual} want=${expected}`);
}
function checkNear(label, actual, expected, tolerance) {
  const ok = Number.isFinite(actual) && Math.abs(actual - expected) <= tolerance;
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"} | ${label} | got=${actual} want=${expected}±${tolerance}`);
}

// 서울 시청 좌표를 기준점으로 사용합니다.
const BASE_LAT = 37.5665;
const BASE_LNG = 126.9780;

function makeRunner(weightKg = 70) {
  resetClock();
  const r = new GPSRunner({ weightKg });
  r.isTracking = true;
  return r;
}

// GPS 콜백 1건을 흘려보냅니다. secondsSinceLast로 두 점 사이 경과시간을 만듭니다.
// GPS 측정 시각을 직접 넘겨 경과 시간을 정확히 재현합니다.
// (실제 Geolocation API도 position.timestamp를 제공합니다)
let clock = Date.now();
function feedPoint(runner, lat, lng, { accuracy = 5, speed = 3, secondsSinceLast = 1 } = {}) {
  clock += secondsSinceLast * 1000;
  runner.handleGeoSuccess({
    timestamp: clock,
    coords: { latitude: lat, longitude: lng, accuracy, speed }
  });
}

// 각 시나리오가 서로의 시계에 영향받지 않도록 초기화합니다.
function resetClock() { clock = Date.now(); }

// 위도 1도 = R * (π/180). R=6,371,000m 기준 약 111,194.9m
const METERS_PER_LAT_DEGREE = 6371000 * (Math.PI / 180);

// --- 1. 하버사인 거리 공식 자체의 정확도 (필터를 거치지 않는 순수 계산) ---
{
  checkNear("위도 0.001도 = 약 111.19m",
    calculateDistanceMeters(BASE_LAT, BASE_LNG, BASE_LAT + 0.001, BASE_LNG),
    METERS_PER_LAT_DEGREE * 0.001, 0.01);

  // 경도는 위도에 따라 cos만큼 축소됩니다. 서울(37.5665도)에서 약 88m
  checkNear("경도 0.001도 (위도 보정 적용)",
    calculateDistanceMeters(BASE_LAT, BASE_LNG, BASE_LAT, BASE_LNG + 0.001),
    METERS_PER_LAT_DEGREE * 0.001 * Math.cos(BASE_LAT * Math.PI / 180), 0.01);

  check("같은 지점 거리 0", Math.round(calculateDistanceMeters(BASE_LAT, BASE_LNG, BASE_LAT, BASE_LNG)), 0);
}

// 실제 GPS처럼 초당 1회씩 샘플을 흘려보냅니다.
// 단발 점프로 먹이면 필터가 수렴할 기회가 없어 실제 동작과 달라집니다.
function runStraight(r, meters, seconds, opts = {}) {
  const steps = seconds;
  const stepM = meters / steps;
  let lat = BASE_LAT;
  feedPoint(r, lat, BASE_LNG, { ...opts, secondsSinceLast: 1 });
  for (let i = 0; i < steps; i++) {
    lat += stepM / METERS_PER_LAT_DEGREE;
    feedPoint(r, lat, BASE_LNG, { ...opts, secondsSinceLast: 1 });
  }
  return lat;
}

// --- 2. 루프 코스: 출발점으로 돌아와도 거리가 보존된다 --------------------
{
  const r = makeRunner();
  const end = runStraight(r, 200, 60);              // 200m 전진
  let lat = end;
  for (let i = 0; i < 60; i++) {                     // 다시 200m 복귀
    lat -= (200 / 60) / METERS_PER_LAT_DEGREE;
    feedPoint(r, lat, BASE_LNG, { secondsSinceLast: 1 });
  }
  // 출발점으로 돌아와도 왕복 400m가 보존되어야 합니다(오차 5% 이내).
  checkNear("왕복 400m 후 복귀 시 거리 보존", r.totalMeters, 400, 20);
}

// --- 3. 지터 필터: 제자리 미세 흔들림은 거리로 잡히지 않는다 --------------
{
  const r = makeRunner();
  feedPoint(r, BASE_LAT, BASE_LNG);
  // 약 0.5m씩 무작위로 흔들리는 상황을 40회 반복
  for (let i = 0; i < 40; i++) {
    const jitter = (i % 2 === 0 ? 1 : -1) * 0.0000045; // 약 0.5m
    feedPoint(r, BASE_LAT + jitter, BASE_LNG);
  }
  check("제자리 진동 40회 → 누적 거리 0", Math.round(r.totalMeters), 0);
}

// --- 4. 텔레포트(GPS 튐) 거부 ---------------------------------------------
{
  const r = makeRunner();
  feedPoint(r, BASE_LAT, BASE_LNG);
  // 1초 만에 1km 점프 (1000 m/s)
  feedPoint(r, BASE_LAT + 0.009, BASE_LNG, { secondsSinceLast: 1 });
  check("1초에 1km 점프 → 거리 미반영", Math.round(r.totalMeters), 0);
}

// --- 5. 정상 러닝 누적 ----------------------------------------------------
{
  const r = makeRunner();
  feedPoint(r, BASE_LAT, BASE_LNG);
  // 초당 약 3.3m(페이스 5분/km)로 북쪽으로 100스텝
  let lat = BASE_LAT;
  const stepDeg = 3.3 / METERS_PER_LAT_DEGREE;
  for (let i = 0; i < 100; i++) {
    lat += stepDeg;
    feedPoint(r, lat, BASE_LNG, { secondsSinceLast: 1 });
  }
  // 필터는 시작 구간에서 약간 뒤처지므로 2% 오차를 허용합니다.
  checkNear("초당 3.3m로 100스텝 → 약 330m", r.totalMeters, 330, 7);

  r.elapsedSeconds = 100;
  const s = r.getStats();
  check("거리 미터 정수화", s.distanceMeters, Math.floor(r.totalMeters));
  checkNear("킬로미터 환산", s.distanceKm, 0.33, 0.02);
  checkNear("평균 페이스(초/km)", Math.round(100 / (r.totalMeters / 1000)), 303, 10);
}

// --- 6. 칼로리 계산 (체중 x km x 1.036) -----------------------------------
{
  const r = makeRunner(80);
  r.totalMeters = 5000;
  r.elapsedSeconds = 1500;
  const s = r.getStats();
  check("80kg · 5km 칼로리", s.calories, Math.round(5 * 80 * 1.036));
  check("5km / 25분 → 페이스 5'00\"", s.pace, "5'00\"");
  check("시간 포맷", s.formattedTime, "25:00");
}

// --- 7. 거리 0일 때 페이스는 표시하지 않는다 ------------------------------
{
  const r = makeRunner();
  r.elapsedSeconds = 60;
  check("거리 0 → 페이스 미표시", r.getStats().pace, `--'--"`);
}

// --- 8. 명세: 정확도 25m 초과 데이터는 폐기해야 한다 ----------------------
// (기획서 "지터 & 노이즈 필터: 정확도 반경 25m 초과 데이터 폐기")
{
  const r = makeRunner();
  feedPoint(r, BASE_LAT, BASE_LNG, { accuracy: 5 });
  feedPoint(r, BASE_LAT + 0.001, BASE_LNG, { accuracy: 80, secondsSinceLast: 20 });
  check("정확도 ±80m 측정치 → 거리 미반영", Math.round(r.totalMeters), 0);
}

{
  // 정확도가 나쁜 점 때문에 이후 정상 측정까지 막히면 안 됩니다.
  const r = makeRunner();
  feedPoint(r, BASE_LAT, BASE_LNG, { accuracy: 5 });
  feedPoint(r, BASE_LAT + 0.001, BASE_LNG, { accuracy: 80, secondsSinceLast: 20 });
  for (let i = 0; i < 60; i++) {
    // 60초에 약 334m = 초속 5.56m. OS 속도도 실제와 맞춰 넘깁니다.
    feedPoint(r, BASE_LAT + (0.003 * (i + 1) / 60), BASE_LNG,
      { accuracy: 8, speed: 5.56, secondsSinceLast: 1 });
  }
  // 약 334m 주행. 시작 구간 수렴 지연을 감안해 3% 오차를 허용합니다.
  checkNear("정확도 회복 후 정상 집계", r.totalMeters, METERS_PER_LAT_DEGREE * 0.003, 11);
}

// --- 9. 명세: 시속 30km 초과 이동은 거리에서 배제해야 한다 ----------------
// (기획서 "안티치트 속도 필터: 시속 30km/h 초과 이동 구간 자동 감지 및 거리 배제")
{
  const r = makeRunner();
  feedPoint(r, BASE_LAT, BASE_LNG);
  // 시속 60km = 초당 16.7m → 10초에 167m
  const dist = 167;
  feedPoint(r, BASE_LAT + dist / METERS_PER_LAT_DEGREE, BASE_LNG, { secondsSinceLast: 10 });
  check("시속 60km 차량 이동 → 거리 미반영", Math.round(r.totalMeters), 0);
}

{
  // 빠른 러너(시속 20km)는 정상 인정되어야 합니다.
  const r = makeRunner();
  runStraight(r, 165, 30);   // 30초에 165m = 시속 19.8km
  checkNear("시속 20km 스프린트 → 정상 인정", r.totalMeters, 165, 8);
}

// --- 9-2. 차량 이동을 멈춰도 누적 변위가 한꺼번에 인정되면 안 된다 --------
// 속도 초과로 거부되는 동안 기준점을 그대로 두면, 차에서 내리는 순간
// dt가 커져 speedCheck가 낮아지고 이동 거리 전체가 통과해 버립니다.
{
  const r = makeRunner();
  feedPoint(r, BASE_LAT, BASE_LNG);

  // 시속 60km로 30초간 이동 (1초에 16.7m씩)
  let lat = BASE_LAT;
  for (let i = 0; i < 30; i++) {
    lat += 16.7 / METERS_PER_LAT_DEGREE;
    feedPoint(r, lat, BASE_LNG, { secondsSinceLast: 1 });
  }
  check("차량 이동 30초 → 거리 미반영", Math.round(r.totalMeters), 0);

  // 차에서 내려 60초 뒤 걷기 시작 (기준점이 재설정돼 있어야 함)
  // 정확도 ±5m에서는 노이즈 임계값이 3.5m이므로, 그보다 확실히 큰 10m를 걷습니다.
  let walk = lat;
  for (let i = 0; i < 20; i++) {
    walk += 1 / METERS_PER_LAT_DEGREE;
    feedPoint(r, walk, BASE_LNG, { secondsSinceLast: 3 });
  }
  checkNear("정차 후에도 차량 구간이 거리로 둔갑하지 않음", r.totalMeters, 20, 6);
}

// --- 9-3. 실측 회귀: 서 있는데 거리가 늘어나면 안 된다 -------------------
// 실기기 테스트에서 "가만히 서 있는데 2m 이상 늘어난다"는 보고가 있었습니다.
// 고정 1.5m 임계값이 GPS 오차(야외 ±5~15m)보다 작아 노이즈가 그대로 통과했습니다.
{
  const r = makeRunner();
  // 정확도 ±12m 환경에서 제자리에 서 있는 상황 (좌표가 오차 범위 안에서 흔들림)
  feedPoint(r, BASE_LAT, BASE_LNG, { accuracy: 12 });
  let lat = BASE_LAT;
  for (let i = 0; i < 60; i++) {
    // 매 초 무작위 방향으로 2~4m씩 흔들림 (실제 GPS drift 수준)
    const drift = ((i % 7) - 3) * 1.2 / METERS_PER_LAT_DEGREE;
    lat = BASE_LAT + drift;
    feedPoint(r, lat, BASE_LNG, { accuracy: 12, secondsSinceLast: 1 });
  }
  check("±12m 정확도로 60초 정지 → 누적 거리 0", Math.round(r.totalMeters), 0);
}

{
  // 반대로, 정확도가 좋으면 작은 이동도 잡아야 합니다.
  const r = makeRunner();
  runStraight(r, 20, 10, { accuracy: 3 });
  checkNear("정확도 ±3m에서 20m 이동은 인정", r.totalMeters, 20, 3);
}

// --- 9-4. 실측 회귀: AVG PACE가 GPS 대기 시간에 오염되면 안 된다 ---------
// START를 누르고 GPS가 잡히기까지 걸린 시간이 분모에 들어가면
// 실제보다 훨씬 느리게 나오고, 60분/km를 넘으면 --'--"로 표시됩니다.
{
  const r = makeRunner();
  r.elapsedSeconds = 90;          // START 후 90초간 GPS 대기 (아직 이동 없음)
  feedPoint(r, BASE_LAT, BASE_LNG, { accuracy: 5 });

  // 이제부터 300초 동안 1km 주행
  let lat = BASE_LAT;
  const step = 20 / METERS_PER_LAT_DEGREE;
  for (let i = 0; i < 50; i++) {
    lat += step;
    r.elapsedSeconds += 6;
    feedPoint(r, lat, BASE_LNG, { accuracy: 5, secondsSinceLast: 6 });
  }

  const s = r.getStats();
  check("대기 시간은 페이스 분모에서 제외", s.runningSeconds, 300);
  checkNear("실제 페이스 300초/km 근사", Math.round(s.runningSeconds / s.distanceKm), 300, 15);
  // 대기 시간을 포함했다면 390초/km = 6'30"이 나왔을 것입니다.
  check("총 경과 시간은 그대로 보존", s.elapsedSeconds, 390);
}

// --- 9-5. 실기기 회귀: 노이즈 환경에서 정지 시 거리 0 --------------------
// "가만히 서 있는데 2m 이상 늘어난다"는 실기기 보고에 대한 최종 방어선입니다.
// 재현 가능한 난수로 실제 GPS 노이즈를 흉내냅니다.
{
  let seed = 42;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff * 2 - 1; };

  function standStill(accuracy, seconds, reportSpeed) {
    seed = 42;
    const r = makeRunner();
    let clock = Date.now();
    for (let i = 0; i <= seconds; i++) {
      clock += 1000;
      r.handleGeoSuccess({
        timestamp: clock,
        coords: {
          latitude: BASE_LAT + rnd() * accuracy * 0.6 / METERS_PER_LAT_DEGREE,
          longitude: BASE_LNG + rnd() * accuracy * 0.6 / METERS_PER_LAT_DEGREE,
          accuracy,
          speed: reportSpeed ? 0 : null
        }
      });
    }
    return r.totalMeters;
  }

  check("정지 60초 ±12m (속도 제공) → 0m", Math.round(standStill(12, 60, true)), 0);
  check("정지 300초 ±25m (속도 제공) → 0m", Math.round(standStill(25, 300, true)), 0);
  check("정지 60초 ±12m (속도 미제공) → 0m", Math.round(standStill(12, 60, false)), 0);
  check("정지 300초 ±25m (속도 미제공) → 0m", Math.round(standStill(25, 300, false)), 0);
}

// --- 9-6. 노이즈 환경에서도 실제 주행 거리는 보존된다 --------------------
// 정지를 막느라 실제 이동까지 걸러내면 더 나쁜 문제가 됩니다.
{
  let seed = 42;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff * 2 - 1; };

  function runNoisy(meters, seconds, accuracy, reportSpeed) {
    seed = 42;
    const r = makeRunner();
    let clock = Date.now();
    const stepM = meters / seconds;
    let lat = BASE_LAT;
    for (let i = 0; i <= seconds; i++) {
      clock += 1000;
      r.handleGeoSuccess({
        timestamp: clock,
        coords: {
          latitude: lat + rnd() * accuracy * 0.6 / METERS_PER_LAT_DEGREE,
          longitude: BASE_LNG + rnd() * accuracy * 0.6 / METERS_PER_LAT_DEGREE,
          accuracy,
          speed: reportSpeed ? stepM : null
        }
      });
      lat += stepM / METERS_PER_LAT_DEGREE;
    }
    return r.totalMeters;
  }

  // 오차 3% 이내를 목표로 합니다.
  checkNear("1km 주행 ±8m (속도 제공)", runNoisy(1000, 300, 8, true), 1000, 30);
  checkNear("5km 주행 ±10m (속도 제공)", runNoisy(5000, 1500, 10, true), 5000, 150);
  checkNear("1km 주행 ±8m (속도 미제공)", runNoisy(1000, 300, 8, false), 1000, 30);
  checkNear("느린 걷기 500m ±10m", runNoisy(500, 500, 10, true), 500, 20);
}

// --- 9-7. 화면이 꺼진 구간은 거리에 포함하지 않는다 ----------------------
{
  const r = makeRunner();
  runStraight(r, 100, 30);
  const before = r.totalMeters;

  // 화면이 꺼졌다 켜진 상황: 좌표만 멀리 튀어 있음
  r.resumeFromHidden = true;
  feedPoint(r, BASE_LAT + 0.005, BASE_LNG, { secondsSinceLast: 120 });

  checkNear("복귀 직후 구간은 거리에 미포함", r.totalMeters, before, 0.001);
  check("화면 꺼짐 구간 카운트", r.skippedResumeSegments, 1);
}

// --- 10. 리셋 -------------------------------------------------------------
{
  const r = makeRunner();
  feedPoint(r, BASE_LAT, BASE_LNG);
  feedPoint(r, BASE_LAT + 0.001, BASE_LNG, { secondsSinceLast: 20 });
  r.totalMeters > 0 || failed++;
  r.reset();
  check("리셋 후 거리 0", r.totalMeters, 0);
  check("리셋 후 경로 비움", r.positions.length, 0);
  check("리셋 후 기준점 해제", r.lastValidPos, null);
}

console.log(failed === 0 ? "\n✅ ALL PASS" : `\n❌ ${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
