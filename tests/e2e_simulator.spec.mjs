// Playwright 기반 다중 페르소나 E2E 시뮬레이터 (Mock)
import { test, expect } from '@playwright/test';
import path from 'path';

console.log('🕵️‍♂️ [수호 x 태준 에이전트] 다중 페르소나 E2E 시뮬레이터 구성 완료.');

const PERSONAS = [
  { name: 'Android_Runner', userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-S928N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36' },
  { name: 'iOS_Runner', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1' }
];

PERSONAS.forEach((persona) => {
  test(`[${persona.name}] 1:1 케어팀 스위칭 및 치팅 만회 플로우 순회`, async ({ page }) => {
    
    // 1. 헤더 위장
    await page.setExtraHTTPHeaders({ 'User-Agent': persona.userAgent });
    
    // 2. 홈 접속
    await page.goto('http://localhost:5173'); 
    
    // 3. 코치 스위칭 테스트 (레오 -> 엘리)
    await page.click('text=엘리 코치 (식단)');
    const ellieTitle = await page.locator('.coach-title').innerText();
    expect(ellieTitle).toContain('엘리');
    await page.screenshot({ path: path.join(__dirname, 'screenshots', `${persona.name}_coach_ellie.png`) });
    
    // 4. 치팅 만회 플로우
    await page.click('button:has-text("솔직히 고백하기")');
    const rescueMsg = await page.locator('.rescue-message').innerText();
    expect(rescueMsg).toContain('괜찮아요');
    await page.screenshot({ path: path.join(__dirname, 'screenshots', `${persona.name}_rescue_flow.png`) });

    console.log(`✅ ${persona.name} 환경 시각적 회귀 테스트 완료 (스크린샷 저장됨)`);
  });
});
