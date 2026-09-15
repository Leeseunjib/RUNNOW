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
