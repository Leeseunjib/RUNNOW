import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const prjDir = 'C:\\BeausCreators\\02.BSC_Branch\\projects\\Runnow';
const sndDir = 'C:\\BeausCreators\\02.BSC_Branch\\sandbox\\Runnow_APP_V\\legacy_web';

function cleanFiles(dir) {
  console.log(`Cleaning 3D elements in ${dir}...`);

  // 1. index.html
  const indexPath = join(dir, 'index.html');
  if (existsSync(indexPath)) {
    let html = readFileSync(indexPath, 'utf8');
    html = html.replace(/<div id="pet3d-host"[^>]*><\/div>\s*/g, '');
    html = html.replace(/<script src="pet3d\.js"><\/script>\s*/g, '');
    writeFileSync(indexPath, html, 'utf8');
    console.log('  -> Cleaned index.html');
  }

  // 2. app.js
  const appPath = join(dir, 'app.js');
  if (existsSync(appPath)) {
    let appJs = readFileSync(appPath, 'utf8');
    appJs = appJs.replace(/\s*if\s*\(window\.Pet3D\?\.init\)\s*window\.Pet3D\.init\("pet3d-host"\);/g, '');
    writeFileSync(appPath, appJs, 'utf8');
    console.log('  -> Cleaned app.js');
  }

  // 3. pet3d.js (neutralize)
  const pet3dPath = join(dir, 'pet3d.js');
  if (existsSync(pet3dPath)) {
    const neutralized = `// 3D 요소 전면 제거 (2D 웹툰 펫 단독 모드)
(function() {
  window.Pet3DVisualizer = { init() {}, dispose() {} };
  window.Pet3D = window.Pet3DVisualizer;
})();
`;
    writeFileSync(pet3dPath, neutralized, 'utf8');
    console.log('  -> Neutralized pet3d.js');
  }

  // 4. styles.css
  const cssPath = join(dir, 'styles.css');
  if (existsSync(cssPath)) {
    let css = readFileSync(cssPath, 'utf8');
    css += `\n/* 3D 요소 전면 비활성화 */\n.pet3d-host, #pet3d-host, .pet-3d-box, .pet-3d-hint { display: none !important; height: 0 !important; width: 0 !important; overflow: hidden !important; visibility: hidden !important; }\n`;
    writeFileSync(cssPath, css, 'utf8');
    console.log('  -> Cleaned styles.css');
  }
}

cleanFiles(prjDir);
cleanFiles(sndDir);

console.log('ALL 3D ELEMENTS COMPLETELY REMOVED!');
