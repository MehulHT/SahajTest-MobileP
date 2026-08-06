# SahajTest Mobile

SahajTest Mobile is an Expo SDK 57 application. It is currently at **Frontend Phase 0: Foundation and Contract Harness**. This repository contains only the application foundation: stack route boundaries, visual design-system primitives, public environment validation, a generic unauthenticated Fetch client, linting, and unit-test infrastructure. Product workflows are not implemented.

## Prerequisites

Use the repository-pinned Node/npm toolchain and Node 24+ with npm 11+ for local work. Install dependencies with `npm install`.

## Environment configuration

Copy `.env.example` to `.env` and set the public development value:

```text
EXPO_PUBLIC_API_URL=http://10.0.2.2:8000/api/v1
```

`10.0.2.2` is the Android emulator alias for the host machine. `EXPO_PUBLIC_*` values are embedded in the client application: never put secrets in them. The application validates that the URL is absolute HTTP(S), removes trailing slashes, and requires HTTPS in production. There is intentionally no production fallback URL.

## Development and verification

Start Metro for the existing development client with:

```bash
npx expo start --dev-client
```

Other checks:

```bash
npm run typecheck
npm run lint
npm run test:ci
npx expo export --platform android
npx expo export --platform web
```

The Android/iOS commands retain the existing development-client workflow. No native prebuild or EAS build is required for this Phase 0 foundation.

## Router and design system

The public route is intentionally a minimal Phase 0 verification screen. `(onboarding)`, `(protected)`, and `(workflow)` are Stack boundaries closed through Expo Router protected routes; they do not model authentication or product state. The design system exposes only `AppText`, `Surface`, `Screen`, and `Button`, using the SahajTest v1 system color scheme and typography roles.

## Backend contract status

`Docs/schema.yml` remains the machine-readable backend reference and `Docs/frontend-api-handoff.md` remains the human integration handoff. Known discrepancies are tracked in [the Contract Issues Register](Docs/frontend-contract-issues.md). No domain endpoint wrappers or response DTOs are created until those discrepancies are resolved.

### OpenAPI generation: deferred

**BLOCKED BY UPSTREAM TOOL COMPATIBILITY.** Stable `openapi-typescript` 7.13.0 declares a TypeScript `^5.x` peer dependency, while this project uses TypeScript 6.0.3. Contract generation, generated API types, freshness scripts, and the freshness test are deliberately deferred. No forced peer resolution, TypeScript downgrade, placeholder output, or substitute generator was used. Revisit this once a stable TypeScript-6-compatible release is available or a separate generator decision is approved.