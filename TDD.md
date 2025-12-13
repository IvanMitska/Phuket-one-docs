# Technical Design Document (TDD)
## PhuketHub — All-in-One Tourism Platform

**Version:** 1.0
**Last Updated:** December 2025
**Status:** In Development
**Authors:** PhuketHub Engineering Team

---

## 1. Overview

### 1.1 Purpose
Документ описывает техническую реализацию платформы PhuketHub: архитектуру, технологический стек, структуру данных, API design и ключевые технические решения.

### 1.2 Scope
- Frontend (Next.js Application)
- Backend (API Routes)
- Database (PostgreSQL + Prisma)
- External Integrations
- DevOps & Infrastructure

### 1.3 References
- [PRD](./PRD.md) — Product Requirements Document
- [ADR](./ADR.md) — Architecture Decision Records
- [API Reference](./API.md) — API Documentation

---

## 2. Technology Stack

### 2.1 Frontend

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Framework | Next.js | 16.0.1 | React framework with SSR/SSG |
| Language | TypeScript | 5.9.3 | Type safety |
| UI Library | React | 19.2.0 | Component-based UI |
| Styling | TailwindCSS | 3.4.18 | Utility-first CSS |
| State | Zustand | 5.0.8 | Global state management |
| Forms | React Hook Form | 7.66.0 | Form handling |
| Validation | Zod | 4.1.12 | Schema validation |
| Animation | Framer Motion | 12.23.24 | Animations |
| Maps | Mapbox GL | 3.16.0 | Interactive maps |
| 3D | Three.js | 0.181.0 | 3D graphics |
| Icons | Lucide React | 0.552.0 | Icon library |

### 2.2 Backend

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Runtime | Node.js | 20.x | JavaScript runtime |
| API | Next.js API Routes | - | Serverless functions |
| ORM | Prisma | 6.18.0 | Database ORM |
| Auth | NextAuth.js | 4.24.13 | Authentication |
| JWT | jsonwebtoken | 9.0.2 | Token generation |
| Hashing | bcryptjs | 3.0.2 | Password hashing |

### 2.3 Database

| Component | Technology | Purpose |
|-----------|------------|---------|
| Primary DB | PostgreSQL | Main data store |
| ORM | Prisma | Query builder & migrations |
| Caching | Redis (future) | Session & data caching |

### 2.4 External Services

| Service | Provider | Purpose |
|---------|----------|---------|
| File Storage | Cloudflare R2 / AWS S3 | Image & file uploads |
| Maps | Mapbox | Geolocation & maps |
| Payments | Stripe | Payment processing |
| Email | Resend | Transactional emails |
| Analytics | PostHog | User analytics |
| Monitoring | Sentry | Error tracking |
| Currency | Exchange Rate API | Real-time rates |
| Weather | Weather API | Local weather data |

### 2.5 Infrastructure

| Component | Technology | Purpose |
|-----------|------------|---------|
| Hosting | Vercel | Application hosting |
| CDN | Vercel Edge | Static asset delivery |
| Database | Neon/Supabase | Managed PostgreSQL |
| DNS | Cloudflare | DNS management |

---

## 3. System Architecture

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENTS                                    │
├───────────────┬───────────────┬───────────────┬─────────────────────┤
│  Web Browser  │  Mobile PWA   │  Mobile App   │   Admin Panel       │
│  (Desktop)    │  (Future)     │  (Future)     │   (Internal)        │
└───────┬───────┴───────┬───────┴───────┬───────┴──────────┬──────────┘
        │               │               │                   │
        └───────────────┴───────────────┴───────────────────┘
                                │
                                │ HTTPS
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         EDGE LAYER                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │
│  │   Vercel    │  │  Cloudflare │  │    CDN      │                  │
│  │    Edge     │  │     WAF     │  │   (Assets)  │                  │
│  └─────────────┘  └─────────────┘  └─────────────┘                  │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                               │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                    Next.js Application                          │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │ │
│  │  │   Pages/     │  │     API      │  │  Middleware  │         │ │
│  │  │   App Router │  │    Routes    │  │  (Auth/CORS) │         │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘         │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│   PostgreSQL  │     │   Cloudflare  │     │   External    │
│   (Prisma)    │     │   R2 / S3     │     │   Services    │
│               │     │   (Files)     │     │               │
│ • Users       │     │               │     │ • Mapbox      │
│ • Properties  │     │ • Images      │     │ • Stripe      │
│ • Vehicles    │     │ • Videos      │     │ • Resend      │
│ • Tours       │     │ • Documents   │     │ • Currency    │
│ • Bookings    │     │               │     │ • Weather     │
│ • Reviews     │     │               │     │               │
└───────────────┘     └───────────────┘     └───────────────┘
```

### 3.2 Application Structure

```
phukethub/
├── app/                          # Next.js App Router
│   ├── api/                      # API endpoints
│   │   ├── auth/                 # NextAuth routes
│   │   ├── bookings/            # Booking CRUD
│   │   ├── currency/            # Currency rates
│   │   ├── properties/          # Property CRUD
│   │   ├── reviews/             # Reviews CRUD
│   │   ├── search/              # Global search
│   │   ├── tours/               # Tours CRUD
│   │   ├── upload/              # File uploads
│   │   └── vehicles/            # Vehicles CRUD
│   ├── (pages)/                 # Public pages
│   │   ├── page.tsx             # Home
│   │   ├── properties/          # Property listings
│   │   ├── vehicles/            # Vehicle listings
│   │   ├── tours/               # Tour listings
│   │   ├── exchange/            # Currency exchange
│   │   └── about/               # About page
│   ├── auth/                    # Auth pages
│   ├── profile/                 # User profile
│   ├── admin/                   # Admin panel
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
│
├── components/                   # React components
│   ├── ui/                      # Base UI components
│   ├── layout/                  # Layout components
│   ├── forms/                   # Form components
│   ├── features/                # Feature components
│   ├── properties/              # Property components
│   ├── vehicles/                # Vehicle components
│   ├── tours/                   # Tour components
│   ├── sections/                # Page sections
│   └── modals/                  # Modal components
│
├── lib/                         # Utilities
│   ├── api/                     # API client
│   ├── auth/                    # Auth utilities
│   ├── db/                      # Database client
│   ├── hooks/                   # Custom hooks
│   ├── utils/                   # Helper functions
│   └── validators/              # Zod schemas
│
├── prisma/                      # Database
│   ├── schema.prisma            # Schema definition
│   ├── migrations/              # Migration files
│   └── seed.ts                  # Seed data
│
├── public/                      # Static assets
├── types/                       # TypeScript types
└── config/                      # Config files
```

---

## 4. Database Design

### 4.1 Entity Relationship Diagram

```
┌──────────────────┐          ┌──────────────────┐
│      User        │          │     Account      │
├──────────────────┤          ├──────────────────┤
│ id (PK)          │◄────────┤ userId (FK)      │
│ email            │          │ provider         │
│ password         │          │ providerAccountId│
│ name             │          │ ...              │
│ role             │          └──────────────────┘
│ phone            │
│ image            │          ┌──────────────────┐
│ languagePreference│          │     Session      │
│ createdAt        │          ├──────────────────┤
│ updatedAt        │◄────────┤ userId (FK)      │
└────────┬─────────┘          │ sessionToken     │
         │                    │ expires          │
         │                    └──────────────────┘
         │
    ┌────┴────┬─────────────┬──────────────┬──────────────┐
    │         │             │              │              │
    ▼         ▼             ▼              ▼              ▼
┌────────┐ ┌────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐
│Property│ │Vehicle │ │   Tour   │ │ Booking  │ │   Review     │
├────────┤ ├────────┤ ├──────────┤ ├──────────┤ ├──────────────┤
│ id     │ │ id     │ │ id       │ │ id       │ │ id           │
│ vendorId│ │vendorId│ │ vendorId │ │ userId   │ │ userId       │
│ title  │ │ title  │ │ title    │ │ propertyId│ │ propertyId   │
│ type   │ │ type   │ │ category │ │ vehicleId│ │ vehicleId    │
│ price  │ │ brand  │ │ duration │ │ tourId   │ │ tourId       │
│ ...    │ │ ...    │ │ ...      │ │ ...      │ │ rating       │
└────────┘ └────────┘ └──────────┘ └──────────┘ └──────────────┘
    ▲           ▲           ▲
    └───────────┴───────────┘
              │
        ┌─────┴─────┐
        │ Favorite  │
        ├───────────┤
        │ userId    │
        │ propertyId│
        │ vehicleId │
        │ tourId    │
        └───────────┘
```

### 4.2 Core Models

#### User Model
```prisma
model User {
  id                String    @id @default(cuid())
  email             String    @unique
  emailVerified     DateTime?
  password          String?
  name              String?
  phone             String?
  image             String?
  role              UserRole  @default(TOURIST)
  languagePreference String   @default("en")
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  // Relations
  accounts      Account[]
  sessions      Session[]
  properties    Property[]
  vehicles      Vehicle[]
  tours         Tour[]
  bookings      Booking[]
  reviews       Review[]
  favorites     Favorite[]
  sentMessages  Message[] @relation("SentMessages")
  receivedMessages Message[] @relation("ReceivedMessages")
  notifications Notification[]
}

enum UserRole {
  TOURIST
  VENDOR
  ADMIN
}
```

#### Property Model
```prisma
model Property {
  id          String         @id @default(cuid())
  vendorId    String
  title       String
  description String         @db.Text
  type        PropertyType
  rentalType  RentalType     @default(DAILY)
  price       Float
  currency    String         @default("THB")
  bedrooms    Int
  bathrooms   Int
  area        Float?
  address     String
  city        String         @default("Phuket")
  latitude    Float?
  longitude   Float?
  amenities   Json           @default("[]")
  images      Json           @default("[]")
  videoUrl    String?
  status      PropertyStatus @default(AVAILABLE)
  featured    Boolean        @default(false)
  instantBook Boolean        @default(false)
  verified    Boolean        @default(false)
  viewCount   Int            @default(0)
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  // Relations
  vendor    User       @relation(fields: [vendorId], references: [id])
  bookings  Booking[]
  reviews   Review[]
  favorites Favorite[]
}

enum PropertyType {
  VILLA
  CONDO
  APARTMENT
  HOUSE
  STUDIO
  RESORT
  HOSTEL
  HOTEL
}

enum RentalType {
  DAILY
  MONTHLY
  YEARLY
  SALE
}

enum PropertyStatus {
  AVAILABLE
  BOOKED
  MAINTENANCE
  ARCHIVED
}
```

#### Vehicle Model
```prisma
model Vehicle {
  id            String        @id @default(cuid())
  vendorId      String
  title         String
  description   String        @db.Text
  type          VehicleType
  brand         String
  model         String
  year          Int
  pricePerDay   Float
  currency      String        @default("THB")
  features      Json          @default("[]")
  images        Json          @default("[]")
  licensePlate  String?
  pickupAddress String
  latitude      Float?
  longitude     Float?
  status        VehicleStatus @default(AVAILABLE)
  featured      Boolean       @default(false)
  instantBook   Boolean       @default(false)
  deliveryAvailable Boolean   @default(false)
  insuranceIncluded Boolean   @default(true)
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  // Relations
  vendor    User       @relation(fields: [vendorId], references: [id])
  bookings  Booking[]
  reviews   Review[]
  favorites Favorite[]
}

enum VehicleType {
  MOTORBIKE
  SCOOTER
  CAR
  VAN
  BICYCLE
  BOAT
  YACHT
}

enum VehicleStatus {
  AVAILABLE
  RENTED
  MAINTENANCE
  ARCHIVED
}
```

#### Tour Model
```prisma
model Tour {
  id              String       @id @default(cuid())
  vendorId        String
  title           String
  description     String       @db.Text
  category        TourCategory
  duration        Int          // in hours
  price           Float
  currency        String       @default("THB")
  maxParticipants Int
  languages       Json         @default("[\"en\"]")
  includes        Json         @default("[]")
  excludes        Json         @default("[]")
  images          Json         @default("[]")
  videoUrl        String?
  meetingPoint    String
  latitude        Float?
  longitude       Float?
  schedule        Json         @default("[]")
  status          TourStatus   @default(ACTIVE)
  featured        Boolean      @default(false)
  instantBook     Boolean      @default(false)
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  // Relations
  vendor    User       @relation(fields: [vendorId], references: [id])
  bookings  Booking[]
  reviews   Review[]
  favorites Favorite[]
}

enum TourCategory {
  WATER_SPORTS
  CULTURAL
  NIGHTLIFE
  SPA_WELLNESS
  FOOD_DRINK
  ADVENTURE
  ISLAND_HOPPING
  SIGHTSEEING
  WILDLIFE
}

enum TourStatus {
  ACTIVE
  PAUSED
  ARCHIVED
}
```

#### Booking Model
```prisma
model Booking {
  id              String        @id @default(cuid())
  userId          String
  propertyId      String?
  vehicleId       String?
  tourId          String?
  startDate       DateTime
  endDate         DateTime?
  totalPrice      Float
  currency        String        @default("THB")
  guestCount      Int           @default(1)
  specialRequests String?       @db.Text
  status          BookingStatus @default(PENDING)
  paymentStatus   PaymentStatus @default(UNPAID)
  paymentId       String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  // Relations
  user     User      @relation(fields: [userId], references: [id])
  property Property? @relation(fields: [propertyId], references: [id])
  vehicle  Vehicle?  @relation(fields: [vehicleId], references: [id])
  tour     Tour?     @relation(fields: [tourId], references: [id])
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
  NO_SHOW
}

enum PaymentStatus {
  UNPAID
  PARTIAL
  PAID
  REFUNDED
}
```

#### Review Model
```prisma
model Review {
  id              String   @id @default(cuid())
  userId          String
  propertyId      String?
  vehicleId       String?
  tourId          String?
  rating          Int      // 1-5
  title           String?
  comment         String   @db.Text
  images          Json     @default("[]")
  verifiedBooking Boolean  @default(false)
  helpful         Int      @default(0)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  user     User      @relation(fields: [userId], references: [id])
  property Property? @relation(fields: [propertyId], references: [id])
  vehicle  Vehicle?  @relation(fields: [vehicleId], references: [id])
  tour     Tour?     @relation(fields: [tourId], references: [id])
}
```

### 4.3 Indexes Strategy

```prisma
// Property indexes
@@index([vendorId])
@@index([type])
@@index([status])
@@index([price])
@@index([city])
@@index([featured])

// Booking indexes
@@index([userId])
@@index([propertyId])
@@index([vehicleId])
@@index([tourId])
@@index([status])
@@index([startDate])

// Review indexes
@@index([userId])
@@index([propertyId])
@@index([vehicleId])
@@index([tourId])
@@index([rating])
```

---

## 5. API Design

### 5.1 API Architecture

```
/api
├── /auth                    # NextAuth.js routes
│   └── [...nextauth]        # Dynamic auth handler
│
├── /properties
│   ├── GET    /             # List properties
│   ├── POST   /             # Create property
│   ├── GET    /[id]         # Get property
│   ├── PUT    /[id]         # Update property
│   └── DELETE /[id]         # Delete property
│
├── /vehicles
│   ├── GET    /             # List vehicles
│   ├── POST   /             # Create vehicle
│   ├── GET    /[id]         # Get vehicle
│   ├── PUT    /[id]         # Update vehicle
│   └── DELETE /[id]         # Delete vehicle
│
├── /tours
│   ├── GET    /             # List tours
│   ├── POST   /             # Create tour
│   ├── GET    /[id]         # Get tour
│   ├── PUT    /[id]         # Update tour
│   └── DELETE /[id]         # Delete tour
│
├── /bookings
│   ├── GET    /             # List user bookings
│   ├── POST   /             # Create booking
│   ├── GET    /[id]         # Get booking
│   ├── PUT    /[id]         # Update booking
│   └── DELETE /[id]         # Cancel booking
│
├── /reviews
│   ├── GET    /             # List reviews
│   ├── POST   /             # Create review
│   ├── PUT    /[id]         # Update review
│   └── DELETE /[id]         # Delete review
│
├── /search
│   └── GET    /             # Global search
│
├── /currency
│   └── GET    /             # Get exchange rates
│
└── /upload
    └── POST   /             # File upload
```

### 5.2 Request/Response Format

#### Standard Response
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

#### Example: GET /api/properties
```typescript
// Request
GET /api/properties?type=VILLA&minPrice=1000&maxPrice=5000&page=1&limit=20

// Response
{
  "success": true,
  "data": [
    {
      "id": "clx1234567",
      "title": "Luxury Beach Villa",
      "type": "VILLA",
      "price": 3500,
      "currency": "THB",
      "bedrooms": 3,
      "bathrooms": 2,
      "images": ["url1", "url2"],
      "rating": 4.8,
      "reviewCount": 24,
      "vendor": {
        "id": "clx7654321",
        "name": "John Doe"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  }
}
```

### 5.3 Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTH_REQUIRED` | 401 | Authentication required |
| `AUTH_INVALID` | 401 | Invalid credentials |
| `FORBIDDEN` | 403 | Access denied |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `DUPLICATE_ENTRY` | 409 | Resource already exists |
| `RATE_LIMITED` | 429 | Too many requests |
| `SERVER_ERROR` | 500 | Internal server error |

### 5.4 Authentication Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │     │ NextAuth │     │ Database │
└────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │
     │ Login Request  │                │
     │───────────────►│                │
     │                │ Verify Creds   │
     │                │───────────────►│
     │                │◄───────────────│
     │                │ User Data      │
     │ JWT Token      │                │
     │◄───────────────│                │
     │                │                │
     │ API Request    │                │
     │ + JWT          │                │
     │───────────────►│ Verify Token   │
     │                │                │
     │ Response       │                │
     │◄───────────────│                │
     │                │                │
```

---

## 6. Frontend Architecture

### 6.1 Component Hierarchy

```
App (layout.tsx)
├── Providers
│   ├── ThemeProvider
│   ├── SessionProvider
│   └── ToastProvider
│
├── Navigation
│   ├── Logo
│   ├── NavLinks
│   ├── SearchBar
│   ├── LanguageSelector
│   └── UserMenu
│
├── Pages
│   ├── HomePage
│   │   ├── Hero
│   │   ├── QuickAccess
│   │   ├── FeaturedListings
│   │   ├── InteractiveMap
│   │   └── Testimonials
│   │
│   ├── PropertiesPage
│   │   ├── FilterPanel
│   │   ├── PropertyGrid
│   │   │   └── PropertyCard
│   │   └── Pagination
│   │
│   ├── PropertyDetailPage
│   │   ├── ImageGallery
│   │   ├── PropertyInfo
│   │   ├── BookingWidget
│   │   ├── ReviewsSection
│   │   └── SimilarListings
│   │
│   └── ...
│
└── Footer
```

### 6.2 State Management

```typescript
// Zustand Store Structure
interface AppStore {
  // User State
  user: User | null;
  isAuthenticated: boolean;

  // UI State
  theme: 'light' | 'dark';
  language: string;
  currency: string;

  // Search State
  searchQuery: string;
  searchFilters: SearchFilters;

  // Cart/Booking State
  bookingDraft: BookingDraft | null;

  // Actions
  setUser: (user: User | null) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (lang: string) => void;
  setCurrency: (currency: string) => void;
  setSearchQuery: (query: string) => void;
  setSearchFilters: (filters: SearchFilters) => void;
  setBookingDraft: (draft: BookingDraft | null) => void;
}
```

### 6.3 Form Validation (Zod Schemas)

```typescript
// Property validation schema
const propertySchema = z.object({
  title: z.string().min(10).max(100),
  description: z.string().min(50).max(5000),
  type: z.enum(['VILLA', 'CONDO', 'APARTMENT', 'HOUSE', 'STUDIO']),
  price: z.number().positive().max(1000000),
  bedrooms: z.number().int().min(1).max(20),
  bathrooms: z.number().int().min(1).max(20),
  area: z.number().positive().optional(),
  amenities: z.array(z.string()),
  images: z.array(z.string().url()).min(3).max(20),
});

// Booking validation schema
const bookingSchema = z.object({
  startDate: z.date().min(new Date()),
  endDate: z.date(),
  guestCount: z.number().int().min(1).max(20),
  specialRequests: z.string().max(1000).optional(),
}).refine(data => data.endDate > data.startDate, {
  message: "End date must be after start date",
});
```

---

## 7. Security Considerations

### 7.1 Security Headers

```typescript
// next.config.js
headers: [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
]
```

### 7.2 Authentication Security

- **Password Hashing:** bcrypt with salt rounds = 12
- **JWT Expiration:** 24 hours (access), 7 days (refresh)
- **Session Validation:** Server-side session checks
- **Rate Limiting:** 100 requests/minute per IP

### 7.3 Data Validation

- Input sanitization via Zod
- SQL injection prevention via Prisma
- XSS prevention via React escaping
- File upload validation (type, size)

---

## 8. Performance Optimization

### 8.1 Frontend Optimizations

| Technique | Implementation |
|-----------|----------------|
| Code Splitting | Next.js automatic page-based |
| Image Optimization | Next/Image with WebP/AVIF |
| Lazy Loading | Dynamic imports, intersection observer |
| Caching | SWR / React Query (future) |
| Bundle Size | Tree shaking, minimal dependencies |

### 8.2 Backend Optimizations

| Technique | Implementation |
|-----------|----------------|
| Query Optimization | Prisma select/include |
| Pagination | Cursor-based pagination |
| Caching | Redis caching (future) |
| Connection Pooling | Prisma connection pool |
| CDN | Static assets via Vercel Edge |

### 8.3 Database Optimizations

```sql
-- Example indexes
CREATE INDEX idx_properties_search ON properties (type, status, price);
CREATE INDEX idx_properties_location ON properties (city, latitude, longitude);
CREATE INDEX idx_bookings_dates ON bookings (start_date, end_date, status);
```

---

## 9. Monitoring & Observability

### 9.1 Logging Strategy

```typescript
// Log levels
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

// Log structure
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
  context?: Record<string, unknown>;
  traceId?: string;
}
```

### 9.2 Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `http_requests_total` | Counter | Total HTTP requests |
| `http_request_duration` | Histogram | Request latency |
| `db_query_duration` | Histogram | Database query time |
| `active_users` | Gauge | Currently active users |
| `bookings_created` | Counter | Total bookings created |

### 9.3 Error Tracking (Sentry)

```typescript
// Sentry initialization
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  integrations: [
    new Sentry.BrowserTracing(),
  ],
});
```

---

## 10. Development Workflow

### 10.1 Git Workflow

```
main (production)
  │
  └── develop (staging)
        │
        ├── feature/TASK-123-add-booking
        ├── feature/TASK-124-fix-search
        └── hotfix/TASK-125-critical-bug
```

### 10.2 Code Review Checklist

- [ ] Code follows style guide
- [ ] Types are properly defined
- [ ] Error handling is implemented
- [ ] Tests are written/updated
- [ ] No sensitive data exposed
- [ ] Performance considerations addressed
- [ ] Documentation updated

### 10.3 Environment Setup

```bash
# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma db push

# Seed data
npx prisma db seed

# Run development server
npm run dev
```

---

## 11. Future Considerations

### 11.1 Technical Debt

- [ ] Add comprehensive test coverage
- [ ] Implement Redis caching
- [ ] Add API versioning
- [ ] Implement GraphQL (optional)
- [ ] Add real-time features (WebSockets)

### 11.2 Scalability Roadmap

1. **Phase 1:** Single region deployment (current)
2. **Phase 2:** CDN for global assets
3. **Phase 3:** Database read replicas
4. **Phase 4:** Multi-region deployment
5. **Phase 5:** Microservices extraction (if needed)

---

## 12. Appendix

### A. Environment Variables

```env
# Database
DATABASE_URL=postgresql://...

# Authentication
NEXTAUTH_URL=https://phukethub.com
NEXTAUTH_SECRET=your-secret-key

# External Services
NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxx
STRIPE_SECRET_KEY=sk_xxx
RESEND_API_KEY=re_xxx
SENTRY_DSN=https://xxx@sentry.io/xxx
```

### B. Useful Commands

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Production build
npm run lint                   # Run linter

# Database
npx prisma studio              # Open Prisma GUI
npx prisma migrate dev         # Create migration
npx prisma db push             # Push schema changes
npx prisma generate            # Generate client

# Testing
npm run test                   # Run tests
npm run test:coverage          # Coverage report
```

---

*Document maintained by PhuketHub Engineering Team*
