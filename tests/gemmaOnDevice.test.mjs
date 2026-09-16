// Gemma 4 온디바이스 엔진 계약과 기본 테마가 코드에 실제로 들어갔는지 검증
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const vm = require("node:vm");

let failed = 0;
function check(label, actual, expected) {
  const ok = actual === expected;
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"} | ${label} | got=${actual} want=${expected}`);
}

const gemmaSrc = readFileSync(new URL("../gemmaOnDevice.js", import.meta.url), "utf8");
const careSrc = readFileSync(new URL("../careTeam.js", import.meta.url), "utf8");
const htmlSrc = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const appSrc = readFileSync(new URL("../app.js", import.meta.url), "utf8");
const cssSrc = readFileSync(new URL("../styles.css", import.meta.url), "utf8");
const planSrc = readFileSync(new URL("../subscriptionManager.js", import.meta.url), "utf8");

{
  const sandbox = {
    window: {},
    document: {
      readyState: "complete",
      getElementById: () => null,
      addEventListener: () => {}
    },
    navigator: {},
    localStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {}
    },
    console
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(gemmaSrc, sandbox);
  const g = sandbox.window.GemmaOnDevice;

  check("GemmaOnDevice 노출", Boolean(g), true);
  check("모델 ID", g.MODEL_ID, "gemma-4-E2B-it");
  check("E2B 가중치 URL", g.MODEL_URL.includes("gemma-4-E2B-it-web.litertlm"), true);

  const preface = g.historyToPreface([
    { sender: "user", text: "안녕" },
    { sender: "coach", text: "반가워요" },
    { sender: "user", text: "무릎이 아파" }
  ], 8);
  check("마지막 발화는 이력에서 제외", preface.length, 2);
  check("유저 역할", preface[0].role, "user");
  check("코치 역할", preface[1].role, "model");

  const prompt = g.buildSystemPrompt("너는 레오다.", "오늘 소모 칼로리: 320");
  check("되묻기 지시 포함", prompt.includes("되묻"), true);
  check("대본 금지 지시 포함", prompt.includes("대본"), true);
  check("2~3문장 강제 없음", prompt.includes("2~3문장"), false);
  check("수술 축하 금지", prompt.includes("축하하지"), true);
  check("마크다운 금지", prompt.includes("마크다운"), true);
  check("레오가 한계 강요 아님", careSrc.includes("한계를 끌어올려"), false);
}

{
  const gemmaIdx = careSrc.indexOf("GemmaOnDevice");
  const templateIdx = careSrc.indexOf("generateResponse(text)");
  check("케어팀이 Gemma 엔진을 참조", gemmaIdx > 0, true);
  check("Gemma가 대사집보다 앞", gemmaIdx < templateIdx, true);
  check("한도 초과 시 즉시 return 하지 않음", /resource-exhausted[\s\S]{0,220}return;/.test(careSrc), false);
  check("채팅에 Gemma 모델명 배지 없음", careSrc.includes('Gemma 4 · 이 기기'), false);
  check("채팅에 모델명 대신 코치 표기", /engine === "template"\) return "코치"/.test(careSrc), true);
  check("코치 말에서 별표 강조를 걷어냄", careSrc.includes("stripCoachMarkup"), true);
}

{
  const gemmaScript = htmlSrc.indexOf('src="gemmaOnDevice.js"');
  const careScript = htmlSrc.indexOf('src="careTeam.js"');
  check("HTML에 엔진 스크립트", gemmaScript > 0, true);
  check("엔진이 careTeam보다 먼저 로드", gemmaScript < careScript, true);
  check("받기 버튼을 케어팀 화면에 두지 않음", htmlSrc.includes('id="btn-gemma-load"'), false);
  check("Gemma 상태 바를 화면에 두지 않음", htmlSrc.includes("gemma-engine-bar"), false);
  check("코치 화면에 키 연동 버튼을 두지 않음", htmlSrc.includes("btn-open-gemini-key-modal"), false);
  check("키 연동 모달 없음", htmlSrc.includes("gemini-key-modal"), false);
  check("유료 시 자동 워밍", gemmaSrc.includes("warmForPaidUser"), true);
  check("앱이 유료 권한에서 워밍", appSrc.includes("warmOnDeviceCoachIfEligible"), true);
  check("동의 게이트로 로드를 막지 않음", gemmaSrc.includes("CONSENT_KEY"), false);
  check("엔진이 모델 URL을 그대로 넘김", gemmaSrc.includes("model: MODEL_URL"), true);
  check("실패를 alert로 노출하지 않음", gemmaSrc.includes("alert("), false);
  check("WASM 내부 문구를 사용자 문장으로 바꿈", gemmaSrc.includes("noExitRuntime"), true);
  check("Module.noExitRuntime을 직접 바꾸지 않음", /Module\.noExitRuntime\s*=/.test(gemmaSrc), false);
}

{
  check("JS 기본 테마 minimal", appSrc.includes('|| "minimal"'), true);
  check("JS 기본이 webtoon이 아님", appSrc.includes('|| "webtoon"'), false);
  check("html data-theme=minimal", htmlSrc.includes('data-theme="minimal"'), true);
  check("선택 UI 기본이 모던 미니멀", /theme-btn active" data-theme-val="minimal"/.test(htmlSrc), true);
  check(":root가 minimal", cssSrc.includes(':root, [data-theme="minimal"]'), true);
  check(":root가 webtoon이 아님", cssSrc.includes(':root, [data-theme="webtoon"]'), false);
}

{
  check("요금제 문구에 Gemma 선판매 없음", /Gemma/.test(planSrc), false);
}

console.log(failed === 0 ? "\n✅ ALL PASS" : `\n❌ ${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
