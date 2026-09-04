# ⚡ [마스터 종합 보고서] RUNNOW 앱 개발 전수 분석 보고서
### (투입 Skill · 핵심 기술 · 활용 언어 · 종합 기획 총망라 정본)

> **문서 코드**: `BSC-REP-20260904-RUNNOW-MASTER`  
> **프로젝트**: RUNNOW (RunGotchi - Nike x Tamagotchi Runner & AI Interactive Training OS)  
> **작성 일자**: 2026년 09월 04일  
> **작성자**: CTO 거누 (Backend/Infra/Architecture Lead) & 개발 셀  
> **보고 대상**: 이건우 대표님 (BeausCreators CEO)  
> **문서 상태**: 공식 확정 정본 (SSOT)  

---

## 1. 📌 프로젝트 개요 및 핵심 비전 (Executive Summary)

**RUNNOW**는 글로벌 러닝 트래커의 표준인 **Nike Run Club(NRC)의 세련된 고대비 다크/볼트(#CCFF00) UI**와 **다마고치(Tamagotchi)의 사이버 펫 육성·진화 시스템**, 그리고 **Google MediaPipe 온디바이스 AI 비전 인터랙티브 트레이닝 엔진**을 완벽하게 융합한 **차세대 하이퍼-게이미피케이션 피트니스 OS**입니다.

* **슬로건**: *"달리는 만큼 진화하는 나만의 사이버 펫 러닝 OS — Run, Grow, Evolve!"*
* **핵심 가치**:
  1. 고독하고 지루한 러닝을 사이버 펫과의 동반 모험으로 전환
  2. 기저핵(Basal Ganglia) 도파민 즉각 보상 회로를 통한 운동 습관화
  3. 날씨와 환경 제약 없는 실내 AI 웹캠 모션 트레이닝 결합 (푸시업, 스쿼트, 싯업)
  4. 서버 비용 $0(Zero Cost) 및 사용자 프라이버시 100% 보장 아키텍처

---

## 2. 🛠️ 투입된 Skill (에이전트 및 특화 스킬셋 전수)

앱 기획, 아키텍처 설계, 온디바이스 AI, 결제 및 배포 파이프라인 전 과정에 걸쳐 투입된 전사 스킬 내역입니다.

| 구분 | 스킬명 | 핵심 역할 및 실제 적용 내역 |
| :--- | :--- | :--- |
| **자체 전용 스킬** | `ondevice-ai-domain-routing` | • 카페24(`beauscreators.com`) 멀티앱 CNAME 라우팅 및 무료 SSL 연동 가이드<br>• WebGPU 기반 15대 온디바이스 AI 모델(Gemma2, Llama3.2, DeepSeek-R1 등) 로컬 구동 스펙 수립 |
| **사전 연구 스킬** | `notebooklm-automation-pipeline` | • Google NotebookLM API를 활용한 글로벌 피트니스 게이미피케이션 학술 연구 자동화<br>• BJGP 기저핵 습관 루프, UCL 66일 습관 형성 곡선, Octalysis 프레임워크 심층 분석 리포트 도출 |
| **디자인 스킬** | `StitchMCP` (UI/UX 설계) | • Nike Run Club(NRC) 시그니처 형광 볼트(#CCFF00) + OLED 딥 다크(#08090C) 디자인 시스템 구축<br>• 5대 핵심 탭 UI 계층 구조 및 모바일 퍼스트 레이아웃 규격 정의 |
| **백엔드/인프라 스킬** | `firebase-mcp-server` | • Firebase Auth(익명/구글/이메일), Cloud Firestore, Cloud Storage 연동<br>• Firestore Security Rules 및 복합 인덱스, Firebase CLI 배포 파이프라인 가동 |
| **글로벌 결제 스킬** | `paypal-mcp-server` | • PayPal REST API v2 및 PayPal JS SDK Buttons 결제 연동<br>• 20종 인게임 아이템 카탈로그 및 결제 검증/캡처(Capture) 프로세스 수립 |
| **데이터 보호 스킬** | `accidental-data-loss-prevention` | • 파일 통째 덮어쓰기 금지, 부분 정밀 수정(`replace_file_content`), 원본 백업 원칙 사수 |
| **글로벌 운영 스킬** | `bsc-global-rules` | • CHLGD(Context, Harness, Loop, Graph, Dynamic) 워크플로우 준수 및 본사-지점 양방향 동기화 |

---

## 3. 💻 적용된 핵심 기술 (Technologies & Frameworks & APIs)

### 3.1. 온디바이스(On-Device) AI & 비전 인터랙티브 엔진
* **Google MediaPipe Pose (WASM / WebGL)**:
  * 웹캠 비디오 스트림에서 33개 신체 관절 3D 랜드마크를 초당 60프레임(60FPS)으로 실시간 추출.
  * 서버 통신 없이 사용자 기기 브라우저(Local Engine)에서 100% 연산 처리하여 프라이버시 누출 0%, 서버 비용 0원 실현.
  * 3차원 좌표 벡터 내적 알고리즘을 통한 3대 운동 정밀 판정:
    * **푸시업(Push-up)**: 어깨(11/12) - 팔꿈치(13/14) - 손목(15/16) 각도 감지 (90° 도달 및 수평성 검증)
    * **스쿼트(Squat)**: 골반(23/24) - 무릎(25/26) - 발목(27/28) 각도 감지 (90° 굴곡 및 무릎 쏠림 방지)
    * **윗몸일으키기(Sit-up)**: 어깨 - 골반 - 무릎 사이 각도 수축 감지 (45° 이하 수축)
* **Web Audio API (Synthesizer)**:
  * 외부 mp3 사운드 에셋 의존 없이 브라우저 내장 오디오 컨텍스트(`AudioContext`)의 OscillatorNode를 활용하여 카운트다운 비프음, 정자세 성공 차임벨, 실패 버저 사운드를 순수 코드로 합성 생성 (`motionSound.js`).
* **YouTube Iframe API**:
  * 공인 트레이너의 고화질 가이드 영상을 상단 50% 분할 뷰에 임베딩하여, 대용량 비디오 호스팅 비용 없이 최적의 시각 가이드 제공.

### 3.2. 고정밀 실시간 GPS 엔지니어링
* **HTML5 Geolocation API (`watchPosition`)**:
  * 고감도 실시간 위도/경도/속도 연속 수집 (`highAccuracy: true`).
* **하버사인(Haversine) 구면 삼각법 공식**:
  * 지구 곡률(반경 6,371km)을 반영하여 1초 단위 미세 위경도 변위를 누적 합산. 출발점으로 되돌아오는 루프 코스에서도 달린 거리를 100% 무손실 보존.
* **지터(Jitter) & 노이즈 필터링**:
  * GPS 수신 오차 반경(Accuracy) 25m 초과 불량 데이터 폐기.
  * 3초 이내 위치 변화량이 임계값(15m) 미만인 정지 상태의 미세 좌표 흔들림(Drift) 자동 보정.
* **안티치트(Anti-Cheat) 속도 필터**:
  * 시속 30km/h를 초과하는 비정상 이동 구간(차량, 자전거 등)은 러닝 거리 및 경험치 집계에서 자동 제외.

### 3.3. 백엔드 및 클라우드 서버리스 (BaaS)
* **Firebase Authentication**:
  * 원클릭 익명(게스트) 로그인 지원으로 초기 진입 장벽 제거 (다마고치 알 부화 후 영구 계정 연동 지원).
  * Google OAuth 및 이메일/비밀번호 인증 지원.
* **Cloud Firestore (NoSQL)**:
  * 실시간 동기화(`onSnapshot`) 및 오프라인 지속성(Persistence).
  * 유저 프로필, 실시간 펫 상태, 러닝 세션 기록, 21일 챌린지 진척도, 결제 주문 영수증 컬렉션 분리.
* **Firestore Security Rules**:
  * 유저 본인 데이터만 CRUD 가능한 엄격한 샌드박스 보안 규칙 수립.
* **Firebase Hosting & Global CDN**:
  * 전 세계 엣지 네트워크 배포 및 Google 공인 무료 SSL(HTTPS) 자동 프로비저닝.

### 3.4. 글로벌 결제 및 PWA (Progressive Web Apps)
* **PayPal JavaScript SDK & REST API v2**:
  * PayPal Buttons 컴포넌트 탑재 및 클라이언트-서버 2단계 주문 생성(`createOrder`) 및 캡처(`onApprove`) 프로세스.
* **Service Worker (`sw.js`) & Web App Manifest**:
  * 오프라인 리소스 캐싱, 스마트폰 홈 화면 추가(A2HS), 브라우저 주소창이 숨겨진 풀스크린 네이티브 앱 경험 구현.

---

## 4. 🔤 활용된 언어 및 데이터 포맷 (Languages & Formats)

| 언어 / 포맷 | 활용 영역 | 상세 설명 |
| :--- | :--- | :--- |
| **JavaScript (ES6+)** | 클라이언트 코어 & 모듈 로직 | • `app.js`: 전체 앱 라이프사이클 및 네비게이션 제어<br>• `motionTracker.js`: MediaPipe 비전 각도 연산 및 상태 머신<br>• `motionSound.js`: Web Audio API 신디사이저<br>• `gpsRunner.js`: 하버사인 GPS 추적 및 지터 필터<br>• `tamagotchi.js`: 5단계 진화 및 스탯 시뮬레이션<br>• `challenge.js`: 21일 습관 챌린지 및 BMR/BMI 계산<br>• `quests.js`: 일일/주간 미션 및 업적 엔진<br>• `catalog.js`: 20종 상점 카탈로그 데이터 모델<br>• `paypalBridge.js`: PayPal 결제 트랜잭션 연동<br>• `firebaseClient.js`: Firestore 실시간 동기화 바인딩 |
| **HTML5** | 시맨틱 구조 & 화면 쉘 | • `index.html`: 5대 탭 UI, NRC 스타일 HUD, 다마고치 룸 인터페이스<br>• `workout.html`: 상하 50:50 분할 AI 웹캠 모션 트레이닝 인터페이스 |
| **CSS3** | 디자인 시스템 & 애니메이션 | • `styles.css`: CSS Variables 기반 테마 토큰, Flexbox/Grid 레이아웃, 네온 볼트 글래스모피즘(`backdrop-filter`), 펄스/샤인 모션 효과 |
| **JSON** | 데이터 규격 & 설정 파일 | • `manifest.json`: PWA 앱 아이콘 및 풀스크린 디스플레이 설정<br>• `firebase.json`: 호스팅 라우팅 및 캐싱 헤더 정의<br>• `firestore.indexes.json`: Firestore 복합 쿼리 색인 정의 |
| **Firestore Rules** | 데이터베이스 보안 | • `firestore.rules`: 사용자 권한 격리 및 데이터 스키마 유효성 검증 |
| **Markdown / Mermaid** | 문서화 및 아키텍처 다이어그램 | • PRD, 시스템 사양서, 플로우차트, 시퀀스 다이어그램, 간트차트 설계 |

---

## 5. 🧠 종합 기획 내용 (Product Planning & Mechanics)

### 5.1. 행동 심리학 & 게이미피케이션 (Neuroscience & Octalysis)
1. **기저핵(Basal Ganglia) 도파민 즉각 보상 루프**:
   * 체중 감량이나 심폐 지구력 같은 전통적 운동 혜택은 수개월 뒤에 나타나는 '지연된 보상'이므로 90%의 비기너가 포기합니다.
   * RUNNOW는 러닝이나 홈트 종료 즉시 **수 초 내에 다마고치 레벨업 이펙트, 스탯 폭발적 상승, 볼트코인(VC) 지급, 픽셀 진화 연출**을 제공하여 뇌가 '운동 = 즉각적 쾌락과 보상'으로 각인하도록 유도합니다.
2. **21일 습관 부트캠프 (UCL 66일 연구 기반)**:
   * 런던대(UCL) 연구에 따르면 실제 습관 자동화에는 평균 66일이 소요됩니다. 21일 챌린지는 습관 완성기가 아니라 **'초기 진입 저항선을 돌파하고 자기 효능감(Self-Efficacy)을 극대화하는 부트캠프'**로 포지셔닝되었습니다.
3. **옥탈리시스(Octalysis 8 Core Drives) 8대 동기 매트릭스**:
   * **CD 1 (거대한 사명감)**: 나의 땀과 달리기가 멸종 위기의 사이버 펫을 부화시키고 진화시킨다는 스토리텔링.
   * **CD 2 (진보와 성취)**: 누적 5km, 20km, 50km, 100km 돌파 시 5단계 변신 및 배지 수여.
   * **CD 3 (창의성 부여)**: 20종 장비(러닝화, 바이저, 오라 등) 커스텀 조합.
   * **CD 4 (소유권과 자산)**: 운동으로 채굴한 볼트코인으로 영구 소장 아이템 구매.
   * **CD 6 (희소성과 갈망)**: 21일 완주자 한정 '골든 챔피언 오라'.
   * **CD 8 (손실 회피 완충)**: 운동을 쉬어도 즉시 펫이 죽지 않고 '에너지 저하' 상태로 유예 후 스트릭 실드로 방어.

### 5.2. 다마고치 5단계 진화 & 3대 스탯 알고리즘
* **진화 단계 명세**:
  1. **Phase 1: Runner Egg (러너 에그)** - 가입 즉시 (0 km) / 네온 볼트 알 / 튜토리얼 완료 시 부화
  2. **Phase 2: Rookie Chick (루키 병아리)** - 누적 **5.0 km** 달성 / 헤드밴드 병아리 / 일일 러닝 XP +10%
  3. **Phase 3: Urban Runner (어반 러너)** - 누적 **20.0 km** 달성 / 바람막이 사이버 여우 / 배고픔 소모 -15%
  4. **Phase 4: Marathon Master (마라톤 마스터)** - 누적 **50.0 km** 달성 / 사이버 표범 / 코인 획득량 +20%
  5. **Phase 5: Cyber Speedster (사이버 신수)** - 누적 **100.0 km** 달성 / 번개 오라의 궁극 신수 / 상점 15% 상시 할인
* **3대 핵심 능력치**:
  * **근력 (Might)**: 총 누적 거리 및 푸시업/스쿼트 근력 운동 비례 ➔ 체력 게이지 확장
  * **민첩 (Agility)**: 평균 페이스(min/km) 속도 비례 ➔ 이동 모션 가속
  * **멘탈 (Spirit)**: 21일 연속 출석 및 일일 미션 달성 비례 ➔ 스트릭 보호력 강화

### 5.3. 비즈니스 모델(BM) & 20종 정규 상점 카탈로그
* **인게임 경제**: 1km 완주 시 기본 10 VC(볼트코인) 지급 + 페이스 보너스(최대 +5 VC).
* **20종 카탈로그 (5대 카테고리)**:
  1. **러닝화 (4종)**: Volt Pegasus Turbo ($4.99), Cyber VaporFly Next% ($9.99), Carbon Streak X ($14.99), Alpha Aero Fly ($19.99)
  2. **에너지 (4종)**: Volt Hydration ($0.99), Nano Electrolyte Gel ($1.99), Beast Protein Shake ($2.99), Phoenix Elixir ($4.99)
  3. **스킨/오라 (4종)**: Cyberpunk Neon Visor ($2.99), Night Tracksuit Volt ($5.99), Golden Champion Aura ($8.99), Midnight Ninja Hoodie ($6.99)
  4. **웨어러블 (4종)**: Titanium GPS Pro Watch ($3.99), Aero Speed Sunglasses ($2.49), Reflex LED Armband ($1.99), SoundPulse Headband ($3.49)
  5. **프리미엄 패스 (4종)**: 3-Week Double XP Pass ($9.99), Daily Streak Shield ($4.99), Master Trophy Box ($12.99), VIP Diamond Club ($19.99/월)

### 5.4. 온디바이스 15대 AI 모델 & 카페24 도메인 확장 아키텍처
* **카페24 CNAME 라우팅**: 기존 쇼핑몰(`beauscreators.com`) 중단 없이 서브도메인(`runnow.beauscreators.com`, `nutrios.beauscreators.com`)으로 무한 확장.
* **WebGPU 온디바이스 15대 AI 라인업**:
  * 초경량 실시간 코칭 7종: Gemma 2 (2B), Llama 3.2 (1B/3B), Qwen 2.5 (0.5B/1.5B/3B), Phi-4 Mini (3.8B)
  * 비전 멀티모달 4종: PaliGemma 2 (3B), Phi-3.5 Vision (4.2B), Qwen2-VL (2B), MobileVLM v2 (1.7B)
  * 심층 추론 2종: DeepSeek-R1 Distill (1.5B / 7B)
  * 음성 인식 2종: Whisper Tiny Web, Whisper Base Web

---

## 6. 📂 핵심 파일별 역할 및 시스템 매핑

```
Test_proj/proj_01/
├── index.html              # 메인 러닝 OS 앱 쉘 (5대 탭 UI, NRC Live HUD, 다마고치 룸)
├── workout.html            # AI 웹캠 모션 트레이닝 화면 (MediaPipe + YouTube 듀얼 뷰)
├── styles.css              # NRC 시그니처 볼트/다크 테마 디자인 시스템 (글래스모피즘)
├── app.js                  # 전체 앱 라이프사이클 및 화면 라우팅, 전역 상태 통합 관리
├── motionTracker.js        # MediaPipe 관절 각도 벡터 계산 및 실시간 운동 자세 판정 머신
├── motionSound.js          # Web Audio API 기반 비프음, 차임벨, 버저 사운드 신디사이저
├── gpsRunner.js            # 고정밀 GPS 엔진, 하버사인 거리 누적, 지터/속도 필터
├── tamagotchi.js           # 5단계 진화 트리, 3대 스탯 시뮬레이션, 먹이/훈련 인터랙션
├── challenge.js            # 21일 습관 부트캠프, 일일 미션 체크, 신체 지수(BMR/BMI) 관리
├── quests.js               # 일일 퀘스트, 마일스톤 업적 달성 및 보상 엔진
├── catalog.js              # 20종 인게임 상점 아이템 정본 데이터 모델
├── paypalBridge.js         # PayPal JS SDK 주문 생성 및 캡처, 인벤토리 지급 브릿지
├── firebaseClient.js       # Firebase Auth 및 Cloud Firestore 실시간 동기화 클라이언트
├── firebaseConfig.js       # Firebase 프로젝트 키 및 환경 구성
├── firestore.rules         # 데이터 보안 및 유저별 접근 제어 규칙
├── sw.js                   # PWA Service Worker (오프라인 캐싱 및 리소스 프리패치)
├── manifest.json           # PWA 웹앱 매니페스트 (홈 화면 설치 및 아이콘 정의)
└── RUNNOW_Master_PRD.md    # BeausCreators 전사 마스터 기획서 (SSOT)
```

---

*본 종합 보고서는 BeausCreators 중앙 본사(HQ) 및 지점(Branch)의 영구 지식 자산으로 등록 및 동기화되었습니다.*
