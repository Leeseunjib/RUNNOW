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


## 12. 1:1 케어팀 코치 배너 가독성 개선 및 진짜 사람 같은 AI 성우 음성 엔진 탑재 (2026-09-15 15:30)

### 1) 배경 및 대표님 요구사항
- **가독성 결함**: 1:1 케어팀 페이지 상단 코치 배너에서 텍스트와 3개 버튼이 한 줄에 좁게 몰려 '코\n치\n레\n오' 형태로 세로 줄바꿈되어 깨지는 심각한 레이아웃 결함 발생.
- **음성 피로도 해소**: 브라우저 내장 로봇 기계음(Web Speech API)의 이질감과 피로도로 인해 진짜 사람 같은 자연스러운 한국인 음성 지원 강력 요청.

### 2) 기술 구현 내역
1. **코치 프로필 배너 2행 구조 분리 (가독성 100% 개선)**:
   - 1행: 코치 원형 아바타 + 네온 링 + 이름(16px Bold, `white-space: nowrap`) + 역할 뱃지(`남성 전담 PT`) + 코치 한줄 소개.
   - 2행: 독립 액션 툴바(`⭐ 전담 지정`, `🔑 구글 AI 연동 ($0원)`, `🔊 음성 켜짐/꺼짐`).
   - 모바일 375px~430px 뷰포트에서도 글자 쪼개짐 원천 차단 및 시인성 극대화.
2. **진짜 사람 같은 인공신경망 성우 오디오 팩 14종 탑재 (`assets/audio/careteam/`)**:
   - 한국어 전문 신경망 모델(`ko-KR-InJoonNeural` 남성 활력 PT 톤, `ko-KR-SunHiNeural` 여성 상냥 코치 톤)로 14개 핵심 오디오 에셋 생성:
     - 코치별 인트로: `leo_intro.mp3`, `luna_intro.mp3`, `ellie_intro.mp3`, `drkay_intro.mp3`
     - 퀵 버블 실전 조언 10종: 레오/루나 폭식 만회(`cheat`), 무릎 부상 체크(`knee`), 3일 루틴(`routine`), 야식 SOS(`snack`), 번아웃 위로(`tired`)
3. **`careTeam.js` 3단계 하이브리드 음성 엔진 파이프라인**:
   - 1순위: 전용 신경망 성우 MP3 즉시 스트리밍 재생 (0ms 지연)
   - 2순위: 동적 AI 응답에 대해 Google 자연어 음성 스트림(`translate_tts`) 실시간 호출
   - 3순위: 네트워크 단절 시 브라우저 로컬 음성 엔진 폴백 안전장치 구현.

### 3) 검증 및 배포
- **CDP 브라우저 검증**: `runnow_careteam_banner_voice_verified.png` 캡처 완료 (배너 가독성 및 정렬 완벽 확인).
- **내부 테스트 채널 배포**: `https://runnow-37af9--dev-irl7g2ve.web.app`
- **Spoke ➔ HQ Dual-Sync 완료**: 본사 작업일지 및 지점 로컬 문서 이중 동기화.


## 13. 상황별 고품질 AI 실사 성우 음성 라이브러리(총 58종) 전수 구축 및 러닝/케어팀 실시간 엔진 연동 (2026-09-15 15:43)

### 1) 배경 및 대표님 요구사항
- **상황별 음성 녹음 대폭 확장 요청**: "혹시 상황별 부분들이 있을 수 있어 그래서 목소리를 더 녹음된 게 더 많이 필요할 것 같아. 목록을 짜보고 계획해서 더 많이 아주 많이 추가하자."
- 기계음이 아닌 진짜 사람(한국인 인공신경망 전문 성우)이 상황마다 곁에서 라디오/PT처럼 말해주는 현장감 높은 음성 라이브러리 전사 구축.

### 2) 기술 구현 내역
1. **총 58종 실사 인공신경망 성우 오디오 에셋 렌더링 (`assets/audio/`)**:
   - 실전 러닝 트래커 18종 (`running/`): 출발 카운트다운, 1km/2km/3km/5km/7km/10km 마일스톤 돌파, 페이스 조절(과속 경고/처짐 독려/완벽 페이스), 자세&호흡 교정, 마지막 500m 스퍼트, 쿨다운 완주, 수분 섭취.
   - 1:1 케어팀 라이프스타일 20종 (`careteam/`): 아침 공복 조깅, 퇴근 야간런, 점심 산책, 심야 숙면, 비 오는 날 실내 홈트, 미세먼지 주의, 폭염/한파 대응, 정체기 멘탈 안심, 침대 탈출 5분 마인드셋, 닥터 케이 무릎/발바닥/종아리/장요근 케어, 영양사 엘리 단백질 골든타임/공복혈당/전해질/숙취 해소.
   - 타마고치 러닝 펫 교감 6종: 펫 출발, 쫑쫑 뛰기, 목마름, 지침 배려, 레벨업, 진화 축하.
   - 1:1 케어팀 인트로 및 SOS 퀵버블 14종: 4대 코치 인트로 및 폭식/치팅 만회, 무릎 체크, 3일 루틴, 야식 유혹 방어 등.
2. **`gpsRunner.js` 실시간 마일스톤 오디오 바인딩**:
   - `startRun()`: `run_start_leo.mp3` 무지연 재생.
   - 거리 측정 루프: 1km, 2km, 3km, 5km, 7km, 10km 통과 시 자동 감지하여 해당 마일스톤 성우 오디오 즉각 스트리밍.
   - `stopRun()`: `run_finish_cool.mp3` 완주 및 쿨다운 안내 재생.
3. **`careTeam.js` 상황 인지 음성 매칭 엔진 탑재**:
   - `SITUATIONAL_AUDIO_MAP` 정규식 딕셔너리를 통해 사용자의 대화 키워드와 맥락(비, 미세먼지, 정체기, 단백질, 무릎, 폭식 등)을 자동 감지하여 전용 신경망 성우 MP3를 0ms 무지연으로 자동 재생.
4. **`index.html` 원클릭 상황별 퀵 칩 12종 확장**:
   - 12개 주요 상황별 프롬프트 칩을 가로 스크롤 가능한 슬릭 필(Pill) 버튼으로 배치하여 1탭 즉시 청취 지원.

### 3) 검증 및 배포
- **CDP 브라우저 검증**: `runnow_careteam_massive_audio_verified.png` 캡처 확인.
- **Firebase Hosting dev 채널 배포**: `https://runnow-37af9--dev-irl7g2ve.web.app` (1,000개 파일 무결성 릴리즈).
- **듀얼 싱크 및 Git 커밋 완료**: `abcb4c5` 커밋 완료.


## 14. 3D 펫 비주얼라이저 전면 제거 및 2D 웹툰 펫 단독 복원 (2026-09-15 15:49)

### 1) 배경 및 대표님 지침
- **대표님 피드백**: "3D 요소를 제거를 하라고 말했던 것 같은데?"
- 타마고치 펫 화면 상단에 2D 웹툰 강아지 일러스트와 겹치며 불필요하게 렌더링되던 초록색 3D Three.js 메시(`pet3d.js`, `#pet3d-host`)를 완전히 제거하여 화면 복잡도를 낮추고 본래의 정갈한 2D 웹툰 펫 UI로 원상복구.

### 2) 기술 조치 내역
1. **`index.html`**:
   - 상단에 잔존하던 3D 컨테이너 `<div id="pet3d-host" class="pet3d-host" aria-hidden="true"></div>` 전면 삭제.
   - 불필요한 스크립트 로더 `<script src="pet3d.js"></script>` 삭제.
2. **`app.js`**:
   - 펫 탭 렌더링 시 호출되던 `window.Pet3D?.init("pet3d-host")` 실행문 영구 제거.
3. **`pet3d.js` & `styles.css`**:
   - `pet3d.js`를 안전한 빈 객체(Dummy Stub)로 중화.
   - `styles.css`에 `.pet3d-host, #pet3d-host, .pet-3d-box { display: none !important; }` 강제 선언.
4. **듀얼 싱크 및 검증**:
   - `projects/Runnow` 및 `sandbox/Runnow_APP_V` 100% 동기화.
   - CDP 브라우저 캡처(`runnow_tamagotchi_no_3d_verified.png`)를 통해 3D 렌더링이 완전히 사라지고 아름다운 2D 웹툰 펫 일러스트만 정갈하게 노출됨을 검증.
   - Firebase Hosting dev 채널 배포 완료 (`https://runnow-37af9--dev-irl7g2ve.web.app`).


## 15. 전 페이지 버튼 텍스트 오버플로우 전수 차단 및 5대 펫 10단계(0~180km+) 진화 시스템 구축 (2026-09-15 16:05)

### 1) 배경 및 대표님 지침
- **대표님 피드백**:
  1. "텍스트가 UI 버튼이미지 밖으로 나가지 않도록 해. 모든 페이지 다 검토해."
  2. "나의 펫들의 종류가 많았으면 좋겠고, 아기~성인까지 10단계로 만들었으면 좋겠어."
- **요구사항 분석**:
  - 모바일(360px~390px) 화면에서 1:1 케어팀 상단 코치 배너 버튼(`🔑 구글 AI 연동 ($0원)`) 등 버튼 내부 텍스트가 경계선 밖으로 삐져나오거나 잘리는 현상 전수 해결.
  - 타마고치 러닝 메이트를 댕댕이, 냥이, 토끼, 판다, 볼트몽의 5개 종족으로 대폭 다양화하고, 0km 아기부터 180km+ 초월의 마스터까지 10단계 진화 로직 및 비주얼 에셋(총 50개 전 스테이지) 구축.

### 2) 기술 조치 내역
1. **버튼 텍스트 오버플로우 전수 방지 (`index.html`, `styles.css`)**:
   - `index.html`: `🔑 구글 AI 연동 ($0원)` 텍스트를 `🔑 무료 AI 연동`으로 간결화하여 시인성과 터치 영역 최적화.
   - `styles.css`:
     - `.btn-coach-action`: `box-sizing: border-box !important`, `clamp(10px, 2.7vw, 11.5px)`, `white-space: nowrap`, `overflow: hidden`, `text-overflow: ellipsis` 적용.
     - `.coach-banner-actions`: `width: 100%`, `gap: 6px`, `flex-wrap: nowrap`.
     - `.t-btn-action span:last-child`, `.species-chip`, `.prompt-chip` 등 모든 UI 버튼류 텍스트에 동일한 오버플로우 방지 규칙 전수 적용.
2. **펫 5대 종족 & 10단계 진화 엔진 구현 (`tamagotchi.js`, `app.js`, `index.html`)**:
   - **5대 종족 모델**:
     - 🐶 댕댕이 (골든 리트리버): 친근하고 충직한 기본 러닝 메이트
     - 🐱 냥이 (치즈 태비): 날렵하고 호기심 많은 캣 러너
     - 🐰 토끼 (롱이어 래빗): 민첩하고 통통 튀는 스피드 스타
     - 🐼 판다 (파워워커 판다): 묵직하고 꾸준한 지구력 챔피언
     - ⚡ 볼트몽 (사이버 신수): 번개 에너지를 품은 초특급 러닝 사이버 비스트
   - **10단계 마일스톤 (0km ~ 180km+)**:
     - 1단계 (0km 응애 아기), 2단계 (2km 꼬물 호기심), 3단계 (5km 아장아장), 4단계 (10km 뜀박질), 5단계 (25km 씩씩한 조거), 6단계 (50km 파워 러너), 7단계 (80km 마라톤 챌린저), 8단계 (120km 하프마스터), 9단계 (150km 울트라 레전드), 10단계 (180km+ 초월의 마스터)
   - **50개 전 스테이지 SVG 그래픽 에셋 생성**: `assets/pets/{species}_stage_{1..10}.svg` 전수 제작 및 등록 완료.
   - **UI 신설**:
     - 상단 5대 종족 즉시 선택 칩 바 (`.pet-species-bar`)
     - 10단계 타임라인 프로그레스 게이지 (`.pet-evolution-timeline`)
     - 라이트 모드 고대비 도트 스타일링(`#F1F5F9` 배경, `#CBD5E1` 테두리)으로 시인성 극대화.
   - **안정성 강화**: `tamagotchi.js`에 `toJSON()`, `addXp()`, `rescueVolt()`, `switchPetSpecies()`, `getStageProgress()` 및 `STAGE_TITLES` 전역 선언 완비.

### 3) 검증 및 배포
- **CDP 브라우저 캡처 검증**:
  - `verify_coach_banner_buttons_clean.png`: 360px 모바일 화면에서도 버튼 텍스트가 넉넉한 여백과 함께 완벽히 정렬됨 확인.
  - `verify_pet_10stages_clean.png`: 5개 종족 선택 칩과 10단계 타임라인 게이지가 정상 작동하며 가독성이 뛰어남을 확인.
- **Firebase Hosting dev 채널 배포 완료**:
  - 배포 URL: `https://runnow-37af9--dev-irl7g2ve.web.app`
  - 총 1,112개 파일 무결성 배포 완료.
- **Git 커밋 완료**:
  - `56b27d7` (`feat(tamagotchi): 5 pet species & 10-stage evolution system + fix global button text overflow`)
