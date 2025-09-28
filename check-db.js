const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('Checking database content...\n');

    // Check events
    const events = await prisma.event.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    console.log(`Found ${events.length} events:`);
    events.forEach(event => {
      console.log(`- ${event.name} (${event.platform}) - ${event.date}`);
    });

    // Check tickets
    const ticketCount = await prisma.ticket.count();
    console.log(`\nTotal tickets: ${ticketCount}`);

    // Check recent uploads
    const uploads = await prisma.upload.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3
    });
    console.log(`\nRecent uploads: ${uploads.length}`);
    uploads.forEach(upload => {
      console.log(`- ${upload.filename} (${upload.status}) - ${upload.recordsProcessed} records`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();