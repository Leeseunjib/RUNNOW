import { Platform } from 'react-native';
import { initialize, requestPermission, readRecords } from 'react-native-health-connect';

// Health Connect 읽기 권한 스키마
const REQUIRED_PERMISSIONS = [
  { accessType: 'read', recordType: 'Steps' },
  { accessType: 'read', recordType: 'SleepSession' },
  { accessType: 'read', recordType: 'HeartRate' },
  { accessType: 'read', recordType: 'HeartRateVariabilityRmssd' },
  { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
];

export async function initHealthConnect() {
  if (Platform.OS !== 'android') {
    console.warn('Health Connect는 Android 환경에서만 지원됩니다. iOS는 HealthKit 브릿지가 필요합니다.');
    return false;
  }

  try {
    const isInitialized = await initialize();
    if (!isInitialized) {
      console.warn('Health Connect 초기화 실패');
      return false;
    }

    const granted = await requestPermission(REQUIRED_PERMISSIONS);
    return granted.length === REQUIRED_PERMISSIONS.length;
  } catch (error) {
    console.error('Health Connect 초기화 중 에러:', error);
    return false;
  }
}

/**
 * 어제 하루 동안의 수면 시간을 반환 (분 단위)
 */
export async function getYesterdaySleepDuration() {
  if (Platform.OS !== 'android') return 420; // Mock: 7시간(420분)

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const endOfYesterday = new Date(yesterday);
  endOfYesterday.setHours(23, 59, 59, 999);

  try {
    const result = await readRecords('SleepSession', {
      timeRangeFilter: {
        operator: 'between',
        startTime: yesterday.toISOString(),
        endTime: endOfYesterday.toISOString(),
      },
    });

    let totalMinutes = 0;
    result.records.forEach(record => {
      const start = new Date(record.startTime);
      const end = new Date(record.endTime);
      totalMinutes += (end - start) / 1000 / 60;
    });

    return totalMinutes;
  } catch (err) {
    console.error('수면 데이터 읽기 실패:', err);
    return 0;
  }
}

/**
 * 오늘 자정부터 현재까지의 걸음 수를 반환
 */
export async function getTodaySteps() {
  if (Platform.OS !== 'android') return 3500; // Mock: 3500걸음

  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  try {
    const result = await readRecords('Steps', {
      timeRangeFilter: {
        operator: 'between',
        startTime: startOfDay.toISOString(),
        endTime: now.toISOString(),
      },
    });

    return result.records.reduce((acc, curr) => acc + curr.count, 0);
  } catch (err) {
    console.error('걸음수 읽기 실패:', err);
    return 0;
  }
}

/**
 * 어제 기준 일일 평균 심박변이도(HRV, RMSSD)를 반환
 * 낮을수록 피로도 높음을 의미
 */
export async function getYesterdayHRV() {
  if (Platform.OS !== 'android') return 45; // Mock: 45ms (평범한 상태)

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const endOfYesterday = new Date(yesterday);
  endOfYesterday.setHours(23, 59, 59, 999);

  try {
    const result = await readRecords('HeartRateVariabilityRmssd', {
      timeRangeFilter: {
        operator: 'between',
        startTime: yesterday.toISOString(),
        endTime: endOfYesterday.toISOString(),
      },
    });

    if (result.records.length === 0) return 45;

    let totalRmssd = 0;
    result.records.forEach(record => {
      totalRmssd += record.heartRateVariabilityMillis;
    });

    return totalRmssd / result.records.length;
  } catch (err) {
    console.error('HRV 읽기 실패:', err);
    return 45;
  }
}

/**
 * 오늘 평균 심박수를 반환
 */
export async function getTodayAvgHeartRate() {
  if (Platform.OS !== 'android') return 72; // Mock: 72 bpm

  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  try {
    const result = await readRecords('HeartRate', {
      timeRangeFilter: {
        operator: 'between',
        startTime: startOfDay.toISOString(),
        endTime: now.toISOString(),
      },
    });

    if (result.records.length === 0) return 72;

    let totalBpm = 0;
    let count = 0;
    result.records.forEach(record => {
      record.samples.forEach(sample => {
        totalBpm += sample.beatsPerMinute;
        count++;
      });
    });

    return count === 0 ? 72 : totalBpm / count;
  } catch (err) {
    console.error('HR 읽기 실패:', err);
    return 72;
  }
}
