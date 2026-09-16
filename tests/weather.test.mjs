// 날씨 위젯이 "지금 여기"를 말하는지 검증
//
// 실제 사고. 부천에서 앱을 열었는데 폰 날씨 앱과 기온이 달랐습니다. 원인이 네 겹이었습니다.
//   1) 캐시 키에 좌표가 없어 직전에 본 수원 날씨가 15분간 현재 위치로 표시됨
//   2) 타임존이 Asia/Tokyo로 박혀 있어 시간 경계가 밀림
//   3) 강수확률이 hourly[0](오늘 0시) 값이라 한낮에 자정 확률을 보여줌
//   4) API가 실패하면 "20.5℃ 맑음 · 95점 골든 아워"를 실측처럼 표시
// 아래 검사는 네 겹을 각각 붙잡아 둡니다.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

let failed = 0;
function check(label, actual, expected) {
  const ok = actual === expected;
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"} | ${label} | got=${actual} want=${expected}`);
}

// weatherService.js는 브라우저 스크립트라 localStorage를 먼저 흉내내야 로드됩니다.
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k)
};

require("../weatherService.js");
const svc = globalThis.WeatherService;
const src = readFileSync(new URL("../weatherService.js", import.meta.url), "utf8");
const htmlSrc = readFileSync(new URL("../index.html", import.meta.url), "utf8");

// --- 1. 캐시가 좌표를 구분한다 ---------------------------------------------
// 좌표를 안 보면 도시를 바꿔도 캐시 TTL이 끝날 때까지 이전 도시 날씨가 남습니다.
{
  const suwon = { lat: 37.2636, lon: 127.0286 };
  const bucheon = { lat: 37.5035, lon: 126.7660 };

  check("좌표가 다르면 캐시 키도 다름", svc.cacheKeyFor(suwon) !== svc.cacheKeyFor(bucheon), true);

  svc.saveCachedData({ lat: suwon.lat, lon: suwon.lon, temp: 31.0, locationName: "경기/수원" });
  check("다른 좌표에서 조회하면 캐시 미적용", svc.getCachedData(bucheon), null);

  const hit = svc.getCachedData(suwon);
  check("같은 좌표에서는 캐시 적용", hit && hit.temp, 31.0);

  // GPS가 몇 미터 흔들릴 때마다 재조회하면 배터리와 호출량만 낭비합니다.
  check("1km 이내 미세 이동은 같은 키", svc.cacheKeyFor({ lat: 37.2638, lon: 127.0289 }), svc.cacheKeyFor(suwon));
}

// --- 2. 강수확률이 현재 시각 값이다 ---------------------------------------
// hourly 배열 0번은 오늘 0시입니다. 그 값으로 러닝 지수를 깎으면 안 됩니다.
{
  const times = ["2026-09-16T00:00", "2026-09-16T01:00", "2026-09-16T17:00"];
  const values = [80, 70, 5];

  check("현재 시각과 같은 시간대의 값을 고름", svc.pickCurrentHourValue(times, values, "2026-09-16T17:00"), 5);
  check("일치 항목이 없으면 첫 값으로 폴백", svc.pickCurrentHourValue(times, values, "2026-09-17T09:00"), 80);
  check("배열이 비면 0", svc.pickCurrentHourValue([], [], "2026-09-16T17:00"), 0);
  check("배열이 없으면 0", svc.pickCurrentHourValue(undefined, undefined, "2026-09-16T17:00"), 0);
}

// --- 3. 타임존이 한국이다 --------------------------------------------------
{
  check("Asia/Tokyo 잔존 없음", /Asia(%2F|\/)Tokyo/.test(src), false);
  check("Asia/Seoul 사용", /Asia(%2F|\/)Seoul/.test(src), true);
}

// --- 4. 실측이 없으면 숫자를 지어내지 않는다 -------------------------------
// 비 오는 날에 "골든 아워 95점"을 보고 나간 사용자는 앱을 다시 믿지 않습니다.
{
  const fb = svc.getFallbackData();
  check("폴백은 실측이라고 주장하지 않음", fb.isLive, false);
  check("폴백 기온은 빈 값", fb.temp, null);
  check("폴백 러닝 점수는 빈 값", fb.runningIndex.score, null);
  check("폴백 미세먼지는 빈 값", fb.airQuality.pm10, null);
  check("폴백에 '골든' 표현 없음", /골든/.test(JSON.stringify(fb)), false);
  check("폴백이 연결 실패를 알림", /연결|확인/.test(fb.coachingBriefing.message), true);
}

// --- 5. 지명은 조회로 얻고, 구간 추정은 폴백일 때만 쓴다 -------------------
// 위경도 구간만으로는 "수도권/경기"까지가 한계입니다. 폰 날씨가 동 이름을
// 말하는 옆에 두면 앱이 위치를 못 잡은 것처럼 보입니다.
{
  check("지명 역조회 함수 존재", typeof svc.reverseGeocode, "function");
  check("GPS 경로에서 역조회를 먼저 씀", /await this\.reverseGeocode\(/.test(src), true);

  // 서울 서쪽 경계가 약 126.76입니다. 기존 126.8 기준에서는 강서구·부천이 탈락해
  // 구간 판별이 통째로 빈손이 됐습니다.
  const bucheon = svc.guessKoreanLocationName(37.5035, 126.7660);
  check("부천 좌표가 수도권으로 잡힘", /서울권|수도권/.test(String(bucheon)), true);
  check("서울 시청 좌표도 유지", /서울권/.test(String(svc.guessKoreanLocationName(37.5665, 126.9780))), true);
}

// --- 6. 화면 표기가 사실과 맞다 -------------------------------------------
{
  // 격자 예보 보간값에 "표준관측소"를 붙이면 없는 권위를 만드는 표기입니다.
  check("'표준관측소' 표기 제거", htmlSrc.includes("표준관측소"), false);

  // GPS로 전환됐는데 목록에 항목이 없으면 사용자가 되돌릴 방법이 없습니다.
  check("드롭다운에 현재 위치 항목", /value="custom_gps"/.test(htmlSrc), true);
  check("드롭다운을 실제 조회 위치와 동기화", htmlSrc.includes("syncWeatherCitySelect"), true);
  check("GPS 선택이 재측정으로 연결됨", /cityKey === 'custom_gps'/.test(htmlSrc), true);
}

// --- 7. 부분 실패를 부분적으로만 인정한다 ----------------------------------
// 두 API를 따로 부릅니다. 한쪽만 죽었을 때 나머지를 버리거나, 죽은 쪽을
// 기본값으로 메우는 것 둘 다 문제입니다. 특히 대기질을 "좋음"으로 단정하면
// 미세먼지 나쁜 날에 사용자를 밖으로 내보냅니다.
{
  const okRes = (json) => ({ ok: true, json: async () => json });
  const weatherJson = {
    current: {
      time: "2026-09-16T17:00",
      temperature_2m: 26.4,
      apparent_temperature: 27.1,
      relative_humidity_2m: 61,
      precipitation: 0,
      weather_code: 0,
      wind_speed_10m: 2.4
    },
    hourly: { time: ["2026-09-16T00:00", "2026-09-16T17:00"], precipitation_probability: [70, 5] }
  };

  const origFetch = globalThis.fetch;
  svc.currentCoords = { name: "경기도 부천시 원미동", lat: 37.5035, lon: 126.7660, isGps: true };

  // (1) 대기질만 실패
  globalThis.fetch = async (url) => (String(url).includes("air-quality") ? { ok: false } : okRes(weatherJson));
  {
    const d = await svc.fetchRealTimeWeather(true);
    check("기상만 살아 있으면 실측으로 인정", d.isLive, true);
    check("기온은 실측값", d.temp, 26.4);
    check("강수확률은 현재 시각 값", d.precipProb, 5);
    check("대기질은 '좋음'으로 단정하지 않음", d.airQuality.grade, "unknown");
    check("대기질 수치는 빈 값", d.airQuality.pm10, null);
    check("GPS 기준임을 표시", d.isGps, true);
  }

  // (2) 기상이 실패하면 수치를 지어내지 않는다
  // 직전 성공분이 캐시에 남아 있으면 그 값을 보여주는 것이 맞습니다.
  // 여기서 검증하려는 건 "실패 자체를 캐시에 쓰지 않는가"라서 캐시를 비우고 시작합니다.
  store.clear();
  globalThis.fetch = async () => ({ ok: false });
  {
    const d = await svc.fetchRealTimeWeather(true);
    check("기상 실패는 실측이 아님", d.isLive, false);
    check("기상 실패 시 기온 빈 값", d.temp, null);
    check("기상 실패 시 지명은 유지", d.locationName, "경기도 부천시 원미동");

    // 실패를 캐시에 넣으면 네트워크가 돌아와도 15분간 복구되지 않습니다.
    check("실패는 캐시에 남기지 않음", svc.getCachedData(svc.currentCoords), null);
  }

  globalThis.fetch = origFetch;
}

console.log(failed === 0 ? "\n✅ ALL PASS" : `\n❌ ${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
