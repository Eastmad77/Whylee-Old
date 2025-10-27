// /scripts/leaderboard.js  (v9007)
import {
  db, collection, getDocs, query, orderBy, limit,
} from "/scripts/firebase-bridge.js?v=9007";

const listEl = document.getElementById("lbList");
const meEl   = document.getElementById("lbMe");

function row(name, xp) {
  return `
    <li class="lb-row">
      <span class="lb-name">${name ?? "Anonymous"}</span>
      <span class="lb-xp">${Number(xp ?? 0)}</span>
    </li>`;
}

export async function render() {
  if (!listEl) return;

  try {
    const q = query(collection(db, "leaderboard"), orderBy("xp", "desc"), limit(50));
    const snap = await getDocs(q);

    const items = [];
    snap.forEach(doc => {
      const d = doc.data() || {};
      items.push(row(d.name, d.xp));
    });

    listEl.innerHTML = items.join("") || `<li class="muted">No scores yet.</li>`;
    if (meEl) meEl.textContent = ""; // optionally personalize
  } catch (err) {
    console.warn("[leaderboard] load failed:", err);
    listEl.innerHTML = `<li class="muted">Leaderboard unavailable (permissions).</li>`;
  }
}

document.addEventListener("DOMContentLoaded", render);
