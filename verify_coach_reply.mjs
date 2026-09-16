import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const outputPath = 'C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\ca84e5b2-18c3-4af7-9489-c04ce439e8d4\\verify_coach_smart_reply.png';
const tempDir = 'C:\\Users\\USER\\AppData\\Local\\Temp\\EdgeCoachSmart_' + Date.now();

async function main() {
  const edgeProc = spawn(edgePath, [
    '--headless',
    '--disable-gpu',
    `--user-data-dir=${tempDir}`,
    '--remote-debugging-port=9235',
    '--window-size=430,1100',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2500));

  let pages;
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9235/json/list');
      pages = await res.json();
      if (pages && pages.length > 0) break;
    } catch (_) {
      await new Promise(r => setTimeout(r, 600));
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

  await sendCommand('Page.enable');
  await sendCommand('Runtime.enable');
  await sendCommand('Page.navigate', {
    url: `http://localhost:8080/?t=${Date.now()}`
  });

  await new Promise(r => setTimeout(r, 3500));

  console.log('Sending user question in CareTeam chat...');
  const evalCode = `
    (function() {
      const auth = document.getElementById("view-auth");
      if (auth) auth.style.display = "none";
      const main = document.getElementById("main-app-container");
      if (main) main.style.display = "block";

      document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
      const carePane = document.getElementById("tab-careteam");
      if (carePane) carePane.classList.add("active");

      document.querySelectorAll(".bottom-nav .nav-item").forEach(b => b.classList.remove("active"));
      const careBtn = document.querySelector('.bottom-nav [data-tab="tab-careteam"]');
      if (careBtn) careBtn.classList.add("active");

      if (window.CareTeam) {
        // 대표님의 질문 전송
        window.CareTeam.sendMessage("앞으로 살을 빼야하는데 어떤 운동으로 시작을 하면 좋을지. 그리고 7일동안 어떻게 근육운동을 하면 좋을지.");
      }
      return true;
    })();
  `;

  await sendCommand('Runtime.evaluate', { expression: evalCode });
  // AI 응답 대기 (400ms 딜레이)
  await new Promise(r => setTimeout(r, 1200));

  // 스크롤 맨 아래로 이동
  await sendCommand('Runtime.evaluate', {
    expression: `
      const container = document.getElementById("chat-messages-container");
      if (container) container.scrollTop = container.scrollHeight;
    `
  });
  await new Promise(r => setTimeout(r, 500));

  const captureResult = await sendCommand('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: false
  });

  const imgBuffer = Buffer.from(captureResult.data, 'base64');
  writeFileSync(outputPath, imgBuffer);
  console.log('Saved coach smart reply screenshot to:', outputPath);

  try { edgeProc.kill(); } catch(_) {}
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
