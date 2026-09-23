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

// ==========================================
// Health Connect 연동 패시브 성장 (Passive Growth) 로직
// ==========================================

/**
 * 일일 걷기(걸음수) 패시브 칼로리 소모 계산
 * 보폭 약 0.7m, 시속 4~5km 수준의 일상 걷기로 간주 (약 3.0 MET 적용)
 */
export function caloriesForPassiveSteps(steps, weightKg) {
  const w = Number(weightKg) || 70;
  const s = Number(steps) || 0;
  if (s <= 0) return 0;
  
  // 1보 = 0.7m 가정 -> 전체 이동 거리(m)
  const distanceM = s * 0.7;
  // 시속 4.5km(초속 1.25m)로 걸었다고 가정 -> 소요 시간(초)
  const seconds = distanceM / 1.25;
  
  // MET 3.0(일상적인 걷기)을 적용
  return caloriesForMet(3.0, w, seconds);
}

/**
 * 수면 시간에 따른 멘탈(Spirit) 회복 보너스 산출
 * 7시간(420분) 기준선으로 초과 시 보너스 비율 제공
 */
export function mentalRecoveryFromSleep(sleepMinutes) {
  const min = Number(sleepMinutes) || 0;
  if (min < 300) return 0.5; // 5시간 미만: 페널티(절반 회복)
  if (min >= 420) return 1.2; // 7시간 이상: 보너스(120% 회복)
  return 1.0; // 기본 회복
}

/**
 * 다차원 생체 데이터(HRV, HR, 수면)를 종합하여 다마고치의 컨디션(상태 이상) 결정
 * - HRV가 낮거나 수면이 부족하면 Sick(질병) 또는 Tired(피로) 상태가 됨
 */
export function calculateTamagotchiStatus(sleepMinutes, avgHrv, avgHr) {
  const sleep = Number(sleepMinutes) || 420;
  const hrv = Number(avgHrv) || 45;
  const hr = Number(avgHr) || 72;

  // 스트레스(낮은 HRV + 높은 안정시 심박수) 또는 극단적 수면 부족
  if (hrv < 25 && hr > 85) return 'sick'; 
  if (sleep < 240) return 'sick';
  
  if (hrv < 35 || sleep < 300) return 'tired';

  return 'normal';
}
