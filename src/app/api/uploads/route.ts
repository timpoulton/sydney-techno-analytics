import { NextRequest, NextResponse } from 'next/server';
import { Platform } from '@prisma/client';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    console.log('Upload API called');

    // Check if database is configured
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL not configured');
      return NextResponse.json(
        {
          error: 'Database not configured',
          details: 'Please set up a database following the instructions in DATABASE_SETUP.md'
        },
        { status: 503 }
      );
    }

    // Parse JSON body instead of FormData
    const body = await request.json();
    const { platform, fileName, processedData } = body;

    console.log('Received data:', {
      platform,
      fileName,
      hasProcessedData: !!processedData,
      dataKeys: processedData ? Object.keys(processedData) : []
    });

    if (!processedData) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 });
    }

    if (!platform || !Object.values(Platform).includes(platform as Platform)) {
      return NextResponse.json({ error: 'Invalid platform' }, { status: 400 });
    }

    // Get the organization (using the first one for now)
    const organization = await prisma.organization.findFirst();
    if (!organization) {
      // Create a default organization if none exists
      const newOrg = await prisma.organization.create({
        data: {
          name: 'Sydney Techno Promoters',
        }
      });
      console.log('Created organization:', newOrg);
    }

    const finalOrg = organization || await prisma.organization.findFirst();
    if (!finalOrg) {
      return NextResponse.json({ error: 'Could not create organization' }, { status: 500 });
    }

    // Get or create a user
    let user = await prisma.user.findFirst({
      where: { organizationId: finalOrg.id }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'admin@sydneytechno.com',
          name: 'Admin',
          organizationId: finalOrg.id,
        }
      });
      console.log('Created user:', user);
    }

    // Create upload record
    const upload = await prisma.upload.create({
      data: {
        organizationId: finalOrg.id,
        userId: user.id,
        filename: fileName || 'upload.csv',
        fileSize: 0, // We don't have the actual file size anymore
        platform: platform as Platform,
        status: 'PROCESSING',
      }
    });

    console.log('Created upload record:', upload.id);

    let eventsProcessed = 0;
    let recordsProcessed = 0;
    let recordsFailed = 0;
    const errors: string[] = [];

    try {
      // Handle pre-processed Resident Advisor data
      if (platform === 'RESIDENT_ADVISOR' && processedData.tickets) {
        console.log('Processing RA data with', processedData.tickets.length, 'ticket types');

        // Create or find the event
        const eventDate = new Date(processedData.eventDate);
        const externalId = `RA-${processedData.eventName}-${eventDate.toISOString().split('T')[0]}`;

        let event = await prisma.event.findFirst({
          where: {
            organizationId: finalOrg.id,
            platform: Platform.RESIDENT_ADVISOR,
            externalId,
          }
        });

        if (!event) {
          event = await prisma.event.create({
            data: {
              organizationId: finalOrg.id,
              name: processedData.eventName || 'Unnamed Event',
              date: eventDate,
              venue: processedData.venue || 'TBA',
              platform: Platform.RESIDENT_ADVISOR,
              externalId,
              status: eventDate < new Date() ? 'COMPLETED' : 'UPCOMING',
              metadata: {
                totalAttendees: processedData.totalAttendees,
                totalRevenue: processedData.totalRevenue,
                dateRange: processedData.dateRange
              },
            }
          });
          console.log('Created event:', event.id);
        } else {
          console.log('Found existing event:', event.id);
        }

        // Save consolidated tickets
        for (const ticketGroup of processedData.tickets) {
          try {
            await prisma.ticket.create({
              data: {
                eventId: event.id,
                uploadId: upload.id,
                ticketType: ticketGroup.ticketType,
                price: ticketGroup.price,
                quantity: ticketGroup.quantity,
                sold: ticketGroup.sold,
                revenue: ticketGroup.totalRevenue,
                purchaseDate: eventDate,
                metadata: {
                  averagePrice: ticketGroup.price,
                  totalForType: ticketGroup.totalRevenue
                },
              }
            });
            recordsProcessed += ticketGroup.quantity;
          } catch (err) {
            console.error('Error saving ticket group:', err);
            recordsFailed++;
            errors.push(`Failed to save ${ticketGroup.ticketType}: ${err}`);
          }
        }

        eventsProcessed = 1;

      } else if (processedData.rawData) {
        // Handle raw data from other platforms
        console.log('Processing raw data with', processedData.totalRows || processedData.rawData.length, 'rows');

        // For now, just count the records
        recordsProcessed = processedData.rawData.length;

        // You would implement Humanitix and Moshtix parsing here
        errors.push('Platform parsing not yet implemented for ' + platform);
      }

      // Update upload status
      await prisma.upload.update({
        where: { id: upload.id },
        data: {
          status: errors.length > 0 ? 'PARTIAL' : 'COMPLETED',
          recordsProcessed,
          recordsFailed,
          processedAt: new Date(),
          errorLog: errors.length > 0 ? errors.join('\n') : null,
        }
      });

      console.log('Upload processing complete:', {
        eventsProcessed,
        recordsProcessed,
        recordsFailed,
        errors: errors.length
      });

      return NextResponse.json({
        success: true,
        uploadId: upload.id,
        eventsProcessed,
        recordsProcessed,
        recordsFailed,
        errors: errors.slice(0, 10), // Limit errors returned
      });

    } catch (processingError) {
      console.error('Processing error:', processingError);

      // Update upload as failed
      await prisma.upload.update({
        where: { id: upload.id },
        data: {
          status: 'FAILED',
          errorLog: String(processingError),
        }
      });

      throw processingError;
    }

  } catch (error) {
    console.error('Upload API error:', error);

    // Log the full error details
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    return NextResponse.json(
      {
        error: 'Failed to process upload',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
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