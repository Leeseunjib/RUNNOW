# 2026-09-15 RunNow 작업일지

## 1. 업무 개요
- **일자**: 2026-09-15
- **담당자**: 거누 (CTO / 개발 총괄)
- **요청자**: 이건우 대표님 (BSC CEO)
- **주요 업무**: Git 및 터미널 핵심 명령어 교육 가이드 및 전사 표준 엑셀 치트시트 제작 및 바탕화면 배포

---

## 2. 세부 진행 내역

### 1) Git 및 터미널 명령어 실무 교육 가이드 제공
- Git 3단계 라이프사이클(Working Directory -> Staging Area -> Repository -> Remote) 기반 체계적 정리
- 4대 일상 작업 루틴 (`status`, `add`, `commit`, `push`) 및 브랜치(`branch`, `switch`, `merge`), 협업(`pull`, `fetch`), 임시보관(`stash`), 취소/복구(`restore`, `reset`, `revert`) 가이드
- 터미널(PowerShell, Linux/Mac, Git Bash) 기본 조작(`cd`, `pwd`, `ls`, `mkdir`, `cp`, `mv`, `cat`, `rm`) 및 Windows 전용 명령어 비교표 안내
- 안전 수칙: 데이터 유실 방지를 위한 `rm -rf` 및 `git reset --hard` 주의사항 강조

### 2) 프리미엄 엑셀 치트시트(`.xlsx`) 자동 생성 및 다중 배포
- **파일명**: `Git_및_터미널_명령어_총정리_치트시트.xlsx` (영문: `Git_and_Terminal_Command_Guide.xlsx`)
- **디자인 스타일**: Dark Navy 타이틀 바, Royal Blue 헤더, 얼터네이트 지브라 패턴 행, 가독성 높은 Consolas 코드 폰트, 중요도 및 주의사항 색상 뱃지, 열 너비 자동 최적화 및 틀 고정(Freeze Panes) 적용
- **시트 구성**:
  1. `🚀 Git 명령어 총정리` (36개 핵심 명령어 및 실무 팁)
  2. `💻 터미널 CLI 명령어` (28개 Windows PowerShell vs Linux/Mac 명령어)
  3. `⚡ 단축키 및 실무 꿀팁` (생산성 단축키, 특수 기호, Git 실무 팁, 안전수칙)
- **배포 경로**:
  - 대표님 바탕화면: `C:\Users\USER\OneDrive\Desktop\` 및 `C:\Users\USER\Desktop\`
  - 프로젝트 로컬 문서: `c:\BeausCreators\02.BSC_Branch\projects\Runnow\docs\`

---

## 3. 결과 및 확인
- 엑셀 파일 정상 생성 확인 및 무결성 검증 완료
- 바탕화면 바로 열기 가능 확인

---

## 4. 추가 (2026-09-15 · 소하) — 전사 Web→Expo 앱 전환 운영표준 HQ 등재

- **지시**: 이건우 대표님 — 앞으로 앱은 웹 제작 후 React Native(Expo)로 전환. 웹 원본 비파괴·복제본 실험.
- **산출**: `docs/2026-09-15_BSC_Web우선_ReactNative_Expo앱_전환_운영표준_보고서.md`
- **맵**: `projects/Directory_Map.md`에 `sandbox/Runnow_mb_v` 예정 및 전사 파이프라인 표기
- **HQ**: Spoke `sync_hq` Dual-Write → `01.BSC_HQ/1.Documents/01.보고서/2026-09-15/`


## 12. 1:1 케어팀 코치 배너 가독성 개선 및 진짜 사람 같은 AI 성우 음성 엔진 탑재 (2026-09-15 15:30)

### 1) 배경 및 대표님 요구사항
- **가독성 결함**: 1:1 케어팀 페이지 상단 코치 배너에서 텍스트와 3개 버튼이 한 줄에 좁게 몰려 '코\n치\n레\n오' 형태로 세로 줄바꿈되어 깨지는 심각한 레이아웃 결함 발생.
- **음성 피로도 해소**: 브라우저 내장 로봇 기계음(Web Speech API)의 이질감과 피로도로 인해 진짜 사람 같은 자연스러운 한국인 음성 지원 강력 요청.

### 2) 기술 구현 내역
1. **코치 프로필 배너 2행 구조 분리 (가독성 100% 개선)**:
   - 1행: 코치 원형 아바타 + 네온 링 + 이름(16px Bold, `white-space: nowrap`) + 역할 뱃지(`남성 전담 PT`) + 코치 한줄 소개.
   - 2행: 독립 액션 툴바(`⭐ 전담 지정`, `🔑 구글 AI 연동 ($0원)`, `🔊 음성 켜짐/꺼짐`).
   - 모바일 375px~430px 뷰포트에서도 글자 쪼개짐 원천 차단 및 시인성 극대화.
2. **진짜 사람 같은 인공신경망 성우 오디오 팩 14종 탑재 (`assets/audio/careteam/`)**:
   - 한국어 전문 신경망 모델(`ko-KR-InJoonNeural` 남성 활력 PT 톤, `ko-KR-SunHiNeural` 여성 상냥 코치 톤)로 14개 핵심 오디오 에셋 생성:
     - 코치별 인트로: `leo_intro.mp3`, `luna_intro.mp3`, `ellie_intro.mp3`, `drkay_intro.mp3`
     - 퀵 버블 실전 조언 10종: 레오/루나 폭식 만회(`cheat`), 무릎 부상 체크(`knee`), 3일 루틴(`routine`), 야식 SOS(`snack`), 번아웃 위로(`tired`)
3. **`careTeam.js` 3단계 하이브리드 음성 엔진 파이프라인**:
   - 1순위: 전용 신경망 성우 MP3 즉시 스트리밍 재생 (0ms 지연)
   - 2순위: 동적 AI 응답에 대해 Google 자연어 음성 스트림(`translate_tts`) 실시간 호출
   - 3순위: 네트워크 단절 시 브라우저 로컬 음성 엔진 폴백 안전장치 구현.

### 3) 검증 및 배포
- **CDP 브라우저 검증**: `runnow_careteam_banner_voice_verified.png` 캡처 완료 (배너 가독성 및 정렬 완벽 확인).
- **내부 테스트 채널 배포**: `https://runnow-37af9--dev-irl7g2ve.web.app`
- **Spoke ➔ HQ Dual-Sync 완료**: 본사 작업일지 및 지점 로컬 문서 이중 동기화.
