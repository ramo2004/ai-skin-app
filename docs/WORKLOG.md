# Worklog

## 2026-02-07

### Scope
- Stabilized Expo app build health.
- Fixed API contract parsing for GPT-backed face/product scans.
- Fixed TypeScript and lint blockers.

### Changes
- `tsconfig.json`
  - Switched `moduleResolution` to `bundler`.
  - Narrowed `include` to app-relevant sources.
- `package.json`
  - Updated `@types/react` to `~19.1.0` to resolve install/type conflicts.
- `env.d.ts`
  - Added `API_URL` typing for `@env` module.
- `app/config/firebaseConfig.ts`
  - Switched auth init to `getAuth(app)` for SDK compatibility.
- `app/services/classificationService.ts`
  - Fixed face-scan response parsing to handle backend nested payload.
  - Removed unreachable duplicate return.
  - Fixed missing `idToken` declaration in product scan flow.
- `app/navigation/AppNavigator.tsx`
  - Tightened `Results` route typings (`AcneType`, `confidence`).
- `app/screens/ResultsScreen.tsx`
  - Fixed param usage (`classification`, `confidence`) and label rendering.
- `app/screens/HistoryScreen.tsx`
  - Added missing `auth`/`db` imports.
- Minor JSX/text fixes for lint errors in:
  - `app/+not-found.tsx`
  - `app/screens/HomeScreen.tsx`
  - `app/screens/OnboardingScreen.tsx`
  - `app/screens/RoutineScreen.tsx`
- Replaced `JSX.Element` return annotations with `React.JSX.Element` where needed.

### Commands + Results
- `npm install` -> passed (warnings only).
- `npx tsc --noEmit` -> passed.
- `npm run -s lint` -> passed (warnings only, no errors).

### Outstanding
- Lint warnings remain (unused imports/vars and non-blocking style warnings).

### Second Pass Cleanup (2026-02-07)
- Removed unused imports/variables in multiple screens.
- Removed duplicate imports in `HomeScreen`.
- Fixed lint style warning for `IngredientResult` array type.
- Fixed React hook dependency warning in `components/HelloWave.tsx`.

#### Verification
- `npm run -s lint` -> passed with 0 warnings/errors.
- `npx tsc --noEmit` -> passed.

### Privacy + Reminders Upgrade (2026-02-07)
- Added daily local routine reminders (8:00 AM and 9:00 PM) using `expo-notifications`.
  - New service: `app/services/notificationService.ts`
  - New UI toggle: `app/screens/RoutineScreen.tsx`
- Added privacy-first scan history behavior:
  - New preference: save cloud scan images (`default: OFF`).
  - Preference controls whether images are uploaded to Firebase Storage.
  - History still logs metadata/classification even when image storage is disabled.
  - UI toggle added in `HistoryScreen`.
- Added history sharing/export via native share sheet from `HistoryScreen`.
- Improved history data consistency by saving both classification and confidence from face scans.

#### Verification
- `npm install` -> passed
- `npx tsc --noEmit` -> passed
- `npm run -s lint` -> passed

### Data Deletion Upgrade (2026-02-07)
- Added `Delete My Data` flow in `HistoryScreen` with destructive confirmation.
- Added `deleteAllUserData()` in `firebaseService`:
  - Deletes user profile doc (`users/{uid}`)
  - Deletes user scan docs (`scans` where `userId == uid`) in batched writes
  - Deletes stored scan images under `images/{uid}` in Firebase Storage
  - Clears local cloud-image preference

#### Verification
- `npx tsc --noEmit` -> passed
- `npm run -s lint` -> passed
