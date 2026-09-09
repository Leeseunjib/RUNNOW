# RUNNOW Deployment & Operational Rules (CEO Inviolable Constraint)

## 0. 핵심 배포 원칙 (이건우 대표님 지침)
- **모든 일상 작업 및 리팩토링의 배포 대상**: 오직 **내부 테스트 전용 채널(`dev`)**로만 배포한다.
  - 배포 명령어: `npm run deploy:dev` (`firebase hosting:channel:deploy dev --expires 30d`)
  - 테스트 URL: `https://runnow-37af9--dev-irl7g2ve.web.app`
- **상용 프로덕션(`runnow.beauscreators.com`) 배포 절대 금지 원칙**:
  - 대표님의 명시적이고 직접적인 지시("상용으로 올려", "프로덕션에 배포해" 등)가 없는 한, **어떠한 에이전트도 상용 사이트에 배포(`npm run promote:live` 또는 `firebase deploy --only hosting`)해서는 안 된다.**
  - 상용 배포는 오직 대표님의 최종 승인이 있을 때만 검증된 `dev` 빌드를 승급 복제(`npm run promote:live`)한다.

## 1. 환경 분리 및 안전 격리
- 내부 테스트 채널 접속 시 구글 광고 스크립트 실행이 완전 차단(Google Safety Shield)되어 무효 트래픽 위험 0%를 유지해야 한다.
- 모든 결제 모달은 Sandbox Test 모드로 동작하여 실제 청구가 0원이어야 한다.
