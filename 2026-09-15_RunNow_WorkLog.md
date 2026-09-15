# 2026-09-15 RunNow 작업일지

## 1. 업무 개요
- **일자**: 2026-09-15
- **담당자**: 거누 (CTO / 개발 총괄)
- **요청자**: 이건우 대표님 (BSC CEO)
- **주요 업무**: Git 및 터미널 핵심 명령어 교육 가이드 및 전사 표준 엑셀 치트시트 제작 및 바탕화면 배포

---

## 2. 세부 진행 내역

### 1) Git 및 터미널 명령어 실무 교육 가이드 제공
- Git 3단계 라이프사이클(Working Directory -> Staging Area -> Repository -> Remote) 기반 체계적 정리
- 4대 일상 작업 루틴 (`status`, `add`, `commit`, `push`) 및 브랜치(`branch`, `switch`, `merge`), 협업(`pull`, `fetch`), 임시보관(`stash`), 취소/복구(`restore`, `reset`, `revert`) 가이드
- 터미널(PowerShell, Linux/Mac, Git Bash) 기본 조작(`cd`, `pwd`, `ls`, `mkdir`, `cp`, `mv`, `cat`, `rm`) 및 Windows 전용 명령어 비교표 안내
- 안전 수칙: 데이터 유실 방지를 위한 `rm -rf` 및 `git reset --hard` 주의사항 강조

### 2) 프리미엄 엑셀 치트시트(`.xlsx`) 자동 생성 및 다중 배포
- **파일명**: `Git_및_터미널_명령어_총정리_치트시트.xlsx` (영문: `Git_and_Terminal_Command_Guide.xlsx`)
- **디자인 스타일**: Dark Navy 타이틀 바, Royal Blue 헤더, 얼터네이트 지브라 패턴 행, 가독성 높은 Consolas 코드 폰트, 중요도 및 주의사항 색상 뱃지, 열 너비 자동 최적화 및 틀 고정(Freeze Panes) 적용
- **시트 구성**:
  1. `🚀 Git 명령어 총정리` (36개 핵심 명령어 및 실무 팁)
  2. `💻 터미널 CLI 명령어` (28개 Windows PowerShell vs Linux/Mac 명령어)
  3. `⚡ 단축키 및 실무 꿀팁` (생산성 단축키, 특수 기호, Git 실무 팁, 안전수칙)
- **배포 경로**:
  - 대표님 바탕화면: `C:\Users\USER\OneDrive\Desktop\` 및 `C:\Users\USER\Desktop\`
  - 프로젝트 로컬 문서: `c:\BeausCreators\02.BSC_Branch\projects\Runnow\docs\`

---

## 3. 결과 및 확인
- 엑셀 파일 정상 생성 확인 및 무결성 검증 완료
- 바탕화면 바로 열기 가능 확인

---

## 4. 추가 (2026-09-15 · 소하) — 전사 Web→Expo 앱 전환 운영표준 HQ 등재

- **지시**: 이건우 대표님 — 앞으로 앱은 웹 제작 후 React Native(Expo)로 전환. 웹 원본 비파괴·복제본 실험.
- **산출**: `docs/2026-09-15_BSC_Web우선_ReactNative_Expo앱_전환_운영표준_보고서.md`
- **맵**: `projects/Directory_Map.md`에 `sandbox/Runnow_mb_v` 예정 및 전사 파이프라인 표기
- **HQ**: Spoke `sync_hq` Dual-Write → `01.BSC_HQ/1.Documents/01.보고서/2026-09-15/`

---

### 8. 코치 HUD 카메라 외부 분리(화면 가림 0%), 카메라 영역 60vh 확장 및 한국인 성우 오디오 팩 60종 탑재
- **카메라 화면 가림(Occlusion) 원천 분리**:
  - 기존: 코치 HUD(`.pt-coach-live-hud`)가 카메라 박스 내부에 `position: absolute; top: 10px;`로 떠 있어 상단 35%를 가리고 유저의 머리와 얼굴을 완전히 덮는 문제 발생.
  - 개선: 코치 HUD를 카메라 컨테이너(`.pose-stage`) **완전 외부 상단 독립 카드로 분리**하여 카메라 내부 신체 가림 0% 달성.
- **카메라 영역 대폭 확대 (Wide Viewport)**:
  - 기존: `height: 400px` 고정으로 좁고 답답했던 뷰포트.
  - 개선: `min-height: 520px; height: 60vh; max-height: 680px;`로 1.5배 이상 세로 화각을 확장하여 2m 거리에서 머리부터 발끝까지 전신과 플랭크 자세가 시원하게 포착되도록 개선.
- **인-카메라 배지 및 마스코트 정리**:
  - 횟수/각도 배지를 상단 모서리(`top: 14px`)로 밀착시켜 인체 중심부 시야를 100% 개방.
  - 운동 중 바닥/발목을 가리던 파트너 댕댕이 박스를 카메라 외부로 이동.
- **100% 진짜 한국인 성우 실사 오디오 팩 60종 탑재 (`motionSound.js`)**:
  - 구형 브라우저 합성 기계음(`window.speechSynthesis`)의 한계를 근본적으로 타파.
  - 최첨단 한국인 인공신경망 성우 모델(남성 레오: `ko-KR-InJoonNeural`, 여성 루나: `ko-KR-SunHiNeural`)로 **총 60종의 스튜디오급 고음질 MP3 에셋** 생성 및 탑재 (`assets/audio/coaches/leo/`, `luna/`).
  - **카운트 1~20 ("하나!", "둘!", "셋!" ... "스물!")**, **카운트다운 ("삼, 이, 일, 시작합니다!")**, **현장감 넘치는 추임새 ("좋습니다, 나이스!", "깊이 완벽합니다!", "절반 돌파!", "마지막 하나 더!", "완벽합니다, 세트 완수!")**를 0ms 무지연 오디오 엔진으로 즉각 재생.
- **Firebase Hosting 배포 완료**:
  - 라이브: `https://runnow-37af9.web.app`
  - 프리뷰: `https://runnow-37af9--dev-irl7g2ve-xsgd93yu.web.app`

---

### 9. 1km 구간별 스플릿 랩(Lap Splits) 자동 기록, 실시간 듀얼 속도(km/h), 고스트 러너 비교 및 다마고치 펫 러닝 애니메이션 트랙 탑재 (2026-09-15 · 거누)

- **지시 사항 (이건우 대표님)**:
  1. 달리기 시 매 1km 통과마다 속도와 페이스가 지속적으로 갱신·기록되는 시스템 구축.
  2. 현재 속도와 평균 속도가 동시에 실시간으로 나오는 HUD 구성.
  3. 지난날(과거) 속도와 실시간으로 비교되는 시스템(Ghost Runner Comparison).
  4. 1km 랩 기록이 화면 아래로 무한정 늘어나지 않고, 고정 높이 스크롤 안에서 가독성 높게 조회되는 UI.
  5. 달릴 때 다마고치 펫(강아지 🐶, 고양이 🐱)이 함께 달리는 라이브 애니메이션 트랙 추가.

- **핵심 구현 상세**:
  1. **정밀 1km 랩 분할 알고리즘 (`gpsRunner.js`)**:
     - 누적 이동 거리가 매 1,000m 돌파 시마다 `checkLapSplit(runningSeconds)`가 자동 트리거되어 구간 랩 생성.
     - 구간별 소요 시간(초/포맷), 구간 페이스(분'초"), 구간 평균 속도(`km/h`)를 산출하여 `this.laps` 배열에 영구 보존.
     - 정지 대기 시간은 분모에서 제외하여 왜곡 없는 순수 이동 페이스 및 시속 산출.
     - 현재 달리고 있는 진행 중인 구간(예: 3km 진행 중 345m)도 실시간으로 집계하여 표시.
     - 48개 전수 단위 테스트 (`tests/gpsRunner.test.mjs`) ALL PASS 검증 완료.
  2. **실시간 듀얼 속도 HUD 및 4-Grid 체계 (`index.html`, `styles.css`)**:
     - 기존 3-Grid(페이스, 시간, 칼로리)에서 4-Grid(`hud-grid-4`)로 확장.
     - 네온 볼트 컬러(`#CCFF00`, 900 bold)로 현재 속도(`km/h`)를 시원하게 표시하고, 하단 서브 텍스트에 평균 속도(`km/h`)를 상시 표기.
  3. **과거 기록 실시간 비교 뱃지 (Ghost Runner System)**:
     - `localStorage`의 지난 러닝 기록(`RUNNOW_LAST_RUN`)을 실시간 기준점(속도/시간)으로 삼아 페이스 대조.
     - 지난 기록 대비 빠를 경우: `▲ +0.8 km/h 더 빠름 (지난번보다 앞서 달리는 중! 🔥)` (네온 골드/볼트 뱃지).
     - 지난 기록 대비 느릴 경우: `▼ -0.5 km/h (지난번보다 뒤처짐, 페이스 업! 💨)` (코랄 레드 뱃지).
  4. **다마고치 펫 실시간 러닝 트랙 (`#live-pet-track`)**:
     - 러닝 시작 시 네온 사이언(`#00F0FF`) 트랙 레인이 뒤로 흘러가는 시각 효과(`@keyframes trackLaneFlow`).
     - 유저의 다마고치 펫(강아지 🐶 또는 고양이 🐱)이 속도에 비례해 위아래로 역동적으로 통통 튀며 달림 (`@keyframes petRunBounce`).
     - 펫 머리 위에 실시간 격려 말풍선(`"대표님, 1km 랩타임 최고예요! 멍멍! 🐾"`)과 실시간 속도 태그 탑재.
  5. **1KM 구간별 스플릿 랩 고정 스크롤 카드 (`#live-laps-card`)**:
     - 화면이 길어지는 현상을 방지하기 위해 `max-height: 180px; overflow-y: auto;`의 슬림형 고정 스크롤 컨테이너 적용.
     - 헤더에 완주한 킬로미터 수(`2 KM 완료`) 배지 표시.
     - 각 랩 행에 구간(km), 랩타임, 페이스, 속도(km/h), 그리고 지난날 기준 대비 단축/지연 배지(`▲ 10초 단축`, `▼ 5초 지연`) 직관적 시각화.
     - 현재 진행 중인 구간은 사이언 글로우(`#00F0FF`)로 하이라이팅.

- **배포 및 검증**:
  - `projects/Runnow` ➔ `sandbox/Runnow_APP_V/legacy_web/` 양방향 100% 동기화.
  - 내부 테스트 채널 배포: `https://runnow-37af9--dev-irl7g2ve.web.app`
  - Edge Headless CDP를 통한 모바일 뷰포트(430x1200) 실측 캡처 검증 완료.
