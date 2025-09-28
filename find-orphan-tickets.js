const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const tickets = await prisma.ticket.findMany({
      include: {
        upload: {
          select: {
            filename: true,
            status: true
          }
        }
      }
    });

    console.log('Total tickets:', tickets.length);
    
    // Group by upload
    const byUpload = {};
    tickets.forEach(ticket => {
      const uploadName = ticket.upload?.filename || 'NO UPLOAD';
      if (!byUpload[uploadName]) {
        byUpload[uploadName] = [];
      }
      byUpload[uploadName].push(ticket);
    });

    console.log('\nTickets grouped by upload:');
    for (const [uploadName, tix] of Object.entries(byUpload)) {
      console.log(`${uploadName}: ${tix.length} tickets`);
      if (tix.length > 0 && tix.length <= 3) {
        tix.forEach(t => {
          console.log(`  - ${t.ticketType}: ${t.price}`);
        });
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
