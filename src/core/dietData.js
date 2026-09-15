/**
 * dietData.js
 * 식품의약품안전처(식약처) 통합식품영양성분정보 및 농촌진흥청 국가표준식품성분 DB 기반
 * 한국인 빈출 다이어트, 헬스, 일상 외식, 편의점 가공식품 로컬 고속 캐시 DB
 */

const DIET_FOOD_DATABASE = [
  // 1. 헬스 & 다이어트 단백질/클린식
  { id: "f001", name: "닭가슴살 (생/삶음)", category: "protein", portion: "100g", calories: 120, carbs: 0.2, protein: 26.5, fat: 1.5, sodium: 74 },
  { id: "f002", name: "훈제/수비드 닭가슴살 팩", category: "protein", portion: "100g (1팩)", calories: 135, carbs: 1.5, protein: 25.0, fat: 2.2, sodium: 280 },
  { id: "f003", name: "삶은 달걀", category: "protein", portion: "1개 (50g)", calories: 77, carbs: 0.6, protein: 6.3, fat: 5.3, sodium: 71 },
  { id: "f004", name: "달걀 흰자", category: "protein", portion: "1개분 (35g)", calories: 17, carbs: 0.2, protein: 3.6, fat: 0.1, sodium: 55 },
  { id: "f005", name: "프로틴 쉐이크 (유청 단백)", category: "protein", portion: "1회 제공량 (30g)", calories: 120, carbs: 3.0, protein: 24.0, fat: 1.2, sodium: 110 },
  { id: "f006", name: "소고기 우둔살/홍두깨살", category: "protein", portion: "100g", calories: 137, carbs: 0.0, protein: 24.8, fat: 3.5, sodium: 52 },
  { id: "f007", name: "연어 구이", category: "protein", portion: "100g", calories: 206, carbs: 0.0, protein: 22.1, fat: 12.3, sodium: 60 },
  { id: "f008", name: "연두부 / 판두부", category: "protein", portion: "100g", calories: 76, carbs: 2.4, protein: 8.5, fat: 4.2, sodium: 8 },
  { id: "f009", name: "그릭 요거트 (무가당/플레인)", category: "protein", portion: "100g", calories: 95, carbs: 3.8, protein: 10.5, fat: 3.2, sodium: 45 },
  { id: "f010", name: "틸라피아 / 대구살 구이", category: "protein", portion: "100g", calories: 96, carbs: 0.0, protein: 20.1, fat: 1.7, sodium: 56 },

  // 2. 건강 탄수화물 (복합 탄수화물)
  { id: "f020", name: "현미밥", category: "carbs", portion: "1공기 (210g)", calories: 320, carbs: 68.0, protein: 6.0, fat: 2.0, sodium: 5 },
  { id: "f021", name: "백미밥 (흰쌀밥)", category: "carbs", portion: "1공기 (210g)", calories: 305, carbs: 65.5, protein: 5.5, fat: 0.8, sodium: 4 },
  { id: "f022", name: "찐 고구마", category: "carbs", portion: "중간 크기 1개 (150g)", calories: 195, carbs: 45.0, protein: 2.4, fat: 0.3, sodium: 36 },
  { id: "f023", name: "찐 감자", category: "carbs", portion: "중간 크기 1개 (130g)", calories: 110, carbs: 25.0, protein: 2.8, fat: 0.2, sodium: 4 },
  { id: "f024", name: "오트밀 (귀리)", category: "carbs", portion: "1회분 (40g)", calories: 152, carbs: 27.0, protein: 5.3, fat: 2.6, sodium: 2 },
  { id: "f025", name: "통밀 식빵", category: "carbs", portion: "1장 (35g)", calories: 85, carbs: 15.2, protein: 3.8, fat: 1.2, sodium: 140 },
  { id: "f026", name: "바나나", category: "carbs", portion: "1개 (100g)", calories: 89, carbs: 22.8, protein: 1.1, fat: 0.3, sodium: 1 },
  { id: "f027", name: "단호박 (찐것)", category: "carbs", portion: "100g", calories: 66, carbs: 14.5, protein: 1.7, fat: 0.2, sodium: 2 },

  // 3. 샐러드 & 채소/과일
  { id: "f030", name: "닭가슴살 샐러드 (발사믹 드레싱)", category: "salad", portion: "1그릇 (250g)", calories: 230, carbs: 12.0, protein: 25.0, fat: 8.5, sodium: 380 },
  { id: "f031", name: "리코타 치즈 샐러드", category: "salad", portion: "1그릇 (220g)", calories: 310, carbs: 16.0, protein: 11.0, fat: 22.0, sodium: 410 },
  { id: "f032", name: "방울토마토", category: "salad", portion: "10개 (150g)", calories: 24, carbs: 4.8, protein: 1.2, fat: 0.2, sodium: 8 },
  { id: "f033", name: "오이 / 당근 스틱", category: "salad", portion: "1개 (100g)", calories: 15, carbs: 3.2, protein: 0.7, fat: 0.1, sodium: 2 },
  { id: "f034", name: "아보카도", category: "salad", portion: "1/2개 (70g)", calories: 120, carbs: 4.5, protein: 1.4, fat: 11.0, sodium: 5 },
  { id: "f035", name: "사과", category: "salad", portion: "1개 (200g)", calories: 104, carbs: 27.6, protein: 0.5, fat: 0.3, sodium: 2 },

  // 4. 인기 프랜차이즈 다이어트/외식 메뉴
  { id: "f040", name: "서브웨이 로티세리 바비큐 치킨 15cm (위트빵)", category: "fastfood", portion: "1개 (247g)", calories: 327, carbs: 40.0, protein: 29.0, fat: 6.1, sodium: 530 },
  { id: "f041", name: "서브웨이 에그마요 15cm", category: "fastfood", portion: "1개 (238g)", calories: 416, carbs: 39.0, protein: 14.0, fat: 22.8, sodium: 620 },
  { id: "f042", name: "샐러디 칠리베이컨 웜볼", category: "fastfood", portion: "1그릇 (320g)", calories: 485, carbs: 54.0, protein: 18.0, fat: 21.0, sodium: 680 },
  { id: "f043", name: "포케 (연어 현미밥 포케)", category: "fastfood", portion: "1그릇 (350g)", calories: 510, carbs: 58.0, protein: 24.0, fat: 19.0, sodium: 720 },

  // 5. 일상 한식 & 외식 (일반식)
  { id: "f050", name: "김치찌개 (돼지고기 포함, 1인분)", category: "korean", portion: "1뚝배기 (400g)", calories: 280, carbs: 12.0, protein: 18.0, fat: 16.0, sodium: 1850 },
  { id: "f051", name: "된장찌개 (두부, 버섯 포함)", category: "korean", portion: "1뚝배기 (400g)", calories: 190, carbs: 14.0, protein: 14.0, fat: 7.0, sodium: 1620 },
  { id: "f052", name: "제육볶음", category: "korean", portion: "1접시 (200g)", calories: 430, carbs: 16.0, protein: 28.0, fat: 27.0, sodium: 980 },
  { id: "f053", name: "소고기 미역국", category: "korean", portion: "1대접 (350g)", calories: 140, carbs: 6.0, protein: 12.0, fat: 7.0, sodium: 1100 },
  { id: "f054", name: "비빔밥 (나물+계란후라이)", category: "korean", portion: "1그릇 (450g)", calories: 550, carbs: 88.0, protein: 16.0, fat: 14.0, sodium: 1050 },
  { id: "f055", name: "소고기 설렁탕/순대국 (밥 제외)", category: "korean", portion: "1뚝배기 (500g)", calories: 340, carbs: 8.0, protein: 32.0, fat: 19.0, sodium: 1200 },

  // 6. 대표적인 치팅 / 회식 / 배달 음식 (Rescue 대상)
  { id: "f070", name: "삼겹살 구이 (1인분)", category: "cheat", portion: "200g", calories: 660, carbs: 0.0, protein: 34.0, fat: 58.0, sodium: 140 },
  { id: "f071", name: "후라이드 치킨", category: "cheat", portion: "반 마리 (4조각/350g)", calories: 920, carbs: 42.0, protein: 55.0, fat: 58.0, sodium: 1650 },
  { id: "f072", name: "양념 치킨", category: "cheat", portion: "반 마리 (4조각/380g)", calories: 1080, carbs: 75.0, protein: 50.0, fat: 64.0, sodium: 1980 },
  { id: "f073", name: "짜장면", category: "cheat", portion: "1그릇 (600g)", calories: 785, carbs: 125.0, protein: 21.0, fat: 22.0, sodium: 2100 },
  { id: "f074", name: "짬뽕 (해물 짬뽕)", category: "cheat", portion: "1그릇 (750g)", calories: 690, carbs: 110.0, protein: 28.0, fat: 14.0, sodium: 3200 },
  { id: "f075", name: "떡볶이", category: "cheat", portion: "1인분 (300g)", calories: 520, carbs: 105.0, protein: 10.0, fat: 6.0, sodium: 1550 },
  { id: "f076", name: "피자 (콤비네이션/페퍼로니)", category: "cheat", portion: "2조각 (200g)", calories: 560, carbs: 54.0, protein: 22.0, fat: 27.0, sodium: 1100 },
  { id: "f077", name: "신라면/진라면 (국물 포함)", category: "cheat", portion: "1봉지 (120g)", calories: 505, carbs: 80.0, protein: 10.0, fat: 16.0, sodium: 1790 },

  // 7. 편의점·가공식품
  { id: "f080", name: "삼각김밥 (참치마요)", category: "convenience", portion: "1개 (100g)", calories: 210, carbs: 32.0, protein: 6.5, fat: 6.5, sodium: 520 },
  { id: "f081", name: "삼각김밥 (김치참치)", category: "convenience", portion: "1개 (100g)", calories: 185, carbs: 30.0, protein: 6.0, fat: 4.5, sodium: 580 },
  { id: "f082", name: "컵라면 (소컵)", category: "convenience", portion: "1개 (65g)", calories: 280, carbs: 42.0, protein: 6.0, fat: 10.0, sodium: 980 },
  { id: "f083", name: "도시락 (편의점 일반)", category: "convenience", portion: "1개 (400g)", calories: 720, carbs: 95.0, protein: 22.0, fat: 26.0, sodium: 1400 },
  { id: "f084", name: "프로틴 음료 (RTD)", category: "convenience", portion: "1병 (250ml)", calories: 150, carbs: 8.0, protein: 20.0, fat: 3.5, sodium: 120 },
  { id: "f085", name: "그릭요거트 컵 (편의점)", category: "convenience", portion: "1개 (100g)", calories: 100, carbs: 5.0, protein: 9.0, fat: 4.0, sodium: 50 },
  { id: "f086", name: "닭가슴살 소시지", category: "convenience", portion: "1팩 (100g)", calories: 145, carbs: 4.0, protein: 18.0, fat: 6.0, sodium: 620 },
  { id: "f087", name: "샐러드 컵 (편의점)", category: "convenience", portion: "1개 (180g)", calories: 160, carbs: 12.0, protein: 8.0, fat: 8.0, sodium: 340 },
  { id: "f088", name: "바나나우유", category: "convenience", portion: "1팩 (240ml)", calories: 200, carbs: 32.0, protein: 5.0, fat: 5.5, sodium: 90 },
  { id: "f089", name: "핫바 / 어묵바", category: "convenience", portion: "1개 (70g)", calories: 170, carbs: 14.0, protein: 8.0, fat: 9.0, sodium: 680 },

  // 8. 간식 및 음료
  { id: "f090", name: "아이스 아메리카노", category: "beverage", portion: "1잔 (355ml)", calories: 10, carbs: 1.5, protein: 0.8, fat: 0.1, sodium: 5 },
  { id: "f091", name: "카페 라떼 (일반 우유)", category: "beverage", portion: "1잔 (355ml)", calories: 180, carbs: 14.0, protein: 10.0, fat: 9.0, sodium: 115 },
  { id: "f092", name: "바닐라 라떼 / 시럽 음료", category: "beverage", portion: "1잔 (355ml)", calories: 270, carbs: 36.0, protein: 8.0, fat: 9.5, sodium: 130 },
  { id: "f093", name: "제로 탄산음료 (제로콜라 등)", category: "beverage", portion: "1캔 (355ml)", calories: 0, carbs: 0.0, protein: 0.0, fat: 0.0, sodium: 30 },
  { id: "f094", name: "견과류 (아몬드/호두 믹스)", category: "beverage", portion: "1봉지 (25g)", calories: 155, carbs: 5.0, protein: 5.2, fat: 13.5, sodium: 2 },
  { id: "f095", name: "단백질바", category: "beverage", portion: "1개 (40g)", calories: 180, carbs: 18.0, protein: 15.0, fat: 6.0, sodium: 150 },
  { id: "f096", name: "두유 (무가당)", category: "beverage", portion: "1팩 (190ml)", calories: 95, carbs: 4.0, protein: 7.0, fat: 5.0, sodium: 40 },

  // 9. 확장 캐시 (빈출 외식·편의점·한식)
  { id: "f100", name: "닭가슴살 스테이크", category: "protein", portion: "120g", calories: 165, carbs: 1, protein: 32, fat: 3.5, sodium: 420 },
  { id: "f101", name: "우삼겹 구이", category: "protein", portion: "100g", calories: 280, carbs: 0, protein: 18, fat: 23, sodium: 55 },
  { id: "f102", name: "돼지고기 안심", category: "protein", portion: "100g", calories: 143, carbs: 0, protein: 21, fat: 6.5, sodium: 48 },
  { id: "f103", name: "계란말이", category: "protein", portion: "2줄(120g)", calories: 210, carbs: 4, protein: 14, fat: 15, sodium: 380 },
  { id: "f104", name: "참치캔 (오일드레인)", category: "protein", portion: "1캔(100g)", calories: 116, carbs: 0, protein: 26, fat: 1, sodium: 360 },
  { id: "f105", name: "새우 구이", category: "protein", portion: "100g", calories: 99, carbs: 0.2, protein: 24, fat: 0.3, sodium: 190 },
  { id: "f106", name: "오징어 숙회", category: "protein", portion: "100g", calories: 92, carbs: 3, protein: 16, fat: 1.4, sodium: 250 },
  { id: "f107", name: "소고기 채끝살", category: "protein", portion: "100g", calories: 220, carbs: 0, protein: 22, fat: 14, sodium: 60 },
  { id: "f108", name: "닭다리살 (껍질제거)", category: "protein", portion: "100g", calories: 150, carbs: 0, protein: 22, fat: 6.5, sodium: 85 },
  { id: "f109", name: "저지방 코티지치즈", category: "protein", portion: "100g", calories: 82, carbs: 3.5, protein: 11, fat: 2.5, sodium: 320 },
  { id: "f110", name: "귀리밥", category: "carbs", portion: "1공기(210g)", calories: 310, carbs: 65, protein: 7, fat: 2.5, sodium: 8 },
  { id: "f111", name: "퀴노아 밥", category: "carbs", portion: "1공기(180g)", calories: 250, carbs: 44, protein: 9, fat: 4, sodium: 6 },
  { id: "f112", name: "옥수수 (찐것)", category: "carbs", portion: "1개(150g)", calories: 140, carbs: 30, protein: 4.5, fat: 1.5, sodium: 15 },
  { id: "f113", name: "베이글 (플레인)", category: "carbs", portion: "1개(90g)", calories: 250, carbs: 48, protein: 9, fat: 1.5, sodium: 430 },
  { id: "f114", name: "떡 (가래떡)", category: "carbs", portion: "100g", calories: 220, carbs: 50, protein: 4, fat: 0.4, sodium: 5 },
  { id: "f115", name: "잡곡밥", category: "carbs", portion: "1공기(210g)", calories: 315, carbs: 66, protein: 6.5, fat: 2, sodium: 6 },
  { id: "f116", name: "파스타면 (삶은것)", category: "carbs", portion: "1인분(180g)", calories: 250, carbs: 50, protein: 9, fat: 1.5, sodium: 5 },
  { id: "f117", name: "식빵 (화이트)", category: "carbs", portion: "2장(70g)", calories: 175, carbs: 33, protein: 6, fat: 2, sodium: 280 },
  { id: "f118", name: "시리얼 (콘푸레이크)", category: "carbs", portion: "30g+우유200ml", calories: 220, carbs: 38, protein: 8, fat: 4, sodium: 280 },
  { id: "f119", name: "곤약밥", category: "carbs", portion: "1공기(200g)", calories: 40, carbs: 8, protein: 1, fat: 0.2, sodium: 10 },
  { id: "f120", name: "그린샐러드 (드레싱 별도)", category: "salad", portion: "1그릇(150g)", calories: 45, carbs: 8, protein: 2, fat: 1, sodium: 40 },
  { id: "f121", name: "닭가슴살 포케", category: "salad", portion: "1그릇(350g)", calories: 480, carbs: 52, protein: 32, fat: 14, sodium: 780 },
  { id: "f122", name: "두부 샐러드", category: "salad", portion: "1그릇(250g)", calories: 210, carbs: 12, protein: 16, fat: 11, sodium: 320 },
  { id: "f123", name: "브로콜리 (찐것)", category: "salad", portion: "100g", calories: 35, carbs: 7, protein: 2.8, fat: 0.4, sodium: 30 },
  { id: "f124", name: "양상추", category: "salad", portion: "100g", calories: 15, carbs: 2.9, protein: 1.4, fat: 0.2, sodium: 10 },
  { id: "f125", name: "블루베리", category: "salad", portion: "100g", calories: 57, carbs: 14, protein: 0.7, fat: 0.3, sodium: 1 },
  { id: "f126", name: "키위", category: "salad", portion: "1개(100g)", calories: 61, carbs: 15, protein: 1.1, fat: 0.5, sodium: 3 },
  { id: "f127", name: "딸기", category: "salad", portion: "10개(150g)", calories: 48, carbs: 11, protein: 1, fat: 0.4, sodium: 2 },
  { id: "f128", name: "수박", category: "salad", portion: "1쪽(200g)", calories: 60, carbs: 15, protein: 1.2, fat: 0.3, sodium: 2 },
  { id: "f129", name: "오이무침", category: "salad", portion: "1접시(150g)", calories: 55, carbs: 8, protein: 1.5, fat: 2, sodium: 420 },
  { id: "f130", name: "맥도날드 햄버거", category: "fastfood", portion: "1개", calories: 250, carbs: 31, protein: 12, fat: 9, sodium: 490 },
  { id: "f131", name: "맥도날드 빅맥", category: "fastfood", portion: "1개", calories: 563, carbs: 44, protein: 26, fat: 33, sodium: 1010 },
  { id: "f132", name: "버거킹 와퍼", category: "fastfood", portion: "1개", calories: 630, carbs: 49, protein: 27, fat: 35, sodium: 980 },
  { id: "f133", name: "롯데리아 불고기버거", category: "fastfood", portion: "1개", calories: 450, carbs: 48, protein: 18, fat: 20, sodium: 860 },
  { id: "f134", name: "피자헛 페퍼로니 1조각", category: "fastfood", portion: "1조각", calories: 280, carbs: 28, protein: 12, fat: 14, sodium: 620 },
  { id: "f135", name: "도미노 콤비네이션 1조각", category: "fastfood", portion: "1조각", calories: 270, carbs: 30, protein: 11, fat: 12, sodium: 580 },
  { id: "f136", name: "KFC 핫크리스피", category: "fastfood", portion: "1조각", calories: 300, carbs: 14, protein: 18, fat: 18, sodium: 720 },
  { id: "f137", name: "맘스터치 싸이버거", category: "fastfood", portion: "1개", calories: 540, carbs: 48, protein: 24, fat: 28, sodium: 1100 },
  { id: "f138", name: "스타벅스 콜드브루", category: "beverage", portion: "1잔(355ml)", calories: 5, carbs: 0, protein: 0, fat: 0, sodium: 10 },
  { id: "f139", name: "스타벅스 카페라떼 톨", category: "beverage", portion: "1잔", calories: 180, carbs: 14, protein: 10, fat: 8, sodium: 120 },
  { id: "f140", name: "김치볶음밥", category: "korean", portion: "1그릇(400g)", calories: 520, carbs: 72, protein: 14, fat: 18, sodium: 980 },
  { id: "f141", name: "오므라이스", category: "korean", portion: "1그릇(400g)", calories: 580, carbs: 70, protein: 18, fat: 24, sodium: 720 },
  { id: "f142", name: "순두부찌개", category: "korean", portion: "1뚝배기(400g)", calories: 220, carbs: 10, protein: 16, fat: 12, sodium: 1450 },
  { id: "f143", name: "부대찌개", category: "korean", portion: "1인분(450g)", calories: 480, carbs: 28, protein: 24, fat: 28, sodium: 2100 },
  { id: "f144", name: "갈비탕", category: "korean", portion: "1그릇(밥별도)", calories: 350, carbs: 8, protein: 28, fat: 22, sodium: 980 },
  { id: "f145", name: "삼계탕", category: "korean", portion: "1인분(700g)", calories: 620, carbs: 18, protein: 48, fat: 38, sodium: 850 },
  { id: "f146", name: "잡채", category: "korean", portion: "1접시(200g)", calories: 280, carbs: 42, protein: 8, fat: 10, sodium: 720 },
  { id: "f147", name: "김밥 (기본)", category: "korean", portion: "1줄(250g)", calories: 420, carbs: 62, protein: 12, fat: 14, sodium: 980 },
  { id: "f148", name: "참치김밥", category: "korean", portion: "1줄(260g)", calories: 450, carbs: 60, protein: 16, fat: 16, sodium: 1050 },
  { id: "f149", name: "돈까스 (시판)", category: "korean", portion: "1인분(250g)", calories: 550, carbs: 45, protein: 28, fat: 28, sodium: 780 },
  { id: "f150", name: "우동", category: "korean", portion: "1그릇(500g)", calories: 420, carbs: 72, protein: 12, fat: 8, sodium: 1600 },
  { id: "f151", name: "냉면 (물냉면)", category: "korean", portion: "1그릇(700g)", calories: 460, carbs: 80, protein: 18, fat: 6, sodium: 1800 },
  { id: "f152", name: "비빔냉면", category: "korean", portion: "1그릇(600g)", calories: 520, carbs: 85, protein: 20, fat: 10, sodium: 1400 },
  { id: "f153", name: "족발 (앞다리)", category: "cheat", portion: "1인분(200g)", calories: 420, carbs: 2, protein: 32, fat: 32, sodium: 980 },
  { id: "f154", name: "보쌈", category: "cheat", portion: "1인분(200g)", calories: 380, carbs: 3, protein: 30, fat: 28, sodium: 720 },
  { id: "f155", name: "곱창구이", category: "cheat", portion: "1인분(180g)", calories: 450, carbs: 5, protein: 24, fat: 36, sodium: 680 },
  { id: "f156", name: "마라탕 (중간맛)", category: "cheat", portion: "1인분(500g)", calories: 580, carbs: 48, protein: 28, fat: 30, sodium: 2400 },
  { id: "f157", name: "엽기떡볶이", category: "cheat", portion: "1인분(350g)", calories: 620, carbs: 110, protein: 14, fat: 12, sodium: 2100 },
  { id: "f158", name: "치킨마요덮밥", category: "cheat", portion: "1그릇(450g)", calories: 780, carbs: 85, protein: 28, fat: 34, sodium: 1200 },
  { id: "f159", name: "돈코츠라멘", category: "cheat", portion: "1그릇(800g)", calories: 720, carbs: 80, protein: 32, fat: 30, sodium: 2200 },
  { id: "f160", name: "크림파스타", category: "cheat", portion: "1그릇(400g)", calories: 680, carbs: 68, protein: 22, fat: 34, sodium: 980 },
  { id: "f161", name: "편의점 김밥", category: "convenience", portion: "1줄", calories: 380, carbs: 58, protein: 10, fat: 12, sodium: 920 },
  { id: "f162", name: "편의점 샌드위치 (햄치즈)", category: "convenience", portion: "1개", calories: 320, carbs: 32, protein: 14, fat: 15, sodium: 780 },
  { id: "f163", name: "편의점 주먹밥", category: "convenience", portion: "1개(120g)", calories: 220, carbs: 38, protein: 5, fat: 5, sodium: 480 },
  { id: "f164", name: "컵밥 (비빔밥)", category: "convenience", portion: "1개", calories: 420, carbs: 72, protein: 12, fat: 10, sodium: 980 },
  { id: "f165", name: "프로틴쿠키", category: "convenience", portion: "1개(50g)", calories: 210, carbs: 22, protein: 15, fat: 8, sodium: 180 },
  { id: "f166", name: "닭가슴살 샐러드김밥", category: "convenience", portion: "1줄", calories: 340, carbs: 42, protein: 22, fat: 8, sodium: 720 },
  { id: "f167", name: "제로슈거 젤리", category: "beverage", portion: "1팩(50g)", calories: 15, carbs: 2, protein: 0, fat: 0, sodium: 20 },
  { id: "f168", name: "이온음료", category: "beverage", portion: "1병(500ml)", calories: 90, carbs: 22, protein: 0, fat: 0, sodium: 180 },
  { id: "f169", name: "맥주 (캔)", category: "beverage", portion: "1캔(355ml)", calories: 150, carbs: 11, protein: 1.5, fat: 0, sodium: 15 },
  { id: "f170", name: "소주 (1잔)", category: "beverage", portion: "50ml", calories: 55, carbs: 0, protein: 0, fat: 0, sodium: 1 },
  { id: "f171", name: "막걸리 1사발", category: "beverage", portion: "200ml", calories: 90, carbs: 14, protein: 1.5, fat: 0.2, sodium: 5 },
  { id: "f172", name: "과일화채", category: "salad", portion: "1그릇(200g)", calories: 120, carbs: 28, protein: 1, fat: 0.5, sodium: 8 },
  { id: "f173", name: "미역줄기볶음", category: "salad", portion: "1접시(80g)", calories: 70, carbs: 6, protein: 2, fat: 4, sodium: 520 },
  { id: "f174", name: "시금치나물", category: "salad", portion: "1접시(80g)", calories: 55, carbs: 5, protein: 3, fat: 2.5, sodium: 280 },
  { id: "f175", name: "콩나물무침", category: "salad", portion: "1접시(100g)", calories: 45, carbs: 5, protein: 4, fat: 1.5, sodium: 320 },
  { id: "f176", name: "계란찜", category: "protein", portion: "1그릇(150g)", calories: 140, carbs: 2, protein: 12, fat: 9, sodium: 380 },
  { id: "f177", name: "스크램블에그", category: "protein", portion: "2개분", calories: 180, carbs: 2, protein: 12, fat: 14, sodium: 180 },
  { id: "f178", name: "연어회", category: "protein", portion: "100g", calories: 140, carbs: 0, protein: 22, fat: 5.5, sodium: 80 },
  { id: "f179", name: "광어회", category: "protein", portion: "100g", calories: 95, carbs: 0, protein: 20, fat: 1.5, sodium: 60 },
  { id: "f180", name: "초밥 8피스", category: "fastfood", portion: "8개", calories: 400, carbs: 60, protein: 18, fat: 8, sodium: 820 }
];

// 인분 변형을 자동 확장해 검색·기록 커버리지를 높입니다 (공공영양 수치 비율 환산).
(function expandServingVariants(db) {
  const round1 = (n) => Math.round(Number(n) * 10) / 10;
  const seeds = db.slice();
  let i = 0;
  for (const item of seeds) {
    for (const [label, mul] of [["·반분", 0.5], ["·1.5인분", 1.5], ["·2인분", 2]]) {
      i += 1;
      db.push({
        id: `vx${i}`,
        name: `${item.name} ${label}`,
        category: item.category,
        portion: `${item.portion} ${label}`,
        calories: Math.round(item.calories * mul),
        carbs: round1(item.carbs * mul),
        protein: round1(item.protein * mul),
        fat: round1(item.fat * mul),
        sodium: Math.round(item.sodium * mul)
      });
    }
  }
})(DIET_FOOD_DATABASE);

window.DIET_FOOD_DATABASE = DIET_FOOD_DATABASE;
