// 3주 (21일) 챌린지 로드맵 및 일일 습관 체크리스트 관리 모듈 (Challenge Engine)

export const CHALLENGE_CHAPTERS = [
  {
    week: 1,
    chapterTitle: "Chapter 1: ⚡ 각성의 불꽃 (Spark of Awakening)",
    chapterDesc: "작은 시작(Tiny Habits)으로 뇌의 기저핵에 첫 러닝 루틴을 각인하는 단계입니다.",
    rewardSummary: "7일 달성 시 '루키 러너 배지' & 미스터리 볼트 박스 증정"
  },
  {
    week: 2,
    chapterTitle: "Chapter 2: 🔥 리듬과 지구력 (Rhythm & Endurance)",
    chapterDesc: "작심삼일 고비를 넘어 페이스를 조절하고 몸에 러닝 리듬을 체화하는 단계입니다.",
    rewardSummary: "14일 달성 시 '어반 스트라이더 칭호' & 5km 완주 팩 증정"
  },
  {
    week: 3,
    chapterTitle: "Chapter 3: 👑 번개 타이탄 진화 (Thunder Titan)",
    chapterDesc: "자아 효능감(Self-Efficacy)을 바탕으로 스스로 달리는 진정한 러너로 독립하는 피날레입니다.",
    rewardSummary: "21일 완주 시 '골든 마라토너 트로피' & 전설 스킨 잠금 해제"
  }
];

export const CHALLENGE_DAYS = [
  // 1주차 : 입문 및 습관 형성기
  { day: 1, week: 1, title: "첫 걸음 런 & 스트레칭", targetKm: 1.5, desc: "집 주변 가볍게 1.5km 달리기 + 발목/무릎 스트레칭", xpReward: 150, coinReward: 50 },
  { day: 2, week: 1, title: "리듬 조깅 & 수분 충전", targetKm: 2.0, desc: "2.0km 편안한 호흡으로 조깅 + 물 1.5L 마시기", xpReward: 180, coinReward: 50 },
  { day: 3, week: 1, title: "가벼운 회복 워킹 & 코어", targetKm: 1.0, desc: "1.0km 쿨다운 산책 + 플랭크 1분 3세트", xpReward: 120, coinReward: 50 },
  { day: 4, week: 1, title: "페이스 유지 2.5km 러닝", targetKm: 2.5, desc: "일정한 속도로 2.5km 지속 달리기", xpReward: 200, coinReward: 60 },
  { day: 5, week: 1, title: "펫과 함께 인터벌 런", targetKm: 2.0, desc: "빠르게 1분 + 천천히 1분 x 5세트 인터벌", xpReward: 220, coinReward: 70 },
  { day: 6, week: 1, title: "주말 3km 챌린지", targetKm: 3.0, desc: "한 주의 노력을 확인하는 3.0km 런", xpReward: 250, coinReward: 80 },
  { day: 7, week: 1, title: "1주차 완주! 전신 리커버리", targetKm: 1.5, desc: "1.5km 릴랙스 조깅 + 1주차 미스터리 박스 오픈", xpReward: 350, coinReward: 120, isMilestone: true },

  // 2주차 : 지구력 및 페이스 향상기
  { day: 8, week: 2, title: "새로운 한 주 3.5km 스타트", targetKm: 3.5, desc: "자신감 있게 3.5km 도심 질주", xpReward: 280, coinReward: 80 },
  { day: 9, week: 2, title: "하체 보강런 & 런지 20회", targetKm: 3.0, desc: "3.0km 런 + 런지 좌우 20회 실시", xpReward: 290, coinReward: 80 },
  { day: 10, week: 2, title: "페이스 빌드업 4.0km", targetKm: 4.0, desc: "1km마다 조금씩 속도를 높이는 빌드업 러닝", xpReward: 320, coinReward: 90 },
  { day: 11, week: 2, title: "액티브 리커버리 & 마사지", targetKm: 2.0, desc: "2.0km 천천히 털어주는 조깅 + 족욕/마사지", xpReward: 200, coinReward: 70 },
  { day: 12, week: 2, title: "중거리 4.5km 스테디 런", targetKm: 4.5, desc: "호흡을 다스리며 4.5km 완벽 완주", xpReward: 350, coinReward: 100 },
  { day: 13, week: 2, title: "심폐 강화 템포런 3.5km", targetKm: 3.5, desc: "평소보다 약간 빠른 속도로 3.5km 질주", xpReward: 340, coinReward: 100 },
  { day: 14, week: 2, title: "2주차 마스터! 5km 돌파", targetKm: 5.0, desc: "드디어 5.0km 완주 달성! 2주차 골든 체스트 오픈", xpReward: 500, coinReward: 200, isMilestone: true },

  // 3주차 : 러너 완성 및 챌린지 클라이맥스
  { day: 15, week: 3, title: "러너 완성 주간 4.5km", targetKm: 4.5, desc: "완벽한 러닝 폼으로 4.5km 달리기", xpReward: 380, coinReward: 100 },
  { day: 16, week: 3, title: "파워 힐 & 스쿼트 보강", targetKm: 4.0, desc: "4.0km 런 + 맨몸 스쿼트 30회 완료", xpReward: 390, coinReward: 100 },
  { day: 17, week: 3, title: "스피드 인터벌 4.0km", targetKm: 4.0, desc: "400m 전력질주 x 4세트 인터벌 트레이닝", xpReward: 420, coinReward: 120 },
  { day: 18, week: 3, title: "스마트 페이싱 5.0km", targetKm: 5.0, desc: "목표 페이스 흔들림 없이 5.0km 완주", xpReward: 440, coinReward: 120 },
  { day: 19, week: 3, title: "파이널 레이스 대비 3.0km", targetKm: 3.0, desc: "컨디션 조율용 3.0km 쾌적한 런", xpReward: 300, coinReward: 90 },
  { day: 20, week: 3, title: "멘탈 포커스 & 전신 회복", targetKm: 2.0, desc: "내일의 최종 피날레를 위한 2.0km 가벼운 조깅", xpReward: 280, coinReward: 90 },
  { day: 21, week: 3, title: "🎉 최종 보스런! 7.0km 골든 완주", targetKm: 7.0, desc: "3주 챌린지 대망의 7.0km 피날레 러닝 & 전설 트로피 획득!", xpReward: 1000, coinReward: 500, isMilestone: true }
];

export function localDateStr(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function daysBetween(fromStr, toStr) {
  const a = new Date(`${fromStr}T00:00:00`);
  const b = new Date(`${toStr}T00:00:00`);
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

export function formatRunTime(totalSec = 0) {
  const sec = Math.max(0, Math.floor(Number(totalSec) || 0));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export class ChallengeManager {
  constructor(savedProgress = {}) {
    this.completedDays = savedProgress.completedDays || [];
    this.streak = savedProgress.streak || 0;
    this.habitCue = savedProgress.habitCue || "퇴근 후 현관에서 러닝화 신고 바로 출발";
    this.startDate = savedProgress.startDate || null;
    this.lastCompletedDate = savedProgress.lastCompletedDate || null;
    this.dayRecords = savedProgress.dayRecords || {};
    this.currentDay = 1;
    this.ensureCalendarState();
  }

  ensureCalendarState() {
    const today = localDateStr();
    if (!this.startDate) this.startDate = today;
    if (this.completedDays.length > 0 && !this.lastCompletedDate) {
      this.lastCompletedDate = today;
    }
    this.currentDay = this.getActiveDay();
  }

  getCalendarUnlockedDay() {
    const today = localDateStr();
    if (!this.startDate) this.startDate = today;
    const elapsed = Math.max(0, daysBetween(this.startDate, today));
    return Math.min(elapsed + 1, 21);
  }

  getNextMissionDay() {
    return Math.min(this.completedDays.length + 1, 21);
  }

  getActiveDay() {
    if (this.completedDays.length >= 21) return 21;
    return Math.min(this.getNextMissionDay(), this.getCalendarUnlockedDay());
  }

  isDayUnlocked(day) {
    return day <= this.getCalendarUnlockedDay() && day <= this.getNextMissionDay();
  }

  isWaitingForTomorrow() {
    return this.completedDays.length < 21 && this.getNextMissionDay() > this.getCalendarUnlockedDay();
  }

  hoursUntilTomorrow() {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    return Math.max(1, Math.ceil((tomorrow.getTime() - now.getTime()) / 3600000));
  }

  isDayCompleted(day) {
    return this.completedDays.includes(day);
  }

  getDayRecord(day) {
    return this.dayRecords?.[day] || null;
  }

  findQualifyingWorkout(workouts, day) {
    const mission = CHALLENGE_DAYS.find((d) => d.day === day);
    if (!mission) return null;
    const usedIds = Object.values(this.dayRecords || {}).map((r) => r.workoutId).filter(Boolean);
    return (workouts || []).find((w) =>
      w && !usedIds.includes(w.id) &&
      (Number(w.distanceKm) || 0) >= mission.targetKm &&
      (Number(w.elapsedSeconds) || 0) > 0
    ) || null;
  }

  tryCompleteFromWorkout(day, workout) {
    const mission = CHALLENGE_DAYS.find((d) => d.day === day);
    if (!mission) return { ok: false, reason: "invalid" };
    if (this.isDayCompleted(day)) return { ok: false, reason: "already" };
    if (!this.isDayUnlocked(day) || day !== this.getNextMissionDay()) {
      return { ok: false, reason: this.isWaitingForTomorrow() ? "tomorrow" : "locked" };
    }
    if (!workout || (Number(workout.distanceKm) || 0) < mission.targetKm || !(Number(workout.elapsedSeconds) > 0)) {
      return { ok: false, reason: "insufficient" };
    }

    const today = localDateStr();
    if (this.lastCompletedDate) {
      const gap = daysBetween(this.lastCompletedDate, today);
      this.streak = gap > 1 ? 1 : this.streak + 1;
    } else {
      this.streak = 1;
    }

    this.completedDays.push(day);
    this.lastCompletedDate = today;
    this.dayRecords[day] = {
      workoutId: workout.id || null,
      distanceKm: Number(workout.distanceKm) || 0,
      calories: Number(workout.calories) || 0,
      elapsedSeconds: Number(workout.elapsedSeconds) || 0,
      completedAt: today
    };
    this.currentDay = this.getActiveDay();
    return { ok: true, record: this.dayRecords[day], mission };
  }

  setHabitCue(newCue) {
    this.habitCue = newCue;
  }

  getChapterInfo(weekNum) {
    return CHALLENGE_CHAPTERS.find((c) => c.week === weekNum) || CHALLENGE_CHAPTERS[0];
  }

  getProgressPercentage() {
    return Math.round((this.completedDays.length / 21) * 100);
  }

  reset() {
    this.completedDays = [];
    this.streak = 0;
    this.startDate = localDateStr();
    this.lastCompletedDate = null;
    this.dayRecords = {};
    this.currentDay = 1;
  }

  toJSON() {
    this.currentDay = this.getActiveDay();
    return {
      completedDays: this.completedDays,
      currentDay: this.currentDay,
      streak: this.streak,
      habitCue: this.habitCue,
      startDate: this.startDate,
      lastCompletedDate: this.lastCompletedDate,
      dayRecords: this.dayRecords
    };
  }
}
