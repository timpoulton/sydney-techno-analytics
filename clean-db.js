const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanDatabase() {
  try {
    console.log('Cleaning database...');
    
    // Delete all tickets first (due to foreign key constraints)
    const deletedTickets = await prisma.ticket.deleteMany({});
    console.log(`Deleted ${deletedTickets.count} tickets`);
    
    // Delete all event artists
    const deletedEventArtists = await prisma.eventArtist.deleteMany({});
    console.log(`Deleted ${deletedEventArtists.count} event artists`);
    
    // Delete all event metrics
    const deletedEventMetrics = await prisma.eventMetrics.deleteMany({});
    console.log(`Deleted ${deletedEventMetrics.count} event metrics`);
    
    // Delete all uploads
    const deletedUploads = await prisma.upload.deleteMany({});
    console.log(`Deleted ${deletedUploads.count} uploads`);
    
    // Delete all events
    const deletedEvents = await prisma.event.deleteMany({});
    console.log(`Deleted ${deletedEvents.count} events`);
    
    console.log('Database cleaned successfully');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDatabase();
