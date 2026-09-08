// PayPal REST API v2 서버 클라이언트. 시크릿은 이 파일 밖(Secret Manager)에서 주입받습니다.

const LIVE_BASE = "https://api-m.paypal.com";
const SANDBOX_BASE = "https://api-m.sandbox.paypal.com";

function apiBase(env) {
  return env === "live" ? LIVE_BASE : SANDBOX_BASE;
}

// OAuth2 액세스 토큰 발급 (client_credentials)
async function getAccessToken({ clientId, secret, env }) {
  const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");
  const res = await fetch(`${apiBase(env)}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`PayPal 토큰 발급 실패 (${res.status}): ${detail}`);
  }
  const json = await res.json();
  return json.access_token;
}

// 주문 생성. 금액은 호출자가 서버 정본에서 가져온 값만 넘겨야 합니다.
async function createOrder({ token, env, plan, referenceId }) {
  const res = await fetch(`${apiBase(env)}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: referenceId,
          description: plan.name,
          amount: {
            currency_code: plan.currency,
            value: plan.priceUSD
          }
        }
      ]
    })
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(`PayPal 주문 생성 실패 (${res.status}): ${JSON.stringify(json)}`);
  }
  return json;
}

// 결제 캡처(실제 청구). 반환값의 status와 금액을 호출자가 반드시 재검증해야 합니다.
async function captureOrder({ token, env, orderId }) {
  const res = await fetch(`${apiBase(env)}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(`PayPal 캡처 실패 (${res.status}): ${JSON.stringify(json)}`);
  }
  return json;
}

// 웹훅 서명 검증. 이걸 건너뛰면 누구나 위조 이벤트를 보낼 수 있습니다.
async function verifyWebhookSignature({ token, env, webhookId, headers, body }) {
  const res = await fetch(`${apiBase(env)}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      auth_algo: headers["paypal-auth-algo"],
      cert_url: headers["paypal-cert-url"],
      transmission_id: headers["paypal-transmission-id"],
      transmission_sig: headers["paypal-transmission-sig"],
      transmission_time: headers["paypal-transmission-time"],
      webhook_id: webhookId,
      webhook_event: body
    })
  });

  if (!res.ok) return false;
  const json = await res.json();
  return json.verification_status === "SUCCESS";
}

module.exports = { getAccessToken, createOrder, captureOrder, verifyWebhookSignature };
