# ⚡ RUNNOW (Nike Run Club x Tamagotchi GPS Runner)

> **"달리는 만큼 진화하는 나만의 사이버 펫 러닝 웹앱"**  
> 고정밀 GPS 러닝 추적 HUD + 다마고치 펫 육성 & 진화 시스템 + 21일 챌린지 + 상점/결제 시스템

---

## 🌐 라이브 데모 (Live Web App)
- **Firebase Hosting 공식 배포**: [https://runnow-37af9.web.app](https://runnow-37af9.web.app)

---

## ✨ 핵심 기능 (Key Features)

1. **⚡ LIVE GPS RUNNER (고정밀 러닝 HUD)**
   - **정수 미터(m) 단위 실시간 정밀 거리 측정**: 소수점 오차 없이 순수 이동 궤적을 정밀 누적 (시작점으로 돌아와도 걸었던 거리 100% 보존)
   - **AVG PACE (평균 페이스)**: 1km 소요 시간(`분'초"`) 직관적 표시
   - **실시간 소모 칼로리 & 경과 시간 계산**
   - **스마트폰/워치 GPS 신호 정확도 자동 감지**

2. **🐣 TAMAGOTCHI EVOLUTION (사이버 펫 육성 및 진화)**
   - 알(Egg) ➔ 아기 볼트몽 ➔ 성장기 ➔ 어반 러너 ➔ 사이버울프(최종 형태)
   - 누적 러닝 거리(km)와 획득 XP에 따른 실시간 능력치(근력, 민첩, 멘탈) 진화

3. **🏆 21-DAY CHALLENGE & QUESTS**
   - 단계별 목표 거리(1km ~ 10km) 미션 클리어 시스템
   - 매일 습관 형성 큐 및 연속 출석 스트릭

4. **💎 REWARD & SHOP**
   - 러닝 완주 시 볼트 코인(VC) 보상 지급
   - 프리미엄 아이템 구매 및 인앱 결제 연동

---

## 🛠️ 기술 스택 (Tech Stack)

- **Frontend**: HTML5, Vanilla JavaScript (ES Modules), Modern High-Contrast CSS
- **Geolocation**: Web Geolocation API (Haversine Path Accumulation & Jitter Filter)
- **Backend & Auth**: Firebase Authentication, Firestore, Firebase Hosting
- **Payment**: PayPal Standard & Subscriptions API Bridge

---

## 🚀 로컬 실행 방법 (Getting Started)

```bash
# 저장소 복제
git clone https://github.com/Leeseunjib/RUNNOW.git
cd RUNNOW

# 의존성 설치 및 로컬 서버 실행
npm install
npx serve . -l 3000
```
브라우저에서 `http://localhost:3000`으로 접속하여 실행할 수 있습니다.
