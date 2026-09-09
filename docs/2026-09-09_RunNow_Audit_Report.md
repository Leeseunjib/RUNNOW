# RUNNOW 전면 감사 보고서

- 감사일: 2026-09-09
- 대상: `develop` 브랜치 (HEAD `e52e6b3`) 및 내부테스트 채널 `runnow-37af9--dev-irl7g2ve.web.app`
- 근거: 배포 헌장(`.agents/rules/runnow_deployment_rules.md`), 소스 정적 분석, 배포본 원격 검사

---

## 1. 종합 판정

| 영역 | 판정 | 근거 |
|---|---|---|
| 광고 격리 (제2조 2항) | ✅ 충족 (헌장 초과 달성) | 테스트 환경에서 AdSense 스크립트 미로드 |
| AI의 상용 배포 금지 (제3조) | ✅ 준수 | `promote:live` 미실행 |
| 배포본 코드 동기화 | ✅ 정상 | 검증 완료 수정 전부 반영 |
| 자동 테스트 | ✅ 292건 통과 | 8개 스위트 |
| **인프라 격리 (제1조 1항)** | ❌ **미달** | 단일 Firebase 프로젝트, Firestore·Auth 공유 |
| **결제 서버 검증** | ❌ **미배포** | Cloud Functions 4개 전부 접근 불가 |
| 런타임 오류 | ⚠️ 상시 404 1건 | 미사용 스크립트 태그 |

---

## 2. 측정 기준선

이후 작업의 증감을 이 수치와 비교합니다.

### 2.1 자동 테스트
| 스위트 | 건수 |
|---|---|
| motionTracker | 68 |
| tamagotchi | 60 |
| quests | 39 |
| challenge | 36 |
| metrics | 31 |
| gpsRunner | 21 |
| paymentSecurity | 20 |
| subscriptionManager | 17 |
| **합계** | **292** |

### 2.2 소스 규모와 검증 커버리지
| 구분 | 줄 수 | 비중 |
|---|---|---|
| 테스트가 있는 모듈 | 4,590 | 52% |
| 테스트가 없는 모듈 | 4,311 | 48% |
| JS 합계 | 8,901 | 100% |

미검증 모듈: `app.js`(3,318) `catalog.js`(252) `firebaseClient.js`(247)
`motionSound.js`(201) `paypalBridge.js`(168) `firebaseSandbox.js`(125)

그 외 `index.html` 1,574줄, `styles.css` 2,949줄.

---

## 3. 발견 사항

### 🔴 P0-1. 인프라가 물리적으로 격리되어 있지 않음

헌장 제1조 1항은 인프라 레벨 100% 격리를 요구하나, `.firebaserc`의 프로젝트는
`runnow-37af9` 하나입니다.

| 항목 | 격리 여부 |
|---|---|
| 호스팅 URL·오리진 | 격리됨 |
| localStorage·서비스워커 캐시 | 격리됨 (오리진이 다름) |
| Git 브랜치 | 격리됨 |
| **Firestore 데이터베이스** | **공유** |
| **Auth 사용자 풀** | **공유** |
| Cloud Functions | 공유 (배포 시) |

내부 테스터의 러닝 기록·펫 데이터·구독 상태가 상용 DB에 그대로 기록됩니다.
상용 출시 후에는 실사용자 데이터와 섞여 분리가 어려워집니다.

**지금이 분리 비용이 가장 낮은 시점입니다.** 실사용자가 없어 마이그레이션이 불필요합니다.

조치 방향
1. Firebase 콘솔에서 `runnow-dev` 프로젝트 신규 생성 (대표님 계정 작업)
2. `firebaseConfig.js`를 호스트명 기준으로 dev/prod 설정 분기
3. `.firebaserc`에 `dev` 별칭 추가 후 `deploy:dev`가 dev 프로젝트를 향하도록 수정

### 🔴 P0-2. 결제 서버 검증 미배포

`createPaypalOrder` / `capturePaypalOrder` / `getMySubscription` / `paypalWebhook`
4개 모두 브라우저에서 접근 불가이며 `firebase functions:list`도 실패합니다.
Blaze 전환이 선행되지 않은 것으로 보입니다.

현재 헌장 제2조 3항(실제 청구 0원)은 **결과적으로 충족**되어 있으나, 이는 안전장치가
작동해서가 아니라 `paypalBridge.js`가 시뮬레이션이라 결제 기능 자체가 없기 때문입니다.
상용 승급 시점에 결제가 동작하지 않습니다.

선행 조건은 `functions/README.md`에 정리되어 있습니다.

### 🟠 P1. 매 로드마다 404가 발생하는 미사용 스크립트

`index.html:80`
```html
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@0.4/camera_utils.js"></script>
```

- jsdelivr 응답: **HTTP 404**, `Content-Type: text/plain` (curl 확인)
- 브라우저가 MIME 오류를 추가로 발생시킴
- `camera_utils`는 코드에서 전혀 사용되지 않음 (`motionTracker.js`는 `window.Pose`만 사용)
- 같은 줄의 `pose.js`는 HTTP 200 정상

기능 영향은 없으나 콘솔에 상시 에러가 남아 **실기기 테스트 시 진짜 오류를 가립니다.**

### 🟡 P2. 고아 파일

`workout.html` 596줄이 어떤 파일에서도 참조되지 않습니다. 실제 경로는
`index.html` 내부의 모션 스튜디오입니다.

---

## 4. 정상 확인된 항목

### 광고 격리는 헌장보다 강하게 구현됨
헌장은 `data-adtest="on"` 테스트 모드를 요구하나, 실제로는 테스트 환경에서
AdSense 스크립트를 **아예 로드하지 않습니다**(`index.html:56` 인라인 가드).
배포된 dev 채널에서 `광고스크립트_로드됨: false`를 직접 확인했습니다.

`app.js`의 `data-adtest` 주입 로직은 상용 도메인 접속 테스터를 위한 2차 방어선으로
유지되어 이중 방어를 구성합니다.

### 배포본이 검증 코드와 일치
dev 채널에서 원격 확인한 항목입니다.

| 수정 내용 | 배포 반영 |
|---|---|
| 챌린지 스트릭 만료(`getCurrentStreak`) | ✅ |
| 다마고치 쿨다운(`ACTION_COOLDOWNS`) | ✅ |
| GPS 정확도 필터(`MAX_ACCURACY_M`) | ✅ |
| 운동자 잠금(`SUBJECT_MATCH_TOLERANCE`) | ✅ |
| AI 폼 리포트(`buildFormReport`) | ✅ |
| 순수 계산 분리(`metrics.js`) | ✅ |

---

## 5. 권고 순서

1. **P1 죽은 스크립트 제거** — 즉시 가능, 실기기 테스트 전에 콘솔을 깨끗하게
2. **P0-1 프로젝트 분리** — 실사용자 유입 전에 완료해야 비용이 0
3. **실기기 테스트** — AI 운동 6종, 야외 러닝, 쿨다운 체감
4. **P0-2 Blaze 전환 후 결제 배포** — 상용 승급 전 필수

P0 두 건은 대표님 계정 작업(프로젝트 생성, 요금제 전환)이 선행되어야 하므로
AI가 단독으로 진행할 수 없습니다.
