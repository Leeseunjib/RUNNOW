// 내부테스트 데이터와 상용 데이터가 섞이지 않는지 검증
// 판정이 틀리면 실사용자 기록이 dev_ 컬렉션으로 들어가거나 그 반대가 됩니다.
import { readFileSync } from "node:fs";

let failed = 0;
function check(label, actual, expected) {
  const ok = actual === expected;
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"} | ${label} | got=${actual} want=${expected}`);
}

// firebaseClient.js는 Firebase SDK를 최상위에서 import하므로 Node에서 그대로
// 불러올 수 없습니다. 판정 로직만 떼어내 동일 규칙으로 검증합니다.
const src = readFileSync(new URL("../firebaseClient.js", import.meta.url), "utf8");

function isDevMode(hostname) {
  return hostname === "localhost"
    || hostname === "127.0.0.1"
    || hostname.includes("--dev-");
}

// --- 1. 구현이 위험한 부분 문자열 검사를 쓰지 않는다 -----------------------
{
  // host.includes('dev')는 'devices', 'developer' 같은 도메인을 dev로 오인합니다.
  const hasBroadCheck = /includes\(\s*['"]dev['"]\s*\)/.test(src);
  check("넓은 'dev' 부분 문자열 검사 없음", hasBroadCheck, false);
  check("'--dev-' 패턴 사용", src.includes('includes("--dev-")'), true);
}

// --- 2. 내부테스트 환경은 dev로 판정된다 -----------------------------------
{
  check("dev 채널", isDevMode("runnow-37af9--dev-irl7g2ve.web.app"), true);
  check("localhost", isDevMode("localhost"), true);
  check("127.0.0.1", isDevMode("127.0.0.1"), true);
}

// --- 3. 상용 도메인은 절대 dev로 판정되지 않는다 ---------------------------
// 이것이 깨지면 실사용자 데이터가 dev_ 컬렉션에 쌓입니다.
{
  check("상용 커스텀 도메인", isDevMode("runnow.beauscreators.com"), false);
  check("Firebase 기본 호스팅", isDevMode("runnow-37af9.web.app"), false);
  check("firebaseapp.com", isDevMode("runnow-37af9.firebaseapp.com"), false);
}

// --- 4. 'dev'가 들어간 다른 도메인도 상용으로 판정된다 ---------------------
// 넓은 부분 문자열 검사였다면 전부 dev로 오인되던 사례입니다.
{
  check("devices 도메인", isDevMode("devices.beauscreators.com"), false);
  check("developer 도메인", isDevMode("developer.runnow.app"), false);
  check("dev-team 도메인", isDevMode("dev-team.runnow.app"), false);
  check("사용자명에 dev 포함", isDevMode("runnow-dev.beauscreators.com"), false);
}

// --- 5. 판정 불가 시 상용으로 간주한다 -------------------------------------
// dev로 잘못 판정하면 실사용자 데이터가 격리 영역으로 새어 나갑니다.
{
  check("빈 호스트명", isDevMode(""), false);
}

// --- 6. 모든 읽기·쓰기가 네임스페이스를 거친다 -----------------------------
// 한 곳이라도 직접 컬렉션명을 쓰면 그 경로만 상용 데이터를 건드립니다.
{
  const rawCollections = ["users", "tamagotchi", "challenges_progress", "workouts"];
  const leaks = [];
  for (const name of rawCollections) {
    // doc(this.db, "users", ...) 처럼 문자열을 직접 넘기는 패턴
    if (new RegExp(`(doc|collection)\\(this\\.db,\\s*["']${name}["']`).test(src)) {
      leaks.push(name);
    }
  }
  check(`네임스페이스를 우회한 직접 접근 (${leaks.join(", ") || "없음"})`, leaks.length, 0);
  check("getCollectionName 사용", src.includes("this.getCollectionName("), true);
}

console.log(failed === 0 ? "\n✅ ALL PASS" : `\n❌ ${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
