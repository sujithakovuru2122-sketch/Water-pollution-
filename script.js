/* ==========================================================
   Water Pollution Awareness – script.js
   Firebase Authentication + EmailJS feedback
   STEP 1: paste your own values in the two config blocks below.
   (Firebase web config and the EmailJS public key are designed to be
   public. NEVER put a Firebase service-account key or an EmailJS
   private key in this file.)
   ========================================================== */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged, updateProfile
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  appId: "YOUR_FIREBASE_APP_ID"
};

const EMAILJS_PUBLIC_KEY = "YOUR_EMAILJS_PUBLIC_KEY";
const EMAILJS_SERVICE_ID = "YOUR_EMAILJS_SERVICE_ID";
const EMAILJS_TEMPLATE_ID = "YOUR_EMAILJS_TEMPLATE_ID";

/* ---------- helpers ---------- */
const $ = (id) => document.getElementById(id);
const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
const configured = !Object.values(firebaseConfig).some((v) => v.startsWith("YOUR_"));

function show(el, text, type) {
  el.textContent = text;
  el.className = "msg " + type;
  el.hidden = false;
}
function hide(el) { el.hidden = true; el.textContent = ""; }
function busy(btn, on, label) { btn.disabled = on; btn.textContent = on ? "Please wait…" : label; }

const authErrors = {
  "auth/email-already-in-use": "This email is already registered. Try logging in instead.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/weak-password": "Password is too weak. Use at least 6 characters.",
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/user-not-found": "No account found for this email.",
  "auth/wrong-password": "Incorrect email or password.",
  "auth/too-many-requests": "Too many attempts. Wait a few minutes and try again.",
  "auth/network-request-failed": "Network problem. Check your internet connection.",
  "auth/operation-not-allowed": "Email/password sign-in is not enabled in Firebase yet.",
  "auth/api-key-not-valid.-please-pass-a-valid-api-key.": "Firebase API key is invalid. Check firebaseConfig in script.js."
};
const authMsgText = (e) => authErrors[e.code] || "Something went wrong. Please try again.";

/* ---------- Firebase init ---------- */
let auth = null;
if (configured) {
  auth = getAuth(initializeApp(firebaseConfig));
}

/* ---------- login / signup tabs ---------- */
const authMsg = $("authMsg");
function switchTab(toSignup) {
  $("loginForm").hidden = toSignup;
  $("signupForm").hidden = !toSignup;
  $("tabLogin").classList.toggle("active", !toSignup);
  $("tabSignup").classList.toggle("active", toSignup);
  $("tabLogin").setAttribute("aria-selected", String(!toSignup));
  $("tabSignup").setAttribute("aria-selected", String(toSignup));
  hide(authMsg);
}
$("tabLogin").onclick = () => switchTab(false);
$("tabSignup").onclick = () => switchTab(true);

if (!configured) {
  show(authMsg, "Setup needed: add your Firebase config in script.js (see the setup guide).", "error");
}

/* ---------- signup ---------- */
$("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  hide(authMsg);
  if (!auth) return show(authMsg, "Firebase is not configured yet.", "error");
  const name = $("signupName").value.trim();
  const email = $("signupEmail").value.trim();
  const pw = $("signupPassword").value;
  const pw2 = $("signupConfirm").value;

  if (name.length < 2) return show(authMsg, "Enter your full name.", "error");
  if (!emailOk(email)) return show(authMsg, "Enter a valid email address.", "error");
  if (pw.length < 6) return show(authMsg, "Password must be at least 6 characters.", "error");
  if (pw !== pw2) return show(authMsg, "Passwords do not match.", "error");

  busy($("signupBtn"), true);
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pw);
    await updateProfile(cred.user, { displayName: name });
    $("userName").textContent = name;
    $("fbName").value = name;
    $("signupForm").reset();
  } catch (err) {
    show(authMsg, authMsgText(err), "error");
  } finally {
    busy($("signupBtn"), false, "Create account");
  }
});

/* ---------- login ---------- */
$("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  hide(authMsg);
  if (!auth) return show(authMsg, "Firebase is not configured yet.", "error");
  const email = $("loginEmail").value.trim();
  const pw = $("loginPassword").value;

  if (!emailOk(email)) return show(authMsg, "Enter a valid email address.", "error");
  if (!pw) return show(authMsg, "Enter your password.", "error");

  busy($("loginBtn"), true);
  try {
    await signInWithEmailAndPassword(auth, email, pw);
    $("loginForm").reset();
  } catch (err) {
    show(authMsg, authMsgText(err), "error");
  } finally {
    busy($("loginBtn"), false, "Log in");
  }
});

/* ---------- logout ---------- */
$("logoutBtn").onclick = async () => {
  try { await signOut(auth); } catch (err) { alert("Could not log out. Please try again."); }
};

/* ---------- show/hide content based on real auth state ---------- */
if (auth) {
  onAuthStateChanged(auth, (user) => {
    const loggedIn = !!user;
    $("authView").hidden = loggedIn;
    $("appView").hidden = !loggedIn;
    if (loggedIn) {
      const name = user.displayName || user.email.split("@")[0];
      $("userName").textContent = name;
      $("fbName").value = name;
      $("fbEmail").value = user.email;
      window.scrollTo(0, 0);
    } else {
      hide($("fbMsg"));
      switchTab(false);
      window.scrollTo(0, 0);
    }
  });
}

/* ---------- mobile menu ---------- */
const nav = $("nav");
$("menuBtn").onclick = () => {
  const open = nav.classList.toggle("open");
  $("menuBtn").setAttribute("aria-expanded", String(open));
};
nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => {
  nav.classList.remove("open");
  $("menuBtn").setAttribute("aria-expanded", "false");
}));
$("yr").textContent = new Date().getFullYear();

/* ---------- star rating ---------- */
let rating = 0;
const stars = [...document.querySelectorAll(".star")];
function paint(n) {
  stars.forEach((s) => {
    const v = Number(s.dataset.v);
    s.classList.toggle("on", v <= n);
    s.setAttribute("aria-checked", String(v === rating));
  });
}
stars.forEach((s) => {
  s.addEventListener("click", () => { rating = Number(s.dataset.v); paint(rating); });
  s.addEventListener("mouseenter", () => paint(Number(s.dataset.v)));
});
$("stars").addEventListener("mouseleave", () => paint(rating));

/* ---------- feedback via EmailJS ---------- */
const emailjsReady = typeof emailjs !== "undefined" && !EMAILJS_PUBLIC_KEY.startsWith("YOUR_");
if (emailjsReady) emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

$("feedbackForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const box = $("fbMsg");
  hide(box);
  const name = $("fbName").value.trim();
  const email = $("fbEmail").value.trim();
  const text = $("fbText").value.trim();

  if (name.length < 2) return show(box, "Enter your name.", "error");
  if (!emailOk(email)) return show(box, "Enter a valid email address.", "error");
  if (rating < 1) return show(box, "Choose a rating from 1 to 5 stars.", "error");
  if (text.length < 5) return show(box, "Write a short feedback message.", "error");
  if (!emailjsReady) return show(box, "Feedback email is not set up yet. Add your EmailJS keys in script.js.", "error");

  busy($("fbBtn"), true);
  try {
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      user_name: name,
      user_email: email,
      rating: rating + " / 5",
      message: text
    });
    show(box, "Thank you! Your feedback was sent successfully.", "success");
    $("fbText").value = "";
    rating = 0;
    paint(0);
  } catch (err) {
    show(box, "Could not send feedback. Please check your connection and try again.", "error");
    console.error("EmailJS error:", err);
  } finally {
    busy($("fbBtn"), false, "Submit feedback");
  }
});
