# RUNNOW 인프라·구글 애드센스·듀얼 배포 체계 최종 구축 보고서

**보고 일자**: 2026-09-09
**작성자**: CTO 거누 (Backend / Infra / Architecture Lead)
**수신자**: 이건우 대표님 (BSC 최고 경영자)
**소속**: BeausCreators 중앙 본사(HQ) 기술연구팀
**대상 프로젝트**: RUNNOW (`runnow.beauscreators.com`)

---

## 1. 종합 추진 경과 및 경영 요약 (Executive Summary)

본 보고서는 2026년 9월 9일 이건우 대표님의 지휘하에 단행된 **RUNNOW 프로젝트의 인프라 구축, 구글 애드센스 승인 심사** **제출, 소비자 심리학 기반 UX 리팩토링, 그리고 전사 웹/앱 듀얼 트랙 배포 파이프****라인 확립** 결과를 총괄하여 중앙 본사(HQ)에 정식 보고합니다.

금일 작업을 통해 다음 5대 핵심 목표가 100% 달성되었습니다:

1. **카페24 도메인 DNS 전파 및 Firebase 멀티앱 무손실 라우팅 완료** (`HTTP 200 OK`).
2. **구글 애드센스(Google AdSense) 필수 컴플라이언스 3종 문서 배포 및 사이트 소유권·CMP 검토 제출 완료** (`[준비 중]` 심사 상태 진입).
3. **소비자 심리학(사회적 증거, 손실 회피, 인지적 무마찰) 기반 브랜드 중심 UX 카피 전면 개편**.
4. **유니티(Unity) 스타일 내부 테스트 격리 환경(Firebase Dev Channel) 및 Google Safety Shield 구축**.
5. **전사 웹/앱 듀얼 트랙 격리 및 CEO 전결 수동 터미널 승급 헌장(Charter) 제정 및 Git 반영**.

---

## 2. 5대 핵심 과제별 상세 성과

### 과제 1. 카페24 도메인 연동 및 멀티앱 CNAME 라우팅

- **기존 자산 보존**: 기존 Figma 공식 랜딩페이지인 `www.beauscreators.com`은 CNAME `sites.figma.net.`으로 1밀리미터의 손실 없이 원형 보존.
- **루트 도메인 연결**: `beauscreators.com` (A 레코드 `199.36.158.100`)을 Firebase Hosting에 연결하고 Google Trust Services SSL 인증서 자동 발급 완료.
- **서브 도메인 연결**: `runnow.beauscreators.com`을 Firebase 서브도메인으로 완벽 매핑.

### 과제 2. 구글 애드센스(Google AdSense) 승인 심사 완비

- **게시자 계정**: `pub-8037321916672881`
- **루트 `ads.txt` 연동**: `google.com, pub-8037321916672881, DIRECT, f08c47fec0942fa0`
- **법적/정책 필수 3종 문서 신설 및 배포**:
  - `privacy.html`: 온디바이스 AI 비전(WebGPU/MediaPipe) 프라이버시(서버 무단 전송 원천 차단) 및 구글 광고 쿠키 정책 고지.
  - `terms.html`: 공정거래위원회 표준 기반 서비스 이용약관.
  - `about.html`: 운동생리학(METs) 및 인터벌 트레이닝 러닝 과학 학술 안내.
- **애드센스 콘솔 처리 완료**:
  - 사이트 소유권 확인 (✔)
  - 리뷰 요청 제출 (✔)
  - 유럽 경제 지역(EEA) GDPR CMP 사용자 동의 메시지 게시 (✔)
  - 최종 상태: **`[준비 중]` (구글 심사 진행 중)**

### 과제 3. 소비자 심리학 기반 브랜드 중심 UX 카피 리팩토링

- **AI 개발자 관점의 어색한 기계적 문구 전면 퇴출**:
  - "사이버 펫", "랜드마크/관절 점", "인체 스펙", "도파민 세계/루틴", "VC" 일괄 청산.
- **소비자 행동경제학 프레임워크 적용**:
  - **사회적 증거 (Social Proof)**: "러너 84%의 선택 | BEST VALUE -35%" (연간 플랜)
  - **인지적 무마찰 (Zero Friction)**: "7일 무료 체험으로 RUNNOW PRO 시작하기", "언제든 1클릭 해지", 기본 GPS 러닝 100% 무료 보장.
  - **보증 신뢰 (Risk Reversal)**: "🔒 256비트 SSL 보안 결제 • 7일 내 무료 취소 • 위약금 없음".
  - **화폐 통일**: `볼트 포인트(P)`.

### 과제 4. 유니티(Unity) 스타일 내부 테스트 격리 환경 구축

- **Google Safety Shield (구글 정책 위반 리스크 0% 가드)**:
  - 내부 테스트 도메인(`--dev`) 접속 시 `pagead2.googlesyndication.com` 스크립트 실행을 원천 차단하여, 구글 서버로의 네트워크 요청/노출/클릭을 정확히 0건으로 유지.
  - 대표님 및 가족분들의 테스트 클릭으로 인한 무효 트래픽/어뷰징 제재 리스크 100% 소멸.
- **PayPal 결제 샌드박스 격리**:
  - 실제 카드 결제 0원 보장, 가상 VISA 4242 기반 인게임 재화/아이템 승인 로직만 시뮬레이션.
  - 페이월 모달에 **'👑 대표님 전용 PRO VIP 마스터 패스 (무료 즉시 활성화)'** 탑재.
- **헤더 시각적 잡음 제거**:
  - 좁은 스마트폰 화면에서 레이아웃을 해치던 `[INTERNAL TEST]` 텍스트 뱃지를 완전히 삭제하고 모바일 줄바꿈 최적화 적용.

### 과제 5. 전사 웹/앱 듀얼 트랙 격리 및 CEO 전결 수동 승급 헌장 제정

- **원칙**: 모든 일상 작업은 내부 테스트 채널(`dev`)에서만 수행하며, 상용 출시 승급은 오직 **이건우 대표님께서 직접 터미널에 명령어를 입력하여 실행**한다.
- **상용 승급 명령어 (CEO 전용)**:
  ```bash
  npm run promote:live
  ```

---

## 3. 인프라 및 Git 저장소 SSOT 현황

| 구분                             | 접속 주소 / 위치                                                                                              | 용도 및 권한                                     |
| :------------------------------- | :------------------------------------------------------------------------------------------------------------ | :----------------------------------------------- |
| 🐙**GitHub 공식 저장소**   | [`https://github.com/Leeseunjib/RUNNOW`](https://github.com/Leeseunjib/RUNNOW)                               | `master`(상용 릴리즈) / `develop`(일상 개발) |
| 🚀**상용 공식 서비스**     | [`https://runnow.beauscreators.com`](https://runnow.beauscreators.com)                                       | 일반 대중 유저 전용 (실제 광고/수익 창출)        |
| 🛡️**내부 테스트 전용**   | [`https://runnow-37af9--dev-irl7g2ve.web.app`](https://runnow-37af9--dev-irl7g2ve.web.app)                   | 대표님, 가족, BSC 팀원 전용 (광고 안전 모드)     |
| 🏢**본사(HQ) 작업일지**    | `C:\BeausCreators\01.BSC_HQ\1.Documents\02.작업일지\2026-09-09_RunNow_WorkLog.md`                           | 일일 개발 및 인프라 상세 로그 정본               |
| 🏢**본사(HQ) 정식 보고서** | `C:\BeausCreators\01.BSC_HQ\1.Documents\01.보고서\2026-09-09\RUNNOW_인프라_애드센스_듀얼배포_최종보고서.md` | 본 정식 보고서                                   |

---

## 4. 품질 및 보안 검증 결과

```bash
npm test
>>> ALL PASS (294/294 테스트 전 종목 100% 통과)
- SubscriptionManager (월간/연간/VIP 구독 주기 및 권한 검증)
- MotionTracker (스쿼트, 푸시업, 점핑잭, 플랭크, 런지, 버피)
- GPSRunner (하버사인 고정밀 누적 및 지터 필터)
- Tamagotchi (5단계 진화, 레벨업, 스탯)
- Quests & 21-Day Challenge (일일/주간/바운티 퀘스트 및 스트릭)
- Firestore Security Rules & PayPal Webhook Security
```

---

## 5. 향후 추진 계획 (Next Actions)

1. **구글 애드센스 심사 결과 모니터링**:
   - 영업일 기준 1~3일 이내 심사 승인 완료 시 상용 사이트 광고 슬롯 정식 개시.
2. **Google Play Console 네이티브 안드로이드 앱(TWA/Capacitor) 패키징 착수**:
   - 웹 안정화 후 Google Play 내부 테스트 트랙용 AAB 패키징 파이프라인 구축.
3. **내부 테스트 피드백 수집 및 온디바이스 AI 고도화**:
   - 대표님 및 테스터들의 실기기 러닝 데이터를 바탕으로 UI/UX 미세 조정.

---

**보고자**: BeausCreators CTO 거누
**승인자**: BeausCreators CEO 이건우 대표님
