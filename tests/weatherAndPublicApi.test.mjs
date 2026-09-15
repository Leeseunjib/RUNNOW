/**
 * weatherAndPublicApi.test.mjs
 * 기상청 실시간 날씨·미세먼지 지수 및 식약처 공공 API 실시간 Fallback 단위 테스트
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import vm from "vm";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// DOM & LocalStorage Mock
const mockStorage = {};
const mockLocalStorage = {
  getItem: (k) => mockStorage[k] || null,
  setItem: (k, v) => { mockStorage[k] = String(v); },
  removeItem: (k) => { delete mockStorage[k]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
};

const sandbox = {
  window: {},
  localStorage: mockLocalStorage,
  console: console,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  fetch: async () => ({ ok: false }),
  navigator: { geolocation: null },
  Date: Date,
  Math: Math,
  JSON: JSON,
  Array: Array,
  String: String,
  Number: Number,
  Promise: Promise
};

vm.createContext(sandbox);

// 1. dietData.js 로드
const dietDataCode = readFileSync(resolve(__dirname, "../dietData.js"), "utf8");
vm.runInContext(dietDataCode, sandbox);

// 2. weatherService.js 로드
const weatherCode = readFileSync(resolve(__dirname, "../weatherService.js"), "utf8");
vm.runInContext(weatherCode, sandbox);

// 3. publicApiService.js 로드
const publicApiCode = readFileSync(resolve(__dirname, "../publicApiService.js"), "utf8");
vm.runInContext(publicApiCode, sandbox);

const WeatherService = sandbox.window.WeatherService || sandbox.WeatherService;
const PublicApiService = sandbox.window.PublicApiService || sandbox.PublicApiService;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  } else {
    console.log(`PASS | ${message}`);
  }
}

console.log("=== RUNNOW Weather & Public API Unit Test ===");

// 1. WeatherService 인스턴스 검증
assert(!!WeatherService, "WeatherService 싱글톤 인스턴스 정상 초기화");

// 2. 대기질 등급(Air Grade) 평가 로직 검증 (환경부 기준)
const goodAir = WeatherService.evaluateAirGrade(20, 10);
assert(goodAir.grade === "good" && goodAir.label.includes("좋음"), "미세먼지 청정 구간 평가: 좋음 🟢");

const normalAir = WeatherService.evaluateAirGrade(55, 25);
assert(normalAir.grade === "normal" && normalAir.label.includes("보통"), "미세먼지 보통 구간 평가: 보통 🟡");

const badAir = WeatherService.evaluateAirGrade(110, 45);
assert(badAir.grade === "bad" && badAir.label.includes("나쁨"), "미세먼지 위험 구간 평가: 나쁨 🔴");

// 3. 러닝 쾌적 지수 (Running Index) 계산 검증
// 최적 조건: 기온 18℃, 습도 50%, 맑음(+10), 강수 0, 미세먼지 0 감점
const goldenIndex = WeatherService.calculateRunningIndex({
  temp: 18,
  humidity: 50,
  weatherScoreMod: 10,
  precipitation: 0,
  precipProb: 0,
  airPenalty: 0
});
assert(goldenIndex.score >= 90, `골든 러닝 조건 점수 90점 이상 획득 (got=${goldenIndex.score})`);
assert(goldenIndex.level === "golden", "골든 등급 레이블 판정 완료");

// 극한 조건: 기온 33℃ (폭염 -30), 비 내림(-25), 미세먼지 나쁨(-30)
const badConditionIndex = WeatherService.calculateRunningIndex({
  temp: 33,
  humidity: 85,
  weatherScoreMod: -40,
  precipitation: 5.0,
  precipProb: 80,
  airPenalty: -30
});
assert(badConditionIndex.score <= 50, `악천후 감점 로직 검증 (got=${badConditionIndex.score})`);
assert(badConditionIndex.level === "caution", "실내 권장 주의 등급 판정");

// 4. AI 코치 날씨 반응형 브리핑 (소비자 심리학 핑계 격파)
const rainBriefing = WeatherService.generateCoachingBriefing(
  badConditionIndex,
  { temperature_2m: 16, precipitation: 2.5, weather_code: 61, apparent_temperature: 15 },
  normalAir,
  { label: "약한 비", icon: "🌧️" }
);
assert(rainBriefing.coach === "루나", "우천 시 루나(실내 모션 코치) 자동 전환 브리핑");
assert(rainBriefing.message.includes("실내"), "우천 시 실내 룸트레이닝 권유 메시지 포함");

const goldenBriefing = WeatherService.generateCoachingBriefing(
  goldenIndex,
  { temperature_2m: 19, precipitation: 0, weather_code: 0, apparent_temperature: 18.5 },
  goodAir,
  { label: "맑음", icon: "☀️" }
);
assert(goldenBriefing.coach === "레오", "골든 러닝 조건 시 레오(수석 러닝 코치) 브리핑");
assert(goldenBriefing.badge.includes("골든"), "골든 아워 동기부여 배지 생성");

// 5. PublicApiService 식약처 공공데이터 하이브리드 검색 검증
(async () => {
  assert(!!PublicApiService, "PublicApiService 싱글톤 인스턴스 정상 초기화");

  // 로컬 기본 식품 검색
  const chickenResults = await PublicApiService.searchFood("닭가슴살");
  assert(chickenResults.length > 0, "로컬 DB 식품 '닭가슴살' 정상 검색");

  // 공공데이터포털 확장셋 실시간 Fallback 검색
  const ramenResults = await PublicApiService.searchFood("신라면 컵라면");
  assert(ramenResults.length > 0, "공공데이터 확장셋 '신라면 컵라면' 실시간 Fallback 검색 성공");
  assert(ramenResults[0].source === "식약처 공공데이터포털", "식약처 공공데이터포털 출처 태그 확인");

  // 스타벅스 음료 공공 DB 검색 및 자동 캐싱 검증
  const cafeResults = await PublicApiService.searchFood("자몽 허니 블랙 티");
  assert(cafeResults.length > 0, "공공 DB 프랜차이즈 '자몽 허니 블랙 티' 실시간 검색 성공");
  assert(cafeResults[0].calories === 125, "식약처 공인 칼로리(125kcal) 일치");

  console.log("\n✅ ALL WEATHER & PUBLIC API UNIT TESTS PASSED (100%)\n");
})();
