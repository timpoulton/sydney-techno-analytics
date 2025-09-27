import { Platform } from '@prisma/client';
import { BaseCSVParser, ParsedEvent, ParsedTicket, ParseResult } from './base-parser';

interface MoshtixRow {
  'Event Title': string;
  'Date': string;
  'Venue': string;
  'Ticket Type': string;
  'Qty': string;
  'Price': string;
  'Total': string;
  'Customer Email': string;
  'Postcode': string;
  'Purchase Date'?: string;
}

export class MoshtixParser extends BaseCSVParser {
  constructor() {
    super(Platform.MOSHTIX);
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

        const eventKey = `${row['Event Title']}_${row['Date']}`;

        if (!events.has(eventKey)) {
          events.set(eventKey, {
            name: row['Event Title'],
            date: this.parseDate(row['Date']),
            venue: row['Venue'] || 'TBA',
            externalId: `MOSH-${eventKey.replace(/\s+/g, '-')}`,
            platform: this.platform,
            tickets: [],
            metadata: {
              source: 'Moshtix CSV Import',
            }
          });
        }

        const event = events.get(eventKey)!;
        const qty = this.parseNumber(row['Qty'] || '1');

        // Find or create ticket type
        const existingTicket = event.tickets.find(t => t.ticketType === row['Ticket Type']);
        if (existingTicket) {
          existingTicket.quantity += qty;
          existingTicket.sold += qty;
        } else {
          event.tickets.push({
            ticketType: row['Ticket Type'] || 'General',
            price: this.parsePrice(row['Price'] || '0'),
            quantity: qty,
            sold: qty,
            purchaseDate: row['Purchase Date'] ? this.parseDate(row['Purchase Date']) : this.parseDate(row['Date']),
            buyerEmail: row['Customer Email'],
            buyerPostcode: row['Postcode'],
            metadata: {
              total: this.parsePrice(row['Total'] || '0'),
            }
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