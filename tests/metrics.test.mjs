// app.js에서 분리한 순수 계산 함수 검증
// 분리 전 동작을 그대로 고정하는 것이 목적입니다(리팩터링 회귀 방지).
import { calcBmi, bmiLabel, calcBmr, parsePaceToSeconds, calcRunCoins } from "../metrics.js";

let failed = 0;
function check(label, actual, expected) {
  const ok = actual === expected;
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"} | ${label} | got=${actual} want=${expected}`);
}

// --- BMI ------------------------------------------------------------------
{
  check("175cm 70kg", calcBmi(175, 70), 22.9);
  check("160cm 50kg", calcBmi(160, 50), 19.5);
  check("180cm 95kg", calcBmi(180, 95), 29.3);
  // 문자열 입력도 숫자로 처리되어야 합니다(입력 폼에서 문자열로 들어옵니다).
  check("문자열 입력 처리", calcBmi("175", "70"), 22.9);
  // 값이 비면 기본값(175/70)으로 계산합니다.
  check("빈 값 → 기본값", calcBmi(null, undefined), 22.9);
  check("0 입력 → 기본값", calcBmi(0, 0), 22.9);
  check("NaN 입력 → 기본값", calcBmi(NaN, NaN), 22.9);
}

// --- BMI 라벨 경계값 ------------------------------------------------------
{
  check("18.4 저체중", bmiLabel(18.4), "저체중");
  check("18.5 정상", bmiLabel(18.5), "정상");
  check("23.0 정상", bmiLabel(23.0), "정상");
  check("23.1 과체중", bmiLabel(23.1), "과체중");
  check("25.0 과체중", bmiLabel(25.0), "과체중");
  check("25.1 비만", bmiLabel(25.1), "비만");
}

// --- BMR ------------------------------------------------------------------
{
  // Mifflin-St Jeor: 10w + 6.25h - 5a + (남 +5 / 여 -161)
  check("남성 175cm 70kg 30세", calcBmr(175, 70, 30, "M"), Math.round(700 + 1093.75 - 150 + 5));
  check("여성 160cm 55kg 28세", calcBmr(160, 55, 28, "F"), Math.round(550 + 1000 - 140 - 161));
  // "F"가 아닌 모든 값은 남성으로 처리하는 기존 동작을 유지합니다.
  check("성별 미지정은 남성 계수", calcBmr(175, 70, 30, undefined), calcBmr(175, 70, 30, "M"));
  check("소문자 f는 남성 계수(기존 동작)", calcBmr(175, 70, 30, "f"), calcBmr(175, 70, 30, "M"));
  check("나이 미입력 → 30세", calcBmr(175, 70, 0, "M"), calcBmr(175, 70, 30, "M"));
}

// --- 페이스 문자열 파싱 ---------------------------------------------------
{
  check("5'03\" → 303초", parsePaceToSeconds("5'03\""), 303);
  check("6'00\" → 360초", parsePaceToSeconds("6'00\""), 360);
  check("12'45\" → 765초", parsePaceToSeconds("12'45\""), 765);
  // 거리가 짧아 페이스를 못 구한 경우 기본 6분으로 처리해야 합니다.
  check("--'--\" → 360초(기본)", parsePaceToSeconds(`--'--"`), 360);
  check("null → 360초(기본)", parsePaceToSeconds(null), 360);
  check("빈 문자열 → 360초(기본)", parsePaceToSeconds(""), 360);
  check("형식 깨짐 → 360초(기본)", parsePaceToSeconds("abc"), 360);
}

// --- 러닝 코인 보상 -------------------------------------------------------
{
  check("1km → 20 VC", calcRunCoins(1), 20);
  check("5.5km → 110 VC", calcRunCoins(5.5), 110);
  check("0.33km → 7 VC(반올림)", calcRunCoins(0.33), 7);
  check("0km → 0 VC", calcRunCoins(0), 0);
  // 음수 거리로 코인이 깎이면 안 됩니다.
  check("음수 거리 → 0 VC", calcRunCoins(-10), 0);
  check("잘못된 입력 → 0 VC", calcRunCoins("abc"), 0);
}

console.log(failed === 0 ? "\n✅ ALL PASS" : `\n❌ ${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
