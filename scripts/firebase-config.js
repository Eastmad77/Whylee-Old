// /scripts/firebase-config.js  (v9007)
// This MUST run before firebase-bridge.js.
// It defines a global so firebase-bridge can read it without imports.

export const firebaseConfig = {
  apiKey: "AIzaSyDfjcMzAl-Tll0xsHri91VHiMdTGmd7b2k",
  authDomain: "dailybrainbolt.firebaseapp.com",
  projectId: "dailybrainbolt",
  // If storage gives issues, try "dailybrainbolt.appspot.com" instead:
  storageBucket: "dailybrainbolt.appspot.com",
  messagingSenderId: "118224143962",
  appId: "1:118224143962:web:43d85714b96ac1357e7a63",
  measurementId: "G-M0P3TSCF8P"
};

// ALSO attach to window for non-bundled pages and dynamic imports
if (typeof window !== "undefined") {
  window.firebaseConfig = firebaseConfig;
}
