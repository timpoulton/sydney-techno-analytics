import { NextResponse } from 'next/server';

// API endpoint to clean up orphaned events (events with no tickets)
export async function POST() {
  try {
    // Lazy load Prisma
    const prismaModule = await import('@/lib/prisma');
    const prisma = prismaModule.default;

    // Find all events that have no tickets
    const orphanedEvents = await prisma.event.findMany({
      where: {
        tickets: {
          none: {} // Find events with no tickets
        }
      },
      select: {
        id: true,
        name: true,
        date: true
      }
    });

    // Delete orphaned events
    const deleteResult = await prisma.event.deleteMany({
      where: {
        tickets: {
          none: {}
        }
      }
    });

    return NextResponse.json({
      success: true,
      orphanedEventsFound: orphanedEvents.length,
      orphanedEventsDeleted: deleteResult.count,
      details: orphanedEvents
    });

  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup orphaned events' },
      { status: 500 }
    );
  }
}

// GET endpoint to check for orphaned events without deleting
export async function GET() {
  try {
    // Lazy load Prisma
    const prismaModule = await import('@/lib/prisma');
    const prisma = prismaModule.default;

    // Find all events that have no tickets
    const orphanedEvents = await prisma.event.findMany({
      where: {
        tickets: {
          none: {} // Find events with no tickets
        }
      },
      select: {
        id: true,
        name: true,
        date: true,
        platform: true
      }
    });

    // Also get events with tickets for comparison
    const eventsWithTickets = await prisma.event.count({
      where: {
        tickets: {
          some: {}
        }
      }
    });

    const totalEvents = await prisma.event.count();

    return NextResponse.json({
      totalEvents,
      eventsWithTickets,
      orphanedEvents: orphanedEvents.length,
      orphanedEventsList: orphanedEvents
    });

  } catch (error) {
    console.error('Cleanup check error:', error);
    return NextResponse.json(
      { error: 'Failed to check for orphaned events' },
      { status: 500 }
    );
  }
}