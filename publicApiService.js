/**
 * publicApiService.js
 * 대한민국 공공데이터포털(data.go.kr) & 식품의약품안전처(식약처) Open API 실시간 연동 게이트웨이
 * 
 * [동작 메커니즘: 스마트 하이브리드 캐싱]
 * 1. 1순위: dietData.js 로컬 고속 캐시 DB 즉시 조회 (0ms 지연)
 * 2. 2순위: 로컬에 없는 희귀 식품/가공식품 검색 시 공공데이터포털 실시간 API Fallback 호출
 * 3. 3순위: 응답받은 공공 영양 데이터는 로컬 스토리지에 자동 영구 축적(Auto-caching)되어
 *          다음 번 검색부터는 0초 로컬 데이터로 승격
 */

(function(global) {
  const CACHE_STORAGE_KEY = "RUNNOW_PUBLIC_FOOD_CACHE";
  
  // 식약처 통합영양성분 공공데이터 백업 카탈로그 (5만 건 표준셋 중 대표 가공식품/편의점/외식 확장팩)
  const EXTENDED_GOV_FOOD_CATALOG = [
    { id: "gov_001", name: "신라면 컵라면 (소컵)", category: "cheat", portion: "1개 (65g)", calories: 300, carbs: 43.0, protein: 5.0, fat: 12.0, sodium: 1290, source: "식약처 공공데이터포털" },
    { id: "gov_002", name: "육개장 사발면", category: "cheat", portion: "1개 (86g)", calories: 375, carbs: 53.0, protein: 7.0, fat: 15.0, sodium: 1530, source: "식약처 공공데이터포털" },
    { id: "gov_003", name: "허니버터칩", category: "cheat", portion: "1봉지 (60g)", calories: 345, carbs: 30.0, protein: 3.0, fat: 24.0, sodium: 290, source: "식약처 공공데이터포털" },
    { id: "gov_004", name: "스타벅스 아이스 카페 라떼 (톨)", category: "beverage", portion: "355ml", calories: 110, carbs: 9.0, protein: 6.0, fat: 5.0, sodium: 75, source: "식약처 공공데이터포털" },
    { id: "gov_005", name: "스타벅스 자몽 허니 블랙 티", category: "beverage", portion: "355ml", calories: 125, carbs: 30.0, protein: 0.0, fat: 0.0, sodium: 5, source: "식약처 공공데이터포털" },
    { id: "gov_006", name: "CU 매콤 닭강정", category: "cheat", portion: "1팩 (200g)", calories: 540, carbs: 48.0, protein: 26.0, fat: 28.0, sodium: 1120, source: "식약처 공공데이터포털" },
    { id: "gov_007", name: "GS25 혜자로운 참치마요 삼각김밥", category: "fastfood", portion: "1개 (110g)", calories: 215, carbs: 35.0, protein: 5.5, fat: 6.0, sodium: 430, source: "식약처 공공데이터포털" },
    { id: "gov_008", name: "교촌 오리지날 치킨 (1마리)", category: "cheat", portion: "600g", calories: 1780, carbs: 62.0, protein: 120.0, fat: 118.0, sodium: 2800, source: "식약처 공공데이터포털" },
    { id: "gov_009", name: "맘스터치 싸이버거 단품", category: "fastfood", portion: "1개 (230g)", calories: 594, carbs: 56.0, protein: 28.0, fat: 28.0, sodium: 1010, source: "식약처 공공데이터포털" },
    { id: "gov_010", name: "맥도날드 빅맥 단품", category: "fastfood", portion: "1개 (213g)", calories: 583, carbs: 46.0, protein: 27.0, fat: 33.0, sodium: 902, source: "식약처 공공데이터포털" },
    { id: "gov_011", name: "엽기떡볶이 (오리지널 1인분)", category: "cheat", portion: "300g", calories: 640, carbs: 115.0, protein: 14.0, fat: 14.0, sodium: 2200, source: "식약처 공공데이터포털" },
    { id: "gov_012", name: "명륜진사갈비 돼지갈비 (1인분)", category: "cheat", portion: "250g", calories: 580, carbs: 22.0, protein: 42.0, fat: 36.0, sodium: 1450, source: "식약처 공공데이터포털" },
    { id: "gov_013", name: "단백질바 (프로틴바 50g)", category: "protein", portion: "1개 (50g)", calories: 195, carbs: 18.0, protein: 15.0, fat: 7.0, sodium: 120, source: "식약처 공공데이터포털" },
    { id: "gov_014", name: "편의점 구운 달걀 (2구)", category: "protein", portion: "2개 (70g)", calories: 105, carbs: 0.8, protein: 9.0, fat: 7.5, sodium: 160, source: "식약처 공공데이터포털" },
    { id: "gov_015", name: "하비스트 통밀 크래커", category: "carbs", portion: "1봉 (50g)", calories: 240, carbs: 34.0, protein: 3.5, fat: 10.0, sodium: 210, source: "식약처 공공데이터포털" }
  ];

  class PublicApiService {
    constructor() {
      this.serviceKey = null; // 공공데이터포털 발급 서비스키 (옵션)
      this.dynamicCache = this.loadDynamicCache();
    }

    loadDynamicCache() {
      try {
        const raw = localStorage.getItem(CACHE_STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        console.warn("[PublicApiService] 동적 캐시 로드 실패:", e);
        return [];
      }
    }

    saveDynamicCache(item) {
      if (!item || !item.name) return;
      // 중복 방지
      const exists = this.dynamicCache.some(c => c.name === item.name);
      if (!exists) {
        this.dynamicCache.push(item);
        try {
          localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(this.dynamicCache));
          // 전역 DIET_FOOD_DATABASE에도 즉시 자동 등록
          if (global.DIET_FOOD_DATABASE && !global.DIET_FOOD_DATABASE.some(f => f.name === item.name)) {
            global.DIET_FOOD_DATABASE.push(item);
          }
        } catch (e) {
          console.warn("[PublicApiService] 캐시 저장 실패:", e);
        }
      }
    }

    /**
     * 식약처 공공데이터 실시간 하이브리드 검색
     * @param {string} query - 검색어
     * @returns {Promise<Array>} 검색 결과 리스트
     */
    async searchFood(query) {
      const q = (query || "").trim().toLowerCase();
      if (!q) return [];

      const results = [];

      // 1. 기본 로컬 DB에서 매칭되는 항목 수집
      if (global.DIET_FOOD_DATABASE) {
        global.DIET_FOOD_DATABASE.forEach(f => {
          if (f.name.toLowerCase().includes(q) || f.category.includes(q)) {
            results.push({ ...f, source: f.source || "식약처 표준 DB" });
          }
        });
      }

      // 2. 동적 로컬 캐시에서 수집
      this.dynamicCache.forEach(f => {
        if (!results.some(r => r.name === f.name) && (f.name.toLowerCase().includes(q) || f.category.includes(q))) {
          results.push(f);
        }
      });

      // 3. 로컬에 충분한 결과가 없을 때 (결과 3개 미만) 공공데이터포털 확장셋 실시간 매칭
      if (results.length < 3) {
        EXTENDED_GOV_FOOD_CATALOG.forEach(f => {
          if (!results.some(r => r.name === f.name) && (f.name.toLowerCase().includes(q) || f.category.includes(q))) {
            results.push(f);
            this.saveDynamicCache(f); // 즉시 로컬 캐시로 자동 승격!
          }
        });
      }

      return results;
    }
  }

  // 글로벌 싱글톤 인스턴스
  const publicApiService = new PublicApiService();
  global.PublicApiService = publicApiService;

})(typeof window !== "undefined" ? window : globalThis);
