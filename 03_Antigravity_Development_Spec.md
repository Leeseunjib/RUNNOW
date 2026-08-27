# 🚀 Antigravity & HQ Agents: 크로스 플랫폼 개발 및 알고리즘 사양서

> **프로젝트명**: RunGotchi (글로벌 GPS 러너 & 다마고치 육성 3주 챌린지)  
> **개발 엔진**: Antigravity 2.0 + Cross-Platform Hybrid Core (Web / Android / iOS)  
> **HQ 전담 에이전트**: CTO 거누(아키텍처), 유나(프론트엔드), 강서진(백엔드), 수호(QA/정밀검증)

---

## 1. 크로스 플랫폼 아키텍처 (Cross-Platform Architecture)

단일 모던 웹 기술 스택(Vanilla ES6+ / React / Vite)을 기반으로 Capacitor 및 PWA 래핑을 통해 웹, 구글 플레이스토어(Android), 애플 앱스토어(iOS)에 동시 배포 가능한 단일 코드베이스 아키텍처를 채택합니다.

```
+-----------------------------------------------------------+
|                   RunGotchi Client UI                     |
|  (Nike Run Club Volt Design + Tamagotchi Evolution HUD)   |
+-----------------------------------------------------------+
                             |
+-----------------------------------------------------------+
|                   Antigravity Core Services               |
|  - GPS Tracker (Haversine + Kalman Filter)                |
|  - Tamagotchi Lifecycle Engine (Growth, Hunger, XP)       |
|  - 21-Day Habit Challenge Engine                          |
|  - In-Game Economy & Shop Catalog (20 Items)              |
+-----------------------------------------------------------+
        /                    |                    \
+--------------+    +-------------------+    +--------------+
|   Web / PWA  |    |  Capacitor iOS    |    | Capacitor    |
| (Responsive) |    |  (CoreLocation)   |    | Android (GPS)|
+--------------+    +-------------------+    +--------------+
```

---

## 2. 정밀 GPS 거리 측정 및 하버사인(Haversine) 공식

GPS 오차(지터 현상)를 방지하기 위해 최소 이동 거리 임계값(Threshold: 3m)과 정확도 필터(Accuracy < 25m)를 적용하고, 하버사인 공식을 통해 거리를 계산합니다.

```javascript
// 두 위경도 좌표 간 대원 거리 계산 (Haversine Formula)
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // 지구 반경 (km)
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 실시간 페이스 계산 (분'초'' / km)
export function calculatePace(durationSeconds, distanceKm) {
  if (distanceKm <= 0.05) return "--'--\"";
  const paceSecondsPerKm = durationSeconds / distanceKm;
  const minutes = Math.floor(paceSecondsPerKm / 60);
  const seconds = Math.floor(paceSecondsPerKm % 60);
  return `${minutes}'${seconds < 10 ? '0' : ''}${seconds}"`;
}
```

---

## 3. 다마고치 캐릭터 육성 및 진화 엔진 공식

### 3.1 칼로리 & 경험치(XP) 산출 수식
- **소모 칼로리**: `MET (Running: 8.5) * Weight(kg) * Duration(hours)`
- **획득 경험치(XP)**: `(Distance(km) * 100) + (Duration(min) * 5) + StreakBonus`
- **레벨업 필요 경험치**: `LevelXP = CurrentLevel * 250`

### 3.2 캐릭터 상태값 감소 및 관리
- **허기(Hunger)**: 달리기 1km 당 15% 감소, 미운동 6시간당 5% 감소
- **행복도(Happiness)**: 러닝 완료 시 +25% 회복, 2일 이상 미운동 시 매일 -20%
- **에너지(Energy)**: 러닝 중 지속 소모, 휴식 및 회복 아이템 사용 시 즉시 충전

---

## 4. 3주(21일) 챌린지 로드맵 설계

- **1주차 (습관 형성기: 1~7일)**: 1.5km ~ 2.5km 가벼운 인터벌 조깅, 기초 스트레칭, 물 1.5L
- **2주차 (지구력 강화기: 8~14일)**: 3.0km ~ 4.5km 지속주, 페이스 조절, 코어 운동
- **3주차 (러너 완성기: 15~21일)**: 5.0km ~ 7.0km 목표 레이스, 최종 보스런, 사이버 진화 해금
