import { Platform } from '@prisma/client';
import { BaseCSVParser, ParsedEvent, ParsedTicket, ParseResult } from './base-parser';

interface ResidentAdvisorRow {
  'Event': string;
  'Date': string;
  'Venue': string;
  'Tickets Sold': string;
  'Revenue': string;
  'Ticket Type'?: string;
  'Price'?: string;
}

export class ResidentAdvisorParser extends BaseCSVParser {
  constructor() {
    super(Platform.RESIDENT_ADVISOR);
  }

  async parse(csvContent: string): Promise<ParseResult> {
    const lines = csvContent.trim().split('\n');

    // Check if it's tab-separated (common for RA exports)
    const isTabSeparated = lines[0].includes('\t');
    const separator = isTabSeparated ? '\t' : ',';

    const headers = lines[0].split(separator).map(h => h.trim().replace(/^"|"$/g, ''));

    console.log('RA Parser - Separator detected:', separator === '\t' ? 'TAB' : 'COMMA');
    console.log('RA Parser - Headers found:', headers);
    console.log('RA Parser - Total lines:', lines.length);
    console.log('RA Parser - First data row:', lines[1]?.substring(0, 200));

    const events: ParsedEvent[] = [];
    const errors: string[] = [];
    let successfulRows = 0;
    let failedRows = 0;

    // Try to detect the CSV format type
    const isAttendeeList = this.detectAttendeeListFormat(headers);
    const isSalesReport = this.detectSalesReportFormat(headers);

    console.log('RA Parser - Format detected:', { isAttendeeList, isSalesReport });

    if (isAttendeeList) {
      // Parse as attendee list format
      return this.parseAttendeeList(lines, headers, separator);
    } else if (isSalesReport) {
      // Parse as sales report format
      return this.parseSalesReport(lines, headers, separator);
    } else {
      // Try generic parsing with more flexible field matching
      return this.parseGeneric(lines, headers);
    }
  }

  private detectAttendeeListFormat(headers: string[]): boolean {
    const attendeeIndicators = ['Name', 'Email', 'Ticket', 'Order', 'Buyer', 'Attendee'];
    return attendeeIndicators.some(indicator =>
      headers.some(header => header.toLowerCase().includes(indicator.toLowerCase()))
    );
  }

  private detectSalesReportFormat(headers: string[]): boolean {
    const salesIndicators = ['Revenue', 'Sales', 'Sold', 'Income', 'Total'];
    return salesIndicators.some(indicator =>
      headers.some(header => header.toLowerCase().includes(indicator.toLowerCase()))
    );
  }

  private parseAttendeeList(lines: string[], headers: string[], separator: string = ','): ParseResult {
    const errors: string[] = [];
    let successfulRows = 0;
    let failedRows = 0;

    // Extract event info from filename or first row if available
    const eventName = this.extractEventName(lines, headers);
    const eventDate = this.extractEventDateFromData(lines, headers, separator);

    // Group tickets by type
    const ticketGroups: Map<string, ParsedTicket[]> = new Map();

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = separator === '\t' ? lines[i].split('\t') : this.parseCSVLine(lines[i]);
        const row = this.mapToRow(headers, values);

        // Find ticket type field - matches exactly "Ticket type" from your data
        const ticketType = row['Ticket type'] || row['Ticket Type'] || 'General Admission';

        // Find price field - matches "Price" from your data
        const priceValue = row['Price'];
        const price = priceValue ? this.parsePrice(priceValue) : 0;

        // Find buyer info - matches "Email" and "Postcode" from your data
        const buyerEmail = row['Email'];
        const buyerPostcode = row['Postcode'] || row['Shipping Postcode'];

        // Find purchase date - matches "Date purchased" from your data
        const dateValue = row['Date purchased'] || row['Date'];
        const purchaseDate = dateValue ? this.parseDateFlexible(dateValue) : new Date();

        if (!ticketGroups.has(ticketType)) {
          ticketGroups.set(ticketType, []);
        }

        ticketGroups.get(ticketType)?.push({
          ticketType,
          price: price,
          quantity: 1,
          sold: 1,
          purchaseDate: purchaseDate,
          buyerEmail,
          buyerPostcode,
          metadata: {
            row: i,
            orderNumber: row['Order number'],
            billingName: row['Billing name'],
            barcode: row['Barcode']
          }
        });

        successfulRows++;
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error}`);
        failedRows++;
      }
    }

    // Consolidate tickets by type
    const consolidatedTickets: ParsedTicket[] = [];
    for (const [type, tickets] of ticketGroups.entries()) {
      const avgPrice = tickets.reduce((sum, t) => sum + t.price, 0) / tickets.length;
      consolidatedTickets.push({
        ticketType: type,
        price: avgPrice,
        quantity: tickets.length,
        sold: tickets.length,
        purchaseDate: tickets[0].purchaseDate,
        metadata: {
          totalRevenue: avgPrice * tickets.length,
          sampleEmails: tickets.slice(0, 3).map(t => t.buyerEmail).filter(Boolean),
          samplePostcodes: tickets.slice(0, 3).map(t => t.buyerPostcode).filter(Boolean)
        }
      });
    }

    const event: ParsedEvent = {
      name: eventName || 'Unnamed Event',
      date: eventDate || new Date(),
      venue: this.extractVenue(lines, headers) || 'TBA',
      externalId: `RA-${eventName?.replace(/\s+/g, '-')}-${eventDate?.toISOString().split('T')[0]}`,
      platform: this.platform,
      tickets: consolidatedTickets,
      metadata: {
        source: 'Resident Advisor Attendee List',
        format: 'attendee_list',
        totalAttendees: successfulRows
      }
    };

    return {
      events: consolidatedTickets.length > 0 ? [event] : [],
      errors,
      totalRows: lines.length - 1,
      successfulRows,
      failedRows
    };
  }

  private parseSalesReport(lines: string[], headers: string[], separator: string = ','): ParseResult {
    const events: ParsedEvent[] = [];
    const errors: string[] = [];
    let successfulRows = 0;
    let failedRows = 0;

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = separator === '\t' ? lines[i].split('\t') : this.parseCSVLine(lines[i]);
        const row = this.mapToRow(headers, values);

        const eventName = this.findFieldValue(row, ['Event', 'Event Name', 'Title', 'Name']);
        const ticketsSold = this.findNumberValue(row, ['Tickets Sold', 'Sold', 'Quantity', 'Sales']);
        const revenue = this.findPriceValue(row, ['Revenue', 'Total', 'Income', 'Amount']);
        const eventDate = this.findDateValue(row, ['Date', 'Event Date', 'Start Date']);
        const venue = this.findFieldValue(row, ['Venue', 'Location', 'Place']);

        const averagePrice = ticketsSold > 0 ? revenue / ticketsSold : 0;

        const event: ParsedEvent = {
          name: eventName || 'Unnamed Event',
          date: eventDate || new Date(),
          venue: venue || 'TBA',
          externalId: `RA-${eventName?.replace(/\s+/g, '-')}-${eventDate?.toISOString().split('T')[0]}`,
          platform: this.platform,
          tickets: [{
            ticketType: this.findFieldValue(row, ['Ticket Type', 'Type']) || 'General Admission',
            price: averagePrice,
            quantity: ticketsSold,
            sold: ticketsSold,
            purchaseDate: eventDate || new Date(),
            metadata: {
              totalRevenue: revenue,
            }
          }],
          metadata: {
            source: 'Resident Advisor Sales Report',
            format: 'sales_report',
            totalRevenue: revenue,
          }
        };

        events.push(event);
        successfulRows++;
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error}`);
        failedRows++;
      }
    }

    return {
      events,
      errors,
      totalRows: lines.length - 1,
      successfulRows,
      failedRows,
    };
  }

  private parseGeneric(lines: string[], headers: string[]): ParseResult {
    const errors: string[] = [];
    errors.push(`Unable to detect CSV format. Headers found: ${headers.join(', ')}`);

    return {
      events: [],
      errors,
      totalRows: lines.length - 1,
      successfulRows: 0,
      failedRows: lines.length - 1,
    };
  }

  private extractEventName(lines: string[], headers: string[]): string | null {
    // Try to extract from headers or filename
    // This is a placeholder - would need actual filename or metadata
    return 'Event from RA Import';
  }

  private extractEventDate(lines: string[], headers: string[]): Date | null {
    // Try to extract from headers or filename
    // Look for date patterns in the first few rows
    return new Date();
  }

  private extractEventDateFromData(lines: string[], headers: string[], separator: string): Date | null {
    // Try to find the most common or earliest date from the data
    if (lines.length > 1) {
      const values = separator === '\t' ? lines[1].split('\t') : lines[1].split(',');
      const row = this.mapToRow(headers, values);
      const dateField = row['Date purchased'] || row['Date'] || row['Event Date'];

      if (dateField) {
        try {
          return this.parseDateFlexible(dateField);
        } catch {
          // Fall back to current date
        }
      }
    }

    return new Date();
  }

  private extractVenue(lines: string[], headers: string[]): string | null {
    // Try to find venue information
    return null;
  }

  private findFieldValue(row: Record<string, string>, possibleNames: string[]): string | undefined {
    for (const name of possibleNames) {
      for (const [key, value] of Object.entries(row)) {
        if (key.toLowerCase().includes(name.toLowerCase()) && value) {
          return value;
        }
      }
    }
    return undefined;
  }

  private findPriceValue(row: Record<string, string>, possibleNames: string[]): number {
    const value = this.findFieldValue(row, possibleNames);
    if (!value) return 0;

    try {
      return this.parsePrice(value);
    } catch {
      return 0;
    }
  }

  private findNumberValue(row: Record<string, string>, possibleNames: string[]): number {
    const value = this.findFieldValue(row, possibleNames);
    if (!value) return 0;

    try {
      return this.parseNumber(value);
    } catch {
      return 0;
    }
  }

  private findDateValue(row: Record<string, string>, possibleNames: string[]): Date | null {
    const value = this.findFieldValue(row, possibleNames);
    if (!value) return null;

    try {
      return this.parseDateFlexible(value);
    } catch {
      return null;
    }
  }

  private parseDateFlexible(dateString: string): Date {
    // Clean the date string
    dateString = dateString.trim();

    // Try to parse directly first
    let date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date;
    }

    // Handle YYYY-MM-DD H:MM format (like "2025-09-27 20:09")
    if (/^\d{4}-\d{2}-\d{2}\s+\d{1,2}:\d{2}/.test(dateString)) {
      // Add seconds if missing
      const withSeconds = dateString.includes(':') && dateString.split(':').length === 2
        ? `${dateString}:00`
        : dateString;
      date = new Date(withSeconds);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }

    // Try other common formats
    const formats = [
      // ISO formats
      /^\d{4}-\d{2}-\d{2}/,
      // US format
      /^\d{2}\/\d{2}\/\d{4}/,
      // UK format
      /^\d{2}-\d{2}-\d{4}/,
      // Other common formats
      /^\d{1,2}\s+\w+\s+\d{4}/
    ];

    for (const format of formats) {
      if (format.test(dateString)) {
        date = new Date(dateString);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }

    throw new Error(`Unable to parse date: ${dateString}`);
  }

  private parseCSVLine(line: string): string[] {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  private mapToRow(headers: string[], values: string[]): Record<string, string> {
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    return row;
  }
}