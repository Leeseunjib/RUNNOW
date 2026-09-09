# RUNNOW Deployment & Operational Rules (CEO Inviolable Constraint)

Cursor 항상 적용 규칙. `.cursor/rules/runnow-internal-test-only.mdc`

## 0. 핵심 배포 원칙 (이건우 대표님 지침)
- **Cursor 기본 작업 공간은 내부 테스트 전용이다.** 상용 주소는 확인·승급 지시가 있을 때만 연다.
- **모든 일상 작업 및 리팩토링의 배포 대상**: 오직 **내부 테스트 전용 채널(`dev`)**로만 배포한다.
  - 배포 명령어: `npm run deploy:dev` (`firebase hosting:channel:deploy dev --expires 30d`)
  - 테스트 URL: `https://runnow-37af9--dev-irl7g2ve.web.app`
- **상용 프로덕션(`runnow.beauscreators.com`) 승급 통제권 (CEO 전결 원칙)**:
  - **AI 에이전트는 절대로 상용 승급 명령(`npm run promote:live` 또는 `firebase deploy --only hosting`)을 직접 실행하지 않는다.**
  - AI 에이전트는 오직 `dev` 테스트 채널 배포(`npm run deploy:dev`)까지만 수행한다.
  - 상용 배포는 **오직 이건우 대표님께서 검증 후 터미널(PowerShell)에 직접 `npm run promote:live`를 입력하여 최종 승인**한다.

## 1. 환경 분리 및 안전 격리
- 내부 테스트 채널 접속 시 구글 광고 스크립트 실행이 완전 차단(Google Safety Shield)되어 무효 트래픽 위험 0%를 유지해야 한다.
- 모든 결제 모달은 Sandbox Test 모드로 동작하여 실제 청구가 0원이어야 한다.
