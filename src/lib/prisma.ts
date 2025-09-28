// Dynamic Prisma client that handles missing database gracefully
let PrismaClient: any;
let prisma: any;

try {
  // Try to import Prisma Client
  const prismaModule = require('@prisma/client');
  PrismaClient = prismaModule.PrismaClient;

  // Create singleton instance
  const globalForPrisma = global as any;

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }

  prisma = globalForPrisma.prisma;
} catch (e) {
  console.warn('Prisma Client not generated. Database features will be unavailable.');

  // Create a mock Prisma client that returns helpful errors
  prisma = new Proxy({}, {
    get() {
      return new Proxy(() => {}, {
        apply() {
          throw new Error('Database not configured. Please follow DATABASE_SETUP.md');
        },
        get() {
          return this;
        }
      });
    }
  });
}

export default prisma;