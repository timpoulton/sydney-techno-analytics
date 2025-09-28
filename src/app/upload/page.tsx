'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Papa from 'papaparse';

type Platform = 'RESIDENT_ADVISOR' | 'HUMANITIX' | 'MOSHTIX';

interface ParsedRow {
  [key: string]: string;
}

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [platform, setPlatform] = useState<Platform>('RESIDENT_ADVISOR');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parseProgress, setParseProgress] = useState(0);
  const [parsedData, setParsedData] = useState<ParsedRow[] | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setError(null);
      setParsedData(null);
      setParseProgress(0);
      setUploadResult(null);

      // Parse the file immediately on selection
      parseCSV(selectedFile);
    }
  };

  const parseCSV = (fileToParser: File) => {
    Papa.parse(fileToParser, {
      header: true,
      delimiter: '', // Auto-detect delimiter (will handle tabs and commas)
      skipEmptyLines: true,
      complete: (results) => {
        console.log('Parse complete. Rows:', results.data.length);
        console.log('Headers:', results.meta.fields);
        console.log('Delimiter detected:', results.meta.delimiter);
        console.log('Sample data (first 3 rows):', results.data.slice(0, 3));

        if (results.errors.length > 0) {
          console.error('Parse errors:', results.errors);
          // Only show critical errors
          const criticalErrors = results.errors.filter(e => e.type === 'FieldMismatch');
          if (criticalErrors.length > 0) {
            setError(`Parse warnings: ${criticalErrors.length} rows have field mismatches`);
          }
        }

        setParsedData(results.data as ParsedRow[]);
        setParseProgress(100);

        // Auto-detect platform
        const detectedPlatform = detectPlatformFromData(results.data as ParsedRow[]);
        setPlatform(detectedPlatform);
      },
      error: (error) => {
        console.error('Parse error:', error);
        setError(`Failed to parse CSV: ${error.message}`);
      }
    });
  };

  const detectPlatformFromData = (data: ParsedRow[]): Platform => {
    if (!data || data.length === 0) return platform;

    const headers = Object.keys(data[0]);
    console.log('Detecting platform from headers:', headers);

    // Resident Advisor detection - check for specific columns
    if (headers.some(h => h === 'Barcode' || h === 'Order number') ||
        (headers.includes('Date purchased') && headers.includes('Ticket type'))) {
      console.log('Detected as Resident Advisor format');
      return 'RESIDENT_ADVISOR';
    }

    // Humanitix detection - check for specific columns
    if (headers.some(h => h.toLowerCase().includes('humanitix')) ||
        headers.includes('Order id') && headers.includes('Valid tickets') ||
        headers.includes('Event') && headers.includes('Your earnings')) {
      console.log('Detected as Humanitix format');
      return 'HUMANITIX';
    }

    // Moshtix detection
    if (headers.some(h => h.toLowerCase().includes('moshtix')) ||
        headers.some(h => h === 'Transaction ID')) {
      console.log('Detected as Moshtix format');
      return 'MOSHTIX';
    }

    return platform;
  };

  const processResidentAdvisorData = (data: ParsedRow[]) => {
    // Group tickets by type
    const ticketGroups = new Map<string, any[]>();
    let eventName = 'Event from RA Import';
    let earliestDate: Date | undefined;
    let latestDate: Date | undefined;

    // Extract event name from filename if possible
    if (file?.name) {
      const match = file.name.match(/\d{8}-(.*?)(-list)?\.csv/i);
      if (match) {
        // Replace underscores with spaces and handle camelCase
        eventName = match[1]
          .replace(/_/g, ' ')
          .replace(/([a-z])([A-Z])/g, '$1 $2')
          .replace(/WIP/g, ' WIP ')
          .replace(/\s+/g, ' ')
          .trim();
      }
    }

    data.forEach((row, index) => {
      try {
        const ticketType = row['Ticket type'] || 'General Admission';
        const priceStr = row['Price'] || '0';
        const price = parseFloat(priceStr.replace(/[^0-9.-]/g, ''));
        const email = row['Email'] || '';
        const postcode = row['Postcode'] || row['Shipping Postcode'] || '';

        // Parse date
        let purchaseDate: Date;
        const dateStr = row['Date purchased'];
        if (dateStr) {
          // Handle "YYYY-MM-DD H:MM" or "YYYY-MM-DD HH:MM" format
          const cleanDate = dateStr.trim();
          purchaseDate = new Date(cleanDate);
          if (isNaN(purchaseDate.getTime())) {
            // Try adding seconds if missing
            purchaseDate = new Date(cleanDate + ':00');
          }
        } else {
          purchaseDate = new Date();
        }

        // Track date range
        if (!earliestDate || purchaseDate < earliestDate) {
          earliestDate = purchaseDate;
        }
        if (!latestDate || purchaseDate > latestDate) {
          latestDate = purchaseDate;
        }

        if (!ticketGroups.has(ticketType)) {
          ticketGroups.set(ticketType, []);
        }

        ticketGroups.get(ticketType)?.push({
          price,
          email,
          postcode,
          purchaseDate: purchaseDate.toISOString(),
          billingName: row['Billing name'],
          orderNumber: row['Order number'],
          barcode: row['Barcode']
        });
      } catch (err) {
        console.error(`Error processing row ${index + 1}:`, err, row);
      }
    });

    // Consolidate tickets by type
    const consolidatedTickets: any[] = [];
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
        totalRevenue: typeRevenue,
        sampleData: tickets.slice(0, 5) // Keep sample for debugging
      });
    }

    // Flatten all individual tickets for customer data capture
    const individualTickets: any[] = [];
    for (const [type, tickets] of ticketGroups.entries()) {
      tickets.forEach((ticket: any) => {
        individualTickets.push({
          ...ticket,
          ticketType: type,
          quantity: 1,
          marketingOptIn: ticket.marketingOptIn === 'Yes' || ticket.marketingOptIn === true
        });
      });
    }

    return {
      eventName,
      eventDate: earliestDate?.toISOString() || new Date().toISOString(),
      venue: 'Sydney', // Default venue
      tickets: consolidatedTickets,
      individualTickets, // Include individual ticket data
      totalAttendees: data.length,
      totalRevenue,
      dateRange: {
        start: earliestDate?.toISOString(),
        end: latestDate?.toISOString()
      },
      platform: 'RESIDENT_ADVISOR'
    };
  };

  const processHumanitixData = (data: ParsedRow[]) => {
    if (!data || data.length === 0) return null;

    // Extract event info from first row
    const firstRow = data[0];
    const eventName = firstRow['Event'] || 'Unknown Event';
    const eventDateStr = firstRow['Event date'] || '';

    // Parse event date (format: DD/MM/YYYY)
    let eventDate = new Date();
    if (eventDateStr) {
      const [day, month, year] = eventDateStr.split('/');
      eventDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
    }

    // Group tickets and capture customer data
    const ticketGroups = new Map<string, any[]>();
    const individualTickets: any[] = [];

    data.forEach((row) => {
      try {
        // Parse ticket sales amount
        const ticketSalesStr = row['Ticket sales'] || '0';
        const ticketSales = parseFloat(ticketSalesStr.replace(/[^0-9.-]/g, ''));

        // Parse valid tickets count
        const validTickets = parseInt(row['Valid tickets'] || '0');

        if (validTickets === 0) return; // Skip cancelled orders

        // Calculate price per ticket
        const pricePerTicket = validTickets > 0 ? ticketSales / validTickets : ticketSales;

        // Create ticket type based on price
        const ticketType = pricePerTicket > 0 ? `$${pricePerTicket.toFixed(2)} Ticket` : 'Free Ticket';

        if (!ticketGroups.has(ticketType)) {
          ticketGroups.set(ticketType, []);
        }

        // Parse order date (format: DD/MM/YYYY H:MM am/pm)
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

        // Create individual tickets with customer data
        for (let i = 0; i < validTickets; i++) {
          individualTickets.push({
            ticketType,
            price: pricePerTicket,
            quantity: 1,
            email: row['Email'] || '',
            postcode: row['Postcode'] || row['Postal code'] || row['Billing postcode'] || '',
            billingName: `${row['First name'] || ''} ${row['Last name'] || ''}`.trim(),
            customerName: `${row['First name'] || ''} ${row['Last name'] || ''}`.trim(),
            customerEmail: row['Email'] || '',
            customerPostcode: row['Postcode'] || row['Postal code'] || row['Billing postcode'] || '',
            customerPhone: row['Mobile'] || '',
            marketingOptIn: row['Marketing opt-in'] === 'Yes',
            orderNumber: row['Order id'] || '',
            barcode: `${row['Order id'] || 'UNKNOWN'}-${i + 1}`,
            purchaseDate: orderDate.toISOString(),
            discountCode: row['Discount code used'] || '',
            status: row['Status'] || '',
          });
        }

        ticketGroups.get(ticketType)?.push({
          price: pricePerTicket,
          quantity: validTickets
        });
      } catch (err) {
        console.error('Error processing Humanitix row:', err, row);
      }
    });

    // Calculate consolidated tickets
    const consolidatedTickets: any[] = [];
    let totalRevenue = 0;
    let totalAttendees = 0;

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

      totalRevenue += totalAmount;
      totalAttendees += totalQuantity;
    }

    // Extract venue from event name
    let venue = 'Sydney';
    if (eventName.includes('BYO Warehouse')) venue = 'BYO Warehouse';
    if (eventName.includes('Warehouse')) venue = 'Warehouse';

    return {
      eventName,
      eventDate: eventDate.toISOString(),
      venue,
      tickets: consolidatedTickets,
      individualTickets,
      totalAttendees,
      totalRevenue,
      platform: 'HUMANITIX'
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parsedData || parsedData.length === 0) {
      setError('No data to upload. Please select a valid CSV file.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Process data based on platform
      let processedData;
      if (platform === 'RESIDENT_ADVISOR') {
        processedData = processResidentAdvisorData(parsedData);
      } else if (platform === 'HUMANITIX') {
        processedData = processHumanitixData(parsedData);
      } else {
        // For other platforms, send raw data for now
        processedData = {
          platform,
          rawData: parsedData.slice(0, 100), // Limit to first 100 rows for safety
          totalRows: parsedData.length
        };
      }

      if (!processedData) {
        setError('Failed to process CSV data. Please check the format.');
        setUploading(false);
        return;
      }

      console.log('Sending processed data to API:', {
        ...processedData,
        tickets: processedData.tickets?.map((t: any) => ({
          ...t,
          sampleData: undefined // Remove sample data from logs
        }))
      });

      // Send processed data to API
      const response = await fetch('/api/uploads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform,
          fileName: file?.name || 'upload.csv',
          processedData
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.details || 'Upload failed');
      }

      console.log('Upload successful:', result);
      setUploadResult(result);

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/events');
      }, 2000);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-gray-800 shadow-xl rounded-lg border border-gray-700">
          <div className="px-6 py-8">
            <h1 className="text-3xl font-bold text-white mb-8">Upload Event Data</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Platform Selection (auto-detected) */}
              <div>
                <label htmlFor="platform" className="block text-sm font-medium text-gray-300">
                  Platform (Auto-detected)
                </label>
                <select
                  id="platform"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as Platform)}
                  className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  disabled={uploading}
                >
                  <option value="RESIDENT_ADVISOR">Resident Advisor</option>
                  <option value="HUMANITIX">Humanitix</option>
                  <option value="MOSHTIX">Moshtix</option>
                </select>
                <p className="mt-1 text-sm text-gray-400">
                  Platform is automatically detected from CSV headers
                </p>
              </div>

              {/* File Upload */}
              <div>
                <label htmlFor="file" className="block text-sm font-medium text-gray-300">
                  CSV File
                </label>
                <input
                  type="file"
                  id="file"
                  accept=".csv,text/csv"
                  onChange={handleFileChange}
                  className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                  disabled={uploading}
                />
                <p className="mt-1 text-sm text-gray-400">
                  Supports tab-separated and comma-separated CSV files
                </p>
              </div>

              {/* Parse Progress */}
              {file && parseProgress > 0 && parseProgress < 100 && (
                <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-400">
                      Parsing CSV...
                    </span>
                    <span className="text-sm text-blue-400">
                      {parseProgress}%
                    </span>
                  </div>
                  <div className="w-full bg-blue-900/30 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${parseProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Parsed Data Summary */}
              {parsedData && (
                <div className="bg-green-900/20 rounded-lg p-4 border border-green-800">
                  <h3 className="text-sm font-medium text-green-400 mb-2">
                    CSV Parsed Successfully
                  </h3>
                  <ul className="text-sm text-green-300 space-y-1">
                    <li>✓ Rows: {parsedData.length}</li>
                    <li>✓ Columns: {Object.keys(parsedData[0] || {}).length}</li>
                    <li>✓ Platform: {platform.replace(/_/g, ' ')}</li>
                    {platform === 'RESIDENT_ADVISOR' && (
                      <li>✓ Ticket types detected: {
                        [...new Set(parsedData.map(r => r['Ticket type'] || 'General'))].length
                      }</li>
                    )}
                  </ul>
                </div>
              )}

              {/* Upload Result */}
              {uploadResult && (
                <div className="bg-green-900/20 rounded-lg p-4 border border-green-800">
                  <h3 className="text-sm font-medium text-green-400 mb-2">
                    Upload Successful!
                  </h3>
                  <ul className="text-sm text-green-300 space-y-1">
                    <li>✓ Events processed: {uploadResult.eventsProcessed || 1}</li>
                    <li>✓ Records processed: {uploadResult.recordsProcessed || parsedData?.length}</li>
                    {uploadResult.recordsFailed > 0 && (
                      <li>⚠ Records failed: {uploadResult.recordsFailed}</li>
                    )}
                  </ul>
                  <p className="mt-2 text-sm text-gray-400">
                    Redirecting to events page...
                  </p>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="bg-red-900/20 rounded-lg p-4 border border-red-800">
                  <p className="text-sm text-red-400">⚠ {error}</p>
                  <p className="text-xs text-red-400 mt-2">
                    Check browser console for details
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!parsedData || uploading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
              >
                {uploading ? 'Processing Upload...' : 'Upload and Process'}
              </button>
            </form>

            {/* Debug Info */}
            {parsedData && (
              <details className="mt-6">
                <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-300">
                  Debug: View sample data (first 3 rows)
                </summary>
                <pre className="mt-2 text-xs bg-gray-900 p-3 rounded overflow-auto max-h-64 text-gray-300">
                  {JSON.stringify(parsedData.slice(0, 3), null, 2)}
                </pre>
              </details>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}