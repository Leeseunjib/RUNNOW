import fs from 'fs';
import path from 'path';

const filePath = 'C:\\BeausCreators\\02.BSC_Branch\\sandbox\\Runnow_APP_V\\legacy_web\\tamagotchi.js';
let content = fs.readFileSync(filePath, 'utf-8');

// Replace all .svg pet references with .jpg
const replaced = content
  .replace(/\.\/assets\/pets\/dog_stage_(\d+)\.svg/g, './assets/pets/dog_stage_$1.jpg')
  .replace(/\.\/assets\/pets\/cat_stage_(\d+)\.svg/g, './assets/pets/cat_stage_$1.jpg')
  .replace(/\.\/assets\/pets\/rabbit_stage_(\d+)\.svg/g, './assets/pets/rabbit_stage_$1.jpg')
  .replace(/\.\/assets\/pets\/panda_stage_(\d+)\.svg/g, './assets/pets/panda_stage_$1.jpg')
  .replace(/\.\/assets\/pets\/boltmon_stage_(\d+)\.svg/g, './assets/pets/boltmon_stage_$1.jpg');

fs.writeFileSync(filePath, replaced, 'utf-8');
console.log('Successfully updated all pet stage references to JPG in tamagotchi.js');
