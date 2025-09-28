import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Lazy load Prisma
    const prismaModule = await import('@/lib/prisma');
    const prisma = prismaModule.default;

    const events = await prisma.event.findMany({
      orderBy: {
        date: 'desc'
      },
      include: {
        tickets: true
      }
    });

    // Calculate aggregated data for each event
    const eventsWithMetrics = events.map(event => {
      const ticketsSold = event.tickets.reduce((sum, ticket) => sum + (ticket.sold || 0), 0);
      const totalRevenue = event.tickets.reduce((sum, ticket) => sum + Number(ticket.revenue || 0), 0);

      return {
        id: event.id,
        name: event.name,
        date: event.date,
        venue: event.venue,
        platform: event.platform,
        status: event.status,
        ticketsSold,
        totalRevenue,
      };
    });

    return NextResponse.json(eventsWithMetrics);

  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}