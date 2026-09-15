// RUNNOW Firebase Auth + Firestore 클라우드 클라이언트 (React Native Ver.)
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc } from "firebase/firestore";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";
import { firebaseConfig } from "./firebaseConfig.js";
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      // Firestore와 같은 리전에 배포된 함수를 호출합니다.
      this.functions = getFunctions(this.app, "asia-northeast3");
      this.googleProvider = new GoogleAuthProvider();
      this.googleProvider.setCustomParameters({ prompt: "select_account" });
      this.isInitialized = true;

      // 비동기 Auth 상태 실시간 동기화
      onAuthStateChanged(this.auth, async (user) => {
        if (user) {
          this.currentUser = user;
          await this.sessionFromUser(user);
        } else {
          this.currentUser = null;
        }
      });

      console.log("🔥 RUNNOW Cloud Firebase & Auth connected successfully! (React Native)");
    } catch (err) {
      console.warn("⚠️ Firebase Cloud Init Fallback to Local Sandbox:", err);
    }
  }

  async sessionFromUser(user) {
    const sessionData = {
      uid: user.uid,
      displayName: user.displayName || user.email?.split("@")[0] || "러너",
      email: user.email || "",
      photoURL: user.photoURL || "",
      expiresAt: Date.now() + (365 * 24 * 60 * 60 * 1000) // 1년 영구 지속
    };
    this.currentUser = user;
    await AsyncStorage.setItem("RUNNOW_AUTH_SESSION", JSON.stringify(sessionData));
    await AsyncStorage.setItem("RUNNOW_CURRENT_USER_ID", user.uid);
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

  // React Native 앱 환경에서는 GoogleSignIn 등의 별도 라이브러리가 필요할 수 있습니다.
  // signInWithPopup은 RN에서 동작하지 않으므로 변경이 필요합니다.
  async signInWithGoogle() {
    if (!this.auth || !this.googleProvider) {
      throw new Error("Firebase Auth가 초기화되지 않았습니다.");
    }
    // TODO: Expo에서 Google 로그인 사용 시 signInWithCredential 로직으로 변경
    console.warn("React Native에서 signInWithPopup은 지원되지 않습니다. 구글 로그인은 추가 작업이 필요합니다.");
  }

  async signUpWithEmail(email, password, displayName = "러너") {
    if (!this.auth) throw new Error("Firebase Auth가 초기화되지 않았습니다.");
    const cred = await createUserWithEmailAndPassword(this.auth, email, password);
    cred.user.displayName = displayName;
    return await this.sessionFromUser(cred.user);
  }

  async signInWithEmail(email, password) {
    if (!this.auth) throw new Error("Firebase Auth가 초기화되지 않았습니다.");
    const cred = await signInWithEmailAndPassword(this.auth, email, password);
    return await this.sessionFromUser(cred.user);
  }

  async logOut() {
    if (this.auth) {
      await signOut(this.auth);
    }
    await AsyncStorage.removeItem("RUNNOW_AUTH_SESSION");
    await AsyncStorage.removeItem("RUNNOW_CURRENT_USER_ID");
    this.currentUser = null;
  }

  async getCurrentSession() {
    try {
      const raw = await AsyncStorage.getItem("RUNNOW_AUTH_SESSION");
      if (!raw) return null;
      const session = JSON.parse(raw);
      if (!session.expiresAt || Date.now() > session.expiresAt) {
        session.expiresAt = Date.now() + (365 * 24 * 60 * 60 * 1000);
        await AsyncStorage.setItem("RUNNOW_AUTH_SESSION", JSON.stringify(session));
      }
      return session;
    } catch {
      return null;
    }
  }

  // ---------- 결제 · 구독 (서버 검증) ----------
  async callFunction(name, payload = {}) {
    if (!this.isInitialized || !this.functions) {
      throw new Error("서버에 연결되어 있지 않습니다. 네트워크를 확인해 주세요.");
    }
    if (!this.auth || !this.auth.currentUser) {
      throw new Error("결제는 로그인 후 이용할 수 있습니다.");
    }
    const fn = httpsCallable(this.functions, name);
    const res = await fn(payload);
    return res.data;
  }

  async createPaypalOrder(planId) {
    return this.callFunction("createPaypalOrder", { planId });
  }

  async capturePaypalOrder(orderId) {
    return this.callFunction("capturePaypalOrder", { orderId });
  }

  async chatWithCoach(systemPrompt, userText) {
    return this.callFunction("chatWithCoach", { systemPrompt, userText });
  }

  async fetchMySubscription() {
    if (!this.isInitialized || !this.auth || !this.auth.currentUser) return null;
    try {
      return await this.callFunction("getMySubscription");
    } catch (err) {
      console.warn("구독 상태 조회 실패(로컬 캐시 사용):", err && err.message);
      return null;
    }
  }

  isDevMode() {
    // React Native에서는 __DEV__ 글로벌 변수를 사용하여 개발 모드 판별 가능
    return typeof __DEV__ !== 'undefined' ? __DEV__ : false;
  }

  getCollectionName(baseName) {
    return this.isDevMode() ? `dev_${baseName}` : baseName;
  }

  async getUser(userId) {
    if (!this.isInitialized || !this.db || !userId) return null;
    try {
      const col = this.getCollectionName("users");
      const snap = await getDoc(doc(this.db, col, userId));
      return snap.exists() ? snap.data() : null;
    } catch (err) {
      console.error("Firestore getUser error:", err);
      return null;
    }
  }

  async getTamagotchi(userId) {
    if (!this.isInitialized || !this.db || !userId) return null;
    try {
      const col = this.getCollectionName("tamagotchi");
      const snap = await getDoc(doc(this.db, col, userId));
      return snap.exists() ? snap.data() : null;
    } catch (err) {
      console.error("Firestore getTamagotchi error:", err);
      return null;
    }
  }

  async getChallenge(userId) {
    if (!this.isInitialized || !this.db || !userId) return null;
    try {
      const col = this.getCollectionName("challenges_progress");
      const snap = await getDoc(doc(this.db, col, userId));
      return snap.exists() ? snap.data() : null;
    } catch (err) {
      console.error("Firestore getChallenge error:", err);
      return null;
    }
  }

  async syncUser(userId, userData) {
    if (!this.isInitialized || !this.db || !userId) return false;
    if (!this.auth?.currentUser || this.auth.currentUser.uid !== userId) return false;
    try {
      const col = this.getCollectionName("users");
      await setDoc(doc(this.db, col, userId), {
        ...userData,
        uid: userId,
        env: this.isDevMode() ? "dev" : "prod",
        updatedAt: new Date().toISOString()
      }, { merge: true });
      return true;
    } catch (err) {
      console.error("Firestore syncUser error:", err);
      return false;
    }
  }

  async saveWorkout(userId, workoutData) {
    if (!this.isInitialized || !this.db || !userId) return null;
    if (!this.auth?.currentUser || this.auth.currentUser.uid !== userId) return null;
    try {
      const col = this.getCollectionName("workouts");
      const docRef = await addDoc(collection(this.db, col), {
        userId,
        ...workoutData,
        env: this.isDevMode() ? "dev" : "prod",
        timestamp: new Date().toISOString()
      });
      return docRef.id;
    } catch (err) {
      console.error("Firestore saveWorkout error:", err);
      return null;
    }
  }

  async syncTamagotchi(userId, petData) {
    if (!this.isInitialized || !this.db || !userId) return false;
    if (!this.auth?.currentUser || this.auth.currentUser.uid !== userId) return false;
    try {
      const col = this.getCollectionName("tamagotchi");
      await setDoc(doc(this.db, col, userId), {
        ...petData,
        env: this.isDevMode() ? "dev" : "prod",
        updatedAt: new Date().toISOString()
      }, { merge: true });
      return true;
    } catch (err) {
      console.error("Firestore syncTamagotchi error:", err);
      return false;
    }
  }

  async syncChallenge(userId, challengeData) {
    if (!this.isInitialized || !this.db || !userId) return false;
    if (!this.auth?.currentUser || this.auth.currentUser.uid !== userId) return false;
    try {
      const col = this.getCollectionName("challenges_progress");
      await setDoc(doc(this.db, col, userId), {
        ...challengeData,
        env: this.isDevMode() ? "dev" : "prod",
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
