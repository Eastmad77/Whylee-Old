// /scripts/cloudsync.js — Whylee CloudSync (v9010)
// Syncs user progress, XP, avatars, and badges between localStorage and Firestore.
// Uses ONLY the bridge so it works with your CSP + CDN Firebase setup.

import {
  auth, db,
  doc, getDoc, setDoc, updateDoc, serverTimestamp,
  onAuthStateChanged
} from "/scripts/firebase-bridge.js?v=9010";

// ---------------------------
// CONSTANTS
// ---------------------------
const LOCAL_KEY = "whyleeCloudCache_v9";

// ---------------------------
// HELPERS
// ---------------------------
function getLocalCache() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY)) || {};
  } catch {
    return {};
  }
}

function saveLocalCache(data) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
  } catch {}
}

/**
 * Merge strategy: remote is the source of truth; local overlays lightweight client fields.
 * Adjust as needed if you want a different precedence.
 */
function mergeData(local, remote) {
  return {
    ...remote,
    ...local,
    updated: new Date().toISOString(),
  };
}

// ---------------------------
// CORE FUNCTIONS
// ---------------------------

/** Pull user data from Firestore → local cache */
export async function fetchUserData(uid) {
  try {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const remote = snap.data();
      const merged = mergeData(getLocalCache(), remote);
      saveLocalCache(merged);
      console.log("[CloudSync] Synced from Firestore:", merged);
      return merged;
    } else {
      console.log("[CloudSync] No user doc — creating baseline.");
      await initUserData(uid);
      const base = getLocalCache();
      return base;
    }
  } catch (err) {
    console.error("[CloudSync] Fetch error:", err);
    return getLocalCache();
  }
}

/** Push local data → Firestore (safe merge) */
export async function pushUserData(uid, data) {
  try {
    const ref = doc(db, "users", uid);
    const merged = { ...getLocalCache(), ...data, lastSync: serverTimestamp() };
    await setDoc(ref, merged, { merge: true });
    saveLocalCache(merged);
    console.log("[CloudSync] Data pushed.");
  } catch (err) {
    console.error("[CloudSync] Push error:", err);
  }
}

/** Partial updates for small changes (XP, avatar, etc.) */
export async function updateUserProgress(uid, updates) {
  try {
    const ref = doc(db, "users", uid);
    await updateDoc(ref, { ...updates, lastUpdate: serverTimestamp() });
    saveLocalCache({ ...getLocalCache(), ...updates });
    console.log("[CloudSync] Updated fields:", updates);
  } catch (err) {
    console.error("[CloudSync] Update error:", err);
  }
}

/** Initialize a new user's baseline document */
export async function initUserData(uid) {
  // Align with what the rest of your app reads (profile.js expects avatarId/emoji)
  const base = {
    // gameplay/progression
    xp: 0,
    level: 1,
    streak: 0,
    badges: [],

    // UI/prefs
    avatarId: "fox-default",
    emoji: "🦊",
    theme: "default",

    // entitlements (client-side hint; authoritative truth lives server-side)
    proStatus: false,

    // audit
    createdAt: serverTimestamp(),
    lastSync: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, "users", uid), base, { merge: true });
    saveLocalCache(base);
    console.log("[CloudSync] User baseline created.");
  } catch (err) {
    console.error("[CloudSync] Init error:", err);
  }
}

/** Clear cached data on logout */
export function clearLocalData() {
  localStorage.removeItem(LOCAL_KEY);
  console.log("[CloudSync] Local cache cleared.");
}

// ---------------------------
// AUTO-SYNC BINDING
// ---------------------------
onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("[CloudSync] Login detected:", user.email || user.uid);
    await fetchUserData(user.uid);
  } else {
    console.log("[CloudSync] Signed out — local mode only.");
  }
});

// (Optional) expose helpers for debugging
export const CloudCache = { get: getLocalCache, set: saveLocalCache };
