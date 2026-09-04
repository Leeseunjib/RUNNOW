# ⚡ [작업일지] RUNNOW 개발 전수 분석 보고서 작성 및 지식 자산 동기화
- **일자**: 2026-09-04
- **담당자**: CTO 거누 (Backend/Infra/Architecture Lead)
- **프로젝트**: RUNNOW (RunGotchi)
- **위치**: `proj_01` (Spoke) ➔ `01.BSC_HQ` (Hub)

---

## 📌 1. 작업 개요 및 대표님 지시 사항
1. **지시 사항**: 지금 앱을 만들면서 들어간 Skill, 기술 스택, 활용 언어, 기획 내용을 하나도 빠짐없이 종합 분석하여 Word(`.docx`) 및 마크다운(`.md`) 파일로 생성하고, HQ(본사) 문서함에 동기화 아카이빙할 것.
2. **수행 목적**: RUNNOW 프로젝트의 전사 기술 사양 및 비즈니스/심리학 기획 아키텍처를 영구 보존하고 SSOT(단일 진실 공급원)로 확립.

---

## 🛠️ 2. 상세 작업 내역

### 1) 기술 및 기획 요소 전수 분석
- **투입 Skill 7종 정리**:
  - `ondevice-ai-domain-routing` (카페24 CNAME 라우팅 & WebGPU 15대 AI)
  - `notebooklm-automation-pipeline` (게이미피케이션 학술 연구 자동화)
  - `StitchMCP` (NRC 볼트 테마 디자인 시스템)
  - `firebase-mcp-server` (인증, Firestore, 호스팅)
  - `paypal-mcp-server` (글로벌 결제 및 20종 상점)
  - `accidental-data-loss-prevention` (데이터 무손실 원칙)
  - `bsc-global-rules` (CHLGD 운영 체계)
- **적용 기술 스택 정리**:
  - Google MediaPipe Pose 33개 관절 60FPS 온디바이스 비전 AI 및 3대 운동(푸시업/스쿼트/윗몸일으키기) 각도 판정
  - Web Audio API 내장 오스킬레이터 사운드 신디사이저 (`motionSound.js`)
  - YouTube Iframe API 분할 뷰
  - 하버사인(Haversine) 정밀 GPS 거리 누적 공식, 정수 미터 표기, 지터/속도 필터
  - Firebase Auth/Firestore/Hosting 및 PayPal SDK, PWA Service Worker
- **활용 언어 및 포맷 정리**:
  - JavaScript (ES6+), HTML5, Vanilla CSS3, JSON, Firestore Rules, Markdown/Mermaid
- **종합 기획 체계 정리**:
  - 기저핵 도파민 즉각 보상 루프, UCL 66일 기반 21일 부트캠프, 옥탈리시스 8 Core Drives
  - 다마고치 5단계 진화 트리 및 3대 스탯(근력/민첩/멘탈) 알고리즘
  - 20종 상점 상품 카탈로그 및 인게임 경제(VC)
  - 온디바이스 15대 AI 라인업 및 카페24 서브도메인 확장 전략
- **18개 핵심 파일별 역할 매핑**

### 2) 문서 산출물 생성 및 양방향 동기화
- **Markdown 보고서 (`.md`)**:
  - 로컬: `c:\BeausCreators\03.Research\바이브코딩 연구\Test_proj\proj_01\docs\2026-09-04_RUNNOW_Tech_and_Planning_Master_Report.md`
  - HQ 동기화: `C:\BeausCreators\01.BSC_HQ\1.Documents\01.보고서\2026-09-04\2026-09-04_RUNNOW_Tech_and_Planning_Master_Report.md`
- **Word 정밀 보고서 (`.docx`)**:
  - python-docx 라이브러리를 활용한 스타일링(슬레이트/다크 헤더, 테이블 테두리, 배경 음영, 마진 최적화) 빌드 완료
  - 로컬: `c:\BeausCreators\03.Research\바이브코딩 연구\Test_proj\proj_01\docs\2026-09-04_RUNNOW_Tech_and_Planning_Master_Report.docx`
  - HQ 동기화: `C:\BeausCreators\01.BSC_HQ\1.Documents\01.보고서\2026-09-04\2026-09-04_RUNNOW_Tech_and_Planning_Master_Report.docx`

---

## 🎯 3. 결과 및 향후 계획
- **검증 완료**: 로컬 및 HQ 폴더 모두에 정상 파일 크기(MD 15KB, DOCX 44KB)로 유실 없이 100% 저장 완료.
- **Firebase 배포 완료**:
  - 프로젝트: `runnow-37af9`
  - 배포 항목: Firestore (규칙 `firestore.rules`, 인덱스 `firestore.indexes.json`), Hosting (정적 자산 225개 파일)
  - 라이브 URL: `https://runnow-37af9.web.app` (HTTP 200 OK 검증 완료)
- **카메라 연결 멈춤(Freezing) 긴급 조치**:
  - 원인: `onloadedmetadata` 이벤트 누락 및 비동기 모델 로딩 대기 동안 대기 커버가 화면을 덮고 있던 병목
  - 해결: (1) `readyState >= 1` 즉시 체크 + 1.2초 폴백, (2) `onStreamReady` 콜백으로 카메라 즉각 노출, (3) `promiseWithTimeout` 안전 타임아웃, (4) 백그라운드 AI 사전 로드(Pre-warm)
  - 배포: Git 커밋 (`c92c48d`) 및 Hosting 2차 배포 완료 (PWA 캐시 버전 `runnow-v3.5`)
- **사용자 프로필 영구 보존 및 온보딩 재작성 방지 (UX 대폭 개선)**:
  - 원인: 게스트 로그인 시 매번 랜덤 새 UID 발급, 세션 12시간 만료 시 강제 로그아웃, 로그인 시 기존 프로필 미연동으로 온보딩 화면(나이/몸무게/키)이 매번 강제 노출되던 UX 병목
  - 해결: (1) 세션 유효기간 1년으로 연장 및 자동 갱신, (2) 기기 고정 게스트 UID(`RUNNOW_DEVICE_GUEST_UID`) 유지, (3) 글로벌 프로필(`RUNNOW_GLOBAL_PROFILE`) 및 펫(`RUNNOW_GLOBAL_PET`) 저장소 구축으로 재로그인 시 기존 신체 정보 즉각 복원 및 온보딩 자동 패스스루, (4) 온보딩 화면 내 "기본 정보로 바로 시작하기" 원클릭 버튼 추가
- **향후 과제**: 온디바이스 비전 트레이닝 엔진의 제스처 컨트롤(MediaPipe Hands) 추가 고도화 및 네이티브 앱 패키징 준비.



