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
    this.runMode = "gps";
    this.treadmillSpeedKmh = 8;
    this.motionGated = false;
    this.lastMotionAt = 0;
    this.lastStepAt = 0;
    this._onMotion = null;
  }

  setWeight(weightKg) {
    this.userWeightKg = weightKg;
  }

  startRun(useSimulation = false) {
    this.stopMotionSensor();
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
    this._deniedAlerted = false;
    this.gpsAccuracy = useSimulation ? "시뮬레이션" : "GPS 신호 탐색중...";
    this.emitUpdate();

    this.timerId = setInterval(() => {
      if (!this.isPaused) {
        this.elapsedSeconds += 1;
        if (this.isSimulation) {
          this.simulateStep();
        } else if (this.runMode === "treadmill") {
          this.tickTreadmill();
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

  async startTreadmill(speedKmh = 8) {
    this.runMode = "treadmill";
    this.treadmillSpeedKmh = Number(speedKmh) || 8;
    this.isTracking = true;
    this.isPaused = false;
    this.isSimulation = false;
    this.totalMeters = 0;
    this.elapsedSeconds = 0;
    this.positions = [];
    this.lastValidPos = null;
    this.lastMotionAt = Date.now();
    this.lastStepAt = 0;
    this.gpsAccuracy = `트레드밀 ${this.treadmillSpeedKmh} km/h · 준비`;
    this.emitUpdate();

    if (this.timerId) clearInterval(this.timerId);
    this.timerId = setInterval(() => {
      if (!this.isPaused) {
        this.elapsedSeconds += 1;
        this.tickTreadmill();
        this.emitUpdate();
      }
    }, 1000);

    const motionOk = await this.enableMotionSensor();
    this.motionGated = motionOk;
    if (!motionOk) {
      this.gpsAccuracy = `트레드밀 ${this.treadmillSpeedKmh} km/h · 속도 기준 기록`;
      this.emitUpdate();
    }
  }

  tickTreadmill() {
    const moving = !this.motionGated || (Date.now() - this.lastMotionAt < 3000) || this.elapsedSeconds <= 2;
    if (moving) {
      this.totalMeters += (this.treadmillSpeedKmh * 1000) / 3600;
      this.gpsAccuracy = `트레드밀 ${this.treadmillSpeedKmh} km/h`;
    } else {
      this.gpsAccuracy = "움직임이 약합니다. 폰을 잡고 달려 주세요";
    }
  }

  async enableMotionSensor() {
    try {
      if (typeof DeviceMotionEvent !== "undefined" && typeof DeviceMotionEvent.requestPermission === "function") {
        const state = await DeviceMotionEvent.requestPermission();
        if (state !== "granted") return false;
      }
      if (typeof DeviceMotionEvent === "undefined") return false;
      this.stopMotionSensor();
      this._onMotion = (event) => this.handleDeviceMotion(event);
      window.addEventListener("devicemotion", this._onMotion);
      return true;
    } catch (err) {
      console.warn("DeviceMotion 권한 실패:", err);
      return false;
    }
  }

  stopMotionSensor() {
    if (this._onMotion) {
      window.removeEventListener("devicemotion", this._onMotion);
      this._onMotion = null;
    }
    this.motionGated = false;
  }

  handleDeviceMotion(event) {
    const acc = event.accelerationIncludingGravity || event.acceleration;
    if (!acc) return;
    const mag = Math.sqrt((acc.x || 0) ** 2 + (acc.y || 0) ** 2 + (acc.z || 0) ** 2);
    const now = Date.now();
    if (mag > 12.5 && now - this.lastStepAt > 280) {
      this.lastStepAt = now;
      this.lastMotionAt = now;
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
    if (this.watchId != null && navigator.geolocation) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.stopMotionSensor();
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
    this.runMode = "gps";
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
      routePoints: this.positions,
      runMode: this.runMode,
      treadmillSpeedKmh: this.runMode === "treadmill" ? this.treadmillSpeedKmh : null
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

