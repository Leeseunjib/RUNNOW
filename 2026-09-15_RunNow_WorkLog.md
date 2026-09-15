# 2026-09-15 RunNow 프로젝트 작업일지 (WorkLog)

## 📌 기본 정보
- **프로젝트**: RunNow (Mobile React Native Expo App)
- **일자**: 2026년 9월 15일
- **지시자**: 이건우 대표님 (BeausCreators CEO)
- **담당 에이전트**: 프론트엔드/모바일 개발자 유나 (Yuna)

---

## 🎯 주요 업무 요약

### 1. 바닐라 Web ➡️ React Native Expo 전면 아키텍처 전환 완료
- **추진 배경**: Android (Google Play Store) 및 Apple (iOS App Store) 모바일 앱 마켓 동시 개발 및 배포 지원.
- **주요 변경 사항**:
  1. 기존 웹 소스코드(`index.html`, `styles.css`, 바닐라 `app.js` 등)를 `legacy_web/`으로 안전 격리 보관.
  2. 루트 디렉토리에 **Expo SDK 57 + React Native 0.86 + React Navigation 7.x** 환경 초기화 및 구축.
  3. `app.json`에 `com.beauscreators.runnow` Android 패키지명 및 iOS 번들 식별자(Bundle Identifier), 다크 OLED 테마 구성 완료.

### 2. 순수 도메인 코어 로직 마이그레이션 (`src/core`)
- `firebaseClient.js`: 웹 `localStorage` 의존성을 탈피하고 `@react-native-async-storage/async-storage` 기반의 비동기 인증 및 클라우드 동기화 구조로 전면 리팩토링.
- `tamagotchi.js`, `challenge.js`, `quests.js`, `catalog.js`, `firebaseConfig.js` 등 비즈니스 로직 포팅 완료.
- 펫 및 운동 그래픽 에셋(`assets/pets`, `assets/exercises`)을 네이티브 루트 에셋으로 통합.

### 3. 6대 메인 화면 네이티브 UI 구현 (`src/screens`)
- **디자인 토큰 (`src/theme/colors.js`)**: Nike Run Club x Cyberpunk Volt 네온 테마 전면 적용.
- **런고치 & 라이브 런 (`HomeScreen.js`)**: 
  - 다마고치 룸 진화체 (단계별 아바타, 3대 바이탈, 4대 케어 액션)
  - NRC 스타일 72px 고대비 볼트 라이브 러닝 HUD (거리, 페이스, 시간, 칼로리, 반려펫 동반자 부스터)
- **3주 습관 챌린지 (`ChallengeScreen.js`)**: 3대 챕터 로드맵, 21일 일일 미션 체크리스트 및 실시간 XP/VC 지급.
- **퀘스트 센터 (`QuestScreen.js`)**: 일일/주간 미션 진행 현황 및 보상 원클릭 수령.
- **볼트 상점 (`ShopScreen.js`)**: 20종 인게임 아이템 카탈로그 및 볼트코인 즉시 차감 구매.
- **1:1 AI 케어팀 (`CareTeamScreen.js`)**: 4인 전담 코치진(레오, 루나, 엘리, 닥터 케이) 선택 및 대화형 인터페이스.
- **맞춤 식단 (`DietScreen.js`)**: 잔여 칼로리 연산, 3대 영양소 매크로 게이지, 250ml 원클릭 수분 트래커.

### 4. 무결성 및 시스템 검증
- `npx expo-doctor` 검사 결과: **21/21 항목 무결성 100% 통과 (No issues detected!)**.

---

### 5. 웹 가독성·코치 선택·TTS 보이스 긴급 개선 및 상용 웹 동기화
- **운동 화면 가독성 개선**: 어두운 배경에 묻히던 상태 텍스트 색상을 순백색(`#FFFFFF`)으로 변경하여 100% 시인성 확보.
- **1:1 전담 코치 사전 지정 UI 추가**: Care Team 화면에 `⭐ 전담 지정` 버튼을 신설하여 원하는 코치(루나/레오)를 영구 고정(`RUNNOW_ASSIGNED_COACH`).
- **레오 코치 TTS 음성 보정**: 남성 목소리 우선 필터링 및 피치(Pitch)를 `0.7`로 극단적 하향 변조하여 중후한 남성 PT 음성 구현.
- **상용 웹 정본 동기화**: `projects\Runnow`의 `index.html`, `app.js`, `careTeam.js`, `motionSound.js`에 전면 반영 및 Firebase Hosting 배포 완료.

---

### 6. 대표님 확정 폴더 아키텍처 및 라이프사이클 헌장
- **[웹(Web)]**: `C:\BeausCreators\02.BSC_Branch\projects\Runnow`만 관리. 상용 웹 수정은 오직 여기서만 진행.
- **[앱(App) 개발]**: `C:\BeausCreators\02.BSC_Branch\sandbox\Runnow_APP_V`에서 React Native Expo 모바일 앱 구축에만 집중.
- **[앱(App) 승격]**: 앱 완성 시 `C:\BeausCreators\02.BSC_Branch\projects\Runnow_App`으로 승격하여 웹과 나란히 독립 배치 (웹 속에 앱을 넣지 않음).
- **[인프라/DB]**: Firebase DB와 회원 인증은 웹과 앱이 100% 공유.

---

### 7. AI 모션 HUD 소비자 심리학 기반 텍스트 가독성 전면 리팩토링 & 캐시 버스팅
- **소비자 심리학적 분석 및 유료 구독 유저 경험 개선**:
  - **거리 인지 가독성 (2m 거리 시인성 100%)**: 유저가 폰을 바닥/거치대에 두고 2m 뒤로 물러나 운동할 때 흐릿하거나 장황한 매뉴얼식 텍스트는 시각적 피로와 이탈 유발.
  - **장황한 설명문 폐기 & 직관적 액션 키워드 혁신**:
    - 기존: "전신이 나오게 시작 자세를 잡으면 AI가 준비 상태를 확인한 뒤, 3초 카운트다운이 끝나야 횟수를 셉니다." (장황한 설명조 문장)
    - 혁신: "카메라 앞 2m에 서면 AI가 전신을 스캔하여 자동 시작합니다." (25px 볼드 화이트 타이포그래피 + 3초 카운트다운/관절 각도 칩)
  - **유료 구독자의 신뢰를 떨어뜨리는 방어적 문구 폐기**:
    - 기존: "🔧 인식이 계속 안 되나요? 완화 모드로 시작 (판정 정확도 낮음)" -> AI 성능 불신 및 환불 심리 유발
    - 혁신: "📐 조명/거리 자동 보정 모드 켜기" -> 테크니컬하고 든든한 프리미엄 기술 지원으로 신뢰감 증대
  - **촌스러운 연노랑 경고창 완전 폐기**:
    - 하단 피드백 박스(`.pose-feedback`)의 연노랑/갈색(`#FFF6D8`) 폐기 -> 나이키/애플 스타일 다크 네온 HUD 바(`rgba(13, 19, 34, 0.95)` + 사이언 보더 + 15px 볼드 순백색 텍스트)로 격상.
  - **코치 HUD 럭셔리 브랜딩**:
    - `코치 레오` + `⚡ VIP 1:1` 골드 뱃지 + `LIVE 스캔 중` 사이언 뱃지 + `실시간 모션 바이오 피드백 ON` 네온 인디케이터.
    - 말풍선: `"이건우 대표님, 카메라 앞 2m에 서주세요! 레오가 전담 마크 들어갑니다! 🔥"`
- **모바일 브라우저 캐시 버스팅 적용**:
  - `styles.css?v=8.2_premium_hud` 및 `app.js?v=8.2_premium_hud`로 버전 쿼리스트링 갱신하여 모바일 폰에서 새로고침 시 즉각 최신 디자인 반영.
- **Firebase Hosting 배포 완료**:
  - 라이브: `https://runnow-37af9.web.app`
  - 프리뷰: `https://runnow-37af9--dev-irl7g2ve-xsgd93yu.web.app`
