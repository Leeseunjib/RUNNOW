// GPS 거리 계산 · 노이즈 필터 · 안티치트 · 페이스/칼로리 집계를 브라우저 없이 검증
import { GPSRunner } from "../gpsRunner.js";

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
  const r = new GPSRunner({ weightKg });
  r.isTracking = true;
  return r;
}

// GPS 콜백 1건을 흘려보냅니다. secondsSinceLast로 두 점 사이 경과시간을 만듭니다.
function feedPoint(runner, lat, lng, { accuracy = 5, speed = 3, secondsSinceLast = 1 } = {}) {
  if (runner.lastValidPos) {
    runner.lastValidPos.time = Date.now() - secondsSinceLast * 1000;
  }
  runner.handleGeoSuccess({ coords: { latitude: lat, longitude: lng, accuracy, speed } });
}

// 위도 1도 = R * (π/180). R=6,371,000m 기준 약 111,194.9m
const METERS_PER_LAT_DEGREE = 6371000 * (Math.PI / 180);

// --- 1. 하버사인 거리 정확도 ---------------------------------------------
{
  const r = makeRunner();
  feedPoint(r, BASE_LAT, BASE_LNG);                                          // 출발점 등록
  feedPoint(r, BASE_LAT + 0.001, BASE_LNG, { secondsSinceLast: 20 });        // 정북 0.001도(약 111m)
  checkNear("위도 0.001도 이동 거리", r.totalMeters, METERS_PER_LAT_DEGREE * 0.001, 0.5);
}

{
  // 경도는 위도에 따라 cos만큼 축소됩니다. 서울(37.5665도)에서 약 88m
  const r = makeRunner();
  feedPoint(r, BASE_LAT, BASE_LNG);
  feedPoint(r, BASE_LAT, BASE_LNG + 0.001, { secondsSinceLast: 20 });
  const expected = METERS_PER_LAT_DEGREE * 0.001 * Math.cos(BASE_LAT * Math.PI / 180);
  checkNear("경도 0.001도 이동 (위도 보정 적용)", r.totalMeters, expected, 0.5);
}

// --- 2. 루프 코스: 출발점으로 돌아와도 거리가 보존된다 --------------------
{
  const r = makeRunner();
  feedPoint(r, BASE_LAT, BASE_LNG);
  feedPoint(r, BASE_LAT + 0.001, BASE_LNG, { secondsSinceLast: 20 });
  feedPoint(r, BASE_LAT, BASE_LNG, { secondsSinceLast: 20 });   // 출발점 복귀
  checkNear("왕복 후 복귀 시 거리 보존", r.totalMeters, METERS_PER_LAT_DEGREE * 0.002, 1.0);
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
  checkNear("초당 3.3m로 100스텝 → 약 330m", r.totalMeters, 330, 2);

  r.elapsedSeconds = 100;
  const s = r.getStats();
  check("거리 미터 정수화", s.distanceMeters, Math.floor(r.totalMeters));
  checkNear("킬로미터 환산", s.distanceKm, 0.33, 0.01);
  check("평균 페이스 계산", s.pace, "5'03\"");
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
  feedPoint(r, BASE_LAT + 0.001, BASE_LNG, { accuracy: 8, secondsSinceLast: 20 });
  checkNear("정확도 회복 후 정상 집계", r.totalMeters, METERS_PER_LAT_DEGREE * 0.001, 1.0);
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
  feedPoint(r, BASE_LAT, BASE_LNG);
  const dist = 55; // 10초에 55m = 시속 19.8km
  feedPoint(r, BASE_LAT + dist / METERS_PER_LAT_DEGREE, BASE_LNG, { secondsSinceLast: 10 });
  checkNear("시속 20km 스프린트 → 정상 인정", r.totalMeters, dist, 1.0);
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
  feedPoint(r, lat + 10 / METERS_PER_LAT_DEGREE, BASE_LNG, { secondsSinceLast: 60 });
  check("정차 후에도 차량 구간이 거리로 둔갑하지 않음", Math.round(r.totalMeters), 10);
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
  feedPoint(r, BASE_LAT, BASE_LNG, { accuracy: 3 });
  feedPoint(r, BASE_LAT + 5 / METERS_PER_LAT_DEGREE, BASE_LNG, { accuracy: 3, secondsSinceLast: 2 });
  checkNear("정확도 ±3m에서 5m 이동은 인정", r.totalMeters, 5, 0.5);
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
  check("실제 페이스 5'00\" 표시", s.pace, "5'00\"");
  // 대기 시간을 포함했다면 390초/km = 6'30"이 나왔을 것입니다.
  check("총 경과 시간은 그대로 보존", s.elapsedSeconds, 390);
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
