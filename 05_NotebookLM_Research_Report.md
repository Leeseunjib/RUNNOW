# NotebookLM Research Report: 글로벌 피트니스 다마고치 러너 게임 (RunGotchi)

> **NotebookLM Notebook ID**: `6554a57f-80e2-4b49-9d12-28cdfb6753bc`  
> **Notebook Title**: `러너 교육 게임`  
> **Notebook URL**: [https://notebooklm.google.com/notebook/6554a57f-80e2-4b49-9d12-28cdfb6753bc](https://notebooklm.google.com/notebook/6554a57f-80e2-4b49-9d12-28cdfb6753bc)  
> **수집 소스 수**: 10개 핵심 학술 연구 및 글로벌 벤치마크 데이터

---

## 1. 수집된 핵심 연구 및 벤치마크 소스 (10개)

1. **Habit-chi: Habit Tracker & Pet** (Google Play) - 펫 진화와 습관 일치 메커니즘
2. **The 5 Best Running Apps to Try in 2026 - Run&Grow** - 마일을 에너지로 변환해 가상 정원을 가꾸는 게이미피케이션 모델
3. **The Science of Habit Loops in Fitness (FitCraft / BJGP)** - 단서(Cue)-루틴(Routine)-즉각보상(Immediate Reward) 기저핵 신경과학
4. **6 Best Virtual Pet Apps (2026 Picks)** - 어른용 피트니스 연동 가상 펫 육성 트렌드
5. **Making health habitual: the psychology of habit-formation (BJGP)** - UCL 66일 자동화 곡선 및 21일 초기 진입 장벽 극복 심리학
6. **A Virtual Pet Serious Game in Motivating Treatment & Self-Care (MJPCH)** - 생체 피드백 기반 펫 상태 관리와 참여도 분석
7. **Reddit: Physiological Data Replaces XP** - 단순 버튼 클릭이 아닌 실제 생체/GPS 데이터를 직접 스탯(Might, Agility, Spirit)으로 치환하는 설계
8. **Smartphone Games Encouraging Physical Exercise (Atlantis Press)** - 내러티브 러닝(Zombies, Run!) vs 월드 빌딩 게이미피케이션 비교
9. **Octalysis Framework (Yu-kai Chou)** - 8대 핵심 동기 부여(Core Drives) 기반 지속가능한 몰입 설계
10. **21-Day Habit Tracker Challenge Structure** - 점진적 마일스톤 및 스트릭 배지 시스템

---

## 2. 핵심 기획 및 개발 아키텍처 반영 가이드

### A. 습관 형성 신경과학 (The Habit Loop)
- **즉각적인 도파민 보상 회로 (Immediate Reward)**:  
  달리기의 장기적 효과(체중 감량, 심폐 강화)는 지연된 보상이므로 뇌의 기저핵(Basal Ganglia)을 자극하지 못합니다. 러닝 종료 버튼을 누르는 즉시 **수 초 내에 다마고치 경험치 폭발, 에너지 코인(VC) 지급, 픽셀 애니메이션 레벨업**을 제공하여 뇌가 러닝을 즉각적 보상 행동으로 각인합니다.
- **3주(21일) 챌린지의 본질**:  
  UCL 연구에 따르면 실제 완전한 습관 자동화는 평균 66일이 걸립니다. 따라서 3주 챌린지는 습관 완성기가 아닌 **'초기 성공 경험 및 자아 효능감(Self-Efficacy) 극대화'**를 위한 부트캠프로 설계합니다.

### B. 게임화 옥탈리시스 (Octalysis) 적용
- **CD 1 (소명/의미)**: 나의 달리기가 펫 '볼트(Volt)'의 진화 에너지가 된다는 스토리텔링.
- **CD 2 (성취/발전)**: 거리(km) 기반 3단계 진화 (Sparky ➔ Volt ➔ Thunder Titan).
- **CD 4 (소유권/상점)**: 달려서 모은 코인으로 페이스 헤어밴드, 썬더 러닝화 등 20개 아이템 장착.
- **CD 8 (손실 회피 완충)**: 운동을 쉬면 펫이 바로 사라지는 대신 '에너지 감소 & 아픈 상태'로 완충 기간을 두어 스트레스 없이 복귀(Rescue Quest) 유도.

### C. 생체/GPS 기반 치팅 방지 (Physiology Replaces XP)
- 수동 버튼 클릭이 아닌 브라우저 Geolocation API 및 Haversine 공식 기반 **실제 이동 거리와 페이스(min/km)**를 측정하여 경험치로 환산.
- 지터(Jitter) 필터 및 30km/h 이상 차량 이동 필터링 적용.

---

## 3. 구현 완료 파일 매핑
- **UI/UX 테마**: `styles.css` (Nike Run Club Midnight Dark + Neon Volt 3.0)
- **GPS 러닝 엔진**: `gpsRunner.js` (실시간 위경도 계산, 페이스, 경로 추적)
- **다마고치 진화 엔진**: `tamagotchi.js` (에너지, 친밀도, 3단계 진화)
- **3주 챌린지 로드맵**: `challenge.js` (Day 1~21 마일스톤, 온보딩 프로필)
- **PayPal 결제 상점**: `paypalBridge.js`, `catalog.js` (20개 굿즈 및 프리미엄 패스)
