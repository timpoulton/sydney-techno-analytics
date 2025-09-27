import { Platform } from '@prisma/client';

export interface ParsedTicket {
  ticketType: string;
  price: number;
  quantity: number;
  sold: number;
  purchaseDate: Date;
  buyerEmail?: string;
  buyerPostcode?: string;
  metadata?: Record<string, any>;
}

export interface ParsedEvent {
  name: string;
  date: Date;
  venue: string;
  externalId: string;
  platform: Platform;
  tickets: ParsedTicket[];
  metadata?: Record<string, any>;
}

export interface ParseResult {
  events: ParsedEvent[];
  errors: string[];
  totalRows: number;
  successfulRows: number;
  failedRows: number;
}

export abstract class BaseCSVParser {
  protected platform: Platform;

  constructor(platform: Platform) {
    this.platform = platform;
  }

  abstract parse(csvContent: string): Promise<ParseResult>;

  protected parseDate(dateString: string): Date {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date: ${dateString}`);
    }
    return date;
  }

  protected parsePrice(priceString: string): number {
    const price = parseFloat(priceString.replace(/[^0-9.-]/g, ''));
    if (isNaN(price)) {
      throw new Error(`Invalid price: ${priceString}`);
    }
    return price;
  }

  protected parseNumber(numString: string): number {
    const num = parseInt(numString, 10);
    if (isNaN(num)) {
      throw new Error(`Invalid number: ${numString}`);
    }
    return num;
  }
}