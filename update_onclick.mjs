import { readFileSync, writeFileSync } from 'node:fs';

const paths = [
  'C:\\BeausCreators\\02.BSC_Branch\\projects\\Runnow\\index.html',
  'C:\\BeausCreators\\02.BSC_Branch\\sandbox\\Runnow_APP_V\\legacy_web\\index.html'
];

paths.forEach(p => {
  let html = readFileSync(p, 'utf8');
  html = html.replace(/window\.Tamagotchi\.switchPetSpecies\('([a-z]+)'\)/g, "window.switchPetSpecies ? window.switchPetSpecies('$1') : window.Tamagotchi.switchPetSpecies('$1')");
  writeFileSync(p, html, 'utf8');
  console.log('Updated', p);
});
