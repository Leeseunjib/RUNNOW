const fs = require('fs');

const stylesPath = 'C:\\BeausCreators\\02.BSC_Branch\\projects\\Runnow\\styles.css';
let css = fs.readFileSync(stylesPath, 'utf8');

// 기존 .pet-running-track 부터 .live-laps-table tr.current-lap-row td 블록까지 교체
const startMarker = '/* 2. 실시간 함께 달리는 다마고치 펫 트랙 */';
const endMarker = '.live-laps-table tr.current-lap-row td {';

const newStylesChunk = `/* 2. 실시간 함께 달리는 다마고치 펫 트랙 */
.pet-running-track {
  position: relative;
  width: 100%;
  background: rgba(8, 12, 22, 0.94);
  border: 1.5px solid rgba(0, 240, 255, 0.25);
  border-radius: 16px;
  padding: 8px 12px;
  margin: 10px 0;
  overflow: hidden;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.6), 0 4px 14px rgba(0, 0, 0, 0.4);
}

.pet-track-lane {
  position: relative;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pet-track-lines {
  position: absolute;
  bottom: 6px;
  left: 0;
  right: 0;
  height: 3px;
  background: repeating-linear-gradient(90deg, #00F0FF 0, #00F0FF 16px, transparent 16px, transparent 32px);
  animation: trackLaneFlow 0.8s linear infinite paused;
}

.pet-running-track.running .pet-track-lines {
  animation-play-state: running;
}

@keyframes trackLaneFlow {
  from { background-position: 32px 0; }
  to { background-position: 0 0; }
}

.pet-runner-container {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.pet-runner-bubble {
  background: rgba(15, 23, 42, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 12px;
  padding: 2px 10px;
  margin-bottom: 2px;
  font-size: 11px;
  font-weight: 700;
  color: #F8FAFC;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
  white-space: nowrap;
}

.pet-runner-body {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pet-runner-emoji {
  font-size: 32px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.6));
}

.pet-running-track.running .pet-runner-emoji {
  display: inline-block;
  animation: petRunBounce 0.35s infinite alternate ease-in-out;
}

@keyframes petRunBounce {
  0% { transform: translateY(0) rotate(-5deg); }
  100% { transform: translateY(-8px) rotate(5deg); }
}

.pet-runner-speed-tag {
  font-size: 11.5px;
  font-weight: 900;
  color: #CCFF00;
  background: rgba(204, 255, 0, 0.15);
  border: 1px solid #CCFF00;
  padding: 2px 8px;
  border-radius: 10px;
  letter-spacing: 0.2px;
}

/* 3. 4대 핵심 메트릭 그리드 */
.hud-grid-4 {
  display: grid !important;
  grid-template-columns: repeat(4, 1fr) !important;
  gap: 8px !important;
}

.hud-speed-val {
  color: #CCFF00 !important;
  font-weight: 900 !important;
}

@media (max-width: 420px) {
  .hud-grid-4 {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 8px !important;
  }
}

/* 4. 1km 구간별 스플릿 랩 기록 고정 스크롤 카드 */
.live-laps-card {
  background: rgba(10, 15, 26, 0.96);
  border: 1.5px solid rgba(0, 240, 255, 0.35);
  border-radius: 16px;
  padding: 12px 14px;
  margin: 12px 0 14px 0;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.6);
}

.live-laps-header {
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.14);
}

.live-laps-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13.5px;
  font-weight: 800;
  color: #FFFFFF;
  letter-spacing: -0.2px;
}

.live-laps-badge {
  background: rgba(0, 240, 255, 0.2);
  border: 1px solid #00F0FF;
  color: #00F0FF;
  font-size: 11px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 10px;
}

.live-laps-sub {
  font-size: 11px;
  font-weight: 600;
  color: #94A3B8;
  margin-top: 3px;
}

.live-laps-scroll {
  max-height: 180px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 240, 255, 0.4) transparent;
}

.live-laps-scroll::-webkit-scrollbar {
  width: 4px;
}

.live-laps-scroll::-webkit-scrollbar-thumb {
  background: rgba(0, 240, 255, 0.4);
  border-radius: 4px;
}

.live-laps-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11.5px;
  text-align: center;
}

.live-laps-table th {
  color: #94A3B8;
  font-weight: 700;
  padding: 6px 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  white-space: nowrap;
}

.live-laps-table td {
  color: #FFFFFF;
  font-weight: 700;
  padding: 7px 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  white-space: nowrap;
}

.live-laps-table tr.current-lap-row td {`;

let normCss = css.replace(/\r\n/g, '\n');
const sIdx = normCss.indexOf(startMarker);
const eIdx = normCss.indexOf(endMarker);

if (sIdx !== -1 && eIdx !== -1) {
  const updated = normCss.slice(0, sIdx) + newStylesChunk + normCss.slice(eIdx + endMarker.length);
  fs.writeFileSync(stylesPath, updated, 'utf8');
  console.log('SUCCESS: styles.css updated with perfectly tuned classes!');
} else {
  console.error('FAILED to find markers in styles.css', { sIdx, eIdx });
}
