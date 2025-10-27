// /scripts/leaderboard.js  (v9007)
import {
  auth, onAuthStateChanged,
  db, collection, getDocs, query, orderBy, limit
} from "/scripts/firebase-bridge.js?v=9007";

const listEl = document.getElementById("lbList");
const msgEl  = document.getElementById("lbMsg");

function showMsg(txt) { if (msgEl) msgEl.textContent = txt; }

async function loadLeaderboard() {
  if (!listEl) { console.warn("[leaderboard] #lbList not found"); return; }

  showMsg("Loading…");

  try {
    // change "leaderboard" to your collection name if different
    const q = query(collection(db, "leaderboard"), orderBy("xp", "desc"), limit(50));
    const snap = await getDocs(q);

    if (snap.empty) {
      listEl.innerHTML = "";
      showMsg("No scores yet.");
      return;
    }

    const rows = [];
    let rank = 1;
    snap.forEach((doc) => {
      const d = doc.data() || {};
      rows.push(`
        <li class="lb-row">
          <span class="lb-rank">${rank++}</span>
          <span class="lb-name">${(d.displayName || d.name || "Player")}</span>
          <span class="lb-xp">${d.xp ?? 0} XP</span>
        </li>
      `);
    });

    listEl.innerHTML = rows.join("");
    showMsg("");
  } catch (err) {
    console.error("[leaderboard] load failed:", err);
    listEl && (listEl.innerHTML = "");
    // Friendly message based on permissions
    const denied = String(err?.message || "").includes("Missing or insufficient permissions");
    showMsg(denied
      ? "Leaderboard is private. Sign in to view."
      : "Could not load leaderboard. Please try again.");
  }
}

// If your rules require auth, wait for it; otherwise, load immediately.
onAuthStateChanged(auth, () => loadLeaderboard());
