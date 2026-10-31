// تسجيل الدخول بحساب جوجل عن طريق Firebase Authentication
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect,
  onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";

const $ = (id) => document.getElementById(id);
const loginBtn = $("loginBtn");
const logoutBtn = $("logoutBtn");
const userBox = $("userBox");
const userName = $("userName");
const userPhoto = $("userPhoto");
const msg = $("authMsg");

function say(text) {
  if (!text) { msg.hidden = true; return; }
  msg.textContent = text;
  msg.hidden = false;
}

// لو الإعدادات لسه ما اتحطتش، زر الدخول يفضل مخفي والموقع يشتغل عادي
const configured = firebaseConfig &&
  firebaseConfig.apiKey &&
  !String(firebaseConfig.apiKey).startsWith("PASTE");

if (configured) {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  auth.languageCode = "ar";

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  loginBtn.hidden = false;

  loginBtn.addEventListener("click", async () => {
    say("");
    try {
      await signInWithPopup(auth, provider);
    } catch (e) {
      if (e.code === "auth/popup-closed-by-user" || e.code === "auth/cancelled-popup-request") return;
      if (e.code === "auth/popup-blocked" || e.code === "auth/operation-not-supported-in-this-environment") {
        try { await signInWithRedirect(auth, provider); }
        catch (e2) { say("تعذّر تسجيل الدخول. جرّب تاني."); }
        return;
      }
      if (e.code === "auth/unauthorized-domain") {
        say("الدومين ده مش مضاف في Firebase (Authorized domains).");
        return;
      }
      say("تعذّر تسجيل الدخول. جرّب تاني.");
    }
  });

  logoutBtn.addEventListener("click", function () { signOut(auth); });

  onAuthStateChanged(auth, function (user) {
    if (user) {
      loginBtn.hidden = true;
      userBox.hidden = false;
      userName.textContent = user.displayName || user.email || "عضو";
      if (user.photoURL && /^https:/.test(user.photoURL)) {
        userPhoto.src = user.photoURL;
        userPhoto.hidden = false;
      } else {
        userPhoto.hidden = true;
      }
      say("");
    } else {
      userBox.hidden = true;
      loginBtn.hidden = false;
    }
  });
}
