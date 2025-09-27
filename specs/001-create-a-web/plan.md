
# Implementation Plan: Sydney Underground Techno Event Analytics Dashboard

**Branch**: `001-create-a-web` | **Date**: 2025-09-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/home/tpserver/test-spec-kit-project/specs/001-create-a-web/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from file system structure or context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Analytics dashboard for Sydney underground techno events that imports CSV data from ticketing platforms (Resident Advisor, Humanitix, Moshtix) and provides comprehensive metrics visualization with custom KPI capabilities for a single promoter organization with up to 3 team members.

## Technical Context
**Language/Version**: TypeScript 5.0+ / Node.js 20 LTS
**Primary Dependencies**: Next.js 14, React 18, PostgreSQL 15, Chart.js
**Storage**: PostgreSQL for structured data, S3-compatible storage for CSV archives
**Testing**: Jest for unit tests, Playwright for E2E tests
**Target Platform**: Web browser (mobile-first responsive design)
**Project Type**: web - Full-stack Next.js application
**Performance Goals**: CSV processing < 30s for 100MB files, dashboard load < 2s
**Constraints**: Mobile-first design, WCAG 2.1 AA compliance, indefinite data retention
**Scale/Scope**: 3 concurrent users max, unlimited events, comprehensive analytics

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Event-First: Analytics dashboard focuses entirely on event metrics and insights
- [x] Mobile-First: Responsive design with mobile-first approach using Next.js
- [x] Privacy & Trust: Limited to 3 team members, secure authentication planned
- [x] Performance: No live traffic (upload-only), <2s dashboard load target met
- [x] Integration: CSV import from RA, Humanitix, Moshtix as specified

## Project Structure

### Documentation (this feature)
```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── upload/
│   │   ├── events/
│   │   └── metrics/
│   ├── dashboard/         # Dashboard pages
│   ├── upload/           # Upload pages
│   └── layout.tsx        # Root layout
├── components/            # React components
│   ├── charts/           # Chart components
│   ├── upload/           # Upload components
│   └── dashboard/        # Dashboard components
├── lib/                   # Shared libraries
│   ├── parsers/          # CSV parsers for each platform
│   ├── db/               # Database utilities
│   └── metrics/          # Metrics calculation logic
├── models/                # Data models
│   ├── event.ts
│   ├── ticket.ts
│   └── metrics.ts
└── services/              # Business logic
    ├── csv-import/
    ├── analytics/
    └── auth/

tests/
├── unit/                  # Unit tests
├── integration/           # Integration tests
└── e2e/                   # End-to-end tests

prisma/                    # Database schema
└── schema.prisma

public/                    # Static assets
└── images/
```

**Structure Decision**: Next.js 14 App Router structure optimized for a full-stack application with API routes, server components, and comprehensive testing.

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh claude`
     **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Database schema and Prisma setup tasks
- CSV parser tasks for each platform (RA, Humanitix, Moshtix) [P]
- API endpoint tasks from OpenAPI spec
- Dashboard component tasks [P]
- Chart/visualization component tasks [P]
- Authentication setup with NextAuth
- Upload processing with Bull queue
- Integration test tasks for each user story

**Ordering Strategy**:
- Setup & config first (Next.js, Prisma, Auth)
- Database models before services
- Parsers can be parallel [P]
- API endpoints after models
- UI components can be parallel [P]
- Integration tests last

**Estimated Output**: 35-40 numbered, ordered tasks in tasks.md covering:
- 5 setup/config tasks
- 10 model/database tasks
- 8 parser/processing tasks
- 8 API endpoint tasks
- 10 UI component tasks
- 5 integration test tasks

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (none needed)

---
*Based on Constitution v1.0.0 - See `.specify/memory/constitution.md`*
