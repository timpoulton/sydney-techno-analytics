import { Platform } from '@prisma/client';
import { BaseCSVParser, ParsedEvent, ParsedTicket, ParseResult } from './base-parser';

interface HumanitixRow {
  'Event Name': string;
  'Event Date': string;
  'Venue': string;
  'Ticket Type': string;
  'Price': string;
  'Quantity': string;
  'Buyer Email': string;
  'Postcode': string;
  'Purchase Date': string;
}

export class HumanitixParser extends BaseCSVParser {
  constructor() {
    super(Platform.HUMANITIX);
  }

  async parse(csvContent: string): Promise<ParseResult> {
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());

    const events = new Map<string, ParsedEvent>();
    const errors: string[] = [];
    let successfulRows = 0;
    let failedRows = 0;

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = this.parseCSVLine(lines[i]);
        const row = this.mapToRow(headers, values);

        const eventKey = `${row['Event Name']}_${row['Event Date']}`;

        if (!events.has(eventKey)) {
          events.set(eventKey, {
            name: row['Event Name'],
            date: this.parseDate(row['Event Date']),
            venue: row['Venue'] || 'TBA',
            externalId: `HUM-${eventKey.replace(/\s+/g, '-')}`,
            platform: this.platform,
            tickets: [],
            metadata: {
              source: 'Humanitix CSV Import',
            }
          });
        }

        const event = events.get(eventKey)!;

        // Group tickets by type
        const existingTicket = event.tickets.find(t => t.ticketType === row['Ticket Type']);
        if (existingTicket) {
          existingTicket.quantity += 1;
          existingTicket.sold += 1;
        } else {
          event.tickets.push({
            ticketType: row['Ticket Type'] || 'General',
            price: this.parsePrice(row['Price'] || '0'),
            quantity: 1,
            sold: 1,
            purchaseDate: this.parseDate(row['Purchase Date']),
            buyerEmail: row['Buyer Email'],
            buyerPostcode: row['Postcode'],
          });
        }

        successfulRows++;
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error}`);
        failedRows++;
      }
    }

    return {
      events: Array.from(events.values()),
      errors,
      totalRows: lines.length - 1,
      successfulRows,
      failedRows,
    };
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