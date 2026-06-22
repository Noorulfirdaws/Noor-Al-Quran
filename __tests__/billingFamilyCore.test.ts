import {
  PRICES, priceFor, formatPrice, planFromPriceId, mapStripeStatus,
  reduceStripeEvent, type PriceMap, type StripeEventLike,
} from "../app/services/billingCore";
import {
  FAMILY_MAX_MEMBERS, generateInviteToken, inviteUrl, canAddMember,
  inviteExpiresAt, validateInvite, seatsRemaining, type InviteRecord,
} from "../app/services/familyCore";

const NOW = Date.parse("2026-06-15T00:00:00Z");
const DAY = 86_400_000;

// ─── Billing ──────────────────────────────────────────────────────────────────

describe("pricing", () => {
  it("yearly premium is cheaper than 12× monthly (2 months free)", () => {
    expect(PRICES.premium.yearly).toBeLessThan(PRICES.premium.monthly * 12);
  });
  it("priceFor + formatPrice", () => {
    expect(priceFor("family", "monthly")).toBe(1900);
    expect(formatPrice(1900)).toBe("$19");
    expect(formatPrice(950)).toBe("$9.50");
  });
});

const priceMap: PriceMap = {
  price_prem_m: { plan: "premium", interval: "monthly" },
  price_fam_y: { plan: "family", interval: "yearly" },
};

describe("planFromPriceId / mapStripeStatus", () => {
  it("resolves a known price id", () => {
    expect(planFromPriceId("price_fam_y", priceMap)).toEqual({ plan: "family", interval: "yearly" });
  });
  it("unknown price id → null", () => {
    expect(planFromPriceId("nope", priceMap)).toBeNull();
  });
  it("maps stripe statuses", () => {
    expect(mapStripeStatus("active")).toBe("active");
    expect(mapStripeStatus("trialing")).toBe("active");
    expect(mapStripeStatus("past_due")).toBe("past_due");
    expect(mapStripeStatus("canceled")).toBe("canceled");
    expect(mapStripeStatus("weird")).toBe("incomplete");
  });
});

describe("reduceStripeEvent", () => {
  it("subscription.updated → plan + status + ms period end", () => {
    const ev: StripeEventLike = {
      type: "customer.subscription.updated",
      data: { object: { status: "active", current_period_end: NOW / 1000 + 30 * 86400, items: { data: [{ price: { id: "price_prem_m" } }] }, customer: "cus_1" } },
    };
    const r = reduceStripeEvent(ev, priceMap);
    expect(r).toEqual({
      plan: "premium", status: "active",
      currentPeriodEnd: (NOW / 1000 + 30 * 86400) * 1000,
      stripeCustomerId: "cus_1",
    });
  });
  it("subscription.deleted → free/canceled", () => {
    const ev: StripeEventLike = {
      type: "customer.subscription.deleted",
      data: { object: { status: "canceled", current_period_end: 0, items: { data: [] }, customer: "cus_1" } },
    };
    const r = reduceStripeEvent(ev, priceMap);
    expect(r).toMatchObject({ plan: "free", status: "canceled", currentPeriodEnd: null });
  });
  it("unknown price id → free plan (fails safe)", () => {
    const ev: StripeEventLike = {
      type: "customer.subscription.updated",
      data: { object: { status: "active", current_period_end: NOW / 1000, items: { data: [{ price: { id: "unknown" } }] }, customer: "c" } },
    };
    expect(reduceStripeEvent(ev, priceMap)?.plan).toBe("free");
  });
  it("ignores irrelevant events", () => {
    expect(reduceStripeEvent({ type: "invoice.paid", data: { object: {} } }, priceMap)).toBeNull();
  });
});

// ─── Family ───────────────────────────────────────────────────────────────────

describe("family invites + cap", () => {
  it("token is url-safe and 24 chars; url built", () => {
    const t = generateInviteToken(() => 0.5);
    expect(t).toMatch(/^[A-Za-z0-9]{24}$/);
    expect(inviteUrl("https://x.com/", t)).toBe(`https://x.com/family/join?token=${t}`);
  });
  it("cap includes owner (max 6)", () => {
    expect(FAMILY_MAX_MEMBERS).toBe(6);
    expect(canAddMember(5)).toBe(true);
    expect(canAddMember(6)).toBe(false);
    expect(seatsRemaining(4)).toBe(2);
    expect(seatsRemaining(8)).toBe(0);
  });

  const fresh: InviteRecord = { token: "t", familyId: "f", issuedAt: NOW };

  it("accepts a fresh invite with room", () => {
    expect(validateInvite(fresh, 3, false, NOW)).toEqual({ ok: true });
  });
  it("rejects an expired invite", () => {
    expect(validateInvite(fresh, 3, false, inviteExpiresAt(NOW) + 1)).toEqual({ ok: false, reason: "expired" });
  });
  it("rejects an already-accepted invite", () => {
    expect(validateInvite({ ...fresh, acceptedByUserId: "u" }, 3, false, NOW)).toEqual({ ok: false, reason: "already-accepted" });
  });
  it("rejects when the family is full", () => {
    expect(validateInvite(fresh, 6, false, NOW)).toEqual({ ok: false, reason: "family-full" });
  });
  it("rejects an existing member", () => {
    expect(validateInvite(fresh, 3, true, NOW)).toEqual({ ok: false, reason: "already-member" });
  });
});
