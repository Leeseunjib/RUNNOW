import { readFileSync, writeFileSync } from 'node:fs';

const prepend = `export const STAGE_TITLES = [
  "응애 아기", "걸음마 유아", "장난꾸러기 유치원", "호기심 탐험가", "트랙 꿈나무",
  "질주 청소년", "열정 페이스메이커", "프로 마라토너", "베테랑 챔피언", "초월의 성체 마스터"
];
const stageTitles = STAGE_TITLES;
`;

const paths = [
  'C:\\BeausCreators\\02.BSC_Branch\\projects\\Runnow\\tamagotchi.js',
  'C:\\BeausCreators\\02.BSC_Branch\\sandbox\\Runnow_APP_V\\legacy_web\\tamagotchi.js'
];

paths.forEach(p => {
  let content = readFileSync(p, 'utf8');
  if (!content.includes('const stageTitles = STAGE_TITLES;')) {
    content = prepend + content;
    writeFileSync(p, content, 'utf8');
    console.log('Prepended STAGE_TITLES to', p);
  }
});
