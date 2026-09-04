# RUNNOW AI 모션 인식 안정화 체크리스트

작업일: 2026-09-04 / 대상: `motionTracker.js`, `app.js`, `index.html`, `styles.css`

## Phase 1. 카운트 오작동 근본 원인 제거
- [x] 1-1. 준비(Calibration) 페이즈 도입 — 카메라 시작 직후 카운트 금지 → 검증: 카메라 켜고 서 있기만 할 때 rep 0 유지
- [x] 1-2. 3-2-1 카운트다운 후 `counting` 진입 → 검증: 카운트다운 종료 시점부터 타이머/칼로리 시작
- [x] 1-3. 윗몸일으키기 즉시 1회 버그 수정 (초기 state="up" + 서 있을 때 각도 170 >= 130 → 즉발 rep) → 검증: 시작 직후 rep 0
- [x] 1-4. 첫 rep은 반드시 "수축 → 신전" 전체 사이클을 관측한 뒤에만 인정 → 검증: 중간 자세에서 시작해도 오카운트 없음

## Phase 2. 인식 정확도 향상
- [x] 2-1. 랜드마크 visibility 게이팅 (필요 관절 미검출 시 판정 중단) → 검증: 하반신 프레임 아웃 시 카운트 정지 + 안내 문구
- [x] 2-2. 좌/우 관절 visibility 가중 선택 (측면 촬영 시 가려진 쪽 평균 오염 제거)
- [x] 2-3. 각도 EMA 스무딩 (프레임 지터 제거)
- [x] 2-4. rep 최소 간격(디바운스) + 수축 최소 유지시간 → 검증: 빠르게 흔들어도 중복 카운트 없음
- [x] 2-5. 미사용 `lastRepTimestamp` 실제 사용

## Phase 3. 난이도 3단계 (초보자 / 중급자 / 단련자)
- [x] 3-1. `DIFFICULTY_LEVELS` 정의 + 운동별 기준 ROM(`rom`) 정의
- [x] 3-2. 난이도별 가동범위 오프셋 / visibility / 디바운스 / 준비시간 / 폼 엄격도 적용
- [x] 3-3. index.html 난이도 선택 칩 UI + 설명 문구
- [x] 3-4. localStorage 저장·복원 (`RUNNOW_MOTION_LEVEL`)
- [x] 3-5. 난이도별 보상 배율을 `getWorkoutSummary`에 반영

## Phase 4. 안정화 / 최적화
- [x] 4-1. 생성자 중복 필드 정리 (`poseLandmarker`, `poseDetector` 이중 선언)
- [x] 4-2. 피드백 콜백 스로틀 (매 프레임 TTS 호출 폭주 제거)
- [x] 4-3. `emitLiveState` 스로틀 (30fps DOM 쓰기 → 10fps)
- [x] 4-4. 일시정지 후 이어하기 시 rAF 루프 중복 실행 방지
- [x] 4-5. `plankHoldStart` 초기화 누락 수정
- [x] 4-6. `ctx.roundRect` 미지원 브라우저 폴백

## Phase 5. 검증
- [x] 5-1. 전 파일 ES 모듈 문법 검사 통과 (`node --check`)
- [x] 5-2. 신규/변경 식별자가 HTML·JS 양쪽에 모두 존재하는지 대조
- [x] 5-3. 커밋

## 검증 결과 (2026-09-04)
`npm test` → `tests/motionTracker.test.mjs` 16개 항목 전부 통과.
브라우저 스모크: 모듈 로드 시 신규 콘솔 에러 없음, 난이도 칩 3개 렌더 / 클릭 전환 /
`RUNNOW_MOTION_LEVEL` localStorage 저장까지 실제 페이지에서 확인.

## 남은 이슈 (이번 범위 밖)
- `workout.html`(596줄)은 어떤 파일도 참조하지 않는 고아 파일입니다. 삭제 여부는 미결정.
- 실제 카메라 앞 실사용 튜닝(난이도별 오프셋 수치)은 기기 테스트 후 조정이 필요합니다.
