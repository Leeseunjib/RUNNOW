# 💳 PayPal MCP: 결제 연동, 20종 아이템 카탈로그 및 결제 검증 사양서

> **프로젝트명**: RunGotchi (글로벌 GPS 러너 & 다마고치 육성 3주 챌린지)  
> **결제 게이트웨이**: PayPal REST API (Sandbox / Live), PayPal JavaScript SDK  
> **적용 도구**: PayPal MCP Server (`@paypal/mcp`)

---

## 1. PayPal 결제 시스템 아키텍처

글로벌 결제를 위해 PayPal JavaScript SDK의 Buttons 컴포넌트 및 Server-side Order Create/Capture 파이프라인을 구축합니다.

```
[클라이언트 UI (상점 20종)]
        │ (1) 아이템 선택 및 주문 요청 (itemId, priceUSD)
        ▼
[PayPal Orders API (v2/checkout/orders)]
        │ (2) create_order -> orderID 생성
        ▼
[PayPal 결제 팝업 / One-Touch 승인]
        │ (3) 유저 결제 승인
        ▼
[PayPal Capture API (v2/checkout/orders/{id}/capture)]
        │ (4) 결제 완료 확인 (COMPLETED)
        ▼
[인게임 인벤토리 / VoltCoin 즉시 지급 & 영수증 저장]
```

---

## 2. 20종 정규 상점 상품 카탈로그 (JSON Schema)

```json
[
  { "id": "item_01", "category": "shoes", "name": "Volt Pegasus Turbo", "priceUSD": 4.99, "voltCoins": 490, "bonus": "Speed +10%, Volt Trail Effect", "icon": "👟" },
  { "id": "item_02", "category": "shoes", "name": "Cyber VaporFly Next%", "priceUSD": 9.99, "voltCoins": 990, "bonus": "Challenge Reward 1.5x Boost", "icon": "⚡" },
  { "id": "item_03", "category": "shoes", "name": "Carbon Streak X", "priceUSD": 14.99, "voltCoins": 1490, "bonus": "Pace Assist +20%", "icon": "🔥" },
  { "id": "item_04", "category": "shoes", "name": "Alpha Aero Fly", "priceUSD": 19.99, "voltCoins": 1990, "bonus": "1x Instant Mission Free-Pass", "icon": "🚀" },
  { "id": "item_05", "category": "energy", "name": "Volt Hydration 500ml", "priceUSD": 0.99, "voltCoins": 99, "bonus": "Hydration +100% Instantly", "icon": "💧" },
  { "id": "item_06", "category": "energy", "name": "Nano Electrolyte Gel", "priceUSD": 1.99, "voltCoins": 190, "bonus": "Energy Drain -50% for 24h", "icon": "🧪" },
  { "id": "item_07", "category": "energy", "name": "Beast Protein Shake", "priceUSD": 2.99, "voltCoins": 290, "bonus": "Growth XP +150 Instantly", "icon": "🥛" },
  { "id": "item_08", "category": "energy", "name": "Phoenix Elixir", "priceUSD": 4.99, "voltCoins": 490, "bonus": "Streak Recovery Shield", "icon": "✨" },
  { "id": "item_09", "category": "skin", "name": "Cyberpunk Neon Visor", "priceUSD": 2.99, "voltCoins": 290, "bonus": "Cyberpunk Visor Visual", "icon": "🥽" },
  { "id": "item_10", "category": "skin", "name": "Night Tracksuit Volt", "priceUSD": 5.99, "voltCoins": 590, "bonus": "Glow-in-the-Dark Aura", "icon": "🎽" },
  { "id": "item_11", "category": "skin", "name": "Golden Champion Aura", "priceUSD": 8.99, "voltCoins": 890, "bonus": "Golden Particle Effect", "icon": "👑" },
  { "id": "item_12", "category": "skin", "name": "Midnight Ninja Hoodie", "priceUSD": 6.99, "voltCoins": 690, "bonus": "Stealth Ninja Costume", "icon": "🥋" },
  { "id": "item_13", "category": "wearable", "name": "Titanium GPS Pro Watch", "priceUSD": 3.99, "voltCoins": 390, "bonus": "GPS Drift Filter 99%", "icon": "⌚" },
  { "id": "item_14", "category": "wearable", "name": "Aero Speed Sunglasses", "priceUSD": 2.49, "voltCoins": 250, "bonus": "Day Run Happiness x2", "icon": "🕶️" },
  { "id": "item_15", "category": "wearable", "name": "Reflex LED Armband", "priceUSD": 1.99, "voltCoins": 190, "bonus": "Night Run Reward +30%", "icon": "💡" },
  { "id": "item_16", "category": "wearable", "name": "SoundPulse Headband", "priceUSD": 3.49, "voltCoins": 350, "bonus": "Pace Beats Audio Pack", "icon": "🎧" },
  { "id": "item_17", "category": "pass", "name": "3-Week Double XP Season Pass", "priceUSD": 9.99, "voltCoins": 990, "bonus": "21 Days Double XP", "icon": "🎫" },
  { "id": "item_18", "category": "pass", "name": "Daily Streak Shield (3x)", "priceUSD": 4.99, "voltCoins": 490, "bonus": "3x Missed-Day Protection", "icon": "🛡️" },
  { "id": "item_19", "category": "pass", "name": "Master Runner Trophy Box", "priceUSD": 12.99, "voltCoins": 1290, "bonus": "3 Rare Gears + 1000 Coins", "icon": "🎁" },
  { "id": "item_20", "category": "pass", "name": "VIP Diamond Club (Monthly)", "priceUSD": 19.99, "voltCoins": 1990, "bonus": "All-Shop 20% Discount + VIP Tag", "icon": "💎" }
]
```

---

## 3. PayPal SDK 연동 및 클라이언트 통합 코드

```html
<script src="https://www.paypal.com/sdk/js?client-id=sb&currency=USD"></script>
<div id="paypal-button-container"></div>

<script>
paypal.Buttons({
  createOrder: function(data, actions) {
    return actions.order.create({
      purchase_units: [{
        description: currentSelectedItem.name,
        amount: {
          currency_code: 'USD',
          value: currentSelectedItem.priceUSD.toString()
        }
      }]
    });
  },
  onApprove: function(data, actions) {
    return actions.order.capture().then(function(details) {
      console.log('Payment Completed for: ' + details.payer.name.given_name);
      // 인게임 재화 / 아이템 지급 로직 호출
      grantPurchasedItem(currentSelectedItem);
    });
  },
  onError: function(err) {
    console.error('PayPal Transaction Error:', err);
    alert('결제 처리 중 오류가 발생했습니다.');
  }
}).render('#paypal-button-container');
</script>
```
