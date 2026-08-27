// 실시간 고정밀 GPS 및 스마트폰/워치 하이브리드 러닝 트래커 모듈 (GPS Runner Engine)

// 하버사인 공식 (지구 곡률 반영 거리 계산)
function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
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
  }

  setWeight(weightKg) {
    this.userWeightKg = weightKg;
  }

  startRun(useSimulation = false) {
    this.isTracking = true;
    this.isPaused = false;
    this.isSimulation = useSimulation;
    this.totalMeters = 0;
    this.elapsedSeconds = 0;
    this.positions = [];
    this.lastValidPos = null;
    this.gpsAccuracy = useSimulation ? "시뮬레이션" : "GPS 신호 탐색중...";

    // 1초 타이머 가동
    this.timerId = setInterval(() => {
      if (!this.isPaused) {
        this.elapsedSeconds += 1;
        if (this.isSimulation) {
          this.simulateStep();
        }
        this.emitUpdate();
      }
    }, 1000);

    // 실제 Geolocation 시작
    if (!this.isSimulation && navigator.geolocation) {
      this.watchId = navigator.geolocation.watchPosition(
        (pos) => this.handleGeoSuccess(pos),
        (err) => {
          console.warn("GPS Access Error/Fallback to Simulation:", err.message);
          this.gpsAccuracy = "GPS 신호 약함 (실내/오차)";
          this.emitUpdate();
        },
        {
          enableHighAccuracy: true,
          maximumAge: 1000,
          timeout: 10000
        }
      );
    }
  }

  handleGeoSuccess(position) {
    if (this.isPaused) return;
    const { latitude, longitude, accuracy, speed } = position.coords;
    const now = Date.now();

    // GPS 정확도 상태 평가
    if (accuracy <= 15) {
      this.gpsAccuracy = `GPS 매우양호 (±${Math.round(accuracy)}m)`;
    } else if (accuracy <= 35) {
      this.gpsAccuracy = `GPS 보통 (±${Math.round(accuracy)}m)`;
    } else {
      this.gpsAccuracy = `GPS 약함 (±${Math.round(accuracy)}m)`;
    }

    if (!this.lastValidPos) {
      // 최초 출발 위치 등록
      this.lastValidPos = { lat: latitude, lng: longitude, time: now };
      this.positions.push({ lat: latitude, lng: longitude, time: now, speed: speed || 0, accuracy });
    } else {
      // 직전 유효 위치와의 거리 계산 (미터)
      const dMeters = calculateDistanceMeters(
        this.lastValidPos.lat,
        this.lastValidPos.lng,
        latitude,
        longitude
      );

      // GPS 튐 및 제자리 진동(Jitter) 보정 알고리즘
      // 1) 1.5m 이상 이동했을 때만 실제 이동으로 인정 (제자리 미세 흔들림 무시)
      // 2) 초당 25m(시속 90km) 이상의 비정상 텔레포트 점프는 무시
      const dt = (now - this.lastValidPos.time) / 1000;
      const speedCheck = dt > 0 ? dMeters / dt : 0;

      if (dMeters >= 1.5 && speedCheck <= 25) {
        this.totalMeters += dMeters;
        this.lastValidPos = { lat: latitude, lng: longitude, time: now };
        this.positions.push({ lat: latitude, lng: longitude, time: now, speed: speed || speedCheck, accuracy });
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
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    if (this.watchId && navigator.geolocation) {
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
    this.isSimulation = false;
    this.gpsAccuracy = "대기중";
    this.emitUpdate();
  }

  getStats() {
    // 1) 거리 계산: m는 순수 정수(int), km는 소수점 3자리
    const metersInt = Math.floor(this.totalMeters);
    const distanceKm = parseFloat((this.totalMeters / 1000).toFixed(3));

    // 2) 평균 페이스(AVG PACE) 계산: 1km를 달리는 데 소요되는 시간 (분'초")
    //    공식: (총 경과 초 / 이동 km) => 초/km
    let paceStr = `--'--"`;
    if (distanceKm >= 0.005 && this.elapsedSeconds > 0) {
      const secPerKm = Math.round(this.elapsedSeconds / distanceKm);
      const paceMin = Math.floor(secPerKm / 60);
      const paceSec = secPerKm % 60;
      if (paceMin < 60) {
        paceStr = `${paceMin}'${paceSec < 10 ? '0' : ''}${paceSec}"`;
      }
    }

    // 3) 칼로리 소모량 (체중 x 이동거리 x 1.036 kcal/kg/km)
    const rawCalories = distanceKm * this.userWeightKg * 1.036;
    const caloriesInt = Math.round(rawCalories);

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
      routePoints: this.positions
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

