const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Get the failed upload
    const failedUpload = await prisma.upload.findFirst({
      where: {
        filename: 'order-report-(exported-2025-09-28@01.32.11).csv',
        status: 'FAILED'
      },
      include: {
        tickets: true
      }
    });

    if (failedUpload) {
      console.log('Failed upload found:');
      console.log('ID:', failedUpload.id);
      console.log('Status:', failedUpload.status);
      console.log('Records processed:', failedUpload.recordsProcessed);
      console.log('Records failed:', failedUpload.recordsFailed);
      console.log('Error log:', failedUpload.errorLog);
      console.log('Tickets associated:', failedUpload.tickets.length);
      
      if (failedUpload.tickets.length > 0) {
        console.log('\nTICKETS WERE ACTUALLY SAVED!');
        console.log('First ticket:', {
          type: failedUpload.tickets[0].ticketType,
          price: failedUpload.tickets[0].price,
          email: failedUpload.tickets[0].customerEmail
        });
      }
    } else {
      console.log('No failed upload found with that filename');
    }

    // Check all uploads
    const allUploads = await prisma.upload.findMany({
      select: {
        id: true,
        filename: true,
        status: true,
        recordsProcessed: true,
        _count: {
          select: { tickets: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log('\nAll uploads:');
    allUploads.forEach(upload => {
      console.log(`- ${upload.filename}: ${upload.status} (processed: ${upload.recordsProcessed}, actual tickets: ${upload._count.tickets})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
