# Subscription Backend — Build-Ready Scope (#2 & #7)

> **Why this is a doc, not a PR.** Real subscription *enforcement*, payments, and
> gift-card delivery cannot exist on the current app — auth is `localStorage`
> (anyone can edit it). They need a server that owns the truth: a database, real
> sessions, Stripe, and an email provider. None of that can be built-and-verified
> without your Stripe account, a provisioned DB, and live test transactions. This
> is the concrete plan + ready-to-use artifacts so the build is mechanical.

## What exists today (and stays as UX)
- `PremiumContext` derives `free | premium | family` from localStorage flags.
- `canAccess(tier)`, `UpgradeModal`, Library gating, promo codes.
- **Keep all of it as the optimistic UI** — but the server becomes the source of
  truth. The client reads the *real* plan from a session, not localStorage.

## Target architecture

```
Browser ──(httpOnly session cookie)──▶ Next.js API routes (server)
                                            │
                  ┌─────────────────────────┼───────────────────────────┐
                  ▼                         ▼                           ▼
          Postgres (Railway)          Stripe (payments)          Resend/Postmark (email)
          users, subscriptions,       Checkout, Billing Portal,  gift-card delivery,
          gift_cards, families        Webhooks (source of truth) receipts, welcome
```

- **Hosting:** you already run Postgres on Railway for NoorAcademie — reuse it.
- **Auth:** replace localStorage auth with **Auth.js (NextAuth v5)** — email+password
  (Credentials) or magic-link. Sessions in an httpOnly cookie (not readable by JS).
- **ORM:** Prisma (schema below).
- **Payments:** Stripe Checkout + Customer Portal + Webhooks.
- **Email:** Resend (simplest) or Postmark.

## Database schema (Prisma — ready to use)

See `prisma/schema.prisma` (committed alongside this doc). Tables:
- `User` — id, email, passwordHash, name, role, createdAt
- `Subscription` — userId, plan (FREE/PREMIUM/FAMILY), status, stripeCustomerId,
  stripeSubscriptionId, currentPeriodEnd
- `GiftCard` — code, plan, months, status (UNREDEEMED/REDEEMED), purchaserEmail,
  recipientEmail, redeemedByUserId, createdAt, redeemedAt
- `Family` — id, ownerUserId, name
- `FamilyMember` — familyId, userId, role (PARENT/CHILD)

## Server-side enforcement (the actual #2)

A single guard wraps every protected API route + server component:

```ts
// lib/requirePlan.ts  (sketch — needs DB + session wired)
export async function getServerPlan(): Promise<"free"|"premium"|"family"> {
  const session = await auth();                 // Auth.js
  if (!session?.user) return "free";
  const sub = await db.subscription.findUnique({ where: { userId: session.user.id } });
  if (!sub || sub.status !== "active") return "free";
  if (sub.currentPeriodEnd < new Date()) return "free";   // expired
  return sub.plan.toLowerCase() as any;
}

export async function requirePlan(tier: "premium"|"family") {
  const plan = await getServerPlan();
  const ok = tier === "premium" ? plan !== "free" : plan === "family";
  if (!ok) throw new Response("Upgrade required", { status: 403 });
  return plan;
}
```

Then:
- **Protected API routes** (`/api/library/[slug]/download`, AI-teacher endpoints,
  family routes) call `await requirePlan("premium")` first.
- **Restricted pages** (`/library/[slug]/print`, parent dashboard) check
  `getServerPlan()` in the server component and redirect/403 — this is what
  actually **prevents direct-URL access** (the client gate can't).
- Premium content (PDF bytes, course material) is served **through** these routes,
  never as a public static file.

## Payments — Stripe (the actual #7)

Routes to add:
- `POST /api/checkout` → creates a Stripe Checkout Session for the chosen plan
  (Premium/Family), returns the redirect URL.
- `GET /api/billing-portal` → Stripe Customer Portal (cancel/upgrade/payment method).
- `POST /api/stripe/webhook` → **the source of truth.** On
  `checkout.session.completed`, `customer.subscription.updated/deleted`, upsert the
  `Subscription` row. Verify the signature with `STRIPE_WEBHOOK_SECRET`.

The existing `/#pricing` "Choose plan" buttons call `/api/checkout` instead of
scrolling.

## Gift cards (real #7)

1. **Purchase:** `POST /api/gift/purchase` → Stripe Checkout (one-time) →
   webhook creates a `GiftCard` (random code) → **Resend emails the code** to the
   recipient with a redeem link `/redeem?code=...`.
2. **Redeem:** `POST /api/gift/redeem` → validate code (server), mark REDEEMED,
   create/extend the redeemer's `Subscription` by `months`. (The current
   client-side `/redeem` becomes a thin caller of this.)
3. **Family gift cards:** same flow, `plan = FAMILY`.
4. **Error/success states:** invalid/expired/already-redeemed handled server-side;
   email failures retried/logged.

## Family plan (real #2 family tier)

- Owner buys Family → can invite up to N members (`POST /api/family/invite` emails
  a join link).
- `FamilyMember` rows grant each member `family` plan via `getServerPlan()` (a
  member's plan = their family's plan).
- **Parent dashboard** (`/family`) — server component gated to PARENT role —
  shows each child's streak/accuracy/progress (read from their gamification rows,
  which also move server-side).

## Phased plan + effort (engineering days, rough)

| Phase | Scope | Est. |
|---|---|---|
| 0 | Provision: Railway Postgres DB, Stripe account (test mode), Resend key | you |
| 1 | Prisma + Auth.js (real signup/login, sessions) — migrate off localStorage | 2–3 d |
| 2 | `getServerPlan` + `requirePlan` guards on routes/pages; serve premium via routes | 2 d |
| 3 | Stripe Checkout + Customer Portal + Webhook (subscriptions) | 2–3 d |
| 4 | Gift cards: purchase → email → redeem (Stripe + Resend) | 2 d |
| 5 | Family: invites, members, parent dashboard | 2–3 d |
| 6 | Migration (preserve current users' progress), QA, test-mode → live | 1–2 d |

**~12–18 engineering days.** Cost: Railway Postgres (~$5–10/mo) + Stripe (2.9%+30¢
per txn, no monthly) + Resend (free up to 3k emails/mo).

## What I need from you to start building (Phase 0)
1. **Stripe account** (test keys: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`) +
   product/price IDs for Premium and Family.
2. **A Postgres database** (the Railway one is fine) → `DATABASE_URL`.
3. **Email provider** key (`RESEND_API_KEY`) + a verified sender domain.
4. **Decisions:** monthly vs. annual pricing; Family member cap (e.g. 6);
   email+password vs. magic-link login; price points (the doc assumes $9 / $19).

## Honest migration note
Moving auth off localStorage means **existing demo accounts and their localStorage
progress** (gamification, recordings, revision) won't automatically be real
accounts. Plan (Phase 6): on first real login, offer a one-time "import your
on-device progress" that uploads the localStorage JSON to the server. Recordings
(IndexedDB blobs) can stay on-device or upload opt-in.

---

**Bottom line:** the client-side tier UX is done and shipped. This backend is the
real security + revenue layer. It's fully specified here and mechanical to build —
it just needs the Phase-0 provisioning (Stripe/DB/email) that only you can set up.
Say the word and provide the keys, and I'll build it phase by phase.
