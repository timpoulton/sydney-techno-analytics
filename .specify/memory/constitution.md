<!-- Sync Impact Report
Version change: Initial → 1.0.0
Reason: Initial constitution creation with foundational principles for Sydney Techno Promoter Web App
Added sections: All sections (initial creation)
Templates requiring updates: ✅ All templates aligned with constitution
Follow-up TODOs:
- Set RATIFICATION_DATE when formally adopted
-->

# Sydney Underground Techno Promoter Web App Constitution

## Core Principles

### I. Event-First Architecture
Every feature MUST prioritize the event experience and attendee journey.
Event data integrity and accuracy are NON-NEGOTIABLE.
Real-time updates MUST be supported for event changes and ticket availability.
**Rationale**: Events are the core business entity; their reliable management
directly impacts revenue and reputation.

### II. Mobile-First Design
All interfaces MUST be optimized for mobile devices first.
Desktop experiences are secondary but MUST remain fully functional.
Touch interactions and responsive design are REQUIRED.
**Rationale**: 85% of event discovery and ticket purchases happen on mobile
devices in the electronic music scene.

### III. Community Privacy & Trust
User data MUST be protected with industry-standard encryption.
Anonymous browsing MUST be supported for event discovery.
Marketing communications REQUIRE explicit opt-in consent.
**Rationale**: The underground scene values privacy and discretion;
trust is essential for community growth.

### IV. Performance Under Load
The system MUST handle 10x normal traffic during ticket releases.
Page load times MUST not exceed 2 seconds on 4G connections.
Payment processing MUST complete within 5 seconds.
**Rationale**: Ticket drops create traffic spikes; poor performance
means lost sales and damaged reputation.

### V. Seamless Integration
The platform MUST integrate with existing ticketing systems (Humanitix, Eventbrite).
Social media integration for Instagram and Facebook is REQUIRED.
Payment gateway redundancy MUST be implemented (Stripe + PayPal minimum).
**Rationale**: Leveraging existing tools reduces complexity while
maintaining flexibility for the promoter's workflow.

## Development Workflow

### Planning Process
1. Create or update feature specification using `/specify`
2. Clarify ambiguities using `/clarify`
3. Create technical plan using `/plan`
4. Generate implementation tasks using `/tasks`
5. Analyze consistency using `/analyze`
6. Execute implementation using `/implement`

### Quality Gates
- All specifications MUST be complete before planning
- All clarifications MUST be resolved before implementation
- All tests MUST pass before marking tasks complete
- Code review REQUIRED for all changes
- Accessibility audit REQUIRED before release (WCAG 2.1 AA minimum)

### Release Cycle
- Features deployed to staging environment first
- Minimum 48-hour testing period before production
- Rollback plan REQUIRED for all deployments
- Zero-downtime deployments for critical event periods

## Technology Standards

### Frontend Requirements
- React or Next.js for web application
- Progressive Web App capabilities REQUIRED
- Offline functionality for viewing purchased tickets
- Image optimization and lazy loading MANDATORY

### Backend Requirements
- RESTful API design with clear versioning
- Rate limiting on all public endpoints
- Database transactions for all financial operations
- Event-driven architecture for real-time updates

### Security Practices
- HTTPS everywhere, no exceptions
- PCI DSS compliance for payment handling
- GDPR compliance for user data
- Regular penetration testing before major events

### Performance Metrics
- Time to First Byte < 200ms
- First Contentful Paint < 1.5s
- Largest Contentful Paint < 2.5s
- Database queries < 100ms for 95th percentile

## Governance

### Amendment Process
Constitution changes REQUIRE:
1. Documented proposal with business impact analysis
2. Technical team review and feasibility assessment
3. Promoter approval for business-affecting changes
4. Version increment following semantic versioning
5. Update to all affected documentation and training materials

### Compliance
- All development MUST follow constitutional principles
- Deviations REQUIRE explicit justification and compensating controls
- Monthly audits during active development phases
- Constitution supersedes all other development guidelines

### Version Management
- MAJOR: Breaking changes to core principles or integrations
- MINOR: New features or significant process additions
- PATCH: Bug fixes, performance improvements, or clarifications

### Data Governance
- User data retention: 2 years after last activity
- Event data retention: 5 years for financial records
- Right to deletion requests processed within 30 days
- Data portability in standard formats (JSON/CSV)

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): Pending formal adoption | **Last Amended**: 2025-09-27