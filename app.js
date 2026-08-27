// 메인 애플리케이션 진입점 및 통합 컨트롤러 (RunGotchi App Controller)

import { SHOP_ITEMS } from './catalog.js';
import { TamagotchiEngine, STAGES } from './tamagotchi.js';
import { GPSRunner } from './gpsRunner.js';
import { ChallengeManager, CHALLENGE_DAYS, CHALLENGE_CHAPTERS, formatRunTime } from './challenge.js';
import { QUEST_CATEGORIES, QUESTS_DATA } from './quests.js';
import { PayPalBridge } from './paypalBridge.js';
import { FirebaseSandbox } from './firebaseSandbox.js';
import { firebaseCloud } from './firebaseClient.js';

class AppController {
  constructor() {
    this.firebaseSandbox = new FirebaseSandbox();
    const db = this.firebaseSandbox.getDB();
    
    // 12시간 유효 세션 검사
    const activeSession = firebaseCloud.getCurrentSession();
    this.currentUserId = activeSession ? activeSession.uid : localStorage.getItem("RUNNOW_CURRENT_USER_ID");
    
    if (!this.currentUserId) {
      this.currentUserId = "guest_runner";
    }

    const userDoc = db.users?.[this.currentUserId] || {};

    this.userProfile = {
      name: userDoc.displayName || activeSession?.displayName || (this.currentUserId === "user_geonu_ceo" ? "이건우 대표님" : "러너"),
      heightCm: userDoc.heightCm ?? 175,
      weightKg: userDoc.weightKg ?? 70,
      age: userDoc.age ?? 30,
      gender: userDoc.gender || "M",
      targetWeightKg: userDoc.targetWeightKg ?? 65,
      frequency: userDoc.frequency ?? 3,
      goalType: userDoc.goalType || "DIET",
      coins: userDoc.coins || 0
    };

    const petDoc = db.tamagotchi?.[this.currentUserId] || {
      name: "볼트몽",
      level: 1,
      xp: 0,
      totalKm: 0.0,
      hunger: 100,
      happiness: 100,
      energy: 100,
      might: 10,
      agility: 10,
      spirit: 10
    };

    const chalDoc = db.challenges_progress?.[this.currentUserId] || {
      completedDays: [],
      currentDay: 1,
      streak: 0,
      habitCue: "퇴근 후 현관에서 러닝화 신고 바로 출발"
    };

    this.tamagotchi = new TamagotchiEngine(petDoc);
    this.challengeManager = new ChallengeManager(chalDoc);
    if (this.currentUserId !== "guest_runner") {
      this.firebaseSandbox.setDoc("challenges_progress", this.currentUserId, this.challengeManager.toJSON());
    }

    this.gpsRunner = new GPSRunner({
      weightKg: this.userProfile.weightKg,
      onUpdate: (stats) => this.renderLiveRunStats(stats)
    });

    this.paypalBridge = new PayPalBridge();
    this.selectedChallengeDay = this.challengeManager.currentDay;
    this.currentQuestCategory = "all";
  }

  calcBmi(heightCm, weightKg) {
    const h = Number(heightCm) || 175;
    const w = Number(weightKg) || 70;
    return parseFloat((w / ((h / 100) * (h / 100))).toFixed(1));
  }

  bmiLabel(bmi) {
    if (bmi < 18.5) return "저체중";
    if (bmi <= 23) return "정상";
    if (bmi <= 25) return "과체중";
    return "비만";
  }

  calcBmr(heightCm, weightKg, age, gender) {
    const h = Number(heightCm) || 175;
    const w = Number(weightKg) || 70;
    const a = Number(age) || 30;
    return Math.round(10 * w + 6.25 * h - 5 * a + (gender === "F" ? -161 : 5));
  }

  persistUserProfile() {
    const bmi = this.calcBmi(this.userProfile.heightCm, this.userProfile.weightKg);
    this.firebaseSandbox.setDoc("users", this.currentUserId, {
      uid: this.currentUserId,
      displayName: this.userProfile.name,
      age: this.userProfile.age,
      gender: this.userProfile.gender,
      heightCm: this.userProfile.heightCm,
      weightKg: this.userProfile.weightKg,
      targetWeightKg: this.userProfile.targetWeightKg,
      frequency: this.userProfile.frequency,
      goalType: this.userProfile.goalType,
      bmi,
      coins: this.userProfile.coins,
      onboarded: true
    });
  }

  getUserWorkouts() {
    const db = this.firebaseSandbox.getDB();
    return (db.workouts || []).filter((w) => w.userId === this.currentUserId);
  }

  applyChallengeClear(result) {
    if (!result?.ok) return;
    this.tamagotchi.addXp(result.mission.xpReward);
    this.userProfile.coins += result.mission.coinReward;
    this.firebaseSandbox.setDoc("challenges_progress", this.currentUserId, this.challengeManager.toJSON());
    this.firebaseSandbox.setDoc("tamagotchi", this.currentUserId, this.tamagotchi.toJSON());
    this.persistUserProfile();
  }

  init() {
    this.bindNavigation();
    this.bindRunControls();
    this.bindTamagotchiActions();
    this.renderTamagotchiView();
    this.bindQuestAndChallengeTabs();
    this.renderQuestView("all");
    this.renderChallengeView();
    this.renderShopView("all");
    this.bindProfileForm();
    this.bindCelebrationModal();
    this.bindAuthAndOnboarding();
    this.updateHeaderStats();

    // 뷰 라우팅 (Step 1 Auth -> Step 2 Onboarding -> Step 3 Main App)
    const viewAuth = document.getElementById("view-auth");
    const viewOnboarding = document.getElementById("view-onboarding");
    const mainAppContainer = document.getElementById("main-app-container");

    const activeSession = firebaseCloud.getCurrentSession();
    const db = this.firebaseSandbox.getDB();
    const userDoc = activeSession ? db.users?.[activeSession.uid] : null;

    if (!activeSession) {
      // 1단계: 미인증 상태 -> 로그인/회원가입 화면
      if (viewAuth) viewAuth.style.display = "flex";
      if (viewOnboarding) viewOnboarding.style.display = "none";
      if (mainAppContainer) mainAppContainer.style.display = "none";
    } else if (!userDoc || !userDoc.onboarded) {
      // 2단계: 가입 완료 후 신체/다이어트 설정 온보딩 화면
      if (viewAuth) viewAuth.style.display = "none";
      if (viewOnboarding) viewOnboarding.style.display = "flex";
      if (mainAppContainer) mainAppContainer.style.display = "none";
      this.initOnboardingForm(activeSession);
    } else {
      // 3단계: 설정 완료된 인증 사용자 -> 메인 홈
      if (viewAuth) viewAuth.style.display = "none";
      if (viewOnboarding) viewOnboarding.style.display = "none";
      if (mainAppContainer) mainAppContainer.style.display = "flex";
    }

    console.log("⚡ RUNNOW Multi-Step Onboarding App Initialized!");
  }

  // 상단 바 유저 코인 및 레벨 업데이트
  updateHeaderStats() {
    const coinEl = document.getElementById("header-coins");
    const lvlEl = document.getElementById("header-level");
    const userEl = document.getElementById("header-user-name");
    if (coinEl) coinEl.textContent = `⚡ ${this.userProfile.coins.toLocaleString()} VC`;
    if (lvlEl) lvlEl.textContent = `Lv. ${this.tamagotchi.level}`;
    if (userEl) userEl.textContent = this.userProfile.name;
  }

  // 탭 네비게이션
  bindNavigation() {
    const navButtons = document.querySelectorAll(".bottom-nav .nav-item");
    const tabPanes = document.querySelectorAll(".tab-pane");

    navButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetTabId = btn.dataset.tab;
        navButtons.forEach((b) => b.classList.remove("active"));
        tabPanes.forEach((pane) => pane.classList.remove("active"));

        btn.classList.add("active");
        const targetPane = document.getElementById(targetTabId);
        if (targetPane) targetPane.classList.add("active");

        if (targetTabId === "tab-tamagotchi") this.renderTamagotchiView();
        if (targetTabId === "tab-challenge") {
          this.renderQuestView(this.currentQuestCategory || "all");
          this.renderChallengeView();
        }
        if (targetTabId === "tab-shop") this.renderShopView("all");
      });
    });
  }

  // 온보딩 폼 실시간 계산 및 초기화
  initOnboardingForm(session) {
    const db = this.firebaseSandbox.getDB();
    const saved = db.users?.[session?.uid] || {};

    const nameInput = document.getElementById("ob-name");
    const ageInput = document.getElementById("ob-age");
    const heightInput = document.getElementById("ob-height");
    const weightInput = document.getElementById("ob-weight");
    const targetInput = document.getElementById("ob-target-weight");
    const freqInput = document.getElementById("ob-frequency");
    const cueInput = document.getElementById("ob-habit-cue");

    if (nameInput) nameInput.value = saved.displayName || session?.displayName || "";
    if (ageInput) ageInput.value = saved.age ?? "";
    if (heightInput) heightInput.value = saved.heightCm ?? 175;
    if (weightInput) weightInput.value = saved.weightKg ?? 70;
    if (targetInput) targetInput.value = saved.targetWeightKg ?? 65;
    if (freqInput) freqInput.value = String(saved.frequency ?? 3);
    if (cueInput) cueInput.value = db.challenges_progress?.[session?.uid]?.habitCue || saved.habitCue || cueInput.value;

    const savedGender = saved.gender || "M";
    document.querySelectorAll(".ob-gender-btn").forEach((btn) => {
      const on = btn.dataset.gender === savedGender;
      btn.classList.toggle("active", on);
      btn.style.borderColor = on ? "var(--primary-volt)" : "var(--border-glass)";
      btn.style.color = on ? "var(--primary-volt)" : "var(--text-muted)";
    });

    const savedGoal = saved.goalType || "DIET";
    document.querySelectorAll(".ob-goal-card").forEach((card) => {
      const on = card.dataset.goal === savedGoal;
      card.classList.toggle("active", on);
      card.style.borderColor = on ? "var(--primary-volt)" : "var(--border-glass)";
    });

    const calcMeter = () => {
      const h = parseFloat(document.getElementById("ob-height")?.value) || 175;
      const w = parseFloat(document.getElementById("ob-weight")?.value) || 70;
      const age = parseInt(document.getElementById("ob-age")?.value) || 30;
      const gender = document.querySelector(".ob-gender-btn.active")?.dataset.gender || "M";

      const bmi = (w / ((h / 100) * (h / 100))).toFixed(1);
      let bmr = Math.round(10 * w + 6.25 * h - 5 * age + (gender === "M" ? 5 : -161));

      const bmiEl = document.getElementById("ob-calc-bmi");
      const bmrEl = document.getElementById("ob-calc-bmr");
      if (bmiEl) bmiEl.textContent = `${bmi} (${bmi < 18.5 ? '저체중' : bmi <= 23 ? '정상' : bmi <= 25 ? '과체중' : '비만'})`;
      if (bmrEl) bmrEl.textContent = `${bmr.toLocaleString()} kcal`;
    };

    calcMeter();
    document.getElementById("ob-height")?.addEventListener("input", calcMeter);
    document.getElementById("ob-weight")?.addEventListener("input", calcMeter);
    document.getElementById("ob-age")?.addEventListener("input", calcMeter);

    // 성별 버튼 토글
    const genderBtns = document.querySelectorAll(".ob-gender-btn");
    genderBtns.forEach(btn => {
      btn.onclick = () => {
        genderBtns.forEach(b => {
          b.classList.remove("active");
          b.style.borderColor = "var(--border-glass)";
          b.style.color = "var(--text-muted)";
        });
        btn.classList.add("active");
        btn.style.borderColor = "var(--primary-volt)";
        btn.style.color = "var(--primary-volt)";
        calcMeter();
      };
    });

    // 다이어트/운동 목표 카드 토글
    const goalCards = document.querySelectorAll(".ob-goal-card");
    goalCards.forEach(card => {
      card.onclick = () => {
        goalCards.forEach(c => {
          c.classList.remove("active");
          c.style.borderColor = "var(--border-glass)";
        });
        card.classList.add("active");
        card.style.borderColor = "var(--primary-volt)";
      };
    });
  }

  // 인증 및 온보딩 바인딩
  bindAuthAndOnboarding() {
    const viewAuth = document.getElementById("view-auth");
    const viewOnboarding = document.getElementById("view-onboarding");
    const mainAppContainer = document.getElementById("main-app-container");

    // 1단계 이메일 vs 휴대폰 가입 탭 전환
    const tabEmail = document.getElementById("tab-auth-email");
    const tabPhone = document.getElementById("tab-auth-phone");
    const grpEmail = document.getElementById("group-auth-email");
    const grpPhone = document.getElementById("group-auth-phone");

    let currentAuthMode = "email"; // 'email' | 'phone'

    if (tabEmail && tabPhone) {
      tabEmail.onclick = () => {
        currentAuthMode = "email";
        tabEmail.style.background = "var(--surface-carbon)";
        tabEmail.style.color = "var(--primary-volt)";
        tabEmail.style.border = "1px solid rgba(204,255,0,0.3)";
        tabPhone.style.background = "none";
        tabPhone.style.color = "var(--text-muted)";
        tabPhone.style.border = "none";
        if (grpEmail) grpEmail.style.display = "flex";
        if (grpPhone) grpPhone.style.display = "none";
      };

      tabPhone.onclick = () => {
        currentAuthMode = "phone";
        tabPhone.style.background = "var(--surface-carbon)";
        tabPhone.style.color = "var(--primary-volt)";
        tabPhone.style.border = "1px solid rgba(204,255,0,0.3)";
        tabEmail.style.background = "none";
        tabEmail.style.color = "var(--text-muted)";
        tabEmail.style.border = "none";
        if (grpEmail) grpEmail.style.display = "none";
        if (grpPhone) grpPhone.style.display = "flex";
      };
    }

    // 공통 인증 완료 처리 함수
    const completeAuthLogin = (session) => {
      localStorage.setItem("RUNNOW_AUTH_SESSION", JSON.stringify(session));
      localStorage.setItem("RUNNOW_CURRENT_USER_ID", session.uid);

      const db = this.firebaseSandbox.getDB();
      if (!db.users) db.users = {};
      const userDoc = db.users[session.uid];

      if (userDoc && userDoc.onboarded) {
        // 이미 온보딩 완료된 유저 -> 즉시 메인 앱으로 진입
        if (viewAuth) viewAuth.style.display = "none";
        if (viewOnboarding) viewOnboarding.style.display = "none";
        if (mainAppContainer) mainAppContainer.style.display = "flex";
        location.reload();
      } else {
        // 신규 유저 -> 2단계 온보딩으로 진입
        if (viewAuth) viewAuth.style.display = "none";
        if (viewOnboarding) viewOnboarding.style.display = "flex";
        if (mainAppContainer) mainAppContainer.style.display = "none";
        this.initOnboardingForm(session);
      }
    };

    // Google 원클릭 로그인 & 계정 선택 모달 바인딩
    const btnPageGoogleLogin = document.getElementById("btn-page-google-login");
    const btnModalGoogleLogin = document.getElementById("btn-google-login");
    const googleModal = document.getElementById("google-account-modal");
    const btnCloseGoogleModal = document.getElementById("btn-close-google-modal");
    const btnGoogleAccountCeo = document.getElementById("btn-google-account-ceo");
    const btnGoogleCustomSubmit = document.getElementById("btn-google-custom-submit");

    const openGoogleSelector = () => {
      if (googleModal) googleModal.style.display = "flex";
    };

    if (btnPageGoogleLogin) btnPageGoogleLogin.onclick = openGoogleSelector;
    if (btnModalGoogleLogin) btnModalGoogleLogin.onclick = openGoogleSelector;
    if (btnCloseGoogleModal && googleModal) {
      btnCloseGoogleModal.onclick = () => { googleModal.style.display = "none"; };
    }

    // Google 계정 선택 1: 이건우 대표님 (dnswlq456@gmail.com)
    if (btnGoogleAccountCeo) {
      btnGoogleAccountCeo.onclick = () => {
        if (googleModal) googleModal.style.display = "none";
        const session = {
          uid: "google_dnswlq456",
          displayName: "이건우 대표님",
          email: "dnswlq456@gmail.com",
          expiresAt: Date.now() + (12 * 60 * 60 * 1000)
        };
        completeAuthLogin(session);
      };
    }

    // Google 계정 선택 2: 다른 Google 계정 입력
    if (btnGoogleCustomSubmit) {
      btnGoogleCustomSubmit.onclick = () => {
        const customEmail = document.getElementById("google-custom-email")?.value.trim();
        const customName = document.getElementById("google-custom-name")?.value.trim() || "Google 러너";
        if (!customEmail || !customEmail.includes("@")) {
          alert("유효한 Google 이메일 주소를 입력해 주세요.");
          return;
        }

        if (googleModal) googleModal.style.display = "none";
        const uid = "google_" + encodeURIComponent(customEmail.split("@")[0].toLowerCase());
        const session = {
          uid,
          displayName: customName,
          email: customEmail,
          expiresAt: Date.now() + (12 * 60 * 60 * 1000)
        };

        completeAuthLogin(session);
      };
    }

    // 이메일 회원가입 모달 열기/닫기/제출
    const btnOpenEmailSignup = document.getElementById("btn-open-email-signup");
    const signupModal = document.getElementById("email-signup-modal");
    const btnCloseSignupModal = document.getElementById("btn-close-signup-modal");
    const btnModalSubmitSignup = document.getElementById("btn-modal-submit-signup");

    if (btnOpenEmailSignup) btnOpenEmailSignup.onclick = () => { if (signupModal) signupModal.style.display = "flex"; };
    if (btnCloseSignupModal && signupModal) btnCloseSignupModal.onclick = () => { signupModal.style.display = "none"; };

    if (btnModalSubmitSignup) {
      btnModalSubmitSignup.onclick = () => {
        const email = document.getElementById("modal-signup-email")?.value.trim();
        const pw = document.getElementById("modal-signup-pw")?.value;
        if (!email || !email.includes("@")) {
          alert("유효한 이메일 주소를 입력해 주세요.");
          return;
        }
        if (!pw || pw.length < 6) {
          alert("비밀번호를 6자리 이상 입력해 주세요.");
          return;
        }

        if (signupModal) signupModal.style.display = "none";
        const identifier = email.split("@")[0];
        const authUid = "email_" + encodeURIComponent(identifier.toLowerCase());

        const session = {
          uid: authUid,
          displayName: identifier,
          expiresAt: Date.now() + (12 * 60 * 60 * 1000)
        };

        localStorage.setItem("RUNNOW_AUTH_SESSION", JSON.stringify(session));
        localStorage.setItem("RUNNOW_CURRENT_USER_ID", authUid);

        // 회원가입 직후 온보딩으로 연결
        if (viewAuth) viewAuth.style.display = "none";
        if (viewOnboarding) viewOnboarding.style.display = "flex";
        if (mainAppContainer) mainAppContainer.style.display = "none";
        this.initOnboardingForm(session);
      };
    }

    // 이메일 로그인 모달 열기/닫기/제출
    const btnOpenEmailLogin = document.getElementById("btn-open-email-login");
    const loginModalDirect = document.getElementById("email-login-modal");
    const btnCloseLoginModalDirect = document.getElementById("btn-close-loginmodal");
    const btnModalSubmitLogin = document.getElementById("btn-modal-submit-login");

    if (btnOpenEmailLogin) btnOpenEmailLogin.onclick = () => { if (loginModalDirect) loginModalDirect.style.display = "flex"; };
    if (btnCloseLoginModalDirect && loginModalDirect) btnCloseLoginModalDirect.onclick = () => { loginModalDirect.style.display = "none"; };

    if (btnModalSubmitLogin) {
      btnModalSubmitLogin.onclick = () => {
        const email = document.getElementById("modal-login-email")?.value.trim();
        const pw = document.getElementById("modal-login-pw")?.value;
        if (!email || !email.includes("@")) {
          alert("유효한 이메일 주소를 입력해 주세요.");
          return;
        }
        if (!pw) {
          alert("비밀번호를 입력해 주세요.");
          return;
        }

        if (loginModalDirect) loginModalDirect.style.display = "none";
        const identifier = email.split("@")[0];
        const authUid = "email_" + encodeURIComponent(identifier.toLowerCase());

        const session = {
          uid: authUid,
          displayName: identifier,
          expiresAt: Date.now() + (12 * 60 * 60 * 1000)
        };

        completeAuthLogin(session);
      };
    }

    // STEP 2 온보딩 저장 버튼 ➔ 메인 홈(STEP 3)으로 진입
    const btnSaveOnboarding = document.getElementById("btn-save-onboarding");
    if (btnSaveOnboarding) {
      btnSaveOnboarding.onclick = () => {
        const activeSession = firebaseCloud.getCurrentSession() || { uid: this.currentUserId, displayName: this.userProfile.name };
        const uid = activeSession.uid || this.currentUserId;
        const name = document.getElementById("ob-name")?.value.trim() || activeSession.displayName || "러너";
        const age = parseInt(document.getElementById("ob-age")?.value, 10);
        const gender = document.querySelector(".ob-gender-btn.active")?.dataset.gender || "M";
        const heightCm = parseFloat(document.getElementById("ob-height")?.value) || 175;
        const weightKg = parseFloat(document.getElementById("ob-weight")?.value) || 70;
        const targetWeightKg = parseFloat(document.getElementById("ob-target-weight")?.value) || 65;
        const frequency = parseInt(document.getElementById("ob-frequency")?.value, 10) || 3;
        const selectedGoal = document.querySelector(".ob-goal-card.active")?.dataset.goal || "DIET";
        const habitCue = document.getElementById("ob-habit-cue")?.value.trim() || "퇴근 후 현관에서 러닝화 신고 바로 출발";

        if (!age || age < 10 || age > 100) {
          alert("나이를 올바르게 입력해 주세요.");
          return;
        }

        const bmi = this.calcBmi(heightCm, weightKg);
        this.currentUserId = uid;

        const db = this.firebaseSandbox.getDB();
        if (!db.users) db.users = {};
        if (!db.tamagotchi) db.tamagotchi = {};
        if (!db.challenges_progress) db.challenges_progress = {};

        db.users[uid] = {
          uid,
          displayName: name,
          age,
          gender,
          heightCm,
          weightKg,
          targetWeightKg,
          frequency,
          goalType: selectedGoal,
          bmi,
          coins: db.users[uid]?.coins || 0,
          onboarded: true,
          updatedAt: new Date().toISOString()
        };

        if (!db.tamagotchi[uid]) {
          db.tamagotchi[uid] = {
            name: "볼트몽",
            level: 1,
            xp: 0,
            totalKm: 0.0,
            hunger: 100,
            happiness: 100,
            energy: 100,
            might: 10,
            agility: 10,
            spirit: 10,
            statusCondition: "HEALTHY",
            updatedAt: new Date().toISOString()
          };
        }

        const existingChal = db.challenges_progress[uid] || {};
        db.challenges_progress[uid] = {
          ...existingChal,
          completedDays: existingChal.completedDays || [],
          currentDay: existingChal.currentDay || 1,
          streak: existingChal.streak || 0,
          habitCue,
          startDate: existingChal.startDate || new Date().toISOString().slice(0, 10),
          updatedAt: new Date().toISOString()
        };

        this.firebaseSandbox.saveDB(db);
        localStorage.setItem("RUNNOW_CURRENT_USER_ID", uid);
        const sessionKeep = firebaseCloud.getCurrentSession() || activeSession;
        localStorage.setItem("RUNNOW_AUTH_SESSION", JSON.stringify({
          ...sessionKeep,
          uid,
          displayName: name,
          expiresAt: sessionKeep.expiresAt || (Date.now() + (12 * 60 * 60 * 1000))
        }));

        alert(`🎉 ${name} 러너님의 신체 분석 및 다이어트 러닝 플랜이 완성되었습니다!\n\n홈 화면으로 이동하여 첫 러닝을 시작합니다.`);
        location.reload();
      };
    }

    // 헤더 프로필 팝업 / 탭 로그아웃 공통 핸들러
    const btnOpenLogin = document.getElementById("btn-open-login");
    const loginModal = document.getElementById("login-modal");
    const btnCloseLogin = document.getElementById("btn-close-login-modal");
    const btnModalLogout = document.getElementById("btn-modal-logout");
    const btnTabLogout = document.getElementById("btn-tab-logout");

    if (btnOpenLogin && loginModal) {
      btnOpenLogin.onclick = () => { loginModal.style.display = "flex"; };
    }
    if (btnCloseLogin && loginModal) {
      btnCloseLogin.onclick = () => { loginModal.style.display = "none"; };
    }

    const performLogout = async () => {
      if (confirm("로그아웃하시겠습니까?")) {
        await firebaseCloud.logOut();
        alert("🚪 안전하게 로그아웃되었습니다. 로그인 화면으로 이동합니다.");
        location.reload();
      }
    };

    if (btnModalLogout) btnModalLogout.onclick = performLogout;
    if (btnTabLogout) btnTabLogout.onclick = performLogout;
  }

  // 실시간 GPS 러닝 HUD 통계 화면 렌더링 (정수 미터, AVG PACE, 시간, 칼로리, GPS 상태)
  renderLiveRunStats(stats) {
    const distEl = document.getElementById("live-distance");
    const unitEl = document.getElementById("live-distance-unit");
    const subDistEl = document.getElementById("live-distance-sub");
    const paceEl = document.getElementById("live-pace");
    const timeEl = document.getElementById("live-time");
    const calEl = document.getElementById("live-calories");
    const accuracyEl = document.getElementById("live-gps-accuracy");

    if (distEl) distEl.textContent = stats.displayMeters;
    if (unitEl) unitEl.textContent = "METERS (m)";
    if (subDistEl) subDistEl.textContent = stats.displayKm;
    if (paceEl) paceEl.textContent = stats.pace;
    if (timeEl) timeEl.textContent = stats.formattedTime;
    if (calEl) calEl.textContent = stats.calories.toLocaleString();
    if (accuracyEl && stats.gpsAccuracy) accuracyEl.textContent = `🛰️ ${stats.gpsAccuracy}`;
  }

  // GPS 러닝 컨트롤 & 데이터 초기화 모달 바인딩
  bindRunControls() {
    const btnStartLive = document.getElementById("btn-start-live");
    const btnOpenResetModal = document.getElementById("btn-open-reset-modal");
    const resetModal = document.getElementById("reset-confirm-modal");
    const btnCloseResetModal = document.getElementById("btn-close-reset-modal");
    const btnCancelReset = document.getElementById("btn-cancel-reset");
    const btnConfirmReset = document.getElementById("btn-confirm-reset");
    const chkNeverAsk = document.getElementById("chk-never-ask-reset");

    const btnPause = document.getElementById("btn-pause-run");
    const btnStop = document.getElementById("btn-stop-run");
    const btnDiscard = document.getElementById("btn-discard-run");

    const initBox = document.getElementById("run-init-controls");
    const activeBox = document.getElementById("run-active-controls");
    const metricCircle = document.getElementById("metric-circle");

    if (btnStartLive) {
      btnStartLive.addEventListener("click", () => {
        this.gpsRunner.startRun(false);
        initBox.style.display = "none";
        activeBox.style.display = "flex";
        metricCircle.classList.add("active-pulse");
      });
    }

    // 초기화 버튼 클릭 처리 (다시는 묻지 않기 검사)
    if (btnOpenResetModal) {
      btnOpenResetModal.addEventListener("click", () => {
        const skipConfirm = localStorage.getItem("RUNNOW_SKIP_RESET_CONFIRM") === "true";
        if (skipConfirm) {
          this.executeDataReset();
        } else {
          if (resetModal) resetModal.style.display = "flex";
        }
      });
    }

    // 모달 닫기
    if (btnCloseResetModal && resetModal) {
      btnCloseResetModal.addEventListener("click", () => { resetModal.style.display = "none"; });
    }
    if (btnCancelReset && resetModal) {
      btnCancelReset.addEventListener("click", () => { resetModal.style.display = "none"; });
    }

    // 초기화 확정 실행
    if (btnConfirmReset) {
      btnConfirmReset.addEventListener("click", () => {
        if (chkNeverAsk && chkNeverAsk.checked) {
          localStorage.setItem("RUNNOW_SKIP_RESET_CONFIRM", "true");
        }
        if (resetModal) resetModal.style.display = "none";
        this.executeDataReset();
      });
    }

    if (btnPause) {
      btnPause.addEventListener("click", () => {
        if (this.gpsRunner.isPaused) {
          this.gpsRunner.resumeRun();
          btnPause.textContent = "일시정지";
          metricCircle.classList.add("active-pulse");
        } else {
          this.gpsRunner.pauseRun();
          btnPause.textContent = "이어달리기";
          metricCircle.classList.remove("active-pulse");
        }
      });
    }

    if (btnDiscard) {
      btnDiscard.addEventListener("click", () => {
        if (confirm("현재 진행 중인 러닝을 기록하지 않고 취소하시겠습니까?")) {
          this.gpsRunner.reset();
          this.restoreIdleRunUi();
        }
      });
    }

    if (btnStop) {
      btnStop.addEventListener("click", () => {
        const stats = this.gpsRunner.stopRun();
        initBox.style.display = "block";
        activeBox.style.display = "none";
        metricCircle.classList.remove("active-pulse");

        const paceParts = stats.pace.replace('"', '').split("'");
        const paceSec = (parseInt(paceParts[0], 10) || 6) * 60 + (parseInt(paceParts[1], 10) || 0);

        const result = this.tamagotchi.addKmAndWorkout(stats.distanceKm, stats.elapsedSeconds, paceSec);
        const earnedCoins = Math.round(stats.distanceKm * 20);
        this.userProfile.coins += earnedCoins;

        const workoutPayload = {
          distanceKm: stats.distanceKm,
          elapsedSeconds: stats.elapsedSeconds,
          pace: stats.pace,
          calories: stats.calories,
          earnedXp: result.earnedXp,
          earnedCoins: earnedCoins,
          workoutType: result.workoutType
        };

        const savedLog = this.firebaseSandbox.addWorkoutLog(this.currentUserId, workoutPayload);
        this.firebaseSandbox.setDoc("tamagotchi", this.currentUserId, this.tamagotchi.toJSON());
        this.persistUserProfile();

        firebaseCloud.saveWorkout(this.currentUserId, workoutPayload);
        firebaseCloud.syncTamagotchi(this.currentUserId, this.tamagotchi.toJSON());

        let chalMsg = "";
        const missionDay = this.challengeManager.getNextMissionDay();
        const mission = CHALLENGE_DAYS.find((d) => d.day === missionDay);
        if (this.challengeManager.isWaitingForTomorrow()) {
          chalMsg = "오늘은 이미 챌린지 미션을 완료했습니다. 내일 실제 날짜가 되면 다음 데이가 열립니다.";
        } else {
          const chalResult = this.challengeManager.tryCompleteFromWorkout(missionDay, savedLog);
          if (chalResult.ok) {
            this.applyChallengeClear(chalResult);
            chalMsg = `DAY ${missionDay} 챌린지 성공! 거리 ${savedLog.distanceKm}km · ${savedLog.calories}kcal · ${formatRunTime(savedLog.elapsedSeconds)}. 내일 다음 데이가 열립니다.`;
          } else {
            chalMsg = `DAY ${missionDay} 목표 ${mission?.targetKm || 0}km에 아직 못 미쳤습니다. 런닝 페이지에서 미션을 이어가세요.`;
          }
        }

        this.updateHeaderStats();
        this.renderTamagotchiView();
        this.renderChallengeView();
        this.renderQuestView(this.currentQuestCategory || "all");
        this.showCelebrationModal(stats, result, earnedCoins, chalMsg);
      });
    }
  }

  restoreIdleRunUi() {
    const initBox = document.getElementById("run-init-controls");
    const activeBox = document.getElementById("run-active-controls");
    const metricCircle = document.getElementById("metric-circle");
    const btnPause = document.getElementById("btn-pause-run");
    const distEl = document.getElementById("live-distance");
    const unitEl = document.getElementById("live-distance-unit");
    const subDistEl = document.getElementById("live-distance-sub");
    const paceEl = document.getElementById("live-pace");
    const timeEl = document.getElementById("live-time");
    const calEl = document.getElementById("live-calories");
    const accuracyEl = document.getElementById("live-gps-accuracy");

    if (initBox) initBox.style.display = "block";
    if (activeBox) activeBox.style.display = "none";
    if (metricCircle) metricCircle.classList.remove("active-pulse");
    if (btnPause) btnPause.textContent = "일시정지";
    if (distEl) distEl.textContent = "0";
    if (unitEl) unitEl.textContent = "METERS (m)";
    if (subDistEl) subDistEl.textContent = "0.000 km";
    if (paceEl) paceEl.textContent = `--'--"`;
    if (timeEl) timeEl.textContent = "00:00";
    if (calEl) calEl.textContent = "0";
    if (accuracyEl) accuracyEl.textContent = "🛰️ 실시간 GPS 대기중";
  }

  // 러닝·21일·퀘스트·펫·코인 전체 기록 초기화 (로그인 프로필은 유지)
  executeDataReset() {
    this.gpsRunner.reset();
    this.restoreIdleRunUi();

    this.tamagotchi = new TamagotchiEngine({
      name: "볼트몽",
      level: 1,
      xp: 0,
      totalKm: 0.0,
      hunger: 100,
      happiness: 100,
      energy: 100,
      might: 10,
      agility: 10,
      spirit: 10,
      statusCondition: "HEALTHY"
    });

    this.challengeManager.reset();
    this.userProfile.coins = 0;
    this.selectedChallengeDay = 1;

    const db = this.firebaseSandbox.getDB();
    if (!db.tamagotchi) db.tamagotchi = {};
    if (!db.challenges_progress) db.challenges_progress = {};
    if (!db.claimed_quests) db.claimed_quests = {};
    db.tamagotchi[this.currentUserId] = this.tamagotchi.toJSON();
    db.challenges_progress[this.currentUserId] = this.challengeManager.toJSON();
    db.claimed_quests[this.currentUserId] = [];
    db.workouts = (db.workouts || []).filter((w) => w.userId !== this.currentUserId);
    if (db.users && db.users[this.currentUserId]) db.users[this.currentUserId].coins = 0;

    this.firebaseSandbox.saveDB(db);
    this.persistUserProfile();

    this.updateHeaderStats();
    this.renderTamagotchiView();
    this.renderChallengeView();
    this.renderQuestView(this.currentQuestCategory || "all");

    alert("⚡ 러닝·21일 챌린지·100 퀘스트·다마고치·코인이 모두 처음 상태로 초기화되었습니다.");
  }

  // 즉각적 도파민 축하 모달 표시
  showCelebrationModal(stats, result, earnedCoins, chalMsg = "") {
    const modal = document.getElementById("celebration-modal");
    if (!modal || !result) return;

    document.getElementById("modal-run-type").textContent = result.workoutType || "러닝 완료";
    document.getElementById("modal-dist").textContent = `${Number(stats.distanceKm || 0).toFixed(2)} km`;
    document.getElementById("modal-pace").textContent = stats.pace || "--'--\"";
    document.getElementById("modal-xp").textContent = `+${result.earnedXp || 0} XP`;
    document.getElementById("modal-vc").textContent = `+${earnedCoins || 0} VC`;
    const breakdown = `민첩성 +${result.statGrowth?.agility || 0} | 지구력 +${result.statGrowth?.might || 0} | 정신력 +${result.statGrowth?.spirit || 0}`;
    document.getElementById("modal-stat-breakdown").style.whiteSpace = "pre-line";
    document.getElementById("modal-stat-breakdown").textContent = chalMsg ? `${breakdown}\n${chalMsg}` : breakdown;

    modal.style.display = "flex";
  }

  bindCelebrationModal() {
    const btnClose = document.getElementById("btn-close-modal");
    const modal = document.getElementById("celebration-modal");
    if (btnClose && modal) {
      btnClose.addEventListener("click", () => {
        modal.style.display = "none";
      });
    }
  }

  // 실시간 러닝 지표 렌더링 (m단위 실시간 전환 & 거리 비례 칼로리)
  renderLiveRunStats(stats) {
    const mainDistEl = document.getElementById("live-distance");
    const unitEl = document.getElementById("live-distance-unit");
    const subDistEl = document.getElementById("live-distance-sub");
    const paceEl = document.getElementById("live-pace");
    const timeEl = document.getElementById("live-time");
    const calEl = document.getElementById("live-calories");

    if (mainDistEl) mainDistEl.textContent = stats.displayMainDist;
    if (unitEl) unitEl.textContent = stats.displayUnit;
    if (subDistEl) subDistEl.textContent = stats.displaySubDist;
    if (paceEl) paceEl.textContent = stats.pace;
    if (timeEl) timeEl.textContent = stats.formattedTime;
    if (calEl) calEl.textContent = stats.calories;
  }

  // 다마고치 뷰 렌더링
  renderTamagotchiView() {
    const stage = this.tamagotchi.getStage();
    const avatarContainer = document.getElementById("t-avatar-container");
    const nameEl = document.getElementById("t-display-name");
    const stagePill = document.getElementById("t-stage-pill");
    const taglineEl = document.getElementById("t-tagline");

    if (avatarContainer) avatarContainer.innerHTML = stage.svg;
    if (nameEl) nameEl.textContent = `${this.tamagotchi.name} (${stage.nameKo})`;
    if (stagePill) stagePill.textContent = `Phase ${stage.stage}: ${stage.name} (${stage.minKm}km+)`;
    if (taglineEl) taglineEl.textContent = stage.tagline;

    // Physiology 3대 스탯 표시
    const mightEl = document.getElementById("stat-might");
    const agilityEl = document.getElementById("stat-agility");
    const spiritEl = document.getElementById("stat-spirit");
    if (mightEl) mightEl.textContent = this.tamagotchi.might;
    if (agilityEl) agilityEl.textContent = this.tamagotchi.agility;
    if (spiritEl) spiritEl.textContent = this.tamagotchi.spirit;

    // Mini preview in live run
    const miniIcon = document.getElementById("mini-tamagotchi-icon");
    const miniName = document.getElementById("mini-tamagotchi-name");
    if (miniIcon) miniIcon.textContent = stage.icon;
    if (miniName) miniName.textContent = `${this.tamagotchi.name} (누적 ${this.tamagotchi.totalKm}km)`;

    // Stats
    const xpReq = this.tamagotchi.getXpToNextLevel();
    const xpPct = Math.min(100, Math.round((this.tamagotchi.xp / xpReq) * 100));

    document.getElementById("t-lvl-num").textContent = this.tamagotchi.level;
    document.getElementById("t-xp-val").textContent = `${this.tamagotchi.xp} / ${xpReq} XP`;
    document.getElementById("t-xp-bar").style.width = `${xpPct}%`;

    document.getElementById("t-hunger-val").textContent = `${this.tamagotchi.hunger}%`;
    document.getElementById("t-hunger-bar").style.width = `${this.tamagotchi.hunger}%`;

    document.getElementById("t-happy-val").textContent = `${this.tamagotchi.happiness}%`;
    document.getElementById("t-happy-bar").style.width = `${this.tamagotchi.happiness}%`;

    document.getElementById("t-energy-val").textContent = `${this.tamagotchi.energy}%`;
    document.getElementById("t-energy-bar").style.width = `${this.tamagotchi.energy}%`;
  }

  bindTamagotchiActions() {
    const syncPet = () => {
      this.firebaseSandbox.setDoc("tamagotchi", this.currentUserId, this.tamagotchi.toJSON());
      this.renderTamagotchiView();
    };

    document.getElementById("btn-t-feed").addEventListener("click", () => {
      const res = this.tamagotchi.feed();
      alert(res.msg);
      syncPet();
    });

    document.getElementById("btn-t-play").addEventListener("click", () => {
      const res = this.tamagotchi.play();
      alert(res.msg);
      syncPet();
    });

    document.getElementById("btn-t-rest").addEventListener("click", () => {
      const res = this.tamagotchi.rest();
      alert(res.msg);
      syncPet();
    });

    const btnRescue = document.getElementById("btn-t-rescue");
    if (btnRescue) {
      btnRescue.addEventListener("click", () => {
        const res = this.tamagotchi.rescueVolt();
        alert(res.msg);
        syncPet();
      });
    }
  }

  // 21일 챌린지 뷰 렌더링
  renderChallengeView() {
    const grid = document.getElementById("challenge-grid");
    if (!grid) return;

    // Chapter Header Banner Update
    const currentMission = CHALLENGE_DAYS.find(c => c.day === this.selectedChallengeDay) || CHALLENGE_DAYS[0];
    const chapter = this.challengeManager.getChapterInfo(currentMission.week);
    const chTitleEl = document.getElementById("chapter-title");
    const chDescEl = document.getElementById("chapter-desc");
    if (chTitleEl) chTitleEl.textContent = chapter.chapterTitle;
    if (chDescEl) chDescEl.textContent = chapter.chapterDesc;

    // Habit Cue Display
    const cueDisplay = document.getElementById("habit-cue-display");
    if (cueDisplay) cueDisplay.textContent = `"${this.challengeManager.habitCue}"`;

    grid.innerHTML = "";
    CHALLENGE_DAYS.forEach((c) => {
      const cell = document.createElement("div");
      cell.className = "day-cell";
      if (this.challengeManager.isDayCompleted(c.day)) {
        cell.classList.add("completed");
        cell.innerHTML = `✓<br><span style="font-size:9px;">D${c.day}</span>`;
      } else if (c.day === this.challengeManager.getActiveDay() && this.challengeManager.isDayUnlocked(c.day)) {
        cell.classList.add("current");
        cell.innerHTML = `D${c.day}<br><span style="font-size:9px;">오늘</span>`;
      } else if (!this.challengeManager.isDayUnlocked(c.day)) {
        cell.classList.add("locked");
        cell.innerHTML = `🔒<br><span style="font-size:9px;">D${c.day}</span>`;
      } else {
        cell.innerHTML = `D${c.day}`;
      }

      cell.addEventListener("click", () => {
        this.selectedChallengeDay = c.day;
        this.renderChallengeDetail(c);
      });

      grid.appendChild(cell);
    });

    document.getElementById("challenge-streak").textContent = `🔥 ${this.challengeManager.streak}일 연속`;
    document.getElementById("challenge-percent").textContent = `진행률 ${this.challengeManager.getProgressPercentage()}%`;

    this.renderChallengeDetail(currentMission);
  }

  renderChallengeDetail(c) {
    document.getElementById("detail-day-tag").textContent = `DAY ${c.day} (${c.week}주차)`;
    document.getElementById("detail-reward-tag").textContent = `+${c.xpReward} XP, ${c.coinReward} VC`;
    document.getElementById("detail-title").textContent = c.title;
    document.getElementById("detail-desc").textContent = `${c.desc} (목표: ${c.targetKm}km)`;

    const recordBox = document.getElementById("detail-run-record");
    const msgEl = document.getElementById("detail-mission-msg");
    const btnComplete = document.getElementById("btn-complete-day");
    const savedRecord = this.challengeManager.getDayRecord(c.day);
    const workouts = this.getUserWorkouts();
    const qualifying = this.challengeManager.findQualifyingWorkout(workouts, c.day);

    const paintRecord = (rec) => {
      if (!recordBox) return;
      if (!rec) {
        recordBox.style.display = "none";
        return;
      }
      recordBox.style.display = "grid";
      recordBox.style.gridTemplateColumns = "1fr 1fr 1fr";
      recordBox.style.gap = "8px";
      recordBox.style.textAlign = "center";
      recordBox.innerHTML = `
        <div><div style="font-size:10px; color:var(--text-muted);">거리</div><strong style="color:#fff;">${Number(rec.distanceKm).toFixed(2)} km</strong></div>
        <div><div style="font-size:10px; color:var(--text-muted);">칼로리</div><strong style="color:var(--primary-volt);">${rec.calories} kcal</strong></div>
        <div><div style="font-size:10px; color:var(--text-muted);">시간</div><strong style="color:var(--cyber-cyan);">${formatRunTime(rec.elapsedSeconds)}</strong></div>
      `;
    };

    if (this.challengeManager.isDayCompleted(c.day)) {
      paintRecord(savedRecord);
      if (msgEl) {
        msgEl.textContent = this.challengeManager.isWaitingForTomorrow()
          ? `오늘 미션을 완료했습니다. 약 ${this.challengeManager.hoursUntilTomorrow()}시간 뒤(내일 0시) DAY ${this.challengeManager.getNextMissionDay()}가 열립니다.`
          : "이 데이는 실제 러닝 기록으로 클리어되었습니다.";
      }
      btnComplete.disabled = true;
      btnComplete.textContent = "이미 완료한 챌린지입니다";
      btnComplete.style.opacity = "0.5";
      btnComplete.onclick = null;
      return;
    }

    if (!this.challengeManager.isDayUnlocked(c.day)) {
      paintRecord(null);
      if (msgEl) {
        msgEl.textContent = this.challengeManager.isWaitingForTomorrow()
          ? `아직 실제 날짜가 되지 않았습니다. 내일 DAY ${c.day} 미션을 이어가세요.`
          : "이전 데이를 먼저 완료해야 이 미션이 열립니다.";
      }
      btnComplete.disabled = true;
      btnComplete.textContent = "잠긴 미션입니다";
      btnComplete.style.opacity = "0.5";
      btnComplete.onclick = null;
      return;
    }

    if (qualifying) {
      paintRecord(qualifying);
      if (msgEl) msgEl.textContent = "런닝 페이지의 실제 기록이 목표 거리를 충족했습니다. 완료하면 보상과 함께 기록됩니다.";
      btnComplete.disabled = false;
      btnComplete.textContent = `실제 기록으로 DAY ${c.day} 완료하기`;
      btnComplete.style.opacity = "1";
      btnComplete.onclick = () => {
        const chalResult = this.challengeManager.tryCompleteFromWorkout(c.day, qualifying);
        if (!chalResult.ok) {
          alert("아직 실제 러닝 기록이 부족합니다. 런닝 페이지에서 미션을 이어가세요.");
          return;
        }
        this.applyChallengeClear(chalResult);
        alert(`DAY ${c.day} 미션 성공!\n거리 ${qualifying.distanceKm}km · ${qualifying.calories}kcal · ${formatRunTime(qualifying.elapsedSeconds)}\n보상: +${c.xpReward} XP / +${c.coinReward} VC`);
        this.updateHeaderStats();
        this.renderTamagotchiView();
        this.renderQuestView(this.currentQuestCategory || "all");
        this.renderChallengeView();
      };
      return;
    }

    paintRecord(null);
    if (msgEl) {
      msgEl.textContent = `아직 실제 러닝 기록이 없습니다. 런닝 페이지에서 ${c.targetKm}km를 달려 미션을 이어가세요.`;
    }
    btnComplete.disabled = false;
    btnComplete.textContent = "런닝 페이지에서 이어서 달리기";
    btnComplete.style.opacity = "1";
    btnComplete.onclick = () => {
      alert(`DAY ${c.day} 미션은 실제 러닝 기록이 있어야 완료됩니다.\n목표 ${c.targetKm}km를 런닝 페이지에서 달린 뒤 다시 시도해 주세요.`);
    };
  }

  // 100 퀘스트 & 21일 챌린지 탭 전환 바인딩
  bindQuestAndChallengeTabs() {
    const btnQuest = document.getElementById("tab-btn-quest100");
    const btnChal = document.getElementById("tab-btn-chal21");
    const subQuest = document.getElementById("subview-quests-100");
    const subChal = document.getElementById("subview-challenge-21");

    if (btnQuest && btnChal) {
      btnQuest.onclick = () => {
        btnQuest.className = "btn-primary-volt";
        btnQuest.style.background = "var(--primary-volt)";
        btnQuest.style.color = "#000";
        btnChal.className = "btn-secondary";
        btnChal.style.background = "none";
        btnChal.style.color = "var(--text-muted)";
        if (subQuest) subQuest.style.display = "block";
        if (subChal) subChal.style.display = "none";
        this.renderQuestView(this.currentQuestCategory || "all");
      };

      btnChal.onclick = () => {
        btnChal.className = "btn-primary-volt";
        btnChal.style.background = "var(--primary-volt)";
        btnChal.style.color = "#000";
        btnQuest.className = "btn-secondary";
        btnQuest.style.background = "none";
        btnQuest.style.color = "var(--text-muted)";
        if (subQuest) subQuest.style.display = "none";
        if (subChal) subChal.style.display = "block";
        this.renderChallengeView();
      };
    }

    // Quest category chips
    const qChips = document.querySelectorAll("#quest-category-bar .filter-chip");
    qChips.forEach((chip) => {
      chip.onclick = () => {
        qChips.forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        this.currentQuestCategory = chip.dataset.qcat;
        this.renderQuestView(this.currentQuestCategory);
      };
    });
  }

  // 100 퀘스트 뷰 렌더링
  renderQuestView(category = "all") {
    const listEl = document.getElementById("quest-list-container");
    if (!listEl) return;

    const db = this.firebaseSandbox.getDB();
    if (!db.claimed_quests) db.claimed_quests = {};
    const claimedList = db.claimed_quests[this.currentUserId] || [];
    const workouts = db.workouts?.filter(w => w.userId === this.currentUserId) || [];

    const maxSingleMeters = workouts.length > 0 ? Math.max(...workouts.map(w => Math.round(w.distanceKm * 1000))) : 0;
    const maxSingleKm = workouts.length > 0 ? Math.max(...workouts.map(w => w.distanceKm)) : 0;
    const maxSingleCal = workouts.length > 0 ? Math.max(...workouts.map(w => w.calories || 0)) : 0;
    const totalDistKm = this.tamagotchi.totalKm;
    const petLevel = this.tamagotchi.level;
    const petStage = this.tamagotchi.getStage().stage;

    const filteredQuests = category === "all" ? QUESTS_DATA : QUESTS_DATA.filter(q => q.category === category);

    let totalCompleted = 0;
    QUESTS_DATA.forEach(q => {
      if (claimedList.includes(q.id)) {
        totalCompleted++;
      } else {
        const isAchieved = this.checkQuestCondition(q, {
          maxSingleMeters, maxSingleKm, maxSingleCal, totalDistKm, petLevel, petStage,
          workouts, streak: this.challengeManager.streak
        });
        if (isAchieved) totalCompleted++;
      }
    });

    const progressCountEl = document.getElementById("quest-progress-count");
    const progressBarEl = document.getElementById("quest-progress-bar");
    if (progressCountEl) progressCountEl.textContent = `${totalCompleted} / 100 완료 (${totalCompleted}%)`;
    if (progressBarEl) progressBarEl.style.width = `${totalCompleted}%`;

    listEl.innerHTML = "";

    filteredQuests.forEach((q) => {
      const isClaimed = claimedList.includes(q.id);
      const isAchieved = isClaimed || this.checkQuestCondition(q, {
        maxSingleMeters, maxSingleKm, maxSingleCal, totalDistKm, petLevel, petStage,
        workouts, streak: this.challengeManager.streak
      });

      const card = document.createElement("div");
      card.className = `quest-card ${isClaimed ? 'claimed' : isAchieved ? 'completed' : ''}`;
      
      let actionBtnHtml = "";
      if (isClaimed) {
        actionBtnHtml = `<span style="font-size:11px; color:var(--text-muted); font-weight:800; padding:6px 10px; background:rgba(255,255,255,0.05); border-radius:6px;">✓ 획득 완료</span>`;
      } else if (isAchieved) {
        actionBtnHtml = `<button class="btn-quest-claim" data-qid="${q.id}">🏆 보상 수령</button>`;
      } else {
        actionBtnHtml = `<button class="btn-quest-claim" disabled>진행 중</button>`;
      }

      card.innerHTML = `
        <div style="font-size:24px; padding:6px; background:rgba(255,255,255,0.05); border-radius:10px;">${q.icon}</div>
        <div class="quest-info">
          <div class="quest-title-row">
            <span class="quest-badge">${q.id.replace('q_', 'Q')}</span>
            <span class="quest-title">${q.title}</span>
          </div>
          <div class="quest-desc">${q.desc}</div>
          <div class="quest-reward-pill">⚡ 보상: +${q.xpReward.toLocaleString()} XP / +${q.coinReward} VC</div>
        </div>
        <div>${actionBtnHtml}</div>
      `;

      const claimBtn = card.querySelector(".btn-quest-claim:not(:disabled)");
      if (claimBtn) {
        claimBtn.onclick = () => {
          this.claimQuestReward(q);
        };
      }

      listEl.appendChild(card);
    });
  }

  checkQuestCondition(q, stats) {
    switch(q.targetType) {
      case "single_distance_m": return stats.maxSingleMeters >= q.targetValue;
      case "single_distance_km": return stats.maxSingleKm >= q.targetValue;
      case "total_distance_km": return stats.totalDistKm >= q.targetValue;
      case "tamagotchi_level": return stats.petLevel >= q.targetValue;
      case "tamagotchi_stage": return stats.petStage >= q.targetValue;
      case "tamagotchi_hunger": return this.tamagotchi.hunger >= q.targetValue;
      case "tamagotchi_happiness": return this.tamagotchi.happiness >= q.targetValue;
      case "tamagotchi_energy": return this.tamagotchi.energy >= q.targetValue;
      case "stat_might": return this.tamagotchi.might >= q.targetValue;
      case "stat_agility": return this.tamagotchi.agility >= q.targetValue;
      case "stat_spirit": return this.tamagotchi.spirit >= q.targetValue;
      case "stat_all_80": return this.tamagotchi.might >= 80 && this.tamagotchi.agility >= 80 && this.tamagotchi.spirit >= 80;
      case "stat_all_100": return this.tamagotchi.might >= 100 && this.tamagotchi.agility >= 100 && this.tamagotchi.spirit >= 100;
      case "streak_days": return stats.streak >= q.targetValue;
      case "total_sessions": return stats.workouts.length >= q.targetValue;
      case "single_calories": return stats.maxSingleCal >= q.targetValue;
      case "single_time_sec": return (stats.workouts.find(w => w.elapsedSeconds >= q.targetValue) !== undefined);
      case "challenge_day": return this.challengeManager.isDayCompleted(q.targetValue);
      case "challenge_week": return this.challengeManager.completedDays.length >= (q.targetValue * 7);
      case "profile_saved": return Boolean(this.userProfile.name && this.userProfile.heightCm);
      case "visit_shop": return true;
      case "action_feed": case "action_play": case "action_rest": case "time_morning_run": case "time_night_run": case "habit_cue_runs":
        return stats.workouts.length > 0 || this.tamagotchi.xp > 0;
      case "pace_max_sec":
        return stats.workouts.some(w => {
          if (!w.pace || w.pace === '--\'--"') return false;
          const parts = w.pace.replace('"', '').split("'");
          const sec = (parseInt(parts[0], 10) || 10) * 60 + (parseInt(parts[1], 10) || 0);
          return sec <= q.targetValue;
        });
      case "5k_time_sec": return stats.workouts.some(w => w.distanceKm >= 5.0 && w.elapsedSeconds <= q.targetValue);
      case "10k_time_sec": return stats.workouts.some(w => w.distanceKm >= 10.0 && w.elapsedSeconds <= q.targetValue);
      case "all_quests_completed": return false;
      default: return false;
    }
  }

  claimQuestReward(q) {
    const db = this.firebaseSandbox.getDB();
    if (!db.claimed_quests) db.claimed_quests = {};
    if (!db.claimed_quests[this.currentUserId]) db.claimed_quests[this.currentUserId] = [];

    if (db.claimed_quests[this.currentUserId].includes(q.id)) return;

    db.claimed_quests[this.currentUserId].push(q.id);
    this.firebaseSandbox.saveDB(db);

    this.tamagotchi.addXp(q.xpReward);
    this.userProfile.coins += q.coinReward;

    this.firebaseSandbox.setDoc("tamagotchi", this.currentUserId, this.tamagotchi.toJSON());
    this.firebaseSandbox.setDoc("users", this.currentUserId, { coins: this.userProfile.coins });

    alert(`🎉 [${q.id.replace('q_', 'Q')}] ${q.title} 퀘스트 달성!\n\n✨ 보상 지급 완료:\n+${q.xpReward.toLocaleString()} XP (다마고치 성장치)\n+${q.coinReward} VC (볼트 코인)`);

    this.updateHeaderStats();
    this.renderTamagotchiView();
    this.renderQuestView(this.currentQuestCategory || "all");
  }

  // 20종 상점 아이템 렌더링 (원화 ₩, 중앙 정렬 텍스트, 좌측 정렬 가격, 가격 아래 결제 버튼)
  renderShopView(filterCategory = "all") {
    const grid = document.getElementById("shop-items-grid");
    if (!grid) return;

    grid.innerHTML = "";
    const items = filterCategory === "all" ? SHOP_ITEMS : SHOP_ITEMS.filter(i => i.category === filterCategory);

    items.forEach((item) => {
      const card = document.createElement("div");
      card.className = "shop-card";
      const priceKrwFormatted = item.priceKRW ? `₩${item.priceKRW.toLocaleString()}` : "₩6,900";

      card.innerHTML = `
        <div>
          <div class="item-icon-box">${item.icon}</div>
          <div class="item-name">${item.name}</div>
          <div class="item-bonus">${item.bonus}</div>
        </div>
        <div class="item-bottom">
          <div class="item-price">${priceKrwFormatted}</div>
          <button class="btn-buy" data-item-id="${item.id}">결제</button>
        </div>
      `;

      const buyBtn = card.querySelector(".btn-buy");
      buyBtn.addEventListener("click", () => {
        this.paypalBridge.processPayment(item, (purchasedItem) => {
          this.userProfile.coins += purchasedItem.voltCoins;
          this.firebaseSandbox.setDoc("users", this.currentUserId, { coins: this.userProfile.coins });
          this.updateHeaderStats();
          alert(`✅ 결제 완료!\n\n아이템: ${purchasedItem.name}\n혜택: ${purchasedItem.bonus}\n\n인벤토리 및 코인에 정상 반영되었습니다!`);
        });
      });

      grid.appendChild(card);
    });

    // Filter chip events
    const chips = document.querySelectorAll(".shop-filter-bar .filter-chip");
    chips.forEach(chip => {
      chip.onclick = () => {
        chips.forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        this.renderShopView(chip.dataset.cat);
      };
    });
  }

  // 프로필 설정 폼
  bindProfileForm() {
    const form = document.getElementById("profile-form");
    if (!form) return;

    const nameInput = document.getElementById("prof-name");
    const heightInput = document.getElementById("prof-height");
    const weightInput = document.getElementById("prof-weight");
    const ageInput = document.getElementById("prof-age");
    const targetInput = document.getElementById("prof-target-weight");
    const cueInput = document.getElementById("prof-cue");

    if (nameInput) nameInput.value = this.userProfile.name || "";
    if (heightInput) heightInput.value = this.userProfile.heightCm;
    if (weightInput) weightInput.value = this.userProfile.weightKg;
    if (ageInput) ageInput.value = this.userProfile.age;
    if (targetInput) targetInput.value = this.userProfile.targetWeightKg;
    if (cueInput) cueInput.value = this.challengeManager.habitCue;

    const paintGender = (gender) => {
      document.querySelectorAll(".prof-gender-btn").forEach((btn) => {
        const on = btn.dataset.gender === gender;
        btn.classList.toggle("active", on);
        btn.style.borderColor = on ? "var(--primary-volt)" : "var(--border-glass)";
        btn.style.color = on ? "var(--primary-volt)" : "var(--text-muted)";
      });
    };
    paintGender(this.userProfile.gender || "M");
    document.querySelectorAll(".prof-gender-btn").forEach((btn) => {
      btn.onclick = () => {
        this.userProfile.gender = btn.dataset.gender;
        paintGender(this.userProfile.gender);
        calcBMI();
      };
    });

    const calcBMI = () => {
      const h = parseFloat(document.getElementById("prof-height")?.value) || 175;
      const w = parseFloat(document.getElementById("prof-weight")?.value) || 70;
      const age = parseInt(document.getElementById("prof-age")?.value, 10) || this.userProfile.age || 30;
      const gender = document.querySelector(".prof-gender-btn.active")?.dataset.gender || this.userProfile.gender || "M";
      const bmi = this.calcBmi(h, w);
      const bmr = this.calcBmr(h, w, age, gender);
      const bmiEl = document.getElementById("calc-bmi");
      const bmrEl = document.getElementById("calc-bmr");
      if (bmiEl) bmiEl.textContent = `${bmi} (${this.bmiLabel(bmi)})`;
      if (bmrEl) bmrEl.textContent = `${bmr.toLocaleString()} kcal`;
    };

    calcBMI();
    document.getElementById("prof-height")?.addEventListener("input", calcBMI);
    document.getElementById("prof-weight")?.addEventListener("input", calcBMI);
    document.getElementById("prof-age")?.addEventListener("input", calcBMI);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.userProfile.name = document.getElementById("prof-name")?.value.trim() || "러너";
      this.userProfile.heightCm = parseFloat(document.getElementById("prof-height")?.value) || 175;
      this.userProfile.weightKg = parseFloat(document.getElementById("prof-weight")?.value) || 70;
      this.userProfile.age = parseInt(document.getElementById("prof-age")?.value, 10) || this.userProfile.age;
      this.userProfile.targetWeightKg = parseFloat(document.getElementById("prof-target-weight")?.value) || this.userProfile.targetWeightKg;
      this.userProfile.gender = document.querySelector(".prof-gender-btn.active")?.dataset.gender || this.userProfile.gender || "M";
      this.gpsRunner.setWeight(this.userProfile.weightKg);

      const cueVal = document.getElementById("prof-cue")?.value.trim() || "";
      if (cueVal) this.challengeManager.setHabitCue(cueVal);

      this.persistUserProfile();
      this.firebaseSandbox.setDoc("challenges_progress", this.currentUserId, this.challengeManager.toJSON());
      this.updateHeaderStats();
      this.renderChallengeView();
      alert(`저장되었습니다.\n나이 ${this.userProfile.age}세 · 키 ${this.userProfile.heightCm}cm · 몸무게 ${this.userProfile.weightKg}kg`);
    });

    const btnResetSandbox = document.getElementById("btn-reset-sandbox");
    if (btnResetSandbox) {
      btnResetSandbox.addEventListener("click", () => {
        if (confirm("정말로 Firebase Sandbox 로컬 데이터를 초기화하시겠습니까?")) {
          this.firebaseSandbox.resetSandbox();
          alert("🔥 샌드박스가 초기 상태로 리셋되었습니다. 페이지를 새로고침합니다.");
          location.reload();
        }
      });
    }

    // Firestore 실시간 데이터 뷰어 모달 연결
    const btnViewFirestore = document.getElementById("btn-view-firestore");
    const firestoreModal = document.getElementById("firestore-modal");
    const btnCloseFirestore = document.getElementById("btn-close-firestore-modal");
    const btnRefreshFirestore = document.getElementById("btn-refresh-firestore-modal");
    const jsonViewer = document.getElementById("firestore-json-viewer");

    const renderFirestoreJSON = () => {
      if (jsonViewer) {
        const currentDB = this.firebaseSandbox.getDB();
        jsonViewer.textContent = JSON.stringify(currentDB, null, 2);
      }
    };

    if (btnViewFirestore && firestoreModal) {
      btnViewFirestore.addEventListener("click", () => {
        renderFirestoreJSON();
        firestoreModal.style.display = "flex";
      });
    }

    if (btnCloseFirestore && firestoreModal) {
      btnCloseFirestore.addEventListener("click", () => {
        firestoreModal.style.display = "none";
      });
    }

    if (btnRefreshFirestore) {
      btnRefreshFirestore.addEventListener("click", () => {
        renderFirestoreJSON();
      });
    }
  }
}

// 애플리케이션 시작
window.addEventListener("DOMContentLoaded", () => {
  const app = new AppController();
  app.init();
});

