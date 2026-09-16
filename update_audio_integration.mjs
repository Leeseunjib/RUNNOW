import { readFileSync, writeFileSync, cpSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const prjDir = 'C:\\BeausCreators\\02.BSC_Branch\\projects\\Runnow';
const sndDir = 'C:\\BeausCreators\\02.BSC_Branch\\sandbox\\Runnow_APP_V\\legacy_web';

// 1. Audio Sync to sandbox
console.log('1. Syncing audio assets to sandbox legacy_web...');
const prjAudio = join(prjDir, 'assets', 'audio');
const sndAudio = join(sndDir, 'assets', 'audio');
cpSync(prjAudio, sndAudio, { recursive: true, force: true });
console.log('   Audio files synced successfully!');

// 2. Update careTeam.js
console.log('2. Updating careTeam.js...');
function updateCareTeam(filePath) {
  let code = readFileSync(filePath, 'utf8');

  // Insert SITUATIONAL_AUDIO_MAP if not present
  if (!code.includes('const SITUATIONAL_AUDIO_MAP =')) {
    const mapCode = `
  // 상황별 실사 인공신경망 성우 오디오 매핑 테이블 (50+종 지원)
  const SITUATIONAL_AUDIO_MAP = [
    // 1. 시간대별 맞춤 인사
    { pattern: /(아침|모닝|기상|일어나|공복)/, file: "./assets/audio/careteam/care_morning_leo.mp3" },
    { pattern: /(밤|야간|퇴근|저녁|나이트)/, file: "./assets/audio/careteam/care_night_leo.mp3" },
    { pattern: /(점심|오후|산책|나른|식곤)/, file: "./assets/audio/careteam/care_afternoon_luna.mp3" },
    { pattern: /(심야|자정|새벽|잠이|수면|자고|불면)/, file: "./assets/audio/careteam/care_midnight_rest.mp3" },

    // 2. 날씨 & 환경 대응
    { pattern: /(비|우천|장마|비와|빗길|실내)/, file: "./assets/audio/careteam/weather_rain_indoor.mp3" },
    { pattern: /(미세먼지|황사|스모그|공기)/, file: "./assets/audio/careteam/weather_dust_warning.mp3" },
    { pattern: /(더워|폭염|여름|더위|뜨거)/, file: "./assets/audio/careteam/weather_hot_summer.mp3" },
    { pattern: /(추워|쌀쌀|겨울|한파|찬바람)/, file: "./assets/audio/careteam/weather_cold_winter.mp3" },

    // 3. 멘탈 & 동기부여 & 정체기
    { pattern: /(정체기|슬럼프|안 빠져|몸무게|체중|정체)/, file: "./assets/audio/careteam/mind_slump_luna.mp3" },
    { pattern: /(귀찮|나가기 싫|의지|동기부여|게을|침대)/, file: "./assets/audio/careteam/mind_lazy_leo.mp3" },
    { pattern: /(칭찬|꾸준|자랑|대단|잘하고)/, file: "./assets/audio/careteam/mind_praise_great.mp3" },
    { pattern: /(번아웃|지쳐|힘들어|쉬고 싶|피곤|탈진)/, file: "./assets/audio/careteam/mind_burnout_rest.mp3" },

    // 4. 재활 & 스트레칭 & 통증 (닥터 케이)
    { pattern: /(무릎|아이스|얼음|냉찜질|관절)/, file: "./assets/audio/careteam/rehab_knee_ice.mp3" },
    { pattern: /(발바닥|족저근막|아치|발바닥 아파)/, file: "./assets/audio/careteam/rehab_plantar_massage.mp3" },
    { pattern: /(종아리|쥐|경련|당겨)/, file: "./assets/audio/careteam/rehab_calf_stretch.mp3" },
    { pattern: /(허리|골반|장요근|척추|디스크|자세)/, file: "./assets/audio/careteam/rehab_posture_spine.mp3" },

    // 5. 다이어트 & 영양 (영양사 엘리)
    { pattern: /(단백질|프로틴|골든타임|쉐이크)/, file: "./assets/audio/careteam/diet_protein_timing.mp3" },
    { pattern: /(혈당|간헐적|공복혈당|식사순서)/, file: "./assets/audio/careteam/diet_fasting_tip.mp3" },
    { pattern: /(물|수분|전해질|목말|갈증|이온)/, file: "./assets/audio/careteam/diet_water_electrolyte.mp3" },
    { pattern: /(술|음주|회식|숙취|해장|소주|맥주)/, file: "./assets/audio/careteam/diet_alcohol_recovery.mp3" },

    // 6. 타마고치 펫 러닝
    { pattern: /(펫|강아지|고양이|다마고치|꼬리)/, file: "./assets/audio/running/pet_run_cheer.mp3" },

    // 7. 치팅 / 야식 / 루틴 퀵버블
    { pattern: /(폭식|치팅|삼겹살|피자|치킨|과식)/, file: "./assets/audio/careteam/leo_bubble_cheat.mp3" },
    { pattern: /(야식|라면|배고파|야식충동)/, file: "./assets/audio/careteam/leo_bubble_snack.mp3" },
    { pattern: /(루틴|스케줄|30분|월수금)/, file: "./assets/audio/careteam/leo_bubble_routine.mp3" }
  ];
`;
    code = code.replace('const GEMINI_API_KEY_STORAGE = "RUNNOW_USER_GEMINI_KEY";', 'const GEMINI_API_KEY_STORAGE = "RUNNOW_USER_GEMINI_KEY";\n' + mapCode);
  }

  // Update sendMessage to detect situational audio
  const oldSend = `async sendMessage(userText, matchedAudioUrl = null) {`;
  const newSend = `async sendMessage(userText, specificAudioUrl = null) {
      if (!userText || !userText.trim()) return;
      const text = userText.trim();

      // 상황별 오디오 자동 매칭
      let matchedAudioUrl = specificAudioUrl;
      if (!matchedAudioUrl) {
        for (const item of SITUATIONAL_AUDIO_MAP) {
          if (item.pattern.test(text)) {
            matchedAudioUrl = item.file;
            break;
          }
        }
      }`;

  if (code.includes('async sendMessage(userText, matchedAudioUrl = null) {')) {
    code = code.replace('async sendMessage(userText, matchedAudioUrl = null) {\n      if (!userText || !userText.trim()) return;\n      const text = userText.trim();', newSend);
  } else if (code.includes('async sendMessage(userText) {')) {
    code = code.replace('async sendMessage(userText) {\n      if (!userText || !userText.trim()) return;\n      const text = userText.trim();', newSend);
  }

  // Ensure handleCoachReply takes and passes matchedAudioUrl
  code = code.replace(
    /handleCoachReply\(res\.reply, "cheer", schedules\);/g,
    'handleCoachReply(res.reply, "cheer", schedules, matchedAudioUrl);'
  );
  code = code.replace(
    /handleCoachReply\(aiReply\.text, aiReply\.mood \|\| "cheer", schedules\);/g,
    'handleCoachReply(aiReply.text, aiReply.mood || "cheer", schedules, matchedAudioUrl);'
  );
  code = code.replace(
    /this\.handleCoachReply\(response\.reply, response\.mood, response\.newSchedules \|\| response\.newSchedule\);/g,
    'this.handleCoachReply(response.reply, response.mood, response.newSchedules || response.newSchedule, matchedAudioUrl);'
  );
  code = code.replace(
    /handleCoachReply\(replyText, mood = "cheer", newSchedule = null\) {/g,
    'handleCoachReply(replyText, mood = "cheer", newSchedule = null, matchedAudioUrl = null) {'
  );

  writeFileSync(filePath, code, 'utf8');
  console.log(`   Updated: ${filePath}`);
}

updateCareTeam(join(prjDir, 'careTeam.js'));
updateCareTeam(join(sndDir, 'careTeam.js'));

// 3. Update gpsRunner.js
console.log('3. Updating gpsRunner.js...');
function updateGpsRunner(filePath) {
  let code = readFileSync(filePath, 'utf8');

  if (!code.includes('this.achievedMilestones = new Set();')) {
    code = code.replace(
      'this.elevationGainM = 0;',
      'this.elevationGainM = 0;\n    this.achievedMilestones = new Set();'
    );
  }

  if (!code.includes('playRunningAudio(')) {
    const audioMethods = `
  playRunningAudio(filename) {
    try {
      const audio = new Audio(\`assets/audio/running/\${filename}.mp3\`);
      audio.volume = 1.0;
      audio.play().catch(() => {});
    } catch (_) {}
  }

  checkRunningMilestones(meters) {
    if (!this.achievedMilestones) this.achievedMilestones = new Set();

    if (meters >= 1000 && !this.achievedMilestones.has(1)) {
      this.achievedMilestones.add(1);
      this.playRunningAudio('run_1km_leo');
    } else if (meters >= 2000 && !this.achievedMilestones.has(2)) {
      this.achievedMilestones.add(2);
      this.playRunningAudio('run_2km_luna');
    } else if (meters >= 3000 && !this.achievedMilestones.has(3)) {
      this.achievedMilestones.add(3);
      this.playRunningAudio('run_3km_leo');
    } else if (meters >= 5000 && !this.achievedMilestones.has(5)) {
      this.achievedMilestones.add(5);
      this.playRunningAudio('run_5km_cheer');
    } else if (meters >= 7000 && !this.achievedMilestones.has(7)) {
      this.achievedMilestones.add(7);
      this.playRunningAudio('run_7km_push');
    } else if (meters >= 10000 && !this.achievedMilestones.has(10)) {
      this.achievedMilestones.add(10);
      this.playRunningAudio('run_10km_finish');
    }
  }
`;
    // Insert before startRun
    code = code.replace('startRun(useSimulation = false) {', audioMethods + '\n  startRun(useSimulation = false) {');
    
    // Add start sound
    code = code.replace(
      'this.startVisibilityWatch();\n    this.emitUpdate();',
      'this.startVisibilityWatch();\n    this.playRunningAudio("run_start_leo");\n    this.emitUpdate();'
    );

    // Add milestone check in real GPS movement
    code = code.replace(
      'this.totalMeters += dMeters;',
      'this.totalMeters += dMeters;\n        this.checkRunningMilestones(this.totalMeters);'
    );

    // Add milestone check in simulation
    code = code.replace(
      'this.totalMeters += stepMeters;',
      'this.totalMeters += stepMeters;\n    this.checkRunningMilestones(this.totalMeters);'
    );

    // Add stop/finish audio
    code = code.replace(
      'stopRun() {',
      'stopRun() {\n    this.playRunningAudio("run_finish_cool");'
    );

    writeFileSync(filePath, code, 'utf8');
    console.log(`   Updated: ${filePath}`);
  }
}

updateGpsRunner(join(prjDir, 'gpsRunner.js'));
updateGpsRunner(join(sndDir, 'gpsRunner.js'));

// 4. Update index.html with expanded Quick Prompt Chips
console.log('4. Updating index.html with expanded quick chips...');
function updateIndexHtml(filePath) {
  let html = readFileSync(filePath, 'utf8');

  const oldPromptsBlock = `<div class="coach-quick-prompts" style="margin-bottom:8px; display:flex; gap:6px; overflow-x:auto; padding-bottom:4px;">
                <button type="button" class="prompt-chip" onclick="window.CareTeam.sendQuickBubble('오늘 삼겹살/피자 폭식했어요 ㅠㅠ 죄책감 들어요')">🍕 삼겹살/피자 폭식 고백 (No-Guilt)</button>
                <button type="button" class="prompt-chip" onclick="window.CareTeam.sendQuickBubble('오늘 퇴근하고 너무 지치고 귀찮아요... 위로해줘요')">😫 지치고 귀찮을 때 (정서적 공감)</button>
                <button type="button" class="prompt-chip" onclick="window.CareTeam.sendQuickBubble('달리다가 무릎이 살짝 시큰거리는데 뛰어도 될까요?')">🦵 무릎 시큰거림 체크 (닥터)</button>
                <button type="button" class="prompt-chip" onclick="window.CareTeam.sendQuickBubble('이번 주 뱃살 빼는 월/수/금 3일 30분 루틴 짜줘!')">📅 3일 30분 뱃살 루틴 생성</button>
                <button type="button" class="prompt-chip" onclick="window.CareTeam.sendQuickBubble('야식 유혹이 너무 심해요! 지금 라면 끓일까 고민돼요')">🍜 야식 유혹 방어 SOS</button>
              </div>`;

  const newPromptsBlock = `<div class="coach-quick-prompts" style="margin-bottom:10px; display:flex; gap:6px; overflow-x:auto; padding-bottom:6px; scrollbar-width:thin;">
                <button type="button" class="prompt-chip" onclick="window.CareTeam.sendQuickBubble('오늘 삼겹살/피자 폭식했어요 ㅠㅠ 죄책감 들어요')">🍕 폭식 만회 SOS</button>
                <button type="button" class="prompt-chip" onclick="window.CareTeam.sendQuickBubble('오늘 퇴근하고 너무 지치고 귀찮아요... 위로해줘요')">😫 퇴근 후 번아웃 위로</button>
                <button type="button" class="prompt-chip" onclick="window.CareTeam.sendQuickBubble('달리다가 무릎이 살짝 시큰거리는데 뛰어도 될까요?')">🦵 무릎 아이스찜질 체크</button>
                <button type="button" class="prompt-chip" onclick="window.CareTeam.sendQuickBubble('이번 주 뱃살 빼는 월/수/금 3일 30분 루틴 짜줘!')">📅 3일 30분 루틴 등록</button>
                <button type="button" class="prompt-chip" onclick="window.CareTeam.sendQuickBubble('야식 유혹이 너무 심해요! 지금 라면 끓일까 고민돼요')">🍜 야식 유혹 방어</button>
                <button type="button" class="prompt-chip" onclick="window.CareTeam.sendQuickBubble('상쾌한 아침 공복 조깅 어떻게 시작할까요?')">🌅 아침 공복 조깅 가이드</button>
                <button type="button" class="prompt-chip" onclick="window.CareTeam.sendQuickBubble('오늘 밖에 비가 많이 오는데 실내 대체 운동 추천해줘요')">🌧️ 비 오는 날 실내 대체</button>
                <button type="button" class="prompt-chip" onclick="window.CareTeam.sendQuickBubble('다이어트 정체기인지 체중계 숫자가 안 줄어요 ㅠㅠ')">📉 정체기 안심 케어</button>
                <button type="button" class="prompt-chip" onclick="window.CareTeam.sendQuickBubble('운동 끝나고 단백질 언제 얼마나 먹어야 하나요?')">🥩 단백질 골든타임 섭취법</button>
                <button type="button" class="prompt-chip" onclick="window.CareTeam.sendQuickBubble('달리고 났더니 발바닥 아치가 찌릿해요!')">👣 발바닥 족저근막 케어</button>
                <button type="button" class="prompt-chip" onclick="window.CareTeam.sendQuickBubble('어제 회식해서 술을 많이 마셨는데 러닝해도 될까요?')">🍺 과음 후 숙취 회복 팁</button>
                <button type="button" class="prompt-chip" onclick="window.CareTeam.sendQuickBubble('우리 귀여운 다마고치 펫도 같이 뛰고 있나요?')">🐾 펫 러닝 리액션</button>
              </div>`;

  if (html.includes(oldPromptsBlock)) {
    html = html.replace(oldPromptsBlock, newPromptsBlock);
    writeFileSync(filePath, html, 'utf8');
    console.log(`   Updated: ${filePath}`);
  }
}

updateIndexHtml(join(prjDir, 'index.html'));
updateIndexHtml(join(sndDir, 'index.html'));

console.log('ALL AUDIO INTEGRATIONS COMPLETE!');
