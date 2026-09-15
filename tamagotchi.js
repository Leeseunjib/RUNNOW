export const STAGE_TITLES = [
  "응애 아기", "걸음마 유아", "장난꾸러기 유치원", "호기심 탐험가", "트랙 꿈나무",
  "질주 청소년", "열정 페이스메이커", "프로 마라토너", "베테랑 챔피언", "초월의 성체 마스터"
];
const stageTitles = STAGE_TITLES;
/**
 * tamagotchi.js
 * RunNow 4대 펫 종족 & 10단계 (아기~성체 마스터) 전사 진화 엔진
 * - 4대 종족: 댕댕이(Dog), 냥이(Cat), 토끼(Rabbit), 판다(Panda)
 * - 10단계: 0km 응애 아기부터 180km+ 초월의 성체 마스터까지
 */

export const ACTION_COOLDOWNS = {
  feed: 1 * 60 * 60 * 1000,       // 간식 1시간
  play: 2 * 60 * 60 * 1000,       // 놀아주기 2시간
  rest: 3 * 60 * 60 * 1000,       // 휴식 3시간
  rescue: 12 * 60 * 60 * 1000     // 긴급구제 12시간
};

function formatRemaining(ms) {
  const totalMin = Math.max(1, Math.ceil(ms / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0) return `${h}시간 ${m}분`;
  return `${m}분`;
}

export const DOG_STAGES = [
  {
    "stage": 1,
    "name": "댕댕이 St.1",
    "nameKo": "응애 아기 (0km+)",
    "minKm": 0,
    "icon": "🐶",
    "image": "./assets/pets/dog_stage_1.jpg",
    "tagline": "귀를 쫑긋거리며 첫 러닝 헤어밴드를 찬 뽀송뽀송 사랑스러운 아기 강아지",
    "petType": "dog",
    "svg": "<img src=\"./assets/pets/dog_stage_1.jpg\" alt=\"댕댕이\" class=\"t-img-avatar bounce-anim\" style=\"width:100%; height:100%; object-fit:cover; border-radius:50%; box-shadow:0 8px 24px var(--card-shadow); border:4px solid #00C73C;\">"
  },
  {
    "stage": 2,
    "name": "댕댕이 St.2",
    "nameKo": "걸음마 유아 (2km+)",
    "minKm": 2,
    "icon": "🐕",
    "image": "./assets/pets/dog_stage_2.jpg",
    "tagline": "귀여운 운동화를 신고 공원을 씩씩하고 경쾌하게 달리는 개구쟁이 댕댕이",
    "petType": "dog",
    "svg": "<img src=\"./assets/pets/dog_stage_2.jpg\" alt=\"댕댕이\" class=\"t-img-avatar bounce-anim\" style=\"width:100%; height:100%; object-fit:cover; border-radius:50%; box-shadow:0 8px 24px var(--card-shadow); border:4px solid #00C73C;\">"
  },
  {
    "stage": 3,
    "name": "댕댕이 St.3",
    "nameKo": "장난꾸러기 유치원 (5km+)",
    "minKm": 5,
    "icon": "🐾",
    "image": "./assets/pets/dog_stage_3.jpg",
    "tagline": "친구들과 잔디밭을 우다다 뛰놀며 기초 체력을 기르는 유치원 댕댕이",
    "petType": "dog",
    "svg": "<img src=\"./assets/pets/dog_stage_3.jpg\" alt=\"댕댕이\" class=\"t-img-avatar bounce-anim\" style=\"width:100%; height:100%; object-fit:cover; border-radius:50%; box-shadow:0 8px 24px var(--card-shadow); border:4px solid #00E676;\">"
  },
  {
    "stage": 4,
    "name": "댕댕이 St.4",
    "nameKo": "호기심 탐험가 (10km+)",
    "minKm": 10,
    "icon": "🦮",
    "image": "./assets/pets/dog_stage_4.jpg",
    "tagline": "작은 탐험 가방을 메고 동네 산책로를 누비는 씩씩한 탐험견",
    "petType": "dog",
    "svg": "<img src=\"./assets/pets/dog_stage_4.jpg\" alt=\"댕댕이\" class=\"t-img-avatar run-anim\" style=\"width:100%; height:100%; object-fit:cover; border-radius:50%; box-shadow:0 8px 24px var(--card-shadow); border:4px solid #00F0FF;\">"
  },
  {
    "stage": 5,
    "name": "댕댕이 St.5",
    "nameKo": "트랙 꿈나무 (20km+)",
    "minKm": 20,
    "icon": "🏃‍♂️",
    "image": "./assets/pets/dog_stage_5.jpg",
    "tagline": "스포츠 밴드와 러닝 배번을 달고 트랙을 질주하는 파이팅 넘치는 댕댕이",
    "petType": "dog",
    "svg": "<img src=\"./assets/pets/dog_stage_5.jpg\" alt=\"댕댕이\" class=\"t-img-avatar run-anim\" style=\"width:100%; height:100%; object-fit:cover; border-radius:50%; box-shadow:0 8px 24px var(--card-shadow); border:4px solid #00B0FF;\">"
  },
  {
    "stage": 6,
    "name": "댕댕이 St.6",
    "nameKo": "질주 청소년 (35km+)",
    "minKm": 35,
    "icon": "⚡",
    "image": "./assets/pets/dog_stage_6.jpg",
    "tagline": "골격이 단단해지고 보폭이 넓어져 장거리를 지치지 않고 달리는 청소년 댕댕이",
    "petType": "dog",
    "svg": "<img src=\"./assets/pets/dog_stage_6.jpg\" alt=\"댕댕이\" class=\"t-img-avatar run-anim\" style=\"width:100%; height:100%; object-fit:cover; border-radius:50%; box-shadow:0 8px 24px var(--card-shadow); border:4px solid #7C4DFF;\">"
  },
  {
    "stage": 7,
    "name": "댕댕이 St.7",
    "nameKo": "열정 페이스메이커 (55km+)",
    "minKm": 55,
    "icon": "🎧",
    "image": "./assets/pets/dog_stage_7.jpg",
    "tagline": "안정된 심박수와 케이던스로 페이스메이커 역할을 톡톡히 하는 열정 러너",
    "petType": "dog",
    "svg": "<img src=\"./assets/pets/dog_stage_7.jpg\" alt=\"댕댕이\" class=\"t-img-avatar master-anim\" style=\"width:100%; height:100%; object-fit:cover; border-radius:50%; box-shadow:0 8px 24px var(--card-shadow); border:4px solid #651FFF;\">"
  },
  {
    "stage": 8,
    "name": "댕댕이 St.8",
    "nameKo": "프로 마라토너 (80km+)",
    "minKm": 80,
    "icon": "🏅",
    "image": "./assets/pets/dog_stage_8.jpg",
    "tagline": "하프 마라톤을 완주하고 완주 메달을 목에 건 늠름한 마라토너 댕댕이",
    "petType": "dog",
    "svg": "<img src=\"./assets/pets/dog_stage_8.jpg\" alt=\"댕댕이\" class=\"t-img-avatar master-anim\" style=\"width:100%; height:100%; object-fit:cover; border-radius:50%; box-shadow:0 8px 24px var(--card-shadow); border:4px solid #FF9100;\">"
  },
  {
    "stage": 9,
    "name": "댕댕이 St.9",
    "nameKo": "베테랑 챔피언 (120km+)",
    "minKm": 120,
    "icon": "🏆",
    "image": "./assets/pets/dog_stage_9.jpg",
    "tagline": "수많은 대회에서 입상하며 월계관을 차지한 베테랑 챔피언 댕댕이",
    "petType": "dog",
    "svg": "<img src=\"./assets/pets/dog_stage_9.jpg\" alt=\"댕댕이\" class=\"t-img-avatar legend-anim\" style=\"width:100%; height:100%; object-fit:cover; border-radius:50%; box-shadow:0 8px 24px var(--card-shadow); border:4px solid #FF6D00;\">"
  },
  {
    "stage": 10,
    "name": "댕댕이 St.10",
    "nameKo": "초월의 성체 마스터 (180km+)",
    "minKm": 180,
    "icon": "👑",
    "image": "./assets/pets/dog_stage_10.jpg",
    "tagline": "황금빛 오라를 뿜어내며 어떤 코스든 압도적으로 질주하는 전설의 골든 성체 마스터",
    "petType": "dog",
    "svg": "<img src=\"./assets/pets/dog_stage_10.jpg\" alt=\"댕댕이\" class=\"t-img-avatar legend-anim\" style=\"width:100%; height:100%; object-fit:cover; border-radius:50%; box-shadow:0 8px 24px var(--card-shadow); border:4px solid #FFD700;\">"
  }
];
export const CAT_STAGES = [
  {
    "stage": 1,
    "name": "냥냥이 St.1",
    "nameKo": "응애 아기 (0km+)",
    "minKm": 0,
    "icon": "🐱",
    "image": "./assets/pets/cat_stage_1.jpg",
    "tagline": "앙증맞은 방울 목걸이와 반짝이는 눈망울의 동글동글 사랑스러운 아기 고양이",
    "petType": "cat",
    "svg": "<img src=\"./assets/pets/cat_stage_1.jpg\" alt=\"냥냥이\" class=\"t-img-avatar bounce-anim\" style=\"width:100%; height:100%; object-fit:cover; border-radius:50%; box-shadow:0 8px 24px var(--card-shadow); border:4px solid #AB47BC;\">"
  },
  {
    "stage": 2,
    "name": "냥냥이 St.2",
    "nameKo": "걸음마 유아 (2km+)",
    "minKm": 2,
    "icon": "🐈",
    "image": "./assets/pets/cat_stage_2.jpg",
    "tagline": "분홍 젤리 발바닥으로 깡총깡총 아장아장 발걸음을 떼는 아기 냥이",
    "petType": "cat",
    "svg": "<img src=\"./assets/pets/cat_stage_2.jpg\" alt=\"냥냥이\" class=\"t-img-avatar bounce-anim\" style=\"width:100%; height:100%; object-fit:cover; border-radius:50%; box-shadow:0 8px 24px var(--card-shadow); border:4px solid #AB47BC;\">"
  },
  {
    "stage": 3,
    "name": "냥냥이 St.3",
    "nameKo": "장난꾸러기 유치원 (5km+)",
    "minKm": 5,
    "icon": "🐾",
    "image": "./assets/pets/cat_stage_3.jpg",
    "tagline": "바람에 날리는 깃털을 쫓으며 마당을 날쌔게 질주하는 캣초딩",
    "petType": "cat",
    "svg": "<img src=\"./assets/pets/cat_stage_3.jpg\" alt=\"냥냥이\" class=\"t-img-avatar bounce-anim\" style=\"width:100%; height:100%; object-fit:cover; border-radius:50%; box-shadow:0 8px 24px var(--card-shadow); border:4px solid #BA68C8;\">"
  },
  {
    "stage": 4,
    "name": "냥냥이 St.4",
    "nameKo": "호기심 탐험가 (10km+)",
    "minKm": 10,
    "icon": "🧶",
    "image": "./assets/pets/cat_stage_4.jpg",
    "tagline": "높은 담벼락과 골목길을 사뿐사뿐 가볍게 누비는 호기심 탐험냥",
    "petType": "cat",
    "svg": "<img src=\"./assets/pets/cat_stage_4.jpg\" alt=\"냥냥이\" class=\"t-img-avatar run-anim\" style=\"width:100%; height:100%; object-fit:cover; border-radius:50%; box-shadow:0 8px 24px var(--card-shadow); border:4px solid #CE93D8;\">"
  },
  {
    "stage": 5,
    "name": "냥냥이 St.5",
    "nameKo": "트랙 꿈나무 (20km+)",
    "minKm": 20,
    "icon": "🎧",
    "image": "./assets/pets/cat_stage_5.jpg",
    "tagline": "귀여운 헤드폰을 끼고 리듬을 타며 도심을 가볍게 달리는 힙한 스트리트 러너",
    "petType": "cat",
    "svg": "<img src=\"./assets/pets/cat_stage_5.jpg\" alt=\"냥냥이\" class=\"t-img-avatar run-anim\" style=\"width:100%; height:100%; object-fit:cover; border-radius:50%; box-shadow:0 8px 24px var(--card-shadow); border:4px solid #00F0FF;\">"
  },
  {
    "stage": 6,
    "name": "냥냥이 St.6",
    "nameKo": "질주 청소년 (35km+)",
    "minKm": 35,
    "icon": "⚡",
    "image": "./assets/pets/cat_stage_6.jpg",
    "tagline": "날렵하고 유연한 몸놀림으로 코너링도 유연하게 통과하는 질주 청소년 캣",
    "petType": "cat",
    "svg": "<img src=\"./assets/pets/cat_stage_6.jpg\" alt=\"냥냥이\" class=\"t-img-avatar run-anim\" style=\"width:100%; height:100%; object-fit:cover; border-radius:50%; box-shadow:0 8px 24px var(--card-shadow); border:4px solid #7C4DFF;\">"
  },
  {
    "stage": 7,
    "name": "냥냥이 St.7",
    "nameKo": "열정 페이스메이커 (55km+)",
    "minKm": 55,
    "icon": "🏃‍♀️",
    "image": "./assets/pets/cat_stage_7.jpg",
    "tagline": "완벽한 페이스 조절로 바람을 가르는 스타일리시 페이스메이커",
    "petType": "cat",
    "svg": "<img src=\"./assets/pets/cat_stage_7.jpg\" alt=\"냥냥이\" class=\"t-img-avatar master-anim\" style=\"width:100%; height:100%; object-fit:cover; border-radius:50%; box-shadow:0 8px 24px var(--card-shadow); border:4px solid #651FFF;\">"
  },
  {
    "stage": 8,
    "name": "냥냥이 St.8",
    "nameKo": "프로 마라토너 (80km+)",
    "minKm": 80,
    "icon": "🏅",
    "image": "./assets/pets/cat_stage_8.jpg",
    "tagline": "바람을 가르는 날렵하고 우아한 폼으로 마라톤 메달을 획득한 멋진 마라토너 캣",
    "petType": "cat",
    "svg": "<img src=\"./assets/pets/cat_stage_8.jpg\" alt=\"냥냥이\" class=\"t-img-avatar master-anim\" style=\"width:100%; height:100%; object-fit:cover; border-radius:50%; box-shadow:0 8px 24px var(--card-shadow); border:4px solid #FF4081;\">"
  },
  {
    "stage": 9,
    "name": "냥냥이 St.9",
    "nameKo": "베테랑 챔피언 (120km+)",
    "minKm": 120,
    "icon": "🏆",
    "image": "./assets/pets/cat_stage_9.jpg",
    "tagline": "밤하늘의 은하수처럼 반짝이는 아우라를 두른 베테랑 챔피언 냥이",
    "petType": "cat",
    "svg": "<img src=\"./assets/pets/cat_stage_9.jpg\" alt=\"냥냥이\" class=\"t-img-avatar legend-anim\" style=\"width:100%; height:100%; object-fit:cover; border-radius:50%; box-shadow:0 8px 24px var(--card-shadow); border:4px solid #E040FB;\">"
  },
  {
    "stage": 10,
    "name": "냥냥이 St.10",
    "nameKo": "초월의 성체 마스터 (180km+)",
    "minKm": 180,
    "icon": "👑",
    "image": "./assets/pets/cat_stage_10.jpg",
    "tagline": "보랏빛 성운과 별빛 왕관을 두른 세상에서 가장 빠르고 우아한 초월의 스타 냥신",
    "petType": "cat",
    "svg": "<img src=\"./assets/pets/cat_stage_10.jpg\" alt=\"냥냥이\" class=\"t-img-avatar legend-anim\" style=\"width:100%; height:100%; object-fit:cover; border-radius:50%; box-shadow:0 8px 24px var(--card-shadow); border:4px solid #FFD700;\">"
  }
];
export const RABBIT_STAGES = [
  {
    "stage": 1,
    "name": "토순이 St.1",
    "nameKo": "응애 아기 (0km+)",
    "minKm": 0,
    "icon": "🐰",
    "image": "./assets/pets/rabbit_stage_1.jpg",
    "tagline": "두 귀를 쫑긋거리며 코를 킁킁거리는 부드러운 털의 아기 토끼",
    "petType": "rabbit",
    "svg": "<img src=\"./assets/pets/rabbit_stage_1.jpg\" alt=\"토순이\" class=\"t-img-avatar bounce-anim\" style=\"width:100%; height:100%; object-fit:cover; border-radius:50%; box-shadow:0 8px 24px var(--card-shadow); border:4px solid #FF4081;\">"
  },
  {
    "stage": 2,
    "name": "토순이 St.2",
    "nameKo": "걸음마 유아 (2km+)",
    "minKm": 2,
    "icon": "🐇",
    "image": "./assets/pets/rabbit_stage_2.jpg",
    "tagline": "조그만 발로 깡총깡총 잔디밭을 뛰어다니는 귀여운 걸음마 토끼",
    "petType": "rabbit",
    "svg": "<img src=\"./assets/pets/rabbit_stage_2.jpg\" alt=\"토순이\" class=\"t-img-avatar bounce-anim\" style=\"width:100%; height:100%; object-fit:cover; border-radius:50%; box-shadow:0 8px 24px var(--card-shadow); border:4px solid #FF4081;\">"
  },
  {
    "stage": 3,
    "name": "토순이 St.3",
    "nameKo": "장난꾸러기 유치원 (5km+)",
    "minKm": 5,
    "icon": "🥕",
    "image": "./assets/pets/rabbit_stage_3.jpg",
    "tagline": "당근 모양 헤어핀을 꽂고 신나게 들판을 질주하는 유치원 토끼",
    "petType": "rabbit",
    "svg": "<img src=\"./assets/pets/rabbit_stage_3.jpg\" alt=\"토순이\" class=\"t-img-avatar bounce-anim\" style=\"width:100%; height:100%; object-fit:cover; border-radius:50%; box-shadow:0 8px 24px var(--card-shadow); border:4px solid #F50057;\">"
  },
  {
    "stage": 4,
    "name": "토순이 St.4",
    "nameKo": "호기심 탐험가 (10km+)",
    "minKm": 10,
    "icon": "🌸",
    "image": "./assets/pets/rabbit_stage_4.jpg",
    "tagline": "숲속 오솔길을 호기심 가득하게 탐험하는 씩씩한 탐험 토끼",
    "petType": "rabbit",
    "svg": "<img src=\"./assets/pets/rabbit_stage_4.jpg\" alt=\"토순이\" class=\"t-img-avatar run-anim\" style=\"width:100%; height:100%; object-fit:cover; border-radius:50%; box-shadow:0 8px 24px var(--card-shadow); border:4px solid #00F0FF;\">"
  },
  {
    "stage": 5,
    "name": "토순이 St.5",
    "nameKo": "트랙 꿈나무 (20km+)",
    "minKm": 20,
    "icon": "🏃",
    "image": "./assets/pets/rabbit_stage_5.jpg",
    "tagline": "가벼운 도약력으로 오르막길도 깃털처럼 뛰어오르는 트랙 루키",
    "petType": "rabbit",
    "svg": "<img src=\"./assets/pets/rabbit_stage_5.jpg\" alt=\"토순이\" class=\"t-img-avatar run-anim\" style=\"width:100%; height:100%; object-fit:cover; border-radius:50%; box-shadow:0 8px 24px var(--card-shadow); border:4px solid #00E676;\">"
  },
  {
    "stage": 6,
    "name": "토순이 St.6",
    "nameKo": "질주 청소년 (35km+)",
    "minKm": 35,
    "icon": "⚡",
    "image": "./assets/pets/rabbit_stage_6.jpg",
    "tagline": "긴 다리로 탄력 넘치게 도약하며 완벽한 케이던스를 자랑하는 청소년 토끼",
    "petType": "rabbit",
    "svg": "<img src=\"./assets/pets/rabbit_stage_6.jpg\" alt=\"토순이\" class=\"t-img-avatar run-anim\" style=\"width:100%; height:100%; object-fit:cover; border-radius:50%; box-shadow:0 8px 24px var(--card-shadow); border:4px solid #7C4DFF;\">"
  },
  {
    "stage": 7,
    "name": "토순이 St.7",
    "nameKo": "열정 페이스메이커 (55km+)",
    "minKm": 55,
    "icon": "🎧",
    "image": "./assets/pets/rabbit_stage_7.jpg",
    "tagline": "귀에 쏙 들어오는 리듬으로 지친 러너를 북돋아주는 활력 페이스메이커",
    "petType": "rabbit",
    "svg": "<img src=\"./assets/pets/rabbit_stage_7.jpg\" alt=\"토순이\" class=\"t-img-avatar master-anim\" style=\"width:100%; height:100%; object-fit:cover; border-radius:50%; box-shadow:0 8px 24px var(--card-shadow); border:4px solid #651FFF;\">"
  },
  {
    "stage": 8,
    "name": "토순이 St.8",
    "nameKo": "프로 마라토너 (80km+)",
    "minKm": 80,
    "icon": "🏅",
    "image": "./assets/pets/rabbit_stage_8.jpg",
    "tagline": "장거리 크로스컨트리 코스를 정복하고 완주 메달을 거머쥔 마라토너 토끼",
    "petType": "rabbit",
    "svg": "<img src=\"./assets/pets/rabbit_stage_8.jpg\" alt=\"토순이\" class=\"t-img-avatar master-anim\" style=\"width:100%; height:100%; object-fit:cover; border-radius:50%; box-shadow:0 8px 24px var(--card-shadow); border:4px solid #FF9100;\">"
  },
  {
    "stage": 9,
    "name": "토순이 St.9",
    "nameKo": "베테랑 챔피언 (120km+)",
    "minKm": 120,
    "icon": "🏆",
    "image": "./assets/pets/rabbit_stage_9.jpg",
    "tagline": "달빛 아래서 가장 빠르고 아름답게 질주하는 베테랑 챔피언 토순이",
    "petType": "rabbit",
    "svg": "<img src=\"./assets/pets/rabbit_stage_9.jpg\" alt=\"토순이\" class=\"t-img-avatar legend-anim\" style=\"width:100%; height:100%; object-fit:cover; border-radius:50%; box-shadow:0 8px 24px var(--card-shadow); border:4px solid #FF6D00;\">"
  },
  {
    "stage": 10,
    "name": "토순이 St.10",
    "nameKo": "초월의 성체 마스터 (180km+)",
    "minKm": 180,
    "icon": "👑",
    "image": "./assets/pets/rabbit_stage_10.jpg",
    "tagline": "신비로운 달빛 아우라와 크리스탈 티아라를 쓴 초월의 문라이트 성체 퀸",
    "petType": "rabbit",
    "svg": "<img src=\"./assets/pets/rabbit_stage_10.jpg\" alt=\"토순이\" class=\"t-img-avatar legend-anim\" style=\"width:100%; height:100%; object-fit:cover; border-radius:50%; box-shadow:0 8px 24px var(--card-shadow); border:4px solid #FFD700;\">"
  }
];
export const PANDA_STAGES = [
  {
    "stage": 1,
    "name": "판다멍 St.1",
    "nameKo": "응애 아기 (0km+)",
    "minKm": 0,
    "icon": "🐼",
    "image": "./assets/pets/panda_stage_1.jpg",
    "tagline": "동글동글한 몸매로 뒹굴뒹굴 구르는 귀여운 털뭉치 아기 판다",
    "petType": "panda",
    "svg": "<img src=\"./assets/pets/panda_stage_1.jpg\" alt=\"판다멍\" class=\"t-img-avatar bounce-anim\" style=\"width:100%; height:100%; object-fit:cover; border-radius:50%; box-shadow:0 8px 24px var(--card-shadow); border:4px solid #43A047;\">"
  },
  {
    "stage": 2,
    "name": "판다멍 St.2",
    "nameKo": "걸음마 유아 (2km+)",
    "minKm": 2,
    "icon": "🐾",
    "image": "./assets/pets/panda_stage_2.jpg",
    "tagline": "아장아장 뒤뚱거리며 첫 대나무 잎을 쥐고 걷는 귀염둥이 판다",
    "petType": "panda",
    "svg": "<img src=\"./assets/pets/panda_stage_2.jpg\" alt=\"판다멍\" class=\"t-img-avatar bounce-anim\" style=\"width:100%; height:100%; object-fit:cover; border-radius:50%; box-shadow:0 8px 24px var(--card-shadow); border:4px solid #43A047;\">"
  },
  {
    "stage": 3,
    "name": "판다멍 St.3",
    "nameKo": "장난꾸러기 유치원 (5km+)",
    "minKm": 5,
    "icon": "🎋",
    "image": "./assets/pets/panda_stage_3.jpg",
    "tagline": "대나무 숲에서 구르고 뛰놀며 튼튼한 하체를 기르는 유치원 판다",
    "petType": "panda",
    "svg": "<img src=\"./assets/pets/panda_stage_3.jpg\" alt=\"판다멍\" class=\"t-img-avatar bounce-anim\" style=\"width:100%; height:100%; object-fit:cover; border-radius:50%; box-shadow:0 8px 24px var(--card-shadow); border:4px solid #2E7D32;\">"
  },
  {
    "stage": 4,
    "name": "판다멍 St.4",
    "nameKo": "호기심 탐험가 (10km+)",
    "minKm": 10,
    "icon": "🍃",
    "image": "./assets/pets/panda_stage_4.jpg",
    "tagline": "신선한 대나무 잎을 찾아 깊은 숲길을 탐험하는 호기심 판다",
    "petType": "panda",
    "svg": "<img src=\"./assets/pets/panda_stage_4.jpg\" alt=\"판다멍\" class=\"t-img-avatar run-anim\" style=\"width:100%; height:100%; object-fit:cover; border-radius:50%; box-shadow:0 8px 24px var(--card-shadow); border:4px solid #00F0FF;\">"
  },
  {
    "stage": 5,
    "name": "판다멍 St.5",
    "nameKo": "트랙 꿈나무 (20km+)",
    "minKm": 20,
    "icon": "🏃‍♂️",
    "image": "./assets/pets/panda_stage_5.jpg",
    "tagline": "지치지 않는 묵직한 파워워킹으로 5km를 완주하는 파워 루키",
    "petType": "panda",
    "svg": "<img src=\"./assets/pets/panda_stage_5.jpg\" alt=\"판다멍\" class=\"t-img-avatar run-anim\" style=\"width:100%; height:100%; object-fit:cover; border-radius:50%; box-shadow:0 8px 24px var(--card-shadow); border:4px solid #00E676;\">"
  },
  {
    "stage": 6,
    "name": "판다멍 St.6",
    "nameKo": "질주 청소년 (35km+)",
    "minKm": 35,
    "icon": "⚡",
    "image": "./assets/pets/panda_stage_6.jpg",
    "tagline": "묵직한 체구에서 뿜어져 나오는 폭발적인 추진력으로 달리는 청소년 판다",
    "petType": "panda",
    "svg": "<img src=\"./assets/pets/panda_stage_6.jpg\" alt=\"판다멍\" class=\"t-img-avatar run-anim\" style=\"width:100%; height:100%; object-fit:cover; border-radius:50%; box-shadow:0 8px 24px var(--card-shadow); border:4px solid #7C4DFF;\">"
  },
  {
    "stage": 7,
    "name": "판다멍 St.7",
    "nameKo": "열정 페이스메이커 (55km+)",
    "minKm": 55,
    "icon": "🎧",
    "image": "./assets/pets/panda_stage_7.jpg",
    "tagline": "흔들리지 않는 뚝심과 안정감으로 러너들의 멘탈을 지켜주는 페이스메이커",
    "petType": "panda",
    "svg": "<img src=\"./assets/pets/panda_stage_7.jpg\" alt=\"판다멍\" class=\"t-img-avatar master-anim\" style=\"width:100%; height:100%; object-fit:cover; border-radius:50%; box-shadow:0 8px 24px var(--card-shadow); border:4px solid #651FFF;\">"
  },
  {
    "stage": 8,
    "name": "판다멍 St.8",
    "nameKo": "프로 마라토너 (80km+)",
    "minKm": 80,
    "icon": "🏅",
    "image": "./assets/pets/panda_stage_8.jpg",
    "tagline": "강인한 근력과 지구력으로 극한의 울트라 코스를 완주한 마라토너 판다",
    "petType": "panda",
    "svg": "<img src=\"./assets/pets/panda_stage_8.jpg\" alt=\"판다멍\" class=\"t-img-avatar master-anim\" style=\"width:100%; height:100%; object-fit:cover; border-radius:50%; box-shadow:0 8px 24px var(--card-shadow); border:4px solid #FF9100;\">"
  },
  {
    "stage": 9,
    "name": "판다멍 St.9",
    "nameKo": "베테랑 챔피언 (120km+)",
    "minKm": 120,
    "icon": "🏆",
    "image": "./assets/pets/panda_stage_9.jpg",
    "tagline": "태산처럼 든든한 체력과 무술 실력을 겸비한 베테랑 쿵푸 챔피언",
    "petType": "panda",
    "svg": "<img src=\"./assets/pets/panda_stage_9.jpg\" alt=\"판다멍\" class=\"t-img-avatar legend-anim\" style=\"width:100%; height:100%; object-fit:cover; border-radius:50%; box-shadow:0 8px 24px var(--card-shadow); border:4px solid #FF6D00;\">"
  },
  {
    "stage": 10,
    "name": "판다멍 St.10",
    "nameKo": "초월의 성체 마스터 (180km+)",
    "minKm": 180,
    "icon": "👑",
    "image": "./assets/pets/panda_stage_10.jpg",
    "tagline": "대자연의 정기를 흡수하여 무한의 스태미나를 자랑하는 초월의 자이언트 마스터",
    "petType": "panda",
    "svg": "<img src=\"./assets/pets/panda_stage_10.jpg\" alt=\"판다멍\" class=\"t-img-avatar legend-anim\" style=\"width:100%; height:100%; object-fit:cover; border-radius:50%; box-shadow:0 8px 24px var(--card-shadow); border:4px solid #FFD700;\">"
  }
];

export const STAGES = DOG_STAGES;

export class TamagotchiEngine {
  constructor(initialData = {}) {
    let savedType = initialData.petType || localStorage.getItem("RUNNOW_PET_SPECIES") || "dog";
    if (savedType === "boltmon") {
      savedType = "dog";
      localStorage.setItem("RUNNOW_PET_SPECIES", "dog");
    }
    this.petType = savedType;
    this.petChosen = initialData.petChosen === true;
    this.name = initialData.name || this.getDefaultName(this.petType);
    this.level = initialData.level || 1;
    this.xp = initialData.xp || 0;
    this.totalKm = initialData.totalKm || 0.0;
    this.hunger = initialData.hunger !== undefined ? initialData.hunger : 100;
    this.happiness = initialData.happiness !== undefined ? initialData.happiness : 100;
    this.energy = initialData.energy !== undefined ? initialData.energy : 100;
    
    this.might = initialData.might !== undefined ? initialData.might : 10;
    this.agility = initialData.agility !== undefined ? initialData.agility : 10;
    this.spirit = initialData.spirit !== undefined ? initialData.spirit : 10;
    
    this.statusCondition = initialData.statusCondition || "HEALTHY";
    this.lastFed = initialData.lastFed || Date.now();
    // 마지막 대사 시각 (기록 없으면 기본 2.5시간 전으로 설정하여 최초 접속 시에도 70~80%의 자연스러운 상태 연출)
    this.lastMetabolicTick = initialData.lastMetabolicTick || (Date.now() - 2.5 * 60 * 60 * 1000);

    this.lastActionAt = {
      feed: 0,
      play: 0,
      rest: 0,
      rescue: 0,
      ...(initialData.lastActionAt || {})
    };

    // 시간 경과에 따른 자연 배고픔 및 체력 소모 즉시 적용
    this.applyMetabolicDecay();

    // 1분마다 주기적 생체 대사 틱 가동
    if (typeof window !== "undefined" && !window.__PET_METABOLIC_TIMER__) {
      window.__PET_METABOLIC_TIMER__ = setInterval(() => {
        if (window.Tamagotchi) {
          window.Tamagotchi.applyMetabolicDecay();
          window.Tamagotchi.render();
        }
      }, 60000);
    }
  }

  // 🕒 시간 경과에 따른 현실적 자연 대사 엔진 (Time Decay)
  applyMetabolicDecay() {
    const now = Date.now();
    const elapsedHours = Math.max(0, (now - this.lastMetabolicTick) / (1000 * 60 * 60));
    if (elapsedHours >= 0.02) { // 약 1분 이상 경과 시 계산
      // 1. 포만감: 시간당 -7.5% 자연 소모 (최소 15%까지 감소)
      const hungerLoss = Math.round(elapsedHours * 7.5);
      this.hunger = Math.max(15, this.hunger - hungerLoss);

      // 2. 체력: 시간당 -4% 자연 소모 (최소 20%까지 감소)
      const energyLoss = Math.round(elapsedHours * 4.0);
      this.energy = Math.max(20, this.energy - energyLoss);

      // 3. 행복도: 배고프면(포만감 < 40%) -5%/h, 든든하면 -2%/h 완만 소모
      const happyRate = this.hunger < 40 ? 5.5 : 2.0;
      const happyLoss = Math.round(elapsedHours * happyRate);
      this.happiness = Math.max(15, this.happiness - happyLoss);

      this.lastMetabolicTick = now;
      this.evaluateCondition();
      this.saveState();
    }
  }

  saveState() {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("RUNNOW_TAMAGOTCHI_STATE", JSON.stringify(this.toJSON()));
      }
    } catch (_) {}
  }

  getDefaultName(type) {
    switch(type) {
      case "cat": return "냥냥이";
      case "rabbit": return "토순이";
      case "panda": return "판다멍";
      default: return "댕댕이";
    }
  }

  cooldownRemaining(action) {
    const last = this.lastActionAt[action] || 0;
    if (!last) return 0;
    const elapsed = Date.now() - last;
    const limit = ACTION_COOLDOWNS[action] || 0;
    return elapsed >= limit ? 0 : limit - elapsed;
  }

  blockedByCooldown(action, label) {
    const remaining = this.cooldownRemaining(action);
    if (remaining <= 0) return null;
    return {
      success: false,
      cooldown: true,
      remainingMs: remaining,
      msg: `⏳ ${label}는 ${formatRemaining(remaining)} 뒤에 다시 할 수 있어요. 그동안 함께 달려볼까요?`
    };
  }

  markAction(action) {
    this.lastActionAt[action] = Date.now();
  }

  switchPetSpecies(type) {
    const valid = ["dog", "cat", "rabbit", "panda"];
    if (!valid.includes(type)) return;
    this.petType = type;
    this.name = this.getDefaultName(type);
    localStorage.setItem("RUNNOW_PET_SPECIES", type);
    this.render();
  }

  getStagesList() {
    switch(this.petType) {
      case "cat": return CAT_STAGES;
      case "rabbit": return RABBIT_STAGES;
      case "panda": return PANDA_STAGES;
      default: return DOG_STAGES;
    }
  }

  getStage() {
    const stages = this.getStagesList();
    for (let i = stages.length - 1; i >= 0; i--) {
      if (this.totalKm >= stages[i].minKm) {
        return stages[i];
      }
    }
    return stages[0];
  }

  getStageProgress() {
    const stages = this.getStagesList();
    const currStage = this.getStage();
    const currIdx = currStage.stage - 1;
    
    if (currIdx >= stages.length - 1) {
      return {
        stageNum: 10,
        nextStageKm: null,
        kmNeeded: 0,
        percent: 100,
        isMax: true
      };
    }

    const nextStage = stages[currIdx + 1];
    const prevKm = currStage.minKm;
    const targetKm = nextStage.minKm;
    const span = targetKm - prevKm;
    const done = Math.max(0, this.totalKm - prevKm);
    const percent = Math.min(100, Math.max(0, Math.round((done / span) * 100)));
    const kmNeeded = Math.max(0, +(targetKm - this.totalKm).toFixed(2));

    return {
      stageNum: currStage.stage,
      nextStageKm: targetKm,
      kmNeeded,
      percent,
      isMax: false
    };
  }

  getXpToNextLevel() {
    return this.level * 250;
  }

  addKmAndWorkout(km, durationSec, paceSec = 360) {
    this.totalKm = parseFloat((this.totalKm + km).toFixed(2));
    
    let statGrowth = { might: 0, agility: 0, spirit: 0 };
    let workoutType = "표준 조깅 런";

    if (paceSec < 330) {
      statGrowth.agility = Math.round(km * 8 + 4);
      statGrowth.might = Math.round(km * 3);
      statGrowth.spirit = Math.round(km * 2);
      workoutType = "⚡ 쾌속 스프린트 (민첩성 특화)";
    } else if (km >= 3.0) {
      statGrowth.might = Math.round(km * 8 + 5);
      statGrowth.spirit = Math.round(km * 4);
      statGrowth.agility = Math.round(km * 2);
      workoutType = "💪 파워 롱런 (지구력 특화)";
    } else {
      statGrowth.spirit = Math.round(km * 6 + 3);
      statGrowth.might = Math.round(km * 3);
      statGrowth.agility = Math.round(km * 3);
      workoutType = "🌿 기분 좋은 데일리 런 (회복 특화)";
    }

    this.might += statGrowth.might;
    this.agility += statGrowth.agility;
    this.spirit += statGrowth.spirit;

    const earnedXp = Math.round(km * 50 + (durationSec / 60) * 5);
    this.xp += earnedXp;

    let leveledUp = false;
    while (this.xp >= this.getXpToNextLevel()) {
      this.xp -= this.getXpToNextLevel();
      this.level += 1;
      leveledUp = true;
    }

    // 🏃‍♂️ 함께 달린 펫의 땀방울 소모 연동 (km 비례 체력·포만감 소모 & 완주 기쁨)
    const runHungerBurn = Math.round(km * 8 + 3);  // 3km 달리면 -27% 배고파짐
    const runEnergyBurn = Math.round(km * 10 + 4); // 3km 달리면 -34% 땀 흘림
    const runHappyBoost = Math.round(km * 6 + 10); // 함께 달려서 신남 +28%

    this.hunger = Math.max(10, this.hunger - runHungerBurn);
    this.energy = Math.max(15, this.energy - runEnergyBurn);
    this.happiness = Math.min(100, this.happiness + runHappyBoost);
    this.lastMetabolicTick = Date.now();
    this.saveState();

    return {
      leveledUp,
      level: this.level,
      totalKm: this.totalKm,
      stage: this.getStage(),
      statGrowth,
      workoutType
    };
  }

  feed() {
    const blocked = this.blockedByCooldown("feed", "간식 주기");
    if (blocked) return blocked;
    if (this.hunger >= 100) return { success: false, msg: "🍖 이미 배가 불러요! (포만감 100%)" };
    
    const wasHungry = this.hunger < 50;
    this.markAction("feed");
    this.hunger = Math.min(100, this.hunger + 35);
    this.happiness = Math.min(100, this.happiness + 15);
    this.energy = Math.min(100, this.energy + 10);
    this.might += 2;
    this.xp += 20;
    this.lastFed = Date.now();
    this.lastMetabolicTick = Date.now();
    this.evaluateCondition();
    this.saveState();

    const msg = wasHungry
      ? "🍖 꼬르륵거리던 펫이 허겁지겁 영양 간식을 비웠어요! 배가 아주 든든해졌습니다! (포만감 +35, 체력 +10, 지구력 +2)"
      : "🍖 고소한 영양 간식을 맛있게 냠냠 먹었어요! 힘이 불끈 솟아납니다! (포만감 +35, 행복도 +15)";
    return { success: true, msg };
  }

  play() {
    const blocked = this.blockedByCooldown("play", "놀아주기");
    if (blocked) return blocked;
    if (this.energy < 15) return { success: false, msg: "💤 펫이 지쳐있어요. 달콤한 휴식을 취하게 해주세요!" };
    this.markAction("play");
    this.happiness = Math.min(100, this.happiness + 30);
    this.energy = Math.max(10, this.energy - 18);
    this.hunger = Math.max(10, this.hunger - 8); // 신나게 뛰놀아서 살짝 출출해짐
    this.agility += 3;
    this.xp += 25;
    this.saveState();
    return { success: true, msg: "🎾 신나게 공놀이를 하며 트랙을 달렸어요! (행복도 +30, 스피드 +3, 체력 -18)" };
  }

  rest() {
    const blocked = this.blockedByCooldown("rest", "휴식");
    if (blocked) return blocked;
    if (this.energy >= 100) return { success: false, msg: "⚡ 이미 에너지가 가득 차 있어요! (체력 100%)" };
    this.markAction("rest");
    this.energy = Math.min(100, this.energy + 45);
    this.happiness = Math.min(100, this.happiness + 10);
    this.spirit += 4;
    this.xp += 15;
    this.evaluateCondition();
    this.saveState();
    return { success: true, msg: "💤 포근한 침대에서 달콤한 낮잠을 잤어요! 컨디션이 상쾌하게 회복되었습니다! (체력 +45, 정신력 +4)" };
  }

  rescue() {
    const blocked = this.blockedByCooldown("rescue", "볼트 긴급구제");
    if (blocked) return blocked;
    this.markAction("rescue");
    this.hunger = 100;
    this.happiness = 100;
    this.energy = 100;
    this.statusCondition = "HEALTHY";
    this.might += 5;
    this.agility += 5;
    this.spirit += 5;
    return { success: true, msg: "⚡ [볼트 긴급구제 성공!] 번개 오라로 모든 컨디션이 100% 풀충전되었습니다! (전 스탯 +5)" };
  }

  
  addXp(amount) {
    this.xp += amount;
    let leveledUp = false;
    while (this.xp >= this.getXpToNextLevel()) {
      this.xp -= this.getXpToNextLevel();
      this.level += 1;
      leveledUp = true;
      this.playSound("levelup");
    }
    return leveledUp;
  }

  rescueVolt() {
    return this.rescue();
  }

  evaluateCondition() {
    if (this.hunger <= 20 || this.energy <= 20 || this.happiness <= 20) {
      this.statusCondition = "TIRED";
    } else {
      this.statusCondition = "HEALTHY";
    }
  }

  playSound(type) {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "levelup") {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === "eat") {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(660, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === "happy") {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch (e) {}
  }

  toJSON() {
    return {
      petType: this.petType,
      petChosen: this.petChosen === true,
      name: this.name,
      level: this.level,
      xp: this.xp,
      totalKm: this.totalKm,
      hunger: this.hunger,
      happiness: this.happiness,
      energy: this.energy,
      might: this.might,
      agility: this.agility,
      spirit: this.spirit,
      statusCondition: this.statusCondition,
      lastFed: this.lastFed,
      lastMetabolicTick: this.lastMetabolicTick,
      lastActionAt: { ...this.lastActionAt }
    };
  }

  render() {
    const stage = this.getStage();
    const progress = this.getStageProgress();

    // 1. 펫 아바타
    const avatarBox = document.getElementById("t-avatar-container");
    if (avatarBox) {
      avatarBox.innerHTML = stage.svg;
    }

    // 2. 이름 및 태그라인
    const nameEl = document.getElementById("t-display-name");
    const stagePillEl = document.getElementById("t-stage-pill");
    const taglineEl = document.getElementById("t-tagline");

    if (nameEl) nameEl.textContent = `${this.name} (${stage.nameKo})`;
    if (stagePillEl) stagePillEl.textContent = `${stage.stage}단계: ${stage.nameKo}`;
    if (taglineEl) taglineEl.textContent = stage.tagline;

    // 3. 생체 스탯
    const mightEl = document.getElementById("stat-might");
    const agilityEl = document.getElementById("stat-agility");
    const spiritEl = document.getElementById("stat-spirit");

    if (mightEl) mightEl.textContent = this.might;
    if (agilityEl) agilityEl.textContent = this.agility;
    if (spiritEl) spiritEl.textContent = this.spirit;

    // 4. 게이지 수치
    const hungerBar = document.getElementById("bar-hunger");
    const happyBar = document.getElementById("bar-happiness");
    const energyBar = document.getElementById("bar-energy");
    const hungerVal = document.getElementById("val-hunger");
    const happyVal = document.getElementById("val-happiness");
    const energyVal = document.getElementById("val-energy");

    if (hungerBar) {
      hungerBar.style.width = this.hunger + "%";
      hungerBar.style.background = this.hunger <= 35 ? "#FF5252" : (this.hunger <= 60 ? "#FF9800" : "var(--primary-volt, #00E676)");
    }
    if (happyBar) {
      happyBar.style.width = this.happiness + "%";
      happyBar.style.background = this.happiness <= 35 ? "#FF5252" : "#2979FF";
    }
    if (energyBar) {
      energyBar.style.width = this.energy + "%";
      energyBar.style.background = this.energy <= 35 ? "#FF5252" : "#00E676";
    }

    if (hungerVal) {
      hungerVal.textContent = this.hunger + "%" + (this.hunger <= 35 ? " (배고파요 꼬르륵!)" : "");
      hungerVal.style.color = this.hunger <= 35 ? "#FF5252" : "inherit";
    }
    if (happyVal) {
      happyVal.textContent = this.happiness + "%";
      happyVal.style.color = this.happiness <= 35 ? "#FF5252" : "inherit";
    }
    if (energyVal) {
      energyVal.textContent = this.energy + "%" + (this.energy <= 30 ? " (피곤해요 💤)" : "");
      energyVal.style.color = this.energy <= 30 ? "#FF5252" : "inherit";
    }

    // 5. 10단계 마일스톤 타임라인 바 렌더링
    const currStageText = document.getElementById("pet-curr-stage-text");
    const nextKmText = document.getElementById("pet-next-km-text");
    const progressFill = document.getElementById("pet-stage-progress-fill");
    const dotsContainer = document.getElementById("pet-stages-dots");

    if (currStageText) {
      currStageText.textContent = `${stage.stage}단계: ${stageTitles[stage.stage - 1]} (${this.totalKm.toFixed(1)}km 달림)`;
    }
    if (nextKmText) {
      nextKmText.textContent = progress.isMax 
        ? "🏆 최종 성체 진화 완료!" 
        : `다음 단계까지 ${progress.kmNeeded}km 남음`;
    }
    if (progressFill) {
      const overallPercent = Math.min(100, Math.round(((stage.stage - 1) * 10) + (progress.percent * 0.1)));
      progressFill.style.width = overallPercent + "%";
    }
    if (dotsContainer) {
      let dotsHtml = "";
      for (let s = 1; s <= 10; s++) {
        const isCompleted = s < stage.stage;
        const isCurrent = s === stage.stage;
        const cls = isCurrent ? "pet-stage-dot current" : (isCompleted ? "pet-stage-dot completed" : "pet-stage-dot");
        dotsHtml += `<div class="${cls}" title="${s}단계: ${stageTitles[s-1]}">${s}</div>`;
      }
      dotsContainer.innerHTML = dotsHtml;
    }

    // 6. 종족 탭 활성화 상태
    document.querySelectorAll(".species-chip").forEach(chip => {
      chip.classList.toggle("active", chip.getAttribute("data-species") === this.petType);
    });
  }
}

// 전역 인스턴스 초기화 (브라우저 환경 안전 가드)
let savedPetData = {};
if (typeof localStorage !== "undefined") {
  try {
    const raw = localStorage.getItem("RUNNOW_TAMAGOTCHI_STATE");
    if (raw) savedPetData = JSON.parse(raw);
  } catch (_) {}
}

if (typeof window !== "undefined") {
  window.Tamagotchi = new TamagotchiEngine(savedPetData);
}
