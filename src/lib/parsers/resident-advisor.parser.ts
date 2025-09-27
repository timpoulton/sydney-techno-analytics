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
    const headers = lines[0].split(',').map(h => h.trim());

    const events: ParsedEvent[] = [];
    const errors: string[] = [];
    let successfulRows = 0;
    let failedRows = 0;

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = this.parseCSVLine(lines[i]);
        const row = this.mapToRow(headers, values);

        const ticketsSold = this.parseNumber(row['Tickets Sold'] || '0');
        const revenue = this.parsePrice(row['Revenue'] || '0');
        const averagePrice = ticketsSold > 0 ? revenue / ticketsSold : 0;

        const event: ParsedEvent = {
          name: row['Event'],
          date: this.parseDate(row['Date']),
          venue: row['Venue'] || 'TBA',
          externalId: `RA-${row['Event'].replace(/\s+/g, '-')}-${row['Date']}`,
          platform: this.platform,
          tickets: [{
            ticketType: row['Ticket Type'] || 'General Admission',
            price: averagePrice,
            quantity: ticketsSold,
            sold: ticketsSold,
            purchaseDate: this.parseDate(row['Date']),
            metadata: {
              totalRevenue: revenue,
            }
          }],
          metadata: {
            source: 'Resident Advisor CSV Import',
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