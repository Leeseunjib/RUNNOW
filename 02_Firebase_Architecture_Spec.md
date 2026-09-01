# 🔥 Firebase MCP: 인증, 데이터베이스, 스토리지 및 배포 아키텍처 사양서

> **프로젝트명**: RunGotchi (글로벌 GPS 러너 & 다마고치 육성 3주 챌린지)
> **백엔드 스택**: Firebase Authentication, Cloud Firestore, Cloud Storage, Firebase Hosting
> **적용 도구**: Firebase MCP Server (`firebase-tools@latest mcp`)

---

## 1. Firebase Authentication (인증 시스템)

### 1.1 지원 인증 공급자

- **Email / Password**: 기본 계정 생성 및 비밀번호 재설정
- **Google OAuth (One-Tap / Pop-up)**: 글로벌 유저 간편 로그인
- **Apple Sign-In**: iOS 앱스토어 심사 및 크로스 플랫폼 필수 인증
- **Anonymous (게스트 모드)**: 가입 전 다마고치 알(Egg) 부화 체험 지원 후 영구 계정 전환(Link With Credential)

### 1.2 온보딩 사용자 프로필 필드

```typescript
interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: FirebaseFirestore.Timestamp;
  lastLoginAt: FirebaseFirestore.Timestamp;
  profile: {
    heightCm: number;        // 키 (cm)
    weightKg: number;        // 몸무게 (kg)
    age: number;             // 나이
    gender: 'male' | 'female' | 'other';
    bmi: number;             // BMI 지수 (weight / (height/100)^2)
    bmr: number;             // 기초대사량 (Mifflin-St Jeor 공식)
    targetDistanceKm: number;// 주간 목표 거리
  };
  inventory: {
    voltCoins: number;       // 인게임 재화
    ownedItems: string[];    // 보유 아이템 ID 목록
    equippedGear: {
      shoes?: string;
      skin?: string;
      wearable?: string;
    };
  };
}
```

---

## 2. Cloud Firestore 컬렉션 및 데이터 모델

```
Firestore Root
├── users/{userId} (유저 프로필 및 계정 기본 정보)
│   ├── tamagotchi (다마고치 실시간 상태: level, xp, hunger, happiness, energy, stage)
│   ├── workouts/{workoutId} (개별 달리기 세션: distanceKm, durationSec, avgPace, calories, routeGeoJson)
│   ├── challenge_progress/{dayIndex} (1~21일차 미션 완료 상태 및 체크리스트)
│   └── payment_history/{orderId} (페이팔 주문 및 결제 영수증)
├── shop_items/{itemId} (20종 상점 아이템 정본 카탈로그)
└── leaderboard/{period} (글로벌 주간/월간 러닝 거리 랭킹)
```

---

## 3. Cloud Firestore 보안 규칙 (Security Rules)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
  
    // 유저 데이터: 본인만 읽기/쓰기 가능
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
  
      match /tamagotchi/{docId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
  
      match /workouts/{workoutId} {
        allow read, create: if request.auth != null && request.auth.uid == userId;
        allow update, delete: if false; // 운동 기록 위변조 방지
      }
  
      match /challenge_progress/{dayId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  
    // 상점 아이템: 누구나 조회 가능, 쓰기는 관리자만
    match /shop_items/{itemId} {
      allow read: if true;
      allow write: if false;
    }
  
    // 리더보드: 누구나 조회 가능
    match /leaderboard/{period} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 4. Firebase Hosting & CI/CD 배포 구성

### `firebase.json` 설정

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp|js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```
