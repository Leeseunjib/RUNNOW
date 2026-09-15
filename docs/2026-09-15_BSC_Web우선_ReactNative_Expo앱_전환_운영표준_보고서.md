# BSC 제품 제작 운영표준 — Web 우선 → React Native (Expo) 앱 전환 보고서

- **일자.** 2026-09-15
- **지시.** 이건우 대표님
- **적용 범위.** `02.BSC_Branch` 전 제품 · 향후 신규 앱 전부
- **문서 성격.** 본사(HQ) 운영 정책 보고서 (가이드 직수정이 아닌 정책 선포·Evidence)
- **관련 제품 사례.** RUNNOW (`projects/Runnow` 웹 SSOT 유지 + 앱 복제 실험)

---

## 1. 한 줄 원칙

**먼저 웹으로 제품 가치를 검증하고, 그다음 React Native(Expo)로 앱 버전을 만든다.**  
웹을 버리고 앱만 가지 않는다. 원본 웹이 망가지면 안 된다.

---

## 2. 표준 파이프라인 (전사 기본)

| 단계 | 위치 | 할 일 | 금지 |
|---|---|---|---|
| 1. 웹 MVP | `02.BSC_Branch/projects/{Product}/` 또는 레인 내 웹 | PWA/웹으로 핵심 기능·BM·내부 테스트 | 상용 무단 배포 |
| 2. 웹 안정화 | 동일 웹 SSOT | `deploy:dev` 등 내부 테스트 채널만 | live/상용은 대표님 직접 지시 후에만 |
| 3. 앱 분기 | `sandbox/{Product}_mb_v/` 또는 `sandbox/{Product}_App/` | **웹 원본을 복제**한 뒤 Expo 앱으로 개조·언어/구조 실험 | 웹 SSOT를 직접 개조하며 앱 실험 |
| 4. 앱 승격 | `projects/{Product}_App/` 등 | README · Owner · Evidence · Directory_Map 등재 후 승격 | 빈 레인·더미 폴더 선행 생성 |
| 5. 스토어 | 앱 프로젝트만 | Android · Apple 내부 테스트 → 스토어 | 웹 Hosting 스크립트로 앱을 배포하지 않음 |

---

## 3. 원본 보호 규칙 (Hard)

1. **웹 SSOT** (`projects/{Product}`)는 앱 실험의 희생양이 되지 않는다.
2. 앱 작업은 **복제본**에서 진행한다. (대표님 2026-09-15 확정 방향)
3. 앱 → 웹 백포트는 **기본 금지**. 검증·승인된 것만 선별 이식한다.
4. 복제본의 웹용 `deploy:dev` / `promote:live`는 삭제하거나 `WEB_ONLY_DO_NOT_USE`로 격리한다.
5. 배포 기본은 **내부 테스트만**. 상용·스토어 프로덕션은 대표님 직접 지시 후에만.

---

## 4. 기술 표준

| 층 | 표준 | 비고 |
|---|---|---|
| 웹 | 기존 제품 스택 유지 (예: Vanilla/Vite/Firebase 등 제품별) | 제품 SSOT |
| 앱 | **React Native + Expo** | 전사 기본 앱 스택 |
| 이유 | Android · iOS 동시 타깃, OTA·개발 속도, 에이전트(유나) R&R과 정합 | 예외는 대표님 승인 |

언어·아키텍처를 복제본에서 바꾸는 실험은 허용하되, **전사 기본 종착지는 Expo**로 둔다.

---

## 5. 폴더·이름 권장

| 용도 | 권장 경로/이름 |
|---|---|
| 웹 정본 | `02.BSC_Branch/projects/{Product}/` |
| 앱 실험 복제 | `02.BSC_Branch/sandbox/{Product}_mb_v/` 또는 `{Product}_App/` |
| 앱 승격 후 | `02.BSC_Branch/projects/{Product}_App/` |
| README 필수 문구 | `Web SSOT = projects/{Product}. 이 트리는 모바일(Expo) 실험/제품.` |

RUNNOW 사례: 웹 `projects/Runnow` 유지 → 앱 복제명 `Runnow_mb_v` (sandbox 우선).

---

## 6. Cursor / 에이전트 준수

- 평시 워크스페이스는 **작업 중인 제품 폴더만** 연다. 웹과 앱 복제본을 한 세션에서 동시에 대규모 수정하지 않는다.
- 앱 세션 Owner는 복제본 경로만 WRITE. 웹 SSOT는 명시 지시 없으면 READ.
- 내부 테스트 전용 규칙(`bsc-internal-test-only`)은 웹·앱 모두 적용.

---

## 7. HQ 반영

- 본 문서는 Spoke Dual-Write로 `01.BSC_HQ/1.Documents/01.보고서/2026-09-15/`에 동기화한다.
- 가이드(`0.Guidelines`) 직수정은 하지 않는다. 필요 시 태준/해당 Owner가 SOP 요약만 승격 검토한다.

---

## 8. Done 기준

- [x] 대표님 지시 문서화 (본 보고서)
- [x] Branch Directory_Map · WorkLog 반영
- [x] HQ 보고서 동기화 (sync_hq / Finalize-Work)

---

**서명 취지.** BSC는 “웹으로 증명 → Expo 앱으로 확장”을 기본 시스템으로 한다. 원본 웹 보호와 앱 실험 자유는 복제 분기로 동시에 달성한다.
