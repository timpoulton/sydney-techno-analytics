# Tasks: Sydney Underground Techno Event Analytics Dashboard

**Input**: Design documents from `/home/tpserver/test-spec-kit-project/specs/001-create-a-web/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, CLI commands
   → Integration: DB, middleware, logging
   → Polish: unit tests, performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests?
   → All entities have models?
   → All endpoints implemented?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Web app**: Next.js App Router structure
- `src/app/` for pages and API routes
- `src/components/` for React components
- `src/lib/` for shared libraries
- `tests/` for all test files

## Phase 3.1: Setup
- [x] T001 Create Next.js 14 project with TypeScript in repository root
- [x] T002 Install core dependencies: react@18, postgresql@15, chart.js, tailwindcss
- [x] T003 Configure TypeScript with strict mode in tsconfig.json
- [x] T004 [P] Setup ESLint and Prettier configuration files
- [ ] T005 [P] Initialize PostgreSQL database and create techno_analytics database
- [x] T006 Configure environment variables in .env.local per quickstart.md

## Phase 3.2: Database & Models
- [x] T007 Install and configure Prisma ORM with PostgreSQL
- [x] T008 Create Prisma schema in prisma/schema.prisma with all 11 entities from data-model.md
- [x] T009 [P] Define Organization model with id, name, timestamps in Prisma
- [x] T010 [P] Define User model with email, role, organizationId, max 3 users constraint
- [x] T011 [P] Define Event model with platform enum (resident_advisor, humanitix, moshtix)
- [x] T012 [P] Define Upload model with status enum and processing fields
- [x] T013 [P] Define Ticket model with price as Decimal and revenue calculation
- [x] T014 [P] Define Artist and EventArtist junction models
- [x] T015 [P] Define Venue model with coordinates as JSON
- [x] T016 [P] Define EventMetrics materialized model with JSON fields
- [x] T017 [P] Define CustomMetric model for user-defined KPIs
- [x] T018 Run Prisma migration to create database tables
- [x] T019 Create database seed script with sample organization and users

## Phase 3.3: Authentication & Core Services
- [SKIP] T020 Install and configure NextAuth.js with Prisma adapter - NOT NEEDED
- [SKIP] T021 Implement magic link email provider - NOT NEEDED
- [SKIP] T022 Create authentication middleware - NOT NEEDED
- [SKIP] T023 Create user service - NOT NEEDED
- [ ] T024 [P] Setup Bull queue for async CSV processing in src/services/queue/
- [SKIP] T025 Configure email service - NOT NEEDED

## Phase 3.4: CSV Parsers
- [ ] T026 [P] Create base CSV parser interface in src/lib/parsers/base-parser.ts
- [ ] T027 [P] Implement Resident Advisor CSV parser in src/lib/parsers/resident-advisor.parser.ts
- [ ] T028 [P] Implement Humanitix CSV parser in src/lib/parsers/humanitix.parser.ts
- [ ] T029 [P] Implement Moshtix CSV parser in src/lib/parsers/moshtix.parser.ts
- [ ] T030 [P] Create CSV validation schemas with Zod in src/lib/parsers/schemas.ts
- [ ] T031 Create parser factory to select correct parser by platform
- [ ] T032 Implement CSV processing service in src/services/csv-import/processor.ts

## Phase 3.5: API Endpoints
- [ ] T033 Implement POST /api/auth/login for magic link authentication
- [ ] T034 Implement POST /api/uploads for CSV file upload with multipart/form-data
- [ ] T035 Implement GET /api/uploads to list uploads with status filtering
- [ ] T036 Implement GET /api/uploads/[id] to get upload status and details
- [ ] T037 Implement GET /api/events with date range and venue filtering
- [ ] T038 Implement GET /api/events/[id] to get event with metrics
- [ ] T039 Implement GET /api/metrics/dashboard for overview metrics
- [ ] T040 Implement POST /api/metrics/custom to create custom KPI definitions
- [ ] T041 Implement GET /api/metrics/custom to list custom metrics
- [ ] T042 Implement POST /api/metrics/export for CSV/JSON/PDF export

## Phase 3.6: Analytics & Metrics
- [ ] T043 Create metrics calculation service in src/services/analytics/calculator.ts
- [ ] T044 Implement revenue metrics (total, average, by ticket type)
- [ ] T045 Implement attendance metrics (sold, capacity, sellout percentage)
- [ ] T046 Implement demographic analysis (postcodes, age distribution)
- [ ] T047 Implement time pattern analysis (sales velocity, peak hours)
- [ ] T048 Create custom metric formula evaluator
- [ ] T049 Implement materialized view updates for EventMetrics

## Phase 3.7: UI Components - Layout & Auth
- [ ] T050 Create root layout with navigation in src/app/layout.tsx
- [ ] T051 [P] Create login page component in src/app/login/page.tsx
- [ ] T052 [P] Create responsive navigation component in src/components/layout/navigation.tsx
- [ ] T053 [P] Create authentication provider wrapper component
- [ ] T054 [P] Implement mobile-first responsive design with Tailwind CSS

## Phase 3.8: UI Components - Upload
- [ ] T055 [P] Create file upload page in src/app/upload/page.tsx
- [ ] T056 [P] Create CSV upload component with drag-and-drop in src/components/upload/csv-uploader.tsx
- [ ] T057 [P] Create upload progress indicator component
- [ ] T058 [P] Create upload history list component in src/components/upload/history.tsx
- [ ] T059 [P] Implement upload error handling and display

## Phase 3.9: UI Components - Dashboard
- [ ] T060 [P] Create main dashboard page in src/app/dashboard/page.tsx
- [ ] T061 [P] Create metrics summary cards component in src/components/dashboard/summary-cards.tsx
- [ ] T062 [P] Create revenue chart component with Chart.js in src/components/charts/revenue-chart.tsx
- [ ] T063 [P] Create attendance chart component in src/components/charts/attendance-chart.tsx
- [ ] T064 [P] Create geographic heatmap component in src/components/charts/geo-chart.tsx
- [ ] T065 [P] Create event timeline component in src/components/dashboard/timeline.tsx
- [ ] T066 [P] Create date range filter component
- [ ] T067 [P] Create custom metrics display component

## Phase 3.10: UI Components - Events & Details
- [ ] T068 [P] Create events list page in src/app/events/page.tsx
- [ ] T069 [P] Create event detail page in src/app/events/[id]/page.tsx
- [ ] T070 [P] Create event card component in src/components/events/event-card.tsx
- [ ] T071 [P] Create artist lineup component in src/components/events/artist-lineup.tsx
- [ ] T072 [P] Create venue information component
- [ ] T073 [P] Create ticket breakdown table component

## Phase 3.11: Integration Tests
- [ ] T074 [P] Create E2E test for login flow with Playwright in tests/e2e/auth.spec.ts
- [ ] T075 [P] Create E2E test for CSV upload flow in tests/e2e/upload.spec.ts
- [ ] T076 [P] Create E2E test for dashboard metrics display in tests/e2e/dashboard.spec.ts
- [ ] T077 [P] Create E2E test for mobile responsiveness in tests/e2e/mobile.spec.ts
- [ ] T078 [P] Create integration test for CSV parsing all three formats

## Phase 3.12: Unit Tests
- [ ] T079 [P] Create unit tests for RA parser in tests/unit/parsers/resident-advisor.test.ts
- [ ] T080 [P] Create unit tests for Humanitix parser in tests/unit/parsers/humanitix.test.ts
- [ ] T081 [P] Create unit tests for Moshtix parser in tests/unit/parsers/moshtix.test.ts
- [ ] T082 [P] Create unit tests for metrics calculator in tests/unit/analytics/calculator.test.ts
- [ ] T083 [P] Create unit tests for custom formula evaluator
- [ ] T084 [P] Create unit tests for authentication service

## Phase 3.13: Performance & Optimization
- [ ] T085 Implement static generation for dashboard with ISR
- [ ] T086 Add database query optimization and indexes
- [ ] T087 Implement CSV file chunking for large uploads
- [ ] T088 Add caching layer for frequently accessed metrics
- [ ] T089 Optimize bundle size with dynamic imports

## Phase 3.14: Documentation & Deployment
- [ ] T090 Create API documentation from OpenAPI spec
- [ ] T091 Write deployment guide for production
- [ ] T092 Create user manual for team members
- [ ] T093 Setup error tracking with Sentry
- [ ] T094 Configure production environment variables
- [ ] T095 Create backup and recovery procedures

## Dependencies

### Critical Path
```
T001 → T002 → T003 → T007 → T008 → T018 → T020
                                    ↓
                              T033-T042 (API)
                                    ↓
                              T050-T073 (UI)
```

### Parallel Execution Groups

**Group 1 - Models (after T008)**:
```
Task: "Define Organization model in Prisma"
Task: "Define User model with constraints"
Task: "Define Event model with platform enum"
Task: "Define Upload model with status"
Task: "Define Ticket model with calculations"
```

**Group 2 - Parsers (after T026)**:
```
Task: "Implement Resident Advisor CSV parser"
Task: "Implement Humanitix CSV parser"
Task: "Implement Moshtix CSV parser"
Task: "Create CSV validation schemas"
```

**Group 3 - Chart Components (after T060)**:
```
Task: "Create revenue chart component"
Task: "Create attendance chart component"
Task: "Create geographic heatmap"
Task: "Create event timeline"
```

**Group 4 - Tests (can start early)**:
```
Task: "Create E2E test for login flow"
Task: "Create E2E test for upload flow"
Task: "Create E2E test for dashboard"
Task: "Create E2E test for mobile"
```

## Notes
- [P] tasks = different files, no dependencies
- Total tasks: 95
- Estimated completion: 2-3 weeks with single developer
- Critical path: Setup → Database → Auth → API → UI
- Verify tests fail before implementing (TDD approach)
- Commit after each completed task
- Mobile-first development for all UI components

## Task Generation Rules Applied
✓ Each API endpoint from contracts → implementation task
✓ Each entity from data-model → Prisma model task
✓ Each parser platform → separate parser task [P]
✓ Each UI component → separate component task [P]
✓ Integration tests for each user story [P]
✓ Setup tasks sequential, implementation tasks parallel where possible

## Validation Checklist
✓ All 8 API endpoints have implementation tasks
✓ All 11 entities have model tasks
✓ All 3 CSV platforms have parser tasks
✓ Mobile-first UI components created
✓ Authentication flow implemented
✓ Performance requirements addressed (ISR, caching)
✓ Tests cover all critical paths