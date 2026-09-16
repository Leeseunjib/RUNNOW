import fs from 'fs';

const files = [
  'C:\\BeausCreators\\02.BSC_Branch\\sandbox\\Runnow_APP_V\\legacy_web\\reelsGenerator.js',
  'C:\\BeausCreators\\02.BSC_Branch\\sandbox\\Runnow_APP_V\\src\\core\\reelsGenerator.js',
  'C:\\BeausCreators\\02.BSC_Branch\\projects\\Runnow\\reelsGenerator.js'
];

const newMethodCode = `    drawBentoCard(ctx, x, y, w, h, label, value, valColor, tag) {
      ctx.save();
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";

      // 글래스모피즘 배경
      ctx.fillStyle = "rgba(18, 22, 31, 0.88)";
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 18);
      ctx.fill();

      // 테두리
      ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 태그 뱃지
      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      ctx.beginPath();
      ctx.roundRect(x + 16, y + 14, 110, 24, 8);
      ctx.fill();

      ctx.fillStyle = "#A0AEC0";
      ctx.font = "800 11px 'Inter', sans-serif";
      ctx.fillText(tag, x + 24, y + 30);

      // 라벨
      ctx.fillStyle = "#718096";
      ctx.font = "700 13px 'Inter', sans-serif";
      ctx.fillText(label, x + 16, y + 68);

      // 값 (자동 폰트 리사이징으로 카드 영역 절대 오버플로우 방지)
      ctx.fillStyle = valColor;
      let fontSize = (w > 400) ? 20 : 24;
      ctx.font = \`800 \${fontSize}px 'Montserrat', -apple-system, 'Pretendard', sans-serif\`;
      const maxTextWidth = w - 36;
      while (ctx.measureText(value).width > maxTextWidth && fontSize > 13) {
        fontSize -= 1;
        ctx.font = \`800 \${fontSize}px 'Montserrat', -apple-system, 'Pretendard', sans-serif\`;
      }
      ctx.fillText(value, x + 18, y + 102);

      ctx.restore();
    }`;

files.forEach(file => {
  if (!fs.existsSync(file)) {
    console.log('Skipping non-existent:', file);
    return;
  }
  let code = fs.readFileSync(file, 'utf8');
  const oldMethodRegex = / {4}drawBentoCard\(ctx, x, y, w, h, label, value, valColor, tag\) \{[\s\S]*?ctx\.fillText\(value, x \+ 16, y \+ 105\);[\s\S]*? {4}\}/;
  
  if (oldMethodRegex.test(code)) {
    code = code.replace(oldMethodRegex, newMethodCode);
    fs.writeFileSync(file, code, 'utf8');
    console.log('Successfully patched drawBentoCard in:', file);
  } else {
    console.log('Regex match failed in:', file);
  }
});
