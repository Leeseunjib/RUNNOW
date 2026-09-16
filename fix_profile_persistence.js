const fs = require('fs');

const appPath = 'C:\\BeausCreators\\02.BSC_Branch\\projects\\Runnow\\app.js';
let app = fs.readFileSync(appPath, 'utf8');

// 1. updateProfileFormInputs 메서드 정의 추가
const newMethod = `
  // 프로필 설정 폼 입력값 자동 복원 및 최신화 (로그인/세션 변경 시 영구 유지)
  updateProfileFormInputs() {
    const nameInput = document.getElementById("prof-name");
    const heightInput = document.getElementById("prof-height");
    const weightInput = document.getElementById("prof-weight");
    const ageInput = document.getElementById("prof-age");
    const targetInput = document.getElementById("prof-target-weight");
    const cueInput = document.getElementById("prof-cue");

    const profile = this.userProfile || {};
    const globalProf = this.getGlobalProfile() || {};

    const name = (profile.name && profile.name !== "러너") ? profile.name : (globalProf.displayName || globalProf.name || profile.name || "러너");
    const height = profile.heightCm ?? globalProf.heightCm ?? 175;
    const weight = profile.weightKg ?? globalProf.weightKg ?? 70;
    const age = profile.age ?? globalProf.age ?? 30;
    const targetWeight = profile.targetWeightKg ?? globalProf.targetWeightKg ?? 65;
    const gender = profile.gender || globalProf.gender || "M";
    const cue = this.challengeManager?.habitCue || globalProf.habitCue || "퇴근 후 현관에서 러닝화 신고 바로 출발";

    if (nameInput) nameInput.value = name;
    if (heightInput) heightInput.value = height;
    if (weightInput) weightInput.value = weight;
    if (ageInput) ageInput.value = age;
    if (targetInput) targetInput.value = targetWeight;
    if (cueInput) cueInput.value = cue;

    document.querySelectorAll(".prof-gender-btn").forEach((btn) => {
      const on = btn.dataset.gender === gender;
      btn.classList.toggle("active", on);
      btn.style.borderColor = on ? "var(--primary-accent)" : "var(--border-card)";
      btn.style.color = on ? "var(--primary-accent)" : "var(--text-muted)";
    });

    const bmi = this.calcBmi(height, weight);
    const bmr = this.calcBmr(height, weight, age, gender);
    const bmiEl = document.getElementById("calc-bmi");
    const bmrEl = document.getElementById("calc-bmr");
    if (bmiEl) bmiEl.textContent = \`\${bmi} (\${this.bmiLabel(bmi)})\`;
    if (bmrEl) bmrEl.textContent = \`\${bmr.toLocaleString()} kcal\`;
  }
`;

// 2. persistUserProfile 개선 (name, habitCue 등 완벽 보존)
const oldPersist = `  persistUserProfile() {
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
    this.saveGlobalProfile(payload);
  }`;

const newPersist = `  persistUserProfile() {
    const bmi = this.calcBmi(this.userProfile.heightCm, this.userProfile.weightKg);
    const payload = {
      uid: this.currentUserId,
      displayName: this.userProfile.name,
      name: this.userProfile.name,
      age: this.userProfile.age,
      gender: this.userProfile.gender,
      heightCm: this.userProfile.heightCm,
      weightKg: this.userProfile.weightKg,
      targetWeightKg: this.userProfile.targetWeightKg,
      frequency: this.userProfile.frequency,
      goalType: this.userProfile.goalType,
      habitCue: this.challengeManager?.habitCue,
      bmi,
      coins: this.userProfile.coins,
      onboarded: true,
      updatedAt: new Date().toISOString()
    };
    this.firebaseSandbox.setDoc("users", this.currentUserId, payload);
    firebaseCloud.syncUser(this.currentUserId, payload);
    this.saveGlobalProfile(payload);
  }`;

// 3. hydrateFromCloud 수정 (클라우드에서 가져온 즉시 updateProfileFormInputs 호출)
const oldHydrate = `    const user = await firebaseCloud.getUser(session.uid);
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
    }`;

const newHydrate = `    const user = await firebaseCloud.getUser(session.uid);
    if (user) {
      this.currentUserId = session.uid;
      this.firebaseSandbox.setDoc("users", session.uid, user);
      this.userProfile = {
        ...this.userProfile,
        name: user.displayName || user.name || this.userProfile.name,
        heightCm: user.heightCm ?? this.userProfile.heightCm,
        weightKg: user.weightKg ?? this.userProfile.weightKg,
        age: user.age ?? this.userProfile.age,
        gender: user.gender || this.userProfile.gender,
        targetWeightKg: user.targetWeightKg ?? this.userProfile.targetWeightKg,
        frequency: user.frequency ?? this.userProfile.frequency,
        goalType: user.goalType || this.userProfile.goalType,
        coins: user.coins ?? this.userProfile.coins
      };
      this.saveGlobalProfile(this.userProfile);
      this.updateHeaderStats();
      this.updateProfileFormInputs();
    }`;

// 4. bindNavigation에서 tab-settings 클릭 시 updateProfileFormInputs 실행
const oldTabSettings = `      if (targetTabId === "tab-shop") this.renderShopView("all");`;
const newTabSettings = `      if (targetTabId === "tab-shop") this.renderShopView("all");
      if (targetTabId === "tab-settings") this.updateProfileFormInputs();`;

// 5. bindProfileForm 시작 부분에서 updateProfileFormInputs 호출하도록 정돈
const oldBindFormStart = `  // 프로필 설정 폼
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
    if (cueInput) cueInput.value = this.challengeManager.habitCue;`;

const newBindFormStart = `  // 프로필 설정 폼
  bindProfileForm() {
    const form = document.getElementById("profile-form");
    if (!form) return;

    this.updateProfileFormInputs();`;

let normApp = app.replace(/\r\n/g, '\n');

// updateProfileFormInputs 삽입 (bindProfileForm 직전에 삽입)
if (!normApp.includes('updateProfileFormInputs() {')) {
  normApp = normApp.replace('  // 프로필 설정 폼\n  bindProfileForm() {', newMethod + '\n  // 프로필 설정 폼\n  bindProfileForm() {');
}

normApp = normApp.replace(oldPersist.replace(/\r\n/g, '\n'), newPersist);
normApp = normApp.replace(oldHydrate.replace(/\r\n/g, '\n'), newHydrate);
normApp = normApp.replace(oldTabSettings.replace(/\r\n/g, '\n'), newTabSettings);
normApp = normApp.replace(oldBindFormStart.replace(/\r\n/g, '\n'), newBindFormStart);

fs.writeFileSync(appPath, normApp, 'utf8');
console.log('SUCCESS: projects/Runnow/app.js updated with profile persistence and auto-refill!');

// legacy_web으로 복사
const appPath2 = 'C:\\BeausCreators\\02.BSC_Branch\\sandbox\\Runnow_APP_V\\legacy_web\\app.js';
fs.writeFileSync(appPath2, normApp, 'utf8');
console.log('SUCCESS: Copied to legacy_web/app.js');
