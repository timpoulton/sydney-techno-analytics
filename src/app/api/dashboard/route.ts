import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Lazy load Prisma
    const prismaModule = await import('@/lib/prisma');
    const prisma = prismaModule.default;

    // Get total events
    const totalEvents = await prisma.event.count();

    // Get total revenue from tickets
    const ticketAggregates = await prisma.ticket.aggregate({
      _sum: {
        revenue: true,
      },
      _count: {
        id: true,
      }
    });

    // Get upcoming events count
    const upcomingEvents = await prisma.event.count({
      where: {
        date: {
          gte: new Date()
        }
      }
    });

    // Get recent uploads
    const recentUploads = await prisma.upload.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        filename: true,
        platform: true,
        status: true,
        createdAt: true,
        recordsProcessed: true,
      }
    });

    // Get monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const events = await prisma.event.findMany({
      where: {
        date: {
          gte: sixMonthsAgo
        }
      },
      include: {
        tickets: true
      }
    });

    // Calculate monthly revenue
    const monthlyRevenueMap = new Map<string, number>();
    events.forEach((event: any) => {
      const monthKey = new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      const eventRevenue = event.tickets.reduce((sum: number, ticket: any) => sum + Number(ticket.revenue || 0), 0);
      monthlyRevenueMap.set(monthKey, (monthlyRevenueMap.get(monthKey) || 0) + eventRevenue);
    });

    const monthlyRevenue = Array.from(monthlyRevenueMap.entries())
      .map(([month, revenue]) => ({ month, revenue }))
      .sort((a, b) => {
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA.getTime() - dateB.getTime();
      });

    // Get platform breakdown
    const platformCounts = await prisma.event.groupBy({
      by: ['platform'],
      _count: {
        id: true
      }
    });

    const platformBreakdown = platformCounts.map((p: any) => ({
      platform: p.platform,
      count: p._count.id
    }));

    return NextResponse.json({
      totalEvents,
      totalRevenue: Number(ticketAggregates._sum.revenue || 0),
      totalTicketsSold: ticketAggregates._count.id || 0,
      upcomingEvents,
      recentUploads,
      monthlyRevenue,
      platformBreakdown,
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard metrics' },
      { status: 500 }
    );
  }
}