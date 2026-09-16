import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const tempDir = 'C:\\Users\\USER\\AppData\\Local\\Temp\\EdgeVerifyProfile_' + Date.now();

async function main() {
  console.log('1. Launching Edge headless with CDP...');
  const edgeProc = spawn(edgePath, [
    '--headless',
    '--disable-gpu',
    `--user-data-dir=${tempDir}`,
    '--remote-debugging-port=9222',
    '--window-size=390,844',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  let pages;
  for (let i = 0; i < 10; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9222/json/list');
      pages = await res.json();
      if (pages && pages.length > 0) break;
    } catch (_) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  const page = pages[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let msgId = 1;
  const pendingRequests = new Map();

  function sendCommand(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      pendingRequests.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await new Promise((resolve) => { ws.onopen = resolve; });
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pendingRequests.has(data.id)) {
      const { resolve, reject } = pendingRequests.get(data.id);
      pendingRequests.delete(data.id);
      if (data.error) reject(data.error);
      else resolve(data.result);
    }
  };

  console.log('2. Navigating to http://localhost:8080...');
  await sendCommand('Page.enable');
  await sendCommand('Runtime.enable');
  await sendCommand('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });

  await sendCommand('Page.navigate', {
    url: `http://localhost:8080/?t=${Date.now()}`
  });

  await new Promise(r => setTimeout(r, 2000));

  // 1. 게스트 로그인 우회 & tab-run 활성화 & 기상 위젯 렌더
  console.log('3. Activating main app & tab-run with weather data...');
  await sendCommand('Runtime.evaluate', {
    expression: `
      (function() {
        const auth = document.getElementById("view-auth");
        if (auth) auth.style.display = "none";
        const main = document.getElementById("main-app-container");
        if (main) main.style.display = "block";

        document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
        const runPane = document.getElementById("tab-run");
        if (runPane) runPane.classList.add("active");

        document.querySelectorAll(".bottom-nav .nav-item").forEach(b => b.classList.remove("active"));
        const runBtn = document.querySelector('.bottom-nav [data-tab="tab-run"]');
        if (runBtn) runBtn.classList.add("active");

        if (window.renderWeatherUI) {
          window.renderWeatherUI({
            temp: "24.9",
            apparentTemp: "23.8",
            humidity: 40,
            weatherIcon: "☀️",
            weatherLabel: "맑음",
            locationName: "수도권/경기 GPS",
            updatedAt: "방금 전",
            runningIndex: {
              score: 100,
              status: "👑 골든 러닝 타임 (최상)",
              level: "golden",
              color: "var(--primary-accent)"
            },
            airQuality: {
              grade: "good",
              label: "좋음 🟢",
              pm10: 7,
              pm2_5: 7
            },
            coachingBriefing: {
              coach: "레오",
              badge: "🔥 골든 러닝 지수 90+ 달성",
              message: "기온 24.9℃, 미세먼지 '좋음' 청정 구역! 달리기 딱 좋은 골든 아워입니다. 지금 15분만 달려도 하루 활력이 넘칩니다! 🔥"
            }
          });
        }
        window.scrollTo(0, 0);
      })();
    `
  });

  await new Promise(r => setTimeout(r, 600));

  // 캡처 1: 운동 탭 기상청 위젯 선명도 검증 (스크린샷 3 대응)
  const weatherShot = await sendCommand('Page.captureScreenshot', {
    clip: { x: 0, y: 0, width: 390, height: 750, scale: 2 }
  });
  writeFileSync('C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\ca84e5b2-18c3-4af7-9489-c04ce439e8d4\\verify_weather_widget_contrast.png', Buffer.from(weatherShot.data, 'base64'));
  console.log('Captured verify_weather_widget_contrast.png');

  // 캡처 2: 마이페이지(tab-profile) 테마 2x2 대칭 버튼 검증 (스크린샷 1 대응)
  console.log('4. Navigating to tab-profile for 2x2 theme buttons...');
  await sendCommand('Runtime.evaluate', {
    expression: `
      (function() {
        document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
        const profilePane = document.getElementById("tab-profile");
        if (profilePane) profilePane.classList.add("active");

        document.querySelectorAll(".bottom-nav .nav-item").forEach(b => b.classList.remove("active"));
        const profileBtn = document.querySelector('.bottom-nav [data-tab="tab-profile"]');
        if (profileBtn) profileBtn.classList.add("active");

        const themeBar = document.querySelector('#app-theme-bar');
        if (themeBar) themeBar.scrollIntoView({ block: 'center' });
      })();
    `
  });

  await new Promise(r => setTimeout(r, 800));

  const themeShot = await sendCommand('Page.captureScreenshot', {
    clip: { x: 0, y: 150, width: 390, height: 480, scale: 2 }
  });
  writeFileSync('C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\ca84e5b2-18c3-4af7-9489-c04ce439e8d4\\verify_theme_selector_2x2.png', Buffer.from(themeShot.data, 'base64'));
  console.log('Captured verify_theme_selector_2x2.png');

  // 캡처 3: 15초 인스타그램 릴스 생성 모달 (스크린샷 2 대응)
  console.log('5. Triggering reels generation and capturing modal...');
  await sendCommand('Runtime.evaluate', {
    expression: `
      (function() {
        if (window.triggerMakeReels) {
          window.triggerMakeReels();
        }
      })();
    `
  });

  // 릴스 비디오 렌더링 완료 대기 (3초)
  await new Promise(r => setTimeout(r, 3500));

  const reelsShot = await sendCommand('Page.captureScreenshot', {
    clip: { x: 0, y: 50, width: 390, height: 780, scale: 2 }
  });
  writeFileSync('C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\ca84e5b2-18c3-4af7-9489-c04ce439e8d4\\verify_reels_modal_clean.png', Buffer.from(reelsShot.data, 'base64'));
  console.log('Captured verify_reels_modal_clean.png');

  // 캡처 4: 모던 미니멀 다크 테마 전환 시 가독성 검증
  console.log('6. Switching to minimal dark theme to verify contrast...');
  await sendCommand('Runtime.evaluate', {
    expression: `
      (function() {
        const modal = document.getElementById('reels-preview-modal');
        if (modal) modal.style.display = 'none';

        document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
        const runPane = document.getElementById("tab-run");
        if (runPane) runPane.classList.add("active");

        if (window.app && window.app.applyTheme) {
          window.app.applyTheme('minimal');
        } else {
          document.documentElement.setAttribute('data-theme', 'minimal');
        }
        window.scrollTo(0, 0);
        const w = document.getElementById('weather-running-widget');
        if (w) w.scrollIntoView({ block: 'start' });
      })();
    `
  });

  await new Promise(r => setTimeout(r, 800));

  const darkShot = await sendCommand('Page.captureScreenshot', {
    clip: { x: 0, y: 0, width: 390, height: 750, scale: 2 }
  });
  writeFileSync('C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\ca84e5b2-18c3-4af7-9489-c04ce439e8d4\\verify_weather_dark_minimal.png', Buffer.from(darkShot.data, 'base64'));
  console.log('Captured verify_weather_dark_minimal.png');

  ws.close();
  edgeProc.kill();
  console.log('All CDP captures completed successfully!');
}

main().catch(err => {
  console.error('CDP capture error:', err);
  process.exit(1);
});
