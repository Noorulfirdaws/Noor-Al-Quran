import {
  canAccessTier, effectivePlan, memberEffectivePlan,
  generateGiftCode, normalizeGiftCode, validateGift, extendPeriod, redeemGift,
  type SubscriptionRecord, type GiftCardRecord,
} from "../app/services/subscriptionCore";

const NOW = Date.parse("2026-06-15T00:00:00Z");
const MONTH = 30 * 86_400_000;

describe("canAccessTier", () => {
  it("basic is open to everyone", () => {
    expect(canAccessTier("free", "basic")).toBe(true);
  });
  it("premium needs premium or family", () => {
    expect(canAccessTier("free", "premium")).toBe(false);
    expect(canAccessTier("premium", "premium")).toBe(true);
    expect(canAccessTier("family", "premium")).toBe(true);
  });
  it("family is family-only", () => {
    expect(canAccessTier("premium", "family")).toBe(false);
    expect(canAccessTier("family", "family")).toBe(true);
  });
});

describe("effectivePlan", () => {
  it("no subscription → free", () => {
    expect(effectivePlan(null, NOW)).toBe("free");
  });
  it("active and not lapsed → its plan", () => {
    const s: SubscriptionRecord = { plan: "premium", status: "active", currentPeriodEnd: NOW + MONTH };
    expect(effectivePlan(s, NOW)).toBe("premium");
  });
  it("lapsed period → free", () => {
    const s: SubscriptionRecord = { plan: "family", status: "active", currentPeriodEnd: NOW - 1 };
    expect(effectivePlan(s, NOW)).toBe("free");
  });
  it("canceled status → free even if period remains", () => {
    const s: SubscriptionRecord = { plan: "premium", status: "canceled", currentPeriodEnd: NOW + MONTH };
    expect(effectivePlan(s, NOW)).toBe("free");
  });
  it("null period end (lifetime) stays active", () => {
    const s: SubscriptionRecord = { plan: "family", status: "active", currentPeriodEnd: null };
    expect(effectivePlan(s, NOW)).toBe("family");
  });
});

describe("memberEffectivePlan", () => {
  it("inherits family from an active family owner", () => {
    const owner: SubscriptionRecord = { plan: "family", status: "active", currentPeriodEnd: NOW + MONTH };
    expect(memberEffectivePlan("free", owner, NOW)).toBe("family");
  });
  it("falls back to own plan if the family lapsed", () => {
    const owner: SubscriptionRecord = { plan: "family", status: "active", currentPeriodEnd: NOW - 1 };
    expect(memberEffectivePlan("premium", owner, NOW)).toBe("premium");
  });
});

describe("gift codes", () => {
  it("generates NOOR-XXXX-XXXX without ambiguous chars", () => {
    const code = generateGiftCode(() => 0.5);
    expect(code).toMatch(/^NOOR-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/);
  });
  it("normalizes user input", () => {
    expect(normalizeGiftCode("  noor-ab12-cd34 ")).toBe("NOOR-AB12-CD34");
  });
});

describe("validateGift", () => {
  const base: GiftCardRecord = { code: "NOOR-AB12-CD34", plan: "premium", months: 3, status: "UNREDEEMED" };
  it("accepts a fresh card", () => {
    expect(validateGift(base, NOW)).toEqual({ ok: true });
  });
  it("rejects an already-redeemed card", () => {
    expect(validateGift({ ...base, status: "REDEEMED" }, NOW)).toEqual({ ok: false, reason: "already-redeemed" });
  });
  it("rejects an expired redemption window", () => {
    expect(validateGift({ ...base, expiresAt: NOW - 1 }, NOW)).toEqual({ ok: false, reason: "expired" });
  });
  it("rejects invalid months", () => {
    expect(validateGift({ ...base, months: 0 }, NOW)).toEqual({ ok: false, reason: "invalid-months" });
  });
});

describe("extendPeriod", () => {
  it("starts from now when there is no active period", () => {
    expect(extendPeriod(null, 1, NOW)).toBe(NOW + MONTH);
    expect(extendPeriod(NOW - 1, 1, NOW)).toBe(NOW + MONTH); // lapsed → from now
  });
  it("stacks on top of a future period", () => {
    expect(extendPeriod(NOW + MONTH, 2, NOW)).toBe(NOW + 3 * MONTH);
  });
});

describe("redeemGift", () => {
  const card: GiftCardRecord = { code: "NOOR-AB12-CD34", plan: "premium", months: 3, status: "UNREDEEMED" };

  it("new user redeeming premium gift → premium for 3 months", () => {
    const r = redeemGift(card, null, NOW);
    expect(r).toEqual({ ok: true, newPlan: "premium", newPeriodEnd: NOW + 3 * MONTH });
  });
  it("stacks onto an existing premium subscription", () => {
    const current: SubscriptionRecord = { plan: "premium", status: "active", currentPeriodEnd: NOW + MONTH };
    const r = redeemGift(card, current, NOW);
    expect(r).toEqual({ ok: true, newPlan: "premium", newPeriodEnd: NOW + 4 * MONTH });
  });
  it("a family gift upgrades a premium user to family", () => {
    const familyCard: GiftCardRecord = { ...card, plan: "family" };
    const current: SubscriptionRecord = { plan: "premium", status: "active", currentPeriodEnd: NOW + MONTH };
    const r = redeemGift(familyCard, current, NOW);
    expect(r.ok && r.newPlan).toBe("family");
  });
  it("refuses an already-redeemed card", () => {
    const r = redeemGift({ ...card, status: "REDEEMED" }, null, NOW);
    expect(r).toEqual({ ok: false, reason: "already-redeemed" });
  });
});
