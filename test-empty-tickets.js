// Test what happens when individualTickets is empty

const payload = {
  platform: 'RESIDENT_ADVISOR',
  fileName: 'test-empty.csv',
  processedData: {
    eventName: 'Test Empty Event',
    eventDate: new Date().toISOString(),
    venue: 'Sydney',
    tickets: [], // Empty tickets array
    individualTickets: [], // Empty individual tickets  
    totalAttendees: 0,
    totalRevenue: 0,
    platform: 'RESIDENT_ADVISOR'
  }
};

console.log('Testing upload with empty tickets arrays...');
console.log('Tickets length:', payload.processedData.tickets.length);
console.log('Individual tickets length:', payload.processedData.individualTickets.length);

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
