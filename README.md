# ⚡ RUNNOW (Nike Run Club x Tamagotchi GPS Runner)

> **"달리는 만큼 진화하는 나만의 사이버 펫 러닝 웹앱"**  
> 고정밀 GPS 러닝 추적 HUD + 다마고치 펫 육성 & 진화 시스템 + 21일 챌린지 + 상점/결제 시스템

---

## 🌐 접속 주소 & 인프라 (Live Web App & Staging)
- 🚀 **상용 공식 서비스 URL (일반 사용자)**: [https://runnow.beauscreators.com](https://runnow.beauscreators.com) (미러: [https://runnow-37af9.web.app](https://runnow-37af9.web.app))
- 🛡️ **내부 테스트 전용 URL (개발/검증용)**: [https://runnow-37af9--dev-irl7g2ve.web.app](https://runnow-37af9--dev-irl7g2ve.web.app)
- 🐙 **GitHub Repository**: [https://github.com/Leeseunjib/RUNNOW](https://github.com/Leeseunjib/RUNNOW)
  - `master`: 상용 프로덕션 릴리즈 브랜치 (1클릭 승급 전용)
  - `develop`: 일상 개발 & 내부 테스트 배포 브랜치

---

## 🚀 배포 및 상용 승급 파이프라인 (CI/CD)
```bash
# 1. 내부 테스트 채널에 안전 배포 (상용 사이트 미영향)
npm run deploy:dev

# 2. 대표님 검증 완료 후, 검증된 빌드를 상용으로 1초 승급 (Promote to Production)
npm run promote:live
```

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
