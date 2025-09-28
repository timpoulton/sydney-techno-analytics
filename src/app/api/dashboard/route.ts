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

    // More efficient: Get tickets with their event dates for aggregation
    const ticketsWithDates = await prisma.ticket.findMany({
      where: {
        event: {
          date: {
            gte: sixMonthsAgo
          }
        }
      },
      select: {
        revenue: true,
        event: {
          select: {
            date: true
          }
        }
      }
    });

    // Calculate monthly revenue
    const monthlyRevenueMap = new Map<string, number>();
    ticketsWithDates.forEach((ticket: any) => {
      const monthKey = new Date(ticket.event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      monthlyRevenueMap.set(monthKey, (monthlyRevenueMap.get(monthKey) || 0) + Number(ticket.revenue || 0));
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