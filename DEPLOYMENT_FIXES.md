# Critical Deployment Fixes Required

## 1. Security Updates (CRITICAL - Do First)

```bash
# Update Next.js to fix critical vulnerabilities
npm audit fix --force
npm install next@latest

# Verify the fix
npm audit
```

## 2. Environment Variable Security

### Remove credentials from tracked files:
```bash
# Remove sensitive data from .env files
echo "# Environment template - copy to .env.local and add real values" > .env.example
echo "DATABASE_URL=your_database_url_here" >> .env.example

# Add to .gitignore if not already there
echo ".env.local" >> .gitignore
echo ".env.development.local" >> .gitignore
echo ".env.production.local" >> .gitignore
```

### Set up proper environment variables in production:
- `DATABASE_URL` - Pooled connection for application
- `DATABASE_URL_UNPOOLED` - Direct connection for migrations
- `NEXTAUTH_SECRET` - Random secret for NextAuth
- `NEXTAUTH_URL` - Your production domain

## 3. Database Configuration Fix

Update DATABASE_URL configuration to prevent connection issues:

```typescript
// src/lib/prisma.ts - Enhanced version
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

## 4. Upload API Error Handling

Add proper validation and error handling:

```typescript
// Add to upload route
import { z } from 'zod'

const uploadSchema = z.object({
  platform: z.enum(['RESIDENT_ADVISOR', 'HUMANITIX', 'MOSHTIX']),
  fileName: z.string().min(1),
  processedData: z.object({
    eventName: z.string().min(1),
    eventDate: z.string().datetime(),
    individualTickets: z.array(z.object({
      customerEmail: z.string().email().optional(),
      email: z.string().email().optional(),
      // ... other fields
    }))
  })
})
```

## 5. Health Check Endpoint

Create `/src/app/api/health/route.ts`:

```typescript
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check database connection
    const prismaModule = await import('@/lib/prisma')
    const prisma = prismaModule.default

    await prisma.$queryRaw`SELECT 1`

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected'
    })
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      error: 'Database connection failed'
    }, { status: 503 })
  }
}
```

## 6. Production Next.js Configuration

Update `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client']
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('@prisma/client')
    }
    return config
  }
}

module.exports = nextConfig
```

## 7. Database Migration Strategy

For production deployments:

```bash
# Use non-pooled connection for migrations
DATABASE_URL=$DATABASE_URL_UNPOOLED npx prisma migrate deploy

# Then start the application with pooled connection
npm start
```

## 8. Monitoring Setup

Add basic monitoring:

```bash
npm install @vercel/analytics @vercel/speed-insights
```

Then add to layout.tsx:
```typescript
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```

## Deployment Checklist

- [ ] Security vulnerabilities patched
- [ ] Environment variables properly configured
- [ ] Database connections tested
- [ ] Health check endpoint working
- [ ] Error handling improved
- [ ] Monitoring configured
- [ ] Rollback plan documented