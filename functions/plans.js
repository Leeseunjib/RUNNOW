// 서버가 신뢰하는 구독 상품 정본. 클라이언트가 보낸 가격은 절대 사용하지 않습니다.
// 클라이언트의 subscriptionManager.js SUBSCRIPTION_PLANS와 id·가격이 일치해야 합니다.

const PLANS = {
  pro_monthly: {
    id: "pro_monthly",
    name: "RUNNOW PRO 월간 멤버십",
    priceUSD: "7.99",
    currency: "USD",
    durationDays: 30
  },
  pro_annual: {
    id: "pro_annual",
    name: "RUNNOW PRO 연간 멤버십",
    priceUSD: "59.99",
    currency: "USD",
    durationDays: 365
  }
};

function getPlan(planId) {
  return Object.prototype.hasOwnProperty.call(PLANS, planId) ? PLANS[planId] : null;
}

module.exports = { PLANS, getPlan };
