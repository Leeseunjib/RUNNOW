const fs = require('fs');

// 1. index.html 업데이트
const htmlPath = 'C:\\BeausCreators\\02.BSC_Branch\\projects\\Runnow\\index.html';
let html = fs.readFileSync(htmlPath, 'utf8');

const oldInputBlock = `              <div class="coach-input-row">
                <input type="text" id="coach-chat-input" class="form-input" placeholder="코치에게 털어놓기 (예: '오늘 회식 과식했어요', '루틴 짜줘')" onkeydown="if(event.key==='Enter') document.getElementById('btn-coach-send').click()">
                <button type="button" class="btn-primary-volt" id="btn-coach-send" onclick="const el = document.getElementById('coach-chat-input'); window.CareTeam.sendMessage(el.value); el.value = '';">
                  <span>전송</span>
                </button>
              </div>`;

const newInputBlock = `              <!-- 와이드 코치 입력창 + 하단 전송 바 레이아웃 -->
              <div class="coach-chat-input-wrapper">
                <input type="text" id="coach-chat-input" class="form-input coach-wide-input" placeholder="코치에게 털어놓기 (예: '오늘 회식 과식했어요', '루틴 짜줘')" onkeydown="if(event.key==='Enter') document.getElementById('btn-coach-send').click()">
                <div class="coach-send-bar">
                  <span class="coach-input-subtext">💬 Enter를 누르면 코치에게 즉시 전송됩니다</span>
                  <button type="button" class="btn-primary-volt btn-coach-send-bottom" id="btn-coach-send" onclick="const el = document.getElementById('coach-chat-input'); window.CareTeam.sendMessage(el.value); el.value = '';">
                    <span>전송 🚀</span>
                  </button>
                </div>
              </div>`;

let normHtml = html.replace(/\r\n/g, '\n');
if (normHtml.includes(oldInputBlock)) {
  normHtml = normHtml.replace(oldInputBlock, newInputBlock);
  fs.writeFileSync(htmlPath, normHtml, 'utf8');
  console.log('SUCCESS: index.html updated with wide coach input and bottom send button!');
} else {
  console.error('FAILED to find oldInputBlock in index.html');
}

// legacy_web index.html 동기화
const htmlPath2 = 'C:\\BeausCreators\\02.BSC_Branch\\sandbox\\Runnow_APP_V\\legacy_web\\index.html';
fs.writeFileSync(htmlPath2, normHtml, 'utf8');
console.log('SUCCESS: Synced index.html to legacy_web');

// 2. styles.css 업데이트 (스크롤바 제거 + 와이드 인풋 + 하단 전송 버튼 스타일)
const cssPath = 'C:\\BeausCreators\\02.BSC_Branch\\projects\\Runnow\\styles.css';
let css = fs.readFileSync(cssPath, 'utf8');

const oldCssBlock = `.coach-chat-box {
  height: 240px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-right: 4px;
  margin-bottom: 12px;
}`;

const newCssBlock = `.coach-chat-box {
  height: 250px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-right: 4px;
  margin-bottom: 12px;
  scrollbar-width: none; /* Firefox 스크롤바 완전 제거 */
  -ms-overflow-style: none; /* IE/Edge 스크롤바 완전 제거 */
}

.coach-chat-box::-webkit-scrollbar {
  display: none !important; /* Chrome/Safari/Edge 스크롤바 완전 제거 */
  width: 0 !important;
  height: 0 !important;
}`;

let normCss = css.replace(/\r\n/g, '\n');
if (normCss.includes(oldCssBlock)) {
  normCss = normCss.replace(oldCssBlock, newCssBlock);
} else {
  console.warn('oldCssBlock not exactly matched, checking alternate...');
}

// coach-quick-prompts 가로 스크롤바 제거
const oldPromptsCss = `.coach-quick-prompts {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 4px;
}`;

const newPromptsCss = `.coach-quick-prompts {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 4px;
  margin-bottom: 10px;
  scrollbar-width: none !important; /* 가로 스크롤바 제거 */
  -ms-overflow-style: none !important;
}

.coach-quick-prompts::-webkit-scrollbar {
  display: none !important; /* 가로 스크롤바 제거 */
  width: 0 !important;
  height: 0 !important;
}

/* 와이드 인풋 및 하단 전송 버튼 전용 스타일 */
.coach-chat-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 14px;
  background: rgba(15, 23, 42, 0.55);
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.4);
}

.coach-wide-input {
  width: 100% !important;
  font-size: 13.5px !important;
  padding: 12px 14px !important;
  border-radius: 10px !important;
  background: rgba(8, 12, 22, 0.95) !important;
  border: 1.5px solid rgba(255, 255, 255, 0.18) !important;
  color: #FFFFFF !important;
  box-sizing: border-box !important;
  transition: all 0.2s ease;
}

.coach-wide-input:focus {
  border-color: var(--primary-volt, #CCFF00) !important;
  box-shadow: 0 0 12px rgba(204, 255, 0, 0.25) !important;
  outline: none !important;
}

.coach-send-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding-top: 2px;
}

.coach-input-subtext {
  font-size: 11.5px;
  color: #94A3B8;
  font-weight: 600;
  letter-spacing: -0.2px;
}

.btn-coach-send-bottom {
  min-width: 110px;
  padding: 9px 20px !important;
  font-size: 13px !important;
  font-weight: 800 !important;
  border-radius: 10px !important;
  cursor: pointer;
  background: var(--primary-volt, #CCFF00) !important;
  color: #000000 !important;
  box-shadow: 0 4px 14px rgba(204, 255, 0, 0.3) !important;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.btn-coach-send-bottom:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(204, 255, 0, 0.45) !important;
}`;

if (normCss.includes(oldPromptsCss)) {
  normCss = normCss.replace(oldPromptsCss, newPromptsCss);
} else {
  normCss += '\n' + newPromptsCss;
}

fs.writeFileSync(cssPath, normCss, 'utf8');
console.log('SUCCESS: styles.css updated with scrollbar hiding and wide input styles!');

// legacy_web styles.css 동기화
const cssPath2 = 'C:\\BeausCreators\\02.BSC_Branch\\sandbox\\Runnow_APP_V\\legacy_web\\styles.css';
fs.writeFileSync(cssPath2, normCss, 'utf8');
console.log('SUCCESS: Synced styles.css to legacy_web');
