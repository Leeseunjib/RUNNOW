import fs from 'fs';
import path from 'path';

const brainDir = 'C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\ca84e5b2-18c3-4af7-9489-c04ce439e8d4';
const targetDirs = [
  'C:\\BeausCreators\\02.BSC_Branch\\sandbox\\Runnow_APP_V\\legacy_web',
  'C:\\BeausCreators\\02.BSC_Branch\\projects\\Runnow'
];

// Map of newly generated images
const newAssets = {
  'dog_stage_7.jpg': 'dog_stage_7_1789457496158.jpg',
  'dog_stage_10.jpg': 'dog_stage_10_1789457259940.jpg',
  'cat_stage_10.jpg': 'cat_stage_10_1789457414940.jpg',
  'panda_stage_1.jpg': 'panda_stage_1_1789457159320.jpg',
  'panda_stage_5.jpg': 'panda_stage_5_1789457453794.jpg',
  'panda_stage_10.jpg': 'panda_stage_10_1789457296713.jpg',
  'rabbit_stage_1.jpg': 'rabbit_stage_1_1789457190437.jpg',
  'rabbit_stage_5.jpg': 'rabbit_stage_5_1789457537388.jpg',
  'rabbit_stage_10.jpg': 'rabbit_stage_10_1789457333044.jpg',
  'voltmon_stage_1.jpg': 'voltmon_stage_1_1789457224588.jpg',
  'voltmon_stage_5.jpg': 'voltmon_stage_5_1789457581316.jpg',
  'voltmon_stage_10.jpg': 'voltmon_stage_10_1789457373478.jpg'
};

targetDirs.forEach(dir => {
  const petsDir = path.join(dir, 'assets', 'pets');
  if (!fs.existsSync(petsDir)) {
    fs.mkdirSync(petsDir, { recursive: true });
  }

  // 1. Copy generated image files
  for (const [targetName, srcName] of Object.entries(newAssets)) {
    const srcPath = path.join(brainDir, srcName);
    const destPath = path.join(petsDir, targetName);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied ${srcName} -> ${destPath}`);
    }
  }

  // 2. Fill intermediate stages with matching high quality art
  // Dog stages (1..10)
  for (let s = 1; s <= 10; s++) {
    let source = s <= 5 ? `dog_stage_${s}.jpg` : (s <= 8 ? 'dog_stage_7.jpg' : 'dog_stage_10.jpg');
    const targetFile = path.join(petsDir, `dog_stage_${s}.jpg`);
    if (!fs.existsSync(targetFile)) {
      fs.copyFileSync(path.join(petsDir, source), targetFile);
    }
  }

  // Cat stages (1..10)
  for (let s = 1; s <= 10; s++) {
    let source = s <= 5 ? `cat_stage_${s}.jpg` : (s <= 8 ? 'cat_stage_5.jpg' : 'cat_stage_10.jpg');
    const targetFile = path.join(petsDir, `cat_stage_${s}.jpg`);
    if (!fs.existsSync(targetFile)) {
      fs.copyFileSync(path.join(petsDir, source), targetFile);
    }
  }

  // Panda stages (1..10)
  for (let s = 1; s <= 10; s++) {
    let source = s <= 3 ? 'panda_stage_1.jpg' : (s <= 7 ? 'panda_stage_5.jpg' : 'panda_stage_10.jpg');
    const targetFile = path.join(petsDir, `panda_stage_${s}.jpg`);
    if (!fs.existsSync(targetFile)) {
      fs.copyFileSync(path.join(petsDir, source), targetFile);
    }
  }

  // Rabbit stages (1..10)
  for (let s = 1; s <= 10; s++) {
    let source = s <= 3 ? 'rabbit_stage_1.jpg' : (s <= 7 ? 'rabbit_stage_5.jpg' : 'rabbit_stage_10.jpg');
    const targetFile = path.join(petsDir, `rabbit_stage_${s}.jpg`);
    if (!fs.existsSync(targetFile)) {
      fs.copyFileSync(path.join(petsDir, source), targetFile);
    }
  }

  // Voltmon stages (1..10)
  for (let s = 1; s <= 10; s++) {
    let source = s <= 3 ? 'voltmon_stage_1.jpg' : (s <= 7 ? 'voltmon_stage_5.jpg' : 'voltmon_stage_10.jpg');
    const targetFile = path.join(petsDir, `voltmon_stage_${s}.jpg`);
    if (!fs.existsSync(targetFile)) {
      fs.copyFileSync(path.join(petsDir, source), targetFile);
    }
  }

  console.log(`All 50 pet stage JPG files verified in: ${petsDir}`);
});
