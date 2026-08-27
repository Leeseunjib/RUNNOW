// RUNNOW Real Cloud Firebase Client (Firestore SDK & Google Authentication)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { firebaseConfig } from "./firebaseConfig.js";

class FirebaseCloudClient {
  constructor() {
    this.app = null;
    this.db = null;
    this.auth = null;
    this.googleProvider = null;
    this.currentUser = null;
    this.isInitialized = false;
    this.init();
  }

  init() {
    try {
      this.app = initializeApp(firebaseConfig);
      this.db = getFirestore(this.app);
      this.auth = getAuth(this.app);
      this.googleProvider = new GoogleAuthProvider();
      this.googleProvider.setCustomParameters({ prompt: 'select_account' }); // 항상 구글 계정 선택창 표시
      this.isInitialized = true;
      console.log("🔥 RUNNOW Cloud Firebase & Auth connected successfully!");
    } catch (err) {
      console.warn("⚠️ Firebase Cloud Init Fallback to Local Sandbox:", err);
    }
  }

  // Google 원클릭 로그인
  async signInWithGoogle() {
    if (!this.auth || !this.googleProvider) {
      throw new Error("Firebase Auth가 초기화되지 않았습니다.");
    }
    try {
      const result = await signInWithPopup(this.auth, this.googleProvider);
      const user = result.user;
      this.currentUser = user;
      
      // 12시간 세션 타임스탬프 기록
      const sessionData = {
        uid: user.uid,
        displayName: user.displayName || "러너",
        email: user.email,
        photoURL: user.photoURL,
        expiresAt: Date.now() + (12 * 60 * 60 * 1000) // 12시간 후 자동 만료
      };
      localStorage.setItem("RUNNOW_AUTH_SESSION", JSON.stringify(sessionData));
      return sessionData;
    } catch (err) {
      console.error("Google Sign-In Error:", err);
      throw err;
    }
  }

  // 로그아웃
  async logOut() {
    if (this.auth) {
      await signOut(this.auth);
    }
    localStorage.removeItem("RUNNOW_AUTH_SESSION");
    localStorage.removeItem("RUNNOW_CURRENT_USER_ID");
    this.currentUser = null;
  }

  // 유효한 세션(12시간 이내) 확인
  getCurrentSession() {
    try {
      const raw = localStorage.getItem("RUNNOW_AUTH_SESSION");
      if (!raw) return null;
      const session = JSON.parse(raw);
      if (Date.now() > session.expiresAt) {
        console.log("⏰ 세션이 만료되었습니다. (12시간 경과)");
        this.logOut();
        return null;
      }
      return session;
    } catch {
      return null;
    }
  }

  async saveWorkout(userId, workoutData) {
    if (!this.isInitialized || !this.db) return null;
    try {
      const docRef = await addDoc(collection(this.db, "workouts"), {
        userId,
        ...workoutData,
        timestamp: new Date().toISOString()
      });
      console.log("☁️ Workout synced to Cloud Firestore:", docRef.id);
      return docRef.id;
    } catch (err) {
      console.error("Firestore saveWorkout error:", err);
      return null;
    }
  }

  async syncTamagotchi(userId, petData) {
    if (!this.isInitialized || !this.db) return false;
    try {
      await setDoc(doc(this.db, "tamagotchi", userId), {
        ...petData,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      console.log("☁️ Tamagotchi synced to Cloud Firestore!");
      return true;
    } catch (err) {
      console.error("Firestore syncTamagotchi error:", err);
      return false;
    }
  }

  async syncChallenge(userId, challengeData) {
    if (!this.isInitialized || !this.db) return false;
    try {
      await setDoc(doc(this.db, "challenges_progress", userId), {
        ...challengeData,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      console.log("☁️ Challenge Progress synced to Cloud Firestore!");
      return true;
    } catch (err) {
      console.error("Firestore syncChallenge error:", err);
      return false;
    }
  }
}

export const firebaseCloud = new FirebaseCloudClient();
