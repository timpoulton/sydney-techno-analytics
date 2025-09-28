const fs = require('fs');

// Read and parse the CSV
const csvContent = fs.readFileSync('test-ra.csv', 'utf-8');
const lines = csvContent.split('\n');
const headers = lines[0].split('\t');
const data = [];

for (let i = 1; i < lines.length; i++) {
  if (lines[i].trim()) {
    const values = lines[i].split('\t');
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });
    data.push(row);
  }
}

// Process the data similar to the frontend
const ticketGroups = new Map();
let eventName = 'Test Event from RA Import';
let earliestDate = null;

data.forEach(row => {
  const ticketType = row['Ticket type'] || 'General Admission';
  const price = parseFloat(row['Price'] || '0');
  const purchaseDate = new Date(row['Date purchased'] + ':00');
  
  if (!earliestDate || purchaseDate < earliestDate) {
    earliestDate = purchaseDate;
  }
  
  if (!ticketGroups.has(ticketType)) {
    ticketGroups.set(ticketType, []);
  }
  
  ticketGroups.get(ticketType).push({
    price,
    email: row['Email'],
    postcode: row['Postcode'],
    purchaseDate: purchaseDate.toISOString(),
    billingName: row['Billing name'],
    orderNumber: row['Order number'],
    barcode: row['Barcode']
  });
});

// Consolidate tickets
const consolidatedTickets = [];
const individualTickets = [];
let totalRevenue = 0;

for (const [type, tickets] of ticketGroups.entries()) {
  const avgPrice = tickets.reduce((sum, t) => sum + t.price, 0) / tickets.length;
  const typeRevenue = avgPrice * tickets.length;
  totalRevenue += typeRevenue;
  
  consolidatedTickets.push({
    ticketType: type,
    price: avgPrice,
    quantity: tickets.length,
    sold: tickets.length,
    totalRevenue: typeRevenue
  });
  
  // Add individual tickets
  tickets.forEach(ticket => {
    individualTickets.push({
      ...ticket,
      ticketType: type,
      quantity: 1,
      customerEmail: ticket.email,
      customerPostcode: ticket.postcode,
      customerName: ticket.billingName
    });
  });
}

const processedData = {
  eventName,
  eventDate: earliestDate.toISOString(),
  venue: 'Sydney',
  tickets: consolidatedTickets,
  individualTickets,
  totalAttendees: data.length,
  totalRevenue,
  platform: 'RESIDENT_ADVISOR'
};

const payload = {
  platform: 'RESIDENT_ADVISOR',
  fileName: 'test-ra.csv',
  processedData
};

console.log('Sending upload request...');
console.log('Individual tickets:', processedData.individualTickets.length);
console.log('Ticket types:', processedData.tickets.length);

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
    console.log('Records failed:', result.recordsFailed);
  }
})
.catch(err => console.error('Request failed:', err));
