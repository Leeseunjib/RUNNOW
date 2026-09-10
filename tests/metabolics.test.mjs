// ACSM 대사 방정식 및 MET 계산 검증
// 교과서에 나오는 표준 예제값과 대조합니다.
import {
  runningVo2, walkingVo2, vo2ForSpeed,
  activeCaloriesFromVo2, caloriesForDistance, caloriesForMet,
  metForExercise, EXERCISE_MET, RESTING_VO2
} from "../metabolics.js";

let failed = 0;
function check(label, actual, expected) {
  const ok = actual === expected;
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"} | ${label} | got=${actual} want=${expected}`);
}
function checkNear(label, actual, expected, tol) {
  const ok = Number.isFinite(actual) && Math.abs(actual - expected) <= tol;
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"} | ${label} | got=${Number(actual).toFixed(2)} want=${expected}±${tol}`);
}

// --- 1. ACSM 방정식 자체 ---------------------------------------------------
{
  // 달리기: VO2 = 0.2×속도 + 0.9×속도×경사 + 3.5
  // 시속 10km = 166.67 m/min → 0.2×166.67 + 3.5 = 36.83
  checkNear("달리기 10km/h 평지 VO2", runningVo2(10000 / 60, 0), 36.83, 0.05);
  // 경사 5% → + 0.9×166.67×0.05 = 7.5
  checkNear("달리기 10km/h 경사 5% VO2", runningVo2(10000 / 60, 0.05), 44.33, 0.05);

  // 걷기: VO2 = 0.1×속도 + 1.8×속도×경사 + 3.5
  // 시속 5km = 83.33 m/min → 0.1×83.33 + 3.5 = 11.83
  checkNear("걷기 5km/h 평지 VO2", walkingVo2(5000 / 60, 0), 11.83, 0.05);
  checkNear("걷기 5km/h 경사 10% VO2", walkingVo2(5000 / 60, 0.10), 26.83, 0.05);

  check("속도 0이면 안정 시 값", vo2ForSpeed(0), RESTING_VO2);
}

// --- 2. 걷기/달리기 방정식 자동 선택 --------------------------------------
{
  // 7km/h 미만은 걷기, 이상은 달리기
  checkNear("6km/h → 걷기 방정식", vo2ForSpeed(6), walkingVo2(6000 / 60), 0.01);
  checkNear("8km/h → 달리기 방정식", vo2ForSpeed(8), runningVo2(8000 / 60), 0.01);
}

// --- 3. 활동 칼로리 환산 ---------------------------------------------------
{
  // (VO2 - 3.5) × 체중 / 1000 × 5 kcal/L × 분
  // 70kg, VO2 36.83, 30분 → (33.33 × 70 / 1000) × 5 × 30 = 350
  checkNear("70kg 달리기 10km/h 30분", activeCaloriesFromVo2(36.83, 70, 30), 350, 1);
  check("시간 0이면 0", activeCaloriesFromVo2(36.83, 70, 0), 0);
  // 안정 시 수준이면 활동 칼로리는 0
  check("안정 시 VO2는 활동 칼로리 0", activeCaloriesFromVo2(RESTING_VO2, 70, 60), 0);
}

// --- 4. 핵심: 걷기와 달리기가 구분되어야 한다 ------------------------------
// 기존 공식(거리×체중×1.036)은 걷기 5km와 달리기 5km를 같게 계산했습니다.
{
  const run = caloriesForDistance(5000, 30 * 60, 70);      // 5km를 30분 (10km/h)
  const walk = caloriesForDistance(5000, 60 * 60, 70);     // 5km를 60분 (5km/h)

  checkNear("달리기 5km/30분 (70kg)", run, 350, 5);
  checkNear("걷기 5km/60분 (70kg)", walk, 175, 5);
  check("걷기가 달리기보다 적게 나옴", walk < run * 0.6, true);

  // 기존 공식이라면 둘 다 363kcal로 같았습니다.
  const oldFormula = 5 * 70 * 1.036;
  check("기존 공식은 걷기를 2배 과대계산했음", Math.round(oldFormula / walk), 2);
}

// --- 5. 경사 반영 ---------------------------------------------------------
{
  const flat = caloriesForDistance(5000, 30 * 60, 70, 0);
  const uphill = caloriesForDistance(5000, 30 * 60, 70, 0.10);
  check("오르막이 평지보다 많이 소모", uphill > flat, true);
  checkNear("10% 오르막 5km/30분", uphill, 508, 5);
}

// --- 6. MET 기반 (근력·맨몸 운동) ------------------------------------------
{
  // (MET - 1) × 3.5 × 체중 / 200 × 분
  // 스쿼트 5.0 MET, 70kg, 10분 → 4.0 × 3.5 × 70 / 200 × 10 = 49
  checkNear("스쿼트 10분 (70kg)", caloriesForMet(5.0, 70, 600), 49, 0.5);
  // 푸시업 8.0 MET, 70kg, 5분 → 7.0 × 3.5 × 70 / 200 × 5 = 42.875
  checkNear("푸시업 5분 (70kg)", caloriesForMet(8.0, 70, 300), 42.88, 0.5);

  check("시간 0이면 0", caloriesForMet(8.0, 70, 0), 0);
  check("MET 1 이하는 활동 칼로리 0", caloriesForMet(1.0, 70, 600), 0);

  // 체중이 크면 더 소모
  check("체중 비례", caloriesForMet(5.0, 100, 600) > caloriesForMet(5.0, 70, 600), true);
  // 같은 운동이라도 오래 하면 더 소모 (회당 고정값 방식의 한계 해소)
  check("시간 비례", caloriesForMet(5.0, 70, 1200) === caloriesForMet(5.0, 70, 600) * 2, true);
}

// --- 7. 운동별 MET 매핑 ----------------------------------------------------
{
  check("스쿼트 MET", metForExercise("squat"), 5.0);
  check("푸시업 MET", metForExercise("pushup"), 8.0);
  check("점핑잭 MET", metForExercise("jumpingjack"), 8.0);
  check("플랭크 MET", metForExercise("plank"), 3.8);
  check("알 수 없는 종목은 기본값", metForExercise("unknown"), 4.0);

  const allPositive = Object.values(EXERCISE_MET).every((v) => v > 1);
  check("모든 MET 값이 안정 시보다 큼", allPositive, true);
}

// --- 8. 잘못된 입력 방어 ---------------------------------------------------
{
  check("거리 0", caloriesForDistance(0, 600, 70), 0);
  check("시간 0", caloriesForDistance(1000, 0, 70), 0);
  check("음수 거리", caloriesForDistance(-100, 600, 70), 0);
  check("숫자가 아닌 입력", caloriesForMet("abc", 70, 600), 0);
}

console.log(failed === 0 ? "\n✅ ALL PASS" : `\n❌ ${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
