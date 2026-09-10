# 2026-09-10 RUNNOW 프로젝트 작업일지

- **작업 일자**: 2026-09-10
- **수행자**: BSC 개발팀 (CTO 거누, 수석 디자이너 시안)
- **책임자**: 이건우 대표님 (CEO)
- **대상 워크스페이스**: `c:\BeausCreators\03.Research\바이브코딩 연구\Test_proj\proj_01` (Git Branch: `develop`)

---

## 1. 주요 작업 개요
대표님의 지시에 따라 다음 3대 핵심 과제를 수행 완료하였습니다:
1. **게스트 모드 완전 제거**: Google 및 이메일 정규 가입자 전용 전환.
2. **소비자 심리학 및 100M 프리미엄 UI/UX 정돈**:
   - `← 운동 목록` 브라우저 기본 회색 네모 버튼을 애플/토스 감성의 알약형 뒤로가기 버튼으로 전면 개편.
   - 로그인 첫 화면의 불필요한 '러닝 사이언스 가이드' 설명문 및 투박한 회색 박스 2개를 전면 제거하고 미니멀 공식 푸터로 정돈.
3. **단일 프로젝트 환경 내 데이터 격리 (Smart Namespace Prefix) 구축**:
   - 추가 Firebase 프로젝트 생성 없이, 접속 도메인(`localhost`, preview dev channel)에 따라 자동으로 `dev_` 컬렉션에 분기 저장하는 아키텍처 완성.

---

## 2. 세부 변경 내역

### A. 게스트 모드 제거 및 정규 회원 체제 강제
- `index.html`: `btn-quick-guest-login` 및 게스트 안내 텍스트 완전 삭제.
- `app.js`: `RUNNOW_DEVICE_GUEST_UID` 및 `guest_runner` 관련 폴백 로직 제거. 세션이 없을 경우 `#view-auth` 강제 노출.
- `firebaseClient.js`: `onAuthStateChanged` 비동기 동기화 및 `uid` 일치 가드를 통해 권한 불일치 콘솔 에러 차단.

### B. UI/UX 및 소비자 심리학 디자인 고도화
- `styles.css`: `.btn-back-exercise-list`, `.subview-header-bar`, `.auth-mascot-img`, `.motion-studio-card` 등 16종 미반영 스타일 완벽 구현.
- `index.html`:
  - 뒤로가기 버튼에 글래스모피즘 알약 디자인 적용.
  - 로그인 뷰에 사회적 증명("오늘 8,420명의 러너가 함께 달렸습니다") 및 클라우드 자동 백업 안도감 배지 배치.
  - 하단 `auth-seo-guide`의 군더더기 회색 팁 박스를 걷어내고 초미니멀 법적 푸터(서비스 소개, 이용약관, 개인정보처리방침)로 정돈하여 전환율 최적화.

### C. 데이터 무결성 격리 (Smart Namespace Prefix)
- `firebaseClient.js`:
  - `getCollectionName(baseName)`: 로컬 및 dev 채널 접속 시 `dev_` 접두사를 자동 부여하여 `dev_users`, `dev_workouts`, `dev_tamagotchi`, `dev_challenges_progress`로 분기.
  - `isDevMode()` 및 `env: "dev"|"prod"` 메타데이터 자동 주입.
- `firestore.rules`:
  - `dev_users`, `dev_tamagotchi`, `dev_challenges_progress`, `dev_workouts`에 대한 소유자 검증 보안 규칙 동기화.
  - 상용 데이터 오염 0% 달성 및 관리 포인트 단일화.

### D. 보상형 광고 배너(BM) 세련화 및 전수 페이지 프리미엄 UI 개편
- `styles.css`:
  - 촌스러운 다크 하드코딩과 점선 테두리를 걷어내고, 테마에 반응하는 토스/애플 감성의 **'데일리 스폰서 보너스' 리워드 카드**로 전면 리디자인 (부드러운 라운딩, 좌측 악센트 바, 알약 버튼).
  - Primary 버튼(`.btn-primary-volt`) 및 Secondary 버튼(`.btn-secondary`)에 Spring Physics (`scale(0.975)`), 고품격 섀도우, 15px 고딕 볼드 타이포 적용.
  - 퀘스트 마스터 5버튼 탭(`.quest-master-tabs`), 필터 칩(`.filter-chip`, `.target-chip`), 다마고치 액션 버튼(`.t-btn-action`), 온보딩 목표 카드(`.ob-goal-card`), 펫 선택 카드(`.ps-card`) 전수 고도화.
  - GPS 러너의 메트릭 서클 및 3대 HUD(페이스, 시간, 칼로리) 타이포그래피를 NRC 감성의 대형 폰트와 타뷸라 넘버로 최적화.
- `index.html`:
  - CSS 캐시 버스팅을 `styles.css?v=7.0`으로 갱신하여 최신 디자인 강제 반영.
  - 리워드 카드 카피를 '데일리 스폰서 보너스 (+10 VC)'로 세련되게 정돈.

### E. 색상 테마 설정을 상단 헤더에서 '설정 창' 내부로 이동
- `index.html`:
  - 상단 고정 헤더 아래에 노출되어 시야를 가리던 `theme-selector-bar`를 완전 제거.
  - 설정 탭(`section#tab-profile`) 내부에 토스 스타일의 **`🎨 색상 테마 설정 [개인화]`** 전용 패널을 신설하여 4대 테마 버튼을 배치.
- `styles.css`:
  - `theme-selector-bar`를 헤더 고정형이 아닌 설정 패널 내부 플렉스 버튼 그룹으로 최적화.

---

### F. 운동 카탈로그 7종 정석 실사 이미지 전면 재생성 및 교체
- `assets/exercises/`:
  - 기존의 중복 및 부정확한 사진(플랭크/싯업 중복, 스쿼트/런지 헬스장 빈 기구 중복, 점핑잭 바벨 플레이트)을 `backup_old/`에 안전하게 보존.
  - 실제 운동 자세에 100% 부합하는 4K 화보급 정석 실사 이미지 7종 생성 및 교체:
    1. `run.jpg`: 야외 트랙에서 힘차게 앞으로 달리는 정석 러닝 사진
    2. `pushup.jpg`: 매트 위에서 팔꿈치 90도 수축, 전신 일직선 정석 푸시업 사진
    3. `situp.jpg`: 매트 위에서 무릎을 세우고 복근을 정확히 수축하는 정석 싯업/크런치 사진
    4. `squat.jpg`: 허벅지 수평, 가슴을 펴고 팔을 뻗은 완벽한 정석 90도 딥 스쿼트 사진
    5. `plank.jpg`: 팔꿈치를 대고 머리부터 발끝까지 수평 코어를 유지하는 정석 엘보우 플랭크 사진
    6. `lunge.jpg`: 앞무릎 90도, 뒷무릎 하강의 밸런스 잡힌 정석 프론트 런지 사진
    7. `jumpingjack.jpg`: 점프하여 양팔 V자 overhead, 다리 벌린 역동적 정석 점핑잭 사진
- `index.html`:
  - 운동 카탈로그 이미지 태그 7종에 브라우저 캐시 방지 파라미터 `?v=2.0` 주입 완료.

---

## 3. 검증 결과
- **단위 테스트**: `npm test` 8종 테스트 스위트 100% ALL PASS.
- **실제 배포 채널 검증**: Firebase Hosting dev 채널(`https://runnow-37af9--dev-irl7g2ve.web.app`) 배포 후:
  - 상단 헤더 영역에서 테마 바가 완전히 사라져 광활한 뷰포트 확보(`top_header_no_theme_bar_1789020744864.png`).
  - 설정 탭 내 `🎨 색상 테마 설정` 패널에서 4대 테마 버튼이 완벽하게 렌더링 및 작동하는 것 검증 완료(`theme_settings_panel_1789020773988.png`).
  - 운동 카탈로그 상단 4종(러닝, 푸시업, 싯업, 스쿼트) 실사 이미지 매칭 검증 완료(`exercise_catalog_top_1789021573880.png`).
  - 운동 카탈로그 하단 3종(플랭크, 런지, 점핑잭) 실사 이미지 매칭 검증 완료(`exercise_catalog_bottom_1789021592299.png`).

---

## 4. 향후 과제
- 대표님 피드백에 따른 추가 뷰(대시보드, 운동 상세) 미세 디테일 지속 다듬기.

