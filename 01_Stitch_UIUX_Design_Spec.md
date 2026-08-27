# 🎨 Stitch MCP: Nike Run Club 스타일 UI/UX 디자인 사양서

> **프로젝트명**: RunGotchi (글로벌 GPS 러너 & 다마고치 육성 3주 챌린지)  
> **기준 모델**: Nike Run Club (NRC) 프리미엄 다크/볼트 테마 + 다마고치 피트니스 엔진  
> **적용 도구**: Stitch MCP (UI 컴포넌트, 디자인 토큰, 테마 시스템)

---

## 1. 디자인 시스템 토큰 (Design Tokens)

### 1.1 컬러 팔레트 (Color Palette)
- **Primary (Volt Neon)**: `#CCFF00` (나이키 시그니처 형광 볼트 - 행동 유도, 활성화 게이지, 타이머)
- **Secondary (Cyber Cyan)**: `#00F0FF` (GPS 경로, 칼로리 서브 지표, 홀로그램 효과)
- **Accent (Inferno Orange)**: `#FF5722` (심박수, 고강도 인터벌, 긴급 알림)
- **Background Deep**: `#08090C` (최상위 배경 - 배터리 절약 OLED 최적화)
- **Surface Carbon**: `#12161F` (카드 및 모달 컴포넌트 배경)
- **Surface Elevated**: `#1A202C` (인터랙티브 버튼 및 인풋 필드)
- **Border Subtle**: `rgba(204, 255, 0, 0.15)` (볼트 네온 글래스 테두리)
- **Text High-Contrast**: `#FFFFFF` (100% 가독성 타이틀 및 메트릭스)
- **Text Muted**: `#8E9AA8` (단위, 서브라벨, 타임스탬프)

### 1.2 타이포그래피 (Typography)
- **Metrics/Digits**: `'Impact', 'Montserrat', 'Outfit', sans-serif` (초대형 고대비 수치 - 48px ~ 72px)
- **Headings**: `'Outfit', 'Inter', -apple-system, sans-serif` (Weight: 800, 700)
- **Body & Labels**: `'Inter', system-ui, sans-serif` (Weight: 500, 400)

---

## 2. 화면 구조 및 UI 컴포넌트 계층

```
RunGotchi App Shell
├── 📱 Header (상단 유저 레벨, VoltCoin 잔액, 다마고치 컨디션 뱃지)
├── 🏃 Tab 1: Live Run (실시간 GPS 원형 게이지, 페이스/거리/시간 HUD, 다마고치 러닝 모션)
├── 🐣 Tab 2: Tamagotchi (다마고치 캐릭터 5단계 진화 룸, 먹이주기/놀아주기, 스탯 게이지)
├── 📅 Tab 3: 21-Day Challenge (3주 챌린지 매트릭스, 일일 체크리스트, 스트릭 보너스)
├── 🛍️ Tab 4: Volt Shop (20종 인게임 아이템 카탈로그, PayPal 원클릭 결제 모달)
└── ⚙️ Tab 5: Profile & Goals (키/몸무게/BMR/BMI 계산기, 기록 아카이브)
```

---

## 3. 다마고치 캐릭터 UI & 5단계 진화 디자인

| 단계 | 캐릭터명 | 외형 비주얼 컨셉 | 진화 조건 (누적 거리) | 특수 효과 |
|---|---|---|---|---|
| **Phase 1** | **Runner Egg (러너 에그)** | 활기차게 흔들리는 네온 볼트 알 | 가입 즉시 (0 km) | 튜토리얼 완료 시 부화 |
| **Phase 2** | **Rookie Chick (루키 병아리)** | 헤드밴드를 맨 날쌘 병아리 | 누적 5.0 km 달성 | 일일 XP +10% 획득 |
| **Phase 3** | **Urban Runner (어반 러너)** | 나이키 스타일 바람막이의 날쌘 여우 | 누적 20.0 km 달성 | 배고픔 소모 -15% 완화 |
| **Phase 4** | **Marathon Master (마라톤 마스터)** | 사이버 글래스를 착용한 표범 | 누적 50.0 km 달성 | GPS 칼로리 보너스 +20% |
| **Phase 5** | **Cyber Speedster (사이버 스피드스타)** | 번개 이펙트와 네온 오라의 신수 | 누적 100.0 km 달성 | 상점 전 품목 15% 추가 할인 |

---

## 4. 20종 인게임 상점 아이템 UI 명세 (Shop Items)

### [카테고리 1] 러닝화 (Running Shoes)
1. **Volt Pegasus Turbo**: `$4.99` (490 VC) - 러닝 속도 보너스 +10%, 볼트 발자국 이펙트
2. **Cyber VaporFly Next%**: `$9.99` (990 VC) - 3주 챌린지 완료 보상 1.5배 증가
3. **Carbon Streak X**: `$14.99` (1,490 VC) - 실시간 러닝 페이스 20% 보정
4. **Alpha Aero Fly**: `$19.99` (1,990 VC) - 모든 챌린지 미션 즉시 클리어 프리패스 1회

### [카테고리 2] 에너지 & 리커버리 (Energy & Recovery)
5. **Volt Hydration 500ml**: `$0.99` (99 VC) - 다마고치 수분도 100% 즉시 회복
6. **Nano Electrolyte Gel**: `$1.99` (190 VC) - 러닝 중 에너지 소모율 50% 감소 (24시간)
7. **Beast Protein Shake**: `$2.99` (290 VC) - 캐릭터 근력/성장치 +150 XP 즉시 획득
8. **Phoenix Elixir**: `$4.99` (490 VC) - 연속 출석(Streak) 깨짐 방지 1회 복구

### [카테고리 3] 캐릭터 스킨 & 코스튬 (Tamagotchi Skins)
9. **Cyberpunk Neon Visor**: `$2.99` (290 VC) - 사이버펑크 네온 선글라스 스킨
10. **Night Tracksuit Volt**: `$5.99` (590 VC) - 야간 러닝 시 야광 오라 발산
11. **Golden Champion Aura**: `$8.99` (890 VC) - 캐릭터 주변 황금빛 챔피언 파티클
12. **Midnight Ninja Hoodie**: `$6.99` (690 VC) - 스텔스 닌자 스타일 후드 코스튬

### [카테고리 4] 웨어러블 기어 (Wearable Gear)
13. **Titanium GPS Pro Watch**: `$3.99` (390 VC) - GPS 오차 99% 보정 및 정밀 케이던스 측정
14. **Aero Speed Sunglasses**: `$2.49` (250 VC) - 낮 시간대 러닝 시 행복도 2배
15. **Reflex LED Armband**: `$1.99` (190 VC) - 야간 퀘스트 완료 보상 +30%
16. **SoundPulse Headband**: `$3.49` (350 VC) - 페이스 가이드 BGM 사운드 팩 해금

### [카테고리 5] 패스 & 스페셜 부스터 (Passes & Special)
17. **3-Week Double XP Season Pass**: `$9.99` (990 VC) - 21일 동안 모든 러닝 XP 2배
18. **Daily Streak Immortal Shield (3개입)**: `$4.99` (490 VC) - 3회분 스트릭 방어막
19. **Master Runner Trophy Box**: `$12.99` (1,290 VC) - 레어 장비 3종 + 1000 볼트코인 확정팩
20. **VIP Diamond Runners Club (월간)**: `$19.99` (1,990 VC) - 전 품목 20% 상시 할인 + 전용 뱃지

---

## 5. Stitch MCP 디자인 프롬프트 & UI 컴포넌트 가이드

```css
/* Stitch MCP 핵심 컴포넌트 믹스인 */
.nrc-card {
  background: linear-gradient(135deg, rgba(26, 32, 44, 0.8) 0%, rgba(18, 22, 31, 0.95) 100%);
  border: 1px solid rgba(204, 255, 0, 0.18);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  backdrop-filter: blur(12px);
  border-radius: 20px;
}

.volt-glow-btn {
  background: #CCFF00;
  color: #08090C;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 0 20px rgba(204, 255, 0, 0.4);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.volt-glow-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 30px rgba(204, 255, 0, 0.7);
}
```
