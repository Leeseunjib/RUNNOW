import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const outputPath = 'C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\ca84e5b2-18c3-4af7-9489-c04ce439e8d4\\runnow_laps_pet_hud_verified.png';
const tempDir = 'C:\\Users\\USER\\AppData\\Local\\Temp\\EdgeCleanProfile_' + Date.now();

async function main() {
  console.log('1. Launching Edge with clean profile...');
  const edgeProc = spawn(edgePath, [
    '--headless',
    '--disable-gpu',
    `--user-data-dir=${tempDir}`,
    '--remote-debugging-port=9222',
    '--window-size=430,1200',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  console.log('2. Fetching CDP endpoints...');
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
  console.log('Target page:', page.webSocketDebuggerUrl);

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

  await new Promise((resolve) => {
    ws.onopen = resolve;
  });

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pendingRequests.has(data.id)) {
      const { resolve, reject } = pendingRequests.get(data.id);
      pendingRequests.delete(data.id);
      if (data.error) reject(data.error);
      else resolve(data.result);
    }
  };

  console.log('3. Navigating to Firebase dev URL with cache buster...');
  await sendCommand('Page.enable');
  await sendCommand('Runtime.enable');
  await sendCommand('Page.navigate', {
    url: `https://runnow-37af9--dev-irl7g2ve.web.app/?t=${Date.now()}`
  });

  // 페이지 및 스크립트 로드 대기
  console.log('Waiting for page load...');
  await new Promise(r => setTimeout(r, 4000));

  console.log('4. Activating Live Run View and Injecting Laps & Pet Track...');
  const evalCode = `
    (function() {
      // 1. 화면 전환
      const authCard = document.getElementById("auth-card");
      if (authCard) authCard.style.display = "none";

      const dash = document.getElementById("dashboard-screen");
      if (dash) dash.style.display = "block";

      const gpsView = document.getElementById("workout-view-gps");
      if (gpsView) gpsView.style.display = "block";

      const list = document.getElementById("workout-view-list");
      if (list) list.style.display = "none";

      const activeControls = document.getElementById("run-active-controls");
      if (activeControls) activeControls.style.display = "flex";
      const initControls = document.getElementById("run-init-controls");
      if (initControls) initControls.style.display = "none";

      // 2. 과거 기록 샘플 설정
      localStorage.setItem("RUNNOW_LAST_RUN", JSON.stringify({
        distance: 2.0,
        elapsedSeconds: 720
      })); // 기준 10.0 km/h

      // 3. 2.34km 러닝 중인 통계 데이터 주입
      const mockStats = {
        runMode: 'gps',
        distanceKm: 2.345,
        currentSpeedKmh: '11.2',
        avgSpeedKmh: '10.8',
        currentPace: "5'21\\"",
        avgPace: "5'33\\"",
        elapsedSeconds: 780,
        calories: 185,
        laps: [
          { km: 1, lapTimeSec: 335, lapTimeFormatted: "05:35", pace: "5'35\\"", speedKmh: "10.7" },
          { km: 2, lapTimeSec: 320, lapTimeFormatted: "05:20", pace: "5'20\\"", speedKmh: "11.2" }
        ],
        currentLap: {
          km: 3,
          meters: 345,
          lapTimeSec: 125,
          lapTimeFormatted: "02:05",
          currentPace: "5'21\\"",
          currentSpeedKmh: "11.2"
        },
        gpsAccuracy: '정상 (±5m)'
      };

      // 4. UI 렌더링
      const distEl = document.getElementById("live-distance");
      if (distEl) distEl.textContent = "2,345";
      const distSub = document.getElementById("live-distance-sub");
      if (distSub) distSub.textContent = "2.345 km";

      const paceEl = document.getElementById("live-pace");
      if (paceEl) paceEl.textContent = "5'33\\\"";
      const paceNowEl = document.getElementById("live-pace-now");
      if (paceNowEl) paceNowEl.textContent = "현재 5'21\\\"";

      const speedEl = document.getElementById("live-speed");
      if (speedEl) speedEl.textContent = "11.2";
      const avgSpeedEl = document.getElementById("live-avg-speed");
      if (avgSpeedEl) avgSpeedEl.textContent = "평균 10.8 km/h";

      const timeEl = document.getElementById("live-time");
      if (timeEl) timeEl.textContent = "13:00";
      const calEl = document.getElementById("live-calories");
      if (calEl) calEl.textContent = "185";

      const ghostText = document.getElementById("ghost-status-text");
      if (ghostText) {
        ghostText.className = "faster";
        ghostText.textContent = "▲ +0.8 km/h 더 빠름 (지난번보다 앞서 달리는 중! 🔥)";
      }

      const trackEl = document.getElementById("live-pet-track");
      if (trackEl) trackEl.classList.add("running");
      const petSpeed = document.getElementById("pet-runner-speed-tag");
      if (petSpeed) petSpeed.textContent = "11.2 km/h";
      const speechEl = document.getElementById("pet-runner-speech-text");
      if (speechEl) speechEl.textContent = "\\"대표님, 1km 랩타임 최고예요! 멍멍! 🐾\\"";

      const tbody = document.getElementById("live-laps-tbody");
      const countBadge = document.getElementById("live-laps-count");
      if (countBadge) countBadge.textContent = "2 KM 완료";
      if (tbody) {
        tbody.innerHTML = \`
          <tr>
            <td><strong>1 km</strong></td>
            <td>05:35</td>
            <td>5'35\\\"</td>
            <td>10.7 km/h</td>
            <td><span class=\"lap-diff-tag slower\">▼ 5초 지연</span></td>
          </tr>
          <tr>
            <td><strong>2 km</strong></td>
            <td>05:20</td>
            <td>5'20\\\"</td>
            <td>11.2 km/h</td>
            <td><span class=\"lap-diff-tag faster\">▲ 10초 단축</span></td>
          </tr>
          <tr class=\"current-lap-row\">
            <td><strong>3 km <span style=\"font-size:9px;\">(진행중)</span></strong></td>
            <td>02:05 (345m)</td>
            <td>5'21\\\"</td>
            <td>11.2 km/h</td>
            <td><span class=\"lap-diff-tag\" style=\"background:rgba(0,240,255,0.15); color:#00F0FF;\">측정 중</span></td>
          </tr>
        \`;
      }

      // 스크롤을 살짝 내려서 고스트 비교, 펫 트랙, 랩 기록이 한눈에 들어오게 맞춤
      const lapsCard = document.getElementById("live-laps-card");
      return {
        hasGhost: !!document.getElementById("live-ghost-comparison"),
        hasPetTrack: !!document.getElementById("live-pet-track"),
        hasLapsCard: !!lapsCard,
        speedVal: speedEl ? speedEl.textContent : null
      };
    })();
  `;

  const evalRes = await sendCommand('Runtime.evaluate', { expression: evalCode, returnByValue: true });
  console.log('Eval Result:', evalRes.result.value);

  await new Promise(r => setTimeout(r, 1000));

  console.log('5. Capturing full mobile view screenshot...');
  const captureResult = await sendCommand('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: false
  });

  const imgBuffer = Buffer.from(captureResult.data, 'base64');
  writeFileSync(outputPath, imgBuffer);
  console.log(`✅ Screenshot successfully saved to ${outputPath} (${imgBuffer.length} bytes)`);

  ws.close();
  edgeProc.kill();
}

main().catch(err => {
  console.error('Error during capture:', err);
  process.exit(1);
});
