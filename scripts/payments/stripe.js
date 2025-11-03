// /scripts/payments/stripe.js — v9010
import { Entitlements } from "/scripts/entitlements.js?v=9010";

// Expose this in HTML or small config script:
//   <script>window.WHYLEE_STRIPE_PK="pk_live_xxx"</script>
const STRIPE_PK = window.WHYLEE_STRIPE_PK || "pk_test_REPLACE_ME";

export async function startStripeCheckout() {
  if (!STRIPE_PK) {
    alert("Stripe key missing. Please configure WHYLEE_STRIPE_PK.");
    return;
  }
  try {
    const stripe = await loadStripe();
    const session = await createCheckoutSession();
    const { error } = await stripe.redirectToCheckout({ sessionId: session.id });
    if (error) console.error("[Stripe] redirect error", error);
  } catch (e) {
    console.error("[Stripe] init error", e);
  }
}

// TODO: call your Netlify Function; must return { id: "cs_..." }
async function createCheckoutSession() {
  return { id: "DUMMY_SESSION_ID" };
}

async function loadStripe() {
  if (window.Stripe) return window.Stripe(STRIPE_PK);
  await new Promise(res => {
    const s = document.createElement("script");
    s.src = "https://js.stripe.com/v3/";
    s.onload = res;
    document.head.appendChild(s);
  });
  return window.Stripe(STRIPE_PK);
}

export function onStripeSuccess() {
  Entitlements.grantPro();
}
