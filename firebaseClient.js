// RUNNOW Firebase Auth + Firestore 클라우드 클라이언트
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
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
      this.googleProvider.setCustomParameters({ prompt: "select_account" });
      this.isInitialized = true;
      console.log("🔥 RUNNOW Cloud Firebase & Auth connected successfully!");
    } catch (err) {
      console.warn("⚠️ Firebase Cloud Init Fallback to Local Sandbox:", err);
    }
  }

  sessionFromUser(user) {
    const sessionData = {
      uid: user.uid,
      displayName: user.displayName || user.email?.split("@")[0] || "러너",
      email: user.email || "",
      photoURL: user.photoURL || "",
      expiresAt: Date.now() + (365 * 24 * 60 * 60 * 1000) // 1년 영구 지속
    };
    this.currentUser = user;
    localStorage.setItem("RUNNOW_AUTH_SESSION", JSON.stringify(sessionData));
    localStorage.setItem("RUNNOW_CURRENT_USER_ID", user.uid);
    return sessionData;
  }

  authErrorMessage(err) {
    const code = err?.code || "";
    if (code === "auth/popup-blocked") return "팝업이 차단되었습니다. 브라우저에서 팝업을 허용해 주세요.";
    if (code === "auth/popup-closed-by-user") return "로그인이 취소되었습니다.";
    if (code === "auth/unauthorized-domain") return "이 도메인은 Firebase 로그인 허용 목록에 없습니다.";
    if (code === "auth/email-already-in-use") return "이미 가입된 이메일입니다. 로그인하세요.";
    if (code === "auth/invalid-email") return "이메일 형식이 올바르지 않습니다.";
    if (code === "auth/weak-password") return "비밀번호는 6자 이상이어야 합니다.";
    if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential") {
      return "이메일 또는 비밀번호가 올바르지 않습니다.";
    }
    if (code === "auth/operation-not-allowed") return "이 로그인 방식이 Firebase에서 아직 켜져 있지 않습니다.";
    return err?.message || "로그인에 실패했습니다.";
  }

  async signInWithGoogle() {
    if (!this.auth || !this.googleProvider) {
      throw new Error("Firebase Auth가 초기화되지 않았습니다.");
    }
    const result = await signInWithPopup(this.auth, this.googleProvider);
    return this.sessionFromUser(result.user);
  }

  async signUpWithEmail(email, password, displayName = "러너") {
    if (!this.auth) throw new Error("Firebase Auth가 초기화되지 않았습니다.");
    const cred = await createUserWithEmailAndPassword(this.auth, email, password);
    cred.user.displayName = displayName;
    return this.sessionFromUser(cred.user);
  }

  async signInWithEmail(email, password) {
    if (!this.auth) throw new Error("Firebase Auth가 초기화되지 않았습니다.");
    const cred = await signInWithEmailAndPassword(this.auth, email, password);
    return this.sessionFromUser(cred.user);
  }

  async logOut() {
    if (this.auth) {
      await signOut(this.auth);
    }
    localStorage.removeItem("RUNNOW_AUTH_SESSION");
    localStorage.removeItem("RUNNOW_CURRENT_USER_ID");
    this.currentUser = null;
  }

  getCurrentSession() {
    try {
      const raw = localStorage.getItem("RUNNOW_AUTH_SESSION");
      if (!raw) return null;
      const session = JSON.parse(raw);
      // 만료기한이 지났어도 사용자가 명시적으로 로그아웃한 게 아니면 자동 갱신
      if (!session.expiresAt || Date.now() > session.expiresAt) {
        session.expiresAt = Date.now() + (365 * 24 * 60 * 60 * 1000);
        localStorage.setItem("RUNNOW_AUTH_SESSION", JSON.stringify(session));
      }
      return session;
    } catch {
      return null;
    }
  }

  async getUser(userId) {
    if (!this.isInitialized || !this.db || !userId) return null;
    try {
      const snap = await getDoc(doc(this.db, "users", userId));
      return snap.exists() ? snap.data() : null;
    } catch (err) {
      console.error("Firestore getUser error:", err);
      return null;
    }
  }

  async getTamagotchi(userId) {
    if (!this.isInitialized || !this.db || !userId) return null;
    try {
      const snap = await getDoc(doc(this.db, "tamagotchi", userId));
      return snap.exists() ? snap.data() : null;
    } catch (err) {
      console.error("Firestore getTamagotchi error:", err);
      return null;
    }
  }

  async getChallenge(userId) {
    if (!this.isInitialized || !this.db || !userId) return null;
    try {
      const snap = await getDoc(doc(this.db, "challenges_progress", userId));
      return snap.exists() ? snap.data() : null;
    } catch (err) {
      console.error("Firestore getChallenge error:", err);
      return null;
    }
  }

  async syncUser(userId, userData) {
    if (!this.isInitialized || !this.db || !userId) return false;
    try {
      await setDoc(doc(this.db, "users", userId), {
        ...userData,
        uid: userId,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      return true;
    } catch (err) {
      console.error("Firestore syncUser error:", err);
      return false;
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
      return true;
    } catch (err) {
      console.error("Firestore syncChallenge error:", err);
      return false;
    }
  }
}

export const firebaseCloud = new FirebaseCloudClient();
