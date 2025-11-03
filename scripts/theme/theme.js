/**
 * Whylee Theme Manager (v9010)
 * Path: /scripts/theme/theme.js
 */
const ROOT = document.documentElement;

function applyTheme(mode) {
  // mode: "light" | "dark" | "system"
  const v = (mode || "system").toLowerCase();
  ROOT.setAttribute("data-theme", v);

  // Example of toggling classes for CSS variables if needed
  ROOT.classList.toggle("theme-dark", v === "dark");
  ROOT.classList.toggle("theme-light", v === "light");

  // Persist user preference (optional)
  try { localStorage.setItem("wl-theme", v); } catch {}
}

export function initTheme() {
  let saved = null;
  try { saved = localStorage.getItem("wl-theme"); } catch {}
  applyTheme(saved || "system");

  // Optional: react to system changes if in "system" mode
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener?.("change", () => {
    const current = ROOT.getAttribute("data-theme");
    if (current === "system") applyTheme("system");
  });

  // If you have a toggle element:
  const btn = document.getElementById("btnTheme");
  if (btn) {
    btn.addEventListener("click", () => {
      const current = ROOT.getAttribute("data-theme") || "system";
      const next = current === "light" ? "dark" : current === "dark" ? "system" : "light";
      applyTheme(next);
    });
  }
}
