# Data Model: Sydney Underground Techno Event Analytics Dashboard

## Core Entities

### Organization
```typescript
interface Organization {
  id: string;                // UUID
  name: string;              // "Sydney Underground Techno Promoter"
  createdAt: Date;
  updatedAt: Date;
}
```

### User
```typescript
interface User {
  id: string;                // UUID
  email: string;             // Unique
  name: string;
  organizationId: string;    // FK to Organization
  role: 'admin' | 'member';
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
```
**Constraints**: Maximum 3 users per organization

### Event
```typescript
interface Event {
  id: string;                // UUID
  organizationId: string;    // FK to Organization
  name: string;
  date: Date;
  venue: string;
  city: string;              // Default: "Sydney"
  capacity: number | null;
  status: 'upcoming' | 'completed' | 'cancelled';
  sourceP platform: 'resident_advisor' | 'humanitix' | 'moshtix';
  externalId: string;        // Platform's event ID
  metadata: JsonValue;       // Platform-specific fields
  createdAt: Date;
  updatedAt: Date;
}
```
**Constraints**: Unique on (organizationId, platform, externalId)

### Upload
```typescript
interface Upload {
  id: string;                // UUID
  organizationId: string;    // FK to Organization
  userId: string;            // FK to User who uploaded
  filename: string;
  fileSize: number;          // In bytes
  platform: 'resident_advisor' | 'humanitix' | 'moshtix';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  recordsProcessed: number;
  recordsFailed: number;
  errorLog: string | null;
  processedAt: Date | null;
  createdAt: Date;
}
```

### Ticket
```typescript
interface Ticket {
  id: string;                // UUID
  eventId: string;           // FK to Event
  uploadId: string;          // FK to Upload
  ticketType: string;        // "Early Bird", "General", "VIP", etc.
  price: Decimal;
  quantity: number;
  sold: number;
  revenue: Decimal;          // Calculated: price * sold
  purchaseDate: Date;
  buyerEmail: string | null; // Hashed for privacy
  buyerPostcode: string | null;
  metadata: JsonValue;       // Platform-specific fields
  createdAt: Date;
}
```

### Artist
```typescript
interface Artist {
  id: string;                // UUID
  name: string;
  bio: string | null;
  imageUrl: string | null;
  socialLinks: JsonValue;    // {instagram: "", soundcloud: "", etc.}
  createdAt: Date;
  updatedAt: Date;
}
```

### EventArtist (Junction)
```typescript
interface EventArtist {
  eventId: string;           // FK to Event
  artistId: string;          // FK to Artist
  performanceOrder: number;  // 1 = headliner
  performanceTime: string | null;
  createdAt: Date;
}
```

### Venue
```typescript
interface Venue {
  id: string;                // UUID
  name: string;
  address: string;
  city: string;
  postcode: string;
  capacity: number | null;
  coordinates: {             // For mapping
    lat: number;
    lng: number;
  } | null;
  transportNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### Metrics (Materialized)
```typescript
interface EventMetrics {
  id: string;                // UUID
  eventId: string;           // FK to Event, unique
  totalRevenue: Decimal;
  totalTicketsSold: number;
  averageTicketPrice: Decimal;
  sellOutPercentage: number;
  earlyBirdConversion: number;

  // Demographics
  topPostcodes: JsonValue;   // [{postcode: "2000", count: 50}, ...]
  ageDistribution: JsonValue; // {18-24: 30%, 25-34: 45%, ...}

  // Time patterns
  salesVelocity: JsonValue;   // Daily sales over time
  peakSalesHour: number;      // 0-23
  daysToSellOut: number | null;

  // Calculated metrics
  customMetrics: JsonValue;   // User-defined KPIs

  lastCalculated: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### CustomMetric
```typescript
interface CustomMetric {
  id: string;                // UUID
  organizationId: string;    // FK to Organization
  name: string;
  description: string;
  formula: string;           // JSON formula definition
  category: 'revenue' | 'attendance' | 'engagement' | 'custom';
  isActive: boolean;
  createdBy: string;         // FK to User
  createdAt: Date;
  updatedAt: Date;
}
```

## Relationships

1. **Organization → Users**: 1 to many (max 3)
2. **Organization → Events**: 1 to many
3. **Organization → Uploads**: 1 to many
4. **Event → Tickets**: 1 to many
5. **Event → EventMetrics**: 1 to 1
6. **Event → Artists**: many to many (via EventArtist)
7. **Event → Venue**: many to 1
8. **Upload → Tickets**: 1 to many
9. **User → Uploads**: 1 to many

## State Transitions

### Upload Status Flow
```
pending → processing → completed
         ↘          ↗
           failed
```

### Event Status Flow
```
upcoming → completed
    ↓
cancelled
```

## Validation Rules

1. **Email**: Valid email format, unique per organization
2. **File Size**: Maximum 100MB per upload
3. **Dates**: Event date cannot be in the future for completed events
4. **Numbers**: Non-negative for quantities, prices
5. **Platform**: Must be one of supported platforms
6. **Ticket Sold**: Cannot exceed ticket quantity
7. **User Limit**: Maximum 3 users per organization

## Indexes

1. `events.date` - For date range queries
2. `events.venue` - For venue analytics
3. `tickets.purchaseDate` - For time series analysis
4. `tickets.buyerPostcode` - For geographic analysis
5. `uploads.status` - For monitoring processing
6. `(event.organizationId, event.platform, event.externalId)` - Unique constraint

## Data Retention

- All data retained indefinitely
- Soft deletes with `deletedAt` timestamps
- Audit log for all data modifications
- CSV archive in file storage permanently