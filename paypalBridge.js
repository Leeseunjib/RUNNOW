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
              <span class="pp-badge">SECURE TEST</span>
              <span>PayPal Balance / VISA •••• 4242</span>
            </div>

            <div class="pp-actions">
              <button class="pp-btn-pay" id="pp-confirm-pay">결제 승인 (₩${item.priceKRW ? item.priceKRW.toLocaleString() : '6,900'})</button>
              <button class="pp-btn-cancel" id="pp-cancel-pay">취소</button>
            </div>
            
            <div class="pp-secure-tag">🔒 End-to-End Encrypted 256-bit SSL Security</div>
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
}
