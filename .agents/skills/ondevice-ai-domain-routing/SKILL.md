---
name: ondevice-ai-domain-routing
description: "카페24 도메인(beauscreators.com) 멀티앱 CNAME 라우팅 및 WebGPU 기반 온디바이스(On-Device) 15대 AI 모델(Gemma2, Llama3.2, Qwen2.5, Phi-4, DeepSeek-R1, PaliGemma, Whisper 등) 연동 표준 스킬입니다. 제로 서버 비용($0), 100% 프라이버시, 오프라인 지원 아키텍처를 가이드합니다."
---

# On-Device AI 15 Models & Multi-App Domain Routing Skill

## 1. 개요
본 스킬은 `beauscreators.com` 기반의 멀티 서비스 확장과 WebGPU / MediaPipe 기반 온디바이스(On-Device) 15대 AI 모델 정예 패키지의 설계·배포·운영 표준을 정의합니다.

## 2. 카페24 도메인 멀티앱 라우팅 SOP
1. **메인 루트 도메인 (`beauscreators.com`)**:
   - 기존 카페24 웹호스팅 / 쇼핑몰 연결 유지 (A 레코드/기존 CNAME 보존).
2. **서브도메인 증설 (`*.beauscreators.com`)**:
   - 카페24 관리자 콘솔 ➔ [도메인관리] ➔ [DNS 관리] ➔ [별칭(CNAME) 관리] 선택.
   - [CNAME 추가]:
     - 도메인 별칭: `runnow`, `nutrios`, `store` 등 서비스 약칭.
     - 실제 도메인명: Firebase Hosting 주소 (`xxx.web.app`).
3. **Firebase Hosting 커스텀 도메인 등록**:
   - Firebase 콘솔 ➔ Hosting ➔ 커스텀 도메인 추가 (`runnow.beauscreators.com`).
   - 자동 SSL 보안인증서(HTTPS) 프로비저닝 확인.

## 3. 온디바이스(On-Device) 15대 AI 모델 라인업 매트릭스
- **원칙**: 중앙 API 서버 비용 $0 유지, 사용자 데이터 프라이버시 100% 보호, 오프라인 작동.

### 4대 카테고리별 15종 모델 구성
1. **초경량 텍스트 & 실시간 코칭 (7종)**:
   - `Google Gemma 2 (2B)`: 표준 러닝/대화 코치 (기본 추천).
   - `Meta Llama 3.2 (1B)`: 700MB 초경량 0.1초 모바일 초고속 원포인트 코칭.
   - `Meta Llama 3.2 (3B)`: 모바일 올라운더 리포트 생성.
   - `Alibaba Qwen 2.5 (0.5B)`: 300MB 웨어러블/스마트워치 전용.
   - `Alibaba Qwen 2.5 (1.5B)`: 아시아권/한국어 특화.
   - `Alibaba Qwen 2.5 (3B)`: 앱 제어 및 JSON 데이터 파싱.
   - `Microsoft Phi-4 Mini (3.8B)`: 페이스·심박수·칼로리 정밀 수치 계산.

2. **비전 멀티모달 & 카메라 시각 분석 (4종)**:
   - `Google PaliGemma 2 (3B)`: 러닝화 마모도 판별 및 착지 자세 교정.
   - `Microsoft Phi-3.5 Vision (4.2B)`: 식단/영양성분표 사진 분석 및 칼로리 산출.
   - `Alibaba Qwen2-VL (2B)`: 헬스장 기구 및 운동 공간 인식.
   - `MobileVLM v2 (1.7B)`: 초경량 야외 표지판/코스 비전 인식.

3. **심층 생각 & 트레이닝 플래닝 (Reasoning 2종)**:
   - `DeepSeek-R1 Distill Qwen (1.5B)`: 부상 방지 4주 주기화 마라톤 플랜 자율 추론.
   - `DeepSeek-R1 Distill Llama (7B/8B)`: 엘리트 선수용 생리학 트레이닝 컨설팅 (플래그십 기기).

4. **핸즈프리 음성 실시간 인식 (Speech 2종)**:
   - `OpenAI Whisper Tiny Web`: 75MB 초극소, 달리는 중 음성 대화 인식.
   - `OpenAI Whisper Base Web`: 도심/도로변 소음 환경 노이즈 캔슬링 음성 명령.

## 4. BYOK 및 온디맨드 로딩 SOP
- **다운로드 전략**: 유저 선택 시 해당 모델만 1회 온디맨드 다운로드 후 브라우저 `Cache API`에 영구 보관.
- **폴백 옵션**: 저사양/WebGPU 미지원 기기는 Google AI Studio 무료 API 또는 BYOK(User Key)로 자동 우회.
