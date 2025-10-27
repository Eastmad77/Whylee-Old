// /scripts/menu.js (v9007)
import { onAuthStateChanged, auth } from "/scripts/firebase-bridge.js?v=9007";
import Entitlements, { Entitlements as Ents } from "/scripts/entitlements.js?v=9007";

const elName   = document.getElementById("menu-user-name");
const elStatus = document.getElementById("menu-entitlement");
const elProBtn = document.getElementById("menu-go-pro");

function setEntitlementBadge(kind) {
  if (!elStatus) return;
  const label = kind === Ents.PRO ? "PRO" : "FREE";
  elStatus.textContent = label;
  elStatus.dataset.kind = label.toLowerCase();
}

onAuthStateChanged(auth, (user) => {
  if (!user) {
    elName && (elName.textContent = "Guest");
    setEntitlementBadge(Ents.FREE);
    elProBtn && (elProBtn.hidden = false);
    return;
  }
  elName && (elName.textContent = user.displayName || user.email || "Player");
  // In a real app you'd read a claim/field to know Pro vs Free.
  setEntitlementBadge(Ents.FREE);
  elProBtn && (elProBtn.hidden = false);
});
