const fs = require('fs');

const p1 = 'C:\\BeausCreators\\02.BSC_Branch\\projects\\Runnow\\index.html';
let html = fs.readFileSync(p1, 'utf8');
html = html.replace(/styles\.css\?v=[^"']+/, 'styles.css?v=8.5_wide_coach');
fs.writeFileSync(p1, html, 'utf8');

const p2 = 'C:\\BeausCreators\\02.BSC_Branch\\sandbox\\Runnow_APP_V\\legacy_web\\index.html';
fs.writeFileSync(p2, html, 'utf8');
console.log('SUCCESS: styles.css version bumped to v=8.5_wide_coach');
