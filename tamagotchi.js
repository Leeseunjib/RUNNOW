// 다마고치 캐릭터 엔진 및 5단계 진화 로직 (Tamagotchi Engine)

export const STAGES = [
  {
    stage: 1,
    name: "Runner Egg",
    nameKo: "러너 에그",
    minKm: 0,
    icon: "🥚",
    tagline: "호기심 가득한 네온 볼트 알",
    svg: `<svg viewBox="0 0 100 100" class="t-svg egg-anim">
      <ellipse cx="50" cy="55" rx="30" ry="38" fill="url(#voltGrad)" stroke="#CCFF00" stroke-width="3"/>
      <path d="M40 40 Q50 30 60 40 Q50 50 40 40" fill="#08090C" opacity="0.6"/>
      <circle cx="45" cy="45" r="3" fill="#08090C"/>
      <circle cx="55" cy="45" r="3" fill="#08090C"/>
      <path d="M47 53 Q50 56 53 53" stroke="#08090C" stroke-width="2" fill="none"/>
    </svg>`
  },
  {
    stage: 2,
    name: "Rookie Chick",
    nameKo: "루키 병아리",
    minKm: 5.0,
    icon: "🐥",
    tagline: "헤드밴드를 매고 첫 발을 내딛은 루키",
    svg: `<svg viewBox="0 0 100 100" class="t-svg bounce-anim">
      <circle cx="50" cy="50" r="32" fill="#FFD700" stroke="#CCFF00" stroke-width="3"/>
      <rect x="25" y="32" width="50" height="8" rx="4" fill="#CCFF00" stroke="#08090C" stroke-width="1.5"/>
      <circle cx="40" cy="48" r="4" fill="#08090C"/><circle cx="60" cy="48" r="4" fill="#08090C"/>
      <polygon points="46,54 54,54 50,62" fill="#FF5722"/>
      <ellipse cx="32" cy="65" rx="8" ry="4" fill="#FFA500"/>
      <ellipse cx="68" cy="65" rx="8" ry="4" fill="#FFA500"/>
    </svg>`
  },
  {
    stage: 3,
    name: "Urban Runner",
    nameKo: "어반 러너 (여우)",
    minKm: 20.0,
    icon: "🦊",
    tagline: "바람을 가르는 날렵한 도심의 질주자",
    svg: `<svg viewBox="0 0 100 100" class="t-svg run-anim">
      <polygon points="25,25 35,50 15,45" fill="#FF7043" stroke="#08090C" stroke-width="2"/>
      <polygon points="75,25 65,50 85,45" fill="#FF7043" stroke="#08090C" stroke-width="2"/>
      <circle cx="50" cy="55" r="30" fill="#FF7043" stroke="#CCFF00" stroke-width="2"/>
      <circle cx="40" cy="52" r="4" fill="#08090C"/><circle cx="60" cy="52" r="4" fill="#08090C"/>
      <circle cx="50" cy="62" r="3" fill="#08090C"/>
      <path d="M45 68 Q50 72 55 68" stroke="#08090C" stroke-width="2" fill="none"/>
      <path d="M30 75 L70 75" stroke="#CCFF00" stroke-width="6" stroke-linecap="round"/>
    </svg>`
  },
  {
    stage: 4,
    name: "Marathon Master",
    nameKo: "마라톤 마스터 (표범)",
    minKm: 50.0,
    icon: "🐆",
    tagline: "한계에 도전하는 강인한 체력의 표범",
    svg: `<svg viewBox="0 0 100 100" class="t-svg master-anim">
      <circle cx="50" cy="50" r="34" fill="#FFA726" stroke="#00F0FF" stroke-width="3"/>
      <!-- 사이버 고글 -->
      <rect x="25" y="42" width="50" height="12" rx="6" fill="#00F0FF" opacity="0.85" stroke="#FFFFFF" stroke-width="1.5"/>
      <line x1="32" y1="48" x2="68" y2="48" stroke="#FFFFFF" stroke-width="2"/>
      <circle cx="35" cy="30" r="8" fill="#FB8C00"/>
      <circle cx="65" cy="30" r="8" fill="#FB8C00"/>
      <circle cx="50" cy="66" r="4" fill="#08090C"/>
      <path d="M42 74 Q50 78 58 74" stroke="#08090C" stroke-width="2.5" fill="none"/>
    </svg>`
  },
  {
    stage: 5,
    name: "Cyber Speedster",
    nameKo: "사이버 스피드스타",
    minKm: 100.0,
    icon: "⚡",
    tagline: "번개와 볼트 오라를 휘감은 전설의 신수",
    svg: `<svg viewBox="0 0 100 100" class="t-svg legend-anim">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <circle cx="50" cy="50" r="36" fill="#12161F" stroke="#CCFF00" stroke-width="4" filter="url(#glow)"/>
      <path d="M50 15 L58 38 L80 40 L62 55 L68 78 L50 65 L32 78 L38 55 L20 40 L42 38 Z" fill="#CCFF00" opacity="0.3"/>
      <circle cx="40" cy="46" r="5" fill="#00F0FF" filter="url(#glow)"/>
      <circle cx="60" cy="46" r="5" fill="#00F0FF" filter="url(#glow)"/>
      <path d="M42 66 L50 72 L58 66" stroke="#CCFF00" stroke-width="3" stroke-linecap="round" fill="none"/>
      <!-- 전격 마크 -->
      <polygon points="50,28 44,42 52,42 47,56 56,40 48,40" fill="#CCFF00"/>
    </svg>`
  }
];

export class TamagotchiEngine {
  constructor(initialData = {}) {
    this.name = initialData.name || "볼트몽";
    this.level = initialData.level || 1;
    this.xp = initialData.xp || 0;
    this.totalKm = initialData.totalKm || 0.0;
    this.hunger = initialData.hunger !== undefined ? initialData.hunger : 100; // 0~100
    this.happiness = initialData.happiness !== undefined ? initialData.happiness : 100; // 0~100
    this.energy = initialData.energy !== undefined ? initialData.energy : 100; // 0~100
    
    // NotebookLM Research: Physiology (초기 3대 생체 실측 스탯 10에서 시작)
    this.might = initialData.might !== undefined ? initialData.might : 10;       // 근력/지구력
    this.agility = initialData.agility !== undefined ? initialData.agility : 10;   // 민첩성/스피드
    this.spirit = initialData.spirit !== undefined ? initialData.spirit : 10;     // 정신력/컨디션
    
    this.statusCondition = initialData.statusCondition || "HEALTHY"; // HEALTHY, TIRED, NEED_RESCUE
    this.lastFed = initialData.lastFed || Date.now();
  }

  getStage() {
    for (let i = STAGES.length - 1; i >= 0; i--) {
      if (this.totalKm >= STAGES[i].minKm) {
        return STAGES[i];
      }
    }
    return STAGES[0];
  }

  getXpToNextLevel() {
    return this.level * 250;
  }

  // 실제 GPS 러닝 데이터(거리, 시간, 페이스) 기반 생체 스탯 및 경험치 변환
  addKmAndWorkout(km, durationSec, paceSec = 360) {
    this.totalKm = parseFloat((this.totalKm + km).toFixed(2));
    
    // 페이스에 따른 생체 스탯 성장 차등 (Physiology XP)
    let statGrowth = { might: 0, agility: 0, spirit: 0 };
    let workoutType = "표준 밸런스 런";

    if (paceSec < 330) { // 5'30" 이하 빠른 페이스 -> 스피드 런
      statGrowth.agility = Math.round(km * 6 + 4);
      statGrowth.might = Math.round(km * 3);
      statGrowth.spirit = Math.round(km * 2);
      workoutType = "⚡ 번개 스피드런 (민첩성 특화)";
    } else if (km >= 3.0) { // 3km 이상 장거리 -> 지구력 런
      statGrowth.might = Math.round(km * 6 + 5);
      statGrowth.spirit = Math.round(km * 4);
      statGrowth.agility = Math.round(km * 2);
      workoutType = "🛡️ 롱 스테디런 (근지구력 특화)";
    } else { // 가벼운 조깅/리커버리
      statGrowth.spirit = Math.round(km * 5 + 5);
      statGrowth.might = Math.round(km * 3);
      statGrowth.agility = Math.round(km * 3);
      workoutType = "🌱 리커버리 런 (정신력/컨디션 회복)";
    }

    this.might = Math.min(100, this.might + statGrowth.might);
    this.agility = Math.min(100, this.agility + statGrowth.agility);
    this.spirit = Math.min(100, this.spirit + statGrowth.spirit);

    // 경험치 공식: 거리 x 120 + 시간 보너스 + 스탯 성장치
    const earnedXp = Math.round(km * 120 + (durationSec / 60) * 10 + (statGrowth.might + statGrowth.agility + statGrowth.spirit) * 3);
    const leveledUp = this.addXp(earnedXp);

    // 운동 후 컨디션 자동 정상화
    this.statusCondition = "HEALTHY";
    this.hunger = Math.max(10, Math.round(this.hunger - km * 10));
    this.happiness = Math.min(100, Math.round(this.happiness + 25));
    this.energy = Math.max(20, Math.round(this.energy - km * 6));

    return { 
      earnedXp, 
      leveledUp,
      statGrowth, 
      workoutType,
      currentStage: this.getStage() 
    };
  }

  addXp(amount) {
    this.xp += amount;
    let leveledUp = false;
    while (this.xp >= this.getXpToNextLevel()) {
      this.xp -= this.getXpToNextLevel();
      this.level += 1;
      leveledUp = true;
    }
    return leveledUp;
  }

  feed() {
    if (this.hunger >= 100) return { success: false, msg: "이미 배가 가득 찼습니다!" };
    this.hunger = Math.min(100, this.hunger + 30);
    this.happiness = Math.min(100, this.happiness + 10);
    this.spirit = Math.min(100, this.spirit + 3);
    this.addXp(20);
    return { success: true, msg: "맛있는 전해질 간식을 먹고 기운을 차렸습니다! (+20 XP, 정신력 +3)" };
  }

  play() {
    if (this.energy < 15) return { success: false, msg: "에너지가 부족합니다. 휴식이 필요해요!" };
    this.energy = Math.max(0, this.energy - 15);
    this.happiness = Math.min(100, this.happiness + 20);
    this.agility = Math.min(100, this.agility + 4);
    this.addXp(35);
    return { success: true, msg: "신나는 미니 스프린트 놀이를 했습니다! (+35 XP, 민첩성 +4)" };
  }

  rest() {
    this.energy = 100;
    this.happiness = Math.min(100, this.happiness + 5);
    this.spirit = Math.min(100, this.spirit + 5);
    return { success: true, msg: "꿀맛 같은 휴식을 취해 에너지가 100% 충전되었습니다. (정신력 +5)" };
  }

  // 스트레스 완충 손실 방지 (Rescue & Recharge)
  rescueVolt() {
    this.statusCondition = "HEALTHY";
    this.energy = 80;
    this.happiness = 85;
    this.hunger = 80;
    return { success: true, msg: "⚡ 볼트 긴급 회복 완료! 다시 활기차게 달릴 준비가 되었습니다." };
  }

  toJSON() {
    return {
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
      lastFed: this.lastFed
    };
  }
}
