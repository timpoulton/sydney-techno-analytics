const fs = require('fs');

// Read and parse the CSV from the specific file that's failing
const csvContent = fs.readFileSync('order-report-(exported-2025-09-28@01.32.11).csv', 'utf-8');
const lines = csvContent.split('\n');
const headers = lines[0].split('\t');

console.log('CSV Headers:', headers);
console.log('Total lines:', lines.length);
console.log('Total data rows:', lines.length - 1);

// Check if there's actual data
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

console.log('Parsed data rows:', data.length);

if (data.length > 0) {
  console.log('\nFirst row sample:');
  console.log(data[0]);

  // Check for required fields
  const requiredFields = ['Ticket type', 'Price', 'Date purchased', 'Email', 'Postcode', 'Billing name'];
  const missingFields = requiredFields.filter(field => !headers.includes(field));

  if (missingFields.length > 0) {
    console.log('\nMISSING REQUIRED FIELDS:', missingFields);
  } else {
    console.log('\nAll required fields present');
  }

  // Check if data has actual values
  let emptyRows = 0;
  data.forEach((row, index) => {
    const hasEmail = row['Email'] && row['Email'].trim();
    const hasPrice = row['Price'] && row['Price'].trim();

    if (!hasEmail || !hasPrice) {
      emptyRows++;
      if (emptyRows <= 3) {
        console.log(`Row ${index + 1} has missing data:`, {
          Email: row['Email'] || '(empty)',
          Price: row['Price'] || '(empty)',
        });
      }
    }
  });

  if (emptyRows > 0) {
    console.log(`\nTotal rows with missing critical data: ${emptyRows} out of ${data.length}`);
  }
}
