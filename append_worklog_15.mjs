import { appendFileSync, existsSync } from 'node:fs';

const entry = `

## 15. 전 페이지 버튼 텍스트 오버플로우 전수 차단 및 5대 펫 10단계(0~180km+) 진화 시스템 구축 (2026-09-15 16:05)

### 1) 배경 및 대표님 지침
- **대표님 피드백**:
  1. "텍스트가 UI 버튼이미지 밖으로 나가지 않도록 해. 모든 페이지 다 검토해."
  2. "나의 펫들의 종류가 많았으면 좋겠고, 아기~성인까지 10단계로 만들었으면 좋겠어."
- **요구사항 분석**:
  - 모바일(360px~390px) 화면에서 1:1 케어팀 상단 코치 배너 버튼(\`🔑 구글 AI 연동 ($0원)\`) 등 버튼 내부 텍스트가 경계선 밖으로 삐져나오거나 잘리는 현상 전수 해결.
  - 타마고치 러닝 메이트를 댕댕이, 냥이, 토끼, 판다, 볼트몽의 5개 종족으로 대폭 다양화하고, 0km 아기부터 180km+ 초월의 마스터까지 10단계 진화 로직 및 비주얼 에셋(총 50개 전 스테이지) 구축.

### 2) 기술 조치 내역
1. **버튼 텍스트 오버플로우 전수 방지 (\`index.html\`, \`styles.css\`)**:
   - \`index.html\`: \`🔑 구글 AI 연동 ($0원)\` 텍스트를 \`🔑 무료 AI 연동\`으로 간결화하여 시인성과 터치 영역 최적화.
   - \`styles.css\`:
     - \`.btn-coach-action\`: \`box-sizing: border-box !important\`, \`clamp(10px, 2.7vw, 11.5px)\`, \`white-space: nowrap\`, \`overflow: hidden\`, \`text-overflow: ellipsis\` 적용.
     - \`.coach-banner-actions\`: \`width: 100%\`, \`gap: 6px\`, \`flex-wrap: nowrap\`.
     - \`.t-btn-action span:last-child\`, \`.species-chip\`, \`.prompt-chip\` 등 모든 UI 버튼류 텍스트에 동일한 오버플로우 방지 규칙 전수 적용.
2. **펫 5대 종족 & 10단계 진화 엔진 구현 (\`tamagotchi.js\`, \`app.js\`, \`index.html\`)**:
   - **5대 종족 모델**:
     - 🐶 댕댕이 (골든 리트리버): 친근하고 충직한 기본 러닝 메이트
     - 🐱 냥이 (치즈 태비): 날렵하고 호기심 많은 캣 러너
     - 🐰 토끼 (롱이어 래빗): 민첩하고 통통 튀는 스피드 스타
     - 🐼 판다 (파워워커 판다): 묵직하고 꾸준한 지구력 챔피언
     - ⚡ 볼트몽 (사이버 신수): 번개 에너지를 품은 초특급 러닝 사이버 비스트
   - **10단계 마일스톤 (0km ~ 180km+)**:
     - 1단계 (0km 응애 아기), 2단계 (2km 꼬물 호기심), 3단계 (5km 아장아장), 4단계 (10km 뜀박질), 5단계 (25km 씩씩한 조거), 6단계 (50km 파워 러너), 7단계 (80km 마라톤 챌린저), 8단계 (120km 하프마스터), 9단계 (150km 울트라 레전드), 10단계 (180km+ 초월의 마스터)
   - **50개 전 스테이지 SVG 그래픽 에셋 생성**: \`assets/pets/{species}_stage_{1..10}.svg\` 전수 제작 및 등록 완료.
   - **UI 신설**:
     - 상단 5대 종족 즉시 선택 칩 바 (\`.pet-species-bar\`)
     - 10단계 타임라인 프로그레스 게이지 (\`.pet-evolution-timeline\`)
     - 라이트 모드 고대비 도트 스타일링(\`#F1F5F9\` 배경, \`#CBD5E1\` 테두리)으로 시인성 극대화.
   - **안정성 강화**: \`tamagotchi.js\`에 \`toJSON()\`, \`addXp()\`, \`rescueVolt()\`, \`switchPetSpecies()\`, \`getStageProgress()\` 및 \`STAGE_TITLES\` 전역 선언 완비.

### 3) 검증 및 배포
- **CDP 브라우저 캡처 검증**:
  - \`verify_coach_banner_buttons_clean.png\`: 360px 모바일 화면에서도 버튼 텍스트가 넉넉한 여백과 함께 완벽히 정렬됨 확인.
  - \`verify_pet_10stages_clean.png\`: 5개 종족 선택 칩과 10단계 타임라인 게이지가 정상 작동하며 가독성이 뛰어남을 확인.
- **Firebase Hosting dev 채널 배포 완료**:
  - 배포 URL: \`https://runnow-37af9--dev-irl7g2ve.web.app\`
  - 총 1,112개 파일 무결성 배포 완료.
- **Git 커밋 완료**:
  - \`56b27d7\` (\`feat(tamagotchi): 5 pet species & 10-stage evolution system + fix global button text overflow\`)
`;

const hqPath = 'C:\\BeausCreators\\01.BSC_HQ\\1.Documents\\02.작업일지\\2026-09-15_RunNow_WorkLog.md';
const spokePath = 'C:\\BeausCreators\\02.BSC_Branch\\projects\\Runnow\\docs\\2026-09-15_RunNow_WorkLog.md';
const localSpoke = 'C:\\BeausCreators\\02.BSC_Branch\\sandbox\\Runnow_APP_V\\2026-09-15_RunNow_WorkLog.md';

if (existsSync(hqPath)) {
  appendFileSync(hqPath, entry, 'utf8');
  console.log('Appended to HQ WorkLog');
}
if (existsSync(spokePath)) {
  appendFileSync(spokePath, entry, 'utf8');
  console.log('Appended to Spoke WorkLog');
}
if (existsSync(localSpoke)) {
  appendFileSync(localSpoke, entry, 'utf8');
  console.log('Appended to Local Sandbox WorkLog');
}
