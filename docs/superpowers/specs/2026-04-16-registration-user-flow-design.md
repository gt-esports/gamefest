# Registration User Flow Redesign

**Date:** 2026-04-16  
**Status:** Approved

## Problem

The current registration flow sends unauthenticated users from the "REGISTER NOW" CTA to `/register`, which then shows a login prompt. After OAuth, the user lands on `/profile` — not back on the registration form. They must navigate back to `/register` to complete registration. This is a broken loop that creates unnecessary friction.

## Goal

Make the user journey from first visit to event registration as seamless as possible:

1. User sees a clear CTA to register for the event
2. CTA triggers Discord OAuth if not logged in
3. After login, user lands on `/profile` — the hub for their event status
4. Profile page makes the event registration action obvious and immediate
5. User clicks through to `/register` and completes the form

## User Flow

```
Landing on /home
    ↓
Click "REGISTER NOW" hero CTA (or "ATTEND" / "LOGIN" in navbar)
    ↓
[Unauthenticated?]
    → signInWithDiscord() → Discord OAuth → /auth/callback → /profile
[Already authenticated?]
    → /profile directly
    ↓
/profile — Registration Status card
    [Not registered] → Prominent "REGISTER NOW" button → /register
    [Already registered] → Shows confirmation details, no further action
    ↓
/register — Registration form (user is authenticated, form renders immediately)
    ↓
Submit form → Success card with "VIEW PROFILE" → /profile
```

## Design Sections

### 1. Navbar

| Auth State | Nav Links | Right Side |
|---|---|---|
| Unauthenticated | HOME · ABOUT · ATTEND | `LOGIN` button |
| Authenticated | HOME · ABOUT · ATTEND | `UserButton` (avatar + logout) |

- **`ATTEND` (unauthenticated):** calls `signInWithDiscord()` → OAuth → `/profile`
- **`ATTEND` (authenticated):** navigates to `/profile`
- **`LOGIN` button:** calls `signInWithDiscord()` → OAuth → `/profile`
- The existing `REGISTER` nav link is removed and replaced with `ATTEND`
- Rationale for "ATTEND": distinguishes event attendance from account registration, which "REGISTER" conflated

### 2. Home Page Hero CTA

- Button label: **`REGISTER NOW`** (explicit about event registration, matches existing brand)
- Unauthenticated: calls `signInWithDiscord()` → OAuth → `/profile`
- Authenticated: navigates to `/profile`
- Replaces the current hardwired link to `/register`

### 3. Profile Page (`/profile`) — Registration CTA

The existing Registration Status card is kept but made more prominent as the primary action for unregistered users.

- **Unregistered state:**
  - Headline: *"You're not registered yet"*
  - Short supporting copy providing context
  - Large primary `REGISTER NOW` button → `/register`
- **Registered state:**
  - Confirmation details (name, admission type, etc.)
  - Success visual — no further action needed

### 4. Registration Page (`/register`) — Cleanup

- No structural changes to the form itself
- The login-gate state (showing a `LOGIN WITH DISCORD` button) is kept as a **safety fallback** for users who navigate directly to `/register` via URL without being authenticated
- After successful registration, the existing success card with `VIEW PROFILE` → `/profile` remains unchanged

## Files to Change

| File | Change |
|---|---|
| `src/components/Navbar.tsx` | Replace `REGISTER` link with `ATTEND`; add `LOGIN` button for unauthenticated users that calls `signInWithDiscord()` |
| `src/pages/Home.tsx` | Change hero CTA from link to `/register` → calls `signInWithDiscord()` if unauth'd, navigates to `/profile` if auth'd |
| `src/pages/UserProfilePage.tsx` | Strengthen registration status card for unregistered state — clearer headline, supporting copy, prominent CTA |
| `src/pages/RegistrationPage.tsx` | No changes required (login fallback stays as-is) |

## What Does Not Change

- The registration form fields, validation, and submission logic at `/register`
- The `AuthCallback` redirect to `/profile` after OAuth (already correct)
- The `ProfileCompletionGate` flow (first-time login name prompt)
- The `UserButton` behavior for authenticated users
- Post-registration success card and `VIEW PROFILE` link
