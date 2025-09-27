# Research Findings: Sydney Underground Techno Event Analytics Dashboard

## CSV Parsing Strategy

**Decision**: Multi-parser architecture with platform-specific adapters
**Rationale**: Each platform (Resident Advisor, Humanitix, Moshtix) has unique CSV formats that require custom parsing logic
**Alternatives considered**:
- Universal parser with configuration: Too complex for varying formats
- Manual mapping UI: Poor UX and error-prone for repeat uploads

## Database Technology

**Decision**: PostgreSQL with JSONB for flexible event metadata
**Rationale**:
- Structured data for core entities (events, tickets)
- JSONB for platform-specific fields that vary
- Excellent query performance for analytics
- Indefinite retention supported with partitioning
**Alternatives considered**:
- MongoDB: Unnecessary complexity for structured analytics
- SQLite: Limited concurrent access and analytics capabilities
- TimescaleDB: Overkill for 3 users and upload-based data

## Visualization Framework

**Decision**: Chart.js with React wrapper
**Rationale**:
- Comprehensive chart types for all metrics
- Mobile-responsive by default
- Lightweight and performant
- Easy custom metric implementation
**Alternatives considered**:
- D3.js: Too low-level for rapid development
- Recharts: Limited customization for complex metrics
- Victory: Heavier bundle size

## Authentication Strategy

**Decision**: NextAuth.js with email magic links
**Rationale**:
- Simple setup for 3 users
- No password management needed
- Secure and user-friendly
- Easy to add OAuth later if needed
**Alternatives considered**:
- Custom JWT: Unnecessary complexity
- OAuth only: Overkill for 3 internal users
- Basic auth: Poor security and UX

## File Storage

**Decision**: Local filesystem with S3-compatible backup
**Rationale**:
- Simple for development and small scale
- CSV archives preserved indefinitely
- Easy migration to cloud storage later
- Cost-effective for single promoter
**Alternatives considered**:
- S3 only: Unnecessary cost for low volume
- Database BLOBs: Poor performance for large files
- No archive: Loses source data for audit

## CSV Processing Architecture

**Decision**: Queue-based async processing with Bull
**Rationale**:
- Non-blocking uploads for better UX
- Progress tracking for large files
- Retry capability for failures
- Scales to 100MB files easily
**Alternatives considered**:
- Synchronous processing: Poor UX for large files
- Serverless functions: Timeout issues with 100MB files
- Stream processing: Complex for varying formats

## Metrics Calculation

**Decision**: Pre-calculated metrics with on-demand custom KPIs
**Rationale**:
- Fast dashboard loading (<2s requirement)
- Flexible for custom metrics
- Efficient storage with materialized views
- Easy to add new calculations
**Alternatives considered**:
- Real-time calculation: Too slow for complex metrics
- Cube.js: Overkill for 3 users
- Static pre-calculation only: No custom metric support

## Mobile-First Implementation

**Decision**: Tailwind CSS with responsive-first approach
**Rationale**:
- Mobile-first utility classes
- Consistent responsive design
- Small bundle size
- Works well with Next.js
**Alternatives considered**:
- Material-UI: Heavy for mobile
- Custom CSS: Time-consuming
- Bootstrap: Less modern, larger bundle

## Data Validation

**Decision**: Zod schemas for CSV validation
**Rationale**:
- TypeScript integration
- Runtime validation
- Clear error messages
- Composable for different formats
**Alternatives considered**:
- Joi: Less TypeScript-friendly
- Yup: Similar but less performant
- Manual validation: Error-prone

## Testing Strategy

**Decision**: Jest + React Testing Library + Playwright
**Rationale**:
- Jest for unit tests (parsers, calculations)
- RTL for component tests
- Playwright for E2E upload/dashboard flows
- Good Next.js integration
**Alternatives considered**:
- Cypress: Slower and resource-heavy
- Puppeteer: Less modern API
- Selenium: Outdated for modern web apps

## Error Handling

**Decision**: Structured error reporting with Sentry
**Rationale**:
- Automatic error capture
- User-friendly error messages
- Debug information for developers
- CSV parsing error details
**Alternatives considered**:
- Console logging only: Insufficient for production
- Custom error tracking: Time-consuming to build
- No tracking: Poor maintainability

## Performance Optimization

**Decision**: Next.js SSG for dashboard with ISR
**Rationale**:
- Static generation for fast loads
- Incremental updates for new data
- CDN-friendly
- Meets <2s load requirement
**Alternatives considered**:
- Full SSR: Unnecessary server load
- Client-only SPA: Slower initial load
- Static only: No dynamic updates

## Summary

All technical decisions prioritize:
1. Mobile-first responsive design
2. Fast dashboard performance (<2s)
3. Reliable CSV processing (up to 100MB)
4. Simple maintenance for 3-user system
5. Indefinite data retention capability

No remaining NEEDS CLARIFICATION items. Ready for Phase 1 design.