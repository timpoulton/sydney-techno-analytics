const fs = require('fs');

// Read and parse the CSV
const csvContent = fs.readFileSync('test-humanitix.csv', 'utf-8');
const lines = csvContent.split('\n');
const headers = lines[0].split(',');
const data = [];

for (let i = 1; i < lines.length; i++) {
  if (lines[i].trim()) {
    const values = lines[i].split(',');
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });
    data.push(row);
  }
}

console.log('Parsed', data.length, 'rows');

// Process Humanitix data
const ticketGroups = new Map();
const individualTickets = [];
let totalRevenue = 0;
let totalAttendees = 0;

const eventName = data[0]['Event'] || 'Unknown Event';
const eventDateStr = data[0]['Event date'] || '';

// Parse event date (format: DD/MM/YYYY)
let eventDate = new Date();
if (eventDateStr) {
  const [day, month, year] = eventDateStr.split('/');
  eventDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
}

data.forEach(row => {
  const ticketSales = parseFloat(row['Ticket sales'] || '0');
  const validTickets = parseInt(row['Valid tickets'] || '0');
  
  if (validTickets === 0) return;
  
  const pricePerTicket = validTickets > 0 ? ticketSales / validTickets : ticketSales;
  const ticketType = pricePerTicket > 0 ? `$${pricePerTicket.toFixed(2)} Ticket` : 'Free Ticket';
  
  // Parse order date
  let orderDate = new Date();
  const orderDateStr = row['Order date'] || '';
  if (orderDateStr) {
    const parts = orderDateStr.split(' ');
    if (parts.length >= 2) {
      const [day, month, year] = parts[0].split('/');
      const time = parts[1];
      const ampm = parts[2] || '';
      
      const [hours, minutes] = time.split(':');
      let hour = parseInt(hours);
      
      if (ampm.toLowerCase() === 'pm' && hour !== 12) hour += 12;
      if (ampm.toLowerCase() === 'am' && hour === 12) hour = 0;
      
      orderDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour.toString().padStart(2, '0')}:${minutes}:00`);
    }
  }
  
  // Create individual tickets
  for (let i = 0; i < validTickets; i++) {
    individualTickets.push({
      ticketType,
      price: pricePerTicket,
      quantity: 1,
      customerEmail: row['Email'] || '',
      customerPostcode: row['Postcode'] || '',
      customerName: `${row['First name'] || ''} ${row['Last name'] || ''}`.trim(),
      customerPhone: row['Mobile'] || '',
      marketingOptIn: row['Marketing opt-in'] === 'Yes',
      orderNumber: row['Order id'] || '',
      barcode: `${row['Order id'] || 'UNKNOWN'}-${i + 1}`,
      purchaseDate: orderDate.toISOString(),
      discountCode: row['Discount code used'] || '',
      status: row['Status'] || '',
    });
  }
  
  if (!ticketGroups.has(ticketType)) {
    ticketGroups.set(ticketType, []);
  }
  
  ticketGroups.get(ticketType).push({
    price: pricePerTicket,
    quantity: validTickets
  });
  
  totalRevenue += ticketSales;
  totalAttendees += validTickets;
});

// Calculate consolidated tickets
const consolidatedTickets = [];
for (const [type, tickets] of ticketGroups.entries()) {
  const totalQuantity = tickets.reduce((sum, t) => sum + t.quantity, 0);
  const totalAmount = tickets.reduce((sum, t) => sum + t.price * t.quantity, 0);
  const avgPrice = totalQuantity > 0 ? totalAmount / totalQuantity : 0;
  
  consolidatedTickets.push({
    ticketType: type,
    price: avgPrice,
    quantity: totalQuantity,
    sold: totalQuantity,
    totalRevenue: totalAmount
  });
}

const processedData = {
  eventName,
  eventDate: eventDate.toISOString(),
  venue: 'Warehouse',
  tickets: consolidatedTickets,
  individualTickets,
  totalAttendees,
  totalRevenue,
  platform: 'HUMANITIX'
};

const payload = {
  platform: 'HUMANITIX',
  fileName: 'test-humanitix.csv',
  processedData
};

console.log('Sending Humanitix upload...');
console.log('Individual tickets:', processedData.individualTickets.length);

fetch('http://localhost:3000/api/uploads', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload)
})
.then(res => res.json())
.then(result => {
  console.log('\nUpload result:', result);
  if (result.error) {
    console.error('Error:', result.error);
  } else {
    console.log('Success!');
    console.log('Records processed:', result.recordsProcessed);
  }
})
.catch(err => console.error('Request failed:', err));
