import { readFileSync, writeFileSync, cpSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const prjDir = 'C:\\BeausCreators\\02.BSC_Branch\\projects\\Runnow';
const sndDir = 'C:\\BeausCreators\\02.BSC_Branch\\sandbox\\Runnow_APP_V\\legacy_web';

// ==========================================
// 1. TAMAGOTCHI.JS 10 STAGES & 5 SPECIES
// ==========================================
console.log('1. Constructing 10-stage 5-species tamagotchi.js...');

const kmThresholds = [0, 2.0, 5.0, 10.0, 20.0, 35.0, 55.0, 80.0, 120.0, 180.0];
const stageTitles = [
  "응애 아기", "걸음마 유아", "장난꾸러기 유치원", "호기심 탐험가", "트랙 꿈나무",
  "질주 청소년", "열정 페이스메이커", "프로 마라토너", "베테랑 챔피언", "초월의 성체 마스터"
];

function buildSpeciesStages(speciesKey, speciesName, taglines, icons, borderColors) {
  return kmThresholds.map((km, idx) => {
    const s = idx + 1;
    let imgPath = `./assets/pets/${speciesKey}_stage_${s}.svg`;
    // Use high res jpg if exists for dog/cat early stages
    if (speciesKey === 'dog' && s <= 5 && existsSync(join(prjDir, 'assets', 'pets', `dog_stage_${s}.jpg`))) {
      imgPath = `./assets/pets/dog_stage_${s}.jpg`;
    } else if (speciesKey === 'cat' && s <= 5 && existsSync(join(prjDir, 'assets', 'pets', `cat_stage_${s}.jpg`))) {
      imgPath = `./assets/pets/cat_stage_${s}.jpg`;
    }

    const anim = s >= 9 ? 'legend-anim' : (s >= 7 ? 'master-anim' : (s >= 4 ? 'run-anim' : 'bounce-anim'));
    const borderCol = borderColors[idx] || '#00C73C';

    return {
      stage: s,
      name: `${speciesName} St.${s}`,
      nameKo: `${stageTitles[idx]} (${km}km+)`,
      minKm: km,
      icon: icons[idx] || '🐾',
      image: imgPath,
      tagline: taglines[idx],
      petType: speciesKey,
      svg: `<img src="${imgPath}" alt="${speciesName}" class="t-img-avatar ${anim}" style="width:100%; height:100%; object-fit:cover; border-radius:50%; box-shadow:0 8px 24px var(--card-shadow); border:4px solid ${borderCol};">`
    };
  });
}

const dogTaglines = [
  "귀를 쫑긋거리며 첫 러닝 헤어밴드를 찬 뽀송뽀송 사랑스러운 아기 강아지",
  "귀여운 운동화를 신고 공원을 씩씩하고 경쾌하게 달리는 개구쟁이 댕댕이",
  "친구들과 잔디밭을 우다다 뛰놀며 기초 체력을 기르는 유치원 댕댕이",
  "작은 탐험 가방을 메고 동네 산책로를 누비는 씩씩한 탐험견",
  "스포츠 밴드와 러닝 배번을 달고 트랙을 질주하는 파이팅 넘치는 댕댕이",
  "골격이 단단해지고 보폭이 넓어져 장거리를 지치지 않고 달리는 청소년 댕댕이",
  "안정된 심박수와 케이던스로 페이스메이커 역할을 톡톡히 하는 열정 러너",
  "하프 마라톤을 완주하고 완주 메달을 목에 건 늠름한 마라토너 댕댕이",
  "수많은 대회에서 입상하며 월계관을 차지한 베테랑 챔피언 댕댕이",
  "황금빛 오라를 뿜어내며 어떤 코스든 압도적으로 질주하는 전설의 골든 성체 마스터"
];
const dogIcons = ["🐶", "🐕", "🐾", "🦮", "🏃‍♂️", "⚡", "🎧", "🏅", "🏆", "👑"];
const dogBorders = ["#00C73C", "#00C73C", "#00E676", "#00F0FF", "#00B0FF", "#7C4DFF", "#651FFF", "#FF9100", "#FF6D00", "#FFD700"];

const catTaglines = [
  "앙증맞은 방울 목걸이와 반짝이는 눈망울의 동글동글 사랑스러운 아기 고양이",
  "분홍 젤리 발바닥으로 깡총깡총 아장아장 발걸음을 떼는 아기 냥이",
  "바람에 날리는 깃털을 쫓으며 마당을 날쌔게 질주하는 캣초딩",
  "높은 담벼락과 골목길을 사뿐사뿐 가볍게 누비는 호기심 탐험냥",
  "귀여운 헤드폰을 끼고 리듬을 타며 도심을 가볍게 달리는 힙한 스트리트 러너",
  "날렵하고 유연한 몸놀림으로 코너링도 유연하게 통과하는 질주 청소년 캣",
  "완벽한 페이스 조절로 바람을 가르는 스타일리시 페이스메이커",
  "바람을 가르는 날렵하고 우아한 폼으로 마라톤 메달을 획득한 멋진 마라토너 캣",
  "밤하늘의 은하수처럼 반짝이는 아우라를 두른 베테랑 챔피언 냥이",
  "보랏빛 성운과 별빛 왕관을 두른 세상에서 가장 빠르고 우아한 초월의 스타 냥신"
];
const catIcons = ["🐱", "🐈", "🐾", "🧶", "🎧", "⚡", "🏃‍♀️", "🏅", "🏆", "👑"];
const catBorders = ["#AB47BC", "#AB47BC", "#BA68C8", "#CE93D8", "#00F0FF", "#7C4DFF", "#651FFF", "#FF4081", "#E040FB", "#FFD700"];

const rabbitTaglines = [
  "두 귀를 쫑긋거리며 코를 킁킁거리는 부드러운 털의 아기 토끼",
  "조그만 발로 깡총깡총 잔디밭을 뛰어다니는 귀여운 걸음마 토끼",
  "당근 모양 헤어핀을 꽂고 신나게 들판을 질주하는 유치원 토끼",
  "숲속 오솔길을 호기심 가득하게 탐험하는 씩씩한 탐험 토끼",
  "가벼운 도약력으로 오르막길도 깃털처럼 뛰어오르는 트랙 루키",
  "긴 다리로 탄력 넘치게 도약하며 완벽한 케이던스를 자랑하는 청소년 토끼",
  "귀에 쏙 들어오는 리듬으로 지친 러너를 북돋아주는 활력 페이스메이커",
  "장거리 크로스컨트리 코스를 정복하고 완주 메달을 거머쥔 마라토너 토끼",
  "달빛 아래서 가장 빠르고 아름답게 질주하는 베테랑 챔피언 토순이",
  "신비로운 달빛 아우라와 크리스탈 티아라를 쓴 초월의 문라이트 성체 퀸"
];
const rabbitIcons = ["🐰", "🐇", "🥕", "🌸", "🏃", "⚡", "🎧", "🏅", "🏆", "👑"];
const rabbitBorders = ["#FF4081", "#FF4081", "#F50057", "#00F0FF", "#00E676", "#7C4DFF", "#651FFF", "#FF9100", "#FF6D00", "#FFD700"];

const pandaTaglines = [
  "동글동글한 몸매로 뒹굴뒹굴 구르는 귀여운 털뭉치 아기 판다",
  "아장아장 뒤뚱거리며 첫 대나무 잎을 쥐고 걷는 귀염둥이 판다",
  "대나무 숲에서 구르고 뛰놀며 튼튼한 하체를 기르는 유치원 판다",
  "신선한 대나무 잎을 찾아 깊은 숲길을 탐험하는 호기심 판다",
  "지치지 않는 묵직한 파워워킹으로 5km를 완주하는 파워 루키",
  "묵직한 체구에서 뿜어져 나오는 폭발적인 추진력으로 달리는 청소년 판다",
  "흔들리지 않는 뚝심과 안정감으로 러너들의 멘탈을 지켜주는 페이스메이커",
  "강인한 근력과 지구력으로 극한의 울트라 코스를 완주한 마라토너 판다",
  "태산처럼 든든한 체력과 무술 실력을 겸비한 베테랑 쿵푸 챔피언",
  "대자연의 정기를 흡수하여 무한의 스태미나를 자랑하는 초월의 자이언트 마스터"
];
const pandaIcons = ["🐼", "🐾", "🎋", "🍃", "🏃‍♂️", "⚡", "🎧", "🏅", "🏆", "👑"];
const pandaBorders = ["#43A047", "#43A047", "#2E7D32", "#00F0FF", "#00E676", "#7C4DFF", "#651FFF", "#FF9100", "#FF6D00", "#FFD700"];

const boltmonTaglines = [
  "푸른 번개 스파크를 깜빡이며 태어난 전설의 사이버 신수 아기 볼트",
  "발바닥에서 찌릿찌릿 정전기를 뿜으며 아장아장 걷는 네온 볼트",
  "번개 회로를 타고 네온 트랙을 신나게 질주하는 유치원 볼트몽",
  "사이버 시티의 디지털 그리드를 자유롭게 탐험하는 네온 탐험가",
  "터보 엔진을 가동하여 1초 만에 최고 속도에 도달하는 트랙 루키",
  "초고속 데이터 스트림을 가르며 달리는 사이버 청소년 볼트",
  "초정밀 GPS 레이더와 결합하여 1초의 오차도 없는 궁극의 페이스메이커",
  "에너지 100% 충전 상태로 마라톤 전 구간을 빛의 속도로 완주한 마라토너 볼트",
  "네온 번개 트로피를 차지한 디지털 세계의 베테랑 챔피언",
  "천둥과 번개를 자유자재로 다루며 황금빛 사이버 아우라를 발산하는 초월의 전설 신수"
];
const boltmonIcons = ["⚡", "✨", "🔋", "🔮", "🚀", "🔥", "🎧", "🏅", "🏆", "👑"];
const boltmonBorders = ["#00F0FF", "#00F0FF", "#00E5FF", "#00B0FF", "#00C73C", "#7C4DFF", "#651FFF", "#FF9100", "#FF6D00", "#FFD700"];

const fullTamagotchiCode = `/**
 * tamagotchi.js
 * RunNow 5대 펫 종족 & 10단계 (아기~성체 마스터) 전사 진화 엔진
 * - 5대 종족: 댕댕이(Dog), 냥이(Cat), 토끼(Rabbit), 판다(Panda), 볼트몽(Boltmon)
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
  if (h > 0) return \`\${h}시간 \${m}분\`;
  return \`\${m}분\`;
}

export const DOG_STAGES = ${JSON.stringify(buildSpeciesStages('dog', '댕댕이', dogTaglines, dogIcons, dogBorders), null, 2)};
export const CAT_STAGES = ${JSON.stringify(buildSpeciesStages('cat', '냥냥이', catTaglines, catIcons, catBorders), null, 2)};
export const RABBIT_STAGES = ${JSON.stringify(buildSpeciesStages('rabbit', '토순이', rabbitTaglines, rabbitIcons, rabbitBorders), null, 2)};
export const PANDA_STAGES = ${JSON.stringify(buildSpeciesStages('panda', '판다멍', pandaTaglines, pandaIcons, pandaBorders), null, 2)};
export const BOLTMON_STAGES = ${JSON.stringify(buildSpeciesStages('boltmon', '볼트몽', boltmonTaglines, boltmonIcons, boltmonBorders), null, 2)};

export const STAGES = DOG_STAGES;

export class TamagotchiEngine {
  constructor(initialData = {}) {
    this.petType = initialData.petType || localStorage.getItem("RUNNOW_PET_SPECIES") || "dog";
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

    this.lastActionAt = {
      feed: 0,
      play: 0,
      rest: 0,
      rescue: 0,
      ...(initialData.lastActionAt || {})
    };
  }

  getDefaultName(type) {
    switch(type) {
      case "cat": return "냥냥이";
      case "rabbit": return "토순이";
      case "panda": return "판다멍";
      case "boltmon": return "볼트몽";
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
      msg: \`⏳ \${label}는 \${formatRemaining(remaining)} 뒤에 다시 할 수 있어요. 그동안 함께 달려볼까요?\`
    };
  }

  markAction(action) {
    this.lastActionAt[action] = Date.now();
  }

  switchPetSpecies(type) {
    const valid = ["dog", "cat", "rabbit", "panda", "boltmon"];
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
      case "boltmon": return BOLTMON_STAGES;
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

    this.hunger = Math.max(0, this.hunger - Math.round(km * 5));
    this.energy = Math.max(0, this.energy - Math.round(km * 7));
    this.happiness = Math.min(100, this.happiness + Math.round(km * 4));

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
    this.markAction("feed");
    this.hunger = Math.min(100, this.hunger + 30);
    this.happiness = Math.min(100, this.happiness + 10);
    this.might += 2;
    this.xp += 15;
    return { success: true, msg: "🍖 맛있는 영양 간식을 먹고 힘이 솟아나요! (포만감 +30, 지구력 +2)" };
  }

  play() {
    const blocked = this.blockedByCooldown("play", "놀아주기");
    if (blocked) return blocked;
    if (this.energy < 15) return { success: false, msg: "💤 펫이 지쳐있어요. 휴식을 취하게 해주세요!" };
    this.markAction("play");
    this.happiness = Math.min(100, this.happiness + 25);
    this.energy = Math.max(0, this.energy - 15);
    this.agility += 3;
    this.xp += 20;
    return { success: true, msg: "🎾 신나게 공놀이를 하며 달렸어요! (행복도 +25, 스피드 +3)" };
  }

  rest() {
    const blocked = this.blockedByCooldown("rest", "휴식");
    if (blocked) return blocked;
    if (this.energy >= 100) return { success: false, msg: "⚡ 이미 에너지가 가득 차 있어요! (체력 100%)" };
    this.markAction("rest");
    this.energy = Math.min(100, this.energy + 40);
    this.spirit += 4;
    this.xp += 15;
    return { success: true, msg: "💤 달콤한 낮잠을 자고 일어났어요! (체력 +40, 정신력 +4)" };
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

    if (nameEl) nameEl.textContent = \`\${this.name} (\${stage.nameKo})\`;
    if (stagePillEl) stagePillEl.textContent = \`\${stage.stage}단계: \${stage.nameKo}\`;
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

    if (hungerBar) hungerBar.style.width = this.hunger + "%";
    if (happyBar) happyBar.style.width = this.happiness + "%";
    if (energyBar) energyBar.style.width = this.energy + "%";

    if (hungerVal) hungerVal.textContent = this.hunger + "%";
    if (happyVal) happyVal.textContent = this.happiness + "%";
    if (energyVal) energyVal.textContent = this.energy + "%";

    // 5. 10단계 마일스톤 타임라인 바 렌더링
    const currStageText = document.getElementById("pet-curr-stage-text");
    const nextKmText = document.getElementById("pet-next-km-text");
    const progressFill = document.getElementById("pet-stage-progress-fill");
    const dotsContainer = document.getElementById("pet-stages-dots");

    if (currStageText) {
      currStageText.textContent = \`\${stage.stage}단계: \${stageTitles[stage.stage - 1]} (\${this.totalKm.toFixed(1)}km 달림)\`;
    }
    if (nextKmText) {
      nextKmText.textContent = progress.isMax 
        ? "🏆 최종 성체 진화 완료!" 
        : \`다음 단계까지 \${progress.kmNeeded}km 남음\`;
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
        dotsHtml += \`<div class="\${cls}" title="\${s}단계: \${stageTitles[s-1]}">\${s}</div>\`;
      }
      dotsContainer.innerHTML = dotsHtml;
    }

    // 6. 종족 탭 활성화 상태
    document.querySelectorAll(".species-chip").forEach(chip => {
      chip.classList.toggle("active", chip.getAttribute("data-species") === this.petType);
    });
  }
}

// 전역 인스턴스 초기화
let savedPetData = {};
try {
  const raw = localStorage.getItem("RUNNOW_TAMAGOTCHI_STATE");
  if (raw) savedPetData = JSON.parse(raw);
} catch (_) {}

window.Tamagotchi = new TamagotchiEngine(savedPetData);
`;

writeFileSync(join(prjDir, 'tamagotchi.js'), fullTamagotchiCode, 'utf8');
writeFileSync(join(sndDir, 'tamagotchi.js'), fullTamagotchiCode, 'utf8');
console.log('✅ tamagotchi.js updated with 5 species & 10 stages in both projects!');

// ==========================================
// 2. INDEX.HTML - BUTTON OVERFLOW & 5 SPECIES UI
// ==========================================
console.log('2. Updating index.html (overflow button text & pet species UI)...');

function updateIndexHtml(filePath) {
  let html = readFileSync(filePath, 'utf8');

  // Fix coach action button text overflow: 🔑 구글 AI 연동 ($0원) -> 🔑 무료 AI 연동
  html = html.replace('🔑 구글 AI 연동 ($0원)', '🔑 무료 AI 연동');

  // Add pet species bar & evolution timeline if not present
  if (!html.includes('id="pet-species-bar"')) {
    const petHeaderMarker = '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">';
    const newPetControls = `
            <!-- 5대 펫 종족 선택 탭바 (다양화) -->
            <div class="pet-species-bar" id="pet-species-bar">
              <button type="button" class="species-chip active" data-species="dog" onclick="window.Tamagotchi.switchPetSpecies('dog')">🐶 댕댕이</button>
              <button type="button" class="species-chip" data-species="cat" onclick="window.Tamagotchi.switchPetSpecies('cat')">🐱 냥이</button>
              <button type="button" class="species-chip" data-species="rabbit" onclick="window.Tamagotchi.switchPetSpecies('rabbit')">🐰 토끼</button>
              <button type="button" class="species-chip" data-species="panda" onclick="window.Tamagotchi.switchPetSpecies('panda')">🐼 판다</button>
              <button type="button" class="species-chip" data-species="boltmon" onclick="window.Tamagotchi.switchPetSpecies('boltmon')">⚡ 볼트몽</button>
            </div>

            <!-- 10단계 마일스톤 게이지 & 진화 타임라인 -->
            <div class="pet-evolution-timeline" id="pet-evolution-timeline">
              <div class="pet-evolution-header">
                <span class="pet-curr-stage" id="pet-curr-stage-text">1단계: 응애 아기 (0km+)</span>
                <span class="pet-next-km" id="pet-next-km-text">다음 진화까지 2.0km 남음</span>
              </div>
              <div class="pet-progress-track">
                <div class="pet-progress-fill" id="pet-stage-progress-fill" style="width: 10%;"></div>
              </div>
              <div class="pet-stages-dots" id="pet-stages-dots"></div>
            </div>
`;
    html = html.replace(petHeaderMarker, newPetControls + '\n            ' + petHeaderMarker);
  }

  writeFileSync(filePath, html, 'utf8');
  console.log(`  -> Updated index.html: ${filePath}`);
}

updateIndexHtml(join(prjDir, 'index.html'));
updateIndexHtml(join(sndDir, 'index.html'));

// ==========================================
// 3. STYLES.CSS - PREVENT OVERFLOW EVERYWHERE
// ==========================================
console.log('3. Updating styles.css for global overflow prevention & pet UI...');

function updateStylesCss(filePath) {
  let css = readFileSync(filePath, 'utf8');

  const overflowRules = `
/* ==========================================================================
   Global Button Text Overflow Prevention & Pet 10-Stages Styling
   ========================================================================== */

/* 전역 버튼 및 칩 텍스트 오버플로우 원천 차단 헌장 */
button, .btn, .btn-shimmer, .btn-coach-action, .prompt-chip, .t-btn-action, .species-chip, .coach-chip {
  box-sizing: border-box !important;
  max-width: 100% !important;
  word-break: keep-all !important;
}

/* 1:1 케어팀 코치 배너 버튼 오버플로우 영구 차단 */
.coach-banner-actions {
  display: flex !important;
  gap: 6px !important;
  width: 100% !important;
  box-sizing: border-box !important;
}

.btn-coach-action {
  flex: 1 1 0 !important;
  min-width: 0 !important;
  padding: 8px 4px !important;
  font-size: clamp(10px, 2.7vw, 11.5px) !important;
  font-weight: 800 !important;
  border-radius: 10px !important;
  cursor: pointer !important;
  white-space: nowrap !important;
  text-align: center !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  box-sizing: border-box !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
}

/* 타마고치 4대 액션 버튼 글자 오버플로우 방지 */
.t-btn-action span:last-child {
  font-size: clamp(10px, 2.6vw, 11.5px) !important;
  font-weight: 800 !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
}

/* 5대 펫 종족 선택 탭 스타일 */
.pet-species-bar {
  display: flex !important;
  gap: 6px !important;
  margin-bottom: 12px !important;
  overflow-x: auto !important;
  padding-bottom: 4px !important;
  scrollbar-width: none !important;
  width: 100% !important;
  box-sizing: border-box !important;
}
.pet-species-bar::-webkit-scrollbar { display: none !important; }

.species-chip {
  flex: 1 1 auto !important;
  min-width: 62px !important;
  padding: 7px 8px !important;
  font-size: 11.5px !important;
  font-weight: 800 !important;
  border-radius: 10px !important;
  background: var(--surface-elevated, #F8FAFC) !important;
  border: 1.5px solid var(--border-card, #E2E8F0) !important;
  color: var(--text-sub, #4E5968) !important;
  cursor: pointer !important;
  white-space: nowrap !important;
  text-align: center !important;
  transition: all 0.2s ease !important;
}
.species-chip.active {
  background: var(--primary-accent, #00C73C) !important;
  border-color: var(--primary-accent, #00C73C) !important;
  color: #FFFFFF !important;
  box-shadow: 0 4px 12px rgba(0, 199, 60, 0.25) !important;
}

/* 10단계 진화 타임라인 & 프로그레스 바 */
.pet-evolution-timeline {
  background: rgba(255, 255, 255, 0.04) !important;
  border: 1px solid var(--border-card, rgba(255, 255, 255, 0.08)) !important;
  border-radius: 12px !important;
  padding: 10px 14px !important;
  margin-bottom: 16px !important;
  box-sizing: border-box !important;
  width: 100% !important;
}
.pet-evolution-header {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  font-size: 11.5px !important;
  font-weight: 800 !important;
  margin-bottom: 8px !important;
}
.pet-curr-stage { color: var(--primary-accent, #00C73C) !important; }
.pet-next-km { color: var(--text-muted, #8B95A1) !important; font-size: 10.5px !important; }
.pet-progress-track {
  width: 100% !important;
  height: 6px !important;
  background: rgba(255, 255, 255, 0.1) !important;
  border-radius: 6px !important;
  overflow: hidden !important;
  margin-bottom: 8px !important;
}
.pet-progress-fill {
  height: 100% !important;
  background: linear-gradient(90deg, #00C73C, #00F0FF) !important;
  border-radius: 6px !important;
  transition: width 0.4s ease !important;
}
.pet-stages-dots {
  display: flex !important;
  justify-content: space-between !important;
  gap: 2px !important;
}
.pet-stage-dot {
  width: 16px !important;
  height: 16px !important;
  border-radius: 50% !important;
  background: rgba(255, 255, 255, 0.12) !important;
  color: #FFFFFF !important;
  font-size: 8.5px !important;
  font-weight: 900 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: default !important;
  transition: all 0.2s ease !important;
}
.pet-stage-dot.completed {
  background: #00C73C !important;
  box-shadow: 0 0 6px rgba(0, 199, 60, 0.6) !important;
}
.pet-stage-dot.current {
  background: #00F0FF !important;
  color: #000000 !important;
  transform: scale(1.2) !important;
  box-shadow: 0 0 8px #00F0FF !important;
}
`;

  if (!css.includes('Global Button Text Overflow Prevention')) {
    css += overflowRules;
    writeFileSync(filePath, css, 'utf8');
    console.log(`  -> Updated styles.css: ${filePath}`);
  }
}

updateStylesCss(join(prjDir, 'styles.css'));
updateStylesCss(join(sndDir, 'styles.css'));

// 4. Sync pet assets
console.log('4. Syncing pet assets to legacy_web...');
cpSync(join(prjDir, 'assets', 'pets'), join(sndDir, 'assets', 'pets'), { recursive: true, force: true });

console.log('ALL PET 10-STAGES & BUTTON OVERFLOW FIXES APPLIED SUCCESSFULLY!');
