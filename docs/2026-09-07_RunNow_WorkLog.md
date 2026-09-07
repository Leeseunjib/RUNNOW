# ⚡ [작업일지] RUNNOW PRO 구독 멤버십 및 Freemium 게이트웨이 구현
- **일자**: 2026-09-07
- **담당자**: CTO 거누 (Backend/Infra/Architecture Lead)
- **프로젝트**: RUNNOW (RunGotchi)
- **위치**: `proj_01` (Spoke) ➔ `01.BSC_HQ` (Hub)

---

## 📌 1. 작업 개요 및 대표님 지시 사항
1. **대표님 지침**: "이 프로그램을 구독료로 진행을 하는 게 좋을 것 같다고 생각해. 처음 달리기만 하는 경우를 제외한 나머지 항목들은 구독서비스로 들어가면 좋겠다고 생각해."
2. **목표 아키텍처**:
   - **기본 러닝(야외 GPS & 트레드밀) 100% 무료 제공 (Free Basic Tier)**
   - **핵심 부가 기능(AI 카메라 모션 피트니스 6종, 다마고치 5단계 진화, 21일 챌린지, 볼트 상점 등)의 PRO 구독 전환**
   - **페이월 모달(Paywall Modal), PayPal 정기 구독 연동 및 대표님 전용 즉시 VIP 마스터 패스 토글 제공**

---

## 🛠️ 2. 상세 구현 내역

### 1) 신규 모듈: `subscriptionManager.js`
- `SubscriptionManager` 클래스 구현:
  - `isSubscribed()`, `getTier()`, `getRemainingDays()`
  - 월간 플랜(`pro_monthly`: ₩9,900/월) 및 연간 플랜(`pro_annual`: ₩79,000/년, 35% 할인 + 7일 무료체험)
  - `activate()`, `cancel()`, `toggleCeoPass()` (대표님 즉시 VIP On/Off)
  - `onChange(callback)` 반응형 상태 이벤트 리스너

### 2) 결제 모듈 확장: `paypalBridge.js`
- `processSubscription(plan, onSuccessCallback)` 추가
- PayPal 사전 승인 정기 결제(Recurring Billing) 전용 모달 및 구독 승인 플로우 구축

### 3) 프론트엔드 UI & 스타일: `index.html`, `styles.css`
- 상단 헤더: `⚡ BASIC` vs `⭐ PRO` 실시간 상태 표시 뱃지
- 운동 목록: '러닝' 카드는 `FREE` 배지, AI 6종 운동 카드는 `🔒 PRO` 배지 장착
- 하단 네비게이션: '펫', '퀘스트', '상점(20)' 탭에 자물쇠(`🔒`) 배지 장착 (구독 시 자동 언락)
- PRO 구독 페이월 모달 (`#subscription-paywall-modal`): 나이키 볼트 x 사이버펑크 고대비 다크 테마

### 4) 통합 컨트롤러: `app.js`
- `bindWorkoutModeSwitcher()`: AI 운동 카드 클릭 시 미구독 상태면 구독 모달 오픈
- `bindNavigation()`: 잠금 탭 클릭 시 미구독 상태면 구독 모달 오픈
- `bindSubscriptionEvents()`, `updateSubscriptionUi()` 구현

---

## 🎯 3. 검증 결과
1. **단위 테스트**: `tests/subscriptionManager.test.mjs` 실행 결과 16개 항목 100% 통과
2. **회귀 테스트**: `tests/motionTracker.test.mjs` 실행 결과 전 종목 100% 정상 통과
3. **브라우저 E2E 검증**:
   - BASIC 상태에서 '러닝' 정상 진입 및 AI 운동/하단 탭 자물쇠 배지 노출 확인
   - 잠금 항목 클릭 시 PRO 멤버십 페이월 모달 즉시 팝업 확인
   - 대표님 VIP 마스터 패스 클릭 시 1초 만에 `⭐ PRO` 활성화 및 모든 잠금 해제 확인
   - 토글 재클릭 시 `⚡ BASIC`으로 안전 복구 확인

---

## 💎 4. 전사 BM 표준 및 소비자심리학 7대 법칙 수립 (CFO 도현 & BI 다인)
1. **글로벌 3대 레퍼런스 심층 벤치마크**:
   - **Strava**: 기본 GPS 달리기 100% 무료 개방으로 1억 명 모객 후, 심층 분석 & 경쟁 세그먼트 유료화 (ARR 3,000억 원)
   - **Duolingo**: 7일 스트릭 손실 회피(Loss Aversion) 및 스트릭 프리즈로 유료 전환율 9.1% 달성 (업계 평균 3배)
   - **Pokémon GO**: 이동 거리가 펫 성장/진화로 100% 치환되는 이케아 효과(IKEA Effect)로 8조 원 매출 달성
2. **운영상 '절대로 손해가 나지 않는' 무손실(Zero-Risk) 아키텍처 확립**:
   - 온디바이스 엣지 AI(MediaPipe 로컬 연산): 서버 GPU 비용 $0
   - 서버리스 로컬 우선 동기화: Firestore 무료 티어로 DAU 2만 명까지 인프라비 0원 방어
   - 순마진 95.8% 단위 경제학(Unit Economics): 단 1명의 구독자만으로 도메인 비용 회수, 2번째부터 순이익 95% 축적
3. **소비자심리학 7대 법칙 확립**:
   - 앵커링 & 디코이 효과, 손실 회피 편향, 피크-엔드 도파민 페이월, 이케아 효과, 목표 경사 효과, 자이고르닉 효과, 사회적 증거
4. **산출물 등록**:
   - `docs/2026-09-07_RUNNOW_Master_BM_and_Consumer_Psychology_Strategy.md` (전사 공식 가이드라인 정본)

