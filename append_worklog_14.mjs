import { appendFileSync, existsSync } from 'node:fs';

const entry = `

## 14. 3D 펫 비주얼라이저 전면 제거 및 2D 웹툰 펫 단독 복원 (2026-09-15 15:49)

### 1) 배경 및 대표님 지침
- **대표님 피드백**: "3D 요소를 제거를 하라고 말했던 것 같은데?"
- 타마고치 펫 화면 상단에 2D 웹툰 강아지 일러스트와 겹치며 불필요하게 렌더링되던 초록색 3D Three.js 메시(\`pet3d.js\`, \`#pet3d-host\`)를 완전히 제거하여 화면 복잡도를 낮추고 본래의 정갈한 2D 웹툰 펫 UI로 원상복구.

### 2) 기술 조치 내역
1. **\`index.html\`**:
   - 상단에 잔존하던 3D 컨테이너 \`<div id="pet3d-host" class="pet3d-host" aria-hidden="true"></div>\` 전면 삭제.
   - 불필요한 스크립트 로더 \`<script src="pet3d.js"></script>\` 삭제.
2. **\`app.js\`**:
   - 펫 탭 렌더링 시 호출되던 \`window.Pet3D?.init("pet3d-host")\` 실행문 영구 제거.
3. **\`pet3d.js\` & \`styles.css\`**:
   - \`pet3d.js\`를 안전한 빈 객체(Dummy Stub)로 중화.
   - \`styles.css\`에 \`.pet3d-host, #pet3d-host, .pet-3d-box { display: none !important; }\` 강제 선언.
4. **듀얼 싱크 및 검증**:
   - \`projects/Runnow\` 및 \`sandbox/Runnow_APP_V\` 100% 동기화.
   - CDP 브라우저 캡처(\`runnow_tamagotchi_no_3d_verified.png\`)를 통해 3D 렌더링이 완전히 사라지고 아름다운 2D 웹툰 펫 일러스트만 정갈하게 노출됨을 검증.
   - Firebase Hosting dev 채널 배포 완료 (\`https://runnow-37af9--dev-irl7g2ve.web.app\`).
`;

const hqPath = 'C:\\BeausCreators\\01.BSC_HQ\\1.Documents\\02.작업일지\\2026-09-15_RunNow_WorkLog.md';
const spokePath = 'C:\\BeausCreators\\02.BSC_Branch\\projects\\Runnow\\docs\\2026-09-15_RunNow_WorkLog.md';

if (existsSync(hqPath)) {
  appendFileSync(hqPath, entry, 'utf8');
  console.log('Appended to HQ WorkLog');
}
if (existsSync(spokePath)) {
  appendFileSync(spokePath, entry, 'utf8');
  console.log('Appended to Spoke WorkLog');
}
