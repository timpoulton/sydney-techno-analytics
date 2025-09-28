const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('\n=== DATABASE CHECK ===\n');

    // Check uploads
    const uploads = await prisma.upload.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    console.log(`Found ${uploads.length} uploads:`);
    uploads.forEach(u => {
      console.log(`  - ${u.filename}: ${u.status} (${u.recordsProcessed} records)`);
    });

    // Check events
    const events = await prisma.event.count();
    console.log(`\nTotal events: ${events}`);

    // Check tickets
    const tickets = await prisma.ticket.count();
    console.log(`Total tickets: ${tickets}`);

    // Check recent tickets
    const recentTickets = await prisma.ticket.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { event: true }
    });

    if (recentTickets.length > 0) {
      console.log('\nRecent tickets:');
      recentTickets.forEach(t => {
        console.log(`  - ${t.ticketType} for ${t.event.name}: $${t.price}`);
      });
    }

    // Check if individualTickets are being stored with customer data
    const ticketsWithCustomerData = await prisma.ticket.count({
      where: {
        OR: [
          { customerEmail: { not: null } },
          { customerName: { not: null } },
          { customerPostcode: { not: null } }
        ]
      }
    });
    console.log(`\nTickets with customer data: ${ticketsWithCustomerData}`);

    console.log('\n=== END CHECK ===\n');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
