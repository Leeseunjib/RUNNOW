// 잠금·백그라운드에서도 GPS 좌표를 받는 전역 태스크. index.js에서 먼저 import 해야 한다.
import * as TaskManager from 'expo-task-manager';
import { persistRunSession, restoreRunSession, runSession } from './runSession';

export const LOCATION_TASK_NAME = 'RUNNOW_BACKGROUND_LOCATION';

if (!TaskManager.isTaskDefined(LOCATION_TASK_NAME)) {
  TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
    if (error) {
      console.warn('RUNNOW location task', error.message);
      return;
    }
    if (!runSession.isTracking) {
      const restored = await restoreRunSession();
      if (!restored) return;
    }
    if (runSession.isPaused) return;
    const locations = data?.locations || [];
    for (const loc of locations) {
      runSession.handleGeoSuccess(loc);
    }
    await persistRunSession();
  });
}
