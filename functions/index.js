// RUNNOW 결제·구독 서버 검증 Cloud Functions
// 핵심 원칙: 구독 권한은 PayPal이 결제 완료를 확인해 준 뒤에만, 서버가 부여합니다.
// 클라이언트는 subscriptions 문서를 읽기만 하고 쓰지 못합니다(firestore.rules 참조).

const { onCall, onRequest, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret, defineString } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

const { getPlan } = require("./plans");
const paypal = require("./paypalClient");

initializeApp();
const db = getFirestore();

const PAYPAL_CLIENT_ID = defineSecret("PAYPAL_CLIENT_ID");
const PAYPAL_SECRET = defineSecret("PAYPAL_SECRET");
const PAYPAL_WEBHOOK_ID = defineSecret("PAYPAL_WEBHOOK_ID");
const PAYPAL_ENV = defineString("PAYPAL_ENV", { default: "sandbox" }); // 'sandbox' | 'live'

const REGION = "asia-northeast3"; // Firestore와 같은 리전

function requireAuth(request) {
  if (!request.auth || !request.auth.uid) {
    throw new HttpsError("unauthenticated", "로그인 후 이용할 수 있습니다.");
  }
  return request.auth.uid;
}

async function paypalToken() {
  return paypal.getAccessToken({
    clientId: PAYPAL_CLIENT_ID.value(),
    secret: PAYPAL_SECRET.value(),
    env: PAYPAL_ENV.value()
  });
}

/**
 * 1) 주문 생성
 * 클라이언트는 planId만 보냅니다. 금액은 서버 정본(plans.js)에서만 가져옵니다.
 * 클라이언트가 보낸 가격을 쓰면 1센트 결제로 PRO를 살 수 있습니다.
 */
exports.createPaypalOrder = onCall(
  { region: REGION, secrets: [PAYPAL_CLIENT_ID, PAYPAL_SECRET] },
  async (request) => {
    const uid = requireAuth(request);
    const planId = request.data && request.data.planId;
    const plan = getPlan(planId);

    if (!plan) {
      throw new HttpsError("invalid-argument", "알 수 없는 구독 상품입니다.");
    }

    const token = await paypalToken();
    const order = await paypal.createOrder({
      token,
      env: PAYPAL_ENV.value(),
      plan,
      referenceId: `${uid}:${plan.id}`
    });

    // 캡처 단계에서 대조할 수 있도록 주문 의도를 서버에 남겨 둡니다.
    await db.collection("payment_orders").doc(order.id).set({
      uid,
      planId: plan.id,
      expectedAmount: plan.priceUSD,
      currency: plan.currency,
      status: "CREATED",
      createdAt: FieldValue.serverTimestamp()
    });

    return { orderId: order.id, status: order.status };
  }
);

/**
 * 2) 결제 캡처 및 구독 부여
 * PayPal 응답의 status·금액·통화를 모두 재검증한 뒤에만 구독을 씁니다.
 * 같은 주문을 두 번 캡처해 구독을 연장하는 재사용 공격도 막습니다.
 */
exports.capturePaypalOrder = onCall(
  { region: REGION, secrets: [PAYPAL_CLIENT_ID, PAYPAL_SECRET] },
  async (request) => {
    const uid = requireAuth(request);
    const orderId = request.data && request.data.orderId;
    if (!orderId || typeof orderId !== "string") {
      throw new HttpsError("invalid-argument", "주문 번호가 필요합니다.");
    }

    const orderRef = db.collection("payment_orders").doc(orderId);
    const orderSnap = await orderRef.get();
    if (!orderSnap.exists) {
      throw new HttpsError("not-found", "존재하지 않는 주문입니다.");
    }

    const orderDoc = orderSnap.data();
    if (orderDoc.uid !== uid) {
      throw new HttpsError("permission-denied", "본인의 주문이 아닙니다.");
    }
    if (orderDoc.status === "CAPTURED") {
      throw new HttpsError("already-exists", "이미 처리된 주문입니다.");
    }

    const plan = getPlan(orderDoc.planId);
    if (!plan) {
      throw new HttpsError("failed-precondition", "상품 정보가 유효하지 않습니다.");
    }

    const token = await paypalToken();
    const capture = await paypal.captureOrder({ token, env: PAYPAL_ENV.value(), orderId });

    // --- PayPal 응답 재검증 ---
    if (capture.status !== "COMPLETED") {
      await orderRef.update({ status: `FAILED_${capture.status}` });
      throw new HttpsError("failed-precondition", `결제가 완료되지 않았습니다 (${capture.status}).`);
    }

    const unit = capture.purchase_units && capture.purchase_units[0];
    const payment = unit && unit.payments && unit.payments.captures && unit.payments.captures[0];
    const paidAmount = payment && payment.amount && payment.amount.value;
    const paidCurrency = payment && payment.amount && payment.amount.currency_code;

    if (paidAmount !== plan.priceUSD || paidCurrency !== plan.currency) {
      await orderRef.update({ status: "FAILED_AMOUNT_MISMATCH", paidAmount, paidCurrency });
      throw new HttpsError(
        "failed-precondition",
        `결제 금액이 상품 가격과 다릅니다 (결제 ${paidCurrency} ${paidAmount} / 상품 ${plan.currency} ${plan.priceUSD}).`
      );
    }

    // --- 검증 통과. 구독 부여 ---
    const now = new Date();
    const expiresAt = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);
    const subscription = {
      status: "active",
      tier: plan.id,
      planId: plan.id,
      planName: plan.name,
      startedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      isCeoPass: false,
      autoRenew: false,
      lastOrderId: orderId,
      lastCaptureId: payment.id,
      updatedAt: FieldValue.serverTimestamp()
    };

    const batch = db.batch();
    batch.set(db.collection("subscriptions").doc(uid), subscription, { merge: true });
    batch.update(orderRef, {
      status: "CAPTURED",
      captureId: payment.id,
      paidAmount,
      paidCurrency,
      capturedAt: FieldValue.serverTimestamp()
    });
    await batch.commit();

    return subscription;
  }
);

/**
 * 3) 현재 구독 조회
 * 만료일이 지났으면 서버가 free로 정리해 돌려줍니다.
 */
exports.getMySubscription = onCall({ region: REGION }, async (request) => {
  const uid = requireAuth(request);
  const snap = await db.collection("subscriptions").doc(uid).get();
  if (!snap.exists) return { status: "inactive", tier: "free" };

  const sub = snap.data();
  if (sub.expiresAt && new Date(sub.expiresAt).getTime() < Date.now()) {
    await db.collection("subscriptions").doc(uid).set(
      { status: "expired", tier: "free", updatedAt: FieldValue.serverTimestamp() },
      { merge: true }
    );
    return { ...sub, status: "expired", tier: "free" };
  }
  return sub;
});

/**
 * 4) PayPal 웹훅
 * 환불·분쟁·정기결제 취소를 반영합니다. 서명 검증에 실패한 요청은 무시합니다.
 */
exports.paypalWebhook = onRequest(
  { region: REGION, secrets: [PAYPAL_CLIENT_ID, PAYPAL_SECRET, PAYPAL_WEBHOOK_ID] },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    try {
      const token = await paypalToken();
      const ok = await paypal.verifyWebhookSignature({
        token,
        env: PAYPAL_ENV.value(),
        webhookId: PAYPAL_WEBHOOK_ID.value(),
        headers: req.headers,
        body: req.body
      });

      if (!ok) {
        console.warn("[paypalWebhook] 서명 검증 실패 · 이벤트 무시");
        res.status(401).send("invalid signature");
        return;
      }

      const eventType = req.body && req.body.event_type;
      const resource = (req.body && req.body.resource) || {};

      // 환불·취소 계열 이벤트는 구독을 즉시 해지합니다.
      const revokeEvents = [
        "PAYMENT.CAPTURE.REFUNDED",
        "PAYMENT.CAPTURE.REVERSED",
        "PAYMENT.CAPTURE.DENIED",
        "BILLING.SUBSCRIPTION.CANCELLED",
        "BILLING.SUBSCRIPTION.EXPIRED"
      ];

      if (revokeEvents.includes(eventType)) {
        const captureId = resource.id;
        const found = await db.collection("subscriptions")
          .where("lastCaptureId", "==", captureId)
          .limit(1)
          .get();

        if (!found.empty) {
          await found.docs[0].ref.set(
            {
              status: "revoked",
              tier: "free",
              revokedReason: eventType,
              updatedAt: FieldValue.serverTimestamp()
            },
            { merge: true }
          );
          console.log(`[paypalWebhook] ${eventType} → 구독 해지 (${found.docs[0].id})`);
        }
      }

      res.status(200).send("ok");
    } catch (err) {
      console.error("[paypalWebhook] 처리 오류:", err);
      res.status(500).send("error");
    }
  }
);
