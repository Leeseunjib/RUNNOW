const fs = require('fs');
const path = require('path');

const targetPath = 'C:\\BeausCreators\\02.BSC_Branch\\projects\\Runnow\\index.html';
let html = fs.readFileSync(targetPath, 'utf8');

const targetStr = '<div class="gps-status-indicator" id="live-gps-accuracy">';

const petAndGhostHtml = `              <!-- 👻 과거 기록 실시간 비교 뱃지 (Ghost Runner) -->
              <div class="ghost-comparison-pill" id="live-ghost-comparison">
                <span class="ghost-icon">👻</span>
                <span class="ghost-text" id="ghost-status-text">지난 기록과 실시간 페이스 대조 중...</span>
              </div>

              <!-- 🐾 다마고치 펫 실시간 러닝 트랙 -->
              <div class="pet-running-track" id="live-pet-track">
                <div class="pet-track-lane">
                  <div class="pet-track-lines"></div>
                  <div class="pet-runner-container" id="pet-runner-avatar">
                    <div class="pet-runner-bubble" id="pet-runner-bubble">
                      <span id="pet-runner-speech-text">"대표님, 함께 달려요! 🐾"</span>
                    </div>
                    <div class="pet-runner-body">
                      <span class="pet-runner-emoji" id="pet-runner-emoji">🐶</span>
                      <span class="pet-runner-speed-tag" id="pet-runner-speed-tag">0.0 km/h</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="gps-status-indicator" id="live-gps-accuracy">`;

const oldHudGrid = `              <!-- 3대 핵심 러닝 메트릭 그리드 (페이스, 시간, 칼로리) -->
              <div class="hud-grid">
                <div class="hud-item">
                  <div class="hud-val" id="live-pace">--'--"</div>
                  <div class="hud-lbl">평균 페이스</div>
                  <div class="hud-sub" id="live-pace-now">현재 --'--"</div>
                </div>
                <div class="hud-item">
                  <div class="hud-val" id="live-time">00:00</div>
                  <div class="hud-lbl">시간</div>
                </div>
                <div class="hud-item">
                  <div class="hud-val" id="live-calories">0</div>
                  <div class="hud-lbl">칼로리</div>
                </div>
              </div>`;

const newHudGrid = `              <!-- 4대 핵심 러닝 메트릭 그리드 (페이스, 현재/평균 속도, 시간, 칼로리) -->
              <div class="hud-grid hud-grid-4">
                <div class="hud-item">
                  <div class="hud-val" id="live-pace">--'--"</div>
                  <div class="hud-lbl">평균 페이스</div>
                  <div class="hud-sub" id="live-pace-now">현재 --'--"</div>
                </div>
                <div class="hud-item">
                  <div class="hud-val hud-speed-val" id="live-speed">0.0</div>
                  <div class="hud-lbl">현재 속도 (km/h)</div>
                  <div class="hud-sub" id="live-avg-speed">평균 0.0 km/h</div>
                </div>
                <div class="hud-item">
                  <div class="hud-val" id="live-time">00:00</div>
                  <div class="hud-lbl">시간</div>
                </div>
                <div class="hud-item">
                  <div class="hud-val" id="live-calories">0</div>
                  <div class="hud-lbl">칼로리</div>
                </div>
              </div>`;

const targetControlsEnd = `                <button type="button" class="btn-secondary" id="btn-discard-run" style="width:100%; padding:11px; font-size:13px; font-weight:700; color:#FF5722; border-color:rgba(255,87,34,0.4);">
                  <span>러닝 취소</span>
                </button>
              </div>`;

const lapsCardHtml = `                <button type="button" class="btn-secondary" id="btn-discard-run" style="width:100%; padding:11px; font-size:13px; font-weight:700; color:#FF5722; border-color:rgba(255,87,34,0.4);">
                  <span>러닝 취소</span>
                </button>
              </div>

              <!-- ⚡ 1km 구간별 스플릿 랩 히스토리 (고정 높이 스크롤 UI) -->
              <div class="live-laps-card" id="live-laps-card">
                <div class="live-laps-header">
                  <div class="live-laps-title">
                    <span>⚡ 1KM 구간별 스플릿 랩</span>
                    <span class="live-laps-badge" id="live-laps-count">0 KM 완료</span>
                  </div>
                  <div class="live-laps-sub">1,000m마다 구간 소요 시간과 평균 속도가 누적 기록됩니다.</div>
                </div>
                <div class="live-laps-scroll">
                  <table class="live-laps-table">
                    <thead>
                      <tr>
                        <th>구간</th>
                        <th>랩타임</th>
                        <th>페이스</th>
                        <th>속도</th>
                        <th>지난날 대비</th>
                      </tr>
                    </thead>
                    <tbody id="live-laps-tbody">
                      <tr class="lap-row-empty">
                        <td colspan="5">1km를 달리면 첫 구간 스플릿이 자동 기록됩니다 🏃</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>`;

let normHtml = html.replace(/\r\n/g, '\n');
let step1 = normHtml.replace(targetStr, petAndGhostHtml);
let step2 = step1.replace(oldHudGrid, newHudGrid);
let step3 = step2.replace(targetControlsEnd, lapsCardHtml);

if (step1 === normHtml) console.error('Step 1 failed: targetStr not found');
if (step2 === step1) console.error('Step 2 failed: oldHudGrid not found');
if (step3 === step2) console.error('Step 3 failed: targetControlsEnd not found');

if (step3 !== normHtml) {
  fs.writeFileSync(targetPath, step3, 'utf8');
  console.log('SUCCESS: index.html has been updated!');
} else {
  console.error('ALL FAILED');
}
