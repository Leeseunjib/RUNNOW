# RUNNOW 결제 검증 Cloud Functions 배포 가이드

구독 권한은 **PayPal이 결제 완료를 확인해 준 뒤에만 서버가 부여**합니다.
클라이언트는 `subscriptions` 문서를 읽기만 하고 쓰지 못합니다(`firestore.rules`).

---

## ⚠️ 먼저 확인해야 할 두 가지

### 1. Firebase 요금제를 Blaze로 올려야 합니다

현재 프로젝트는 Spark(무료)입니다. **Spark 플랜에서는 Cloud Functions가 외부
네트워크를 호출할 수 없어 PayPal API를 부를 수 없습니다.**

Blaze는 종량제이며 무료 할당량이 있어 초기 트래픽에서는 대개 청구가 발생하지
않지만, **유료 플랜 전환 자체는 대표님이 직접 결정하고 진행하셔야 합니다.**

> Firebase 콘솔 → 프로젝트 설정 → 요금제 → Blaze로 업그레이드

### 2. PayPal 자격증명이 필요합니다

PayPal 개발자 대시보드에서 앱을 만들고 **Client ID / Secret**을 발급받으세요.
저는 이 값을 볼 수도, 대신 입력할 수도 없습니다. 아래 명령을 대표님이 직접 실행하셔야 합니다.

---

## 배포 절차

```bash
cd functions
npm install
```

시크릿 등록 (명령 실행 후 값을 입력하는 방식이라 파일에 남지 않습니다):

```bash
firebase functions:secrets:set PAYPAL_CLIENT_ID
firebase functions:secrets:set PAYPAL_SECRET
firebase functions:secrets:set PAYPAL_WEBHOOK_ID
```

샌드박스/실서버 전환은 환경변수로 합니다. 처음에는 반드시 `sandbox`로 테스트하세요.

```bash
firebase functions:config:set paypal.env="sandbox"
```

배포:

```bash
firebase deploy --only functions,firestore:rules
```

---

## PayPal 웹훅 등록

배포 후 출력되는 `paypalWebhook` URL을 PayPal 개발자 대시보드의 Webhooks에 등록하고,
아래 이벤트를 구독하세요. 환불·분쟁 시 구독이 자동 해지됩니다.

- `PAYMENT.CAPTURE.REFUNDED`
- `PAYMENT.CAPTURE.REVERSED`
- `PAYMENT.CAPTURE.DENIED`
- `BILLING.SUBSCRIPTION.CANCELLED`
- `BILLING.SUBSCRIPTION.EXPIRED`

등록하면 발급되는 **Webhook ID**를 위 `PAYPAL_WEBHOOK_ID` 시크릿에 넣으세요.

---

## 서버가 검증하는 것

| 검증 항목 | 막는 공격 |
|---|---|
| 로그인 여부 (`request.auth`) | 비로그인 상태의 무단 호출 |
| 금액을 서버 정본(`plans.js`)에서만 조회 | 클라이언트가 1센트로 조작해 PRO 구매 |
| 캡처 응답의 `status === "COMPLETED"` | 미결제 주문으로 권한 획득 |
| 결제 금액·통화가 상품과 일치 | 다른 통화·소액 결제로 우회 |
| 주문 소유자 uid 대조 | 타인의 결제로 내 계정 업그레이드 |
| 캡처된 주문 재사용 차단 | 1회 결제로 구독 무한 연장 |
| 웹훅 서명 검증 | 위조 이벤트로 타인 구독 해지 |

## 서버 검증으로도 막지 못하는 것

AI 모션 인식은 **기기에서 실행**되므로, 결제와 무관하게 클라이언트 코드를 고치면
화면 잠금 자체는 우회할 수 있습니다. 이는 온디바이스 구조의 본질적 한계입니다.

서버 검증이 실제로 보장하는 것은 다음입니다.

- 결제가 실제로 일어났고 금액이 정확하다
- 구독 상태가 위조·동기화되지 않는다 (기기를 바꿔도 서버 값이 정본)
- 환불·분쟁 시 권한이 회수된다

콘텐츠 자체를 보호하려면 서버 렌더링이나 스트리밍이 필요하며, 이는 온디바이스
$0 서버비 전략과 상충합니다. 현재 구조에서는 **결제 무결성 확보가 실질적인 목표**입니다.
