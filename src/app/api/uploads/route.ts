import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Platform } from '@prisma/client';
import { ParserFactory } from '@/lib/parsers/parser-factory';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const platform = formData.get('platform') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!platform || !Object.values(Platform).includes(platform as Platform)) {
      return NextResponse.json({ error: 'Invalid platform' }, { status: 400 });
    }

    // Get the organization (using the first one for now)
    const organization = await prisma.organization.findFirst();
    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // For now, use the first user as the uploader
    const user = await prisma.user.findFirst({
      where: { organizationId: organization.id }
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create upload record
    const upload = await prisma.upload.create({
      data: {
        organizationId: organization.id,
        userId: user.id,
        filename: file.name,
        fileSize: file.size,
        platform: platform as Platform,
        status: 'PROCESSING',
      }
    });

    // Read file content
    const csvContent = await file.text();

    // Parse CSV
    const parser = ParserFactory.getParser(platform as Platform);
    const parseResult = await parser.parse(csvContent);

    // Save events and tickets to database
    for (const parsedEvent of parseResult.events) {
      // Check if event already exists
      const existingEvent = await prisma.event.findFirst({
        where: {
          organizationId: organization.id,
          platform: parsedEvent.platform,
          externalId: parsedEvent.externalId,
        }
      });

      let event;
      if (existingEvent) {
        event = existingEvent;
      } else {
        event = await prisma.event.create({
          data: {
            organizationId: organization.id,
            name: parsedEvent.name,
            date: parsedEvent.date,
            venue: parsedEvent.venue,
            platform: parsedEvent.platform,
            externalId: parsedEvent.externalId,
            status: parsedEvent.date < new Date() ? 'COMPLETED' : 'UPCOMING',
            metadata: parsedEvent.metadata,
          }
        });
      }

      // Save tickets
      for (const ticket of parsedEvent.tickets) {
        await prisma.ticket.create({
          data: {
            eventId: event.id,
            uploadId: upload.id,
            ticketType: ticket.ticketType,
            price: ticket.price,
            quantity: ticket.quantity,
            sold: ticket.sold,
            revenue: ticket.price * ticket.sold,
            purchaseDate: ticket.purchaseDate,
            buyerEmail: ticket.buyerEmail,
            buyerPostcode: ticket.buyerPostcode,
            metadata: ticket.metadata,
          }
        });
      }
    }

    // Update upload status
    await prisma.upload.update({
      where: { id: upload.id },
      data: {
        status: 'COMPLETED',
        recordsProcessed: parseResult.successfulRows,
        recordsFailed: parseResult.failedRows,
        processedAt: new Date(),
        errorLog: parseResult.errors.length > 0 ? parseResult.errors.join('\n') : null,
      }
    });

    return NextResponse.json({
      success: true,
      uploadId: upload.id,
      eventsProcessed: parseResult.events.length,
      recordsProcessed: parseResult.successfulRows,
      recordsFailed: parseResult.failedRows,
      errors: parseResult.errors,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process upload' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const uploads = await prisma.upload.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        }
      }
    });

    return NextResponse.json(uploads);
  } catch (error) {
    console.error('Error fetching uploads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch uploads' },
      { status: 500 }
    );
  }
}