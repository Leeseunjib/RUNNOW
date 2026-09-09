// PayPal 결제 처리 및 인게임 재화/아이템 지급 모듈 (PayPal Bridge)

export class PayPalBridge {
  constructor(options = {}) {
    this.onSuccess = options.onSuccess || (() => {});
    this.onCancel = options.onCancel || (() => {});
  }

  // PayPal 샌드박스 결제 모달 시뮬레이터 및 실시간 승인 플로우
  processPayment(item, onSuccessCallback) {
    return new Promise((resolve) => {
      // 1. 결제 모달 생성
      const modalOverlay = document.createElement("div");
      modalOverlay.className = "paypal-modal-overlay";
      modalOverlay.innerHTML = `
        <div class="paypal-modal">
          <div class="pp-header">
            <div class="pp-logo"><i>P</i><i>P</i> PayPal <span>Checkout</span></div>
            <button class="pp-close-btn">&times;</button>
          </div>
          <div class="pp-body">
            <div class="pp-summary-box">
              <div class="pp-item-name">${item.icon} ${item.name}</div>
              <div class="pp-item-desc">${item.desc}</div>
              <div class="pp-item-price">₩${item.priceKRW ? item.priceKRW.toLocaleString() : '6,900'} KRW</div>
            </div>
            
            <div class="pp-account-info">
              <div class="pp-avatar">🏃</div>
              <div>
                <strong>이건우 대표님 (BSC CEO)</strong>
                <p>dnswlq456@gmail.com</p>
              </div>
            </div>

            <div class="pp-payment-method">
              <span class="pp-badge" style="background:#00e5ff; color:#08090C; font-weight:800;">SANDBOX TEST (실제 결제 0원)</span>
              <span>PayPal Sandbox / VISA •••• 4242</span>
            </div>

            <div class="pp-actions">
              <button class="pp-btn-pay" id="pp-confirm-pay">결제 승인 (₩${item.priceKRW ? item.priceKRW.toLocaleString() : '6,900'})</button>
              <button class="pp-btn-cancel" id="pp-cancel-pay">취소</button>
            </div>
            
            <div class="pp-secure-tag" style="color:#00e5ff; font-weight:600;">🛡️ Sandbox Test Mode: 실제 청구 없는 안전 테스트 결제입니다.</div>
          </div>
        </div>
      `;

      document.body.appendChild(modalOverlay);

      // 이벤트 바인딩
      const closeBtn = modalOverlay.querySelector(".pp-close-btn");
      const cancelBtn = modalOverlay.querySelector("#pp-cancel-pay");
      const confirmBtn = modalOverlay.querySelector("#pp-confirm-pay");

      const cleanup = () => {
        if (modalOverlay.parentNode) {
          modalOverlay.parentNode.removeChild(modalOverlay);
        }
      };

      closeBtn.onclick = () => { cleanup(); resolve({ success: false, reason: "closed" }); };
      cancelBtn.onclick = () => { cleanup(); resolve({ success: false, reason: "cancelled" }); };

      confirmBtn.onclick = () => {
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = `<span class="spinner"></span> Processing with PayPal...`;

        setTimeout(() => {
          cleanup();
          if (onSuccessCallback) onSuccessCallback(item);
          resolve({
            success: true,
            orderID: "PP-ORDER-" + Math.random().toString(36).substring(2, 9).toUpperCase(),
            item: item,
            paidAmount: item.priceUSD,
            timestamp: new Date().toISOString()
          });
        }, 1200);
      };
    });
  }

  // PayPal 정기 구독 결제 모달 시뮬레이터 및 승인 플로우
  processSubscription(plan, onSuccessCallback) {
    return new Promise((resolve) => {
      const modalOverlay = document.createElement("div");
      modalOverlay.className = "paypal-modal-overlay";
      modalOverlay.innerHTML = `
        <div class="paypal-modal paypal-sub-modal">
          <div class="pp-header">
            <div class="pp-logo"><i>P</i><i>P</i> PayPal <span class="pp-sub-tag">SUBSCRIBE</span></div>
            <button class="pp-close-btn">&times;</button>
          </div>
          <div class="pp-body">
            <div class="pp-summary-box pp-sub-summary">
              <div class="pp-item-badge">⭐ RUNNOW PRO MEMBERSHIP</div>
              <div class="pp-item-name">${plan.name}</div>
              <div class="pp-item-desc">${plan.desc}</div>
              <div class="pp-item-price">₩${plan.priceKRW ? plan.priceKRW.toLocaleString() : "9,900"} KRW <span class="pp-period">${plan.periodName || "/ 월"}</span></div>
            </div>
            
            <div class="pp-sub-perks">
              <div class="pp-perk-item">✓ AI 카메라 모션 피트니스 6종 무제한</div>
              <div class="pp-perk-item">✓ 다마고치 5단계 진화 & 스탯 육성 풀언락</div>
              <div class="pp-perk-item">✓ 21일 챌린지 & 데일리 퀘스트 보상 해금</div>
              <div class="pp-perk-item">✓ 볼트 샵 20종 장비 착용 & VIP 상시 혜택</div>
            </div>

            <div class="pp-account-info">
              <div class="pp-avatar">⭐</div>
              <div>
                <strong>이건우 대표님 (BSC CEO)</strong>
                <p>dnswlq456@gmail.com</p>
              </div>
            </div>

            <div class="pp-payment-method">
              <span class="pp-badge" style="background:#00e5ff; color:#08090C; font-weight:800;">SANDBOX TEST (실제 결제 0원)</span>
              <span>PayPal Pre-approved Sandbox / VISA •••• 4242</span>
            </div>

            <div class="pp-actions">
              <button class="pp-btn-pay pp-btn-sub" id="pp-confirm-sub">구독 시작 (₩${plan.priceKRW ? plan.priceKRW.toLocaleString() : "9,900"}${plan.periodName || "/월"})</button>
              <button class="pp-btn-cancel" id="pp-cancel-sub">취소</button>
            </div>
            
            <div class="pp-secure-tag" style="color:#00e5ff; font-weight:600;">🛡️ Sandbox Test Mode: 실제 카드 결제 및 계좌 출금 없이 승인 플로우만 안전하게 실행됩니다.</div>
          </div>
        </div>
      `;

      document.body.appendChild(modalOverlay);

      const closeBtn = modalOverlay.querySelector(".pp-close-btn");
      const cancelBtn = modalOverlay.querySelector("#pp-cancel-sub");
      const confirmBtn = modalOverlay.querySelector("#pp-confirm-sub");

      const cleanup = () => {
        if (modalOverlay.parentNode) {
          modalOverlay.parentNode.removeChild(modalOverlay);
        }
      };

      closeBtn.onclick = () => { cleanup(); resolve({ success: false, reason: "closed" }); };
      cancelBtn.onclick = () => { cleanup(); resolve({ success: false, reason: "cancelled" }); };

      confirmBtn.onclick = () => {
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = `<span class="spinner"></span> Activating Subscription with PayPal...`;

        setTimeout(() => {
          cleanup();
          if (onSuccessCallback) onSuccessCallback(plan);
          resolve({
            success: true,
            subscriptionID: "I-SUB-" + Math.random().toString(36).substring(2, 9).toUpperCase(),
            plan: plan,
            paidAmount: plan.priceUSD,
            timestamp: new Date().toISOString()
          });
        }, 1400);
      };
    });
  }
}
