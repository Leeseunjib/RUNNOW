const fs = require('fs');

// 1. projects/Runnow
const swPath = 'C:\\BeausCreators\\02.BSC_Branch\\projects\\Runnow\\sw.js';
let sw = fs.readFileSync(swPath, 'utf8');
sw = sw.replace(/const CACHE_NAME = 'runnow-v[^']+';/, "const CACHE_NAME = 'runnow-v5.0_laps_pet';");
fs.writeFileSync(swPath, sw, 'utf8');
console.log('sw.js cache name updated to runnow-v5.0_laps_pet');

const htmlPath = 'C:\\BeausCreators\\02.BSC_Branch\\projects\\Runnow\\index.html';
let html = fs.readFileSync(htmlPath, 'utf8');
html = html.replace(/\/sw\.js\?v=[^']+'/, "/sw.js?v=5.0_laps_pet'");
fs.writeFileSync(htmlPath, html, 'utf8');
console.log('index.html sw registration updated');

// 2. sandbox/Runnow_APP_V/legacy_web
const swPath2 = 'C:\\BeausCreators\\02.BSC_Branch\\sandbox\\Runnow_APP_V\\legacy_web\\sw.js';
fs.writeFileSync(swPath2, sw, 'utf8');

const htmlPath2 = 'C:\\BeausCreators\\02.BSC_Branch\\sandbox\\Runnow_APP_V\\legacy_web\\index.html';
fs.writeFileSync(htmlPath2, html, 'utf8');
console.log('Copied to legacy_web successfully');
