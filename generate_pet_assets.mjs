import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const prjDir = 'C:\\BeausCreators\\02.BSC_Branch\\projects\\Runnow';
const sndDir = 'C:\\BeausCreators\\02.BSC_Branch\\sandbox\\Runnow_APP_V\\legacy_web';

// 1. Generate SVG assets for pets if needed
const petAssetDir = join(prjDir, 'assets', 'pets');
if (!existsSync(petAssetDir)) mkdirSync(petAssetDir, { recursive: true });

function makePetSvg(emoji, bgGradient, stageNum, stageName) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
    <defs>
      <radialGradient id="bg_${stageNum}" cx="50%" cy="45%" r="55%">
        <stop offset="0%" stop-color="${bgGradient[0]}"/>
        <stop offset="100%" stop-color="${bgGradient[1]}"/>
      </radialGradient>
      <filter id="glow_${stageNum}" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="${bgGradient[1]}" flood-opacity="0.35"/>
      </filter>
    </defs>
    <circle cx="200" cy="200" r="185" fill="url(#bg_${stageNum})" stroke="${bgGradient[2]}" stroke-width="8" filter="url(#glow_${stageNum})"/>
    <circle cx="200" cy="200" r="160" fill="none" stroke="rgba(255,255,255,0.25)" stroke-dasharray="8 6" stroke-width="3"/>
    <text x="200" y="225" font-size="120" text-anchor="middle" font-family="'Apple Color Emoji','Segoe UI Emoji',sans-serif">${emoji}</text>
    <rect x="70" y="305" width="260" height="42" rx="21" fill="rgba(0,0,0,0.55)" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>
    <text x="200" y="332" font-size="16" font-weight="900" fill="#FFFFFF" text-anchor="middle" font-family="'Pretendard',sans-serif">${stageNum}단계: ${stageName}</text>
  </svg>`;
}

// Generate missing SVGs for all species & stages
const speciesDefs = {
  dog: {
    emoji: ['🐶', '🐕', '🐾', '🦮', '🏃‍♂️', '⚡', '🎧', '🏅', '🏆', '👑'],
    grad: ['#FFF8E1', '#FFA000', '#FFB300']
  },
  cat: {
    emoji: ['🐱', '🐈', '🐾', '🧶', '🏃‍♀️', '⚡', '🎧', '🏅', '🏆', '👑'],
    grad: ['#F3E5F5', '#8E24AA', '#AB47BC']
  },
  rabbit: {
    emoji: ['🐰', '🐇', '🥕', '🌸', '🏃', '⚡', '🎧', '🏅', '🏆', '👑'],
    grad: ['#FCE4EC', '#D81B60', '#EC407A']
  },
  panda: {
    emoji: ['🐼', '🐾', '🎋', '🍃', '🏃‍♂️', '⚡', '🎧', '🏅', '🏆', '👑'],
    grad: ['#E8F5E9', '#2E7D32', '#43A047']
  },
  boltmon: {
    emoji: ['⚡', '✨', '🔋', '🔮', '🚀', '🔥', '🎧', '🏅', '🏆', '👑'],
    grad: ['#E0F7FA', '#00ACC1', '#00F0FF']
  }
};

const stageNames = [
  "응애 아기", "걸음마 유아", "장난꾸러기 유치원", "호기심 탐험가", "트랙 꿈나무",
  "질주 청소년", "열정 페이스메이커", "프로 마라토너", "베테랑 챔피언", "초월의 성체 마스터"
];

for (const [sp, def] of Object.entries(speciesDefs)) {
  for (let s = 1; s <= 10; s++) {
    const filename = `${sp}_stage_${s}.svg`;
    const filepath = join(petAssetDir, filename);
    if (!existsSync(filepath)) {
      const svg = makePetSvg(def.emoji[s - 1], def.grad, s, stageNames[s - 1]);
      writeFileSync(filepath, svg, 'utf8');
    }
  }
}
console.log('✅ Pet SVGs generated successfully!');

console.log('Upgrade script ready for execution.');
