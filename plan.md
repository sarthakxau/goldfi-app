═══════════════════════════════════════════════════
IMPLEMENTATION PLAN: Gift Gold Feature
═══════════════════════════════════════════════════

## 1. Requirements Analysis

**Goal:** Allow users to gift gold to others — either via direct wallet transfer (if recipient has an account) or via an email claim link (if they don't). Sender can track gift status.

**User Stories:**
- As a sender, I want to search for a recipient by email so I can send gold directly
- As a sender, I want to gift gold to someone who doesn't have an account, via email claim link
- As a sender, I want to pay for the gift via UPI or from my wallet balance
- As a sender, I want to see my sent gifts with their claim status and resend the link if needed
- As a receiver, I want to click a link, sign up, and claim my gold

**Two Flows:**
1. **Recipient exists** → Look up by email → Direct XAUT wallet-to-wallet transfer
2. **Recipient not found** → Dialog: "User not found, gift via email" → Payment → Email with claim link → Recipient signs up → Auto-receives gold

**Acceptance Criteria:**
- [ ] Recipient lookup by email against the `users` table
- [ ] "User not found" dialog with option to send via email
- [ ] Payment step: UPI (via Onmeta) or from XAUT wallet balance
- [ ] Direct wallet transfer for existing users
- [ ] Email with claim link for non-users
- [ ] Claim page: recipient signs up via Privy, gift auto-credited
- [ ] Sent gifts tab shows status (pending/claimed/unclaimed) with resend button
- [ ] Gift expiration after configurable period (e.g. 30 days)

───────────────────────────────────────────────────

## 2. Architecture Overview

```
FLOW 1: Recipient EXISTS
─────────────────────────
SendGiftPage → Email Input → API lookup → Found!
  → Payment (UPI or wallet balance)
  → XAUT transfer: sender wallet → recipient wallet (client-side via Privy)
  → Record gift in DB → Done (status: "claimed" immediately)

FLOW 2: Recipient DOES NOT EXIST
──────────────────────────────────
SendGiftPage → Email Input → API lookup → Not Found
  → Dialog: "Send via email?"
  → Payment (UPI or wallet balance)
  → XAUT transferred to treasury escrow (or held in sender wallet with approval)
  → Gift record created (status: "pending", with claim_token)
  → Email sent with claim link → /gift/claim/[token]
  → Recipient clicks link → Signs up via Privy → Gift auto-claimed
  → XAUT transferred from escrow to new user's wallet
```

───────────────────────────────────────────────────

## 3. Files to Create / Modify

| Action | File | Purpose |
|--------|------|---------|
| CREATE | Supabase `gifts` table (via SQL/dashboard) | New table for gift records |
| MODIFY | `src/lib/supabase.ts` | Add `DbGift` interface |
| CREATE | `src/services/giftService.ts` | Gift business logic (create, claim, expire, lookup) |
| CREATE | `src/services/emailService.ts` | Email sending via Resend SDK |
| CREATE | `src/app/api/gift/lookup/route.ts` | GET — look up recipient by email |
| CREATE | `src/app/api/gift/send/route.ts` | POST — create gift record + trigger email |
| CREATE | `src/app/api/gift/sent/route.ts` | GET — sender's gift history |
| CREATE | `src/app/api/gift/received/route.ts` | GET — recipient's received gifts |
| CREATE | `src/app/api/gift/claim/route.ts` | POST — claim a gift by token |
| CREATE | `src/app/api/gift/[id]/resend/route.ts` | POST — resend claim email |
| MODIFY | `src/app/(dashboard)/gift/send/page.tsx` | Full rewrite with two flows + payment |
| CREATE | `src/app/(dashboard)/gift/claim/[token]/page.tsx` | Claim page for recipients |
| CREATE | `src/hooks/useGiftSend.ts` | Client-side gift sending hook |
| CREATE | `src/components/Gift/RecipientLookup.tsx` | Recipient search input with lookup |
| CREATE | `src/components/Gift/UserNotFoundDialog.tsx` | "User not found" dialog |
| CREATE | `src/components/Gift/PaymentStep.tsx` | UPI or wallet payment step |
| CREATE | `src/components/Gift/GiftConfirmation.tsx` | Success screen after sending |
| MODIFY | `src/app/(dashboard)/gift/page.tsx` | Replace mock data with real API calls |
| MODIFY | `src/components/Gift/GiftListItem.tsx` | Add "Resend" button for unclaimed gifts |
| MODIFY | `src/types/index.ts` | Add new gift-related types |
| MODIFY | `src/lib/giftData.ts` | Replace mock helpers with real API integration |

───────────────────────────────────────────────────

## 4. Implementation Steps

### Step 1: Database — `gifts` table (Supabase)
**Files:** Supabase SQL migration, `src/lib/supabase.ts`, `src/types/index.ts`

Create the `gifts` table via Supabase SQL editor or migration:

```sql
CREATE TABLE gifts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_user_id  UUID NOT NULL REFERENCES users(id),

  recipient_email TEXT,
  recipient_name  TEXT,
  recipient_user_id UUID REFERENCES users(id),  -- NULL until claimed (non-user flow)

  xaut_amount     NUMERIC(18,6) NOT NULL,
  inr_amount      NUMERIC(18,2) NOT NULL,
  gold_price_inr  NUMERIC(18,2) NOT NULL,
  grams_amount    NUMERIC(18,6) NOT NULL,

  message         TEXT,
  occasion        TEXT NOT NULL,

  -- Status: pending → delivered → claimed | expired
  -- "pending"   = payment processing
  -- "delivered" = paid, XAUT in escrow or direct transfer done, email sent
  -- "claimed"   = recipient claimed the gift
  -- "expired"   = unclaimed after expiry
  status          TEXT NOT NULL DEFAULT 'pending',

  payment_method  TEXT,           -- 'wallet' | 'upi'
  escrow_tx_hash  TEXT,           -- Tx hash for escrow deposit (non-user flow)
  claim_tx_hash   TEXT,           -- Tx hash for final transfer to recipient
  claim_token     TEXT UNIQUE,    -- UUID token for claim link
  expires_at      TIMESTAMPTZ,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  delivered_at    TIMESTAMPTZ,
  claimed_at      TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_gifts_sender ON gifts(sender_user_id);
CREATE INDEX idx_gifts_recipient ON gifts(recipient_user_id);
CREATE INDEX idx_gifts_recipient_email ON gifts(recipient_email);
CREATE INDEX idx_gifts_status ON gifts(status);
CREATE INDEX idx_gifts_claim_token ON gifts(claim_token);
```

Add `DbGift` interface to `src/lib/supabase.ts` (following existing pattern with `DbUser`, `DbHolding`, etc.):

```typescript
export interface DbGift {
  id: string;
  sender_user_id: string;
  recipient_email: string | null;
  recipient_name: string | null;
  recipient_user_id: string | null;
  xaut_amount: number;
  inr_amount: number;
  gold_price_inr: number;
  grams_amount: number;
  message: string | null;
  occasion: string;
  status: 'pending' | 'delivered' | 'claimed' | 'expired';
  payment_method: string | null;
  escrow_tx_hash: string | null;
  claim_tx_hash: string | null;
  claim_token: string | null;
  expires_at: string | null;
  created_at: string;
  delivered_at: string | null;
  claimed_at: string | null;
}
```

Update `src/types/index.ts`:
- Add `GiftPaymentMethod = 'wallet' | 'upi'`
- Add `GiftLookupResult` type for recipient lookup response
- Add `GiftClaimPayload` type
- Extend `GiftTransaction` with new fields (`claimToken`, `paymentMethod`, `expiresAt`)

───────────────────────────────────────────────────

### Step 2: Email Service
**Files:** `src/services/emailService.ts`

- Install: `pnpm add resend`
- Add `RESEND_API_KEY` to env
- Create `emailService.ts` with:
  - `sendGiftNotification(recipientEmail, senderName, gramsAmount, occasion, claimUrl)` — sends a styled email with claim link
  - `resendGiftNotification(giftId)` — resend for unclaimed gifts
- Email template: simple HTML with gold branding, amount, occasion, CTA button linking to `/gift/claim/[token]`

───────────────────────────────────────────────────

### Step 3: Gift Service — Business Logic
**Files:** `src/services/giftService.ts`

All DB operations use Supabase client directly (`supabase.from('gifts')...`).

Core functions:

- `lookupRecipient(email: string)` → `{ found: boolean; user?: { id, walletAddress } }`
  - Query: `supabase.from('users').select('id, wallet_address, email').eq('email', email).single()`

- `createDirectGift(senderUserId, recipientUserId, data)` → Gift record
  - For existing users — gift is immediately "delivered"/"claimed"
  - `supabase.from('gifts').insert({...}).select().single()`
  - Update sender's holdings (decrement), recipient's holdings (increment)

- `createEscrowGift(senderUserId, data)` → Gift record + claimToken
  - For non-users — gold held in escrow (treasury wallet)
  - Generate UUID `claimToken`, set `expires_at` = now + 30 days
  - `supabase.from('gifts').insert({...}).select().single()`
  - Send email with claim link
  - status = "delivered"

- `claimGift(claimToken, claimerUserId)` → Gift record updated
  - `supabase.from('gifts').select('*').eq('claim_token', claimToken).single()`
  - Validate: not expired, not already claimed
  - Transfer XAUT from treasury to claimer's wallet
  - `supabase.from('gifts').update({ status: 'claimed', recipient_user_id, claimed_at }).eq('id', gift.id)`
  - Update claimer's holdings

- `getSentGifts(userId)` → Gift[]
  - `supabase.from('gifts').select('*').eq('sender_user_id', userId).order('created_at', { ascending: false })`

- `getReceivedGifts(userId)` → Gift[]
  - `supabase.from('gifts').select('*').eq('recipient_user_id', userId).order('created_at', { ascending: false })`

- `resendClaimEmail(giftId, senderUserId)` → success
  - Verify sender owns this gift, gift is unclaimed
  - Resend the email notification

- `expireUnclaimedGifts()` → cron/scheduled function
  - `supabase.from('gifts').select('*').eq('status', 'delivered').lt('expires_at', new Date().toISOString())`
  - Refund XAUT back to sender, update status to "expired"

───────────────────────────────────────────────────

### Step 4: API Routes
**Files:** `src/app/api/gift/*/route.ts`

All protected routes use `verifyAuth()` and return `ApiResponse<T>`.
All DB queries use `supabase.from('gifts')` / `supabase.from('users')`.

#### `GET /api/gift/lookup?email=user@example.com`
- Input: `email` query param
- Logic: `supabase.from('users').select('id, email').eq('email', email).single()`
- Response: `{ found: boolean, user?: { id, email } }`
- Note: Only return minimal user info — no wallet address exposed

#### `POST /api/gift/send`
- Input body:
  ```json
  {
    "recipientEmail": "user@example.com",
    "recipientFound": true,
    "recipientUserId": "uuid",
    "inrAmount": 1000,
    "gramsAmount": 0.14,
    "occasion": "Birthday",
    "message": "Happy Birthday!",
    "paymentMethod": "wallet",
    "txHash": "0x..."
  }
  ```
- Logic:
  - If `recipientFound` → `createDirectGift()`
  - If not found → `createEscrowGift()` (requires escrow tx hash)
- Response: `{ gift: Gift, claimUrl?: string }`

#### `GET /api/gift/sent`
- Returns sender's gift history sorted by date
- Each gift includes status for UI display

#### `GET /api/gift/received`
- Returns gifts received by the authenticated user

#### `POST /api/gift/claim`
- Input: `{ claimToken: string }`
- Protected route (user must be logged in)
- Logic: `giftService.claimGift(token, userId)`
- Response: `{ gift: Gift, txHash: string }`

#### `POST /api/gift/[id]/resend`
- Protected, sender-only
- Logic: `giftService.resendClaimEmail(id, userId)`
- Response: `{ success: true }`

───────────────────────────────────────────────────

### Step 5: Gift Sending Hook
**Files:** `src/hooks/useGiftSend.ts`

State machine-style hook (similar to `useSwap.ts`):

```typescript
type GiftStep =
  | 'input'           // Fill form
  | 'lookup'          // Looking up recipient
  | 'not-found'       // Show "not found" dialog
  | 'confirm'         // Review gift details
  | 'payment'         // UPI or wallet payment
  | 'approve'         // ERC20 approval (wallet flow)
  | 'transfer'        // Executing XAUT transfer
  | 'confirming'      // Waiting for blockchain confirmation
  | 'success'         // Done!
  | 'error';          // Something went wrong

Returns:
  - step, error
  - lookupRecipient(email) — triggers API lookup
  - lookupResult — { found, user? }
  - confirmGift() — move to payment
  - executeWalletTransfer(amount, toAddress) — for existing users
  - executeEscrowTransfer(amount) — for non-users (to treasury)
  - txHash, giftId
  - reset()
```

Key logic:
- **Wallet payment (existing user):** Client uses Privy embedded wallet to call XAUT `transfer()` directly to recipient's wallet address. Then calls `/api/gift/send` to record.
- **Wallet payment (non-user):** Client transfers XAUT to treasury wallet (escrow). Then calls `/api/gift/send` to record + trigger email.
- **UPI payment:** Redirect to Onmeta for INR → USDT → swap to XAUT → escrow. (This is more complex; could be Phase 2.)

For MVP, focus on **wallet balance** payment method only. UPI can be added later.

───────────────────────────────────────────────────

### Step 6: Send Gift Page Rewrite
**Files:** `src/app/(dashboard)/gift/send/page.tsx`, new components

Rewrite as a multi-step form:

**Step 1 — Recipient Input (current form mostly reused)**
- Recipient field: email input only (validated with `validationPatterns.email`)
- On blur/submit → call `lookupRecipient(email)`
- If found → show green badge "User found" → proceed to Step 2
- If not found → show `UserNotFoundDialog`:
  - "This person doesn't have a Bullion account yet."
  - "Gift via email — they'll receive a link to claim after signing up."
  - [Continue with email gift] button → proceed to Step 2 with `recipientFound: false`

**Step 2 — Gift Details (existing form)**
- Amount selector (existing `AmountSelector` component)
- Occasion pills (existing `OccasionPills` component)
- Personal message (existing textarea)
- Gift preview card (existing `GiftPreviewCard`)

**Step 3 — Payment**
- **From wallet balance:**
  - Show XAUT balance
  - "Send X grams from your wallet" button
  - Triggers ERC20 transfer via Privy
- **Via UPI (Phase 2):**
  - Show INR amount
  - Redirect to Onmeta payment → on success, proceed

**Step 4 — Confirmation**
- Success animation (checkmark + confetti-like)
- "Gift sent!" message
- If direct transfer → "Gold delivered to [email]"
- If email claim → "Claim link sent to [email]. They'll receive it once they sign up."
- [View Gifts] button → navigate to `/gift`

**New components needed:**
- `RecipientLookup.tsx` — Email input with inline lookup status
- `UserNotFoundDialog.tsx` — AnimatePresence modal with email gift option
- `PaymentStep.tsx` — Wallet balance display + send button
- `GiftConfirmation.tsx` — Success screen with animation

───────────────────────────────────────────────────

### Step 7: Claim Page
**Files:** `src/app/(dashboard)/gift/claim/[token]/page.tsx`

- Route: `/gift/claim/[token]`
- On mount:
  - If user is NOT logged in → show gift preview + "Sign up to claim" CTA → redirects to Privy login → after login, auto-redirects back to claim page
  - If user IS logged in → show gift preview + "Claim Gold" button
  - On click → POST `/api/gift/claim` with token → treasury sends XAUT to user's wallet
  - Success → "Gold added to your vault!" with animation
  - Error states: expired, already claimed, invalid token

───────────────────────────────────────────────────

### Step 8: Gift List Page — Replace Mock Data
**Files:** `src/app/(dashboard)/gift/page.tsx`, `src/components/Gift/GiftListItem.tsx`

- Replace `MOCK_SENT_GIFTS` / `MOCK_RECEIVED_GIFTS` with `authFetchJson('/api/gift/sent')` and `/api/gift/received`
- Add loading states with skeleton placeholders
- Add empty states ("No gifts sent yet" / "No gifts received yet")
- Add pull-to-refresh (or manual refresh button)
- `GiftListItem` for sent gifts with status "delivered" (unclaimed) → show "Resend Link" button
  - On click → POST `/api/gift/[id]/resend`
  - Show toast "Link resent!"

───────────────────────────────────────────────────

## 5. Step-by-Step Build Sequence

| # | Task | Dependencies | Est. Complexity |
|---|------|-------------|-----------------|
| 1 | Supabase `gifts` table + `DbGift` type | None | Low |
| 2 | Email service (`resend`) | None | Low |
| 3 | Gift service | Step 1 | Medium |
| 4 | API routes (all 6) | Steps 1-3 | Medium |
| 5 | `useGiftSend` hook | Step 4 | Medium |
| 6 | New send page components | None (UI only) | Medium |
| 7 | Rewrite send page | Steps 5-6 | High |
| 8 | Claim page | Steps 3-4 | Medium |
| 9 | Gift list page (real data) | Step 4 | Low |
| 10 | Resend link feature | Steps 4, 9 | Low |

───────────────────────────────────────────────────

## 6. Testing Strategy

**Manual Testing:**
- [ ] Lookup existing user by email → shows "User found"
- [ ] Lookup non-existent email → shows "Not found" dialog
- [ ] Send gift to existing user → XAUT transferred, gift appears in both users' lists
- [ ] Send gift to non-user → email sent with claim link, status shows "pending"
- [ ] Click claim link while logged out → prompted to sign up → gold claimed after login
- [ ] Click claim link while logged in → gold claimed immediately
- [ ] Resend link → email re-sent successfully
- [ ] Expired gift → shows "expired" status, XAUT refunded to sender
- [ ] Edge: send to self → should be blocked with error
- [ ] Edge: claim already-claimed gift → shows "already claimed" error
- [ ] Edge: claim expired gift → shows "expired" error
- [ ] Build passes: `pnpm build`

───────────────────────────────────────────────────

## 7. Risks & Unknowns

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Email delivery issues (spam, delays) | Medium | Use Resend (good deliverability), add "Resend" button |
| Escrow security — treasury holds XAUT for non-users | Low | Treasury already used for swaps; same security model |
| UPI payment integration complexity | High | **Defer to Phase 2** — MVP uses wallet balance only |
| Claim token brute-force guessing | Low | UUIDs are 128-bit, add rate limiting on claim endpoint |
| Gift expiration refund failures | Low | Add retry logic, admin dashboard for manual refund |
| XAUT price fluctuation between send and claim | Low | Gift is in grams/XAUT, not INR — recipient gets exact grams |

───────────────────────────────────────────────────

## 8. Environment Variables to Add

```env
RESEND_API_KEY=re_...          # Resend API key for emails
GIFT_EXPIRY_DAYS=30            # Days before unclaimed gift expires
NEXT_PUBLIC_APP_URL=https://...  # Base URL for claim links
```

───────────────────────────────────────────────────

## 9. Phase 2 (Future)

- UPI payment method for gift sending
- Phone number lookup (in addition to email)
- SMS notifications (Twilio) in addition to email
- Gift scheduling ("Send on Dec 25th")
- Gift card designs / themes per occasion
- Bulk gifting (send to multiple recipients)
- Gift claim expiry cron job (Vercel Cron or similar)
- Push notifications for gift received/claimed

═══════════════════════════════════════════════════
