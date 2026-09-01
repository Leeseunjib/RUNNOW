// 20종 정규 상점 상품 카탈로그 데이터 (RunGotchi Shop Items - KRW 원화 공식 적용)
export const SHOP_ITEMS = [
  // [카테고리 1: 러닝화 - 속도/XP 부스트]
  {
    id: "item_01",
    category: "shoes",
    categoryName: "러닝화",
    name: "Volt Pegasus Turbo",
    priceKRW: 6900,
    voltCoins: 490,
    bonus: "러닝 속도 보너스 +10%, 네온 볼트 발자국 이펙트",
    icon: "👟",
    rarity: "Rare",
    desc: "나이키 러너를 위한 최적의 쿠셔닝과 가벼움. 러닝 시 다이내믹 발자국 생성."
  },
  {
    id: "item_02",
    category: "shoes",
    categoryName: "러닝화",
    name: "Cyber VaporFly Next%",
    priceKRW: 13500,
    voltCoins: 990,
    bonus: "3주 챌린지 일일 미션 보상 1.5배 부스트",
    icon: "⚡",
    rarity: "Epic",
    desc: "최고급 카본 플레이트가 장착된 하이엔드 레이싱화. 챌린지 보상 극대화."
  },
  {
    id: "item_03",
    category: "shoes",
    categoryName: "러닝화",
    name: "Carbon Streak X",
    priceKRW: 20500,
    voltCoins: 1490,
    bonus: "실시간 러닝 페이스 안정화 +20%",
    icon: "🔥",
    rarity: "Epic",
    desc: "지속주와 템포런에 특화된 에너지 리턴 슈즈. 완주 시간 단축 지원."
  },
  {
    id: "item_04",
    category: "shoes",
    categoryName: "러닝화",
    name: "Alpha Aero Fly Super",
    priceKRW: 27000,
    voltCoins: 1990,
    bonus: "1회 미션 즉시 프리패스 완료권 포함",
    icon: "🚀",
    rarity: "Legendary",
    desc: "공기역학적 유선형 디자인과 플래그십 파츠가 결합된 전설의 러닝화."
  },

  // [카테고리 2: 에너지 & 리커버리]
  {
    id: "item_05",
    category: "energy",
    categoryName: "에너지 & 리커버리",
    name: "Volt Hydration 500ml",
    priceKRW: 1400,
    voltCoins: 99,
    bonus: "펫 수분도 & 에너지 즉시 100% 충전",
    icon: "💧",
    rarity: "Common",
    desc: "전해질이 풍부한 볼트 음료로 지친 펫을 즉시 활기차게 부활시킵니다."
  },
  {
    id: "item_06",
    category: "energy",
    categoryName: "에너지 & 리커버리",
    name: "Nano Electrolyte Gel",
    priceKRW: 2800,
    voltCoins: 190,
    bonus: "24시간 동안 러닝 중 에너지 소모율 50% 절감",
    icon: "🧪",
    rarity: "Rare",
    desc: "초고속 흡수 나노 파우더 젤. 장거리 러닝 전 필수 섭취 팩."
  },
  {
    id: "item_07",
    category: "energy",
    categoryName: "에너지 & 리커버리",
    name: "Beast Protein Shake",
    priceKRW: 4200,
    voltCoins: 290,
    bonus: "펫 성장치 +200 XP 즉시 획득",
    icon: "🥛",
    rarity: "Rare",
    desc: "고순도 WPI 프로틴. 펫의 근육과 레벨업을 가속화합니다."
  },
  {
    id: "item_08",
    category: "energy",
    categoryName: "에너지 & 리커버리",
    name: "Phoenix Elixir",
    priceKRW: 6900,
    voltCoins: 490,
    bonus: "놓친 일일 스트릭(연속 출석) 1회 완벽 복구",
    icon: "✨",
    rarity: "Epic",
    desc: "피치 못할 사정으로 운동을 쉬었을 때 21일 챌린지 스트릭을 보존해줍니다."
  },

  // [카테고리 3: 캐릭터 코스튬 & 스킨]
  {
    id: "item_09",
    category: "skin",
    categoryName: "캐릭터 스킨",
    name: "Cyberpunk Neon Visor",
    priceKRW: 4200,
    voltCoins: 290,
    bonus: "캐릭터 바이저 네온 발광 비주얼 장착",
    icon: "🥽",
    rarity: "Rare",
    desc: "사이버펑크 감성의 고글. 캐릭터가 미래지향적 러너로 변신합니다."
  },
  {
    id: "item_10",
    category: "skin",
    categoryName: "캐릭터 스킨",
    name: "Night Tracksuit Volt",
    priceKRW: 8200,
    voltCoins: 590,
    bonus: "야간 러닝 시 온몸에서 야광 형광 오라 방출",
    icon: "🎽",
    rarity: "Epic",
    desc: "나이키 형광 볼트 컬러의 프로 트랙수트. 압도적인 시각적 만족감 제공."
  },
  {
    id: "item_11",
    category: "skin",
    categoryName: "캐릭터 스킨",
    name: "Golden Champion Aura",
    priceKRW: 12000,
    voltCoins: 890,
    bonus: "캐릭터 주변 황금빛 챔피언 파티클 효과",
    icon: "👑",
    rarity: "Epic",
    desc: "마라톤 정점에 오른 러너에게만 허락된 황금빛 아우라 이펙트."
  },
  {
    id: "item_12",
    category: "skin",
    categoryName: "캐릭터 스킨",
    name: "Midnight Ninja Hoodie",
    priceKRW: 9500,
    voltCoins: 690,
    bonus: "스텔스 닌자 모션 및 흑연 잔상 이펙트",
    icon: "🥋",
    rarity: "Epic",
    desc: "밤안개 속을 가르는 고요한 닌자 러너의 후드 코스튬."
  },

  // [카테고리 4: 웨어러블 기어]
  {
    id: "item_13",
    category: "wearable",
    categoryName: "웨어러블 기어",
    name: "Titanium GPS Pro Watch",
    priceKRW: 5500,
    voltCoins: 390,
    bonus: "GPS 지터 오차 99% 필터링 & 초정밀 케이던스",
    icon: "⌚",
    rarity: "Rare",
    desc: "정밀 듀얼 밴드 GPS 칩셋이 탑재된 가상 티타늄 스포츠 워치."
  },
  {
    id: "item_14",
    category: "wearable",
    categoryName: "웨어러블 기어",
    name: "Aero Speed Sunglasses",
    priceKRW: 3500,
    voltCoins: 250,
    bonus: "주간 러닝 시 펫 행복도 획득량 2배",
    icon: "🕶️",
    rarity: "Common",
    desc: "눈부신 태양빛을 차단하고 쾌적한 런을 선사하는 스포츠 선글라스."
  },
  {
    id: "item_15",
    category: "wearable",
    categoryName: "웨어러블 기어",
    name: "Reflex LED Armband",
    priceKRW: 2800,
    voltCoins: 190,
    bonus: "야간 러닝 퀘스트 완료 시 추가 볼트코인 +30%",
    icon: "💡",
    rarity: "Common",
    desc: "어두운 골목에서도 반짝이는 고휘도 LED 스마트 암밴드."
  },
  {
    id: "item_16",
    category: "wearable",
    categoryName: "웨어러블 기어",
    name: "SoundPulse Headband",
    priceKRW: 4800,
    voltCoins: 350,
    bonus: "러닝 전용 다이내믹 BPM BGM 사운드 팩 해금",
    icon: "🎧",
    rarity: "Rare",
    desc: "심장 박동에 맞춰 리듬을 타는 신나는 하이템포 음악 스트림."
  },

  // [카테고리 5: 패스 & 스페셜 부스터]
  {
    id: "item_17",
    category: "pass",
    categoryName: "패스 & 부스터",
    name: "3-Week Double XP Pass",
    priceKRW: 13500,
    voltCoins: 990,
    bonus: "21일 챌린지 기간 동안 모든 러닝 XP 200% 지급",
    icon: "🎫",
    rarity: "Legendary",
    desc: "3주 동안 캐릭터 초고속 성장을 약속하는 전설의 시즌 패스."
  },
  {
    id: "item_18",
    category: "pass",
    categoryName: "패스 & 부스터",
    name: "Daily Streak Shield 3-Pack",
    priceKRW: 6900,
    voltCoins: 490,
    bonus: "스트릭 보호막 3회분 제공 (자동 발동)",
    icon: "🛡️",
    rarity: "Rare",
    desc: "바쁜 일정으로 운동을 놓쳐도 챌린지 연속 기록이 유지됩니다."
  },
  {
    id: "item_19",
    category: "pass",
    categoryName: "패스 & 부스터",
    name: "Master Runner Trophy Box",
    priceKRW: 17500,
    voltCoins: 1290,
    bonus: "레어 장비 3종 랜덤 박스 + 1,000 볼트코인",
    icon: "🎁",
    rarity: "Epic",
    desc: "상점 최고 인기 아이템과 다량의 코인이 담긴 마스터 번들."
  },
  {
    id: "item_20",
    category: "pass",
    categoryName: "패스 & 부스터",
    name: "VIP Diamond Club (Monthly)",
    priceKRW: 27000,
    voltCoins: 1990,
    bonus: "상점 전품목 20% 상시 할인 + VIP 다이아몬드 뱃지",
    icon: "💎",
    rarity: "Legendary",
    desc: "글로벌 상위 1% 러너를 위한 프리미엄 VIP 멤버십 패키지."
  }
];
