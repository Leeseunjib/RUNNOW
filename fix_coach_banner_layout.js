const fs = require('fs');

// 1. index.html 업데이트: active-coach-banner 내부 구조를 2행으로 분리
const htmlPath = 'C:\\BeausCreators\\02.BSC_Branch\\projects\\Runnow\\index.html';
let html = fs.readFileSync(htmlPath, 'utf8');

const oldBanner = `            <!-- Active Coach Profile Header -->
            <div class="active-coach-banner">
              <div class="coach-avatar-circle" id="coach-active-avatar">🦁</div>
              <div class="coach-banner-info">
                <div class="coach-name-row">
                  <strong id="coach-active-name">코치 레오</strong>
                  <span class="coach-role-pill" id="coach-active-role">남성 전담 PT</span>
                </div>
                <div class="coach-badge-text" id="coach-active-badge">파워 &amp; 에너지 코치</div>
              </div>
              <div style="display:flex; gap:6px; align-items:center;">
                <button type="button" class="btn-tts-toggle" id="btn-set-assigned-coach" onclick="window.CareTeam.setAssignedCoach()" style="background:var(--primary-volt); color:#000; font-weight:800; border:none; font-size:11px; padding:4px 8px; border-radius:8px; cursor:pointer;">
                  ⭐ 전담 지정
                </button>
                <button type="button" class="btn-tts-toggle" id="btn-open-gemini-key-modal" onclick="openGeminiKeyModal()" style="background:rgba(66,133,244,0.15); border:1px solid #4285F4; color:#fff; font-size:11px; padding:4px 8px; border-radius:8px; cursor:pointer;">
                  🔑 구글 AI 연동 ($0원)
                </button>
                <button type="button" class="btn-tts-toggle active" id="btn-toggle-tts" onclick="window.CareTeam.toggleTTS()">
                  🔊 음성 켜짐
                </button>
              </div>
            </div>`;

const newBanner = `            <!-- Active Coach Profile Header (와이드 2행 고대비 레이아웃) -->
            <div class="active-coach-banner">
              <div class="coach-banner-top">
                <div class="coach-avatar-circle" id="coach-active-avatar">🦁</div>
                <div class="coach-banner-info">
                  <div class="coach-name-row">
                    <strong id="coach-active-name">코치 레오</strong>
                    <span class="coach-role-pill" id="coach-active-role">남성 전담 PT</span>
                  </div>
                  <div class="coach-badge-text" id="coach-active-badge">파워 &amp; 에너지 코치</div>
                </div>
              </div>
              <div class="coach-banner-actions">
                <button type="button" class="btn-coach-action primary" id="btn-set-assigned-coach" onclick="window.CareTeam.setAssignedCoach()">
                  ⭐ 전담 지정
                </button>
                <button type="button" class="btn-coach-action ai" id="btn-open-gemini-key-modal" onclick="openGeminiKeyModal()">
                  🔑 구글 AI 연동 ($0원)
                </button>
                <button type="button" class="btn-coach-action tts active" id="btn-toggle-tts" onclick="window.CareTeam.toggleTTS()">
                  🔊 음성 켜짐
                </button>
              </div>
            </div>`;

let normHtml = html.replace(/\r\n/g, '\n');
if (normHtml.includes(oldBanner)) {
  normHtml = normHtml.replace(oldBanner, newBanner);
  fs.writeFileSync(htmlPath, normHtml, 'utf8');
  console.log('SUCCESS: index.html updated with 2-row coach banner!');
} else {
  console.error('FAILED to match oldBanner in index.html');
}

const htmlPath2 = 'C:\\BeausCreators\\02.BSC_Branch\\sandbox\\Runnow_APP_V\\legacy_web\\index.html';
fs.writeFileSync(htmlPath2, normHtml, 'utf8');
console.log('SUCCESS: Synced index.html to legacy_web');

// 2. styles.css 업데이트 (와이드 2행 코치 배너 CSS)
const cssPath = 'C:\\BeausCreators\\02.BSC_Branch\\projects\\Runnow\\styles.css';
let css = fs.readFileSync(cssPath, 'utf8');

const bannerCssPatch = `
/* 와이드 2행 코치 배너 전용 스타일 (세로 깨짐 100% 방지 및 완벽 가독성) */
.active-coach-banner {
  display: flex !important;
  flex-direction: column !important;
  gap: 12px !important;
  background: rgba(18, 22, 31, 0.95) !important;
  border: 1.5px solid rgba(255, 255, 255, 0.14) !important;
  border-radius: 16px !important;
  padding: 14px 16px !important;
  margin-bottom: 14px !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4) !important;
}

.coach-banner-top {
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
  width: 100% !important;
}

.coach-avatar-circle {
  width: 48px !important;
  height: 48px !important;
  border-radius: 50% !important;
  background: #1A202C !important;
  border: 2px solid var(--primary-volt, #CCFF00) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 26px !important;
  flex-shrink: 0 !important;
  box-shadow: 0 0 10px rgba(204, 255, 0, 0.25) !important;
}

.coach-banner-info {
  flex: 1 !important;
  min-width: 0 !important;
}

.coach-name-row {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  flex-wrap: nowrap !important;
}

.coach-name-row strong {
  font-size: 16px !important;
  font-weight: 900 !important;
  color: #FFFFFF !important;
  white-space: nowrap !important;
  letter-spacing: -0.3px !important;
}

.coach-role-pill {
  font-size: 11px !important;
  font-weight: 800 !important;
  background: rgba(0, 240, 255, 0.18) !important;
  color: #00F0FF !important;
  border: 1px solid rgba(0, 240, 255, 0.4) !important;
  padding: 2px 8px !important;
  border-radius: 10px !important;
  white-space: nowrap !important;
}

.coach-badge-text {
  font-size: 11.5px !important;
  color: #94A3B8 !important;
  font-weight: 600 !important;
  margin-top: 3px !important;
  white-space: nowrap !important;
}

.coach-banner-actions {
  display: flex !important;
  gap: 8px !important;
  width: 100% !important;
}

.btn-coach-action {
  flex: 1 !important;
  min-width: 0 !important;
  padding: 9px 8px !important;
  font-size: 11.5px !important;
  font-weight: 800 !important;
  border-radius: 10px !important;
  cursor: pointer !important;
  white-space: nowrap !important;
  text-align: center !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  background: rgba(255, 255, 255, 0.06) !important;
  color: #CBD5E1 !important;
  transition: all 0.2s ease !important;
}

.btn-coach-action.primary {
  background: var(--primary-volt, #CCFF00) !important;
  color: #000000 !important;
  border: none !important;
  box-shadow: 0 2px 10px rgba(204, 255, 0, 0.3) !important;
}

.btn-coach-action.ai {
  background: rgba(66, 133, 244, 0.18) !important;
  border-color: #4285F4 !important;
  color: #90CAF9 !important;
}

.btn-coach-action.tts.active {
  background: rgba(0, 240, 255, 0.18) !important;
  border-color: #00F0FF !important;
  color: #00F0FF !important;
}
`;

css += bannerCssPatch;
fs.writeFileSync(cssPath, css, 'utf8');

const cssPath2 = 'C:\\BeausCreators\\02.BSC_Branch\\sandbox\\Runnow_APP_V\\legacy_web\\styles.css';
fs.writeFileSync(cssPath2, css, 'utf8');
console.log('SUCCESS: styles.css updated with banner styles!');
