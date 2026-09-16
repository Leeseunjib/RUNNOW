import fs from 'fs';

const targetDirs = [
  'C:\\BeausCreators\\02.BSC_Branch\\sandbox\\Runnow_APP_V\\legacy_web',
  'C:\\BeausCreators\\02.BSC_Branch\\projects\\Runnow'
];

targetDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.log('Skipping missing dir:', dir);
    return;
  }

  // 1. Patch index.html
  const indexPath = `${dir}\\index.html`;
  if (fs.existsSync(indexPath)) {
    let indexHtml = fs.readFileSync(indexPath, 'utf8');

    // A. Fix weather widget container and elements
    const oldWeatherCardRegex = /<div id="weather-running-widget" class="glow-card" style="background:linear-gradient\(135deg, rgba\(18,22,31,0\.95\), rgba\(10,14,20,0\.98\)\);[^>]*">[\s\S]*?<!-- Main Grid: 3열 날씨 지표/;
    const newWeatherCardHeader = `<div id="weather-running-widget" class="weather-running-card">
              <!-- Top Row: 공공데이터 타이틀 & 위치 선택기 -->
              <div class="weather-card-header">
                <div style="display:flex; align-items:center; gap:6px; min-width:0;">
                  <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:var(--primary-accent); box-shadow:0 0 8px var(--primary-accent); animation:pulse 2s infinite; flex-shrink:0;"></span>
                  <strong class="weather-card-title">🌤️ 실시간 러닝 기상</strong>
                  <span class="weather-public-badge">공공데이터</span>
                </div>
                <div style="display:flex; align-items:center; gap:5px; flex-shrink:0;">
                  <select id="weather-city-select" onchange="onWeatherCityChange(this.value)" class="weather-select-box">
                    <option value="seoul">서울</option>
                    <option value="gyeonggi">경기/수원</option>
                    <option value="incheon">인천</option>
                    <option value="busan">부산</option>
                    <option value="daegu">대구</option>
                    <option value="daejeon">대전</option>
                    <option value="gwangju">광주</option>
                    <option value="ulsan">울산</option>
                    <option value="gangwon">강원</option>
                    <option value="jeju">제주</option>
                  </select>
                  <button type="button" onclick="refreshWeatherWithGps()" title="GPS 위치 갱신" class="weather-gps-btn">
                    <span>📍 GPS</span>
                  </button>
                </div>
              </div>

              <!-- Main Grid: 3열 날씨 지표`;

    if (oldWeatherCardRegex.test(indexHtml)) {
      indexHtml = indexHtml.replace(oldWeatherCardRegex, newWeatherCardHeader);
      console.log('Patched weather card header in:', indexPath);
    } else {
      console.log('Weather card header regex not matched in:', indexPath);
    }

    // B. Fix weather 3-col grid and coach box
    const oldWeatherGridRegex = /<!-- Main Grid: 3열 날씨 지표[\s\S]*?<!-- 하단 안내 & 최근 갱신 시각 -->/;
    const newWeatherGridContent = `<!-- Main Grid: 3열 날씨 지표 (현재기온 / 러닝쾌적지수 / 미세먼지) -->
              <div class="weather-metrics-grid">
                <!-- 1열: 기온 & 날씨 -->
                <div class="weather-metric-box">
                  <div id="weather-icon" style="font-size:24px; line-height:1; margin-bottom:3px;">☀️</div>
                  <div style="display:flex; align-items:baseline; justify-content:center; gap:2px;">
                    <span id="weather-temp" class="weather-temp-num">20.5</span>
                    <span class="weather-temp-unit">℃</span>
                  </div>
                  <div id="weather-label" class="weather-label-text">맑음</div>
                  <div id="weather-apparent" class="weather-apparent-text">체감 20.0℃</div>
                </div>

                <!-- 2열: 러닝 쾌적 지수 (핵심 지표) -->
                <div class="weather-metric-box weather-score-box">
                  <div class="weather-score-label">RUNNING INDEX</div>
                  <div id="weather-running-score" class="weather-score-num">95<span style="font-size:12px; font-weight:700;">점</span></div>
                  <div id="weather-running-status" class="weather-score-status">👑 골든 러닝 타임</div>
                </div>

                <!-- 3열: 에어코리아 공공 대기질 / 미세먼지 -->
                <div class="weather-metric-box">
                  <div class="weather-air-label">대기질 (에어코리아)</div>
                  <div id="weather-air-badge" class="weather-air-badge">
                    좋음 🟢
                  </div>
                  <div id="weather-air-details" class="weather-air-details">
                    PM10 22 • PM2.5 11
                  </div>
                </div>
              </div>

              <!-- AI 코치 날씨 반응형 브리핑 -->
              <div id="weather-coach-box" class="weather-coach-briefing">
                <span id="weather-coach-avatar" style="font-size:22px; flex-shrink:0;">🦁</span>
                <div style="flex:1; min-width:0;">
                  <div style="display:flex; align-items:center; gap:6px; margin-bottom:3px; flex-wrap:wrap;">
                    <strong id="weather-coach-title" class="weather-coach-title">🦁 레오의 기상 브리핑</strong>
                    <span id="weather-coach-badge" class="weather-coach-badge">🔥 골든 러닝 지수 90+ 달성</span>
                  </div>
                  <p id="weather-coach-msg" class="weather-coach-message">
                    기온 20.5℃, 미세먼지 '좋음' 청정 구역! 달리기 딱 좋은 골든 아워입니다. 지금 15분만 달려도 하루 활력이 넘칩니다!
                  </p>
                </div>
              </div>

              <!-- 하단 안내 & 최근 갱신 시각 -->`;

    if (oldWeatherGridRegex.test(indexHtml)) {
      indexHtml = indexHtml.replace(oldWeatherGridRegex, newWeatherGridContent);
      console.log('Patched weather grid in:', indexPath);
    } else {
      console.log('Weather grid regex not matched in:', indexPath);
    }

    // C. Fix weather footer
    const oldWeatherFooterRegex = /<!-- 하단 안내 & 최근 갱신 시각 -->[\s\S]*?<\/div>\s*<\/div>\s*<!-- EXERCISE/;
    const newWeatherFooterContent = `<!-- 하단 안내 & 최근 갱신 시각 -->
              <div class="weather-card-footer">
                <span id="weather-location-name">📍 현재 위치 (수도권/경기 GPS)</span>
                <span>최근 갱신: <span id="weather-updated-time">방금 전</span> • 15분 자동 동기화</span>
              </div>
            </div>

            <!-- EXERCISE`;

    if (oldWeatherFooterRegex.test(indexHtml)) {
      indexHtml = indexHtml.replace(oldWeatherFooterRegex, newWeatherFooterContent);
      console.log('Patched weather footer in:', indexPath);
    }

    // D. Fix Reels modal action buttons
    const oldReelsActionsRegex = /<div style="display:flex; gap:10px; justify-content:center;">\s*<button type="button" class="btn-primary-volt" id="btn-download-reels"[\s\S]*?<\/button>\s*<button type="button" class="btn-secondary" onclick="document\.getElementById\('reels-preview-modal'\)\.style\.display='none'"[^>]*>\s*<span>닫기<\/span>\s*<\/button>\s*<\/div>/;
    const newReelsActionsContent = `<div class="reels-modal-actions">
        <button type="button" class="btn-primary-volt" id="btn-download-reels" style="display:none;">
          <span>💾 비디오 저장하기 (.webm)</span>
        </button>
        <button type="button" class="btn-secondary reels-close-btn" onclick="document.getElementById('reels-preview-modal').style.display='none'">
          <span>닫기</span>
        </button>
      </div>`;

    if (oldReelsActionsRegex.test(indexHtml)) {
      indexHtml = indexHtml.replace(oldReelsActionsRegex, newReelsActionsContent);
      console.log('Patched reels modal actions in:', indexPath);
    }

    fs.writeFileSync(indexPath, indexHtml, 'utf8');
  }

  // 2. Patch styles.css
  const stylesPath = `${dir}\\styles.css`;
  if (fs.existsSync(stylesPath)) {
    let stylesCss = fs.readFileSync(stylesPath, 'utf8');

    // Update or append theme selector & weather card styles
    const themeAndWeatherStyles = `
/* ==========================================================================
   Weather Running Card & Theme Harmonization Styles (Zero Contrast Failure)
   ========================================================================== */
.weather-running-card {
  background: var(--surface-card, #FFFFFF);
  border: 1.5px solid var(--border-card, #E2E8F0);
  border-radius: 20px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: var(--card-shadow, 0 4px 16px rgba(0, 0, 0, 0.05));
  transition: all 0.25s ease;
  box-sizing: border-box !important;
}

.weather-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  border-bottom: 1px solid var(--border-subtle, #EDF2F7);
  padding-bottom: 10px;
  gap: 8px;
}

.weather-card-title {
  font-size: clamp(11.5px, 3.2vw, 13px);
  font-weight: 800;
  color: var(--text-main, #191F28);
  letter-spacing: -0.2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.weather-public-badge {
  display: inline-block;
  font-size: 9.5px;
  font-weight: 800;
  color: var(--primary-accent, #00C73C);
  background: var(--primary-accent-subtle, rgba(0, 199, 60, 0.1));
  padding: 2px 6px;
  border-radius: 6px;
  white-space: nowrap;
}

.weather-select-box {
  background: var(--surface-elevated, #F8FAFC);
  border: 1px solid var(--border-card, #E2E8F0);
  color: var(--text-main, #191F28);
  font-size: 11px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 8px;
  cursor: pointer;
  outline: none;
}

.weather-gps-btn {
  background: var(--surface-elevated, #F8FAFC);
  border: 1px solid var(--border-card, #E2E8F0);
  color: var(--primary-accent, #00C73C);
  font-size: 11px;
  font-weight: 800;
  padding: 4px 8px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 3px;
  white-space: nowrap;
}

.weather-metrics-grid {
  display: grid;
  grid-template-columns: 1fr 1.25fr 1fr;
  gap: 8px;
  align-items: stretch;
  text-align: center;
  margin-bottom: 12px;
}

.weather-metric-box {
  background: var(--surface-elevated, #F8FAFC);
  border: 1px solid var(--border-subtle, #EDF2F7);
  border-radius: 14px;
  padding: 10px 6px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.weather-score-box {
  background: var(--primary-accent-subtle, rgba(0, 199, 60, 0.08)) !important;
  border: 1.5px solid var(--primary-accent, #00C73C) !important;
}

.weather-temp-num {
  font-size: 20px;
  font-weight: 900;
  color: var(--text-main, #191F28);
}

.weather-temp-unit {
  font-size: 11.5px;
  font-weight: 700;
  color: var(--text-sub, #4E5968);
}

.weather-label-text {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-sub, #4E5968);
  margin-top: 1px;
}

.weather-apparent-text {
  font-size: 10px;
  font-weight: 700;
  color: var(--primary-accent, #00C73C);
  margin-top: 1px;
}

.weather-score-label {
  font-size: 9.5px;
  font-weight: 800;
  color: var(--text-sub, #4E5968);
  margin-bottom: 2px;
  letter-spacing: 0.3px;
}

.weather-score-num {
  font-size: 24px;
  font-weight: 900;
  color: var(--primary-accent, #00C73C);
  line-height: 1.1;
}

.weather-score-status {
  font-size: 10px;
  font-weight: 800;
  color: var(--text-main, #191F28);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.weather-air-label {
  font-size: 9.5px;
  font-weight: 800;
  color: var(--text-sub, #4E5968);
  margin-bottom: 4px;
}

.weather-air-badge {
  display: inline-block;
  background: var(--primary-accent-subtle, rgba(0, 255, 136, 0.15));
  border: 1px solid var(--primary-accent, #00FF88);
  color: var(--primary-accent, #00A63E);
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 10.5px;
  font-weight: 800;
}

.weather-air-details {
  font-size: 9.5px;
  font-weight: 600;
  color: var(--text-muted, #8B95A1);
  margin-top: 4px;
}

.weather-coach-briefing {
  background: var(--surface-elevated, #F8FAFC);
  border: 1px dashed var(--border-card, #CBD5E1);
  border-radius: 14px;
  padding: 10px 12px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.weather-coach-title {
  font-size: 11.5px;
  font-weight: 800;
  color: var(--text-main, #191F28);
}

.weather-coach-badge {
  font-size: 9.5px;
  background: var(--primary-accent-subtle, rgba(204,255,0,0.15));
  color: var(--primary-accent, #00C73C);
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 700;
}

.weather-coach-message {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-main, #191F28);
  margin: 0;
  line-height: 1.45;
  word-break: keep-all;
}

.weather-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 9.5px;
  font-weight: 600;
  color: var(--text-muted, #8B95A1);
  margin-top: 8px;
  padding-top: 6px;
  border-top: 1px solid var(--border-subtle, #EDF2F7);
  word-break: keep-all;
  gap: 6px;
}

/* Theme Selector Grid & Button Styles */
.theme-selector-bar {
  display: grid !important;
  grid-template-columns: repeat(2, 1fr) !important;
  gap: 8px !important;
  background: transparent !important;
  padding: 4px 0 !important;
  width: 100% !important;
  box-sizing: border-box !important;
}

.theme-btn {
  width: 100% !important;
  padding: 11px 10px !important;
  font-size: 12.5px !important;
  font-weight: 700 !important;
  border-radius: var(--radius-md, 14px) !important;
  border: 1.5px solid var(--border-card, #E2E8F0) !important;
  background: var(--surface-card, #FFFFFF) !important;
  color: var(--text-sub, #4E5968) !important;
  cursor: pointer !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 6px !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04) !important;
  user-select: none !important;
  box-sizing: border-box !important;
  transition: all 0.2s ease !important;
}

.theme-btn:hover {
  border-color: var(--primary-accent) !important;
  color: var(--text-main) !important;
  background: var(--surface-elevated, #F8FAFC) !important;
}

.theme-btn.active {
  background: var(--primary-accent) !important;
  color: var(--primary-accent-text, #FFFFFF) !important;
  border-color: var(--primary-accent) !important;
  font-weight: 800 !important;
  box-shadow: 0 3px 12px var(--primary-accent-subtle, rgba(0, 199, 60, 0.25)) !important;
}

/* Reels Modal Action Buttons */
.reels-modal-actions {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-top: 14px;
}

#btn-download-reels {
  flex: 1;
  min-width: 0;
  padding: 12px 16px !important;
  font-size: 13.5px !important;
  font-weight: 800 !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  box-sizing: border-box !important;
}

.reels-close-btn {
  flex-shrink: 0 !important;
  min-width: 76px !important;
  padding: 12px 18px !important;
  font-size: 13.5px !important;
  font-weight: 700 !important;
  white-space: nowrap !important;
  text-align: center !important;
  box-sizing: border-box !important;
}
`;

    // Check if already appended
    if (!stylesCss.includes('.weather-running-card')) {
      stylesCss += '\n' + themeAndWeatherStyles;
      fs.writeFileSync(stylesPath, stylesCss, 'utf8');
      console.log('Appended theme and weather styles to:', stylesPath);
    } else {
      // Replace existing block
      const startMarker = '/* ==========================================================================\n   Weather Running Card & Theme Harmonization Styles';
      const startIndex = stylesCss.indexOf(startMarker);
      if (startIndex !== -1) {
        stylesCss = stylesCss.substring(0, startIndex) + themeAndWeatherStyles;
        fs.writeFileSync(stylesPath, stylesCss, 'utf8');
        console.log('Updated theme and weather styles in:', stylesPath);
      }
    }
  }
});
