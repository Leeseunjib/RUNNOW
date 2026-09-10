// 운동 에너지 소비 표준 계산 (ACSM 대사 방정식 + Compendium MET)
//
// 나이키·삼성·애플 등 상용 운동앱이 공통으로 기반하는 공개 표준입니다.
// 자체 보정 계수 대신 이 표준을 쓰면 검증 가능하고, 걷기·달리기·경사를 구분할 수 있습니다.
//
// 출처
// - ACSM 대사 방정식 (달리기·걷기 VO2 추정)
// - Compendium of Physical Activities (MET 값)

// 산소 1리터당 약 5kcal. 운동생리학 표준 환산값입니다.
const KCAL_PER_LITER_O2 = 5;

// 안정 시 산소 소비량. 1 MET = 3.5 ml/kg/min.
export const RESTING_VO2 = 3.5;

// 이 속도 미만은 걷기, 이상은 달리기 방정식을 씁니다.
// ACSM은 달리기 방정식을 약 8km/h 이상에 적용하지만, 조깅 구간(5~8km/h)에서도
// 실제로 뛰는 경우가 많아 7km/h를 경계로 둡니다.
const RUN_THRESHOLD_KMH = 7;

// 운동별 MET (Compendium of Physical Activities)
// - 칼리스테닉스 고강도(푸시업·싯업·풀업·점핑잭): 8.0
// - 칼리스테닉스 중강도(런지 포함): 3.8
// - 스쿼트: 5.0
export const EXERCISE_MET = {
  squat: 5.0,
  pushup: 8.0,
  situp: 8.0,
  jumpingjack: 8.0,
  plank: 3.8,
  lunge: 4.0
};

// 달리기 VO2 (ml/kg/min). speed는 m/min, grade는 경사 비율(0.05 = 5%).
// 0.2 = 수평 이동의 산소 비용, 0.9 = 중력을 거스르는 수직 이동 비용
export function runningVo2(speedMPerMin, grade = 0) {
  return 0.2 * speedMPerMin + 0.9 * speedMPerMin * grade + RESTING_VO2;
}

// 걷기 VO2. 같은 거리라도 달리기의 절반 수준입니다.
// 0.1 = 수평 이동 비용, 1.8 = 수직 이동 비용
export function walkingVo2(speedMPerMin, grade = 0) {
  return 0.1 * speedMPerMin + 1.8 * speedMPerMin * grade + RESTING_VO2;
}

// 속도에 따라 걷기/달리기 방정식을 자동 선택합니다.
export function vo2ForSpeed(speedKmh, grade = 0) {
  const speed = Number(speedKmh);
  if (!Number.isFinite(speed) || speed <= 0) return RESTING_VO2;
  const mPerMin = (speed * 1000) / 60;
  return speed < RUN_THRESHOLD_KMH
    ? walkingVo2(mPerMin, grade)
    : runningVo2(mPerMin, grade);
}

// 활동 칼로리(active energy). 안정 시 대사량을 뺀 "운동으로 추가 소비한" 양입니다.
// 애플·삼성이 보여주는 값도 이 기준입니다.
export function activeCaloriesFromVo2(vo2, weightKg, minutes) {
  const w = Number(weightKg) || 70;
  const min = Number(minutes);
  if (!Number.isFinite(min) || min <= 0) return 0;
  const net = Math.max(0, vo2 - RESTING_VO2);
  return (net * w) / 1000 * KCAL_PER_LITER_O2 * min;
}

// 이동 기록으로부터 활동 칼로리를 구합니다.
// 거리만으로 계산하면 걷기와 달리기가 같아지므로 시간을 함께 받습니다.
export function caloriesForDistance(distanceMeters, seconds, weightKg, grade = 0) {
  const meters = Number(distanceMeters) || 0;
  const sec = Number(seconds) || 0;
  if (meters <= 0 || sec <= 0) return 0;

  const speedKmh = (meters / 1000) / (sec / 3600);
  const vo2 = vo2ForSpeed(speedKmh, grade);
  return activeCaloriesFromVo2(vo2, weightKg, sec / 60);
}

// MET 기반 활동 칼로리. 근력·맨몸 운동처럼 이동 거리가 없는 종목에 씁니다.
// 안정 시 대사량(1 MET)을 빼서 활동분만 계산합니다.
export function caloriesForMet(met, weightKg, seconds) {
  const m = Number(met);
  const sec = Number(seconds) || 0;
  if (!Number.isFinite(m) || m <= 0 || sec <= 0) return 0;
  const w = Number(weightKg) || 70;
  const netMet = Math.max(0, m - 1);
  return netMet * 3.5 * w / 200 * (sec / 60);
}

export function metForExercise(exerciseId) {
  return EXERCISE_MET[exerciseId] ?? 4.0;
}
