import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const outBanner = 'C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\ca84e5b2-18c3-4af7-9489-c04ce439e8d4\\verify_coach_banner_buttons_clean.png';
const outPet = 'C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\ca84e5b2-18c3-4af7-9489-c04ce439e8d4\\verify_pet_10stages_5species_clean.png';
const tempDir = 'C:\\Users\\USER\\AppData\\Local\\Temp\\EdgeVerifyProfile_' + Date.now();

async function main() {
  console.log('1. Launching Edge on port 9230...');
  const edgeProc = spawn(edgePath, [
    '--headless',
    '--disable-gpu',
    `--user-data-dir=${tempDir}`,
    '--remote-debugging-port=9230',
    '--window-size=430,932',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  let pages;
  for (let i = 0; i < 10; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9230/json/list');
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

  // --- A. Capture Coach Banner ---
  console.log('3. Capturing Coach Banner buttons...');
  const evalCareTeam = `
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

      if (window.CareTeam && window.CareTeam.renderAll) {
        window.CareTeam.renderAll();
      }

      window.scrollTo(0, 0);
      return true;
    })();
  `;
  await sendCommand('Runtime.evaluate', { expression: evalCareTeam });
  await new Promise(r => setTimeout(r, 1000));

  const cap1 = await sendCommand('Page.captureScreenshot', { format: 'png' });
  writeFileSync(outBanner, Buffer.from(cap1.data, 'base64'));
  console.log('✅ Banner screenshot saved.');

  // --- B. Capture Pet 10-Stages & 5 Species ---
  console.log('4. Capturing Pet 10-Stages & 5 Species...');
  const evalPet = `
    (function() {
      document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
      const petPane = document.getElementById("tab-tamagotchi");
      if (petPane) petPane.classList.add("active");

      document.querySelectorAll(".bottom-nav .nav-item").forEach(b => b.classList.remove("active"));
      const petBtn = document.querySelector('.bottom-nav [data-tab="tab-tamagotchi"]');
      if (petBtn) petBtn.classList.add("active");

      if (window.Tamagotchi && window.Tamagotchi.render) {
        window.Tamagotchi.render();
      }

      window.scrollTo(0, 0);
      return true;
    })();
  `;
  await sendCommand('Runtime.evaluate', { expression: evalPet });
  await new Promise(r => setTimeout(r, 1000));

  const cap2 = await sendCommand('Page.captureScreenshot', { format: 'png' });
  writeFileSync(outPet, Buffer.from(cap2.data, 'base64'));
  console.log('✅ Pet screenshot saved.');

  ws.close();
  edgeProc.kill();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
