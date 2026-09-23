import { Platform } from 'react-native';
// 실제 프로덕션에서는 Web Worker 또는 React Native 브릿지를 통해 실행합니다.
// 예: import { pipeline, env } from '@xenova/transformers';

/**
 * On-Device AI 엔진 (WebGPU / MediaPipe 기반)
 * 서버 비용 $0, 100% 프라이버시 오프라인 코칭 지원
 */
class OnDeviceAIEngine {
  constructor() {
    this.modelLoaded = false;
    this.modelName = 'Gemma-2-2B-IT';
    this.fallbackToAPI = false;
  }

  /**
   * 온디바이스 모델 초기화 및 WebGPU 가속 설정
   */
  async initialize() {
    try {
      console.log(`[OnDeviceAI] ${this.modelName} 모델 로딩 시작... (WebGPU 가속)`);
      
      // 저사양 기기나 WebGPU 미지원 기기 판별 (Fallback 로직)
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        // 모바일 네이티브 환경에서는 MediaPipe Tasks API 또는 TFLite 사용
        console.log(`[OnDeviceAI] 네이티브 추론 엔진(MediaPipe) 준비 완료`);
      } else {
        // 웹 브라우저 환경에서는 WebGPU (Transformers.js) 사용
        // env.backends.onnx.wasm.numThreads = 4;
        console.log(`[OnDeviceAI] WebGPU 추론 엔진 준비 완료`);
      }
      
      // 모의 지연 (실제로는 모델 파일 1~2GB 로드)
      await new Promise(resolve => setTimeout(resolve, 1500));
      this.modelLoaded = true;
      console.log(`[OnDeviceAI] 모델 로딩 성공. 서버 연결 없이 코칭 가능.`);
      return true;
    } catch (err) {
      console.warn(`[OnDeviceAI] 모델 로딩 실패. API Fallback 모드로 전환.`, err);
      this.fallbackToAPI = true;
      return false;
    }
  }

  /**
   * RAG 컨텍스트를 프롬프트에 주입하여 응답 생성
   * @param {string} userMessage 사용자 입력
   * @param {object} context 유저 생체 데이터(HRV, HR, 수면 등 다차원 컨텍스트) 및 강화학습(RL) 추천 액션
   */
  async generateCoachingResponse(userMessage, context) {
    if (!this.modelLoaded && !this.fallbackToAPI) {
      throw new Error('AI 엔진이 아직 준비되지 않았습니다.');
    }

    const rlActionStr = context.rlAction ? `\n- RL 추천 행동: ${context.rlAction} (이 패턴의 수락 확률이 가장 높음)` : '';
    const systemPrompt = `당신은 RUNNOW의 전속 달리기 코치(Gemini-Powered Personal Health Coach)입니다.
유저의 최신 상태(SensorFM 기반): 
- 오늘 걸음: ${context.steps}보
- 어제 수면: ${context.sleep}분
- 어제 평균 HRV: ${context.hrv}ms
- 오늘 평균 HR: ${context.hr}bpm
- 다마고치 멘탈: ${context.hunger}/100.${rlActionStr}
응답은 한두 문장으로 활기차고 초개인화되게 작성해 주세요. 수면이나 HRV가 낮으면 휴식/회복을 권장하세요. 강화학습(RL) 추천 행동이 있다면 이를 자연스럽게 권유하세요.`;

    const fullPrompt = `${systemPrompt}\nUser: ${userMessage}\nCoach:`;

    if (this.fallbackToAPI) {
      console.log('[OnDeviceAI] 서버 API를 통해 응답을 생성합니다...');
      return "서버에서 온 응답: 오늘도 활기차게 달려볼까요?!";
    }

    console.log('[OnDeviceAI] 온디바이스 추론 시작 (오프라인, PH-LLM 모드)...');
    // 모의 추론 지연
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 모의 다차원 추론 결과
    if (context.hrv < 30 || context.sleep < 300) {
      return `로컬 코치: 어제 수면이 부족하고 심박변이도(HRV)가 낮으시네요. 무리한 운동보다는 가벼운 20분 회복 걷기(Zone 1)를 추천드립니다!`;
    } else {
      if (context.rlAction === 'low_intensity') {
        return `로컬 코치: 대표님은 보통 이 시간대에는 가벼운 운동을 선호하셨죠! 오늘 저녁은 가벼운 조깅이나 플랭크로 몸을 풀어볼까요?`;
      } else if (context.rlAction === 'high_intensity') {
        return `로컬 코치: 수면 퀄리티도 좋고 심박(HR)도 안정적이네요! 유저님 패턴을 보니 지금 딱 뛸 타이밍입니다. 30분 인터벌 러닝에 도전해 볼까요?`;
      } else {
        return `로컬 코치: 와, 수면 퀄리티도 좋고 에너지가 넘치네요! 오늘 하루도 기분 좋게 땀을 내봅시다!`;
      }
    }
  }
}

export const aiEngine = new OnDeviceAIEngine();
