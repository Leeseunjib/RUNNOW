// 실시간 고정밀 GPS 및 스마트폰/워치 하이브리드 러닝 트래커 모듈 (GPS Runner Engine)
import { caloriesForDistance } from "./metabolics.js";

// 노이즈 & 안티치트 기준값
const MIN_STEP_METERS = 1.5;        // 최소 인정 변위 하한선
const MAX_ACCURACY_M = 40;          // 이보다 오차가 큰 측정치는 폐기
const MAX_SPEED_MPS = 30 / 3.6;     // 시속 30km 초과 이동은 거리에서 배제 (차량 탑승 등)
const MAX_TREADMILL_KMH = 30;       // 헬스장 기계 거리 입력 상한 (차량 속도)

// 실측 문제: 가만히 서 있어도 거리가 2m 이상 늘어났습니다.
// 원인은 고정 1.5m 임계값이 GPS 오차(야외 보통 ±5~15m)보다 훨씬 작다는 것입니다.
// 오차 반경 안에서 좌표가 흔들리는 것만으로 1.5m를 쉽게 넘습니다.
// 그래서 "이 기기가 지금 보고한 오차"에 비례해 임계값을 올립니다.
// 임계값에 못 미친 이동은 버려지지 않고 기준점이 유지된 채 누적되므로,
// 실제 러닝 거리는 손실되지 않고 제자리 흔들림만 걸러집니다.
const ACCURACY_STEP_RATIO = 0.35;
// 기기가 속도를 주지 않으면 정지와 느린 걷기를 구분할 방법이 없습니다.
// (±25m 노이즈에서 무작위 변위는 초속 1m 걷기와 통계적으로 같습니다)
// 이 경우 오차 반경만큼 확실히 움직여야 인정하는 보수적 기준을 씁니다.
const ACCURACY_STEP_RATIO_NO_SPEED = 1.1;

function minStepFor(accuracy, hasSpeed) {
  const acc = Number(accuracy);
  if (!Number.isFinite(acc) || acc <= 0) return MIN_STEP_METERS;
  const ratio = hasSpeed ? ACCURACY_STEP_RATIO : ACCURACY_STEP_RATIO_NO_SPEED;
  return Math.max(MIN_STEP_METERS, acc * ratio);
}

// 오차 가중 위치 추정기 (1차원 칼만 필터를 위도·경도에 각각 적용)
//
// 문턱 방식("N미터 넘으면 인정")은 임시방편입니다. 노이즈를 못 걸러내거나,
// 걸러내려고 문턱을 올리면 숫자가 뚝뚝 끊겨 딜레이처럼 보입니다.
// 네이티브 운동앱이 쓰는 방식은 "오차가 큰 측정치는 적게, 작은 측정치는 많이 반영"하는
// 가중 평균입니다. 매 프레임 부드럽게 갱신되므로 노이즈도 줄고 반응도 빨라집니다.
class PositionFilter {
  constructor() {
    this.lat = null;
    this.lng = null;
    this.rawLat = null;    // 직전 원시 좌표 (실제 이동량 추정용)
    this.rawLng = null;
    this.variance = -1;    // 현재 추정치의 불확실성 (m^2)
    this.timeMs = 0;
  }

  reset() {
    this.lat = null;
    this.lng = null;
    this.rawLat = null;
    this.rawLng = null;
    this.variance = -1;
    this.timeMs = 0;
  }

  get ready() {
    return this.variance >= 0;
  }

  // speedMps: OS가 제공하는 속도. 있으면 "얼마나 움직였을 수 있는가"를 더 정확히 잡습니다.
  process(lat, lng, accuracy, timeMs, speedMps) {
    const acc = Math.max(Number(accuracy) || MIN_ACCURACY_M, MIN_ACCURACY_M);

    if (!this.ready) {
      this.lat = lat;
      this.lng = lng;
      this.variance = acc * acc;
      this.timeMs = timeMs;
      this.rawLat = lat;
      this.rawLng = lng;
      return;
    }

    const dt = Math.max(0, (timeMs - this.timeMs) / 1000);
    if (dt > 0) {
      // 시간이 흐른 만큼 "어디에 있을지" 불확실해집니다.
      //
      // 이 값을 실제 속도보다 낮게 잡으면 필터가 계속 뒤처져 거리가 과소 집계됩니다.
      // OS 속도만 믿으면 그 값이 없거나 부정확할 때 그대로 손해를 봅니다.
      // 그래서 "직전 원시 좌표가 실제로 얼마나 움직였는지"를 함께 보고 큰 쪽을 씁니다.
      // OS가 주는 속도는 도플러 기반이라 좌표 차이보다 훨씬 믿을 만합니다.
      // 이 값이 0에 가까우면 실제로 멈춰 있는 것이므로, 불확실성을 거의 키우지 않아
      // 필터가 노이즈를 따라가지 않게 합니다. 이것이 "서 있는데 거리가 느는" 문제의 해법입니다.
      let expected;
      if (Number.isFinite(speedMps) && speedMps >= 0) {
        expected = Math.max(speedMps, STILL_SPEED_MPS);
      } else {
        // 속도를 주지 않는 기기에서 관측 이동량을 그대로 쓰면 노이즈가 노이즈를
        // 정당화하는 되먹임이 생깁니다. 고정값으로 두어 필터가 흔들림을 덜 따라가게 합니다.
        expected = DEFAULT_SPEED_MPS;
      }
      this.variance += dt * expected * expected;
      this.timeMs = timeMs;
    }
    this.rawLat = lat;
    this.rawLng = lng;

    // 칼만 이득: 측정 오차가 크면 0에 가까워져 기존 추정치를 유지합니다.
    const gain = this.variance / (this.variance + acc * acc);
    this.lat += gain * (lat - this.lat);
    this.lng += gain * (lng - this.lng);
    this.variance = (1 - gain) * this.variance;
  }
}

const MIN_ACCURACY_M = 1;        // 오차 0으로 보고하는 기기 방어
const DEFAULT_SPEED_MPS = 3;     // 속도 정보가 없을 때 가정하는 달리기 속도
const STILL_SPEED_MPS = 0.2;     // 멈춰 있을 때 허용하는 최소 불확실성
const MOVING_SPEED_MPS = 0.5;    // 이 미만이면 정지로 보고 거리를 누적하지 않음

// 하버사인 공식 (지구 곡률 반영 거리 계산)
export function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // 지구 반지름 (미터)
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // 미터 단위 반환
}

export class GPSRunner {
  constructor(options = {}) {
    this.onUpdate = options.onUpdate || (() => {});
    this.isTracking = false;
    this.isPaused = false;
    this.isSimulation = false;
    this.totalMeters = 0; // 순수 누적 이동거리 (m 단위 정수/실수)
    this.elapsedSeconds = 0;
    this.positions = []; // [{lat, lng, time, speed, accuracy}]
    this.lastValidPos = null;
    this.timerId = null;
    this.watchId = null;
    this.userWeightKg = options.weightKg || 70;
    this.gpsAccuracy = "탐색중";
    this.runMode = "gps";
    this.treadmillSpeedKmh = null;
    this.movingStartedSec = null;  // 첫 유효 이동이 관측된 시점의 경과초
    this.wakeLock = null;
    this.resumeFromHidden = false; // 화면이 꺼졌다 켜진 직후인지
    this.skippedResumeSegments = 0;
    this.stationarySamples = 0;
    this.recentFixes = [];   // 속도 미제공 기기의 정지 판정용
    this.smoothedAltitude = null;
    this.lastAltitude = null;
    this.elevationGainM = 0;
    this.filter = new PositionFilter();
    this._onVisibility = null;
    this.rejectedByAccuracy = 0;
    this.lastAccuracy = null;
  }

  setWeight(weightKg) {
    this.userWeightKg = weightKg;
  }

  // 화면이 꺼지면 브라우저가 타이머와 GPS를 정지시켜 그 구간 기록이 통째로 사라집니다.
  // 네이티브 앱과 달리 웹앱은 백그라운드 실행이 불가능하므로, 화면을 켜두는 것이
  // 기록 손실을 막는 유일한 방법입니다.
  async requestWakeLock() {
    try {
      if ("wakeLock" in navigator) {
        this.wakeLock = await navigator.wakeLock.request("screen");
      }
    } catch (err) {
      console.warn("러닝 WakeLock 실패:", err);
    }
  }

  releaseWakeLock() {
    if (!this.wakeLock) return;
    try {
      this.wakeLock.release().then(() => { this.wakeLock = null; });
    } catch (_) {
      this.wakeLock = null;
    }
  }

  // 화면이 꺼졌다 켜지면 그 사이 이동은 기록되지 않았는데 좌표만 멀리 튀어 있습니다.
  // 그 한 구간을 거리로 인정하면 실제로 달리지 않은 거리가 들어갑니다.
  startVisibilityWatch() {
    this.stopVisibilityWatch();
    this._onVisibility = () => {
      if (document.visibilityState === "visible") {
        this.resumeFromHidden = true;
        // Wake Lock은 화면이 꺼지면 해제되므로 복귀 시 다시 요청합니다.
        if (this.isTracking && !this.isPaused) this.requestWakeLock();
      }
    };
    document.addEventListener("visibilitychange", this._onVisibility);
  }

  stopVisibilityWatch() {
    if (this._onVisibility) {
      document.removeEventListener("visibilitychange", this._onVisibility);
      this._onVisibility = null;
    }
  }

  startRun(useSimulation = false) {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.isTracking = true;
    this.isPaused = false;
    this.isSimulation = useSimulation;
    this.runMode = "gps";
    this.totalMeters = 0;
    this.elapsedSeconds = 0;
    this.positions = [];
    this.lastValidPos = null;
    this.movingStartedSec = null;
    this.rejectedByAccuracy = 0;
    this.lastAccuracy = null;
    this.skippedResumeSegments = 0;
    this.stationarySamples = 0;
    this.recentFixes = [];
    this.smoothedAltitude = null;
    this.lastAltitude = null;
    this.elevationGainM = 0;
    this.resumeFromHidden = false;
    this.filter.reset();
    this._deniedAlerted = false;
    this.gpsAccuracy = useSimulation ? "시뮬레이션" : "GPS 신호 탐색중...";
    this.requestWakeLock();
    this.startVisibilityWatch();
    this.emitUpdate();

    this.timerId = setInterval(() => {
      if (!this.isPaused) {
        this.elapsedSeconds += 1;
        if (this.isSimulation) {
          this.simulateStep();
        } else if (this.runMode === "treadmill") {
          this.gpsAccuracy = "헬스장 · 타이머 기록 중. 폰은 콘솔에 두셔도 됩니다";
        }
        this.emitUpdate();
      }
    }, 1000);

    if (this.isSimulation || this.runMode === "treadmill") return;

    if (!window.isSecureContext) {
      this.gpsAccuracy = "HTTPS에서만 GPS 사용 가능";
      this.emitUpdate();
      return;
    }

    if (!navigator.geolocation) {
      this.gpsAccuracy = "이 기기는 GPS를 지원하지 않습니다";
      this.emitUpdate();
      alert("이 브라우저/기기는 위치 정보(GPS)를 지원하지 않습니다.");
      return;
    }

    const geoOptions = {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 60000
    };

    const onError = (err) => {
      const code = err && err.code;
      if (code === 3 && this.positions.length > 0) return;
      if (code === 1) {
        this.gpsAccuracy = "위치 권한이 거부됨. 브라우저 설정에서 허용하세요";
        if (!this._deniedAlerted) {
          this._deniedAlerted = true;
          alert("위치 권한이 꺼져 있습니다. Safari/Chrome 사이트 설정에서 위치 접근을 허용한 뒤 다시 START를 눌러 주세요.");
        }
      } else if (code === 2) {
        this.gpsAccuracy = "GPS 신호를 찾을 수 없음. 야외로 이동해 보세요";
      } else if (code === 3) {
        this.gpsAccuracy = "GPS 수신 대기 중... 야외에서 잠시 기다려 주세요";
      } else {
        this.gpsAccuracy = `GPS 오류 (${err && err.message ? err.message : code})`;
      }
      this.emitUpdate();
    };

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: "geolocation" }).then((status) => {
        if (status.state === "denied") {
          onError({ code: 1, message: "denied" });
        }
      }).catch(() => {});
    }

    this.watchId = navigator.geolocation.watchPosition(
      (pos) => this.handleGeoSuccess(pos),
      onError,
      geoOptions
    );

    navigator.geolocation.getCurrentPosition(
      (pos) => this.handleGeoSuccess(pos),
      onError,
      geoOptions
    );
  }

  async startTreadmill() {
    this.runMode = "treadmill";
    this.treadmillSpeedKmh = null;
    this.isTracking = true;
    this.isPaused = false;
    this.isSimulation = false;
    this.totalMeters = 0;
    this.elapsedSeconds = 0;
    this.positions = [];
    this.lastValidPos = null;
    this.movingStartedSec = null;
    this.rejectedByAccuracy = 0;
    this.lastAccuracy = null;
    this.skippedResumeSegments = 0;
    this.stationarySamples = 0;
    this.recentFixes = [];
    this.smoothedAltitude = null;
    this.lastAltitude = null;
    this.elevationGainM = 0;
    this.resumeFromHidden = false;
    this.filter.reset();
    this.gpsAccuracy = "헬스장 · 타이머 기록 중. 폰은 콘솔에 두셔도 됩니다";
    this.requestWakeLock();
    this.startVisibilityWatch();
    this.emitUpdate();

    if (this.timerId) clearInterval(this.timerId);
    this.timerId = setInterval(() => {
      if (!this.isPaused) {
        this.elapsedSeconds += 1;
        this.emitUpdate();
      }
    }, 1000);
  }

  // 헬스장 정본 거리는 트레드밀 화면 숫자다. 속도 칩이나 폰 센서로 추정하지 않는다.
  confirmConsoleDistance(distanceKm) {
    const km = Number(String(distanceKm).replace(",", "."));
    if (!Number.isFinite(km) || km <= 0) {
      return { ok: false, reason: "invalid" };
    }
    const hours = this.elapsedSeconds / 3600;
    const maxKm = Math.max(0.01, hours * MAX_TREADMILL_KMH);
    if (km > maxKm) {
      return { ok: false, reason: "too_fast", maxKm };
    }
    this.totalMeters = km * 1000;
    this.movingStartedSec = 0;
    this.runMode = "treadmill";
    this.gpsAccuracy = `헬스장 기계 ${km.toFixed(3)} km`;
    return { ok: true, stats: this.getStats() };
  }

  handleGeoSuccess(position) {
    if (this.isPaused) return;
    const { latitude, longitude, accuracy, speed, altitude, altitudeAccuracy } = position.coords;
    // 브라우저 처리 시각이 아니라 GPS가 측정한 시각을 씁니다.
    // 처리 지연이 섞이면 속도 계산과 필터의 시간 간격이 왜곡됩니다.
    const now = Number(position.timestamp) || Date.now();

    // GPS 정확도 상태 평가
    this.lastAccuracy = Math.round(accuracy);
    if (accuracy <= 15) {
      this.gpsAccuracy = `GPS 매우양호 (±${Math.round(accuracy)}m)`;
    } else if (accuracy <= MAX_ACCURACY_M) {
      this.gpsAccuracy = `GPS 보통 (±${Math.round(accuracy)}m)`;
    } else {
      // 오차 반경이 이동 거리보다 큰 측정치는 그대로 쓰면 가짜 거리가 쌓입니다.
      // 왜 거리가 안 늘어나는지 사용자가 알 수 있도록 상태 문구에 명시합니다.
      this.gpsAccuracy = `GPS 정확도 낮음 (±${Math.round(accuracy)}m) · 거리 미집계`;
      this.lastAccuracy = Math.round(accuracy);
      this.rejectedByAccuracy += 1;
      this.emitUpdate();
      return;
    }

    // 원시 좌표를 그대로 쓰지 않고 오차 가중 필터를 통과시킵니다.
    const osSpeed = Number.isFinite(speed) && speed >= 0 ? speed : null;
    this.filter.process(latitude, longitude, accuracy, now, osSpeed);
    const fLat = this.filter.lat;
    const fLng = this.filter.lng;

    // 수용 여부와 무관하게 최근 측정을 남깁니다(정지 판정용).
    this.recentFixes.push({ lat: fLat, lng: fLng, time: now });
    if (this.recentFixes.length > 40) this.recentFixes.shift();

    // 고도는 수집만 하고 칼로리에는 아직 반영하지 않습니다.
    // GPS 고도는 수평 좌표보다 오차가 커(보통 ±2~3배), 검증 없이 경사에 쓰면
    // 칼로리가 크게 왜곡될 수 있습니다. 실기기 데이터를 본 뒤 반영 여부를 정합니다.
    this.trackAltitude(altitude, altitudeAccuracy);

    if (!this.lastValidPos) {
      // 최초 출발 위치 등록
      this.lastValidPos = { lat: fLat, lng: fLng, time: now };
      this.positions.push({ lat: fLat, lng: fLng, time: now, speed: osSpeed || 0, accuracy });
    } else if (this.resumeFromHidden) {
      // 화면이 꺼져 있던 동안의 이동은 기록되지 않았는데 좌표만 멀리 튀어 있습니다.
      // 그 한 구간은 거리에 넣지 않고 기준점만 옮깁니다.
      // 끊긴 구간이므로 필터 이력은 무효입니다. 그대로 두면 필터가 옛 위치를 향해
      // 따라오는 만큼이 다음 이동 거리에 얹혀 버립니다.
      this.resetFilterTo(latitude, longitude, accuracy, now);
      this.resumeFromHidden = false;
      this.skippedResumeSegments += 1;
      this.lastValidPos = { lat: this.filter.lat, lng: this.filter.lng, time: now };
      this.gpsAccuracy = "화면이 꺼진 구간은 거리에 포함하지 않았습니다";
    } else {
      // 직전 유효 위치와의 거리 계산 (미터)
      const dMeters = calculateDistanceMeters(
        this.lastValidPos.lat,
        this.lastValidPos.lng,
        fLat,
        fLng
      );

      // GPS 튐 및 제자리 진동(Jitter) 보정 알고리즘
      // 1) 1.5m 이상 이동했을 때만 실제 이동으로 인정 (제자리 미세 흔들림 무시)
      // 2) 시속 30km 초과 이동(차량 탑승·GPS 튐)은 거리에서 배제
      const dt = (now - this.lastValidPos.time) / 1000;
      // 안티치트는 좌표 기반 속도로 판정합니다. OS 속도를 그대로 믿으면
      // 좌표가 순간이동해도 OS가 낮은 속도를 보고할 때 통과해 버립니다.
      // OS 속도는 필터의 불확실성 추정에만 씁니다.
      const speedCheck = dt > 0 ? dMeters / dt : 0;
      const derivedSpeed = speedCheck;
      const minStep = minStepFor(accuracy, osSpeed !== null);
      // OS 속도가 "멈춰 있다"고 말하면 좌표가 흔들려도 거리로 세지 않습니다.
      // 속도를 제공하지 않는 기기에서는 이 게이트를 적용할 수 없어 통과시킵니다.
      const osSaysStopped = osSpeed !== null
        ? osSpeed < MOVING_SPEED_MPS
        : this.isStationaryByDisplacement();
      if (osSaysStopped) this.stationarySamples += 1;

      if (!osSaysStopped && dMeters >= minStep && speedCheck <= MAX_SPEED_MPS) {
        this.totalMeters += dMeters;
        this.lastValidPos = { lat: fLat, lng: fLng, time: now };
        this.positions.push({ lat: fLat, lng: fLng, time: now, speed: osSpeed ?? derivedSpeed, accuracy });
        // 페이스는 "달린 시간"으로 나눠야 합니다. START를 누르고 GPS가 잡히기까지의
        // 대기 시간이 분모에 들어가면 실제보다 훨씬 느리게 표시됩니다.
        // 이 이동은 [직전 측정 시각 ~ 지금] 구간에 걸쳐 일어났으므로,
        // 기준을 지금이 아니라 구간 시작점으로 잡아야 그 구간의 소요 시간이 빠지지 않습니다.
        if (this.movingStartedSec === null) {
          this.movingStartedSec = Math.max(0, this.elapsedSeconds - dt);
        }
      } else if (!osSaysStopped && dMeters >= minStep) {
        // 속도 초과로 거부된 구간(차량 탑승·GPS 튐).
        // 거리는 더하지 않되 기준점은 즉시 현재 위치로 옮깁니다.
        // 기준점을 그대로 두면 이동을 멈춘 순간 dt가 커지면서
        // 누적 변위 전체가 정상 속도로 계산돼 한꺼번에 거리로 인정됩니다.
        // 여기도 불연속 구간입니다. 필터가 끌고 온 지연을 버립니다.
        this.resetFilterTo(latitude, longitude, accuracy, now);
        this.lastValidPos = { lat: this.filter.lat, lng: this.filter.lng, time: now };
        this.gpsAccuracy = "비정상 속도 감지 · 이 구간은 거리에 포함되지 않습니다";
      }
    }

    this.emitUpdate();
  }

  simulateStep() {
    // 평균 5분 30초 페이스 시뮬레이션 (초당 약 3.03m)
    const stepMeters = 2.8 + Math.random() * 0.6;
    this.totalMeters += stepMeters;

    const lastPos = this.positions.length > 0 ? this.positions[this.positions.length - 1] : { lat: 37.5665, lng: 126.9780 };
    const angle = (this.elapsedSeconds * 0.05);
    const newLat = lastPos.lat + Math.sin(angle) * 0.00003;
    const newLng = lastPos.lng + Math.cos(angle) * 0.00004;

    this.positions.push({ lat: newLat, lng: newLng, time: Date.now(), speed: 3.0, accuracy: 5 });
  }

  pauseRun() {
    this.isPaused = true;
  }

  resumeRun() {
    this.isPaused = false;
  }

  stopTracking() {
    this.isTracking = false;
    this.isPaused = false;
    this.releaseWakeLock();
    this.stopVisibilityWatch();
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    if (this.watchId != null && navigator.geolocation) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  stopRun() {
    this.stopTracking();
    return this.getStats();
  }

  reset() {
    this.stopTracking();
    this.totalMeters = 0;
    this.elapsedSeconds = 0;
    this.positions = [];
    this.lastValidPos = null;
    this.movingStartedSec = null;
    this.rejectedByAccuracy = 0;
    this.lastAccuracy = null;
    this.skippedResumeSegments = 0;
    this.stationarySamples = 0;
    this.recentFixes = [];
    this.smoothedAltitude = null;
    this.lastAltitude = null;
    this.elevationGainM = 0;
    this.resumeFromHidden = false;
    this.filter.reset();
    this.isSimulation = false;
    this.runMode = "gps";
    this.gpsAccuracy = "대기중";
    this.emitUpdate();
  }

  // 최근 구간 기준 현재 페이스. 전체 평균은 초반 대기와 중간 휴식에 끌려다녀
  // "지금 어느 정도로 달리고 있는지"를 보여주지 못합니다. 네이티브 앱도 이 방식을 씁니다.
  getCurrentPaceSeconds(windowSec = 30) {
    const pts = this.positions;
    if (pts.length < 2) return null;

    const latest = pts[pts.length - 1];
    const cutoff = latest.time - windowSec * 1000;
    let meters = 0;
    let oldest = latest;

    for (let i = pts.length - 1; i > 0; i--) {
      if (pts[i - 1].time < cutoff) break;
      meters += calculateDistanceMeters(pts[i - 1].lat, pts[i - 1].lng, pts[i].lat, pts[i].lng);
      oldest = pts[i - 1];
    }

    const seconds = (latest.time - oldest.time) / 1000;
    if (seconds < 5 || meters < 5) return null;   // 표본이 적으면 값이 튀므로 표시하지 않음
    return (seconds / meters) * 1000;              // 1km 소요 초
  }

  formatPace(secPerKm) {
    if (!Number.isFinite(secPerKm) || secPerKm <= 0) return `--'--"`;
    const total = Math.round(secPerKm);
    const min = Math.floor(total / 60);
    const sec = total % 60;
    if (min >= 60) return `--'--"`;
    return `${min}'${sec < 10 ? "0" : ""}${sec}"`;
  }

  // 속도를 제공하지 않는 기기용 정지 판정.
  //
  // GPS 노이즈는 한 점 주위를 무작위로 맴돌기 때문에, 일정 시간 창으로 보면
  // "출발점과 끝점 사이의 직선 변위"가 거의 0입니다. 반대로 실제 이동은 방향이 있어
  // 변위가 그대로 쌓입니다. 순간 속도 대신 이 변위로 판단하면 노이즈에 속지 않습니다.
  isStationaryByDisplacement(windowSec = 8) {
    const fixes = this.recentFixes;
    if (fixes.length < 4) return false;   // 표본이 적으면 판단하지 않음

    const latest = fixes[fixes.length - 1];
    const cutoff = latest.time - windowSec * 1000;
    let oldest = null;
    for (let i = fixes.length - 1; i >= 0; i--) {
      if (fixes[i].time < cutoff) break;
      oldest = fixes[i];
    }
    if (!oldest) return false;

    const seconds = (latest.time - oldest.time) / 1000;
    if (seconds < 4) return false;

    const displacement = calculateDistanceMeters(oldest.lat, oldest.lng, latest.lat, latest.lng);
    return displacement / seconds < MOVING_SPEED_MPS;
  }

  // 고도 추적. 노이즈가 커서 강하게 평활화한 뒤 누적 상승고도와 경사를 추정합니다.
  trackAltitude(altitude, altitudeAccuracy) {
    const alt = Number(altitude);
    if (!Number.isFinite(alt)) return;
    // 고도 오차가 15m를 넘으면 경사 추정에 쓸 수 없는 수준입니다.
    if (Number.isFinite(altitudeAccuracy) && altitudeAccuracy > 15) return;

    this.lastAltitude = Math.round(alt);
    if (this.smoothedAltitude === null) {
      this.smoothedAltitude = alt;
      return;
    }
    const prev = this.smoothedAltitude;
    this.smoothedAltitude = prev + 0.2 * (alt - prev);   // 강한 평활화

    const gain = this.smoothedAltitude - prev;
    // 1m 미만 변화는 노이즈로 봅니다.
    if (gain > 1) this.elevationGainM += gain;
  }

  // 이동이 끊겼다고 판단한 지점에서 필터를 현재 실측값으로 다시 세웁니다.
  resetFilterTo(lat, lng, accuracy, timeMs) {
    this.filter.reset();
    this.filter.process(lat, lng, accuracy, timeMs, null);
  }

  getStats() {
    // 1) 거리 계산: m는 순수 정수(int), km는 소수점 3자리
    const metersInt = Math.floor(this.totalMeters);
    const distanceKm = parseFloat((this.totalMeters / 1000).toFixed(3));

    // 2) 평균 페이스(AVG PACE) 계산: 1km를 달리는 데 소요되는 시간 (분'초")
    //    공식: (총 경과 초 / 이동 km) => 초/km
    // START를 누르고 GPS가 잡히기까지의 대기 시간은 페이스 분모에서 제외합니다.
    // 이걸 포함하면 실제보다 훨씬 느리게 나오고, 60분/km를 넘으면 --'--"로 표시됩니다.
    const runningSeconds = Math.max(0, this.elapsedSeconds - (this.movingStartedSec ?? 0));

    let paceStr = `--'--"`;
    if (distanceKm >= 0.005 && runningSeconds > 0) {
      const secPerKm = Math.round(runningSeconds / distanceKm);
      const paceMin = Math.floor(secPerKm / 60);
      const paceSec = secPerKm % 60;
      if (paceMin < 60) {
        paceStr = `${paceMin}'${paceSec < 10 ? '0' : ''}${paceSec}"`;
      }
    }

    // 3) 활동 칼로리 (ACSM 대사 방정식)
    //    거리만으로 계산하면 걷기와 달리기가 같아집니다.
    //    실제로 걷기는 같은 거리에서 달리기의 절반 수준이며, 기존 공식은 걷기를
    //    2배 과대계산하고 있었습니다. 속도와 시간을 함께 넣어 구분합니다.
    const caloriesInt = Math.round(
      caloriesForDistance(this.totalMeters, runningSeconds || this.elapsedSeconds, this.userWeightKg)
    );

    return {
      distanceMeters: metersInt, // 정수 int (예: 1250)
      distanceKm: distanceKm,     // 실수 km (예: 1.250)
      displayMeters: metersInt.toLocaleString(), // 1,250 m
      displayKm: `${distanceKm.toFixed(3)} km`,
      elapsedSeconds: this.elapsedSeconds,
      formattedTime: this.formatTime(this.elapsedSeconds),
      pace: paceStr,
      calories: caloriesInt,
      gpsAccuracy: this.gpsAccuracy,
      runningSeconds,
      currentPace: this.formatPace(this.getCurrentPaceSeconds()),
      lastAccuracy: this.lastAccuracy,
      rejectedByAccuracy: this.rejectedByAccuracy,
      skippedResumeSegments: this.skippedResumeSegments,
      stationarySamples: this.stationarySamples,
      lastAltitude: this.lastAltitude,
      elevationGainM: Math.round(this.elevationGainM),
      routePoints: this.positions,
      runMode: this.runMode,
      treadmillSpeedKmh: null
    };
  }

  formatTime(totalSec) {
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hours > 0) {
      return `${hours}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  emitUpdate() {
    this.onUpdate(this.getStats());
  }
}

