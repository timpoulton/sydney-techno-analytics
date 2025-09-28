// CSV field mapping and validation utility
export function normalizeTicketData(ticket: any, platform: string) {
  // Normalize field names across different platforms
  const normalized: any = {
    // Customer data - handle various field name formats
    customerEmail: ticket.customerEmail || ticket.email || ticket['Customer Email'] || ticket['Billing Email'] || '',
    customerName: ticket.customerName || ticket.billingName || ticket['Customer Name'] || ticket['Billing Name'] || '',
    customerPostcode: ticket.customerPostcode || ticket.postcode || ticket['Postcode'] || ticket['Billing Postcode'] || '',

    // Ticket data
    ticketType: ticket.ticketType || ticket['Ticket Type'] || ticket['Ticket Name'] || 'General Admission',
    price: parseFloat(String(ticket.price || ticket['Price'] || ticket['Ticket Price'] || '0').replace(/[^0-9.-]/g, '')),
    quantity: parseInt(ticket.quantity || ticket['Quantity'] || '1'),

    // Order data
    orderNumber: ticket.orderNumber || ticket['Order Number'] || ticket['Order ID'] || '',
    barcode: ticket.barcode || ticket['Barcode'] || ticket['Ticket Code'] || '',
    purchaseDate: ticket.purchaseDate || ticket['Purchase Date'] || ticket['Order Date'] || new Date().toISOString(),

    // Marketing
    marketingOptIn: ticket.marketingOptIn || ticket['Marketing Opt In'] === 'Yes' || ticket['Newsletter'] === 'Yes' || false,

    // Platform specific
    status: ticket.status || ticket['Status'] || 'confirmed',
    discountCode: ticket.discountCode || ticket['Discount Code'] || ''
  };

  // Ensure valid email format
  if (normalized.customerEmail && !isValidEmail(normalized.customerEmail)) {
    normalized.customerEmail = '';
  }

  // Convert empty strings to empty for database (Prisma will handle as null)
  if (!normalized.customerEmail) normalized.customerEmail = '';
  if (!normalized.customerName) normalized.customerName = '';
  if (!normalized.customerPostcode) normalized.customerPostcode = '';
  if (!normalized.orderNumber) normalized.orderNumber = '';
  if (!normalized.barcode) normalized.barcode = '';

  // Ensure price is a valid number
  if (isNaN(normalized.price) || normalized.price < 0) {
    normalized.price = 0;
  }

  // Ensure quantity is valid
  if (isNaN(normalized.quantity) || normalized.quantity < 1) {
    normalized.quantity = 1;
  }

  return normalized;
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateUploadData(data: any, platform: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.eventName && !data.eventTitle) {
    errors.push('Event name is required');
  }

  if (!data.eventDate) {
    errors.push('Event date is required');
  }

  if (!data.individualTickets || !Array.isArray(data.individualTickets)) {
    errors.push('No ticket data found');
  } else if (data.individualTickets.length === 0) {
    errors.push('No tickets to process');
  }

  // Validate at least some tickets have customer data
  if (data.individualTickets && data.individualTickets.length > 0) {
    const hasCustomerData = data.individualTickets.some((t: any) =>
      t.customerEmail || t.email || t['Customer Email'] || t['Billing Email']
    );

    if (!hasCustomerData) {
      errors.push('Warning: No customer email data found in tickets');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}