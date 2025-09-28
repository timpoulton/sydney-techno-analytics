import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Lazy load Prisma
    const prismaModule = await import('@/lib/prisma');
    const prisma = prismaModule.default;

    // Get all tickets with customer data
    // Try new schema fields, fall back to old ones
    const tickets = await prisma.ticket.findMany({
      select: {
        buyerEmail: true,
        buyerPostcode: true,
        quantity: true,
        metadata: true,
      }
    });

    // Calculate customer metrics
    const customerMap = new Map<string, any>();
    let totalOptIns = 0;
    const postcodes = new Set<string>();

    tickets.forEach((ticket: any) => {
      // Extract customer data from metadata or direct fields
      const email = ticket.buyerEmail || ticket.metadata?.customerEmail;
      const name = ticket.metadata?.customerName || '';
      const postcode = ticket.buyerPostcode || ticket.metadata?.customerPostcode;
      const marketingOptIn = ticket.metadata?.marketingOptIn || false;

      if (email) {
        if (!customerMap.has(email)) {
          customerMap.set(email, {
            email: email,
            name: name,
            postcode: postcode,
            totalTickets: 0,
            marketingOptIn: marketingOptIn,
          });

          if (marketingOptIn) {
            totalOptIns++;
          }
        }

        const customer = customerMap.get(email);
        customer.totalTickets += (ticket.quantity || 1);

        if (postcode) {
          postcodes.add(postcode);
        }
      }
    });

    const totalCustomers = customerMap.size;
    const totalTickets = tickets.reduce((sum: number, t: any) => sum + (t.quantity || 1), 0);

    // Get top customers
    const topCustomers = Array.from(customerMap.values())
      .sort((a, b) => b.totalTickets - a.totalTickets)
      .slice(0, 10);

    // Get postcode distribution
    const postcodeList = Array.from(postcodes);
    const postcodeDistribution = postcodeList.reduce((acc: any, postcode: string) => {
      const count = tickets.filter((t: any) => {
        const ticketPostcode = t.buyerPostcode || t.metadata?.customerPostcode;
        return ticketPostcode === postcode;
      }).length;
      acc[postcode] = count;
      return acc;
    }, {});

    // Sort postcodes by count and get top 10
    const topPostcodes = Object.entries(postcodeDistribution)
      .sort((a: any, b: any) => b[1] - a[1])
      .slice(0, 10)
      .map(([postcode, count]) => ({ postcode, count }));

    return NextResponse.json({
      totalCustomers,
      totalTickets,
      marketingOptIns: totalOptIns,
      uniquePostcodes: postcodes.size,
      avgTicketsPerCustomer: totalCustomers > 0 ? totalTickets / totalCustomers : 0,
      topCustomers,
      topPostcodes,
      optInRate: totalCustomers > 0 ? (totalOptIns / totalCustomers) * 100 : 0,
    });

  } catch (error) {
    console.error('Error fetching customer metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer metrics' },
      { status: 500 }
    );
  }
}