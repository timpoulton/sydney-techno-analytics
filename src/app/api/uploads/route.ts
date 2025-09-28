import { NextRequest, NextResponse } from 'next/server';
import { normalizeTicketData, validateUploadData } from '@/lib/csv-validator';

// Platform enum - define locally to avoid Prisma dependency at build time
enum Platform {
  RESIDENT_ADVISOR = 'RESIDENT_ADVISOR',
  HUMANITIX = 'HUMANITIX',
  MOSHTIX = 'MOSHTIX'
}

export async function POST(request: NextRequest) {
  try {
    console.log('Upload API called');

    // Check if database is configured
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL not configured');
      return NextResponse.json(
        {
          error: 'Database not configured',
          details: 'Please set up a database following the instructions in DATABASE_SETUP.md',
          instructions: [
            '1. Create a free database at https://supabase.com',
            '2. Add DATABASE_URL to Vercel Environment Variables',
            '3. Redeploy your application'
          ]
        },
        { status: 503 }
      );
    }

    // Parse JSON body
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

    // Validate upload data
    const validation = validateUploadData(processedData, platform);
    if (!validation.valid) {
      return NextResponse.json({
        error: 'Invalid data format',
        details: validation.errors
      }, { status: 400 });
    }

    // Lazy load Prisma to avoid build-time dependency
    const prismaModule = await import('@/lib/prisma');
    const prisma = prismaModule.default;

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
        fileSize: 0,
        platform: platform,
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
      if (platform === 'RESIDENT_ADVISOR') {
        console.log('Processing RA data');
        console.log('Ticket types:', processedData.tickets?.length || 0);
        console.log('Individual tickets available:', processedData.individualTickets?.length || 0);

        // Create or find the event
        const eventDate = new Date(processedData.eventDate);
        const externalId = `RA-${processedData.eventName}-${eventDate.toISOString().split('T')[0]}`;

        let event = await prisma.event.findFirst({
          where: {
            organizationId: finalOrg.id,
            platform: platform,
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
              platform: platform,
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

        // Save individual tickets with customer data
        if (processedData.individualTickets && processedData.individualTickets.length > 0) {
          console.log('Processing', processedData.individualTickets.length, 'individual tickets');
          // Save individual ticket records with customer data
          for (const ticket of processedData.individualTickets) {
            const normalizedTicket = normalizeTicketData(ticket, platform);

            try {
              // Ensure price and revenue are valid numbers for Decimal type
              const ticketPrice = parseFloat(normalizedTicket.price?.toString() || '0');
              const ticketQuantity = parseInt(normalizedTicket.quantity?.toString() || '1');
              const ticketRevenue = ticketPrice * ticketQuantity;

              // Skip invalid tickets
              if (isNaN(ticketPrice) || ticketPrice < 0) {
                console.warn('Skipping ticket with invalid price:', normalizedTicket);
                recordsFailed++;
                errors.push(`Invalid price for ticket: ${normalizedTicket.orderNumber || 'unknown'}`);
                continue;
              }

              await prisma.ticket.create({
                data: {
                  eventId: event.id,
                  uploadId: upload.id,
                  ticketType: normalizedTicket.ticketType || 'General Admission',
                  price: ticketPrice,
                  quantity: ticketQuantity,
                  sold: ticketQuantity,
                  revenue: ticketRevenue,
                  purchaseDate: new Date(normalizedTicket.purchaseDate),
                  // Store customer data with normalized field names
                  customerEmail: normalizedTicket.customerEmail || null,
                  customerPostcode: normalizedTicket.customerPostcode || null,
                  customerName: normalizedTicket.customerName || null,
                  marketingOptIn: normalizedTicket.marketingOptIn || false,
                  orderNumber: normalizedTicket.orderNumber || null,
                  barcode: normalizedTicket.barcode || null,
                  metadata: {
                    status: normalizedTicket.status,
                    discountCode: normalizedTicket.discountCode,
                    ...ticket.metadata
                  },
                }
              });
              recordsProcessed++;
            } catch (err: any) {
              console.error('Error saving ticket:', err);
              recordsFailed++;
              const errorMessage = err.message || err.toString();
              errors.push(`Ticket ${normalizedTicket.orderNumber || 'unknown'}: ${errorMessage}`);
            }
          }
        } else {
          // Fallback to consolidated tickets for backward compatibility
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
        }

        eventsProcessed = 1;

      } else if (platform === 'HUMANITIX') {
        console.log('Processing Humanitix data');
        console.log('Ticket types:', processedData.tickets?.length || 0);
        console.log('Individual tickets available:', processedData.individualTickets?.length || 0);

        // Create or find the event
        const eventDate = new Date(processedData.eventDate);
        const externalId = `HUM-${processedData.eventName}-${eventDate.toISOString().split('T')[0]}`;

        let event = await prisma.event.findFirst({
          where: {
            organizationId: finalOrg.id,
            platform: platform,
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
              platform: platform,
              externalId,
              status: eventDate < new Date() ? 'COMPLETED' : 'UPCOMING',
              metadata: {
                totalAttendees: processedData.totalAttendees,
                totalRevenue: processedData.totalRevenue,
              },
            }
          });
          console.log('Created Humanitix event:', event.id);
        } else {
          console.log('Found existing Humanitix event:', event.id);
        }

        // Save individual tickets with customer data
        if (processedData.individualTickets && processedData.individualTickets.length > 0) {
          console.log('Processing', processedData.individualTickets.length, 'individual Humanitix tickets');
          for (const ticket of processedData.individualTickets) {
            const normalizedTicket = normalizeTicketData(ticket, platform);

            try {
              // Ensure price and revenue are valid numbers for Decimal type
              const ticketPrice = parseFloat(normalizedTicket.price?.toString() || '0');
              const ticketQuantity = parseInt(normalizedTicket.quantity?.toString() || '1');
              const ticketRevenue = ticketPrice * ticketQuantity;

              // Skip invalid tickets
              if (isNaN(ticketPrice) || ticketPrice < 0) {
                console.warn('Skipping Humanitix ticket with invalid price:', normalizedTicket);
                recordsFailed++;
                errors.push(`Invalid price for ticket: ${normalizedTicket.orderNumber || 'unknown'}`);
                continue;
              }

              await prisma.ticket.create({
                data: {
                  eventId: event.id,
                  uploadId: upload.id,
                  ticketType: normalizedTicket.ticketType || 'General Admission',
                  price: ticketPrice,
                  quantity: ticketQuantity,
                  sold: ticketQuantity,
                  revenue: ticketRevenue,
                  purchaseDate: new Date(normalizedTicket.purchaseDate),
                  customerEmail: normalizedTicket.customerEmail || null,
                  customerPostcode: normalizedTicket.customerPostcode || null,
                  customerName: normalizedTicket.customerName || null,
                  marketingOptIn: normalizedTicket.marketingOptIn || false,
                  orderNumber: normalizedTicket.orderNumber || null,
                  barcode: normalizedTicket.barcode || null,
                  metadata: {
                    status: normalizedTicket.status,
                    discountCode: normalizedTicket.discountCode,
                    ...ticket.metadata
                  },
                }
              });
              recordsProcessed++;
            } catch (err: any) {
              console.error('Error saving Humanitix ticket:', err);
              recordsFailed++;
              const errorMessage = err.message || err.toString();
              errors.push(`Humanitix ticket ${normalizedTicket.orderNumber || 'unknown'}: ${errorMessage}`);
            }
          }
        }

        eventsProcessed = 1;

      } else if (processedData.rawData) {
        // Handle raw data from other platforms
        console.log('Processing raw data with', processedData.totalRows || processedData.rawData.length, 'rows');
        recordsProcessed = processedData.rawData.length;
        errors.push('Platform parsing not yet implemented for ' + platform);
      }

      // Update upload status with better error handling
      const uploadStatus = recordsProcessed > 0 ? 'COMPLETED' : 'FAILED';
      const finalErrorLog = errors.length > 0
        ? errors.join('\n')
        : (recordsProcessed === 0 ? 'No records were processed. The CSV may be empty or in an incorrect format.' : null);

      await prisma.upload.update({
        where: { id: upload.id },
        data: {
          status: uploadStatus,
          recordsProcessed,
          recordsFailed,
          processedAt: new Date(),
          errorLog: finalErrorLog,
        }
      });

      console.log('Upload processing complete:', {
        eventsProcessed,
        recordsProcessed,
        recordsFailed,
        errors: errors.length
      });

      // Create a summary of errors by type
      const errorSummary: Record<string, number> = {};
      errors.forEach(error => {
        // Extract error type from message
        const errorType = error.includes('Invalid price') ? 'Invalid price' :
                         error.includes('Invalid date') ? 'Invalid date' :
                         error.includes('duplicate key') ? 'Duplicate record' :
                         'Other error';
        errorSummary[errorType] = (errorSummary[errorType] || 0) + 1;
      });

      return NextResponse.json({
        success: true,
        uploadId: upload.id,
        eventsProcessed,
        recordsProcessed,
        recordsFailed,
        errors: errors.slice(0, 5), // Only show first 5 detailed errors
        errorSummary: recordsFailed > 0 ? errorSummary : undefined,
        message: recordsProcessed > 0
          ? `Successfully processed ${recordsProcessed} tickets${recordsFailed > 0 ? `, ${recordsFailed} failed` : ''}`
          : 'No records were processed'
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
        details: error instanceof Error ? error.message : 'Unknown error',
        note: 'Check DATABASE_SETUP.md for setup instructions'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if database is configured
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        message: 'Database not configured',
        instructions: 'Please follow DATABASE_SETUP.md to configure your database'
      });
    }

    // Lazy load Prisma
    const prismaModule = await import('@/lib/prisma');
    const prisma = prismaModule.default;

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

export async function DELETE(request: NextRequest) {
  try {
    // Check if database is configured
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    // Get upload ID from query params
    const { searchParams } = new URL(request.url);
    const uploadId = searchParams.get('id');

    if (!uploadId) {
      return NextResponse.json(
        { error: 'Upload ID is required' },
        { status: 400 }
      );
    }

    // Lazy load Prisma
    const prismaModule = await import('@/lib/prisma');
    const prisma = prismaModule.default;

    // Get all unique eventIds from tickets that will be deleted
    const affectedEvents = await prisma.ticket.findMany({
      where: { uploadId },
      select: { eventId: true },
      distinct: ['eventId']
    });

    // Delete all tickets associated with this upload
    await prisma.ticket.deleteMany({
      where: { uploadId }
    });

    // Then delete the upload record
    const deletedUpload = await prisma.upload.delete({
      where: { id: uploadId }
    });

    // Check if we should also delete orphaned events (if no tickets remain)
    for (const ticket of affectedEvents) {
      const remainingTickets = await prisma.ticket.count({
        where: { eventId: ticket.eventId }
      });

      if (remainingTickets === 0) {
        // Delete the event if no tickets remain
        await prisma.event.delete({
          where: { id: ticket.eventId }
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Upload and associated data deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting upload:', error);
    return NextResponse.json(
      { error: 'Failed to delete upload' },
      { status: 500 }
    );
  }
}