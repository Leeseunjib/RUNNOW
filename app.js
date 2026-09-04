// 메인 애플리케이션 진입점 및 통합 컨트롤러 (RunGotchi App Controller)

import { SHOP_ITEMS } from './catalog.js';
import { TamagotchiEngine, DOG_STAGES, CAT_STAGES, STAGES } from './tamagotchi.js';
import { GPSRunner } from './gpsRunner.js';
import { ChallengeManager, CHALLENGE_DAYS, CHALLENGE_CHAPTERS, formatRunTime } from './challenge.js';
import { QUEST_MAIN_TABS, DAILY_QUESTS, WEEKLY_QUESTS, BOUNTY_QUESTS, QUEST_CATEGORIES, QUESTS_DATA } from './quests.js';
import { PayPalBridge } from './paypalBridge.js';
import { FirebaseSandbox } from './firebaseSandbox.js';
import { firebaseCloud } from './firebaseClient.js';
import { MotionTracker, EXERCISE_TYPES, DIFFICULTY_LEVELS, DEFAULT_DIFFICULTY } from './motionTracker.js';
import { MotionSound } from './motionSound.js';

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
      petType: "dog",
      petChosen: false,
      name: "댕댕이",
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

    this.motionSound = new MotionSound();
    this.currentWorkoutMode = "list";
    this.runPlaceMode = "gps";
    this.treadmillSpeedKmh = 8;
    this.targetMotionReps = 10;
    const savedLevel = localStorage.getItem("RUNNOW_MOTION_LEVEL");
    this.motionLevelId = DIFFICULTY_LEVELS[savedLevel] ? savedLevel : DEFAULT_DIFFICULTY;
    this.motionTracker = new MotionTracker({
      weightKg: this.userProfile.weightKg,
      difficulty: this.motionLevelId,
      onRepCount: (data) => this.handleMotionRepCount(data),
      onFeedback: (data) => this.handleMotionFeedback(data),
      onStateUpdate: (data) => this.handleMotionStateUpdate(data),
      onPhaseChange: (data) => this.handleMotionPhaseChange(data)
    });

    this.paypalBridge = new PayPalBridge();
    this.selectedChallengeDay = this.challengeManager.currentDay;
    this.currentQuestMainTab = "daily";
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
    const payload = {
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
    };
    this.firebaseSandbox.setDoc("users", this.currentUserId, payload);
    firebaseCloud.syncUser(this.currentUserId, payload);
  }

  getUserWorkouts() {
    const db = this.firebaseSandbox.getDB();
    return (db.workouts || []).filter((w) => w.userId === this.currentUserId);
  }

  initThemeSystem() {
    const savedTheme = localStorage.getItem("RUNNOW_THEME") || "webtoon";
    this.applyTheme(savedTheme);

    const themeBar = document.getElementById("app-theme-bar");
    if (themeBar) {
      const buttons = themeBar.querySelectorAll(".theme-btn");
      buttons.forEach((btn) => {
        btn.addEventListener("click", () => {
          const themeVal = btn.getAttribute("data-theme-val");
          if (themeVal) {
            this.applyTheme(themeVal);
          }
        });
      });
    }
  }

  applyTheme(themeName) {
    document.documentElement.setAttribute("data-theme", themeName);
    localStorage.setItem("RUNNOW_THEME", themeName);

    const buttons = document.querySelectorAll("#app-theme-bar .theme-btn");
    buttons.forEach((btn) => {
      if (btn.getAttribute("data-theme-val") === themeName) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }

  applyChallengeClear(result) {
    if (!result?.ok) return;
    this.tamagotchi.addXp(result.mission.xpReward);
    this.userProfile.coins += result.mission.coinReward;
    this.firebaseSandbox.setDoc("challenges_progress", this.currentUserId, this.challengeManager.toJSON());
    this.firebaseSandbox.setDoc("tamagotchi", this.currentUserId, this.tamagotchi.toJSON());
    this.persistUserProfile();
    firebaseCloud.syncChallenge(this.currentUserId, this.challengeManager.toJSON());
    firebaseCloud.syncTamagotchi(this.currentUserId, this.tamagotchi.toJSON());
  }

  async init() {
    this.initThemeSystem();
    this.bindNavigation();
    this.bindWorkoutModeSwitcher();
    this.bindMotionFitnessStudio();
    this.bindRunControls();
    this.bindTamagotchiActions();
    this.bindQuestAndChallengeTabs();
    this.bindProfileForm();
    this.bindCelebrationModal();
    this.bindAuthAndOnboarding();
    this.bindPetSelect();
    this.bindMobileConnectModal();
    await this.hydrateFromCloud();
    this.renderTamagotchiView();
    this.renderDailyQuests();
    this.renderWeeklyQuests();
    this.renderBountyQuests();
    this.renderChallengeView();
    this.renderQuestView("all");
    this.renderShopView("all");
    this.updateHeaderStats();
    this.routeAppViews();

    console.log("⚡ RUNNOW Multi-Step Onboarding App & AI Motion Fitness Initialized!");
  }

  async hydrateFromCloud() {
    const session = firebaseCloud.getCurrentSession();
    if (!session?.uid || session.uid === "guest_runner") return;

    const user = await firebaseCloud.getUser(session.uid);
    if (user) {
      this.currentUserId = session.uid;
      this.firebaseSandbox.setDoc("users", session.uid, user);
      this.userProfile = {
        ...this.userProfile,
        name: user.displayName || this.userProfile.name,
        heightCm: user.heightCm ?? this.userProfile.heightCm,
        weightKg: user.weightKg ?? this.userProfile.weightKg,
        age: user.age ?? this.userProfile.age,
        gender: user.gender || this.userProfile.gender,
        targetWeightKg: user.targetWeightKg ?? this.userProfile.targetWeightKg,
        frequency: user.frequency ?? this.userProfile.frequency,
        goalType: user.goalType || this.userProfile.goalType,
        coins: user.coins ?? this.userProfile.coins
      };
    }

    const pet = await firebaseCloud.getTamagotchi(session.uid);
    if (pet) {
      this.tamagotchi = new TamagotchiEngine(pet);
      this.firebaseSandbox.setDoc("tamagotchi", session.uid, pet);
    }

    const chal = await firebaseCloud.getChallenge(session.uid);
    if (chal) {
      this.challengeManager = new ChallengeManager(chal);
      this.firebaseSandbox.setDoc("challenges_progress", session.uid, chal);
    }
  }

  hasChosenPet() {
    const db = this.firebaseSandbox.getDB();
    const petDoc = db.tamagotchi?.[this.currentUserId];
    return petDoc?.petChosen === true || this.tamagotchi?.petChosen === true;
  }

  setViewDisplay(el, show) {
    if (!el) return;
    el.style.display = show ? "flex" : "none";
  }

  routeAppViews() {
    const viewAuth = document.getElementById("view-auth");
    const viewOnboarding = document.getElementById("view-onboarding");
    const viewPetSelect = document.getElementById("view-pet-select");
    const mainAppContainer = document.getElementById("main-app-container");

    const activeSession = firebaseCloud.getCurrentSession();
    const db = this.firebaseSandbox.getDB();
    const userDoc = activeSession ? db.users?.[activeSession.uid] : null;

    this.setViewDisplay(viewAuth, false);
    this.setViewDisplay(viewOnboarding, false);
    this.setViewDisplay(viewPetSelect, false);
    this.setViewDisplay(mainAppContainer, false);

    if (!activeSession) {
      this.setViewDisplay(viewAuth, true);
      return;
    }

    if (!userDoc || !userDoc.onboarded) {
      this.setViewDisplay(viewOnboarding, true);
      this.initOnboardingForm(activeSession);
      return;
    }

    if (!this.hasChosenPet()) {
      this.pendingPetType = null;
      document.querySelectorAll(".ps-card").forEach((card) => card.classList.remove("active"));
      const btnConfirm = document.getElementById("btn-confirm-pet");
      const btnLabel = document.getElementById("btn-confirm-pet-label");
      if (btnConfirm) btnConfirm.disabled = true;
      if (btnLabel) btnLabel.textContent = "파트너를 먼저 선택해 주세요";
      this.setViewDisplay(viewPetSelect, true);
      return;
    }

    this.setViewDisplay(mainAppContainer, true);
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

        if (targetTabId !== "tab-run" && this.motionTracker.isRunning) {
          this.motionTracker.stopCamera();
          this.restoreIdleMotionUi();
          this.showWorkoutView("list");
        }

        if (targetTabId === "tab-tamagotchi") this.renderTamagotchiView();
        if (targetTabId === "tab-challenge") {
          this.renderDailyQuests();
          this.renderWeeklyQuests();
          this.renderBountyQuests();
          this.renderChallengeView();
          this.renderQuestView(this.currentQuestCategory || "all");
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
      btn.style.borderColor = on ? "var(--primary-accent)" : "var(--border-card)";
      btn.style.color = on ? "var(--primary-accent)" : "var(--text-muted)";
    });

    const savedGoal = saved.goalType || "DIET";
    document.querySelectorAll(".ob-goal-card").forEach((card) => {
      const on = card.dataset.goal === savedGoal;
      card.classList.toggle("active", on);
      card.style.borderColor = on ? "var(--primary-accent)" : "var(--border-card)";
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
          b.style.borderColor = "var(--border-card)";
          b.style.color = "var(--text-muted)";
        });
        btn.classList.add("active");
        btn.style.borderColor = "var(--primary-accent)";
        btn.style.color = "var(--primary-accent)";
        calcMeter();
      };
    });

    // 다이어트/운동 목표 카드 토글
    const goalCards = document.querySelectorAll(".ob-goal-card");
    goalCards.forEach(card => {
      card.onclick = () => {
        goalCards.forEach(c => {
          c.classList.remove("active");
          c.style.borderColor = "var(--border-card)";
        });
        card.classList.add("active");
        card.style.borderColor = "var(--primary-accent)";
      };
    });
  }

  bindPetSelect() {
    const cards = document.querySelectorAll(".ps-card");
    const btnConfirm = document.getElementById("btn-confirm-pet");
    const btnLabel = document.getElementById("btn-confirm-pet-label");
    this.pendingPetType = null;

    const paintSelection = (petType) => {
      cards.forEach((card) => {
        card.classList.toggle("active", card.dataset.pet === petType);
      });
      if (btnConfirm) btnConfirm.disabled = !petType;
      if (btnLabel) {
        btnLabel.textContent = petType === "cat"
          ? "냥냥이와 함께 달리기"
          : petType === "dog"
            ? "댕댕이와 함께 달리기"
            : "파트너를 먼저 선택해 주세요";
      }
    };

    cards.forEach((card) => {
      card.onclick = () => {
        this.pendingPetType = card.dataset.pet;
        paintSelection(this.pendingPetType);
      };
    });

    if (btnConfirm) {
      btnConfirm.onclick = () => {
        if (this.pendingPetType !== "dog" && this.pendingPetType !== "cat") {
          alert("강아지 또는 고양이를 먼저 선택해 주세요.");
          return;
        }
        this.commitPetChoice(this.pendingPetType);
      };
    }
  }

  commitPetChoice(petType) {
    const petName = petType === "cat" ? "냥냥이" : "댕댕이";
    this.tamagotchi.setPetType(petType);
    this.tamagotchi.petChosen = true;
    this.tamagotchi.name = petName;

    this.firebaseSandbox.setDoc("tamagotchi", this.currentUserId, this.tamagotchi.toJSON());
    firebaseCloud.syncTamagotchi(this.currentUserId, this.tamagotchi.toJSON());
    this.renderTamagotchiView();
    this.updateHeaderStats();
    this.routeAppViews();
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
        location.reload();
      } else {
        this.routeAppViews();
      }
    };

    // 게스트 로그인 바인딩
    const btnQuickGuestLogin = document.getElementById("btn-quick-guest-login");
    if (btnQuickGuestLogin) {
      btnQuickGuestLogin.onclick = () => {
        const guestSession = {
          uid: "guest_" + Math.random().toString(36).substring(2, 9),
          displayName: "게스트 러너",
          email: "",
          photoURL: "",
          expiresAt: Date.now() + (12 * 60 * 60 * 1000)
        };
        this.currentUserId = guestSession.uid;
        completeAuthLogin(guestSession);
      };
    }

    // Google 원클릭 로그인
    const btnPageGoogleLogin = document.getElementById("btn-page-google-login");
    const btnModalGoogleLogin = document.getElementById("btn-google-login");

    const startGoogleLogin = async () => {
      try {
        const session = await firebaseCloud.signInWithGoogle();
        this.currentUserId = session.uid;
        completeAuthLogin(session);
      } catch (err) {
        console.error("Google Login Error:", err);
        const msg = firebaseCloud.authErrorMessage(err);
        alert(msg);
      }
    };

    if (btnPageGoogleLogin) btnPageGoogleLogin.onclick = startGoogleLogin;
    if (btnModalGoogleLogin) btnModalGoogleLogin.onclick = startGoogleLogin;

    // 이메일 회원가입 모달 열기/닫기/제출
    const btnOpenEmailSignup = document.getElementById("btn-open-email-signup");
    const signupModal = document.getElementById("email-signup-modal");
    const btnCloseSignupModal = document.getElementById("btn-close-signup-modal");
    const btnModalSubmitSignup = document.getElementById("btn-modal-submit-signup");

    if (btnOpenEmailSignup) btnOpenEmailSignup.onclick = () => { if (signupModal) signupModal.style.display = "flex"; };
    if (btnCloseSignupModal && signupModal) btnCloseSignupModal.onclick = () => { signupModal.style.display = "none"; };

    if (btnModalSubmitSignup) {
      btnModalSubmitSignup.onclick = async () => {
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

        try {
          const session = await firebaseCloud.signUpWithEmail(email, pw);
          this.currentUserId = session.uid;
          if (signupModal) signupModal.style.display = "none";
          if (viewAuth) viewAuth.style.display = "none";
          if (viewOnboarding) viewOnboarding.style.display = "flex";
          if (mainAppContainer) mainAppContainer.style.display = "none";
          this.initOnboardingForm(session);
        } catch (err) {
          alert(firebaseCloud.authErrorMessage(err));
        }
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
      btnModalSubmitLogin.onclick = async () => {
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

        try {
          const session = await firebaseCloud.signInWithEmail(email, pw);
          this.currentUserId = session.uid;
          if (loginModalDirect) loginModalDirect.style.display = "none";
          completeAuthLogin(session);
        } catch (err) {
          alert(firebaseCloud.authErrorMessage(err));
        }
      };
    }

    // STEP 2 온보딩 저장 버튼 ➔ 메인 홈(STEP 3)으로 진입
    const btnSaveOnboarding = document.getElementById("btn-submit-onboarding") || document.getElementById("btn-save-onboarding");
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
        firebaseCloud.syncUser(uid, db.users[uid]);
        firebaseCloud.syncChallenge(uid, db.challenges_progress[uid]);
        localStorage.setItem("RUNNOW_CURRENT_USER_ID", uid);
        const sessionKeep = firebaseCloud.getCurrentSession() || activeSession;
        localStorage.setItem("RUNNOW_AUTH_SESSION", JSON.stringify({
          ...sessionKeep,
          uid,
          displayName: name,
          expiresAt: sessionKeep.expiresAt || (Date.now() + (12 * 60 * 60 * 1000))
        }));

        alert(`🎉 ${name} 러너님의 신체 분석 및 다이어트 러닝 플랜이 완성되었습니다!\n\n이제 함께 달릴 파트너를 선택합니다.`);
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
    if (calEl) calEl.textContent = Number(stats.calories || 0).toLocaleString();
    if (accuracyEl && stats.gpsAccuracy) accuracyEl.textContent = `🛰️ ${stats.gpsAccuracy}`;
  }

  showWorkoutView(mode) {
    const viewList = document.getElementById("workout-view-list");
    const viewGps = document.getElementById("workout-view-gps");
    const viewMotion = document.getElementById("workout-view-motion");

    this.currentWorkoutMode = mode;
    if (viewList) viewList.style.display = mode === "list" ? "block" : "none";
    if (viewGps) viewGps.style.display = mode === "gps" ? "block" : "none";
    if (viewMotion) viewMotion.style.display = mode === "motion" ? "block" : "none";
  }

  returnToExerciseList(from) {
    if (from === "gps" && this.gpsRunner.isTracking) {
      alert("러닝이 진행 중입니다. 먼저 완주하거나 취소한 뒤 목록으로 돌아가세요.");
      return;
    }
    if (from === "motion" && this.motionTracker.isRunning) {
      if (!confirm("운동 진행 중입니다. 목록으로 돌아가면 현재 기록은 저장되지 않습니다.")) {
        return;
      }
      this.motionTracker.stopCamera();
      this.restoreIdleMotionUi();
    }
    this.showWorkoutView("list");
  }

  applyMotionExerciseUi(exKey) {
    this.motionTracker.setExercise(exKey);
    const curEx = this.motionTracker.currentExercise;
    const title = curEx.name.replace("AI ", "");
    const setText = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    };

    setText("motion-standby-title", `${curEx.name} 트레이닝`);
    setText("motion-standby-desc", "전신이 나오게 시작 자세를 잡으면 AI가 준비 상태를 확인한 뒤, 3초 카운트다운이 끝나야 횟수를 셉니다.");
    setText("motion-page-title", title);
    setText("motion-hud-icon", curEx.icon);
    setText("motion-rep-unit", curEx.shortName || title.toUpperCase());
    setText("motion-angle-label", curEx.jointLabel || "JOINT");
    setText("motion-stat-label", `${(curEx.targetStat || "might").toUpperCase()}`);
    setText("motion-tips-title", `${title} Tips`);
    setText("motion-hud-angle", "180°");

    const tipsList = document.getElementById("motion-tips-list");
    if (tipsList) {
      const tips = curEx.tips || [];
      tipsList.innerHTML = tips.map((tip) => `<li>${tip}</li>`).join("");
    }

    const cover = document.getElementById("motion-cover-img");
    if (cover) {
      cover.src = curEx.cover || "";
      cover.alt = title;
      cover.hidden = !curEx.cover;
    }

    this.updateMotionTargetLabels();
    this.renderMotionProgress(0);
    this.updateMotionMascotPreview();
  }

  updateMotionTargetLabels() {
    const target = this.targetMotionReps;
    const denomEl = document.getElementById("motion-target-denom");
    if (denomEl) denomEl.textContent = target === 0 ? "/ ∞" : `/ ${target}`;
    this.renderMotionProgress(this.motionTracker.repCount || 0);
  }

  renderMotionProgress(reps) {
    const target = this.targetMotionReps;
    const countEl = document.getElementById("motion-progress-count");
    const fillEl = document.getElementById("motion-progress-fill");
    const dotsEl = document.getElementById("motion-progress-dots");
    const safeReps = Number(reps) || 0;
    const denom = target === 0 ? "∞" : String(target);
    if (countEl) countEl.textContent = `${safeReps}/${denom}`;
    if (fillEl) {
      const pct = target === 0 ? Math.min(100, safeReps * 10) : Math.min(100, (safeReps / target) * 100);
      fillEl.style.width = `${pct}%`;
    }
    if (!dotsEl) return;
    const dotCount = target === 0 ? 0 : Math.min(target, 20);
    if (dotCount === 0) {
      dotsEl.innerHTML = "";
      return;
    }
    dotsEl.innerHTML = Array.from({ length: dotCount }, (_, i) => {
      const done = i < safeReps ? " done" : "";
      return `<span class="pose-dot${done}"></span>`;
    }).join("");
  }

  // 운동 목록 → GPS / 카메라 페이지
  bindWorkoutModeSwitcher() {
    this.showWorkoutView("list");

    const catalog = document.getElementById("exercise-catalog");
    if (catalog) {
      catalog.addEventListener("click", (event) => {
        const card = event.target.closest(".ex-pick-card");
        if (!card) return;
        const workout = card.dataset.workout;
        if (workout === "run") {
          if (this.motionTracker.isRunning) {
            this.motionTracker.stopCamera();
            this.restoreIdleMotionUi();
          }
          this.showWorkoutView("gps");
          return;
        }
        if (workout === "motion") {
          if (this.gpsRunner.isTracking) {
            alert("러닝이 진행 중입니다. 먼저 완주하거나 취소하세요.");
            return;
          }
          this.applyMotionExerciseUi(card.dataset.exercise);
          this.showWorkoutView("motion");
        }
      });
    }

    document.querySelectorAll(".btn-back-exercise-list").forEach((btn) => {
      btn.addEventListener("click", () => this.returnToExerciseList(btn.dataset.backFrom));
    });
  }

  updateMotionMascotPreview() {
    const iconEl = document.getElementById("motion-mascot-icon");
    const nameEl = document.getElementById("motion-mascot-name");
    const speechEl = document.getElementById("motion-mascot-speech");

    const petIcon = this.tamagotchi.petType === "cat" ? "🐱" : "🐶";
    const petName = this.tamagotchi.name || (this.tamagotchi.petType === "cat" ? "냥냥이" : "댕댕이");

    if (iconEl) iconEl.textContent = petIcon;
    if (nameEl) nameEl.textContent = `파트너 ${petName}`;
    if (speechEl) {
      speechEl.textContent = `"${this.userProfile.name}, 멋진 ${this.motionTracker.currentExercise.name}로 도파민을 채워봐요! 🔥"`;
    }
  }

  // Google MediaPipe AI 모션 피트니스 스튜디오 이벤트 바인딩
  bindMotionFitnessStudio() {
    const videoEl = document.getElementById("motion-video");
    const canvasEl = document.getElementById("motion-canvas");
    const standbyOverlay = document.getElementById("motion-standby-overlay");
    const activeControls = document.getElementById("motion-active-controls");
    const btnStartCamera = document.getElementById("btn-start-camera");
    const btnPauseMotion = document.getElementById("btn-pause-motion");
    const btnStopMotion = document.getElementById("btn-stop-motion");
    const btnDiscardMotion = document.getElementById("btn-discard-motion");
    const btnSwitchCamera = document.getElementById("btn-switch-camera");
    const btnToggleSound = document.getElementById("btn-toggle-sound");
    const btnCloseMotionModal = document.getElementById("btn-close-motion-modal");
    const motionModal = document.getElementById("motion-celebration-modal");

    // 1. 운동 종류 선택 카드 클릭 이벤트
    const exCards = document.querySelectorAll(".motion-ex-card");
    exCards.forEach(card => {
      card.addEventListener("click", () => {
        if (this.motionTracker.isRunning) {
          if (!confirm("운동 진행 중입니다. 종목을 변경하시겠습니까? (현재 기록은 초기화됩니다)")) {
            return;
          }
          this.motionTracker.stopCamera();
          this.restoreIdleMotionUi();
        }

        exCards.forEach(c => {
          c.classList.remove("active");
          c.style.border = "1px solid var(--border-card)";
        });
        card.classList.add("active");
        card.style.border = "2px solid var(--primary-accent)";

        const exKey = card.dataset.exercise;
        this.motionTracker.setExercise(exKey);

        const curEx = this.motionTracker.currentExercise;
        const standbyTitle = document.getElementById("motion-standby-title");
        const standbyDesc = document.getElementById("motion-standby-desc");
        const hudIcon = document.getElementById("motion-hud-icon");
        const hudName = document.getElementById("motion-hud-name");
        const statLabel = document.getElementById("motion-stat-label");

        if (standbyTitle) standbyTitle.textContent = `${curEx.name} 트레이닝`;
        if (standbyDesc) standbyDesc.textContent = curEx.description;
        if (hudIcon) hudIcon.textContent = curEx.icon;
        if (hudName) hudName.textContent = curEx.name.replace("AI ", "");
        if (statLabel) statLabel.textContent = `${curEx.targetStat.toUpperCase()} GAIN`;

        this.updateMotionMascotPreview();
      });
    });

    // 1-2. 난이도(초보자 / 중급자 / 단련자) 선택 칩
    const levelChips = document.querySelectorAll("#motion-level-chips .target-chip");
    levelChips.forEach((chip) => {
      chip.addEventListener("click", () => {
        this.applyMotionLevel(chip.dataset.level);
      });
    });
    this.applyMotionLevel(this.motionLevelId, { silent: true });

    // 2. 목표 횟수 퀵 선택 칩 클릭 이벤트
    const targetChips = document.querySelectorAll("#motion-target-chips .target-chip");
    targetChips.forEach(chip => {
      chip.addEventListener("click", () => {
        targetChips.forEach(c => c.classList.remove("active"));
        chip.classList.add("active");

        const target = parseInt(chip.dataset.target, 10);
        this.targetMotionReps = target;
        this.updateMotionTargetLabels();
      });
    });

    // 3. 카메라 및 AI 트래커 시작 버튼
    if (btnStartCamera) {
      btnStartCamera.addEventListener("click", async () => {
        btnStartCamera.disabled = true;
        btnStartCamera.innerHTML = `<span>⏳ AI 모델 준비 및 카메라 연결 중...</span>`;

        try {
          this.motionSound.ensureAudioUnlocked();
          this.motionTracker.setWeight(this.userProfile.weightKg);

          await this.motionTracker.startCamera(videoEl, canvasEl);

          if (standbyOverlay) standbyOverlay.style.display = "none";
          if (activeControls) activeControls.style.display = "flex";

          this.motionSound.speakCoaching(
            `${this.motionTracker.currentExercise.name} ${this.motionTracker.getDifficulty().name} 난이도입니다.`
            + " 전신이 나오게 시작 자세를 잡으면 3초 카운트다운 후 횟수를 셉니다."
          );
        } catch (err) {
          console.error("Camera/MediaPipe Error:", err);
          alert(`카메라 연결 오류: ${err.message || err}\n브라우저의 카메라 권한을 허용해 주세요.`);
          if (standbyOverlay) standbyOverlay.style.display = "flex";
          if (activeControls) activeControls.style.display = "none";
        } finally {
          btnStartCamera.disabled = false;
          btnStartCamera.innerHTML = `<span>카메라와 랜드마크 시작</span>`;
        }
      });
    }

    // 4-1. 스켈레톤 AR 오버레이 On/Off 토글
    const btnToggleSkeleton = document.getElementById("btn-toggle-skeleton");
    if (btnToggleSkeleton) {
      btnToggleSkeleton.addEventListener("click", () => {
        const isVisible = this.motionTracker.toggleSkeletonOverlay();
        btnToggleSkeleton.textContent = isVisible ? "👁️" : "🕶️";
        btnToggleSkeleton.style.color = isVisible ? "var(--primary-volt)" : "var(--text-muted)";
      });
    }

    // 4-2. 카메라 전/후면 전환
    if (btnSwitchCamera) {
      btnSwitchCamera.addEventListener("click", async () => {
        await this.motionTracker.toggleCamera();
      });
    }

    // 5. 음성 & 사운드 On/Off 토글
    if (btnToggleSound) {
      btnToggleSound.addEventListener("click", () => {
        const isMuted = btnToggleSound.textContent.trim() === "🔇";
        if (isMuted) {
          btnToggleSound.textContent = "🔊";
          this.motionSound.setSoundEnabled(true);
          this.motionSound.setTtsEnabled(true);
        } else {
          btnToggleSound.textContent = "🔇";
          this.motionSound.setSoundEnabled(false);
          this.motionSound.setTtsEnabled(false);
        }
      });
    }

    // 6. 일시정지 / 이어하기
    if (btnPauseMotion) {
      btnPauseMotion.addEventListener("click", () => {
        if (this.motionTracker.isRunning) {
          this.motionTracker.pause();
          btnPauseMotion.textContent = "이어하기";
          this.motionSound.speakCoaching("운동을 일시정지했습니다.");
        } else {
          this.motionTracker.resume();
          btnPauseMotion.textContent = "일시정지";
          this.motionSound.speakCoaching("운동을 계속합니다.");
        }
      });
    }

    // 7. 운동 취소 (기록 없이 닫기)
    if (btnDiscardMotion) {
      btnDiscardMotion.addEventListener("click", () => {
        if (confirm("현재 진행 중인 운동을 기록하지 않고 취소하시겠습니까?")) {
          this.motionTracker.stopCamera();
          this.restoreIdleMotionUi();
        }
      });
    }

    // 8. 운동 종료 및 기록 저장
    if (btnStopMotion) {
      btnStopMotion.addEventListener("click", () => {
        this.finishMotionWorkout();
      });
    }

    // 9. 완료 모달 닫기 및 펫 화면 이동
    if (btnCloseMotionModal && motionModal) {
      btnCloseMotionModal.addEventListener("click", () => {
        motionModal.style.display = "none";
        this.restoreIdleMotionUi();
        this.showWorkoutView("list");

        // 다마고치 화면으로 자동 포커스 이동
        const navTamagotchi = document.querySelector('.bottom-nav [data-tab="tab-tamagotchi"]');
        if (navTamagotchi) navTamagotchi.click();
      });
    }
  }

  // 모션 운동 완료 처리 및 보상 정산
  finishMotionWorkout() {
    const summary = this.motionTracker.getWorkoutSummary();
    this.motionTracker.stopCamera();

    if (summary.reps <= 0) {
      alert("최소 1회 이상 완료해야 기록이 저장됩니다.");
      this.restoreIdleMotionUi();
      return;
    }

    // 1. 사운드 팡파레 재생
    this.motionSound.playFinishFanfare();
    this.motionSound.speakCoaching(`수고하셨습니다! 총 ${summary.reps}회의 ${summary.exerciseName}를 완수하셨습니다!`);

    // 2. 다마고치 스탯 & XP & 볼트코인 즉각 반영
    this.tamagotchi.addXp(summary.xpGained);
    this.userProfile.coins += summary.vcGained;

    // 3대 스탯 직접 누적
    if (summary.statIncreases.might) {
      this.tamagotchi.might = (this.tamagotchi.might || 10) + summary.statIncreases.might;
    }
    if (summary.statIncreases.agility) {
      this.tamagotchi.agility = (this.tamagotchi.agility || 10) + summary.statIncreases.agility;
    }
    if (summary.statIncreases.spirit) {
      this.tamagotchi.spirit = (this.tamagotchi.spirit || 10) + summary.statIncreases.spirit;
    }

    // 3. Firebase Sandbox & Firestore에 운동 로그 저장
    const workoutPayload = {
      exerciseType: summary.exerciseId,
      exerciseName: summary.exerciseName,
      reps: summary.reps,
      durationSec: summary.durationSec,
      calories: summary.calories,
      xpGained: summary.xpGained,
      vcGained: summary.vcGained,
      statIncreases: summary.statIncreases,
      workoutCategory: "ai_motion",
      createdAt: summary.timestamp
    };

    this.firebaseSandbox.addWorkoutLog(this.currentUserId, workoutPayload);
    this.firebaseSandbox.setDoc("tamagotchi", this.currentUserId, this.tamagotchi.toJSON());
    this.persistUserProfile();

    firebaseCloud.saveWorkout(this.currentUserId, workoutPayload);
    firebaseCloud.syncTamagotchi(this.currentUserId, this.tamagotchi.toJSON());

    // 4. 상단 바 및 뷰 갱신
    this.updateHeaderStats();
    this.renderTamagotchiView();
    this.renderChallengeView();
    this.renderQuestView(this.currentQuestCategory || "all");

    // 5. 완료 도파민 축하 모달 표시
    this.showMotionCelebrationModal(summary);
  }

  showMotionCelebrationModal(summary) {
    const modal = document.getElementById("motion-celebration-modal");
    if (!modal) return;

    const titleEl = document.getElementById("motion-modal-title");
    const subTitleEl = document.getElementById("motion-modal-subtitle");
    const repsEl = document.getElementById("motion-modal-reps");
    const timeEl = document.getElementById("motion-modal-time");
    const calEl = document.getElementById("motion-modal-cal");
    const xpEl = document.getElementById("motion-modal-xp");
    const vcEl = document.getElementById("motion-modal-vc");
    const statEl = document.getElementById("motion-modal-stat-breakdown");

    const minutes = Math.floor(summary.durationSec / 60);
    const seconds = summary.durationSec % 60;
    const timeStr = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    if (titleEl) titleEl.textContent = `${summary.exerciseName} 완벽 완수!`;
    if (subTitleEl) subTitleEl.textContent = `Google MediaPipe AI 비전이 관절 각도를 정밀 판정했습니다.`;
    if (repsEl) repsEl.textContent = `${summary.reps} REPS`;
    if (timeEl) timeEl.textContent = timeStr;
    if (calEl) calEl.textContent = `${summary.calories} kcal`;
    if (xpEl) xpEl.textContent = `+${summary.xpGained} XP`;
    if (vcEl) vcEl.textContent = `+${summary.vcGained} VC`;

    if (statEl) {
      const parts = [];
      if (summary.statIncreases.might) parts.push(`지구력(MIGHT) +${summary.statIncreases.might}`);
      if (summary.statIncreases.agility) parts.push(`민첩성(AGILITY) +${summary.statIncreases.agility}`);
      if (summary.statIncreases.spirit) parts.push(`정신력(SPIRIT) +${summary.statIncreases.spirit}`);
      statEl.textContent = `✨ ${parts.join(" · ")} 성장 달성!`;
    }

    modal.style.display = "flex";
  }

  restoreIdleMotionUi() {
    const standbyOverlay = document.getElementById("motion-standby-overlay");
    const activeControls = document.getElementById("motion-active-controls");
    const liveRepsEl = document.getElementById("motion-live-reps");
    const depthBarEl = document.getElementById("motion-depth-bar");
    const timeEl = document.getElementById("motion-time");
    const calEl = document.getElementById("motion-calories");
    const statGainEl = document.getElementById("motion-stat-gain");
    const coachingPill = document.getElementById("motion-coaching-pill");
    const angleEl = document.getElementById("motion-hud-angle");

    if (standbyOverlay) standbyOverlay.style.display = "flex";
    if (activeControls) activeControls.style.display = "none";
    if (liveRepsEl) liveRepsEl.textContent = "0";
    if (depthBarEl) depthBarEl.style.width = "0%";
    if (timeEl) timeEl.textContent = "00:00";
    if (calEl) calEl.textContent = "0.0";
    if (statGainEl) statGainEl.textContent = "+0";
    if (coachingPill) {
      coachingPill.textContent = "시작 자세를 잡으면 카운트다운 후 세기 시작합니다";
      coachingPill.classList.remove("is-good");
    }
    this.lastCoachSpeakAt = 0;
    if (angleEl) angleEl.textContent = "180°";

    this.motionTracker.resetExerciseStats();
    this.renderMotionProgress(0);
    this.updateMotionMascotPreview();
  }

  // 실시간 횟수(Rep) 판별 콜백
  handleMotionRepCount(data) {
    // 1. 사운드 및 음성 카운팅
    this.motionSound.playRepBeep(data.reps);
    this.motionSound.speakRep(data.reps);

    // 2. 대형 횟수 카운터 팝업 애니메이션
    const repsEl = document.getElementById("motion-live-reps");
    if (repsEl) {
      repsEl.textContent = data.reps;
      repsEl.classList.remove("pop-anim");
      void repsEl.offsetWidth; // trigger reflow
      repsEl.classList.add("pop-anim");
    }
    this.renderMotionProgress(data.reps);

    // 3. 파트너 펫 실시간 응원 메시지
    const speechEl = document.getElementById("motion-mascot-speech");
    if (speechEl) {
      const petName = this.tamagotchi.name || "댕댕이";
      if (data.reps === 1) {
        speechEl.textContent = `"${this.userProfile.name}, 첫 번째 횟수 성공! 나이스 스타트! 🔥"`;
      } else if (data.reps === 5) {
        speechEl.textContent = `"자세가 정말 좋습니다! 5회 돌파! 💪"`;
      } else if (data.reps === 10) {
        speechEl.textContent = `"대단합니다! 도파민 게이지가 폭발하고 있어요! ✨"`;
      } else if (data.reps % 5 === 0) {
        speechEl.textContent = `"${data.reps}회 달성! ${petName}도 함께 힘을 내고 있어요! ⚡"`;
      } else {
        speechEl.textContent = `"나이스 ${data.exercise.name.replace('AI ', '')}! 하나 더 도전! 🔥"`;
      }
    }

    // 4. 목표 횟수 달성 여부 확인
    if (this.targetMotionReps > 0 && data.reps >= this.targetMotionReps) {
      setTimeout(() => {
        this.finishMotionWorkout();
      }, 600);
    }
  }

  // 난이도 적용 + 칩 UI / 설명 문구 동기화
  applyMotionLevel(levelId, options = {}) {
    const level = DIFFICULTY_LEVELS[levelId] ? DIFFICULTY_LEVELS[levelId] : DIFFICULTY_LEVELS[DEFAULT_DIFFICULTY];
    this.motionLevelId = level.id;
    localStorage.setItem("RUNNOW_MOTION_LEVEL", level.id);
    this.motionTracker.setDifficulty(level.id);

    document.querySelectorAll("#motion-level-chips .target-chip").forEach((chip) => {
      chip.classList.toggle("active", chip.dataset.level === level.id);
    });

    const descEl = document.getElementById("motion-level-desc");
    if (descEl) descEl.textContent = `${level.icon} ${level.name} · ${level.detail}`;

    if (!options.silent && this.motionTracker.isRunning) {
      this.motionSound.speakCoaching(`${level.name} 난이도로 변경했습니다. 준비 자세를 다시 잡아 주세요.`);
    }
  }

  // 준비 → 카운트다운 → 카운팅 페이즈 전환 콜백
  handleMotionPhaseChange(data) {
    const pill = document.getElementById("motion-coaching-pill");

    if (data.phase === "calibrating") {
      if (pill && data.blockedReason) {
        pill.textContent = data.blockedReason;
        pill.classList.remove("is-good");
      }
      return;
    }

    if (data.phase === "countdown") {
      if (pill) {
        pill.textContent = data.secondsLeft > 0
          ? `${data.secondsLeft}초 후 카운트를 시작합니다`
          : "시작합니다!";
        pill.classList.add("is-good");
      }
      if (data.secondsLeft > 0) {
        this.motionSound.playDepthClick();
      } else {
        this.motionSound.playRepBeep(1);
        this.motionSound.speakCoaching("시작합니다");
      }
      return;
    }

    if (data.phase === "counting") {
      if (pill) {
        pill.textContent = "카운트를 시작합니다. 천천히 정확하게!";
        pill.classList.add("is-good");
      }
      this.renderMotionProgress(this.motionTracker.repCount || 0);
    }
  }

  // 실시간 AI 자세 코칭 피드백 콜백
  handleMotionFeedback(data) {
    const pill = document.getElementById("motion-coaching-pill");
    if (!pill || !data.text) return;

    pill.textContent = data.text;
    pill.classList.toggle("is-good", !!data.isGood);

    // 경고 문구가 서로 다르면 speakCoaching의 자체 중복 필터를 빠져나가 TTS가 밀립니다.
    // 종류와 무관하게 3초에 한 번만 말하도록 앱 단에서 한 번 더 막습니다.
    if (!data.isGood) {
      const now = Date.now();
      if (now - (this.lastCoachSpeakAt || 0) >= 3000) {
        this.lastCoachSpeakAt = now;
        this.motionSound.speakCoaching(data.text);
      }
    }
  }

  // 초당 상태 업데이트 콜백 (각도, 진행바, 타이머, 칼로리)
  handleMotionStateUpdate(data) {
    const angleEl = document.getElementById("motion-hud-angle");
    const jointEl = document.getElementById("motion-angle-label");
    const depthBarEl = document.getElementById("motion-depth-bar");
    const timeEl = document.getElementById("motion-time");
    const calEl = document.getElementById("motion-calories");
    const statGainEl = document.getElementById("motion-stat-gain");

    if (angleEl) angleEl.textContent = `${data.angle}°`;
    if (jointEl && data.jointLabel) jointEl.textContent = data.jointLabel;
    if (depthBarEl) depthBarEl.style.width = `${data.depthProgress}%`;
    this.renderMotionProgress(data.reps);

    const mins = Math.floor(data.elapsedSeconds / 60);
    const secs = data.elapsedSeconds % 60;
    if (timeEl) timeEl.textContent = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    if (calEl) calEl.textContent = data.calories.toFixed(1);

    if (statGainEl) {
      const estimatedStatGain = Math.round(data.reps * (data.exercise.statGain[data.exercise.targetStat] || 1) / 2);
      statGainEl.textContent = `+${estimatedStatGain}`;
    }
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

    this.bindRunPlaceMode();

    if (btnStartLive) {
      btnStartLive.addEventListener("click", async () => {
        this.gpsRunner.setWeight(this.userProfile.weightKg);
        if (this.runPlaceMode === "treadmill") {
          await this.gpsRunner.startTreadmill(this.treadmillSpeedKmh);
        } else {
          this.gpsRunner.startRun(false);
        }
        initBox.style.display = "none";
        activeBox.style.display = "flex";
        metricCircle.classList.add("active-pulse");
        this.lockRunPlaceUi(true);
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
        this.lockRunPlaceUi(false);

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
          workoutType: result.workoutType,
          runMode: stats.runMode || this.runPlaceMode,
          treadmillSpeedKmh: stats.treadmillSpeedKmh || null
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
            chalMsg = `DAY ${missionDay} 목표 ${mission?.targetKm || 0}km에 아직 못 미쳤습니다. 운동 페이지에서 러닝을 이어가세요.`;
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
    if (accuracyEl) {
      accuracyEl.textContent = this.runPlaceMode === "treadmill"
        ? `트레드밀 ${this.treadmillSpeedKmh} km/h 대기중`
        : "🛰️ 야외 GPS 대기중";
    }
    this.lockRunPlaceUi(false);
  }

  bindRunPlaceMode() {
    const speedRow = document.getElementById("treadmill-speed-row");
    const startLabel = document.getElementById("btn-start-live-label");
    const accuracyEl = document.getElementById("live-gps-accuracy");
    const cardLabel = document.getElementById("run-card-label");

    const applyPlace = (mode) => {
      this.runPlaceMode = mode;
      document.querySelectorAll(".run-place-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.runPlace === mode);
      });
      if (speedRow) speedRow.style.display = mode === "treadmill" ? "flex" : "none";
      if (startLabel) {
        startLabel.textContent = mode === "treadmill" ? "트레드밀 러닝 시작" : "야외 GPS 러닝 시작";
      }
      if (cardLabel) {
        cardLabel.textContent = mode === "treadmill" ? "GYM TREADMILL" : "LIVE GPS RUNNER";
      }
      if (accuracyEl && !this.gpsRunner.isTracking) {
        accuracyEl.textContent = mode === "treadmill"
          ? `트레드밀 ${this.treadmillSpeedKmh} km/h 대기중`
          : "🛰️ 야외 GPS 대기중";
      }
    };

    document.querySelectorAll(".run-place-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (this.gpsRunner.isTracking) return;
        applyPlace(btn.dataset.runPlace);
      });
    });

    document.querySelectorAll("#treadmill-speed-chips .target-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        if (this.gpsRunner.isTracking) return;
        document.querySelectorAll("#treadmill-speed-chips .target-chip").forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        this.treadmillSpeedKmh = parseFloat(chip.dataset.speed) || 8;
        if (this.runPlaceMode === "treadmill" && accuracyEl && !this.gpsRunner.isTracking) {
          accuracyEl.textContent = `트레드밀 ${this.treadmillSpeedKmh} km/h 대기중`;
        }
      });
    });

    applyPlace(this.runPlaceMode);
  }

  lockRunPlaceUi(locked) {
    document.querySelectorAll(".run-place-btn, #treadmill-speed-chips .target-chip").forEach((el) => {
      el.disabled = !!locked;
    });
  }

  // 러닝·21일·퀘스트·펫·코인 전체 기록 초기화 (로그인 프로필은 유지)
  executeDataReset() {
    this.gpsRunner.reset();
    this.restoreIdleRunUi();

    this.tamagotchi = new TamagotchiEngine({
      petType: "dog",
      petChosen: false,
      name: "댕댕이",
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
    if (!db.daily_claimed) db.daily_claimed = {};
    if (!db.weekly_claimed) db.weekly_claimed = {};
    if (!db.bounty_claimed) db.bounty_claimed = {};

    db.tamagotchi[this.currentUserId] = this.tamagotchi.toJSON();
    db.challenges_progress[this.currentUserId] = this.challengeManager.toJSON();
    db.claimed_quests[this.currentUserId] = [];
    db.daily_claimed[this.currentUserId] = {};
    db.weekly_claimed[this.currentUserId] = {};
    db.bounty_claimed[this.currentUserId] = [];
    db.workouts = (db.workouts || []).filter((w) => w.userId !== this.currentUserId);
    if (db.users && db.users[this.currentUserId]) db.users[this.currentUserId].coins = 0;

    this.firebaseSandbox.saveDB(db);
    this.persistUserProfile();

    this.updateHeaderStats();
    this.renderTamagotchiView();
    this.renderDailyQuests();
    this.renderWeeklyQuests();
    this.renderBountyQuests();
    this.renderChallengeView();
    this.renderQuestView(this.currentQuestCategory || "all");
    this.routeAppViews();

    alert("⚡ 러닝·21일 챌린지·퀘스트(일일/주간/바운티/100업적)·펫·코인이 모두 처음 상태로 초기화되었습니다.\n\n파트너 펫을 다시 선택해 주세요.");
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

  bindMobileConnectModal() {
    const btnOpenMobile = document.getElementById("btn-open-mobile-qr");
    const modal = document.getElementById("mobile-connect-modal");
    const btnClose = document.getElementById("btn-close-mobile-modal");
    const btnCopy = document.getElementById("btn-copy-mobile-url");
    const qrImg = document.getElementById("mobile-qr-img");
    const urlText = document.getElementById("mobile-connect-url-text");

    const liveUrl = "https://runnow-37af9.web.app";
    const currentUrl = (window.location.protocol === "http:" || window.location.protocol === "https:")
      ? window.location.href
      : liveUrl;

    if (urlText) urlText.textContent = currentUrl;
    if (qrImg) qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(currentUrl)}`;

    if (btnOpenMobile && modal) {
      btnOpenMobile.addEventListener("click", () => {
        if (urlText) urlText.textContent = currentUrl;
        if (qrImg) qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(currentUrl)}`;
        modal.style.display = "flex";
      });
    }

    if (btnClose && modal) {
      btnClose.addEventListener("click", () => {
        modal.style.display = "none";
      });
    }

    if (btnCopy) {
      btnCopy.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(currentUrl);
          btnCopy.textContent = "복사 완료! ✅";
          setTimeout(() => { btnCopy.textContent = "링크 복사"; }, 2000);
        } catch (e) {
          prompt("스마트폰에서 열 주소를 복사하세요:", currentUrl);
        }
      });
    }
  }

  // 다마고치 뷰 렌더링 (강아지 vs 고양이 멀티 펫 렌더링)
  renderTamagotchiView() {
    const stage = this.tamagotchi.getStage();
    const avatarContainer = document.getElementById("t-avatar-container");
    const nameEl = document.getElementById("t-display-name");
    const stagePill = document.getElementById("t-stage-pill");
    const taglineEl = document.getElementById("t-tagline");

    if (avatarContainer) avatarContainer.innerHTML = stage.svg;
    if (nameEl) nameEl.textContent = `${this.tamagotchi.name} (${stage.nameKo})`;
    if (stagePill) stagePill.textContent = `${stage.stage}단계: ${stage.nameKo}`;
    if (taglineEl) taglineEl.textContent = stage.tagline;

    const isCat = this.tamagotchi.petType === "cat";

    // Care Actions Button Labels
    const btnFeed = document.getElementById("btn-t-feed");
    const btnPlay = document.getElementById("btn-t-play");
    if (btnFeed) {
      btnFeed.innerHTML = isCat ? `<span style="font-size:22px;">🐟</span><span>츄르 간식</span>` : `<span style="font-size:22px;">🍖</span><span>영양 간식</span>`;
    }
    if (btnPlay) {
      btnPlay.innerHTML = isCat ? `<span style="font-size:22px;">✨</span><span>레이저 놀이</span>` : `<span style="font-size:22px;">🎾</span><span>스프린트 놀이</span>`;
    }

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

    document.getElementById("btn-t-feed")?.addEventListener("click", () => {
      const res = this.tamagotchi.feed();
      alert(res.msg);
      syncPet();
      this.renderDailyQuests();
    });

    document.getElementById("btn-t-play")?.addEventListener("click", () => {
      const res = this.tamagotchi.play();
      alert(res.msg);
      syncPet();
      this.renderDailyQuests();
    });

    document.getElementById("btn-t-rest")?.addEventListener("click", () => {
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

  // 5대 마스터 퀘스트 & 챌린지 탭 전환 바인딩
  bindQuestAndChallengeTabs() {
    const tabButtons = document.querySelectorAll(".quest-main-tab-btn");
    const subDaily = document.getElementById("subview-quests-daily");
    const subWeekly = document.getElementById("subview-quests-weekly");
    const subBounty = document.getElementById("subview-quests-bounty");
    const subChal = document.getElementById("subview-challenge-21");
    const subMilestone = document.getElementById("subview-quests-100");

    const allViews = [subDaily, subWeekly, subBounty, subChal, subMilestone];

    tabButtons.forEach((btn) => {
      btn.onclick = () => {
        tabButtons.forEach(b => {
          b.classList.remove("active");
          b.style.background = "none";
          b.style.color = "var(--text-muted)";
        });
        btn.classList.add("active");
        btn.style.background = "var(--primary-accent)";
        btn.style.color = "var(--primary-accent-text)";

        allViews.forEach(v => { if (v) v.style.display = "none"; });

        const viewType = btn.dataset.view;
        this.currentQuestMainTab = viewType;

        if (viewType === "daily") {
          if (subDaily) subDaily.style.display = "block";
          this.renderDailyQuests();
        } else if (viewType === "weekly") {
          if (subWeekly) subWeekly.style.display = "block";
          this.renderWeeklyQuests();
        } else if (viewType === "bounty") {
          if (subBounty) subBounty.style.display = "block";
          this.renderBountyQuests();
        } else if (viewType === "chal21") {
          if (subChal) subChal.style.display = "block";
          this.renderChallengeView();
        } else if (viewType === "milestone") {
          if (subMilestone) subMilestone.style.display = "block";
          this.renderQuestView(this.currentQuestCategory || "all");
        }
      };
    });

    // 100 업적 카테고리 칩
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

  // 1. ☀️ 일일 반복 퀘스트 뷰 렌더링
  renderDailyQuests() {
    const listEl = document.getElementById("daily-quest-list");
    if (!listEl) return;

    const db = this.firebaseSandbox.getDB();
    const today = new Date().toISOString().slice(0, 10);
    if (!db.daily_claimed) db.daily_claimed = {};
    if (!db.daily_claimed[this.currentUserId]) db.daily_claimed[this.currentUserId] = {};
    const claimedList = db.daily_claimed[this.currentUserId][today] || [];

    const workouts = db.workouts?.filter(w => w.userId === this.currentUserId) || [];
    const todayWorkouts = workouts.filter(w => w.date === today || (w.timestamp && new Date(w.timestamp).toISOString().slice(0, 10) === today));
    const todayKm = todayWorkouts.reduce((acc, cur) => acc + (cur.distanceKm || 0), 0);
    const todayCal = todayWorkouts.reduce((acc, cur) => acc + (cur.calories || 0), 0);

    const normalDoneCount = DAILY_QUESTS.slice(0, 5).filter(q => {
      if (claimedList.includes(q.id)) return true;
      if (q.id === "dq_01") return true; // 출석 완료
      if (q.id === "dq_02") return todayKm >= 1.0;
      if (q.id === "dq_03") return this.tamagotchi.hunger >= 90;
      if (q.id === "dq_04") return this.tamagotchi.happiness >= 90;
      if (q.id === "dq_05") return todayCal >= 100;
      return false;
    }).length;

    listEl.innerHTML = "";

    DAILY_QUESTS.forEach((q) => {
      const isClaimed = claimedList.includes(q.id);
      let isAchieved = false;

      if (q.id === "dq_01") isAchieved = true;
      else if (q.id === "dq_02") isAchieved = todayKm >= 1.0;
      else if (q.id === "dq_03") isAchieved = this.tamagotchi.hunger >= 90;
      else if (q.id === "dq_04") isAchieved = this.tamagotchi.happiness >= 90;
      else if (q.id === "dq_05") isAchieved = todayCal >= 100;
      else if (q.id === "dq_06") isAchieved = normalDoneCount >= 5;

      const card = document.createElement("div");
      card.className = `quest-card ${isClaimed ? 'claimed' : isAchieved ? 'completed' : ''}`;

      let actionBtnHtml = "";
      if (isClaimed) {
        actionBtnHtml = `<span class="quest-claimed-label">✓ 오늘 수령</span>`;
      } else if (isAchieved) {
        actionBtnHtml = `<button class="btn-quest-claim" data-dqid="${q.id}">🏆 보상 수령</button>`;
      } else {
        actionBtnHtml = `<button class="btn-quest-claim" disabled>진행 중</button>`;
      }

      card.innerHTML = `
        <div class="quest-icon">${q.icon}</div>
        <div class="quest-info">
          <div class="quest-title-row">
            <span class="quest-badge">DAILY</span>
            <span class="quest-title">${q.title}</span>
          </div>
          <div class="quest-desc">${q.desc}</div>
          <div class="quest-reward-pill">⚡ 보상: +${q.xpReward} XP / +${q.coinReward} VC</div>
        </div>
        <div class="quest-action">${actionBtnHtml}</div>
      `;

      const claimBtn = card.querySelector(".btn-quest-claim:not(:disabled)");
      if (claimBtn) {
        claimBtn.onclick = () => {
          this.claimDailyReward(q, today);
        };
      }

      listEl.appendChild(card);
    });
  }

  claimDailyReward(q, today) {
    const db = this.firebaseSandbox.getDB();
    if (!db.daily_claimed) db.daily_claimed = {};
    if (!db.daily_claimed[this.currentUserId]) db.daily_claimed[this.currentUserId] = {};
    if (!db.daily_claimed[this.currentUserId][today]) db.daily_claimed[this.currentUserId][today] = [];

    if (db.daily_claimed[this.currentUserId][today].includes(q.id)) return;

    db.daily_claimed[this.currentUserId][today].push(q.id);
    this.firebaseSandbox.saveDB(db);

    this.tamagotchi.addXp(q.xpReward);
    this.userProfile.coins += q.coinReward;

    this.firebaseSandbox.setDoc("tamagotchi", this.currentUserId, this.tamagotchi.toJSON());
    this.firebaseSandbox.setDoc("users", this.currentUserId, { coins: this.userProfile.coins });

    alert(`🎉 [일일 퀘스트] ${q.title} 달성!\n\n✨ 보상 지급 완료:\n+${q.xpReward} XP (펫 성장치)\n+${q.coinReward} VC (볼트 코인)`);

    this.updateHeaderStats();
    this.renderTamagotchiView();
    this.renderDailyQuests();
  }

  // 2. 📅 주간 퀘스트 뷰 렌더링
  renderWeeklyQuests() {
    const listEl = document.getElementById("weekly-quest-list");
    if (!listEl) return;

    const db = this.firebaseSandbox.getDB();
    const currentWeekKey = this.getWeeklyKey();
    if (!db.weekly_claimed) db.weekly_claimed = {};
    if (!db.weekly_claimed[this.currentUserId]) db.weekly_claimed[this.currentUserId] = {};
    const claimedList = db.weekly_claimed[this.currentUserId][currentWeekKey] || [];

    const workouts = db.workouts?.filter(w => w.userId === this.currentUserId) || [];
    const totalKm = this.tamagotchi.totalKm;
    const streak = this.challengeManager.streak;
    const chalClears = this.challengeManager.completedDays.length;

    listEl.innerHTML = "";

    WEEKLY_QUESTS.forEach((q) => {
      const isClaimed = claimedList.includes(q.id);
      let isAchieved = false;

      if (q.id === "wq_01") isAchieved = totalKm >= 10.0;
      else if (q.id === "wq_02") isAchieved = streak >= 3;
      else if (q.id === "wq_03") isAchieved = workouts.reduce((acc, cur) => acc + (cur.calories || 0), 0) >= 600;
      else if (q.id === "wq_04") isAchieved = chalClears >= 3;
      else if (q.id === "wq_05") isAchieved = this.tamagotchi.level >= 2;

      const card = document.createElement("div");
      card.className = `quest-card ${isClaimed ? 'claimed' : isAchieved ? 'completed' : ''}`;

      let actionBtnHtml = "";
      if (isClaimed) {
        actionBtnHtml = `<span class="quest-claimed-label">✓ 주간 수령</span>`;
      } else if (isAchieved) {
        actionBtnHtml = `<button class="btn-quest-claim" data-wqid="${q.id}">🏆 보상 수령</button>`;
      } else {
        actionBtnHtml = `<button class="btn-quest-claim" disabled>진행 중</button>`;
      }

      card.innerHTML = `
        <div class="quest-icon">${q.icon}</div>
        <div class="quest-info">
          <div class="quest-title-row">
            <span class="quest-badge">WEEKLY</span>
            <span class="quest-title">${q.title}</span>
          </div>
          <div class="quest-desc">${q.desc}</div>
          <div class="quest-reward-pill">⚡ 보상: +${q.xpReward} XP / +${q.coinReward} VC</div>
        </div>
        <div class="quest-action">${actionBtnHtml}</div>
      `;

      const claimBtn = card.querySelector(".btn-quest-claim:not(:disabled)");
      if (claimBtn) {
        claimBtn.onclick = () => {
          this.claimWeeklyReward(q, currentWeekKey);
        };
      }

      listEl.appendChild(card);
    });
  }

  getWeeklyKey() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getFullYear()}_W${weekNo}`;
  }

  claimWeeklyReward(q, weekKey) {
    const db = this.firebaseSandbox.getDB();
    if (!db.weekly_claimed) db.weekly_claimed = {};
    if (!db.weekly_claimed[this.currentUserId]) db.weekly_claimed[this.currentUserId] = {};
    if (!db.weekly_claimed[this.currentUserId][weekKey]) db.weekly_claimed[this.currentUserId][weekKey] = [];

    if (db.weekly_claimed[this.currentUserId][weekKey].includes(q.id)) return;

    db.weekly_claimed[this.currentUserId][weekKey].push(q.id);
    this.firebaseSandbox.saveDB(db);

    this.tamagotchi.addXp(q.xpReward);
    this.userProfile.coins += q.coinReward;

    this.firebaseSandbox.setDoc("tamagotchi", this.currentUserId, this.tamagotchi.toJSON());
    this.firebaseSandbox.setDoc("users", this.currentUserId, { coins: this.userProfile.coins });

    alert(`🎉 [주간 퀘스트] ${q.title} 달성!\n\n✨ 보상 지급 완료:\n+${q.xpReward} XP (펫 성장치)\n+${q.coinReward} VC (볼트 코인)`);

    this.updateHeaderStats();
    this.renderTamagotchiView();
    this.renderWeeklyQuests();
  }

  // 3. 🎁 특별 보상형 퀘스트 뷰 렌더링
  renderBountyQuests() {
    const listEl = document.getElementById("bounty-quest-list");
    if (!listEl) return;

    const db = this.firebaseSandbox.getDB();
    if (!db.bounty_claimed) db.bounty_claimed = {};
    const claimedList = db.bounty_claimed[this.currentUserId] || [];
    const workouts = db.workouts?.filter(w => w.userId === this.currentUserId) || [];

    listEl.innerHTML = "";

    BOUNTY_QUESTS.forEach((q) => {
      const isClaimed = claimedList.includes(q.id);
      let isAchieved = false;

      if (q.id === "bq_01") {
        isAchieved = workouts.some(w => (w.distanceKm || 0) >= 5.0);
      } else if (q.id === "bq_02") {
        isAchieved = workouts.some(w => (w.distanceKm || 0) >= 2.0);
      } else if (q.id === "bq_03") {
        isAchieved = workouts.some(w => {
          if (!w.pace || w.pace === '--\'--"') return false;
          const parts = w.pace.replace('"', '').split("'");
          const sec = (parseInt(parts[0], 10) || 10) * 60 + (parseInt(parts[1], 10) || 0);
          return sec <= 330 && (w.distanceKm || 0) >= 3.0;
        });
      } else if (q.id === "bq_04") {
        isAchieved = this.tamagotchi.hunger >= 95 && this.tamagotchi.happiness >= 95 && this.tamagotchi.energy >= 95;
      }

      const card = document.createElement("div");
      card.className = `quest-card ${isClaimed ? 'claimed' : isAchieved ? 'completed' : ''}`;

      let actionBtnHtml = "";
      if (isClaimed) {
        actionBtnHtml = `<span class="quest-claimed-label">✓ 획득 완료</span>`;
      } else if (isAchieved) {
        actionBtnHtml = `<button class="btn-quest-claim" data-bqid="${q.id}">🎁 바운티 수령</button>`;
      } else {
        actionBtnHtml = `<button class="btn-quest-claim" disabled>진행 중</button>`;
      }

      card.innerHTML = `
        <div class="quest-icon">${q.icon}</div>
        <div class="quest-info">
          <div class="quest-title-row">
            <span class="bounty-tag">${q.tag}</span>
            <span class="quest-title">${q.title}</span>
          </div>
          <div class="quest-desc">${q.desc}</div>
          <div class="quest-reward-pill">⚡ 특별 보상: +${q.xpReward} XP / +${q.coinReward} VC</div>
        </div>
        <div class="quest-action">${actionBtnHtml}</div>
      `;

      const claimBtn = card.querySelector(".btn-quest-claim:not(:disabled)");
      if (claimBtn) {
        claimBtn.onclick = () => {
          this.claimBountyReward(q);
        };
      }

      listEl.appendChild(card);
    });
  }

  claimBountyReward(q) {
    const db = this.firebaseSandbox.getDB();
    if (!db.bounty_claimed) db.bounty_claimed = {};
    if (!db.bounty_claimed[this.currentUserId]) db.bounty_claimed[this.currentUserId] = [];

    if (db.bounty_claimed[this.currentUserId].includes(q.id)) return;

    db.bounty_claimed[this.currentUserId].push(q.id);
    this.firebaseSandbox.saveDB(db);

    this.tamagotchi.addXp(q.xpReward);
    this.userProfile.coins += q.coinReward;

    this.firebaseSandbox.setDoc("tamagotchi", this.currentUserId, this.tamagotchi.toJSON());
    this.firebaseSandbox.setDoc("users", this.currentUserId, { coins: this.userProfile.coins });

    alert(`🎉 [특별 보상] ${q.title} 퀘스트 클리어!\n\n✨ 보상 지급 완료:\n+${q.xpReward} XP (펫 성장치)\n+${q.coinReward} VC (볼트 코인)`);

    this.updateHeaderStats();
    this.renderTamagotchiView();
    this.renderBountyQuests();
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
        <div><div style="font-size:10px; color:var(--text-muted);">거리</div><strong style="color:var(--text-main);">${Number(rec.distanceKm).toFixed(2)} km</strong></div>
        <div><div style="font-size:10px; color:var(--text-muted);">칼로리</div><strong style="color:var(--primary-accent);">${rec.calories} kcal</strong></div>
        <div><div style="font-size:10px; color:var(--text-muted);">시간</div><strong style="color:var(--highlight-color);">${formatRunTime(rec.elapsedSeconds)}</strong></div>
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
      if (msgEl) msgEl.textContent = "운동 페이지의 실제 러닝 기록이 목표 거리를 충족했습니다. 완료하면 보상과 함께 기록됩니다.";
      btnComplete.disabled = false;
      btnComplete.textContent = `실제 기록으로 DAY ${c.day} 완료하기`;
      btnComplete.style.opacity = "1";
      btnComplete.onclick = () => {
        const chalResult = this.challengeManager.tryCompleteFromWorkout(c.day, qualifying);
        if (!chalResult.ok) {
          alert("아직 실제 러닝 기록이 부족합니다. 운동 페이지에서 러닝을 이어가세요.");
          return;
        }
        this.applyChallengeClear(chalResult);
        alert(`DAY ${c.day} 미션 성공!\n거리 ${qualifying.distanceKm}km · ${qualifying.calories}kcal · ${formatRunTime(qualifying.elapsedSeconds)}\n보상: +${c.xpReward} XP / +${c.coinReward} VC`);
        this.updateHeaderStats();
        this.renderTamagotchiView();
        this.renderDailyQuests();
        this.renderWeeklyQuests();
        this.renderBountyQuests();
        this.renderChallengeView();
        this.renderQuestView(this.currentQuestCategory || "all");
      };
      return;
    }

    paintRecord(null);
    if (msgEl) {
      msgEl.textContent = `아직 실제 러닝 기록이 없습니다. 운동 페이지에서 ${c.targetKm}km를 달려 미션을 이어가세요.`;
    }
    btnComplete.disabled = false;
    btnComplete.textContent = "운동 페이지에서 이어서 달리기";
    btnComplete.style.opacity = "1";
    btnComplete.onclick = () => {
      alert(`DAY ${c.day} 미션은 실제 러닝 기록이 있어야 완료됩니다.\n목표 ${c.targetKm}km를 운동 페이지에서 달린 뒤 다시 시도해 주세요.`);
    };
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
        actionBtnHtml = `<span class="quest-claimed-label">✓ 획득 완료</span>`;
      } else if (isAchieved) {
        actionBtnHtml = `<button class="btn-quest-claim" data-qid="${q.id}">🏆 보상 수령</button>`;
      } else {
        actionBtnHtml = `<button class="btn-quest-claim" disabled>진행 중</button>`;
      }

      card.innerHTML = `
        <div class="quest-icon">${q.icon}</div>
        <div class="quest-info">
          <div class="quest-title-row">
            <span class="quest-badge">${q.id.replace('q_', 'Q')}</span>
            <span class="quest-title">${q.title}</span>
          </div>
          <div class="quest-desc">${q.desc}</div>
          <div class="quest-reward-pill">⚡ 보상: +${q.xpReward.toLocaleString()} XP / +${q.coinReward} VC</div>
        </div>
        <div class="quest-action">${actionBtnHtml}</div>
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

    alert(`🎉 [${q.id.replace('q_', 'Q')}] ${q.title} 퀘스트 달성!\n\n✨ 보상 지급 완료:\n+${q.xpReward.toLocaleString()} XP (펫 성장치)\n+${q.coinReward} VC (볼트 코인)`);

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
        btn.style.borderColor = on ? "var(--primary-accent)" : "var(--border-card)";
        btn.style.color = on ? "var(--primary-accent)" : "var(--text-muted)";
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

