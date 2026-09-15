/**
 * dietManager.js
 * RunNow 식단 관리 & 현실 밀착형 체크리스트 & 다이내믹 만회(Rescue) 시스템
 */

(function() {
  const STORAGE_KEY_PREFIX = "RUNNOW_DIET_";
  
  function getTodayKey() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  const DEFAULT_CHECKLIST = [
    { id: "chk_morning", timeSlot: "아침", title: "기상 직후 미온수 300ml & 단백질 20g", desc: "물 한 잔으로 신진대사 ON! 삶은 달걀 2개 or 쉐이크", completed: false, tag: "수분&단백질" },
    { id: "chk_lunch", timeSlot: "점심", title: "밥 2/3 공기 덜어먹기 & 찌개 국물 남기기", desc: "염분과 탄수화물 피크를 막는 스마트한 일반식 식사법", completed: false, tag: "나트륨/탄수컷" },
    { id: "chk_snack", timeSlot: "간식", title: "가공당 음료 방어 & 건강 간식", desc: "시럽 음료 대신 아메리카노/탄산수 or 견과류 한 줌", completed: false, tag: "당류방어" },
    { id: "chk_dinner", timeSlot: "저녁", title: "취침 4시간 전 가벼운 클린 식사", desc: "소화 부담 없는 샐러드, 두부, 닭가슴살 위주 식단", completed: false, tag: "숙면식단" },
    { id: "chk_night", timeSlot: "야식", title: "🌙 밤 10시 이후 야식 배달앱 유혹 방어 도장", desc: "오늘 하루 야식 없이 완벽한 클린 마무리!", completed: false, tag: "야식철벽" }
  ];

  class DietManager {
    constructor() {
      this.today = getTodayKey();
      this.data = this.loadData();
      this.initEvents();
    }

    loadData() {
      const raw = localStorage.getItem(STORAGE_KEY_PREFIX + this.today);
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch (e) {
          console.error("Failed to parse diet data:", e);
        }
      }
      return {
        date: this.today,
        checklist: JSON.parse(JSON.stringify(DEFAULT_CHECKLIST)),
        meals: [],
        totalIntake: { calories: 0, carbs: 0, protein: 0, fat: 0, sodium: 0 },
        cheated: false,
        cheatDetails: null,
        nightBonusAwarded: false,
        cheatBonusAwarded: false,
        streakDays: this.getSavedStreak()
      };
    }

    saveData() {
      localStorage.setItem(STORAGE_KEY_PREFIX + this.today, JSON.stringify(this.data));
      this.updateUI();
    }

    getSavedStreak() {
      const s = localStorage.getItem("RUNNOW_DIET_STREAK");
      return s ? parseInt(s, 10) : 1;
    }

    saveStreak(val) {
      localStorage.setItem("RUNNOW_DIET_STREAK", String(val));
      this.data.streakDays = val;
    }

    toggleCheck(id) {
      const item = this.data.checklist.find(c => c.id === id);
      if (!item) return;
      item.completed = !item.completed;

      // 야식 방어: 하루 1회만 보상
      if (id === "chk_night" && item.completed && !this.data.nightBonusAwarded) {
        this.data.nightBonusAwarded = true;
        if (window.RunNowBridge?.awardDietBonus) {
          window.RunNowBridge.awardDietBonus({ coins: 10, xp: 10, feed: true });
        }
        alert("🎉 [야식 방어 성공!] 펫에게 '숙면 꿀잠 버프'와 10 볼트 포인트가 지급되었습니다!");
      }

      this.saveData();
    }

    addMeal(foodItem) {
      this.data.meals.push({
        id: "m_" + Date.now(),
        name: foodItem.name,
        portion: foodItem.portion,
        calories: foodItem.calories,
        carbs: foodItem.carbs,
        protein: foodItem.protein,
        fat: foodItem.fat,
        sodium: foodItem.sodium,
        time: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
      });

      this.recalcTotals();
      this.saveData();
    }

    removeMeal(mealId) {
      this.data.meals = this.data.meals.filter(m => m.id !== mealId);
      this.recalcTotals();
      this.saveData();
    }

    recalcTotals() {
      const totals = { calories: 0, carbs: 0, protein: 0, fat: 0, sodium: 0 };
      this.data.meals.forEach(m => {
        totals.calories += m.calories || 0;
        totals.carbs += m.carbs || 0;
        totals.protein += m.protein || 0;
        totals.fat += m.fat || 0;
        totals.sodium += m.sodium || 0;
      });
      // 소수점 1자리 정리
      totals.carbs = Math.round(totals.carbs * 10) / 10;
      totals.protein = Math.round(totals.protein * 10) / 10;
      totals.fat = Math.round(totals.fat * 10) / 10;
      this.data.totalIntake = totals;
    }

    /**
     * 다이내믹 만회(Rescue) 시스템: 솔직히 고백하기
     */
    triggerCheatRescue(foodName, calories) {
      const alreadyBonused = !!this.data.cheatBonusAwarded;
      this.data.cheated = true;
      this.data.cheatDetails = {
        food: foodName,
        calories: calories || 650,
        time: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
      };

      // 1. 저녁 식단 체크리스트 자동 다운사이징
      const dinner = this.data.checklist.find(c => c.id === "chk_dinner");
      if (dinner) {
        dinner.title = "🥗 [만회 플랜] 나트륨 배출 칼륨 샐러드 & 두부/쉐이크";
        dinner.desc = "점심 과잉 나트륨/칼로리를 상쇄하기 위해 수분과 채소 위주로 가볍게 리셋!";
        dinner.tag = "긴급만회";
      }

      // 2. 정직 보너스: 하루 1회만
      if (!alreadyBonused) {
        this.data.cheatBonusAwarded = true;
        if (window.RunNowBridge?.awardDietBonus) {
          window.RunNowBridge.awardDietBonus({ coins: 15, xp: 15 });
        }
      }

      // 3. 1:1 PT 에이전트 캘린더 연동 (오늘 보정 러닝 15분 추가)
      if (window.CareTeam) {
        window.CareTeam.addRescueWorkoutSchedule("치팅 만회 15분 인터벌 파워 조깅", 15, 140);
      }

      this.saveData();

      // 격려 모달 출력
      const modal = document.getElementById("diet-rescue-modal");
      if (modal) {
        const titleEl = document.getElementById("rescue-modal-food");
        if (titleEl) titleEl.textContent = foodName;
        const bonusNote = document.getElementById("rescue-modal-bonus-note");
        if (bonusNote) {
          bonusNote.textContent = alreadyBonused
            ? "오늘은 이미 정직 보너스를 받으셨습니다. 만회 플랜만 다시 맞춰 두었습니다."
            : "솔직 고백 완료 (+15P 적립)";
        }
        modal.style.display = "flex";
      }
    }

    initEvents() {
      document.addEventListener("DOMContentLoaded", () => {
        this.renderAll();
      });
    }

    renderAll() {
      this.renderChecklist();
      this.renderTotals();
      this.renderMealsList();
    }

    renderChecklist() {
      const container = document.getElementById("diet-checklist-container");
      if (!container) return;

      const completedCount = this.data.checklist.filter(c => c.completed).length;
      const pct = Math.round((completedCount / this.data.checklist.length) * 100);

      const progressEl = document.getElementById("diet-progress-bar");
      const progressText = document.getElementById("diet-progress-text");
      if (progressEl) progressEl.style.width = pct + "%";
      if (progressText) progressText.textContent = `${completedCount} / ${this.data.checklist.length} 완료 (${pct}%)`;

      let html = "";
      this.data.checklist.forEach(item => {
        const isDone = item.completed;
        html += `
          <div class="diet-check-card ${isDone ? 'done' : ''}" onclick="window.DietManager.toggleCheck('${item.id}')">
            <div class="diet-check-left">
              <span class="diet-check-box ${isDone ? 'checked' : ''}">${isDone ? '✓' : ''}</span>
              <div>
                <div class="diet-check-title">
                  <span class="diet-time-badge">${item.timeSlot}</span>
                  <strong>${item.title}</strong>
                </div>
                <div class="diet-check-desc">${item.desc}</div>
              </div>
            </div>
            <span class="diet-tag">${item.tag}</span>
          </div>
        `;
      });
      container.innerHTML = html;
    }

    renderTotals() {
      const { calories, carbs, protein, fat, sodium } = this.data.totalIntake;
      
      const calEl = document.getElementById("diet-total-calories");
      const carbEl = document.getElementById("diet-total-carbs");
      const protEl = document.getElementById("diet-total-protein");
      const fatEl = document.getElementById("diet-total-fat");
      const sodEl = document.getElementById("diet-total-sodium");

      if (calEl) calEl.textContent = calories.toLocaleString();
      if (carbEl) carbEl.textContent = carbs + "g";
      if (protEl) protEl.textContent = protein + "g";
      if (fatEl) fatEl.textContent = fat + "g";
      if (sodEl) sodEl.textContent = sodium.toLocaleString() + "mg";

      // 프로필 BMR 및 당일 운동 소모 칼로리 연동
      let bmr = 1720;
      let burned = 0;
      if (window.RunNowBridge?.getProfileBmr) {
        bmr = window.RunNowBridge.getProfileBmr() || bmr;
      }
      if (window.RunNowBridge?.getTodayBurnedCalories) {
        burned = window.RunNowBridge.getTodayBurnedCalories() || 0;
      } else {
        try {
          const lastRun = localStorage.getItem("RUNNOW_LAST_RUN");
          if (lastRun) {
            const r = JSON.parse(lastRun);
            burned = r.burnedToday || r.calories || 0;
          }
        } catch (e) {}
      }

      const burnedEl = document.getElementById("diet-burned-calories");
      if (burnedEl) burnedEl.textContent = Math.round(burned).toLocaleString();

      const bmrHint = document.getElementById("diet-bmr-value");
      if (bmrHint) bmrHint.textContent = bmr.toLocaleString();

      const balance = calories - (bmr + burned);
      const balEl = document.getElementById("diet-calorie-balance");
      if (balEl) {
        if (balance <= 0) {
          balEl.textContent = `${Math.abs(Math.round(balance))} kcal 적자 (다이어트 순항 🔥)`;
          balEl.style.color = "var(--primary-volt, #00C73C)";
        } else {
          balEl.textContent = `+${Math.round(balance)} kcal 흑자 (가벼운 유산소 추천 🏃)`;
          balEl.style.color = "#FF9800";
        }
      }
    }

    renderMealsList() {
      const listEl = document.getElementById("diet-meals-list");
      if (!listEl) return;

      if (!this.data.meals || this.data.meals.length === 0) {
        listEl.innerHTML = `
          <div style="text-align:center; padding:20px; color:var(--text-muted); font-size:12px;">
            아직 오늘 기록된 식단이 없습니다.<br>
            우측 상단 <strong>[+ 음식 검색/추가]</strong> 버튼을 눌러 공공영양 DB 캐시로 기록해 보세요!
          </div>
        `;
        return;
      }

      let html = "";
      this.data.meals.forEach(m => {
        html += `
          <div class="diet-meal-item">
            <div class="diet-meal-info">
              <span class="diet-meal-time">${m.time}</span>
              <strong>${m.name}</strong>
              <span class="diet-meal-portion">${m.portion}</span>
            </div>
            <div class="diet-meal-macros">
              <span class="cal">${m.calories} kcal</span>
              <span class="macro">탄 ${m.carbs}g | 단 ${m.protein}g | 지 ${m.fat}g</span>
            </div>
            <button type="button" class="btn-del-meal" onclick="window.DietManager.removeMeal('${m.id}')">✕</button>
          </div>
        `;
      });
      listEl.innerHTML = html;
    }

    updateUI() {
      this.renderAll();
    }
  }

  window.DietManager = new DietManager();
})();
