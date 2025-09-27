import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create organization
  const organization = await prisma.organization.create({
    data: {
      name: 'Sydney Underground Techno Promoter',
    },
  });

  console.log('Created organization:', organization);

  // Create users
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@technoanalytics.com',
      name: 'Admin User',
      role: 'ADMIN',
      organizationId: organization.id,
    },
  });

  const member1 = await prisma.user.create({
    data: {
      email: 'member1@technoanalytics.com',
      name: 'Team Member 1',
      role: 'MEMBER',
      organizationId: organization.id,
    },
  });

  const member2 = await prisma.user.create({
    data: {
      email: 'member2@technoanalytics.com',
      name: 'Team Member 2',
      role: 'MEMBER',
      organizationId: organization.id,
    },
  });

  console.log('Created users:', { adminUser, member1, member2 });

  // Create sample venue
  const venue = await prisma.venue.create({
    data: {
      name: 'Club 77',
      address: '77 William St',
      city: 'Sydney',
      postcode: '2010',
      capacity: 500,
      coordinates: JSON.stringify({ lat: -33.8688, lng: 151.2093 }),
      transportNotes: 'Near Central Station',
    },
  });

  console.log('Created venue:', venue);

  // Create sample artists
  const artist1 = await prisma.artist.create({
    data: {
      name: 'DJ Shadow',
      bio: 'Underground techno pioneer',
      socialLinks: JSON.stringify({
        instagram: '@djshadow',
        soundcloud: 'djshadow',
      }),
    },
  });

  const artist2 = await prisma.artist.create({
    data: {
      name: 'Nina Kraviz',
      bio: 'Techno queen',
      socialLinks: JSON.stringify({
        instagram: '@ninakraviz',
        soundcloud: 'ninakraviz',
      }),
    },
  });

  console.log('Created artists:', { artist1, artist2 });

  // Create sample event
  const event = await prisma.event.create({
    data: {
      organizationId: organization.id,
      name: 'Warehouse Rave 2024',
      date: new Date('2024-12-31'),
      venue: venue.name,
      city: 'Sydney',
      capacity: 500,
      status: 'UPCOMING',
      platform: 'HUMANITIX',
      externalId: 'HUM-2024-001',
      metadata: JSON.stringify({
        genre: 'Techno',
        doors: '10pm',
        age: '18+',
      }),
    },
  });

  console.log('Created event:', event);

  // Link artists to event
  await prisma.eventArtist.create({
    data: {
      eventId: event.id,
      artistId: artist1.id,
      performanceOrder: 1,
      performanceTime: '11:00 PM',
    },
  });

  await prisma.eventArtist.create({
    data: {
      eventId: event.id,
      artistId: artist2.id,
      performanceOrder: 2,
      performanceTime: '1:00 AM',
    },
  });

  console.log('Linked artists to event');

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });