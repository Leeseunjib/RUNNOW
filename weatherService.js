/**
 * weatherService.js
 * 대한민국 기상청(KMA) & 에어코리아(한국환경공단) 및 글로벌 공공 기상망 연동
 * RUNNOW 실시간 러닝 기상·체감온도·미세먼지 지수 및 AI 코치 브리핑 서비스
 * 
 * [소비자 심리학 렌즈]
 * - 핑계 차단(Excuse Elimination): "오늘 뛸까 말까" 망설이는 유저에게 공인 기상 데이터로 즉각적 당위성 부여
 * - 인지적 안도감(Cognitive Ease): 미세먼지/기온 신호등 표시로 고민 없이 1초 만에 러닝 결심 유도
 * - 맥락 반응형 코칭(Contextual Authority): 비/폭염/미세먼지 나쁨 시 실내 모드로 스마트 전환
 */

(function(global) {
  const STORAGE_KEY = "RUNNOW_WEATHER_CACHE";
  const CACHE_TTL_MS = 15 * 60 * 1000; // 15분 캐싱 (배터리 및 트래픽 절약)

  // 대한민국 주요 도시 기본 좌표 프리셋
  const CITY_PRESETS = {
    seoul: { name: "서울", lat: 37.5665, lon: 126.9780 },
    gyeonggi: { name: "경기/수원", lat: 37.2636, lon: 127.0286 },
    incheon: { name: "인천", lat: 37.4563, lon: 126.7052 },
    busan: { name: "부산", lat: 35.1796, lon: 129.0756 },
    daegu: { name: "대구", lat: 35.8714, lon: 128.6014 },
    gwangju: { name: "광주", lat: 35.1595, lon: 126.8526 },
    daejeon: { name: "대전", lat: 36.3504, lon: 127.3845 },
    ulsan: { name: "울산", lat: 35.5384, lon: 129.3114 },
    jeju: { name: "제주", lat: 33.4996, lon: 126.5312 },
    gangwon: { name: "강원/춘천", lat: 37.8813, lon: 127.7298 }
  };

  // WMO 기상 코드 매핑 (기상청 표준 날씨 상태)
  const WMO_WEATHER_MAP = {
    0: { label: "맑음", icon: "☀️", runningScoreMod: 10 },
    1: { label: "대체로 맑음", icon: "🌤️", runningScoreMod: 8 },
    2: { label: "구름 조금", icon: "⛅", runningScoreMod: 5 },
    3: { label: "흐림", icon: "☁️", runningScoreMod: 2 },
    45: { label: "안개", icon: "🌫️", runningScoreMod: -10 },
    48: { label: "서리 안개", icon: "🌫️", runningScoreMod: -15 },
    51: { label: "이슬비", icon: "🌦️", runningScoreMod: -20 },
    53: { label: "가벼운 비", icon: "🌧️", runningScoreMod: -30 },
    55: { label: "비", icon: "🌧️", runningScoreMod: -40 },
    61: { label: "약한 비", icon: "🌧️", runningScoreMod: -30 },
    63: { label: "비", icon: "🌧️", runningScoreMod: -50 },
    65: { label: "강한 비", icon: "⛈️", runningScoreMod: -70 },
    71: { label: "약한 눈", icon: "🌨️", runningScoreMod: -30 },
    73: { label: "눈", icon: "❄️", runningScoreMod: -45 },
    75: { label: "강한 눈", icon: "☃️", runningScoreMod: -65 },
    80: { label: "소나기", icon: "🌦️", runningScoreMod: -40 },
    81: { label: "강한 소나기", icon: "⛈️", runningScoreMod: -60 },
    95: { label: "뇌우", icon: "⚡", runningScoreMod: -80 }
  };

  class WeatherService {
    constructor() {
      this.currentCity = "seoul";
      this.currentCoords = { ...CITY_PRESETS.seoul };
      this.weatherData = null;
      this.listeners = [];
      this.init();
    }

    init() {
      const cached = this.getCachedData();
      if (cached) {
        this.weatherData = cached;
      }
    }

    // 실제 행정동 이름을 받아옵니다. 키가 필요 없는 공개 엔드포인트를 씁니다.
    // 위경도 구간 판별만으로는 "수도권/경기"까지가 한계라, 폰 날씨가 "원미동"이라고
    // 말하는 것과 나란히 두면 앱이 위치를 못 잡은 것처럼 보입니다.
    async reverseGeocode(lat, lon) {
      try {
        const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=ko`;
        const res = await fetch(url);
        if (!res.ok) return null;
        const j = await res.json();
        // 동 > 시/군/구 > 시도 순으로 가장 좁은 이름을 씁니다.
        const dong = j.locality || "";
        const city = j.city || j.principalSubdivision || "";
        if (dong && city && dong !== city) return `${city} ${dong}`;
        return dong || city || null;
      } catch (e) {
        console.warn("[WeatherService] 지명 조회 실패, 좌표 구간 추정으로 대체:", e);
        return null;
      }
    }

    // 캐시는 좌표까지 같이 봐야 합니다. 시간만 보면 직전에 조회한 다른 도시의
    // 날씨가 최대 15분간 현재 위치의 날씨로 표시됩니다. 실제로 부천에서 앱을 열면
    // 수원 기온이 떠 있었습니다.
    cacheKeyFor(coords) {
      const lat = Number(coords && coords.lat);
      const lon = Number(coords && coords.lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) return "unknown";
      // 소수 2자리(약 1km)면 같은 동네로 봅니다. GPS가 미세하게 흔들려도 재조회하지 않습니다.
      return `${lat.toFixed(2)},${lon.toFixed(2)}`;
    }

    getCachedData(coords = this.currentCoords) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (parsed.key !== this.cacheKeyFor(coords)) return null;
        if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
          return parsed.data;
        }
      } catch (e) {
        console.warn("[WeatherService] 캐시 파싱 실패:", e);
      }
      return null;
    }

    saveCachedData(data) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          key: this.cacheKeyFor(data),
          timestamp: Date.now(),
          data: data
        }));
      } catch (e) {
        console.warn("[WeatherService] 캐시 저장 실패:", e);
      }
    }

    /**
     * 유저 GPS 위치 감지 및 실제 지명(한국 도시/동네) 자동 추정
     */
    async detectLocation() {
      return new Promise((resolve) => {
        if (!navigator.geolocation) {
          console.warn("[WeatherService] Geolocation 미지원, 서울 좌표 사용");
          resolve(this.currentCoords);
          return;
        }

        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const lat = parseFloat(pos.coords.latitude.toFixed(4));
            const lon = parseFloat(pos.coords.longitude.toFixed(4));
            const placeName = await this.reverseGeocode(lat, lon);

            this.currentCoords = {
              name: placeName || this.guessKoreanLocationName(lat, lon),
              lat: lat,
              lon: lon,
              isGps: true
            };
            this.currentCity = "custom_gps";
            resolve(this.currentCoords);
          },
          (err) => {
            console.warn("[WeatherService] GPS 획득 실패, 기본 서울 좌표 사용:", err.message);
            resolve(this.currentCoords);
          },
          { timeout: 5000, maximumAge: 300000, enableHighAccuracy: true }
        );
      });
    }

    /**
     * 지명 조회가 실패했을 때만 쓰는 위경도 구간 근사 판별.
     * 구간 경계는 임의값이라 동 단위로는 믿을 수 없습니다. 지명 조회를 먼저 시도합니다.
     */
    guessKoreanLocationName(lat, lon) {
      // 서울 서쪽 경계가 약 126.76이라 기존 126.8 기준에서는 강서구·부천이 탈락했습니다.
      if (lat >= 37.4 && lat <= 37.7 && lon >= 126.75 && lon <= 127.2) {
        return "현재 위치 (서울권 GPS)";
      } else if (lat >= 37.1 && lat <= 37.9 && lon >= 126.5 && lon <= 127.8) {
        return "현재 위치 (수도권/경기 GPS)";
      } else if (lat >= 35.0 && lat <= 35.4 && lon >= 128.9 && lon <= 129.3) {
        return "현재 위치 (부산권 GPS)";
      } else if (lat >= 35.7 && lat <= 36.0 && lon >= 128.4 && lon <= 128.8) {
        return "현재 위치 (대구권 GPS)";
      } else if (lat >= 36.2 && lat <= 36.5 && lon >= 127.2 && lon <= 127.5) {
        return "현재 위치 (대전/세종 GPS)";
      } else if (lat >= 35.1 && lat <= 35.3 && lon >= 126.7 && lon <= 127.0) {
        return "현재 위치 (광주권 GPS)";
      } else if (lat >= 33.1 && lat <= 33.6 && lon >= 126.1 && lon <= 126.9) {
        return "현재 위치 (제주도 GPS)";
      }
      return `현재 위치 (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`;
    }


    setCity(cityKey) {
      if (CITY_PRESETS[cityKey]) {
        this.currentCity = cityKey;
        this.currentCoords = { ...CITY_PRESETS[cityKey] };
        return this.fetchRealTimeWeather(true);
      }
      return Promise.reject(new Error("존재하지 않는 도시 프리셋"));
    }

    // 시간별 배열에서 현재 시각에 해당하는 값을 고릅니다.
    // 시각 문자열은 API가 요청한 타임존으로 돌려주므로, 기기 시계와 무관하게
    // API가 알려준 현재 시각을 기준으로 맞추는 편이 안전합니다.
    pickCurrentHourValue(times, values, currentTime) {
      if (!Array.isArray(times) || !Array.isArray(values) || values.length === 0) return 0;
      if (currentTime) {
        const hourKey = String(currentTime).slice(0, 13);   // YYYY-MM-DDTHH
        const idx = times.findIndex((t) => String(t).slice(0, 13) === hourKey);
        if (idx >= 0 && Number.isFinite(values[idx])) return values[idx];
      }
      return Number.isFinite(values[0]) ? values[0] : 0;
    }

    /**
     * 공공 실시간 기상청 및 대기질 API 하이브리드 호출
     * @param {boolean} forceRefresh - 캐시 무시 강제 갱신
     */
    async fetchRealTimeWeather(forceRefresh = false) {
      if (!forceRefresh) {
        const cached = this.getCachedData();
        if (cached) {
          this.weatherData = cached;
          this.notifyListeners();
          return cached;
        }
      }

      const { lat, lon, name } = this.currentCoords;

      try {
        // 1. 기상청/Open-Meteo 고정밀 실시간 기상 데이터 호출
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&hourly=precipitation_probability&timezone=Asia%2FSeoul`;

        // 2. 에어코리아/공공 대기질 데이터 호출 (PM10, PM2.5)
        const airUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5,european_aqi&timezone=Asia%2FSeoul`;

        const [weatherRes, airRes] = await Promise.all([
          fetch(weatherUrl).catch(e => null),
          fetch(airUrl).catch(e => null)
        ]);

        let weatherJson = weatherRes && weatherRes.ok ? await weatherRes.json() : null;
        let airJson = airRes && airRes.ok ? await airRes.json() : null;

        // 실측을 못 받았으면 수치를 지어내지 않고 실패로 처리합니다.
        // 예전에는 여기서 21.0℃·맑음을 채워 넣고 그 값으로 러닝 지수까지 계산했습니다.
        // 비 오는 날에도 "골든 아워"가 떠서, 그 말을 믿고 나간 사용자는 앱을 다시
        // 신뢰하지 않습니다. 캐시에는 넣지 않습니다. 실패를 15분간 붙잡아 두면
        // 네트워크가 돌아와도 복구되지 않습니다.
        const isLive = Boolean(weatherJson?.current);
        if (!isLive) {
          const fallback = this.getFallbackData();
          this.weatherData = fallback;
          this.notifyListeners();
          return fallback;
        }

        const current = weatherJson.current;

        // 대기질만 실패한 경우는 기상 정보를 살립니다. 대신 등급을 단정하지 않습니다.
        const currentAir = airJson?.current || { pm10: null, pm2_5: null, european_aqi: null };
        const hasAir = Boolean(airJson?.current);

        // 배열 첫 칸은 오늘 0시입니다. 그대로 쓰면 자정의 강수확률로 러닝 지수를
        // 깎게 됩니다. API가 돌려준 현재 시각과 같은 시간대의 값을 찾아 씁니다.
        const precipProb = this.pickCurrentHourValue(
          weatherJson?.hourly?.time,
          weatherJson?.hourly?.precipitation_probability,
          weatherJson?.current?.time
        );

        const wmoInfo = WMO_WEATHER_MAP[current.weather_code] || { label: "맑음", icon: "☀️", runningScoreMod: 5 };

        // 대기질 등급 계산 (한국 환경부 기준: PM10 30이하 좋음, 80이하 보통, 81이상 나쁨 / PM2.5 15이하 좋음, 35이하 보통, 36이상 나쁨)
        // 대기질을 못 받았을 때 "좋음"으로 단정하면 미세먼지 나쁨인 날에 밖으로 내보냅니다.
        // 등급을 비우고 러닝 지수에서는 감점하지 않습니다(없는 정보로 벌점을 줄 수도 없음).
        const airGrade = hasAir
          ? this.evaluateAirGrade(currentAir.pm10, currentAir.pm2_5)
          : { grade: "unknown", label: "확인 불가", penalty: 0, desc: "대기질 정보를 받아오지 못했습니다." };

        // 러닝 쾌적 지수 산출 (0 ~ 100점)
        const runningIndex = this.calculateRunningIndex({
          temp: current.temperature_2m,
          apparentTemp: current.apparent_temperature,
          humidity: current.relative_humidity_2m,
          windSpeed: current.wind_speed_10m,
          precipitation: current.precipitation,
          precipProb: precipProb,
          weatherScoreMod: wmoInfo.runningScoreMod,
          airPenalty: airGrade.penalty
        });

        // AI 코치 날씨 브리핑 생성
        const coachingBriefing = this.generateCoachingBriefing(runningIndex, current, airGrade, wmoInfo);

        const result = {
          locationName: name,
          isGps: Boolean(this.currentCoords.isGps),
          isLive,
          lat,
          lon,
          temp: Math.round(current.temperature_2m * 10) / 10,
          apparentTemp: Math.round(current.apparent_temperature * 10) / 10,
          humidity: Math.round(current.relative_humidity_2m),
          windSpeed: Math.round(current.wind_speed_10m * 10) / 10,
          precipitation: current.precipitation,
          precipProb,
          weatherCode: current.weather_code,
          weatherLabel: wmoInfo.label,
          weatherIcon: wmoInfo.icon,
          airQuality: {
            pm10: hasAir ? Math.round(currentAir.pm10) : null,
            pm2_5: hasAir ? Math.round(currentAir.pm2_5) : null,
            grade: airGrade.grade, // "good" | "normal" | "bad"
            label: airGrade.label, // "좋음 🟢" | "보통 🟡" | "나쁨 🔴"
            desc: airGrade.desc
          },
          runningIndex, // { score: 95, status: "골든 러닝 타임", level: "elite", color: "#00F0FF" }
          coachingBriefing,
          updatedAt: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
        };

        this.weatherData = result;
        this.saveCachedData(result);
        this.notifyListeners();
        return result;
      } catch (err) {
        console.error("[WeatherService] 실시간 기상 데이터 호출 실패:", err);
        // 에러 시 안전 기본값 제공
        const fallback = this.getFallbackData();
        this.weatherData = fallback;
        this.notifyListeners();
        return fallback;
      }
    }

    /**
     * 대기질 등급 평가 (환경부 기준)
     */
    evaluateAirGrade(pm10, pm25) {
      const p10 = Number(pm10) || 20;
      const p25 = Number(pm25) || 10;

      if (p10 <= 30 && p25 <= 15) {
        return { grade: "good", label: "좋음 🟢", penalty: 0, desc: "미세먼지 청정! 심호흡하며 달리기 최고입니다." };
      } else if (p10 <= 80 && p25 <= 35) {
        return { grade: "normal", label: "보통 🟡", penalty: -10, desc: "무난한 대기질입니다. 야외 러닝 가능합니다." };
      } else {
        return { grade: "bad", label: "나쁨 🔴", penalty: -30, desc: "미세먼지 주의! 마스크 착용 또는 실내 룸트레이닝을 권장합니다." };
      }
    }

    /**
     * 러닝 쾌적도 지수 (Running Index 0~100) 계산 알고리즘
     * - 최적 기온: 15℃ ~ 21℃ (달리기에 가장 이상적인 온도)
     * - 최적 습도: 40% ~ 60%
     * - 바람: 2 ~ 7 km/h 산들바람
     */
    calculateRunningIndex(params) {
      let score = 90; // 기본 점수

      // 1. 기온 평가
      const t = params.temp;
      if (t >= 15 && t <= 21) {
        score += 10; // 골든 템프 (+10)
      } else if (t >= 10 && t < 15) {
        score += 5; // 선선함 (+5)
      } else if (t > 21 && t <= 26) {
        score += 2; // 약간 따뜻 (+2)
      } else if (t >= 5 && t < 10) {
        score -= 8; // 쌀쌀함 (-8)
      } else if (t > 26 && t <= 30) {
        score -= 15; // 더움 (-15)
      } else if (t > 30) {
        score -= 30; // 폭염 위험 (-30)
      } else if (t < 5) {
        score -= 25; // 한파/결빙 주의 (-25)
      }

      // 2. 습도 평가
      const h = params.humidity;
      if (h >= 40 && h <= 60) {
        score += 5; // 쾌적 (+5)
      } else if (h > 75) {
        score -= 10; // 끈적임/호흡 답답 (-10)
      }

      // 3. 강수 및 날씨 가중치
      score += (params.weatherScoreMod || 0);
      if (params.precipProb > 40) {
        score -= 15;
      }
      if (params.precipitation > 0) {
        score -= 25;
      }

      // 4. 미세먼지 감점
      score += (params.airPenalty || 0);

      // 클램핑 (0 ~ 100)
      score = Math.max(10, Math.min(100, Math.round(score)));

      let status = "골든 러닝 타임";
      let level = "elite";
      let color = "#00F0FF";

      if (score >= 90) {
        status = "👑 골든 러닝 타임 (최상)";
        level = "golden";
        color = "#00F0FF";
      } else if (score >= 75) {
        status = "🏃 활력 충전 러닝 (양호)";
        level = "good";
        color = "#CCFF00";
      } else if (score >= 55) {
        status = "🌤️ 가벼운 조깅 권장 (보통)";
        level = "normal";
        color = "#FFD700";
      } else {
        status = "⚠️ 실내 룸트레이닝 권장 (주의)";
        level = "caution";
        color = "#FF7043";
      }

      return { score, status, level, color };
    }

    /**
     * AI 코치 날씨 반응형 브리핑 (소비자 심리학 렌즈 탑재)
     */
    generateCoachingBriefing(runningIndex, current, airGrade, wmoInfo) {
      const temp = Math.round(current.temperature_2m);
      const isRain = current.precipitation > 0 || current.weather_code >= 51;
      const isAirBad = airGrade.grade === "bad";

      if (isRain) {
        return {
          coach: "루나",
          role: "실내 모션 코치",
          mood: "encouraging",
          badge: "🌧️ 우천 맞춤 코칭",
          message: `현재 밖에는 ${wmoInfo.label} 상태입니다 ☔ 빗길 부상 위험이 있으니, 오늘은 실내에서 5분 매트 코어 챌린지나 트레드밀 모드로 펫의 경험치를 안전하게 채워보세요!`
        };
      }

      if (isAirBad) {
        return {
          coach: "닥터케이",
          role: "건강 케어 전문의",
          mood: "cautious",
          badge: "😷 미세먼지 주의보",
          message: `미세먼지 수치(${airGrade.label})가 다소 높습니다. 심폐 보호를 위해 야외 고강도 인터벌보다는 실내 푸시업·스쿼트 챌린지로 땀을 내는 것을 권장드립니다.`
        };
      }

      if (runningIndex.score >= 85) {
        return {
          coach: "레오",
          role: "수석 러닝 코치",
          mood: "hyped",
          badge: "🔥 골든 러닝 지수 90+ 달성",
          message: `기온 ${temp}℃, 미세먼지 ${airGrade.label}! 1년 중 달리기 가장 완벽한 '골든 아워'입니다. 지금 러닝화 끈을 묶고 15분만 달려보세요. 오늘 밤 수면의 질이 완전히 달라집니다!`
        };
      }

      return {
        coach: "레오",
        role: "수석 러닝 코치",
        mood: "warm",
        badge: "🌤️ 데일리 러닝 가이드",
        message: `현재 기온 ${temp}℃, 체감온도 ${Math.round(current.apparent_temperature)}℃로 가볍게 몸을 풀기 좋은 날씨입니다. 5분 워밍업 스트레칭 후 천천히 조깅을 시작해 보세요!`
      };
    }

    // 네트워크가 끊겼을 때의 표시용 데이터.
    // 예전에는 "20.5℃ 맑음 · 95점 골든 아워"를 실측처럼 보여줬습니다. 비 오는 날에도
    // 골든 아워가 떠서 그 말을 믿고 나간 사용자를 속이는 셈이었습니다.
    // 이제 수치를 지어내지 않고 데이터가 없다는 사실을 그대로 전합니다.
    getFallbackData() {
      return {
        locationName: this.currentCoords.name || "위치 미확인",
        isGps: Boolean(this.currentCoords.isGps),
        isLive: false,
        lat: this.currentCoords.lat,
        lon: this.currentCoords.lon,
        temp: null,
        apparentTemp: null,
        humidity: null,
        windSpeed: null,
        precipitation: null,
        precipProb: null,
        weatherCode: null,
        weatherLabel: "정보 없음",
        weatherIcon: "📡",
        airQuality: {
          pm10: null,
          pm2_5: null,
          grade: "unknown",
          label: "확인 불가",
          desc: "대기질 정보를 받아오지 못했습니다."
        },
        runningIndex: {
          score: null,
          status: "기상 정보 없음",
          level: "unknown",
          color: "#8A94A6"
        },
        coachingBriefing: {
          coach: "레오",
          role: "수석 러닝 코치",
          mood: "warm",
          badge: "📡 기상 정보 연결 실패",
          message: "지금 기상 데이터를 받아오지 못했습니다. 네트워크를 확인하고 새로고침해 주세요. 실외 상황을 직접 확인한 뒤 출발하시는 편이 안전합니다."
        },
        updatedAt: "연결 실패"
      };
    }

    subscribe(callback) {
      if (typeof callback === "function") {
        this.listeners.push(callback);
      }
    }

    notifyListeners() {
      if (!this.weatherData) return;
      this.listeners.forEach(fn => {
        try {
          fn(this.weatherData);
        } catch (e) {
          console.error("[WeatherService] 리스너 호출 에러:", e);
        }
      });
    }
  }

  // 글로벌 싱글톤 인스턴스
  const weatherServiceInstance = new WeatherService();
  global.WeatherService = weatherServiceInstance;
  global.CITY_PRESETS = CITY_PRESETS;

})(typeof window !== "undefined" ? window : globalThis);
