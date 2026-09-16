// 네이티브 백그라운드 GPS 권한 요청 및 포그라운드 서비스 시작/중지
import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { LOCATION_TASK_NAME } from './backgroundLocationTask';
import { runSession } from './runSession';

export async function requestRunPermissions() {
  if (Platform.OS === 'web') {
    return { ok: false, stage: 'web', background: false };
  }
  const foreground = await Location.requestForegroundPermissionsAsync();
  if (foreground.status !== 'granted') {
    return { ok: false, stage: 'foreground', background: false };
  }

  const background = await Location.requestBackgroundPermissionsAsync();
  return {
    ok: true,
    stage: 'ready',
    background: background.status === 'granted',
  };
}

export async function startBackgroundLocation() {
  const already = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
  if (already) return;

  await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
    accuracy: Location.Accuracy.BestForNavigation,
    timeInterval: 1000,
    distanceInterval: 1,
    deferredUpdatesInterval: 1000,
    showsBackgroundLocationIndicator: true,
    pausesUpdatesAutomatically: false,
    activityType: Location.ActivityType.Fitness,
    foregroundService: {
      notificationTitle: 'RUNNOW 러닝 기록 중',
      notificationBody: '화면을 잠가도 거리가 기록됩니다.',
      killServiceOnDestroy: false,
    },
  });
}

export async function stopBackgroundLocation() {
  const already = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
  if (!already) return;
  await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
}

export async function stopOrphanedTracking() {
  const already = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
  if (already && !runSession.isTracking) {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
  }
}
