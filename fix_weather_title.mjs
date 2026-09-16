import fs from 'fs';

const dirs = [
  'C:\\BeausCreators\\02.BSC_Branch\\sandbox\\Runnow_APP_V\\legacy_web',
  'C:\\BeausCreators\\02.BSC_Branch\\projects\\Runnow'
];

dirs.forEach(dir => {
  const ip = `${dir}\\index.html`;
  if (!fs.existsSync(ip)) return;
  let html = fs.readFileSync(ip, 'utf8');

  // Replace title section
  html = html.replace(
    /<strong class="weather-card-title">🌤️ 실시간 러닝 기상<\/strong>\s*<span class="weather-public-badge">공공데이터<\/span>/,
    '<strong class="weather-card-title">🌤️ 실시간 러닝 기상</strong>'
  );

  fs.writeFileSync(ip, html, 'utf8');
  console.log('Fixed weather title in:', ip);
});
