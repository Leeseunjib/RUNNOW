const fs = require('fs');

const cssPath = 'C:\\BeausCreators\\02.BSC_Branch\\projects\\Runnow\\styles.css';
let css = fs.readFileSync(cssPath, 'utf8');

const extraScrollHide = `
/* 코치 선택 바 및 전사 가로 스크롤바 완전 숨김 */
.coach-selector-bar {
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
}
.coach-selector-bar::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}
`;

css += extraScrollHide;

fs.writeFileSync(cssPath, css, 'utf8');
const cssPath2 = 'C:\\BeausCreators\\02.BSC_Branch\\sandbox\\Runnow_APP_V\\legacy_web\\styles.css';
fs.writeFileSync(cssPath2, css, 'utf8');
console.log('SUCCESS: coach-selector-bar scrollbar hidden!');
