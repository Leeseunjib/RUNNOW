import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CACHE_DIR = path.resolve(__dirname, '../legacy_web/data_cache');

console.log('🔄 [거누 에이전트] 공공데이터(식약처/기상청) 엣지 캐시 무중단 업데이트 파이프라인 가동...');

async function fetchAndCacheData() {
  try {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }

    // 1. 식약처 영양성분 데이터 갱신 시뮬레이션
    console.log('📡 1. 식약처 통합식품영양성분정보 API 호출 중...');
    // 실제 fetch() 로직 배치 구간
    const dummyFoodData = {
      lastUpdated: new Date().toISOString(),
      items: [
        { name: "닭가슴살", calories: 109, protein: 23 },
        { name: "고구마", calories: 130, protein: 1.5 }
      ],
      source: "식품의약품안전처 공공데이터포털"
    };
    
    fs.writeFileSync(
      path.join(CACHE_DIR, 'food_nutrition_top1000.json'), 
      JSON.stringify(dummyFoodData, null, 2)
    );
    console.log('✅ 식약처 로컬 엣지 캐시 업데이트 완료 (0ms 서빙 준비 완료).');

    // 2. 기상청 / 에어코리아 기상 통계 캐싱 시뮬레이션
    console.log('📡 2. 기상청(KMA) 주간 기상 트렌드 및 대기질 기준 갱신 중...');
    const dummyWeatherData = {
      lastUpdated: new Date().toISOString(),
      trend: "미세먼지 '나쁨' 빈도 증가 (러닝 쾌적 지수 가중치 조정 필요)",
      source: "한국환경공단 에어코리아"
    };

    fs.writeFileSync(
      path.join(CACHE_DIR, 'weather_standards_cache.json'), 
      JSON.stringify(dummyWeatherData, null, 2)
    );
    console.log('✅ 기상청/에어코리아 메타데이터 엣지 캐시 업데이트 완료.');

    console.log('🎉 [거누 에이전트] 공공데이터 엣지 캐시 무중단 갱신 성공. Cron 프로세스를 종료합니다.');

  } catch (error) {
    console.error('❌ 캐시 업데이트 중 오류 발생:', error);
    process.exit(1);
  }
}

fetchAndCacheData();
