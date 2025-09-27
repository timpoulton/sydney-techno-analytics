# Quickstart Guide: Sydney Underground Techno Event Analytics Dashboard

## Prerequisites

- Node.js 20 LTS or higher
- PostgreSQL 15 or higher
- npm or yarn package manager

## Setup Instructions

### 1. Clone and Install

```bash
git clone [repository-url]
cd sydney-techno-analytics
npm install
```

### 2. Environment Configuration

Create `.env.local` file:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/techno_analytics"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-secret-with-openssl-rand-base64-32"
EMAIL_SERVER="smtp://user:pass@smtp.example.com:587"
EMAIL_FROM="noreply@technoanalytics.com"
STORAGE_PATH="./storage/uploads"
```

### 3. Database Setup

```bash
npx prisma migrate dev
npx prisma db seed
```

### 4. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## First Use Guide

### Step 1: Login

1. Navigate to http://localhost:3000
2. Enter your email address
3. Check email for magic link
4. Click link to authenticate

### Step 2: Upload Your First CSV

1. Click "Upload Data" in navigation
2. Select platform (Resident Advisor, Humanitix, or Moshtix)
3. Choose CSV file (max 100MB)
4. Click "Upload"
5. Wait for processing completion

### Step 3: View Dashboard

1. Navigate to Dashboard
2. View key metrics:
   - Total revenue
   - Events count
   - Ticket sales
   - Attendance trends
3. Filter by date range
4. Click any event for detailed metrics

### Step 4: Create Custom Metrics

1. Go to Settings → Custom Metrics
2. Click "New Metric"
3. Define formula:
   ```
   Example: Conversion Rate
   Formula: (tickets_sold / page_views) * 100
   ```
4. Save and view on dashboard

## Testing the System

### Test Upload Flow

```bash
# Use sample CSV files
npm run test:upload -- samples/humanitix_sample.csv
```

### Verify Metrics Calculation

1. Upload sample event data
2. Check dashboard displays:
   - Revenue: $45,000
   - Tickets Sold: 450
   - Sell-out: 90%
3. Verify custom metrics work

### Mobile Responsiveness Test

1. Open Chrome DevTools
2. Toggle device toolbar
3. Test on:
   - iPhone 12 Pro (390×844)
   - iPad (768×1024)
4. Verify all features accessible

## Common CSV Formats

### Resident Advisor Format

```csv
Event,Date,Venue,Tickets Sold,Revenue
"Techno Tuesday","2024-03-15","Club 77",250,12500
```

### Humanitix Format

```csv
event_name,event_date,ticket_type,quantity,price,buyer_email,buyer_postcode
"Warehouse Rave","2024-03-20","General",1,65,"user@example.com","2000"
```

### Moshtix Format

```csv
Event Title,Date,Venue,Ticket Type,Qty,Price,Total,Customer Email,Postcode
"Underground Session","2024-03-22","The Basement","Early Bird",2,50,100,"fan@example.com","2010"
```

## Troubleshooting

### Upload Fails

- Check file size (<100MB)
- Verify CSV format matches platform
- Check for special characters in data

### Metrics Not Updating

- Refresh dashboard
- Check processing status in Uploads
- Verify data parsed correctly

### Login Issues

- Check spam folder for magic link
- Verify email server configuration
- Check NEXTAUTH_URL matches actual URL

## API Testing

### Upload CSV via API

```bash
curl -X POST http://localhost:3000/api/uploads \
  -H "Authorization: Bearer [token]" \
  -F "file=@event_data.csv" \
  -F "platform=humanitix"
```

### Get Dashboard Metrics

```bash
curl http://localhost:3000/api/metrics/dashboard \
  -H "Authorization: Bearer [token]"
```

### Export Data

```bash
curl -X POST http://localhost:3000/api/metrics/export \
  -H "Authorization: Bearer [token]" \
  -H "Content-Type: application/json" \
  -d '{
    "format": "csv",
    "dateFrom": "2024-01-01",
    "dateTo": "2024-12-31"
  }' \
  --output export.csv
```

## Production Deployment

### 1. Build Application

```bash
npm run build
```

### 2. Database Migration

```bash
npx prisma migrate deploy
```

### 3. Start Production Server

```bash
npm start
```

### 4. Configure Reverse Proxy (nginx)

```nginx
server {
    listen 80;
    server_name analytics.sydneytechno.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Success Criteria Validation

✅ **CSV Upload**: Upload completes in <30s for 100MB file
✅ **Dashboard Load**: Loads in <2s with metrics displayed
✅ **Mobile Responsive**: All features work on mobile devices
✅ **Custom Metrics**: Can create and view custom KPIs
✅ **Data Retention**: Historical data accessible indefinitely
✅ **Multi-user**: 3 team members can access simultaneously

## Support

For issues or questions:
- Check logs: `npm run logs`
- Database status: `npx prisma studio`
- Email: support@technoanalytics.com