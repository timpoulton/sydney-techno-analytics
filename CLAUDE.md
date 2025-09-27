# Spec-Kit Project Development Guidelines

Auto-generated from spec-kit template. Last updated: 2025-09-27

## Project Commands

The following slash commands are available in this project:

### Core Workflow Commands

- `/constitution` - Create or update the project constitution with governing principles and development guidelines
- `/specify` - Define what you want to build (requirements and user stories)
- `/clarify` - Clarify underspecified areas (run before /plan unless explicitly skipping)
- `/plan` - Create technical implementation plans with your chosen tech stack
- `/tasks` - Generate actionable task lists for implementation
- `/analyze` - Cross-artifact consistency & coverage analysis (run after /tasks, before /implement)
- `/implement` - Execute all tasks to build the feature according to the plan

## Workflow Process

1. **Start with `/constitution`** to establish project principles
2. **Use `/specify`** to describe WHAT you want to build (focus on requirements, not implementation)
3. **Optionally run `/clarify`** to address ambiguities
4. **Create a plan with `/plan`** including your tech stack choices
5. **Generate tasks with `/tasks`** to break down the implementation
6. **Optionally run `/analyze`** to verify consistency
7. **Execute with `/implement`** to build the feature

## Project Structure
```
.specify/
├── memory/          # Project memory (constitution, etc.)
├── scripts/         # Automation scripts
├── specs/           # Feature specifications (created by commands)
└── templates/       # Document templates
```

## Active Technologies
To be determined after first `/plan` execution
- TypeScript 5.0+ / Node.js 20 LTS + Next.js 14, React 18, PostgreSQL 15, Chart.js (001-create-a-web)
- PostgreSQL for structured data, S3-compatible storage for CSV archives (001-create-a-web)

## Code Style
To be determined based on chosen technologies

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
