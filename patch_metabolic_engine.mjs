import fs from 'fs';

const filePath = 'C:\\BeausCreators\\02.BSC_Branch\\sandbox\\Runnow_APP_V\\legacy_web\\tamagotchi.js';
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Update constructor to include lastMetabolicTick and call applyMetabolicDecay()
const oldConstructorTarget = `    this.statusCondition = initialData.statusCondition || "HEALTHY";
    this.lastFed = initialData.lastFed || Date.now();

    this.lastActionAt = {
      feed: 0,
      play: 0,
      rest: 0,
      rescue: 0,
      ...(initialData.lastActionAt || {})
    };
  }`;

const newConstructor = `    this.statusCondition = initialData.statusCondition || "HEALTHY";
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
  }`;

content = content.replace(oldConstructorTarget, newConstructor);

// 2. Enhance addKmAndWorkout with realistic running exertion
const oldWorkoutTarget = `    this.hunger = Math.max(0, this.hunger - Math.round(km * 5));
    this.energy = Math.max(0, this.energy - Math.round(km * 7));
    this.happiness = Math.min(100, this.happiness + Math.round(km * 4));`;

const newWorkout = `    // 🏃‍♂️ 함께 달린 펫의 땀방울 소모 연동 (km 비례 체력·포만감 소모 & 완주 기쁨)
    const runHungerBurn = Math.round(km * 8 + 3);  // 3km 달리면 -27% 배고파짐
    const runEnergyBurn = Math.round(km * 10 + 4); // 3km 달리면 -34% 땀 흘림
    const runHappyBoost = Math.round(km * 6 + 10); // 함께 달려서 신남 +28%

    this.hunger = Math.max(10, this.hunger - runHungerBurn);
    this.energy = Math.max(15, this.energy - runEnergyBurn);
    this.happiness = Math.min(100, this.happiness + runHappyBoost);
    this.lastMetabolicTick = Date.now();
    this.saveState();`;

content = content.replace(oldWorkoutTarget, newWorkout);

// 3. Enhance feed, play, rest with better messages & stat sync
const oldFeedTarget = `  feed() {
    const blocked = this.blockedByCooldown("feed", "간식 주기");
    if (blocked) return blocked;
    if (this.hunger >= 100) return { success: false, msg: "🍖 이미 배가 불러요! (포만감 100%)" };
    this.markAction("feed");
    this.hunger = Math.min(100, this.hunger + 30);
    this.happiness = Math.min(100, this.happiness + 10);
    this.might += 2;
    this.xp += 15;
    return { success: true, msg: "🍖 맛있는 영양 간식을 먹고 힘이 솟아나요! (포만감 +30, 지구력 +2)" };
  }`;

const newFeed = `  feed() {
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
  }`;

content = content.replace(oldFeedTarget, newFeed);

// 4. Update play to also burn a little hunger
const oldPlayTarget = `  play() {
    const blocked = this.blockedByCooldown("play", "놀아주기");
    if (blocked) return blocked;
    if (this.energy < 15) return { success: false, msg: "💤 펫이 지쳐있어요. 휴식을 취하게 해주세요!" };
    this.markAction("play");
    this.happiness = Math.min(100, this.happiness + 25);
    this.energy = Math.max(0, this.energy - 15);
    this.agility += 3;
    this.xp += 20;
    return { success: true, msg: "🎾 신나게 공놀이를 하며 달렸어요! (행복도 +25, 스피드 +3)" };
  }`;

const newPlay = `  play() {
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
  }`;

content = content.replace(oldPlayTarget, newPlay);

// 5. Update rest
const oldRestTarget = `  rest() {
    const blocked = this.blockedByCooldown("rest", "휴식");
    if (blocked) return blocked;
    if (this.energy >= 100) return { success: false, msg: "⚡ 이미 에너지가 가득 차 있어요! (체력 100%)" };
    this.markAction("rest");
    this.energy = Math.min(100, this.energy + 40);
    this.spirit += 4;
    this.xp += 15;
    return { success: true, msg: "💤 달콤한 낮잠을 자고 일어났어요! (체력 +40, 정신력 +4)" };
  }`;

const newRest = `  rest() {
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
  }`;

content = content.replace(oldRestTarget, newRest);

// 6. Update toJSON
const oldJsonTarget = `      statusCondition: this.statusCondition,
      lastFed: this.lastFed,
      lastActionAt: { ...this.lastActionAt }
    };`;

const newJson = `      statusCondition: this.statusCondition,
      lastFed: this.lastFed,
      lastMetabolicTick: this.lastMetabolicTick,
      lastActionAt: { ...this.lastActionAt }
    };`;

content = content.replace(oldJsonTarget, newJson);

// 7. Dynamic Gauge Color & Condition Bubble in render()
const oldGaugeRender = `    if (hungerBar) hungerBar.style.width = this.hunger + "%";
    if (happyBar) happyBar.style.width = this.happiness + "%";
    if (energyBar) energyBar.style.width = this.energy + "%";

    if (hungerVal) hungerVal.textContent = this.hunger + "%";
    if (happyVal) happyVal.textContent = this.happiness + "%";
    if (energyVal) energyVal.textContent = this.energy + "%";`;

const newGaugeRender = `    if (hungerBar) {
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
    }`;

content = content.replace(oldGaugeRender, newGaugeRender);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Successfully patched metabolic decay and exertion engine into tamagotchi.js');
