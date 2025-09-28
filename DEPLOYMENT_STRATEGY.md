# Comprehensive Deployment & Implementation Strategy

## Executive Summary
Your project has successfully used spec-kit to reach MVP stage but is now facing deployment challenges. This strategy combines MCP servers, Claude agents, and spec-kit workflows to fix current issues and establish robust deployment practices.

## Current State Analysis

### What's Working
- ✅ Core application structure (Next.js + PostgreSQL)
- ✅ Basic CSV upload functionality
- ✅ Database schema properly defined
- ✅ Spec-kit constitution and workflow established

### Critical Issues
- 🔴 **Security**: Exposed credentials in tracked files
- 🔴 **Data Processing**: CSV uploads fail with unclear errors
- 🔴 **Database**: Connection drops in production
- 🔴 **Validation**: Field mapping inconsistencies (customerEmail vs email)
- 🔴 **Monitoring**: No visibility into production errors

## Phase 1: Immediate Fixes (Day 1)

### 1.1 Security Hardening
```bash
# Remove exposed credentials
git rm --cached .env.development.local
echo ".env*.local" >> .gitignore
git commit -m "Remove exposed credentials from version control"

# Update vulnerable dependencies
npm audit fix --force
npm install next@latest react@latest
```

### 1.2 Install Critical MCP Servers
```bash
# Database debugging
claude mcp add postgres -- npx -y @crystaldba/postgres-mcp

# CSV validation
claude mcp add csv-editor -- npx -y @kimtaeyoon83/mcp-server-csv-editor

# Error tracking
claude mcp add sentry -- npx -y @modelcontextprotocol/server-sentry
```

### 1.3 Fix Upload Processing
Create `/src/lib/validators/upload-validator.ts`:
```typescript
import { z } from 'zod'

export const HumanitixTicketSchema = z.object({
  'Order ID': z.string(),
  'Ticket Price': z.string().transform(val => parseFloat(val.replace('$', ''))),
  'Customer Email': z.string().email().optional(),
  'Customer Name': z.string().optional(),
  'Postcode': z.string().optional(),
  'Marketing Opt In': z.enum(['Yes', 'No']).transform(val => val === 'Yes')
})

export const ResidentAdvisorSchema = z.object({
  'Order Number': z.string(),
  'Price': z.number(),
  'Billing Email': z.string().email(),
  'Billing Name': z.string(),
  'Billing Postcode': z.string()
})
```

## Phase 2: Stabilization (Days 2-3)

### 2.1 Database Connection Pooling
Update `/src/lib/prisma.ts`:
```typescript
import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    },
    // Connection pool configuration
    connectionLimit: 5,
    pool: {
      min: 2,
      max: 10,
      idleTimeoutMillis: 30000,
      acquireTimeoutMillis: 30000
    }
  })
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()
export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma
```

### 2.2 Implement Health Checks
```typescript
// /src/app/api/health/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  const checks = {
    database: false,
    storage: true, // Assuming local storage for now
    timestamp: new Date().toISOString()
  }

  try {
    await prisma.$queryRaw`SELECT 1`
    checks.database = true
  } catch (error) {
    console.error('Database health check failed:', error)
  }

  const status = checks.database ? 'healthy' : 'degraded'
  const httpStatus = status === 'healthy' ? 200 : 503

  return NextResponse.json({ status, checks }, { status: httpStatus })
}
```

## Phase 3: Advanced Tooling (Days 4-7)

### 3.1 Spec-Kit Integration for New Features
Continue using spec-kit for feature development:
```bash
# For new dashboard features
/specify "Add real-time metrics refresh to dashboard"
/clarify
/plan
/tasks
/implement

# For upload improvements
/specify "Add bulk CSV validation with detailed error reports"
/plan
/implement
```

### 3.2 Claude Agent Configuration
Create specialized agents in `CLAUDE.md`:
```markdown
## Data Upload Specialist
When processing CSV uploads:
1. Validate format using CSV Editor MCP
2. Check for duplicates using database queries
3. Transform data to match schema
4. Provide detailed error reports
5. Implement retry logic for failed records

## Performance Monitor
Daily checks:
1. Query performance (pg_stat_statements)
2. Connection pool utilization
3. Error rates from Sentry
4. Response time metrics
```

### 3.3 Automated Testing Pipeline
```bash
# Install testing MCP
claude mcp add jest -- npx -y @modelcontextprotocol/server-jest

# Create test suite
npm install --save-dev @testing-library/react jest-environment-jsdom
```

## Phase 4: Production Deployment (Week 2)

### 4.1 Environment Configuration
```bash
# Vercel environment variables
vercel env add DATABASE_URL production
vercel env add DATABASE_URL_UNPOOLED production
vercel env add SENTRY_DSN production
```

### 4.2 Deployment Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run health check
        run: npm run test:health
      - name: Deploy to Vercel
        run: vercel --prod
```

### 4.3 Monitoring Dashboard
Create custom monitoring using installed MCP servers:
```typescript
// /src/app/admin/monitoring/page.tsx
export default async function MonitoringPage() {
  // Use PostgreSQL MCP for metrics
  const dbMetrics = await getDBMetrics()

  // Use Sentry MCP for errors
  const recentErrors = await getRecentErrors()

  return (
    <Dashboard>
      <MetricsPanel data={dbMetrics} />
      <ErrorsPanel data={recentErrors} />
      <UploadsPanel />
    </Dashboard>
  )
}
```

## Success Metrics

### Week 1 Goals
- ✅ Zero security vulnerabilities
- ✅ 99% upload success rate
- ✅ <2s dashboard load time
- ✅ Automated health checks

### Month 1 Goals
- ✅ 99.9% uptime
- ✅ Automated testing coverage >80%
- ✅ Complete error tracking
- ✅ Rollback capability <5 minutes

## Recommended Team Workflow

### Daily Operations
1. Morning: Check health dashboard
2. Before features: Run `/specify` → `/plan` → `/implement`
3. Before deploy: Run deployment-guardian agent
4. After deploy: Monitor Sentry for 30 minutes

### Weekly Reviews
1. Analyze Sentry error trends
2. Review database performance metrics
3. Update spec-kit constitution if needed
4. Plan next week's features using spec-kit

## Emergency Procedures

### If Upload Fails
1. Check CSV Editor MCP for format issues
2. Verify database connections
3. Review Sentry for error details
4. Rollback if systematic failure

### If Database Down
1. Switch to read replica (if available)
2. Check connection pool status
3. Review pg_stat_activity
4. Scale database if needed

## Conclusion

This strategy combines:
- **Immediate fixes** for critical issues
- **MCP servers** for enhanced tooling
- **Claude agents** for automated workflows
- **Spec-kit** for continued feature development

Following this roadmap will transform your deployment from unstable to production-ready within 2 weeks, with ongoing improvements through automated tooling and monitoring.

## Next Steps
1. Execute Phase 1 immediately
2. Install recommended MCP servers
3. Set up monitoring
4. Continue using spec-kit for new features
5. Schedule weekly deployment reviews