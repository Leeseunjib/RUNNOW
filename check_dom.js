const { spawn } = require('child_process');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const p = spawn(edgePath, [
  '--headless',
  '--dump-dom',
  'https://runnow-37af9--dev-irl7g2ve.web.app/?t=1789451675424'
]);
let out = '';
p.stdout.on('data', d => out += d);
p.on('close', () => {
  console.log('has live-speed in dumped DOM:', out.includes('id="live-speed"'));
  console.log('has live-laps-card in dumped DOM:', out.includes('id="live-laps-card"'));
  console.log('has pet-running-track in dumped DOM:', out.includes('id="live-pet-track"'));
});
