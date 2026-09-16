import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const prjDir = 'C:\\BeausCreators\\02.BSC_Branch\\projects\\Runnow';
const sndDir = 'C:\\BeausCreators\\02.BSC_Branch\\sandbox\\Runnow_APP_V\\legacy_web';

function patchApp(filePath) {
  let code = readFileSync(filePath, 'utf8');

  // 1. Expose window.appController & window.switchPetSpecies
  if (!code.includes('window.switchPetSpecies =')) {
    code = code.replace(
      'window.addEventListener("DOMContentLoaded", () => {\n  const app = new AppController();\n  app.init();\n});',
      `window.addEventListener("DOMContentLoaded", () => {
  const app = new AppController();
  window.appController = app;
  window.switchPetSpecies = (type) => app.switchPetSpecies(type);
  app.init();
});`
    );
  }

  // 2. Add switchPetSpecies to AppController class
  if (!code.includes('switchPetSpecies(type) {')) {
    const switchMethod = `
  switchPetSpecies(type) {
    if (this.tamagotchi && this.tamagotchi.switchPetSpecies) {
      this.tamagotchi.switchPetSpecies(type);
      this.firebaseSandbox.setDoc("tamagotchi", this.currentUserId, this.tamagotchi.toJSON());
      this.renderTamagotchiView();
    }
  }
`;
    code = code.replace('bindTamagotchiActions() {', switchMethod + '\n  bindTamagotchiActions() {');
  }

  // 3. Enhance renderTamagotchiView to update 10-stage timeline & species bar
  if (!code.includes('pet-stages-dots')) {
    const timelineRender = `
    // 10단계 마일스톤 타임라인 & 5대 종족 바 동기화
    if (this.tamagotchi && this.tamagotchi.getStageProgress) {
      const progress = this.tamagotchi.getStageProgress();
      const currStageText = document.getElementById("pet-curr-stage-text");
      const nextKmText = document.getElementById("pet-next-km-text");
      const progressFill = document.getElementById("pet-stage-progress-fill");
      const dotsContainer = document.getElementById("pet-stages-dots");

      if (currStageText) {
        currStageText.textContent = \`\${stage.stage}단계: \${stage.nameKo}\`;
      }
      if (nextKmText) {
        nextKmText.textContent = progress.isMax ? "🏆 최종 성체 진화 완료!" : \`다음 단계까지 \${progress.kmNeeded}km 남음\`;
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
          dotsHtml += \`<div class="\${cls}" title="\${s}단계">\${s}</div>\`;
        }
        dotsContainer.innerHTML = dotsHtml;
      }

      document.querySelectorAll(".species-chip").forEach(chip => {
        chip.classList.toggle("active", chip.getAttribute("data-species") === this.tamagotchi.petType);
      });
    }
`;
    code = code.replace('document.getElementById("t-energy-bar").style.width = `${this.tamagotchi.energy}%`;', 'document.getElementById("t-energy-bar").style.width = `${this.tamagotchi.energy}%`;\n' + timelineRender);
  }

  writeFileSync(filePath, code, 'utf8');
  console.log(`Updated AppController in ${filePath}`);
}

patchApp(join(prjDir, 'app.js'));
patchApp(join(sndDir, 'app.js'));
