// /scripts/entitlements.js – v9007
// Export a named Entitlements object that other modules import as { Entitlements }

export const Entitlements = Object.freeze({
  FREE: "free",
  PRO: "pro"
});

// Optional helpers used in some pages
export function isPro(claimsOrFlag) {
  if (typeof claimsOrFlag === "boolean") return claimsOrFlag;
  return !!claimsOrFlag?.pro;
}
