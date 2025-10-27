// /scripts/leaderboard.js (v9007)
import {
  db, collection, getDocs, query, orderBy, limit
} from "/scripts/firebase-bridge.js?v=9007";

const LIST = document.getElementById("leaderboard");

async function render() {
  try {
    const q = query(collection(db, "leaderboard"), orderBy("xp", "desc"), limit(50));
    const snap = await getDocs(q);

    const frag = document.createDocumentFragment();
    snap.forEach(doc => {
      const d = doc.data();
      const li = document.createElement("li");
      li.className = "lb-row";
      li.innerHTML = `
        <span class="rank">#</span>
        <span class="lb-name">${d.name ?? "Player"}</span>
        <span class="lb-xp">${d.xp ?? 0} XP</span>
        <img class="lb-ava" src="${d.avatar ?? "/media/avatars/default.png"}" alt="" />
      `;
      frag.appendChild(li);
    });

    LIST.innerHTML = "";
    LIST.appendChild(frag);
  } catch (e) {
    console.error("[leaderboard] load failed:", e);
    LIST.innerHTML = `<li class="lb-row">Failed to load leaderboard.</li>`;
  }
}

render();
