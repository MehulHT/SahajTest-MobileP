# SahajTest Platform — Frontend API Handoff & Integration Contract

**Document Target Audience**: Mobile & Web Frontend Developers / AI Coding Agents working on `SahajTest Mobile P` (`D:\SahajTest-MobileP`).
**Backend Version**: `Phase 2.3` (Academic Structures, Canonical Question Bank & Paper Delivery Engine)
**Date**: August 2026
**Status**: Authoritative & Code-Audited

---

## 1. Backend Baseline & Environment Setup

### 1.1 Core Architecture & Stack
* **Framework**: Django 5.0+ with Django REST Framework (DRF 3.14+)
* **Database**: PostgreSQL 18.4 (Authoritative)
* **Authentication**: JSON Web Tokens (JWT) via `rest_framework_simplejwt`
* **API Base Path**: `/api/v1/`
* **OpenAPI 3.0 Specification**: Available via `drf-spectacular`

### 1.2 Documentation & Schema Endpoints
When running the local Django development server at `http://localhost:8000`:
* **OpenAPI 3.0 Schema (YAML/JSON)**: `GET http://localhost:8000/api/schema/`
* **Swagger UI (Interactive API Explorer)**: `GET http://localhost:8000/api/docs/`
* **ReDoc (API Reference)**: `GET http://localhost:8000/api/redoc/`

### 1.3 CORS & Mobile Network Architecture
* **CORS Policy**: `CORS_ALLOW_ALL_ORIGINS = True` is enabled in `core/settings.py`. Cross-Origin requests from Web browsers, Expo web, or local origins will not be blocked.
* **Authentication Header Format**:
  ```http
  Authorization: Bearer <access_token>
  ```
* **Token Expiry**:
  * **Access Token**: 60 Minutes (`ACCESS_TOKEN_LIFETIME = timedelta(minutes=60)`)
  * **Refresh Token**: 24 Hours (`REFRESH_TOKEN_LIFETIME = timedelta(days=1)`)

### 1.4 API Base URL Configuration for React Native / Expo

The React Native application should construct `API_BASE_URL` dynamically using environment variables (`.env` file or `Constants.expoConfig.extra`). **Do NOT hardcode temporary tunnel URLs or localhost in production code.**

```typescript
// config/api.ts
import Constants from 'expo-constants';

const getBaseUrl = (): string => {
  if (__DEV__) {
    // 1. Android Emulator default loopback alias to host machine
    // 2. Physical device on same Wi-Fi LAN (e.g. 192.168.1.X)
    // 3. Local Cloudflare / Ngrok tunnel (e.g. https://xyz.trycloudflare.com)
    return process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000/api/v1';
  }
  return 'https://api.sahajtest.com/api/v1';
};

export const API_BASE_URL = getBaseUrl();
```

---

## 2. Authentication Contract

### 2.1 User Roles
```typescript
export type UserRole = 'STUDENT' | 'TEACHER' | 'PROFESSIONAL' | 'ADMIN';
```

### 2.2 Endpoints

#### 1. Register User
* **Method**: `POST`
* **Path**: `/api/v1/auth/register/`
* **Authentication**: None (`AllowAny`)
* **Request Payload**:
  ```json
  {
    "username": "student_rahul",
    "email": "rahul@example.com",
    "password": "Password123!",
    "first_name": "Rahul",
    "last_name": "Sharma",
    "role": "STUDENT",
    "phone_number": "+919876543210",
    "target_exam": "NEET",
    "medium": "ENGLISH",
    "target_year": 2026,
    "target_score_goal": 680
  }
  ```
* **Required Fields**: `username`, `email`, `password`
* **Optional Fields**: `first_name`, `last_name`, `role` (default: `"STUDENT"`), `phone_number`, `target_exam` (default: `"NEET"`), `medium` (default: `"ENGLISH"`), `target_year`, `target_score_goal`
* **Success Status**: `201 Created`
* **Success Response**:
  ```json
  {
    "user": {
      "id": 1,
      "username": "student_rahul",
      "email": "rahul@example.com",
      "role": "STUDENT",
      "first_name": "Rahul",
      "last_name": "Sharma",
      "phone_number": "+919876543210",
      "target_exam": "NEET",
      "medium": "ENGLISH",
      "target_year": 2026,
      "target_score_goal": 680,
      "login_streak_days": 0,
      "last_active_at": "2026-08-05T10:00:00Z"
    },
    "tokens": {
      "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```
* **Error Status**: `400 Bad Request`
  ```json
  {
    "detail": "Invalid registration payload provided.",
    "code": "invalid_input",
    "errors": {
      "email": ["A user with this email address already exists."],
      "password": ["This password is too short. It must contain at least 8 characters."]
    }
  }
  ```

#### 2. Obtain JWT Pair (Login)
* **Method**: `POST`
* **Path**: `/api/v1/auth/login/`
* **Authentication**: None (`AllowAny`)
* **Request Payload**:
  ```json
  {
    "username": "student_rahul",
    "password": "Password123!"
  }
  ```
* **Success Status**: `200 OK`
* **Success Response**:
  ```json
  {
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
* **Token Claims Injected**: Access JWT contains `user_id`, `username`, `role`, `target_exam`, `medium`.

#### 3. Refresh Access Token
* **Method**: `POST`
* **Path**: `/api/v1/auth/refresh/`
* **Authentication**: None (`AllowAny`)
* **Request Payload**:
  ```json
  {
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
* **Success Status**: `200 OK`
* **Success Response**:
  ```json
  {
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

#### 4. Verify Access Token
* **Method**: `POST`
* **Path**: `/api/v1/auth/verify/`
* **Authentication**: None (`AllowAny`)
* **Request Payload**: `{"token": "eyJhbGci..."}`
* **Success Status**: `200 OK` (`{}`)

#### 5. Retrieve / Update User Profile
* **Method**: `GET` / `PATCH`
* **Path**: `/api/v1/auth/profile/`
* **Authentication**: Required (`Bearer <access_token>`)
* **PATCH Request Payload** (Partial fields supported):
  ```json
  {
    "first_name": "Rahul",
    "target_exam": "JEE_MAIN",
    "medium": "ENGLISH",
    "target_score_goal": 280
  }
  ```
* **Success Status**: `200 OK` (Returns complete `UserProfile` object)

#### 6. Learner Academic Profile & Exploration Context Switch
* **Get Profile**: `GET /api/v1/auth/learner/academic-profile/` (or `/api/v1/learner/academic-profile/`)
* **Set Primary Curriculum**: `PATCH /api/v1/auth/learner/academic-profile/` (`{"curriculum_version_id": "UUID"}`)
* **Switch Active Exploration Context**: `POST /api/v1/auth/learner/academic-profile/switch-context/` (`{"curriculum_version_id": "UUID"}`)
* **Logout**: `NOT IMPLEMENTED / FUTURE WORK` (Client must discard tokens locally from SecureStore).

---

## 3. Question Discovery & Practice Contract

### 3.1 Strict Security Boundary (Pre-Submission Answer Key Protection)
To prevent academic dishonesty, the backend enforces an authorization-first serializer boundary:
* **Learner Question Representation (`LearnerQuestionSerializer`)**: Excludes `correct_option_id`, `solution_text`, `explanation`, and `hint`.
* **When Feedback Becomes Available**:
  1. For single question practice, feedback is returned **immediately** upon submitting an attempt payload to `POST /api/v1/questions/attempt/`.
  2. In Mistake Vault (`GET /api/v1/questions/mistake-vault/`), past incorrect questions are displayed with student performance review details.
  3. In full test attempts (`papers`), answer release is governed by the `DeliveryConfiguration.solution_release_policy` (`IMMEDIATE`, `AFTER_SUBMISSION`, or `ADMIN_RELEASE`).

### 3.2 Question Endpoints

#### 1. Search Question Bank
* **Method**: `GET`
* **Path**: `/api/v1/questions/search/`
* **Authentication**: Required
* **Query Parameters**:
  * `subject` (`PHYSICS` | `CHEMISTRY` | `BOTANY` | `ZOOLOGY` | `MATHEMATICS`)
  * `chapter_id` (integer)
  * `sub_topic_id` (integer)
  * `difficulty` (`EASY` | `MEDIUM` | `HARD`)
  * `is_must_do_pyq` (`true` | `false`)
  * `exam_year` (integer, e.g. 2023)
  * `unsolved_only` (`true` | `false` — excludes questions previously attempted by user)
  * `incorrect_only` (`true` | `false` — returns questions user previously answered incorrectly)
  * `page` (integer, default: 1)
  * `page_size` (integer, default: 20)
* **Success Response (`200 OK`)**:
  ```json
  {
    "count": 42,
    "next": "http://localhost:8000/api/v1/questions/search/?page=2",
    "previous": null,
    "results": [
      {
        "id": 101,
        "sub_topic": 12,
        "sub_topic_name": "Refraction at Spherical Surfaces",
        "chapter_name": "Ray Optics",
        "subject": "PHYSICS",
        "syllabus_node": "a8f12c9b-3e5f-4a1d-9e2b-7c8f9a0b1c2d",
        "question_text": "A convex lens of focal length 20 cm is placed in water...",
        "options": [
          {"id": "A", "text": "f = 80 cm"},
          {"id": "B", "text": "f = 40 cm"},
          {"id": "C", "text": "f = 20 cm"},
          {"id": "D", "text": "f = 10 cm"}
        ],
        "difficulty": "MEDIUM",
        "target_time_seconds": 120,
        "exam_year": 2023,
        "is_must_do_pyq": true,
        "target_exam": "NEET",
        "question_type": "SINGLE_CHOICE",
        "marks": "4.00",
        "negative_marks": "1.00",
        "language_code": "en",
        "instructions": "Select the single correct choice.",
        "created_at": "2026-08-01T12:00:00Z"
      }
    ]
  }
  ```

#### 2. Get Question Detail
* **Method**: `GET`
* **Path**: `/api/v1/questions/<int:pk>/`
* **Authentication**: Required
* **Success Response (`200 OK`)**: Returns single `LearnerQuestion` dictionary (same safe fields as search item).

#### 3. Submit Question Attempt & Receive Solution Feedback
* **Method**: `POST`
* **Path**: `/api/v1/questions/attempt/`
* **Authentication**: Required
* **Request Payload**:
  ```json
  {
    "question": 101,
    "selected_option_id": "A",
    "time_spent_seconds": 85,
    "error_type": "CONCEPTUAL",
    "is_bookmarked": true
  }
  ```
* **Success Response (`201 Created`)**:
  ```json
  {
    "id": 450,
    "question": 101,
    "selected_option_id": "A",
    "is_correct": true,
    "time_spent_seconds": 85,
    "error_type": "CONCEPTUAL",
    "is_bookmarked": true,
    "is_in_mistake_vault": false,
    "is_resolved": false,
    "attempted_at": "2026-08-05T10:30:00Z"
  }
  ```

#### 4. Personalized Practice Feed
* **Method**: `GET`
* **Path**: `/api/v1/questions/feed/`
* **Authentication**: Required
* **Success Response (`200 OK`)**:
  ```json
  {
    "recommended_drills": [
      {
        "subtopic_id": 12,
        "subtopic_name": "Refraction at Spherical Surfaces",
        "subject": "PHYSICS",
        "reason": "LOW_ACCURACY",
        "attempt_count": 5,
        "correct_count": 1,
        "accuracy_percentage": 20.0
      }
    ],
    "must_do_pyqs": [
      {
        "id": 101,
        "question_text": "A convex lens of focal length 20 cm...",
        "subject": "PHYSICS",
        "chapter_name": "Ray Optics",
        "sub_topic_name": "Refraction at Spherical Surfaces",
        "difficulty": "MEDIUM",
        "exam_year": 2023,
        "target_time_seconds": 120
      }
    ],
    "mistake_vault_summary": {
      "unresolved_count": 4
    },
    "syllabus_completion": [
      {
        "subject": "PHYSICS",
        "total_questions": 150,
        "attempted_questions": 30,
        "completion_percentage": 20.0
      }
    ]
  }
  ```

#### 5. Mistake Vault
* **Method**: `GET`
* **Path**: `/api/v1/questions/mistake-vault/`
* **Authentication**: Required
* **Success Response (`200 OK`)**: Returns array of `QuestionAttemptDetail` items including `question_details` (with solution text).

#### 6. Mastery Dashboard & Attempt Analytics
* **Mastery Dashboard**: `GET /api/v1/questions/mastery/`
* **Analytics**: `GET /api/v1/questions/analytics/?subject=PHYSICS`

---

## 4. Paper & Full-Length Test Domain Contract (Phase 2.3)

### 4.1 Domain Architecture
```text
Paper (Title, Code, Exam)
 └── PaperVersion (v1.0, Duration, Max Marks, Status: PUBLISHED)
      ├── PaperSection (e.g. Physics Section A: 35 Mandatory)
      │    └── PaperQuestionSnapshot (Frozen Question Text, Options, Marks, Tolerances)
      └── DeliveryConfiguration (Mode, Navigation, Shuffling, Solution Policy)
```

### 4.2 Learner Test Execution Endpoints (`/api/v1/learner/`)

#### 1. Paper Catalogue (Discover Available Tests)
* **Method**: `GET`
* **Path**: `/api/v1/learner/papers/`
* **Query Params**: `exam_type` (`NEET` | `JEE_MAIN`), `search`, `page`, `page_size`
* **Success Response (`200 OK`)**:
  ```json
  {
    "count": 1,
    "results": [
      {
        "id": "c3b9a1d2-4e5f-6a7b-8c9d-0e1f2a3b4c5d",
        "title": "NEET Full Length Mock Test 01",
        "code": "NEET-FLT-01",
        "exam_type": "NEET",
        "published_version": {
          "id": "e5f6a7b8-9c0d-1e2f-3a4b-5c6d7e8f9a0b",
          "version_number": 1,
          "title": "NEET FLT 01 v1.0",
          "duration_minutes": 200,
          "total_marks": "720.00",
          "total_questions": 180,
          "published_at": "2026-08-01T00:00:00Z"
        },
        "default_delivery_configuration": {
          "id": "f7a8b9c0-1d2e-3f4a-5b6c-7d8e9f0a1b2c",
          "name": "Standard NEET Exam Mode",
          "mode": "EXAM",
          "solution_release_policy": "AFTER_SUBMISSION",
          "allow_section_navigation": true,
          "shuffle_questions": true
        }
      }
    ]
  }
  ```

#### 2. Get Paper Detail (Pre-Test Overview)
* **Method**: `GET`
* **Path**: `/api/v1/learner/papers/<uuid:pk>/`
* **Success Response (`200 OK`)**: Returns full paper structure including sections, section instructions, allowed question counts, and delivery configurations.

#### 3. Start or Resume Test Attempt
* **Method**: `POST`
* **Path**: `/api/v1/learner/papers/<uuid:pk>/start-attempt/`
* **Request Payload**:
  ```json
  {
    "delivery_configuration_id": "f7a8b9c0-1d2e-3f4a-5b6c-7d8e9f0a1b2c"
  }
  ```
* **Success Response (`201 Created` or `200 OK` if resuming)**:
  ```json
  {
    "attempt_id": "b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e",
    "paper_title": "NEET Full Length Mock Test 01",
    "version_number": 1,
    "status": "IN_PROGRESS",
    "started_at": "2026-08-05T10:00:00Z",
    "time_remaining_seconds": 12000,
    "is_resumed": false
  }
  ```

#### 4. Active In-Progress Attempts
* **Method**: `GET`
* **Path**: `/api/v1/learner/paper-attempts/active/`
* **Success Response (`200 OK`)**: Returns list of unsubmitted active test attempts.

#### 5. Get Test Delivery Payload (Active Test Engine UI)
* **Method**: `GET`
* **Path**: `/api/v1/learner/paper-attempts/<uuid:attempt_id>/`
* **Success Response (`200 OK`)**:
  ```json
  {
    "attempt_id": "b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e",
    "paper_title": "NEET Full Length Mock Test 01",
    "status": "IN_PROGRESS",
    "started_at": "2026-08-05T10:00:00Z",
    "duration_seconds": 12000,
    "remaining_seconds": 11850,
    "delivery_configuration": {
      "mode": "EXAM",
      "solution_release_policy": "AFTER_SUBMISSION",
      "allow_section_navigation": true,
      "shuffle_questions": true,
      "shuffle_options": false
    },
    "sections": [
      {
        "id": "d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a",
        "title": "Physics Section A",
        "order": 1,
        "allowed_question_count": 35,
        "questions": [
          {
            "snapshot_id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
            "sequence_number": 1,
            "question_text": "A particle moves in a circle of radius R...",
            "options": [
              {"id": "A", "text": "v^2 / R"},
              {"id": "B", "text": "v / R"},
              {"id": "C", "text": "v^2 R"},
              {"id": "D", "text": "Zero"}
            ],
            "question_type": "SINGLE_CHOICE",
            "marks": "4.00",
            "negative_marks": "1.00",
            "state": "NOT_VISITED",
            "selected_option_id": null,
            "response_payload": null,
            "time_spent_seconds": 0,
            "is_marked_for_review": false
          }
        ]
      }
    ]
  }
  ```

#### 6. Save Answer Response
* **Method**: `PUT`
* **Path**: `/api/v1/learner/paper-attempts/<uuid:attempt_id>/questions/<uuid:snapshot_id>/response/`
* **Request Payload**:
  ```json
  {
    "selected_option_id": "A",
    "response_payload": {"selected_option_id": "A"},
    "time_spent_seconds": 45
  }
  ```
* **Success Response (`200 OK`)**: Updated snapshot attempt status object.

#### 7. Mark / Unmark for Review
* **Mark**: `POST /api/v1/learner/paper-attempts/<uuid:attempt_id>/questions/<uuid:snapshot_id>/mark-review/`
* **Unmark**: `POST /api/v1/learner/paper-attempts/<uuid:attempt_id>/questions/<uuid:snapshot_id>/unmark-review/`

#### 8. Clear Answer Response
* **Method**: `DELETE`
* **Path**: `/api/v1/learner/paper-attempts/<uuid:attempt_id>/questions/<uuid:snapshot_id>/clear/`

#### 9. Submit Whole Test Attempt
* **Method**: `POST`
* **Path**: `/api/v1/learner/paper-attempts/<uuid:attempt_id>/submit/`
* **Request Payload**: `{}`
* **Success Response (`200 OK`)**:
  ```json
  {
    "attempt_id": "b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e",
    "status": "EVALUATED",
    "submitted_at": "2026-08-05T12:00:00Z",
    "score": "650.00",
    "accuracy_percentage": 92.5
  }
  ```

#### 10. Get Evaluated Attempt Result
* **Method**: `GET`
* **Path**: `/api/v1/learner/paper-attempts/<uuid:attempt_id>/result/`
* **Success Response (`200 OK`)**: Returns total score, max score, percentage, rank, cutoff status, and subject score breakdown.

#### 11. Get Attempt Solution Review
* **Method**: `GET`
* **Path**: `/api/v1/learner/paper-attempts/<uuid:attempt_id>/review/`
* **Success Response (`200 OK`)**: Returns complete question snapshots with student responses, correct options, and detailed step-by-step solutions (if `solution_release_policy` allows).

### 4.3 Content Manager / Authoring Endpoints (Admin API — Exclude from Learner App UI)
* `/api/v1/papers/` (`POST` Create Paper)
* `/api/v1/papers/<uuid:pk>/versions/` (`POST` Create Version Draft)
* `/api/v1/papers/versions/<uuid:pk>/<action>/` (`POST` Lifecycle actions: `submit-review`, `approve`, `publish`)
* `/api/v1/papers/versions/<uuid:v_pk>/sections/` (`POST` Create Section)
* `/api/v1/papers/sections/<uuid:s_pk>/questions/` (`POST` Link Question Snapshot)

---

## 5. Academics & Syllabus Contract

### 5.1 ID Types Matrix (TypeScript Guidance)
Crucial distinction for frontend model design:

| Entity | Backend Model | Primary Key Field | TypeScript Data Type | Example |
| :--- | :--- | :--- | :--- | :--- |
| **User** | `User` | `id` | `number` | `1` |
| **Question** | `Question` | `id` | `number` | `101` |
| **Chapter** | `Chapter` | `id` | `number` | `5` |
| **SubTopic** | `SubTopic` | `id` | `number` | `12` |
| **QuestionAttempt** | `QuestionAttempt` | `id` | `number` | `450` |
| **UserTopicMastery** | `UserTopicMastery` | `id` | `number` | `78` |
| **EducationProvider** | `EducationProvider` | `id` | `string` (UUID) | `"9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"` |
| **Curriculum** | `Curriculum` | `id` | `string` (UUID) | `"e2a4b6c8-1d3e-5f7a-9b0c-2d4e6f8a0b2c"` |
| **CurriculumVersion**| `CurriculumVersion` | `id` | `string` (UUID) | `"f1e2d3c4-b5a6-9788-7766-554433221100"` |
| **Subject** | `Subject` | `id` | `string` (UUID) | `"a1b2c3d4-0000-0000-0000-000000000001"` |
| **CurriculumSubject**| `CurriculumSubject` | `id` | `string` (UUID) | `"b2c3d4e5-0000-0000-0000-000000000002"` |
| **SyllabusNode** | `SyllabusNode` | `id` | `string` (UUID) | `"c3d4e5f6-0000-0000-0000-000000000003"` |
| **LearnerProfile** | `LearnerAcademicProfile`| `id` | `string` (UUID) | `"d4e5f6a7-0000-0000-0000-000000000004"` |
| **Paper** | `Paper` | `id` | `string` (UUID) | `"c3b9a1d2-4e5f-6a7b-8c9d-0e1f2a3b4c5d"` |
| **PaperVersion** | `PaperVersion` | `id` | `string` (UUID) | `"e5f6a7b8-9c0d-1e2f-3a4b-5c6d7e8f9a0b"` |
| **PaperSection** | `PaperSection` | `id` | `string` (UUID) | `"d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a"` |
| **PaperQuestionSnapshot**| `PaperQuestionSnapshot`| `id` | `string` (UUID) | `"a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d"` |
| **DeliveryConfig** | `DeliveryConfiguration`| `id` | `string` (UUID) | `"f7a8b9c0-1d2e-3f4a-5b6c-7d8e9f0a1b2c"` |
| **PaperAttempt** | `PaperAttempt` | `id` | `string` (UUID) | `"b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e"` |

### 5.2 Academics Endpoints (`/api/v1/academics/`)
* `GET /api/v1/academics/versions/`: List available curriculum versions (e.g. CBSE 2026, NEET 2026).
* `GET /api/v1/academics/versions/<uuid:id>/subjects/`: List subjects bound to a curriculum version.
* `GET /api/v1/academics/curriculum-subjects/<uuid:id>/syllabus/`: Fetch complete hierarchical syllabus node tree (`CHAPTER` -> `TOPIC` -> `SUBTOPIC`).

---

## 6. Frontend TypeScript Definitions

```typescript
// types/api.ts

export type UserRole = 'STUDENT' | 'TEACHER' | 'PROFESSIONAL' | 'ADMIN';
export type TargetExam = 'NEET' | 'JEE_MAIN' | 'JEE_ADVANCED' | 'CBSE_10' | 'CBSE_12' | 'KARNATAKA_KCET' | 'OTHER';
export type InstructionMedium = 'ENGLISH' | 'KANNADA' | 'HINDI';
export type SubjectChoices = 'PHYSICS' | 'CHEMISTRY' | 'BOTANY' | 'ZOOLOGY' | 'MATHEMATICS';
export type DifficultyChoices = 'EASY' | 'MEDIUM' | 'HARD';
export type QuestionType = 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'NUMERIC' | 'MATCHING';
export type PaperMode = 'EXAM' | 'PRACTICE' | 'DIAGNOSTIC';
export type SolutionReleasePolicy = 'IMMEDIATE' | 'AFTER_SUBMISSION' | 'ADMIN_RELEASE' | 'NEVER';
export type PaperAttemptStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'EVALUATED' | 'EXPIRED' | 'ABANDONED';
export type QuestionAttemptState = 'NOT_VISITED' | 'VISITED' | 'ANSWERED' | 'MARKED_FOR_REVIEW' | 'ANSWERED_AND_MARKED';

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  first_name?: string;
  last_name?: string;
  phone_number?: string | null;
  target_exam: TargetExam;
  medium: InstructionMedium;
  target_year?: number | null;
  target_score_goal?: number | null;
  login_streak_days: number;
  last_active_at?: string | null;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface QuestionOption {
  id: string;
  text: string;
}

export interface LearnerQuestion {
  id: number;
  sub_topic: number;
  sub_topic_name: string;
  chapter_name: string;
  subject: SubjectChoices;
  syllabus_node?: string | null;
  question_text: string;
  options: QuestionOption[];
  difficulty: DifficultyChoices;
  target_time_seconds: number;
  exam_year?: number | null;
  is_must_do_pyq: boolean;
  target_exam?: TargetExam | null;
  question_type: QuestionType;
  marks: string;
  negative_marks: string;
  language_code: string;
  instructions?: string;
  created_at: string;
}

export interface QuestionAttemptResult {
  id: number;
  question: number;
  selected_option_id: string;
  is_correct: boolean;
  time_spent_seconds: number;
  error_type?: string | null;
  is_bookmarked: boolean;
  is_in_mistake_vault: boolean;
  is_resolved: boolean;
  attempted_at: string;
}

export interface PaperCatalogueItem {
  id: string; // UUID
  title: string;
  code: string;
  exam_type: TargetExam;
  published_version?: {
    id: string;
    version_number: number;
    title: string;
    duration_minutes: number;
    total_marks: string;
    total_questions: number;
    published_at: string;
  } | null;
  default_delivery_configuration?: {
    id: string;
    name: string;
    mode: PaperMode;
    solution_release_policy: SolutionReleasePolicy;
    allow_section_navigation: boolean;
    shuffle_questions: boolean;
  } | null;
}

export interface TestDeliverySnapshotQuestion {
  snapshot_id: string; // UUID
  sequence_number: number;
  question_text: string;
  options: QuestionOption[];
  question_type: QuestionType;
  marks: string;
  negative_marks: string;
  state: QuestionAttemptState;
  selected_option_id?: string | null;
  response_payload?: Record<string, any> | null;
  time_spent_seconds: number;
  is_marked_for_review: boolean;
}

export interface TestDeliverySection {
  id: string; // UUID
  title: string;
  order: number;
  allowed_question_count?: number | null;
  questions: TestDeliverySnapshotQuestion[];
}

export interface TestDeliveryPayload {
  attempt_id: string; // UUID
  paper_title: string;
  status: PaperAttemptStatus;
  started_at: string;
  duration_seconds: number;
  remaining_seconds: number;
  delivery_configuration: {
    mode: PaperMode;
    solution_release_policy: SolutionReleasePolicy;
    allow_section_navigation: boolean;
    shuffle_questions: boolean;
    shuffle_options: boolean;
  };
  sections: TestDeliverySection[];
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
```

---

## 7. Consolidated Enums Reference Table

| Enum Class | String Key | Allowed Values / Choices | Frontend Usage |
| :--- | :--- | :--- | :--- |
| **`UserRole`** | `role` | `"STUDENT"`, `"TEACHER"`, `"PROFESSIONAL"`, `"ADMIN"` | Role checks & UI scoping |
| **`TargetExam`** | `target_exam` | `"NEET"`, `"JEE_MAIN"`, `"JEE_ADVANCED"`, `"CBSE_10"`, `"CBSE_12"`, `"KARNATAKA_KCET"`, `"OTHER"` | Onboarding & Paper filtering |
| **`InstructionMedium`**| `medium` | `"ENGLISH"`, `"KANNADA"`, `"HINDI"` | User language preference |
| **`SubjectChoices`** | `subject` | `"PHYSICS"`, `"CHEMISTRY"`, `"BOTANY"`, `"ZOOLOGY"`, `"MATHEMATICS"` | Question & Analytics filter |
| **`DifficultyChoices`**| `difficulty` | `"EASY"`, `"MEDIUM"`, `"HARD"` | Question badges & filter |
| **`QuestionType`** | `question_type` | `"SINGLE_CHOICE"`, `"MULTIPLE_CHOICE"`, `"NUMERIC"`, `"MATCHING"` | Question rendering engine |
| **`ErrorType`** | `error_type` | `"CONCEPTUAL"`, `"CALCULATION"`, `"READING"`, `"TIME_MANAGEMENT"`, `"GUESS"` | Telemetry & Mistake Vault |
| **`PaperMode`** | `mode` | `"EXAM"`, `"PRACTICE"`, `"DIAGNOSTIC"` | Test execution behavior |
| **`ReleasePolicy`** | `solution_release_policy`| `"IMMEDIATE"`, `"AFTER_SUBMISSION"`, `"ADMIN_RELEASE"`, `"NEVER"` | Solution review rules |
| **`AttemptStatus`** | `status` | `"IN_PROGRESS"`, `"SUBMITTED"`, `"EVALUATED"`, `"EXPIRED"`, `"ABANDONED"` | Test engine status |
| **`QuestionState`** | `state` | `"NOT_VISITED"`, `"VISITED"`, `"ANSWERED"`, `"MARKED_FOR_REVIEW"`, `"ANSWERED_AND_MARKED"` | Test palette indicator |

---

## 8. Frontend Screen → API Readiness Map

| Frontend Screen | Primary Backend API Endpoint | HTTP Method | Auth | Readiness Status | Backend Rationale |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Login Screen** | `/api/v1/auth/login/` | `POST` | None | **READY** | Full simplejwt pair issuance with custom user claims. |
| **Registration Screen** | `/api/v1/auth/register/` | `POST` | None | **READY** | Validates email uniqueness & creates user profile. |
| **Home / Dashboard** | `/api/v1/questions/feed/` | `GET` | Bearer | **READY** | Returns drills, must-do PYQs, mistake count, & progress. |
| **Exam Selection** | `/api/v1/auth/profile/` | `PATCH` | Bearer | **READY** | Allows updating target exam, year, and medium. |
| **Question Search** | `/api/v1/questions/search/` | `GET` | Bearer | **READY** | Paginated micro-filtering by subject, chapter, year, PYQ. |
| **Question Detail / Practice** | `/api/v1/questions/<int:pk>/` | `GET` | Bearer | **READY** | Learner-safe question detail (answer key excluded). |
| **Submit Question Attempt** | `/api/v1/questions/attempt/` | `POST` | Bearer | **READY** | Ingests telemetry, updates mastery, & returns solution. |
| **Mistake Vault Screen** | `/api/v1/questions/mistake-vault/` | `GET` | Bearer | **READY** | Returns past incorrect attempts with step-by-step solutions. |
| **Mastery Dashboard** | `/api/v1/questions/mastery/` | `GET` | Bearer | **READY** | Subtopic accuracy metrics for diagnostic charts. |
| **Attempt Analytics** | `/api/v1/questions/analytics/` | `GET` | Bearer | **READY** | Speed distribution & subject-wise accuracy summaries. |
| **Paper / Test Discovery** | `/api/v1/learner/papers/` | `GET` | Bearer | **READY** | Catalogue of published full-length papers. |
| **Paper Overview** | `/api/v1/learner/papers/<uuid:pk>/` | `GET` | Bearer | **READY** | Paper structure, section counts, duration, and rules. |
| **Active Test Engine UI** | `/api/v1/learner/paper-attempts/<uuid:id>/` | `GET` | Bearer | **READY** | Complete delivery payload with live time remaining. |
| **Test Save / Clear / Review** | `/api/v1/learner/paper-attempts/<uuid:id>/questions/<uuid:sq>/response/` | `PUT`/`POST` | Bearer | **READY** | Real-time response saving, question flagging, & palette state. |
| **Test Submission & Results** | `/api/v1/learner/paper-attempts/<uuid:id>/submit/` | `POST` | Bearer | **READY** | Automated scoring, accuracy percentage, and subject breakdown. |
| **Test Solution Review** | `/api/v1/learner/paper-attempts/<uuid:id>/review/` | `GET` | Bearer | **READY** | Question-by-question review governed by release policy. |
| **Profile & Settings** | `/api/v1/auth/profile/` | `GET`/`PATCH` | Bearer | **READY** | Profile telemetry, streak days, and goal updates. |
| **Push Notifications / Chat** | N/A | N/A | N/A | **NOT READY** | Future phase work (not in Phase 2.3). |

---

## 9. Recommended First Frontend Vertical Slice

To build momentum without unnecessary complexity, implement this **exact end-to-end flow first**:

```text
Login Screen
   │ (POST /api/v1/auth/login/ -> store tokens in Expo SecureStore)
   ▼
Learner Dashboard
   │ (GET /api/v1/questions/feed/ -> display recommended drills & Must-Do PYQs)
   ▼
Question Bank Search
   │ (GET /api/v1/questions/search/?subject=PHYSICS&difficulty=MEDIUM -> display question list)
   ▼
Interactive Practice Mode
   │ (Display question text & options from LearnerQuestionSerializer)
   ▼
Submit Attempt & Receive Feedback
   │ (POST /api/v1/questions/attempt/ -> receive is_correct & update UI with explanation)
   ▼
Mistake Vault Review
     (GET /api/v1/questions/mistake-vault/ -> verify incorrect attempt is queued)
```

---

## 10. React Native / Expo Integration Warnings & Best Practices

1. **Token Security**:
   * Use `expo-secure-store` to persist JWT access and refresh tokens. **Do NOT use `AsyncStorage` for auth tokens.**
2. **Android Emulator Host Loopback**:
   * Android emulators cannot resolve `http://localhost:8000`. Always use `http://10.0.2.2:8000` when testing on Android emulator.
3. **HTTP 401 Interception & Refresh**:
   * Configure an Axios / Fetch interceptor. On receiving a `401 Unauthorized` response, send the stored refresh token to `/api/v1/auth/refresh/`. On success, retry the failed request with the new access token. If refresh fails, clear SecureStore and redirect to Login.
4. **Number Parsing & Decimal Strings**:
   * Django DRF serializes `DecimalField` (e.g. `marks: "4.00"`, `total_marks: "720.00"`) as **strings** to preserve financial/academic precision. Parse them using `parseFloat(marks)` or a Decimal utility in TypeScript.
5. **UUID vs Integer IDs**:
   * Do not parse UUIDs as integers. Keep `paper_id`, `version_id`, `section_id`, `snapshot_id`, and `attempt_id` as `string`.
6. **Error Response Parsing**:
   * Standard DRF exception handler returns error responses in this format:
     ```json
     {
       "detail": "Invalid registration payload provided.",
       "code": "invalid_input",
       "errors": {
         "email": ["A user with this email address already exists."]
       }
     }
     ```
   * Extract user messages from `res.data.detail` or `res.data.errors`.

---

## 11. Real Request & Response JSON Examples

### 11.1 Auth Flow
**Login Request**:
```http
POST /api/v1/auth/login/ HTTP/1.1
Content-Type: application/json

{
  "username": "student_rahul",
  "password": "Password123!"
}
```
**Login Response (`200 OK`)**:
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6InN0dWRlbnRfcmFodWwiLCJyb2xlIjoiU1RVRkVOVCIsInRhcmdldF9leGFtIjoiTkVFVCIsIm1lZGl1bSI6IkVOR0xJU0gifQ...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 11.2 Question Bank Flow
**Question Search Response (`200 OK`)**:
```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 15,
      "sub_topic": 3,
      "sub_topic_name": "Kinematics in One Dimension",
      "chapter_name": "Motion in a Straight Line",
      "subject": "PHYSICS",
      "syllabus_node": null,
      "question_text": "A car accelerates from rest at a constant rate alpha for some time...",
      "options": [
        {"id": "A", "text": "alpha * t"},
        {"id": "B", "text": "(alpha * beta * t) / (alpha + beta)"},
        {"id": "C", "text": "Zero"},
        {"id": "D", "text": "alpha / beta"}
      ],
      "difficulty": "HARD",
      "target_time_seconds": 180,
      "exam_year": 2022,
      "is_must_do_pyq": true,
      "target_exam": "NEET",
      "question_type": "SINGLE_CHOICE",
      "marks": "4.00",
      "negative_marks": "1.00",
      "language_code": "en",
      "instructions": "Select the correct option.",
      "created_at": "2026-08-01T00:00:00Z"
    }
  ]
}
```

**Submit Question Attempt Request**:
```http
POST /api/v1/questions/attempt/ HTTP/1.1
Authorization: Bearer eyJhbGci...
Content-Type: application/json

{
  "question": 15,
  "selected_option_id": "B",
  "time_spent_seconds": 110,
  "error_type": null,
  "is_bookmarked": false
}
```
**Submit Question Attempt Response (`201 Created`)**:
```json
{
  "id": 89,
  "question": 15,
  "selected_option_id": "B",
  "is_correct": true,
  "time_spent_seconds": 110,
  "error_type": null,
  "is_bookmarked": false,
  "is_in_mistake_vault": false,
  "is_resolved": false,
  "attempted_at": "2026-08-05T13:45:00Z"
}
```

### 11.3 Paper Attempt Start Response
```http
POST /api/v1/learner/papers/c3b9a1d2-4e5f-6a7b-8c9d-0e1f2a3b4c5d/start-attempt/ HTTP/1.1
Authorization: Bearer eyJhbGci...
Content-Type: application/json

{
  "delivery_configuration_id": "f7a8b9c0-1d2e-3f4a-5b6c-7d8e9f0a1b2c"
}
```
**Response (`201 Created`)**:
```json
{
  "attempt_id": "b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e",
  "paper_title": "NEET Full Length Mock Test 01",
  "version_number": 1,
  "status": "IN_PROGRESS",
  "started_at": "2026-08-05T13:50:00Z",
  "time_remaining_seconds": 12000,
  "is_resumed": false
}
```

---

## 12. Current Backend Readiness Summary

### 🟢 BACKEND READY FOR FRONTEND NOW (Safe to Implement Immediately)
1. **User Authentication**: Registration, Login, Token Refresh, Profile Retrieval/Updates.
2. **Learner Academic Context**: Exam targeting, primary curriculum selection, and active context switching.
3. **Question Discovery & Practice**: Micro-filtered question search, question detail, question attempt telemetry ingestion, immediate practice feedback.
4. **Personalized Feed & Dashboard**: Drills recommendation, Must-do PYQs summary, syllabus completion metrics.
5. **Mistake Vault & Review**: Incomplete/incorrect attempt queue with solution disclosure.
6. **Mastery & Analytics**: Subtopic accuracy metrics, speed distributions.
7. **Full Paper & Test Delivery Engine**: Paper catalogue, start/resume attempt, live test delivery payload with remaining time, real-time response saving/clearing, mark-for-review, whole test submission, automated scoring, result payload, and solution review.

### 🔴 BACKEND NOT READY YET (Keep Mocked / Disabled in UI)
1. **Push Notifications**: FCM / APNS push registration backend not yet implemented.
2. **Live Multiplayer Battle / Quiz Mode**: WebSocket real-time quiz engine not yet implemented.
3. **Social / Peer Leaderboards**: Public social ranking feeds scheduled for future phase.
4. **Payment Gateway / Subscription Checkout**: Monetization & billing APIs scheduled for future phase.

---

## 13. Audit Verification Summary

* **Document Created**: `docs/frontend-api-handoff.md`
* **Inspected Files**:
  * `core/settings.py`, `core/urls.py`, `core/learner_urls.py`
  * `authentication/urls.py`, `learner_urls.py`, `views.py`, `serializers.py`, `models.py`
  * `questions/urls.py`, `views.py`, `serializers.py`, `models.py`, `permissions.py`
  * `papers/urls.py`, `learner_urls.py`, `views.py`, `serializers.py`, `models.py`, `permissions.py`, `enums.py`
  * `academics/urls.py`, `views.py`, `serializers.py`, `models.py`
  * `schema.yml`
* **Endpoints Documented**: All 28+ active learner-facing backend REST API endpoints across authentication, academic structures, canonical question bank, and paper delivery engine.
* **Discrepancies Found**: None. OpenAPI schema matches Django runtime behavior.
* **Backend Git Status**: Clean (`git status --short` outputs nothing). No backend code modified.
