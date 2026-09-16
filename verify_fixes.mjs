import puppeteer from 'puppeteer-core';
import fs from 'fs';

// Edge or Chrome path on Windows
const possiblePaths = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
];

let executablePath = possiblePaths.find(p => fs.existsSync(p));

async function capture() {
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2 });

  console.log('Navigating to http://localhost:8080/index.html...');
  await page.goto('http://localhost:8080/index.html', { waitUntil: 'networkidle2' });

  // 1. 캡처 1: 메인 화면 기상 위젯 (스크린샷 3 검증)
  await page.evaluate(() => {
    // 만약 날씨 데이터가 기본값이라면 실제 기상 데이터 렌더 호출
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
          message: "기온 24.9℃, 미세먼지 '좋음' 청정 구역! 달리기 딱 좋은 골든 아워입니다. 지금 15분만 달려도 하루 활력이 넘칩니다!"
        }
      });
    }
  });

  await new Promise(r => setTimeout(r, 600));

  const weatherEl = await page.$('#weather-running-widget');
  if (weatherEl) {
    await weatherEl.screenshot({
      path: 'C:/Users/USER/.gemini/antigravity-ide/brain/ca84e5b2-18c3-4af7-9489-c04ce439e8d4/verify_weather_widget_contrast.png'
    });
    console.log('Captured verify_weather_widget_contrast.png');
  }

  // 운동 탭 전체 상단 캡처
  await page.screenshot({
    path: 'C:/Users/USER/.gemini/antigravity-ide/brain/ca84e5b2-18c3-4af7-9489-c04ce439e8d4/verify_exercise_screen_contrast.png',
    clip: { x: 0, y: 0, width: 375, height: 750 }
  });
  console.log('Captured verify_exercise_screen_contrast.png');

  // 2. 캡처 2: 마이페이지 색상 테마 설정 (스크린샷 1 검증)
  await page.evaluate(() => {
    // switch to settings tab
    const navBtn = document.querySelector('[data-tab="tab-settings"]');
    if (navBtn) navBtn.click();
  });

  await new Promise(r => setTimeout(r, 500));

  const themePanel = await page.$('.theme-selector-bar');
  if (themePanel) {
    // 스크롤 이동
    await page.evaluate(() => {
      const panel = document.querySelector('#app-theme-bar');
      if (panel) panel.scrollIntoView({ block: 'center' });
    });
    await new Promise(r => setTimeout(r, 300));

    await page.screenshot({
      path: 'C:/Users/USER/.gemini/antigravity-ide/brain/ca84e5b2-18c3-4af7-9489-c04ce439e8d4/verify_theme_selector_2x2.png',
      clip: { x: 0, y: 180, width: 375, height: 450 }
    });
    console.log('Captured verify_theme_selector_2x2.png');
  }

  // 3. 캡처 3: 릴스 생성 모달 (스크린샷 2 검증)
  await page.evaluate(() => {
    if (window.triggerMakeReels) {
      window.triggerMakeReels();
    }
  });

  // 릴스 비디오 렌더 완료 대기 (2.5초)
  await new Promise(r => setTimeout(r, 3000));

  const reelsModal = await page.$('.reels-modal-card');
  if (reelsModal) {
    await page.screenshot({
      path: 'C:/Users/USER/.gemini/antigravity-ide/brain/ca84e5b2-18c3-4af7-9489-c04ce439e8d4/verify_reels_modal_clean.png'
    });
    console.log('Captured verify_reels_modal_clean.png');
  }

  await browser.close();
  console.log('All verification captures finished.');
}

capture().catch(console.error);
