/**
 * Whylee Pro Subscription Client (v9008)
 * Path: /scripts/pro.js
 */
import { firebaseConfig } from "/scripts/firebase-config.js?v=9009";
import {
  auth,
  onAuthStateChanged,
  getIdTokenResult,
  signOut,
} from "/scripts/firebase-bridge.js?v=9009";
import { isPro } from "/scripts/entitlements.js?v=9009";

const els = {
  status: document.getElementById("proStatus"),
  btnManage: document.getElementById("btnManage"),
  btnUpgrade: document.getElementById("btnUpgrade"),
  planYearly: document.getElementById("planYearly"),
  planMonthly: document.getElementById("planMonthly"),
};

function set(txt) {
  if (els.status) els.status.textContent = txt;
}

async function createCheckoutSession(plan) {
  set("Opening checkout…");
  const res = await fetch("/.netlify/functions/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan }), // "monthly" | "yearly"
  });
  if (!res.ok) throw new Error("Checkout failed");
  const { url } = await res.json();
  window.location.href = url;
}

async function openPortal() {
  set("Opening portal…");
  const res = await fetch("/.netlify/functions/create-portal-session", {
    method: "POST",
  });
  if (!res.ok) throw new Error("Portal failed");
  const { url } = await res.json();
  window.location.href = url;
}

function wireUI(uid) {
  if (els.btnManage) {
    els.btnManage.onclick = async () => {
      try { await openPortal(); } catch (e) { console.warn(e); set("Portal error."); }
    };
  }
  if (els.btnUpgrade) {
    els.btnUpgrade.onclick = async () => {
      try { await createCheckoutSession("monthly"); } catch (e) { console.warn(e); set("Checkout error."); }
    };
  }
  if (els.planMonthly) {
    els.planMonthly.onclick = async () => {
      try { await createCheckoutSession("monthly"); } catch (e) { console.warn(e); set("Checkout error."); }
    };
  }
  if (els.planYearly) {
    els.planYearly.onclick = async () => {
      try { await createCheckoutSession("yearly"); } catch (e) { console.warn(e); set("Checkout error."); }
    };
  }
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    set("Please sign in to manage Whylee Pro.");
    return;
  }
  wireUI(user.uid);

  try {
    const pro = await isPro(user.uid);
    if (pro) {
      set("You’re Whylee Pro ✓");
      if (els.btnUpgrade) els.btnUpgrade.style.display = "none";
      if (els.btnManage) els.btnManage.style.display = "inline-flex";
    } else {
      set("Unlock avatars & boosts with Whylee Pro.");
      if (els.btnUpgrade) els.btnUpgrade.style.display = "inline-flex";
      if (els.btnManage) els.btnManage.style.display = "none";
    }

    // (optional) show claims
    const token = await getIdTokenResult(user, true);
    console.debug("[pro] claims:", token.claims);
  } catch (e) {
    console.warn("[pro] error:", e);
    set("Could not determine Pro status.");
  }
});
