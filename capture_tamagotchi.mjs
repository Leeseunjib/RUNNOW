import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const outputPath = 'C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\ca84e5b2-18c3-4af7-9489-c04ce439e8d4\\verify_pet_10stages_clean.png';
const tempDir = 'C:\\Users\\USER\\AppData\\Local\\Temp\\EdgePetProfile_' + Date.now();

async function main() {
  console.log('1. Launching Edge...');
  const edgeProc = spawn(edgePath, [
    '--headless',
    '--disable-gpu',
    `--user-data-dir=${tempDir}`,
    '--remote-debugging-port=9225',
    '--window-size=430,932',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  let pages;
  for (let i = 0; i < 10; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9225/json/list');
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

  console.log('2. Navigating to localhost:8080...');
  await sendCommand('Page.enable');
  await sendCommand('Runtime.enable');
  await sendCommand('Page.navigate', {
    url: `http://localhost:8080/?t=${Date.now()}`
  });

  await new Promise(r => setTimeout(r, 3000));

  console.log('3. Switching to Tamagotchi tab...');
  const evalCode = `
    (function() {
      // 인증 화면 숨기고 메인 컨테이너 노출
      const auth = document.getElementById("view-auth");
      if (auth) auth.style.display = "none";
      const main = document.getElementById("main-app-container");
      if (main) main.style.display = "block";

      // 펫 탭 활성화
      document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
      const petPane = document.getElementById("tab-tamagotchi");
      if (petPane) petPane.classList.add("active");

      document.querySelectorAll(".bottom-nav .nav-item").forEach(b => b.classList.remove("active"));
      const petBtn = document.querySelector('.bottom-nav [data-tab="tab-tamagotchi"]');
      if (petBtn) petBtn.classList.add("active");

      if (window.Tamagotchi && window.Tamagotchi.render) {
        window.Tamagotchi.render();
      }

      return true;
    })();
  `;

  await sendCommand('Runtime.evaluate', { expression: evalCode });
  await new Promise(r => setTimeout(r, 1000));

  console.log('4. Capturing screenshot...');
  const captureResult = await sendCommand('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: false
  });

  const imgBuffer = Buffer.from(captureResult.data, 'base64');
  writeFileSync(outputPath, imgBuffer);
  console.log(`✅ Screenshot saved to ${outputPath} (${imgBuffer.length} bytes)`);

  ws.close();
  edgeProc.kill();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
