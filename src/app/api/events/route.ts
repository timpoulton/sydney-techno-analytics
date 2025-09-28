import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Lazy load Prisma
    const prismaModule = await import('@/lib/prisma');
    const prisma = prismaModule.default;

    // Get events without including all tickets (more efficient)
    const events = await prisma.event.findMany({
      orderBy: {
        date: 'desc'
      },
      select: {
        id: true,
        name: true,
        date: true,
        venue: true,
        platform: true,
        status: true,
        metadata: true,
      }
    });

    // Get aggregated ticket data separately for better performance
    const eventsWithMetrics = await Promise.all(
      events.map(async (event: any) => {
        // Get aggregated ticket data for this event
        const ticketStats = await prisma.ticket.aggregate({
          where: { eventId: event.id },
          _sum: {
            sold: true,
            revenue: true,
          },
          _count: {
            id: true,
          }
        });

        return {
          id: event.id,
          name: event.name,
          date: event.date,
          venue: event.venue,
          platform: event.platform,
          status: event.status,
          ticketsSold: ticketStats._sum.sold || 0,
          totalRevenue: Number(ticketStats._sum.revenue || 0),
          ticketCount: ticketStats._count.id || 0,
        };
      })
    );

    return NextResponse.json(eventsWithMetrics);

  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}