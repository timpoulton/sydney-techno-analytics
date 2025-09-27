import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    // Test connection
    const organizationCount = await prisma.organization.count();
    const userCount = await prisma.user.count();
    const eventCount = await prisma.event.count();
    const venueCount = await prisma.venue.count();
    const artistCount = await prisma.artist.count();

    console.log('🎉 Database Connection Successful!');
    console.log('-----------------------------------');
    console.log(`Organizations: ${organizationCount}`);
    console.log(`Users: ${userCount}`);
    console.log(`Events: ${eventCount}`);
    console.log(`Venues: ${venueCount}`);
    console.log(`Artists: ${artistCount}`);

    // Get the organization and users
    const org = await prisma.organization.findFirst({
      include: {
        users: true,
        events: true
      }
    });

    console.log('\n📊 Organization Details:');
    console.log(`Name: ${org?.name}`);
    console.log(`Team Members: ${org?.users.length}/3`);
    console.log(`Events: ${org?.events.length}`);

    console.log('\n✅ All systems operational!');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();