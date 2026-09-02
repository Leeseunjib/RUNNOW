# 2026-09-02 RunNow & BeausCreators 작업 일지

> **작성자**: CTO 거누 (Backend/Infra/Architecture Lead)  
> **승인자**: 이건우 대표님 (BSC CEO)  
> **작업 도메인**: RunNow / BeausCreators Multi-App & On-Device AI

---

## 1. 주요 작업 내역 요약

1. **카페24 도메인(`beauscreators.com`) & Firebase 멀티앱 CNAME 라우팅 완료**:
   - 메인 웹/쇼핑몰(`beauscreators.com`)은 카페24 호스팅 유지.
   - RunNow 전용 서브도메인(`runnow.beauscreators.com` ➔ `runnow-37af9.web.app`) CNAME 등록 및 SSL 프로비저닝 연결 세팅 완료.
2. **온디바이스(On-Device) 로컬 AI 아키텍처 전략 확정**:
   - 중앙 서버 비용 $0, 완벽한 개인정보 보호, 오프라인 지원을 위한 WebGPU 기반 온디바이스 AI 표준화.
3. **온디바이스 15대 AI 최정예 모델 라인업 구축 및 스펙 정리**:
   - 초경량 텍스트 7종 (Gemma 2, Llama 3.2, Qwen 2.5, Phi-4 Mini 등)
   - 비전 멀티모달 4종 (PaliGemma 2, Phi-3.5 Vision, Qwen2-VL, MobileVLM)
   - 심층 추론 2종 (DeepSeek-R1 Distill 1.5B/7B)
   - 핸즈프리 음성 2종 (Whisper Tiny/Base WebGPU)
4. **전사 문서 및 스킬 자산화 완료**:
   - 루트 정본: `06_OnDevice_15_AI_Models_and_Domain_Spec.md`
   - 표준 가이드: `docs/BeausCreators_OnDevice_15_AI_Models_Master_Spec.md`
   - 인프라 매뉴얼: `docs/Cafe24_Firebase_MultiApp_and_OnDevice_AI_Manual.md`
   - AI 에이전트 전역 스킬: `ondevice-ai-domain-routing/SKILL.md`
