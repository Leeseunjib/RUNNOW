import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const prjDir = 'C:\\BeausCreators\\02.BSC_Branch\\projects\\Runnow';
const sndDir = 'C:\\BeausCreators\\02.BSC_Branch\\sandbox\\Runnow_APP_V\\legacy_web';

function addMissingMethods(filePath) {
  let code = readFileSync(filePath, 'utf8');

  const methodsToAdd = `
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
      lastActionAt: { ...this.lastActionAt }
    };
  }
`;

  code = code.replace('render() {', methodsToAdd + '\n  render() {');
  writeFileSync(filePath, code, 'utf8');
  console.log(`Updated ${filePath} with missing methods`);
}

addMissingMethods(join(prjDir, 'tamagotchi.js'));
addMissingMethods(join(sndDir, 'tamagotchi.js'));
