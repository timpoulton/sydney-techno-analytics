const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  try {
    // Count records in each table
    const uploads = await prisma.upload.count();
    const events = await prisma.event.count();
    const tickets = await prisma.ticket.count();
    
    console.log('Database record counts:');
    console.log('- Uploads:', uploads);
    console.log('- Events:', events);
    console.log('- Tickets:', tickets);
    
    // Show latest upload
    const latestUpload = await prisma.upload.findFirst({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { tickets: true }
        }
      }
    });
    
    if (latestUpload) {
      console.log('\nLatest upload:');
      console.log('- ID:', latestUpload.id);
      console.log('- File:', latestUpload.filename);
      console.log('- Platform:', latestUpload.platform);
      console.log('- Status:', latestUpload.status);
      console.log('- Records Processed:', latestUpload.recordsProcessed);
      console.log('- Ticket Count:', latestUpload._count.tickets);
      console.log('- Created:', latestUpload.createdAt);
    }
    
    // Show latest event
    const latestEvent = await prisma.event.findFirst({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { tickets: true }
        }
      }
    });
    
    if (latestEvent) {
      console.log('\nLatest event:');
      console.log('- ID:', latestEvent.id);
      console.log('- Name:', latestEvent.name);
      console.log('- Date:', latestEvent.date);
      console.log('- Platform:', latestEvent.platform);
      console.log('- Ticket Count:', latestEvent._count.tickets);
    }
    
    // Sample ticket data
    const sampleTickets = await prisma.ticket.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        ticketType: true,
        price: true,
        quantity: true,
        customerEmail: true,
        customerName: true,
        eventId: true,
        uploadId: true
      }
    });
    
    if (sampleTickets.length > 0) {
      console.log('\nSample tickets:');
      sampleTickets.forEach((ticket, i) => {
        console.log(`\nTicket ${i + 1}:`);
        console.log('- Type:', ticket.ticketType);
        console.log('- Price:', ticket.price);
        console.log('- Quantity:', ticket.quantity);
        console.log('- Customer:', ticket.customerEmail || 'N/A');
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
