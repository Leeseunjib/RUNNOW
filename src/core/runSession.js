// 앱 전역 러닝 세션. 백그라운드 GPS 태스크와 화면이 같은 인스턴스를 본다.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GPSRunner } from './gpsRunner';

const STORE_KEY = 'RUNNOW_ACTIVE_RUN_V1';
const listeners = new Set();

export const runSession = new GPSRunner({
  onUpdate: (stats) => {
    listeners.forEach((fn) => {
      try {
        fn(stats);
      } catch (err) {
        console.warn('runSession listener', err);
      }
    });
  },
});

export function subscribeRunSession(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function snapshot() {
  return {
    isTracking: runSession.isTracking,
    isPaused: runSession.isPaused,
    totalMeters: runSession.totalMeters,
    sessionStartedAt: runSession.sessionStartedAt,
    pauseStartedAt: runSession.pauseStartedAt,
    pausedMs: runSession.pausedMs,
    lastValidPos: runSession.lastValidPos,
    gpsAccuracy: runSession.gpsAccuracy,
    movingStartedSec: runSession.movingStartedSec,
    elapsedSeconds: runSession.elapsedSeconds,
    lastAccuracy: runSession.lastAccuracy,
    filter: {
      lat: runSession.filter.lat,
      lng: runSession.filter.lng,
      variance: runSession.filter.variance,
      timeMs: runSession.filter.timeMs,
      rawLat: runSession.filter.rawLat,
      rawLng: runSession.filter.rawLng,
    },
  };
}

export async function persistRunSession() {
  try {
    if (!runSession.isTracking) {
      await AsyncStorage.removeItem(STORE_KEY);
      return;
    }
    runSession.syncElapsed();
    await AsyncStorage.setItem(STORE_KEY, JSON.stringify(snapshot()));
  } catch (err) {
    console.warn('러닝 세션 저장 실패:', err);
  }
}

export async function restoreRunSession() {
  if (runSession.isTracking) return true;
  try {
    const raw = await AsyncStorage.getItem(STORE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (!data?.isTracking) return false;

    runSession.isTracking = true;
    runSession.isPaused = !!data.isPaused;
    runSession.runMode = 'gps';
    runSession.totalMeters = Number(data.totalMeters) || 0;
    runSession.sessionStartedAt = data.sessionStartedAt || Date.now();
    runSession.pauseStartedAt = data.pauseStartedAt || null;
    runSession.pausedMs = Number(data.pausedMs) || 0;
    runSession.lastValidPos = data.lastValidPos || null;
    runSession.gpsAccuracy = data.gpsAccuracy || 'GPS 신호 연결 중...';
    runSession.movingStartedSec = data.movingStartedSec ?? null;
    runSession.elapsedSeconds = Number(data.elapsedSeconds) || 0;
    runSession.lastAccuracy = data.lastAccuracy ?? null;
    if (data.filter && Number.isFinite(data.filter.lat) && Number.isFinite(data.filter.lng)) {
      runSession.filter.lat = data.filter.lat;
      runSession.filter.lng = data.filter.lng;
      runSession.filter.variance = Number(data.filter.variance);
      runSession.filter.timeMs = Number(data.filter.timeMs) || 0;
      runSession.filter.rawLat = data.filter.rawLat ?? data.filter.lat;
      runSession.filter.rawLng = data.filter.rawLng ?? data.filter.lng;
    }
    runSession.syncElapsed();
    runSession.emitUpdate();
    return true;
  } catch (err) {
    console.warn('러닝 세션 복구 실패:', err);
    return false;
  }
}
