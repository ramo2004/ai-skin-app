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
