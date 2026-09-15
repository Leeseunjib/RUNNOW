// 신체 지수 및 러닝 보상 계산 (DOM·상태에 의존하지 않는 순수 함수 모음)
// app.js에서 분리해 단위 테스트가 가능하도록 만든 모듈입니다.
// 기존 동작을 그대로 옮긴 것이며, app.js의 동명 메서드는 이 함수들을 위임 호출합니다.

// 체질량지수. 값이 비었거나 숫자가 아니면 기본 신장 175cm / 체중 70kg으로 계산합니다.
export function calcBmi(heightCm, weightKg) {
  const h = Number(heightCm) || 175;
  const w = Number(weightKg) || 70;
  return parseFloat((w / ((h / 100) * (h / 100))).toFixed(1));
}

export function bmiLabel(bmi) {
  if (bmi < 18.5) return "저체중";
  if (bmi <= 23) return "정상";
  if (bmi <= 25) return "과체중";
  return "비만";
}

// 기초대사량 (Mifflin-St Jeor). 성별이 정확히 "F"일 때만 여성 계수를 적용합니다.
export function calcBmr(heightCm, weightKg, age, gender) {
  const h = Number(heightCm) || 175;
  const w = Number(weightKg) || 70;
  const a = Number(age) || 30;
  return Math.round(10 * w + 6.25 * h - 5 * a + (gender === "F" ? -161 : 5));
}

// 화면용 페이스 문자열("5'03\"")을 초 단위로 되돌립니다.
// 거리가 짧아 페이스를 못 구한 경우 GPSRunner는 `--'--"`를 주므로,
// 그때는 기본 페이스 6분(360초)으로 처리합니다.
export function parsePaceToSeconds(paceStr) {
  const parts = String(paceStr == null ? "" : paceStr).replace('"', "").split("'");
  const min = parseInt(parts[0], 10) || 6;
  const sec = parseInt(parts[1], 10) || 0;
  return min * 60 + sec;
}

// 러닝 완주 시 지급하는 볼트코인 (1km당 20 VC)
export function calcRunCoins(distanceKm) {
  const km = Number(distanceKm) || 0;
  return Math.round(Math.max(0, km) * 20);
}
