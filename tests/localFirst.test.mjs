// 활동 데이터가 기기에만 쌓이는지, 결제·구독은 서버 검증을 유지하는지 검증
// 활동 동기화가 되살아나면 개인 운동 기록이 다시 서버로 나가고,
// 구독 판정이 로컬로 내려오면 위조로 유료 기능이 열립니다.
import { readFileSync } from "node:fs";

let failed = 0;
function check(label, actual, expected) {
  const ok = actual === expected;
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"} | ${label} | got=${actual} want=${expected}`);
}

const clientSrc = readFileSync(new URL("../firebaseClient.js", import.meta.url), "utf8");
const appSrc = readFileSync(new URL("../app.js", import.meta.url), "utf8");
const sandboxSrc = readFileSync(new URL("../firebaseSandbox.js", import.meta.url), "utf8");

// 메서드 본문만 잘라내 그 안에 로컬 전용 가드가 있는지 확인합니다.
function methodBody(src, name) {
  const start = src.indexOf(`async ${name}(`);
  if (start < 0) return "";
  return src.slice(start, start + 400);
}

// --- 1. 스위치가 켜져 있다 -------------------------------------------------
{
  check("로컬 전용 스위치 정의", /const LOCAL_ONLY_ACTIVITY_DATA = true/.test(clientSrc), true);
}

// --- 2. 활동 데이터 쓰기가 전부 막혀 있다 ----------------------------------
// 하나라도 빠지면 그 경로만 조용히 Firestore로 새어 나갑니다.
{
  const writers = ["syncUser", "syncTamagotchi", "syncChallenge", "saveWorkout"];
  const leaks = writers.filter((m) => !methodBody(clientSrc, m).includes("LOCAL_ONLY_ACTIVITY_DATA"));
  check(`클라우드로 새는 쓰기 (${leaks.join(", ") || "없음"})`, leaks.length, 0);
}

// --- 3. 활동 데이터 읽기도 막혀 있다 ---------------------------------------
// 읽기를 열어 두면 옛 클라우드 값이 최신 로컬 기록을 덮어씁니다.
{
  const readers = ["getUser", "getTamagotchi", "getChallenge"];
  const leaks = readers.filter((m) => !methodBody(clientSrc, m).includes("LOCAL_ONLY_ACTIVITY_DATA"));
  check(`클라우드에서 덮어쓰는 읽기 (${leaks.join(", ") || "없음"})`, leaks.length, 0);
}

// --- 4. 결제·구독·AI는 서버 검증을 유지한다 --------------------------------
// 여기까지 로컬로 내리면 구독 위조와 결제 우회가 가능해집니다.
{
  const serverOnly = ["createPaypalOrder", "capturePaypalOrder", "fetchMySubscription", "chatWithCoach"];
  const wrongly = serverOnly.filter((m) => methodBody(clientSrc, m).includes("LOCAL_ONLY_ACTIVITY_DATA"));
  check(`로컬로 잘못 내려온 서버 기능 (${wrongly.join(", ") || "없음"})`, wrongly.length, 0);
  check("구독 상태를 서버에서 조회", appSrc.includes("firebaseCloud.fetchMySubscription()"), true);
  check("서버 응답을 구독 정본으로 반영", appSrc.includes("applyServerState(serverState)"), true);
}

// --- 5. 기기 저장소가 실제 정본이다 ----------------------------------------
{
  check("로컬 DB 키 존재", sandboxSrc.includes('"RUNNOW_CORE_DB_V2"'), true);
  check("로컬에 러닝 기록 적재", sandboxSrc.includes("addWorkoutLog"), true);
  check("앱이 로컬에 러닝 기록 저장", appSrc.includes("this.firebaseSandbox.addWorkoutLog("), true);
}

console.log(failed === 0 ? "\n✅ ALL PASS" : `\n❌ ${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
