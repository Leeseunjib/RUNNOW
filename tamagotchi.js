// 다마고치 캐릭터 엔진 및 5단계 성장 로직 (네이버 웹툰 스타일 강아지 & 고양이)

// 🐶 강아지 계열 5단계 성장 (네이버 웹툰 스타일 댕댕이)
export const DOG_STAGES = [
  {
    stage: 1,
    name: "Baby Pup",
    nameKo: "아기 댕댕이 (0km+)",
    minKm: 0,
    icon: "🐶",
    image: "./assets/pets/dog_stage_1.jpg",
    tagline: "귀를 쫑긋거리며 첫 러닝 헤어밴드를 찬 뽀송뽀송 사랑스러운 아기 강아지",
    petType: "dog",
    svg: '<img src="./assets/pets/dog_stage_1.jpg" alt="아기 댕댕이" class="t-img-avatar bounce-anim" style="width:100%; height:100%; object-fit:cover; border-radius:50%; box-shadow:0 8px 24px var(--card-shadow); border:4px solid var(--primary-accent);">'
  },
  {
    stage: 2,
    name: "Park Walker Pup",
    nameKo: "산책 러너 댕댕이 (5km+)",
    minKm: 5.0,
    icon: "🐕",
    image: "./assets/pets/dog_stage_2.jpg",
    tagline: "귀여운 운동화를 신고 공원을 씩씩하고 경쾌하게 달리는 개구쟁이 댕댕이",
    petType: "dog",
    svg: '<img src="./assets/pets/dog_stage_2.jpg" alt="산책 러너 댕댕이" class="t-img-avatar run-anim" style="width:100%; height:100%; object-fit:cover; border-radius:50%; box-shadow:0 8px 24px var(--card-shadow); border:4px solid var(--primary-accent);">'
  },
  {
    stage: 3,
    name: "Power Jogger",
    nameKo: "파워 조깅 댕댕이 (20km+)",
    minKm: 20.0,
    icon: "🏃‍♂️",
    image: "./assets/pets/dog_stage_3.jpg",
    tagline: "스포츠 밴드와 러닝 배번을 달고 트랙을 질주하는 파이팅 넘치는 댕댕이",
    petType: "dog",
    svg: '<img src="./assets/pets/dog_stage_3.jpg" alt="파워 조깅 댕댕이" class="t-img-avatar run-anim" style="width:100%; height:100%; object-fit:cover; border-radius:50%; box-shadow:0 8px 24px var(--card-shadow); border:4px solid var(--primary-accent);">'
  },
  {
    stage: 4,
    name: "Marathon Finisher",
    nameKo: "마라토너 댕댕이 (50km+)",
    minKm: 50.0,
    icon: "🏅",
    image: "./assets/pets/dog_stage_4.svg",
    tagline: "완주 메달을 목에 걸고 환하게 웃는 늠름하고 든든한 마라토너 댕댕이",
    petType: "dog",
    svg: '<img src="./assets/pets/dog_stage_4.svg" alt="마라토너 댕댕이" class="t-img-avatar master-anim" style="width:100%; height:100%; object-fit:cover; border-radius:50%; box-shadow:0 8px 24px var(--card-shadow); border:4px solid var(--primary-accent);">'
  },
  {
    stage: 5,
    name: "Golden Champion",
    nameKo: "골든 챔피언 댕댕이 (100km+)",
    minKm: 100.0,
    icon: "🏆",
    image: "./assets/pets/dog_stage_5.svg",
    tagline: "황금 월계관과 챔피언 트로피를 차지한 전설의 러닝 마스터 댕댕이",
    petType: "dog",
    svg: '<img src="./assets/pets/dog_stage_5.svg" alt="골든 챔피언 댕댕이" class="t-img-avatar legend-anim" style="width:100%; height:100%; object-fit:cover; border-radius:50%; box-shadow:0 8px 28px var(--card-shadow); border:4px solid #FFB800;">'
  }
];

// 🐱 고양이 계열 5단계 성장 (네이버 웹툰 스타일 냥이)
export const CAT_STAGES = [
  {
    stage: 1,
    name: "Baby Kitten",
    nameKo: "아기 냥냥이 (0km+)",
    minKm: 0,
    icon: "🐱",
    image: "./assets/pets/cat_stage_1.svg",
    tagline: "앙증맞은 방울 목걸이와 반짝이는 눈망울의 동글동글 사랑스러운 아기 고양이",
    petType: "cat",
    svg: '<img src="./assets/pets/cat_stage_1.svg" alt="아기 냥냥이" class="t-img-avatar bounce-anim" style="width:100%; height:100%; object-fit:cover; border-radius:50%; box-shadow:0 8px 24px var(--card-shadow); border:4px solid var(--primary-accent);">'
  },
  {
    stage: 2,
    name: "Playful Kitten",
    nameKo: "호기심 냥냥이 (5km+)",
    minKm: 5.0,
    icon: "🐈",
    image: "./assets/pets/cat_stage_2.svg",
    tagline: "분홍 젤리 발바닥으로 나비를 쫓으며 사뿐사뿐 가볍게 뛰는 발랄한 냥이",
    petType: "cat",
    svg: '<img src="./assets/pets/cat_stage_2.svg" alt="호기심 냥냥이" class="t-img-avatar run-anim" style="width:100%; height:100%; object-fit:cover; border-radius:50%; box-shadow:0 8px 24px var(--card-shadow); border:4px solid var(--primary-accent);">'
  },
  {
    stage: 3,
    name: "Street Runner Cat",
    nameKo: "스트리트 러너 캣 (20km+)",
    minKm: 20.0,
    icon: "🎧",
    image: "./assets/pets/cat_stage_3.svg",
    tagline: "귀여운 헤드폰을 끼고 리듬을 타며 도심을 가볍게 달리는 힙한 고양이",
    petType: "cat",
    svg: '<img src="./assets/pets/cat_stage_3.svg" alt="스트리트 러너 캣" class="t-img-avatar run-anim" style="width:100%; height:100%; object-fit:cover; border-radius:50%; box-shadow:0 8px 24px var(--card-shadow); border:4px solid var(--primary-accent);">'
  },
  {
    stage: 4,
    name: "Speed Master Cat",
    nameKo: "스피드 마스터 캣 (50km+)",
    minKm: 50.0,
    icon: "⚡",
    image: "./assets/pets/cat_stage_4.svg",
    tagline: "바람을 가르는 날렵하고 우아한 폼으로 마라톤 메달을 획득한 멋진 냥이",
    petType: "cat",
    svg: '<img src="./assets/pets/cat_stage_4.svg" alt="스피드 마스터 캣" class="t-img-avatar master-anim" style="width:100%; height:100%; object-fit:cover; border-radius:50%; box-shadow:0 8px 24px var(--card-shadow); border:4px solid var(--primary-accent);">'
  },
  {
    stage: 5,
    name: "Star Champion Cat",
    nameKo: "스타 챔피언 냥신 (100km+)",
    minKm: 100.0,
    icon: "👑",
    image: "./assets/pets/cat_stage_5.svg",
    tagline: "반짝이는 황금 왕관과 별빛 망토를 두른 세상에서 가장 빠르고 사랑스러운 고양이",
    petType: "cat",
    svg: '<img src="./assets/pets/cat_stage_5.svg" alt="스타 챔피언 냥신" class="t-img-avatar legend-anim" style="width:100%; height:100%; object-fit:cover; border-radius:50%; box-shadow:0 8px 28px var(--card-shadow); border:4px solid #BA68C8;">'
  }
];

export const STAGES = DOG_STAGES;

export class TamagotchiEngine {
  constructor(initialData = {}) {
    this.petType = initialData.petType || "dog"; // "dog" | "cat"
    this.petChosen = initialData.petChosen === true;
    this.name = initialData.name || (this.petType === "cat" ? "냥냥이" : "댕댕이");
    this.level = initialData.level || 1;
    this.xp = initialData.xp || 0;
    this.totalKm = initialData.totalKm || 0.0;
    this.hunger = initialData.hunger !== undefined ? initialData.hunger : 100;
    this.happiness = initialData.happiness !== undefined ? initialData.happiness : 100;
    this.energy = initialData.energy !== undefined ? initialData.energy : 100;
    
    // 생체 3대 스탯
    this.might = initialData.might !== undefined ? initialData.might : 10;     // 근력/지구력
    this.agility = initialData.agility !== undefined ? initialData.agility : 10; // 민첩성/스피드
    this.spirit = initialData.spirit !== undefined ? initialData.spirit : 10;   // 정신력/컨디션
    
    this.statusCondition = initialData.statusCondition || "HEALTHY";
    this.lastFed = initialData.lastFed || Date.now();
  }

  setPetType(type) {
    if (type === "dog" || type === "cat") {
      this.petType = type;
      if ((this.name === "댕댕이" || this.name === "볼트몽") && type === "cat") this.name = "냥냥이";
      if ((this.name === "냥냥이" || this.name === "네온냥") && type === "dog") this.name = "댕댕이";
    }
  }

  getStagesList() {
    return this.petType === "cat" ? CAT_STAGES : DOG_STAGES;
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

  getXpToNextLevel() {
    return this.level * 250;
  }

  addKmAndWorkout(km, durationSec, paceSec = 360) {
    this.totalKm = parseFloat((this.totalKm + km).toFixed(2));
    
    let statGrowth = { might: 0, agility: 0, spirit: 0 };
    let workoutType = "표준 조깅 런";

    if (paceSec < 330) {
      statGrowth.agility = Math.round(km * (this.petType === "cat" ? 8 : 6) + 4);
      statGrowth.might = Math.round(km * 3);
      statGrowth.spirit = Math.round(km * 2);
      workoutType = this.petType === "cat" ? "🐱 민첩한 쾌속 런 (스피드 특화)" : "🐕 씩씩한 파워 질주 (스피드 특화)";
    } else if (km >= 3.0) {
      statGrowth.might = Math.round(km * (this.petType === "dog" ? 8 : 6) + 5);
      statGrowth.spirit = Math.round(km * 4);
      statGrowth.agility = Math.round(km * 2);
      workoutType = this.petType === "dog" ? "🐶 든든한 롱런 (지구력 특화)" : "🐾 가벼운 롱 스테디런 (지구력 특화)";
    } else {
      statGrowth.spirit = Math.round(km * 6 + 5);
      statGrowth.might = Math.round(km * 3);
      statGrowth.agility = Math.round(km * 3);
      workoutType = "🌱 힐링 산책런 (컨디션 회복)";
    }

    this.might = Math.min(100, this.might + statGrowth.might);
    this.agility = Math.min(100, this.agility + statGrowth.agility);
    this.spirit = Math.min(100, this.spirit + statGrowth.spirit);

    const earnedXp = Math.round(km * 100);
    this.addXp(earnedXp);

    this.hunger = Math.max(0, this.hunger - Math.round(km * 5));
    this.energy = Math.max(0, this.energy - Math.round(km * 8));
    this.happiness = Math.min(100, this.happiness + Math.round(km * 10));

    this.evaluateCondition();

    return {
      earnedXp,
      statGrowth,
      workoutType,
      currentStage: this.getStage()
    };
  }

  addXp(amount) {
    this.xp += amount;
    while (this.xp >= this.getXpToNextLevel()) {
      this.xp -= this.getXpToNextLevel();
      this.level++;
      this.happiness = 100;
      this.energy = 100;
      this.might = Math.min(100, this.might + 5);
      this.agility = Math.min(100, this.agility + 5);
      this.spirit = Math.min(100, this.spirit + 5);
      this.playSound("levelup");
    }
  }

  evaluateCondition() {
    if (this.energy < 20 || this.hunger < 20) {
      this.statusCondition = "EXHAUSTED";
    } else if (this.happiness < 30) {
      this.statusCondition = "DEPRESSED";
    } else if (this.might > 80 && this.agility > 80) {
      this.statusCondition = "BEST_CONDITION";
    } else {
      this.statusCondition = "HEALTHY";
    }
  }

  feed() {
    this.hunger = Math.min(100, this.hunger + 30);
    this.energy = Math.min(100, this.energy + 10);
    this.lastFed = Date.now();
    this.addXp(15);
    this.evaluateCondition();
    this.playSound("eat");
    return {
      success: true,
      msg: this.petType === "cat" ? "🐟 맛있는 츄르를 먹고 기분 좋게 갸르릉거립니다! (+15 XP)" : "🍖 고소한 영양 간식을 맛있게 먹고 꼬리를 살랑입니다! (+15 XP)"
    };
  }

  play() {
    if (this.energy < 15) {
      return { success: false, msg: "💤 펫이 지쳐있어요. 휴식을 취하게 해주세요!" };
    }
    this.happiness = Math.min(100, this.happiness + 25);
    this.energy = Math.max(0, this.energy - 15);
    this.addXp(20);
    this.evaluateCondition();
    this.playSound("happy");
    return {
      success: true,
      msg: this.petType === "cat" ? "✨ 깃털 장난감을 잡으러 신나게 점프하며 행복도가 +25 올랐습니다! (+20 XP)" : "🎾 푹신한 장난감 공을 물어오며 행복도가 +25 올랐습니다! (+20 XP)"
    };
  }

  rest() {
    this.energy = Math.min(100, this.energy + 40);
    this.hunger = Math.max(0, this.hunger - 10);
    this.addXp(10);
    this.evaluateCondition();
    this.playSound("sleep");
    return {
      success: true,
      msg: "💤 포근한 침대에서 꿀잠을 자며 기력이 +40 회복되었습니다! (+10 XP)"
    };
  }

  rescueVolt() {
    this.hunger = 100;
    this.happiness = 100;
    this.energy = 100;
    this.statusCondition = "HEALTHY";
    this.playSound("levelup");
    return {
      success: true,
      msg: "✨ 힐링 케어를 받아 모든 컨디션이 100% 가득 찼습니다!"
    };
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
    } catch (e) {
      // Audio fallback
    }
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
      lastFed: this.lastFed
    };
  }
}
