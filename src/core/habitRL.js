import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * On-Device 강화학습(Q-Learning) 엔진
 * 서버에 의존하지 않고 로컬 기기 내에서 사용자의 생활 패턴을 학습합니다.
 */
class HabitRLEngine {
  constructor() {
    this.Q_TABLE_KEY = 'RUNNOW_HABIT_Q_TABLE';
    
    // Q-Table 구조: { "state": { "action": qValue } }
    this.qTable = {};
    
    this.alpha = 0.2; // 학습률 (새로운 보상을 얼마나 반영할지)
    this.gamma = 0.0; // 할인율 (단일 선택 문제인 Contextual Bandit 형태이므로 0으로 설정)
    this.epsilon = 0.2; // 탐색 비율 (20% 확률로 무작위 추천하여 새로운 패턴 발견)

    this.actions = ['high_intensity', 'low_intensity', 'rest'];
    
    // 현재 세션의 상태와 제안했던 액션을 임시 저장
    this.lastState = null;
    this.lastAction = null;
  }

  /**
   * 로컬 스토리지에서 Q-Table을 불러옵니다.
   */
  async loadQTable() {
    try {
      // 브라우저/PWA 호환을 위해 localStorage 우선 확인 (모의 환경)
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(this.Q_TABLE_KEY);
        if (raw) this.qTable = JSON.parse(raw);
        return;
      }

      // React Native 환경
      if (AsyncStorage) {
        const raw = await AsyncStorage.getItem(this.Q_TABLE_KEY);
        if (raw) this.qTable = JSON.parse(raw);
      }
    } catch (err) {
      console.error('[HabitRL] Q-Table 로드 실패', err);
    }
  }

  /**
   * 로컬 스토리지에 Q-Table을 저장합니다.
   */
  async saveQTable() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(this.Q_TABLE_KEY, JSON.stringify(this.qTable));
        return;
      }

      if (AsyncStorage) {
        await AsyncStorage.setItem(this.Q_TABLE_KEY, JSON.stringify(this.qTable));
      }
    } catch (err) {
      console.error('[HabitRL] Q-Table 저장 실패', err);
    }
  }

  /**
   * 현재 시간과 요일 등을 바탕으로 State 문자열을 생성합니다.
   */
  getCurrentState() {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay(); // 0(일) ~ 6(토)

    let timeState = 'night';
    if (hour >= 5 && hour < 12) timeState = 'morning';
    else if (hour >= 12 && hour < 18) timeState = 'afternoon';

    const dayState = (day === 0 || day === 6) ? 'weekend' : 'weekday';

    // 향후 날씨(weather) API 연동 시 상태 확장이 가능합니다.
    return `${dayState}_${timeState}`;
  }

  /**
   * Q-Table 값을 바탕으로 최적의 행동(Action)을 결정합니다.
   * Epsilon-Greedy 정책 사용.
   */
  async suggestAction() {
    await this.loadQTable();
    const state = this.getCurrentState();
    
    // Q-Table에 해당 상태가 없으면 0으로 초기화
    if (!this.qTable[state]) {
      this.qTable[state] = { high_intensity: 0, low_intensity: 0, rest: 0 };
    }

    let selectedAction;
    
    // Epsilon 확률로 탐색(Exploration) - 무작위 제안
    if (Math.random() < this.epsilon) {
      const randomIndex = Math.floor(Math.random() * this.actions.length);
      selectedAction = this.actions[randomIndex];
      console.log(`[HabitRL] 탐색(Exploration) 발생: ${selectedAction} 제안`);
    } else {
      // (1-Epsilon) 확률로 활용(Exploitation) - 가장 높은 Q값을 가진 액션 선택
      const actions = this.qTable[state];
      selectedAction = Object.keys(actions).reduce((a, b) => actions[a] > actions[b] ? a : b);
      console.log(`[HabitRL] 활용(Exploitation) 적용: ${selectedAction} 제안`);
    }

    this.lastState = state;
    this.lastAction = selectedAction;
    
    return {
      state,
      action: selectedAction
    };
  }

  /**
   * 유저의 피드백(수락/거절/완료)을 받아 Q-Value를 업데이트합니다.
   * @param {number} reward 보상값 (수락/완료 = +10, 거절/무시 = -2)
   */
  async updateQTable(reward) {
    if (!this.lastState || !this.lastAction) {
      console.warn('[HabitRL] 최근 제안된 액션이 없어 학습할 수 없습니다.');
      return;
    }

    await this.loadQTable();
    
    const state = this.lastState;
    const action = this.lastAction;

    if (!this.qTable[state]) {
      this.qTable[state] = { high_intensity: 0, low_intensity: 0, rest: 0 };
    }

    const currentQ = this.qTable[state][action];
    // Q-learning 업데이트 공식 (Next state 고려 안함 = Contextual Bandit)
    // Q(s,a) = Q(s,a) + alpha * (reward - Q(s,a))
    const newQ = currentQ + this.alpha * (reward - currentQ);
    
    this.qTable[state][action] = newQ;
    console.log(`[HabitRL] 학습 완료: State=${state}, Action=${action}, Reward=${reward}, New Q=${newQ.toFixed(2)}`);
    
    await this.saveQTable();
  }
}

export const habitRL = new HabitRLEngine();

if (typeof window !== 'undefined') window.habitRL = habitRL;
