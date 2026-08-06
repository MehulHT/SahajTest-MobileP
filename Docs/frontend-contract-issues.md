# Frontend Contract Issues Register

This register tracks known backend-contract discrepancies. The frontend must not work around them with invented DTOs or endpoint behavior. **OpenAPI generation is BLOCKED BY UPSTREAM TOOL COMPATIBILITY:** stable `openapi-typescript` 7.13.0 supports TypeScript `^5.x`, while this project uses TypeScript 6.0.3. No forced peer resolution or TypeScript downgrade was used. Generated types will be added only after a stable TypeScript-6-compatible release or separately approved generator.

## CI-01 — Academics / `GET /academics/versions/`
Schema: POST only. Handoff: list GET. Impact: no safe integration. Severity: **BLOCKING**. Required: canonical operation/schema. Blocks: onboarding.

## CI-02 — Learner academic profile
Resolved - Backend Batch A.1 finalization, merged develop commit `df75e4dadf92f0803b7179208336aacca42a43e5`. `GET /api/v1/learner/academic-profile/` returns the explicit `LearnerAcademicProfile` schema; the handoff identifies this canonical endpoint. Evidence: merged OpenAPI `LearnerAcademicProfile` and handoff section 2.2.7. Former impact: no typed profile response. Unblocked: academic-profile contract typing; the profile remains non-blocking for Phase 1 routing.
## CI-03 — Academic profile route
Resolved - Backend Batch A.1 finalization, merged develop commit `df75e4dadf92f0803b7179208336aacca42a43e5`. Schema and handoff expose only `/api/v1/learner/academic-profile/`; `/api/v1/auth/learner/academic-profile/` is absent. Evidence: merged OpenAPI paths and handoff section 2.2.7. Unblocked: canonical learner-profile route selection.
## CI-04 — Multi-target learner collection
Schema: no collection. Handoff: multi-exam intent. Impact: cannot model targets. Severity: **BLOCKING**. Required: collection contract. Blocks: multi-exam onboarding.

## CI-05 — Public registration roles
Resolved - Backend Batch A.1 finalization, merged develop commit `df75e4dadf92f0803b7179208336aacca42a43e5`. `UserRegistrationRequest` explicitly excludes server-assigned `id` and requires only `username`, `email`, and `password`. `UserRegistrationRequestRoleEnum` permits only `STUDENT`, `TEACHER`, and `PROFESSIONAL`; the handoff states `ADMIN` is rejected with HTTP 400. `RegistrationResponse` remains typed as `user` plus `tokens`. Evidence: `POST /api/v1/auth/register/`, request/response schemas, and handoff sections 2.1-2.2.1. Unblocked: public registration typing.
## CI-06 — Active academic context
Schema/handoff: feed, practice search, mastery, analytics behavior not explicit. Impact: context cannot be applied consistently. Severity: **BLOCKING**. Required: active-context rules. Blocks: Student Core.

## CI-07 — Subject taxonomy
Schema: BIOLOGY. Handoff: BOTANY and ZOOLOGY. Impact: inaccurate filters. Severity: **IMPORTANT**. Required: canonical taxonomy. Blocks: accurate practice filters.

## CI-08 — Difficulty enum
Schema: includes EXTREME. Handoff: fewer values. Impact: final labels unclear. Severity: **LOW**. Required: enum clarification. Blocks: final filter labels only.

## CI-09 — Error classification enum
Schema: SILLY_MISTAKE, TIME_OUT, OTHER. Handoff: READING, TIME_MANAGEMENT, GUESS. Impact: telemetry UX mismatch. Severity: **IMPORTANT**. Required: canonical enum. Blocks: telemetry UX.

## CI-10 — Learner question options
Schema: options not structurally typed. Handoff: question behavior. Impact: cannot render safely. Severity: **BLOCKING**. Required: option schema. Blocks: Practice solving.

## CI-11 — Practice submission
Schema: `selected_option_id` despite broad question types. Handoff: broad type support. Impact: cannot submit non-single choice. Severity: **BLOCKING**. Required: type-specific payloads. Blocks: non-single-choice practice.

## CI-12 — Practice attempt response
Schema and handoff: response shapes differ. Impact: no stable feedback adapter. Severity: **IMPORTANT**. Required: canonical response. Blocks: stable feedback adapter.

## CI-13 — Paper catalogue filters
Schema and handoff: filters and curriculum-version ID type conflict. Impact: discovery query unsafe. Severity: **BLOCKING**. Required: canonical filters/types. Blocks: Paper discovery.

## CI-14 — Paper list pagination
Schema and handoff: pagination and response shape conflict. Impact: list integration unsafe. Severity: **BLOCKING**. Required: canonical pagination schema. Blocks: Paper discovery.

## CI-15 — Start attempt
Schema and handoff: response differs. Impact: bootstrap unavailable. Severity: **BLOCKING**. Required: canonical start response. Blocks: Test engine bootstrap.

## CI-16 — Save response
Schema: generic payload. Handoff: documented fields conflict. Impact: mutation unsafe. Severity: **BLOCKING**. Required: typed payload. Blocks: Test engine.

## CI-17 — Clear response
Schema/handoff: POST versus DELETE. Impact: method ambiguity. Severity: **IMPORTANT**. Required: canonical method. Blocks: Test engine.

## CI-18 — Delivery/result/solution enums
Schema and handoff: conflict. Impact: state/disclosure logic unsafe. Severity: **BLOCKING**. Required: canonical enums. Blocks: Test state and solution disclosure logic.

## CI-19 — Active-attempt list
Schema: no response schema. Handoff: resume behavior. Impact: cannot type resume UI. Severity: **BLOCKING**. Required: list schema. Blocks: Resume UI.

## CI-20 — Live attempt
Schema: questions/settings/progress generic objects; some identifier types unsafe. Handoff: richer behavior. Impact: engine cannot safely consume state. Severity: **BLOCKING**. Required: typed live-attempt contract. Blocks: Test engine.

## CI-21 — Attempt mutations
Schema: mutation responses incomplete. Handoff: reconciliation needs data. Impact: unreliable reconciliation. Severity: **BLOCKING**. Required: complete responses. Blocks: reliable test reconciliation.

## CI-22 — Idempotency
Schema/handoff: no contract for non-idempotent attempt operations. Impact: retries unsafe. Severity: **IMPORTANT**. Required: idempotency agreement. Blocks: safe retries in Practice and Tests.

## CI-23 — Logout/revocation
Resolved - Backend Batch A.1 finalization, merged develop commit `df75e4dadf92f0803b7179208336aacca42a43e5`. `POST /api/v1/auth/logout/` requires bearer authentication and `Logout.refresh`, then blacklists the submitted refresh token; `LogoutSuccessResponse` is typed. Refresh request/response typing is finalized as `TokenRefreshRequest` (`refresh`) and `TokenRefreshResponse` (`access`); rotation is disabled and no new refresh token is returned. The handoff confirms already-issued access tokens remain valid for their 60-minute lifetime and logout is single-device revocation. Evidence: merged schema paths/components and handoff sections 2.2.3 and 2.2.5. Unblocked: refresh-token revocation and server-side logout hardening.
## CI-24 — Teacher capabilities
Schema/handoff: authoring permissions/capabilities absent. Impact: UI cannot be gated correctly. Severity: **BLOCKING**. Required: capability contract. Blocks: Teacher workflows.

## CI-25 — Classrooms
Phase 2.3 artifacts: absent; backend Phase 2.4 is implementing them. Impact: no frontend contract. Severity: **IMPORTANT**. Required: regenerated schema and handoff. Blocks: Classroom frontend until schema/handoff regeneration.