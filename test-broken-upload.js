// Test what happens when individualTickets is missing or empty

const payload = {
  platform: 'RESIDENT_ADVISOR',
  fileName: 'test-broken.csv',
  processedData: {
    eventName: 'Test Event',
    eventDate: new Date().toISOString(),
    venue: 'Sydney',
    tickets: [
      {
        ticketType: 'General',
        price: 50,
        quantity: 3,
        sold: 3,
        totalRevenue: 150
      }
    ],
    // individualTickets is missing!
    totalAttendees: 3,
    totalRevenue: 150,
    platform: 'RESIDENT_ADVISOR'
  }
};

console.log('Testing upload with missing individualTickets...');
console.log('Has individualTickets?', !!payload.processedData.individualTickets);

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
