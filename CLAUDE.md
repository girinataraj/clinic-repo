# SAAI Physiotherapy - Development Rules

## Project

This is the SAAI Physiotherapy Clinic mobile application.

Frontend:
- React
- TypeScript
- Vite
- Tailwind CSS
- Capacitor
- Android

Backend:
- Node.js
- Express
- PostgreSQL

The application is primarily used as an Android mobile application.
The web version is also maintained.

---

# CRITICAL MOBILE REQUIREMENT

The minimum supported mobile viewport is:

320 x 689 px

All UI changes MUST be tested against:

- 320 x 689
- 360 x 800
- 390 x 844
- 412 x 915

Never assume that a layout working at 390px works at 320px.

---

# Android Safe Areas

The application must NEVER allow application content to overlap:

- Android status bar
- notification icons
- camera cutouts
- Android navigation area
- gesture navigation area

Always account for:

- safe-area-inset-top
- safe-area-inset-bottom

Bottom action buttons must remain above Android's gesture/navigation area.

Do NOT hide or interfere with Android swipe gestures.

---

# UI RULES

Before modifying UI:

1. Inspect the existing component.
2. Identify its parent layout.
3. Identify scroll containers.
4. Identify fixed/sticky elements.
5. Check for horizontal overflow.
6. Check for button overlap.
7. Check safe-area handling.

Never solve an overlap by blindly adding arbitrary margins.

---

# MOBILE WIDTH

At 320px:

- No page-level horizontal scrolling.
- Text must wrap naturally.
- Buttons must remain inside viewport.
- Inputs must not overflow.
- Cards must not exceed viewport width.
- Icons must not overlap text.
- Fixed/sticky elements must not cover content.

Horizontal scrolling is allowed ONLY for genuinely wide clinical tables.

---

# BUTTONS

Minimum touch target:

48px.

Never place fixed buttons over scrollable content without reserving equivalent bottom space.

For bottom action bars:

- account for Android safe area
- account for BottomNav if present
- account for keyboard
- ensure final content can scroll above the action bar

---

# CLINICAL FORMS

Clinical workflows are high priority.

Never break:

- patient information
- assessment steps
- ROM
- muscle power
- neurological examination
- cardiovascular examination
- treatment plan
- payment
- finalization
- PDF generation

Before changing clinical components, understand their data flow.

---

# PDF

PDF generation is a critical feature.

Whenever PDF generation is changed:

1. Test local backend.
2. Test production backend.
3. Verify images are embedded.
4. Verify filename.
5. Verify patient information.
6. Verify clinical tables.
7. Verify footer.
8. Verify PDF page count.

Never assume local PDF generation means production PDF generation works.

---

# BACKEND / PRODUCTION

Production API:

https://clinic-backend-sjro.onrender.com/api

The Render deployment may require manual triggering.

Do NOT claim production deployment is complete unless it has actually been verified.

A Render response such as:

Route not found: GET /

does NOT automatically mean the API is broken.
Verify the actual API endpoints.

---

# AUTHENTICATION

The user must remain logged in when:

- app is closed
- app is reopened
- app is swiped away

The user should be logged out ONLY when explicitly selecting Logout or when the authentication session is genuinely invalid.

Do not replace native persistent storage with localStorage for authentication tokens.

---

# BEFORE FINISHING ANY TASK

Run appropriate verification.

For frontend changes:

npm run build

For Capacitor changes:

npx cap sync android

For Android changes:

cd android
./gradlew assembleDebug

For UI changes:

Perform mobile viewport testing.

---

# IMPORTANT

Never report PASS merely because the code compiles.

Distinguish:

BUILD PASS
from
UI TEST PASS
from
REAL DEVICE PASS.

---

# GIT

Before committing:

- inspect git diff
- inspect changed files
- run relevant tests
- never commit secrets
- never commit keystores
- never commit .env credentials

Never push automatically unless explicitly requested.

---

# DEVELOPMENT BEHAVIOR

Do not make broad UI rewrites without first auditing the existing design.

Prefer fixing the root cause over adding compensating CSS.

When multiple independent issues exist, group them logically and test each one.

If a task involves multiple screens, perform an application-wide audit rather than fixing only the screenshot provided.