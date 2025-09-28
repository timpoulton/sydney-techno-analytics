import { NextResponse } from 'next/server';

export async function GET() {
  const health: any = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      api: true,
      database: false,
      environment: process.env.NODE_ENV || 'production'
    }
  };

  try {
    // Check database connection if configured
    if (process.env.DATABASE_URL) {
      const prismaModule = await import('@/lib/prisma');
      const prisma = prismaModule.default;

      // Simple query to test connection
      await prisma.$queryRaw`SELECT 1`;
      health.checks.database = true;
    } else {
      health.checks.database = 'not_configured';
      health.status = 'degraded';
    }
  } catch (error) {
    console.error('Health check database error:', error);
    health.checks.database = false;
    health.status = 'degraded';
    health.error = error instanceof Error ? error.message : 'Database connection failed';
  }

  const statusCode = health.status === 'healthy' ? 200 : 503;

  return NextResponse.json(health, { status: statusCode });
}