// 100대 정규 퀘스트 & 경험치 밸런스 데이터 (RUNNOW 100 Quests Master Engine)

export const QUEST_CATEGORIES = [
  { id: "all", name: "전체 (100)", icon: "📜" },
  { id: "starter", name: "🐣 입문 (20)", icon: "🐣" },
  { id: "distance", name: "🏃 거리 정복 (20)", icon: "🏃" },
  { id: "speed", name: "⚡ 스피드&페이스 (20)", icon: "⚡" },
  { id: "habit", name: "🔥 습관&스트릭 (20)", icon: "🔥" },
  { id: "growth", name: "🐺 육성&진화 (20)", icon: "🐺" }
];

export const QUESTS_DATA = [
  // ==========================================
  // [카테고리 1: 🐣 러너 비기닝 & 스타터 (Q1 ~ Q20)]
  // ==========================================
  {
    id: "q_001",
    category: "starter",
    title: "첫 발걸음의 시작",
    desc: "첫 번째 GPS 러닝을 시작하여 10m 이상 이동하세요.",
    targetType: "single_distance_m",
    targetValue: 10,
    xpReward: 50,
    coinReward: 10,
    icon: "👟"
  },
  {
    id: "q_002",
    category: "starter",
    title: "100m 스프린트 맛보기",
    desc: "단일 러닝에서 100m를 달성하세요.",
    targetType: "single_distance_m",
    targetValue: 100,
    xpReward: 60,
    coinReward: 12,
    icon: "💨"
  },
  {
    id: "q_003",
    category: "starter",
    title: "하프 킬로미터 워밍업",
    desc: "단일 러닝에서 500m를 돌파하세요.",
    targetType: "single_distance_m",
    targetValue: 500,
    xpReward: 80,
    coinReward: 15,
    icon: "🔥"
  },
  {
    id: "q_004",
    category: "starter",
    title: "첫 1km 완주 기념",
    desc: "1.00 km 이상 러닝을 성공적으로 완료하세요.",
    targetType: "single_distance_km",
    targetValue: 1.0,
    xpReward: 100,
    coinReward: 20,
    icon: "🎖️"
  },
  {
    id: "q_005",
    category: "starter",
    title: "볼트몽 첫 식사 챙기기",
    desc: "다마고치 탭에서 [사료 주기]를 1회 실행하세요.",
    targetType: "action_feed",
    targetValue: 1,
    xpReward: 50,
    coinReward: 10,
    icon: "🥩"
  },
  {
    id: "q_006",
    category: "starter",
    title: "놀아주며 친밀도 쌓기",
    desc: "다마고치 탭에서 [놀아주기]를 1회 실행하세요.",
    targetType: "action_play",
    targetValue: 1,
    xpReward: 50,
    coinReward: 10,
    icon: "⚽"
  },
  {
    id: "q_007",
    category: "starter",
    title: "편안한 휴식과 회복",
    desc: "다마고치 탭에서 [휴식하기]를 1회 실행하세요.",
    targetType: "action_rest",
    targetValue: 1,
    xpReward: 50,
    coinReward: 10,
    icon: "💤"
  },
  {
    id: "q_008",
    category: "starter",
    title: "첫 챌린지 미션 달성",
    desc: "21일 챌린지 1일차 미션을 성공적으로 완료하세요.",
    targetType: "challenge_day",
    targetValue: 1,
    xpReward: 100,
    coinReward: 20,
    icon: "📅"
  },
  {
    id: "q_009",
    category: "starter",
    title: "안정적인 2km 러닝",
    desc: "단일 세션에서 2.00 km를 완주하세요.",
    targetType: "single_distance_km",
    targetValue: 2.0,
    xpReward: 120,
    coinReward: 25,
    icon: "🏃"
  },
  {
    id: "q_010",
    category: "starter",
    title: "누적 3km 달성",
    desc: "전체 러닝 누적 거리 3.00 km를 돌파하세요.",
    targetType: "total_distance_km",
    targetValue: 3.0,
    xpReward: 130,
    coinReward: 25,
    icon: "📊"
  },
  {
    id: "q_011",
    category: "starter",
    title: "모닝 버닝 스타트",
    desc: "오전 시간(06:00 ~ 10:00)에 러닝을 1회 완료하세요.",
    targetType: "time_morning_run",
    targetValue: 1,
    xpReward: 120,
    coinReward: 20,
    icon: "🌅"
  },
  {
    id: "q_012",
    category: "starter",
    title: "나이트 시티 러너",
    desc: "야간 시간(19:00 ~ 23:00)에 러닝을 1회 완료하세요.",
    targetType: "time_night_run",
    targetValue: 1,
    xpReward: 120,
    coinReward: 20,
    icon: "🌃"
  },
  {
    id: "q_013",
    category: "starter",
    title: "누적 5km 돌파",
    desc: "전체 누적 러닝 거리 5.00 km를 돌파하세요.",
    targetType: "total_distance_km",
    targetValue: 5.0,
    xpReward: 150,
    coinReward: 30,
    icon: "⭐"
  },
  {
    id: "q_014",
    category: "starter",
    title: "볼트몽 레벨 2 진입",
    desc: "다마고치 캐릭터를 레벨 2로 성장시키세요.",
    targetType: "tamagotchi_level",
    targetValue: 2,
    xpReward: 150,
    coinReward: 30,
    icon: "🆙"
  },
  {
    id: "q_015",
    category: "starter",
    title: "첫 상점 기어 둘러보기",
    desc: "상점 탭에 방문하여 나이키 공식 기어 카탈로그를 확인하세요.",
    targetType: "visit_shop",
    targetValue: 1,
    xpReward: 50,
    coinReward: 10,
    icon: "🛍️"
  },
  {
    id: "q_016",
    category: "starter",
    title: "러너 프로필 완성",
    desc: "프로필 탭에서 이름, 신체 스펙, 습관 단서를 저장하세요.",
    targetType: "profile_saved",
    targetValue: 1,
    xpReward: 80,
    coinReward: 15,
    icon: "📋"
  },
  {
    id: "q_017",
    category: "starter",
    title: "첫 50 kcal 소모",
    desc: "단일 러닝으로 50 kcal 이상을 소모하세요.",
    targetType: "single_calories",
    targetValue: 50,
    xpReward: 100,
    coinReward: 20,
    icon: "🔥"
  },
  {
    id: "q_018",
    category: "starter",
    title: "10분 지속주 도전",
    desc: "멈추지 않고 10분(600초) 이상 러닝을 지속하세요.",
    targetType: "single_time_sec",
    targetValue: 600,
    xpReward: 120,
    coinReward: 25,
    icon: "⏱️"
  },
  {
    id: "q_019",
    category: "starter",
    title: "누적 8km 달성",
    desc: "전체 누적 러닝 거리 8.00 km를 달성하세요.",
    targetType: "total_distance_km",
    targetValue: 8.0,
    xpReward: 160,
    coinReward: 35,
    icon: "🎯"
  },
  {
    id: "q_020",
    category: "starter",
    title: "스타터 코스 완전 정복",
    desc: "누적 10.00 km를 돌파하여 초심자 러너를 탈출하세요.",
    targetType: "total_distance_km",
    targetValue: 10.0,
    xpReward: 200,
    coinReward: 50,
    icon: "🏆"
  },

  // ==========================================
  // [카테고리 2: 🏃 거리 정복 & 마라톤 로드 (Q21 ~ Q40)]
  // ==========================================
  {
    id: "q_021",
    category: "distance",
    title: "3km 지속주 달성",
    desc: "한 번의 러닝으로 3.00 km를 완주하세요.",
    targetType: "single_distance_km",
    targetValue: 3.0,
    xpReward: 150,
    coinReward: 30,
    icon: "🏃‍♂️"
  },
  {
    id: "q_022",
    category: "distance",
    title: "5km 로드 레이서",
    desc: "5.00 km 러닝을 성공적으로 완주하세요.",
    targetType: "single_distance_km",
    targetValue: 5.0,
    xpReward: 250,
    coinReward: 50,
    icon: "🏅"
  },
  {
    id: "q_023",
    category: "distance",
    title: "누적 15km 마일스톤",
    desc: "누적 러닝 거리 15.00 km를 돌파하세요.",
    targetType: "total_distance_km",
    targetValue: 15.0,
    xpReward: 200,
    coinReward: 40,
    icon: "🚩"
  },
  {
    id: "q_024",
    category: "distance",
    title: "7km 중장거리 돌파",
    desc: "단일 러닝으로 7.00 km를 주파하세요.",
    targetType: "single_distance_km",
    targetValue: 7.0,
    xpReward: 300,
    coinReward: 60,
    icon: "⚡"
  },
  {
    id: "q_025",
    category: "distance",
    title: "10km 센추리 클래식",
    desc: "대회 공인 10.00 km 코스를 완주하세요.",
    targetType: "single_distance_km",
    targetValue: 10.0,
    xpReward: 450,
    coinReward: 100,
    icon: "🎖️"
  },
  {
    id: "q_026",
    category: "distance",
    title: "누적 25km 달성",
    desc: "전체 러닝 기록 누적 25.00 km를 달성하세요.",
    targetType: "total_distance_km",
    targetValue: 25.0,
    xpReward: 300,
    coinReward: 60,
    icon: "📈"
  },
  {
    id: "q_027",
    category: "distance",
    title: "12km 템포런 도전",
    desc: "단일 러닝으로 12.00 km를 완주하세요.",
    targetType: "single_distance_km",
    targetValue: 12.0,
    xpReward: 500,
    coinReward: 110,
    icon: "🚀"
  },
  {
    id: "q_028",
    category: "distance",
    title: "15km 장거리 LSD",
    desc: "단일 러닝으로 15.00 km를 돌파하세요.",
    targetType: "single_distance_km",
    targetValue: 15.0,
    xpReward: 650,
    coinReward: 140,
    icon: "🏔️"
  },
  {
    id: "q_029",
    category: "distance",
    title: "누적 50km 하프 센추리",
    desc: "누적 러닝 거리 50.00 km를 돌파하세요.",
    targetType: "total_distance_km",
    targetValue: 50.0,
    xpReward: 600,
    coinReward: 130,
    icon: "🌟"
  },
  {
    id: "q_030",
    category: "distance",
    title: "하프 마라톤 정복 (21.1km)",
    desc: "하프 마라톤 정규 거리 21.0975 km를 완주하세요.",
    targetType: "single_distance_km",
    targetValue: 21.1,
    xpReward: 1000,
    coinReward: 250,
    icon: "👑"
  },
  {
    id: "q_031",
    category: "distance",
    title: "누적 75km 달성",
    desc: "전체 러닝 기록 누적 75.00 km를 달성하세요.",
    targetType: "total_distance_km",
    targetValue: 75.0,
    xpReward: 750,
    coinReward: 160,
    icon: "🎯"
  },
  {
    id: "q_032",
    category: "distance",
    title: "25km 초장거리 빌드업",
    desc: "단일 세션으로 25.00 km를 주파하세요.",
    targetType: "single_distance_km",
    targetValue: 25.0,
    xpReward: 1200,
    coinReward: 280,
    icon: "🦅"
  },
  {
    id: "q_033",
    category: "distance",
    title: "누적 100km 센추리 클럽",
    desc: "누적 100.00 km를 돌파하여 센추리 러너가 되세요.",
    targetType: "total_distance_km",
    targetValue: 100.0,
    xpReward: 1500,
    coinReward: 350,
    icon: "💎"
  },
  {
    id: "q_034",
    category: "distance",
    title: "30km 마라톤 벽 돌파",
    desc: "30.00 km 러닝을 성공적으로 완주하세요.",
    targetType: "single_distance_km",
    targetValue: 30.0,
    xpReward: 1600,
    coinReward: 380,
    icon: "🌪️"
  },
  {
    id: "q_035",
    category: "distance",
    title: "누적 150km 돌파",
    desc: "누적 러닝 거리 150.00 km를 기록하세요.",
    targetType: "total_distance_km",
    targetValue: 150.0,
    xpReward: 1800,
    coinReward: 400,
    icon: "🔥"
  },
  {
    id: "q_036",
    category: "distance",
    title: "35km 울트라 프론티어",
    desc: "35.00 km 코스를 끝까지 완주하세요.",
    targetType: "single_distance_km",
    targetValue: 35.0,
    xpReward: 2000,
    coinReward: 450,
    icon: "⚡"
  },
  {
    id: "q_037",
    category: "distance",
    title: "풀코스 마라톤 완주 (42.195km)",
    desc: "마라톤 공식 풀코스 42.195 km를 완주하세요.",
    targetType: "single_distance_km",
    targetValue: 42.2,
    xpReward: 3000,
    coinReward: 600,
    icon: "🏆"
  },
  {
    id: "q_038",
    category: "distance",
    title: "누적 200km 마스터",
    desc: "누적 러닝 거리 200.00 km를 달성하세요.",
    targetType: "total_distance_km",
    targetValue: 200.0,
    xpReward: 2200,
    coinReward: 500,
    icon: "🎖️"
  },
  {
    id: "q_039",
    category: "distance",
    title: "누적 300km 그랜드 러너",
    desc: "누적 러닝 거리 300.00 km를 돌파하세요.",
    targetType: "total_distance_km",
    targetValue: 300.0,
    xpReward: 2600,
    coinReward: 550,
    icon: "🌌"
  },
  {
    id: "q_040",
    category: "distance",
    title: "누적 500km 전설의 영역",
    desc: "누적 러닝 거리 500.00 km를 달성하여 레전드가 되세요.",
    targetType: "total_distance_km",
    targetValue: 500.0,
    xpReward: 3500,
    coinReward: 800,
    icon: "👑"
  },

  // ==========================================
  // [카테고리 3: ⚡ 스피드 & 페이스 마스터 (Q41 ~ Q60)]
  // ==========================================
  {
    id: "q_041",
    category: "speed",
    title: "7분 페이스 안정화",
    desc: "1km 이상 러닝에서 평균 7'00\" 이하 페이스를 기록하세요.",
    targetType: "pace_max_sec",
    targetValue: 420,
    xpReward: 100,
    coinReward: 20,
    icon: "⏱️"
  },
  {
    id: "q_042",
    category: "speed",
    title: "6분 30초 페이스 달성",
    desc: "1km 이상 러닝에서 평균 6'30\" 이하 페이스를 기록하세요.",
    targetType: "pace_max_sec",
    targetValue: 390,
    xpReward: 140,
    coinReward: 28,
    icon: "⚡"
  },
  {
    id: "q_043",
    category: "speed",
    title: "6분 페이스 돌파 (서브6)",
    desc: "1km 이상 러닝에서 평균 6'00\" 이하 페이스를 달성하세요.",
    targetType: "pace_max_sec",
    targetValue: 360,
    xpReward: 200,
    coinReward: 40,
    icon: "💨"
  },
  {
    id: "q_044",
    category: "speed",
    title: "5분 45초 페이스 유지",
    desc: "2km 이상 러닝에서 평균 5'45\" 이하 페이스를 기록하세요.",
    targetType: "pace_max_sec",
    targetValue: 345,
    xpReward: 250,
    coinReward: 50,
    icon: "🔥"
  },
  {
    id: "q_045",
    category: "speed",
    title: "5분 30초 쾌속 질주",
    desc: "3km 이상 러닝에서 평균 5'30\" 이하 페이스를 유지하세요.",
    targetType: "pace_max_sec",
    targetValue: 330,
    xpReward: 320,
    coinReward: 65,
    icon: "🚀"
  },
  {
    id: "q_046",
    category: "speed",
    title: "5분 15초 페이스 도전",
    desc: "3km 이상 러닝에서 평균 5'15\" 이하 페이스를 달성하세요.",
    targetType: "pace_max_sec",
    targetValue: 315,
    xpReward: 400,
    coinReward: 80,
    icon: "🎯"
  },
  {
    id: "q_047",
    category: "speed",
    title: "5분 페이스 돌파 (서브5)",
    desc: "3km 이상 러닝에서 평균 5'00\" 이하 페이스를 달성하세요.",
    targetType: "pace_max_sec",
    targetValue: 300,
    xpReward: 550,
    coinReward: 120,
    icon: "⚡"
  },
  {
    id: "q_048",
    category: "speed",
    title: "4분 45초 하이 스피드",
    desc: "3km 이상 러닝에서 평균 4'45\" 이하 페이스를 기록하세요.",
    targetType: "pace_max_sec",
    targetValue: 285,
    xpReward: 700,
    coinReward: 150,
    icon: "🌪️"
  },
  {
    id: "q_049",
    category: "speed",
    title: "4분 30초 엘리트 페이스",
    desc: "3km 이상 러닝에서 평균 4'30\" 이하 페이스를 달성하세요.",
    targetType: "pace_max_sec",
    targetValue: 270,
    xpReward: 900,
    coinReward: 200,
    icon: "🏆"
  },
  {
    id: "q_050",
    category: "speed",
    title: "4분 15초 광속 질주",
    desc: "2km 이상 러닝에서 평균 4'15\" 이하 페이스를 달성하세요.",
    targetType: "pace_max_sec",
    targetValue: 255,
    xpReward: 1100,
    coinReward: 240,
    icon: "💎"
  },
  {
    id: "q_051",
    category: "speed",
    title: "4분 페이스 정복 (서브4)",
    desc: "1km 이상 러닝에서 평균 4'00\" 이하 페이스를 기록하세요.",
    targetType: "pace_max_sec",
    targetValue: 240,
    xpReward: 1500,
    coinReward: 300,
    icon: "👑"
  },
  {
    id: "q_052",
    category: "speed",
    title: "3분 45초 슈퍼소닉",
    desc: "1km 이상 러닝에서 평균 3'45\" 이하 페이스를 달성하세요.",
    targetType: "pace_max_sec",
    targetValue: 225,
    xpReward: 2000,
    coinReward: 400,
    icon: "🌌"
  },
  {
    id: "q_053",
    category: "speed",
    title: "5km 28분 이내 주파",
    desc: "5km를 28분 이내(평균 5'36\")에 완주하세요.",
    targetType: "5k_time_sec",
    targetValue: 1680,
    xpReward: 600,
    coinReward: 130,
    icon: "🏃"
  },
  {
    id: "q_054",
    category: "speed",
    title: "5km 25분 이내 완주 (서브25)",
    desc: "5km를 25분 이내(평균 5'00\")에 성공적으로 주파하세요.",
    targetType: "5k_time_sec",
    targetValue: 1500,
    xpReward: 900,
    coinReward: 200,
    icon: "🏅"
  },
  {
    id: "q_055",
    category: "speed",
    title: "5km 22분 이내 초고속 완주",
    desc: "5km를 22분 이내(평균 4'24\")에 완주하세요.",
    targetType: "5k_time_sec",
    targetValue: 1320,
    xpReward: 1400,
    coinReward: 300,
    icon: "🎖️"
  },
  {
    id: "q_056",
    category: "speed",
    title: "10km 55분 이내 완주",
    desc: "10km를 55분 이내(평균 5'30\")에 완주하세요.",
    targetType: "10k_time_sec",
    targetValue: 3300,
    xpReward: 1000,
    coinReward: 220,
    icon: "⚡"
  },
  {
    id: "q_057",
    category: "speed",
    title: "10km 50분 이내 완주 (서브50)",
    desc: "10km를 50분 이내(평균 5'00\")에 정복하세요.",
    targetType: "10k_time_sec",
    targetValue: 3000,
    xpReward: 1600,
    coinReward: 350,
    icon: "🔥"
  },
  {
    id: "q_058",
    category: "speed",
    title: "10km 45분 이내 정복 (서브45)",
    desc: "10km를 45분 이내(평균 4'30\")에 완주하여 정점에 도달하세요.",
    targetType: "10k_time_sec",
    targetValue: 2700,
    xpReward: 2400,
    coinReward: 500,
    icon: "🏆"
  },
  {
    id: "q_059",
    category: "speed",
    title: "100 kcal 급속 소모",
    desc: "단일 러닝으로 100 kcal 이상을 빠르게 소모하세요.",
    targetType: "single_calories",
    targetValue: 100,
    xpReward: 200,
    coinReward: 40,
    icon: "💥"
  },
  {
    id: "q_060",
    category: "speed",
    title: "300 kcal 하이 칼로리 버닝",
    desc: "단일 세션에서 300 kcal 이상을 버닝하세요.",
    targetType: "single_calories",
    targetValue: 300,
    xpReward: 500,
    coinReward: 100,
    icon: "🎇"
  },

  // ==========================================
  // [카테고리 4: 🔥 습관 & 연속 스트릭 (Q61 ~ Q80)]
  // ==========================================
  {
    id: "q_061",
    category: "habit",
    title: "2일 연속 출석 러닝",
    desc: "연속 2일간 러닝 세션을 기록하세요.",
    targetType: "streak_days",
    targetValue: 2,
    xpReward: 120,
    coinReward: 25,
    icon: "🔥"
  },
  {
    id: "q_062",
    category: "habit",
    title: "3일 연속 스트릭 유지",
    desc: "연속 3일간 쉬지 않고 러닝을 완료하세요.",
    targetType: "streak_days",
    targetValue: 3,
    xpReward: 180,
    coinReward: 35,
    icon: "🔥"
  },
  {
    id: "q_063",
    category: "habit",
    title: "4일 연속 습관 가동",
    desc: "연속 4일간 운동 스트릭을 유지하세요.",
    targetType: "streak_days",
    targetValue: 4,
    xpReward: 240,
    coinReward: 50,
    icon: "⚡"
  },
  {
    id: "q_064",
    category: "habit",
    title: "5일 연속 작심삼일 타파",
    desc: "연속 5일 러닝을 달성하여 작심삼일을 돌파하세요.",
    targetType: "streak_days",
    targetValue: 5,
    xpReward: 320,
    coinReward: 65,
    icon: "💪"
  },
  {
    id: "q_065",
    category: "habit",
    title: "7일 연속 1주일 퍼펙트",
    desc: "7일 연속 러닝으로 1주일 완벽 출석을 기록하세요.",
    targetType: "streak_days",
    targetValue: 7,
    xpReward: 500,
    coinReward: 100,
    icon: "🎖️"
  },
  {
    id: "q_066",
    category: "habit",
    title: "10일 연속 철인 러너",
    desc: "10일 연속 러닝 스트릭을 달성하세요.",
    targetType: "streak_days",
    targetValue: 10,
    xpReward: 700,
    coinReward: 150,
    icon: "🛡️"
  },
  {
    id: "q_067",
    category: "habit",
    title: "14일 연속 2주 습관 정착",
    desc: "2주 연속 매일 러닝을 실천하세요.",
    targetType: "streak_days",
    targetValue: 14,
    xpReward: 1000,
    coinReward: 200,
    icon: "🌟"
  },
  {
    id: "q_068",
    category: "habit",
    title: "21일 연속 챌린지 그랜드슬램",
    desc: "21일 연속 챌린지를 완벽하게 달성하세요.",
    targetType: "streak_days",
    targetValue: 21,
    xpReward: 2000,
    coinReward: 400,
    icon: "👑"
  },
  {
    id: "q_069",
    category: "habit",
    title: "30일 연속 한 달의 기적",
    desc: "30일 동안 하루도 거르지 않고 러닝을 기록하세요.",
    targetType: "streak_days",
    targetValue: 30,
    xpReward: 3000,
    coinReward: 600,
    icon: "🏆"
  },
  {
    id: "q_070",
    category: "habit",
    title: "50일 연속 불멸의 스트릭",
    desc: "50일 연속 러닝으로 전설적인 끈기를 증명하세요.",
    targetType: "streak_days",
    targetValue: 50,
    xpReward: 4500,
    coinReward: 900,
    icon: "💎"
  },
  {
    id: "q_071",
    category: "habit",
    title: "총 러닝 세션 5회 달성",
    desc: "누적 5회의 러닝 세션을 기록하세요.",
    targetType: "total_sessions",
    targetValue: 5,
    xpReward: 150,
    coinReward: 30,
    icon: "👟"
  },
  {
    id: "q_072",
    category: "habit",
    title: "총 러닝 세션 10회 돌파",
    desc: "누적 10회의 러닝을 완주하세요.",
    targetType: "total_sessions",
    targetValue: 10,
    xpReward: 300,
    coinReward: 60,
    icon: "🏅"
  },
  {
    id: "q_073",
    category: "habit",
    title: "총 러닝 세션 20회 돌파",
    desc: "누적 20회의 러닝 세션을 달성하세요.",
    targetType: "total_sessions",
    targetValue: 20,
    xpReward: 600,
    coinReward: 120,
    icon: "🎖️"
  },
  {
    id: "q_074",
    category: "habit",
    title: "총 러닝 세션 30회 돌파",
    desc: "누적 30회의 러닝을 기록하여 일상이 된 달리기를 만드세요.",
    targetType: "total_sessions",
    targetValue: 30,
    xpReward: 900,
    coinReward: 180,
    icon: "⚡"
  },
  {
    id: "q_075",
    category: "habit",
    title: "총 러닝 세션 50회 돌파",
    desc: "누적 50회의 러닝 세션을 기록하세요.",
    targetType: "total_sessions",
    targetValue: 50,
    xpReward: 1500,
    coinReward: 300,
    icon: "🌌"
  },
  {
    id: "q_076",
    category: "habit",
    title: "총 러닝 세션 100회 마스터",
    desc: "100회의 러닝 세션을 완료하여 마스터 칭호를 획득하세요.",
    targetType: "total_sessions",
    targetValue: 100,
    xpReward: 3500,
    coinReward: 700,
    icon: "👑"
  },
  {
    id: "q_077",
    category: "habit",
    title: "챌린지 1주차 전원 완료",
    desc: "21일 챌린지의 1주차(DAY 1 ~ 7)를 모두 완료하세요.",
    targetType: "challenge_week",
    targetValue: 1,
    xpReward: 600,
    coinReward: 120,
    icon: "1️⃣"
  },
  {
    id: "q_078",
    category: "habit",
    title: "챌린지 2주차 전원 완료",
    desc: "21일 챌린지의 2주차(DAY 8 ~ 14)를 모두 완료하세요.",
    targetType: "challenge_week",
    targetValue: 2,
    xpReward: 1000,
    coinReward: 200,
    icon: "2️⃣"
  },
  {
    id: "q_079",
    category: "habit",
    title: "챌린지 3주차 최종 완성",
    desc: "21일 챌린지의 3주차(DAY 15 ~ 21)를 모두 완료하세요.",
    targetType: "challenge_week",
    targetValue: 3,
    xpReward: 2000,
    coinReward: 400,
    icon: "3️⃣"
  },
  {
    id: "q_080",
    category: "habit",
    title: "습관 단서 매일 실천 인증",
    desc: "설정한 러닝 습관 단서를 통해 5회 이상 러닝을 시작하세요.",
    targetType: "habit_cue_runs",
    targetValue: 5,
    xpReward: 350,
    coinReward: 70,
    icon: "🎯"
  },

  // ==========================================
  // [카테고리 5: 🐺 사이버볼트 육성 & 진화 (Q81 ~ Q100)]
  // ==========================================
  {
    id: "q_081",
    category: "growth",
    title: "볼트몽 포만감 100% 달성",
    desc: "볼트몽에게 먹이를 주어 포만감 100%를 만드세요.",
    targetType: "tamagotchi_hunger",
    targetValue: 100,
    xpReward: 80,
    coinReward: 15,
    icon: "🍖"
  },
  {
    id: "q_082",
    category: "growth",
    title: "볼트몽 행복도 100% 달성",
    desc: "놀아주기를 통해 행복도 100%를 달성하세요.",
    targetType: "tamagotchi_happiness",
    targetValue: 100,
    xpReward: 80,
    coinReward: 15,
    icon: "💖"
  },
  {
    id: "q_083",
    category: "growth",
    title: "볼트몽 에너지 100% 충전",
    desc: "충분한 휴식으로 에너지를 100% 충전하세요.",
    targetType: "tamagotchi_energy",
    targetValue: 100,
    xpReward: 80,
    coinReward: 15,
    icon: "🔋"
  },
  {
    id: "q_084",
    category: "growth",
    title: "지구력(Might) 20 돌파",
    desc: "장거리 러닝을 통해 지구력 스탯 20을 달성하세요.",
    targetType: "stat_might",
    targetValue: 20,
    xpReward: 150,
    coinReward: 30,
    icon: "🛡️"
  },
  {
    id: "q_085",
    category: "growth",
    title: "민첩성(Agility) 20 돌파",
    desc: "페이스 러닝을 통해 민첩성 스탯 20을 달성하세요.",
    targetType: "stat_agility",
    targetValue: 20,
    xpReward: 150,
    coinReward: 30,
    icon: "⚡"
  },
  {
    id: "q_086",
    category: "growth",
    title: "정신력(Spirit) 20 돌파",
    desc: "규칙적인 러닝으로 정신력 스탯 20을 달성하세요.",
    targetType: "stat_spirit",
    targetValue: 20,
    xpReward: 150,
    coinReward: 30,
    icon: "🧘"
  },
  {
    id: "q_087",
    category: "growth",
    title: "볼트몽 레벨 3 달성",
    desc: "다마고치 캐릭터를 레벨 3으로 성장시키세요.",
    targetType: "tamagotchi_level",
    targetValue: 3,
    xpReward: 200,
    coinReward: 40,
    icon: "🆙"
  },
  {
    id: "q_088",
    category: "growth",
    title: "볼트몽 레벨 5 달성",
    desc: "다마고치 캐릭터를 레벨 5로 성장시키세요.",
    targetType: "tamagotchi_level",
    targetValue: 5,
    xpReward: 350,
    coinReward: 70,
    icon: "🆙"
  },
  {
    id: "q_089",
    category: "growth",
    title: "Phase 2 바이트랩터 1차 진화",
    desc: "누적 5km를 돌파하여 알을 깨고 바이트랩터로 1차 진화시키세요!",
    targetType: "tamagotchi_stage",
    targetValue: 2,
    xpReward: 500,
    coinReward: 100,
    icon: "🦖"
  },
  {
    id: "q_090",
    category: "growth",
    title: "지구력 50 마스터",
    desc: "다마고치 지구력 스탯을 50 이상으로 육성하세요.",
    targetType: "stat_might",
    targetValue: 50,
    xpReward: 400,
    coinReward: 80,
    icon: "🛡️"
  },
  {
    id: "q_091",
    category: "growth",
    title: "민첩성 50 마스터",
    desc: "다마고치 민첩성 스탯을 50 이상으로 육성하세요.",
    targetType: "stat_agility",
    targetValue: 50,
    xpReward: 400,
    coinReward: 80,
    icon: "⚡"
  },
  {
    id: "q_092",
    category: "growth",
    title: "정신력 50 마스터",
    desc: "다마고치 정신력 스탯을 50 이상으로 육성하세요.",
    targetType: "stat_spirit",
    targetValue: 50,
    xpReward: 400,
    coinReward: 80,
    icon: "🧘"
  },
  {
    id: "q_093",
    category: "growth",
    title: "볼트몽 레벨 8 달성",
    desc: "다마고치 캐릭터를 레벨 8로 성장시키세요.",
    targetType: "tamagotchi_level",
    targetValue: 8,
    xpReward: 600,
    coinReward: 120,
    icon: "🆙"
  },
  {
    id: "q_094",
    category: "growth",
    title: "Phase 3 네온볼프 2차 진화",
    desc: "누적 20km를 돌파하여 네온볼프로 2차 진화시키세요!",
    targetType: "tamagotchi_stage",
    targetValue: 3,
    xpReward: 1200,
    coinReward: 250,
    icon: "🐺"
  },
  {
    id: "q_095",
    category: "growth",
    title: "볼트몽 레벨 10 달성",
    desc: "다마고치 캐릭터를 레벨 10으로 성장시키세요.",
    targetType: "tamagotchi_level",
    targetValue: 10,
    xpReward: 1000,
    coinReward: 200,
    icon: "🆙"
  },
  {
    id: "q_096",
    category: "growth",
    title: "지구력/민첩성/정신력 80 돌파",
    desc: "모든 3대 스탯을 80 이상으로 완성하세요.",
    targetType: "stat_all_80",
    targetValue: 80,
    xpReward: 1500,
    coinReward: 300,
    icon: "🌟"
  },
  {
    id: "q_097",
    category: "growth",
    title: "볼트 코인 1,000 VC 수집",
    desc: "러닝과 미션을 통해 누적 1,000 VC를 모으세요.",
    targetType: "total_coins",
    targetValue: 1000,
    xpReward: 800,
    coinReward: 150,
    icon: "💰"
  },
  {
    id: "q_098",
    category: "growth",
    title: "Phase 4 사이버볼트 마스터 최종 각성",
    desc: "누적 50km를 돌파하여 최종 각성 형태인 사이버볼트 마스터로 변신하세요!",
    targetType: "tamagotchi_stage",
    targetValue: 4,
    xpReward: 3000,
    coinReward: 600,
    icon: "🌌"
  },
  {
    id: "q_099",
    category: "growth",
    title: "3대 스탯 100 만점 달성",
    desc: "지구력, 민첩성, 정신력을 모두 100 만점으로 완성하세요.",
    targetType: "stat_all_100",
    targetValue: 100,
    xpReward: 4000,
    coinReward: 800,
    icon: "💎"
  },
  {
    id: "q_100",
    category: "growth",
    title: "RUNNOW 100 퀘스트 그랜드슬램",
    desc: "100개 퀘스트를 모두 완수하여 최고의 전설 러너로 등극하세요!",
    targetType: "all_quests_completed",
    targetValue: 100,
    xpReward: 10000,
    coinReward: 2000,
    icon: "👑"
  }
];
