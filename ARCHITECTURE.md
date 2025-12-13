# System Architecture
## PhuketHub — All-in-One Tourism Platform

**Version:** 1.0
**Last Updated:** December 2025

---

## 1. Архитектурный обзор

### 1.1 Высокоуровневая архитектура

```
                                    ┌─────────────────────┐
                                    │    CLOUDFLARE       │
                                    │    ┌───────────┐    │
                                    │    │    DNS    │    │
                                    │    │    WAF    │    │
                                    │    │    CDN    │    │
                                    │    └─────┬─────┘    │
                                    └──────────┼──────────┘
                                               │
                                               ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                              VERCEL EDGE NETWORK                            │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                          NEXT.JS APPLICATION                          │  │
│  │                                                                        │  │
│  │   ┌────────────────┐   ┌────────────────┐   ┌────────────────┐       │  │
│  │   │   SSR PAGES    │   │  API ROUTES    │   │   STATIC       │       │  │
│  │   │                │   │                │   │   ASSETS       │       │  │
│  │   │ • Home         │   │ • /api/auth    │   │                │       │  │
│  │   │ • Properties   │   │ • /api/props   │   │ • JS/CSS       │       │  │
│  │   │ • Tours        │   │ • /api/tours   │   │ • Images       │       │  │
│  │   │ • Vehicles     │   │ • /api/booking │   │ • Fonts        │       │  │
│  │   │ • Profile      │   │ • /api/search  │   │                │       │  │
│  │   └────────────────┘   └───────┬────────┘   └────────────────┘       │  │
│  │                                │                                       │  │
│  └────────────────────────────────┼───────────────────────────────────────┘  │
└───────────────────────────────────┼──────────────────────────────────────────┘
                                    │
           ┌────────────────────────┼────────────────────────┐
           │                        │                        │
           ▼                        ▼                        ▼
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│     POSTGRESQL      │  │   CLOUDFLARE R2     │  │  EXTERNAL SERVICES  │
│     (Neon/Supabase) │  │   (File Storage)    │  │                     │
│                     │  │                     │  │  • Stripe           │
│  ┌───────────────┐  │  │  ┌───────────────┐  │  │  • Mapbox           │
│  │    Tables     │  │  │  │    Buckets    │  │  │  • Resend           │
│  │               │  │  │  │               │  │  │  • PostHog          │
│  │ • Users       │  │  │  │ • images/     │  │  │  • Sentry           │
│  │ • Properties  │  │  │  │ • videos/     │  │  │  • Currency API     │
│  │ • Vehicles    │  │  │  │ • documents/  │  │  │  • Weather API      │
│  │ • Tours       │  │  │  │               │  │  │                     │
│  │ • Bookings    │  │  │  └───────────────┘  │  └─────────────────────┘
│  │ • Reviews     │  │  │                     │
│  └───────────────┘  │  └─────────────────────┘
└─────────────────────┘
```

### 1.2 Компоненты системы

| Компонент | Назначение | Технология |
|-----------|------------|------------|
| **Frontend** | UI, SSR, Static Generation | Next.js 16, React 19 |
| **API Layer** | REST endpoints | Next.js API Routes |
| **Database** | Persistent storage | PostgreSQL + Prisma |
| **File Storage** | Images, Videos | Cloudflare R2 |
| **Authentication** | User sessions | NextAuth.js |
| **Payments** | Transactions | Stripe |
| **Maps** | Geolocation | Mapbox |
| **Analytics** | User tracking | PostHog |
| **Monitoring** | Error tracking | Sentry |

---

## 2. Архитектура Frontend

### 2.1 Структура приложения

```
┌─────────────────────────────────────────────────────────────────┐
│                        APP SHELL                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                     PROVIDERS                              │  │
│  │  • SessionProvider (NextAuth)                              │  │
│  │  • ThemeProvider (Dark/Light)                              │  │
│  │  • ToastProvider (Notifications)                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                     NAVIGATION                             │  │
│  │  Logo | Links | Search | Language | User Menu              │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                     PAGE CONTENT                           │  │
│  │                                                            │  │
│  │   ┌─────────────────────────────────────────────────────┐ │  │
│  │   │              ROUTE-BASED PAGES                       │ │  │
│  │   │                                                      │ │  │
│  │   │  /              → HomePage                           │ │  │
│  │   │  /properties    → PropertiesPage                     │ │  │
│  │   │  /properties/[id] → PropertyDetailPage               │ │  │
│  │   │  /vehicles      → VehiclesPage                       │ │  │
│  │   │  /tours         → ToursPage                          │ │  │
│  │   │  /exchange      → ExchangePage                       │ │  │
│  │   │  /profile       → ProfilePage                        │ │  │
│  │   │  /admin         → AdminDashboard                     │ │  │
│  │   │                                                      │ │  │
│  │   └─────────────────────────────────────────────────────┘ │  │
│  │                                                            │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                      FOOTER                                │  │
│  │  Links | Contact | Social | Copyright                      │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Иерархия компонентов

```
components/
├── ui/                          # Базовые UI компоненты
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Select.tsx
│   ├── Modal.tsx
│   ├── Card.tsx
│   ├── Badge.tsx
│   ├── Avatar.tsx
│   ├── Skeleton.tsx
│   └── Toast.tsx
│
├── layout/                      # Layout компоненты
│   ├── Navigation.tsx
│   │   ├── Logo
│   │   ├── NavLinks
│   │   ├── SearchBar
│   │   ├── LanguageSelector
│   │   ├── UserMenu
│   │   └── MobileMenu
│   │
│   └── Footer.tsx
│       ├── FooterLinks
│       ├── ContactInfo
│       └── SocialLinks
│
├── sections/                    # Секции главной страницы
│   ├── Hero.tsx                 # Hero с видео и поиском
│   ├── QuickAccess.tsx          # Категории услуг
│   ├── FeaturedListings.tsx     # Featured объекты
│   ├── InteractiveMap.tsx       # Mapbox карта
│   └── Testimonials.tsx         # Отзывы
│
├── properties/                  # Property компоненты
│   ├── PropertyCard.tsx         # Карточка объекта
│   ├── PropertyCardSkeleton.tsx
│   ├── PropertyGrid.tsx
│   ├── PropertyFilters.tsx
│   ├── FilterPanel.tsx
│   ├── AdvancedSearch.tsx
│   └── ImageGallery.tsx
│
├── vehicles/                    # Vehicle компоненты
│   ├── VehicleCard.tsx
│   └── VehicleFilters.tsx
│
├── tours/                       # Tour компоненты
│   ├── TourCard.tsx
│   └── TourFilters.tsx
│
├── booking/                     # Booking компоненты
│   ├── BookingWidget.tsx
│   ├── DatePicker.tsx
│   ├── GuestSelector.tsx
│   └── PriceSummary.tsx
│
├── forms/                       # Формы
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   ├── PropertyForm.tsx
│   ├── ReviewForm.tsx
│   └── ContactForm.tsx
│
└── modals/                      # Модальные окна
    ├── AuthModal.tsx
    ├── BookingModal.tsx
    ├── ImageModal.tsx
    └── ConfirmModal.tsx
```

### 2.3 State Management (Zustand)

```typescript
// stores/index.ts
┌─────────────────────────────────────────────────────────────────┐
│                      ZUSTAND STORES                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   useUserStore  │  │ useSearchStore  │  │useBookingStore  │  │
│  │                 │  │                 │  │                 │  │
│  │ • user          │  │ • query         │  │ • draft         │  │
│  │ • isAuth        │  │ • filters       │  │ • dates         │  │
│  │ • favorites     │  │ • results       │  │ • guests        │  │
│  │ • setUser()     │  │ • setQuery()    │  │ • setDraft()    │  │
│  │ • logout()      │  │ • setFilters()  │  │ • clear()       │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐                       │
│  │   useUIStore    │  │useCurrencyStore │                       │
│  │                 │  │                 │                       │
│  │ • theme         │  │ • baseCurrency  │                       │
│  │ • language      │  │ • rates         │                       │
│  │ • sidebarOpen   │  │ • convert()     │                       │
│  │ • setTheme()    │  │ • fetchRates()  │                       │
│  └─────────────────┘  └─────────────────┘                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Архитектура Backend

### 3.1 API Routes структура

```
app/api/
│
├── auth/
│   └── [...nextauth]/
│       └── route.ts          # NextAuth handler
│
├── properties/
│   ├── route.ts              # GET (list), POST (create)
│   └── [id]/
│       └── route.ts          # GET, PUT, DELETE
│
├── vehicles/
│   ├── route.ts
│   └── [id]/
│       └── route.ts
│
├── tours/
│   ├── route.ts
│   └── [id]/
│       └── route.ts
│
├── bookings/
│   ├── route.ts
│   └── [id]/
│       └── route.ts
│
├── reviews/
│   ├── route.ts
│   └── [id]/
│       └── route.ts
│
├── search/
│   └── route.ts              # Global search endpoint
│
├── currency/
│   └── route.ts              # Exchange rates
│
├── upload/
│   └── route.ts              # File upload to R2
│
└── webhooks/
    └── stripe/
        └── route.ts          # Stripe webhooks
```

### 3.2 API Request Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │     │Middleware│     │  Route   │     │  Prisma  │
│          │     │          │     │ Handler  │     │          │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │
     │  HTTP Request  │                │                │
     │───────────────►│                │                │
     │                │                │                │
     │                │ Auth Check     │                │
     │                │ Rate Limit     │                │
     │                │ CORS           │                │
     │                │───────────────►│                │
     │                │                │                │
     │                │                │ Validate Input │
     │                │                │ (Zod Schema)   │
     │                │                │                │
     │                │                │ DB Query       │
     │                │                │───────────────►│
     │                │                │                │
     │                │                │◄───────────────│
     │                │                │ Result         │
     │                │                │                │
     │                │◄───────────────│                │
     │◄───────────────│ JSON Response  │                │
     │                │                │                │
```

### 3.3 Middleware Pipeline

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  // 1. Rate Limiting
  // 2. Authentication Check
  // 3. Role-based Access Control
  // 4. Request Logging
  // 5. CORS Headers
}

export const config = {
  matcher: [
    '/api/:path*',
    '/admin/:path*',
    '/profile/:path*',
  ],
};
```

---

## 4. Архитектура данных

### 4.1 Entity Relationship Diagram

```
┌───────────────────────────────────────────────────────────────────────────┐
│                           DATABASE SCHEMA                                  │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌─────────────┐         ┌─────────────┐         ┌─────────────┐          │
│  │   Account   │         │    User     │         │   Session   │          │
│  │─────────────│         │─────────────│         │─────────────│          │
│  │ id          │    ┌───►│ id (PK)     │◄───┐    │ id          │          │
│  │ userId (FK) │────┘    │ email       │    └────│ userId (FK) │          │
│  │ provider    │         │ password    │         │ sessionToken│          │
│  │ providerAcct│         │ name        │         │ expires     │          │
│  └─────────────┘         │ role        │         └─────────────┘          │
│                          │ phone       │                                   │
│                          │ image       │                                   │
│                          └──────┬──────┘                                   │
│                                 │                                          │
│        ┌────────────────────────┼────────────────────────┐                │
│        │                        │                        │                │
│        ▼                        ▼                        ▼                │
│  ┌─────────────┐         ┌─────────────┐         ┌─────────────┐          │
│  │  Property   │         │   Vehicle   │         │    Tour     │          │
│  │─────────────│         │─────────────│         │─────────────│          │
│  │ id (PK)     │         │ id (PK)     │         │ id (PK)     │          │
│  │ vendorId(FK)│         │ vendorId(FK)│         │ vendorId(FK)│          │
│  │ title       │         │ title       │         │ title       │          │
│  │ type        │         │ type        │         │ category    │          │
│  │ price       │         │ brand       │         │ duration    │          │
│  │ bedrooms    │         │ model       │         │ price       │          │
│  │ bathrooms   │         │ year        │         │ maxParticip │          │
│  │ amenities[] │         │ pricePerDay │         │ languages[] │          │
│  │ images[]    │         │ features[]  │         │ images[]    │          │
│  │ location    │         │ images[]    │         │ meetingPoint│          │
│  │ status      │         │ licensePlate│         │ schedule[]  │          │
│  └──────┬──────┘         └──────┬──────┘         └──────┬──────┘          │
│         │                       │                       │                 │
│         └───────────────────────┼───────────────────────┘                 │
│                                 │                                          │
│         ┌───────────────────────┼───────────────────────┐                 │
│         │                       │                       │                 │
│         ▼                       ▼                       ▼                 │
│  ┌─────────────┐         ┌─────────────┐         ┌─────────────┐          │
│  │   Booking   │         │   Review    │         │  Favorite   │          │
│  │─────────────│         │─────────────│         │─────────────│          │
│  │ id (PK)     │         │ id (PK)     │         │ id (PK)     │          │
│  │ userId (FK) │         │ userId (FK) │         │ userId (FK) │          │
│  │ propertyId  │         │ propertyId  │         │ propertyId  │          │
│  │ vehicleId   │         │ vehicleId   │         │ vehicleId   │          │
│  │ tourId      │         │ tourId      │         │ tourId      │          │
│  │ startDate   │         │ rating      │         │ createdAt   │          │
│  │ endDate     │         │ title       │         └─────────────┘          │
│  │ totalPrice  │         │ comment     │                                   │
│  │ status      │         │ images[]    │                                   │
│  │ paymentStatus│        │ helpful     │                                   │
│  └─────────────┘         └─────────────┘                                   │
│                                                                            │
│  ┌─────────────┐         ┌─────────────┐         ┌─────────────┐          │
│  │   Message   │         │Notification │         │CurrencyRate │          │
│  │─────────────│         │─────────────│         │─────────────│          │
│  │ id          │         │ id          │         │ id          │          │
│  │ senderId    │         │ userId      │         │ fromCurrency│          │
│  │ receiverId  │         │ type        │         │ toCurrency  │          │
│  │ content     │         │ title       │         │ rate        │          │
│  │ read        │         │ content     │         │ updatedAt   │          │
│  │ createdAt   │         │ read        │         └─────────────┘          │
│  └─────────────┘         └─────────────┘                                   │
│                                                                            │
└───────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Индексы базы данных

```sql
-- Primary indexes (auto-created)
-- User.id, Property.id, Vehicle.id, Tour.id, Booking.id, Review.id

-- Foreign key indexes
CREATE INDEX idx_property_vendor ON Property(vendorId);
CREATE INDEX idx_vehicle_vendor ON Vehicle(vendorId);
CREATE INDEX idx_tour_vendor ON Tour(vendorId);
CREATE INDEX idx_booking_user ON Booking(userId);
CREATE INDEX idx_review_user ON Review(userId);

-- Search indexes
CREATE INDEX idx_property_type_status ON Property(type, status);
CREATE INDEX idx_property_price ON Property(price);
CREATE INDEX idx_property_location ON Property(city, latitude, longitude);
CREATE INDEX idx_property_featured ON Property(featured) WHERE featured = true;

CREATE INDEX idx_vehicle_type ON Vehicle(type);
CREATE INDEX idx_tour_category ON Tour(category);

-- Date range indexes
CREATE INDEX idx_booking_dates ON Booking(startDate, endDate);
CREATE INDEX idx_booking_status ON Booking(status);

-- Full-text search (future)
-- CREATE INDEX idx_property_search ON Property USING GIN(to_tsvector('english', title || ' ' || description));
```

---

## 5. Интеграции

### 5.1 Карта интеграций

```
┌─────────────────────────────────────────────────────────────────────┐
│                       EXTERNAL INTEGRATIONS                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                      PAYMENTS (Stripe)                       │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │    │
│  │  │  Checkout   │  │   Connect   │  │     Webhooks        │  │    │
│  │  │  Sessions   │  │  (Payouts)  │  │  • payment_intent   │  │    │
│  │  └─────────────┘  └─────────────┘  │  • checkout.session │  │    │
│  │                                     │  • refund.created   │  │    │
│  │                                     └─────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                       MAPS (Mapbox)                          │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │    │
│  │  │  GL JS Map  │  │  Geocoding  │  │   Directions API    │  │    │
│  │  │  Component  │  │  (Search)   │  │   (Future)          │  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                     FILE STORAGE (R2)                        │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │    │
│  │  │   Images    │  │   Videos    │  │   Signed URLs       │  │    │
│  │  │   Upload    │  │   Upload    │  │   (Private access)  │  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌───────────────────────────┐  ┌───────────────────────────┐       │
│  │     EMAIL (Resend)        │  │    ANALYTICS (PostHog)    │       │
│  │  • Booking confirmation   │  │  • Page views             │       │
│  │  • Password reset         │  │  • User events            │       │
│  │  • Notifications          │  │  • Feature flags          │       │
│  └───────────────────────────┘  └───────────────────────────┘       │
│                                                                      │
│  ┌───────────────────────────┐  ┌───────────────────────────┐       │
│  │   MONITORING (Sentry)     │  │   EXTERNAL APIs           │       │
│  │  • Error tracking         │  │  • Currency rates         │       │
│  │  • Performance traces     │  │  • Weather data           │       │
│  │  • User feedback          │  │                           │       │
│  └───────────────────────────┘  └───────────────────────────┘       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.2 Stripe Integration Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │     │   API    │     │  Stripe  │     │ Database │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │
     │ Create Booking │                │                │
     │───────────────►│                │                │
     │                │                │                │
     │                │ Create Checkout│                │
     │                │ Session        │                │
     │                │───────────────►│                │
     │                │                │                │
     │                │◄───────────────│                │
     │                │ Session URL    │                │
     │◄───────────────│                │                │
     │ Redirect       │                │                │
     │                │                │                │
     │ ════════════════════════════════│                │
     │        Stripe Checkout Page     │                │
     │ ════════════════════════════════│                │
     │                │                │                │
     │                │                │ Webhook        │
     │                │◄───────────────│ payment.success│
     │                │                │                │
     │                │ Update Booking │                │
     │                │ Status         │                │
     │                │───────────────────────────────►│
     │                │                │                │
     │ Return URL     │                │                │
     │◄───────────────│                │                │
```

---

## 6. Безопасность

### 6.1 Архитектура безопасности

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SECURITY LAYERS                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    EDGE LAYER                                │    │
│  │  • Cloudflare WAF (DDoS protection)                         │    │
│  │  • Rate limiting                                             │    │
│  │  • SSL/TLS termination                                       │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                              │                                       │
│                              ▼                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                  APPLICATION LAYER                           │    │
│  │  • Security headers (HSTS, CSP, X-Frame-Options)            │    │
│  │  • Authentication (NextAuth)                                 │    │
│  │  • Authorization (Role-based)                                │    │
│  │  • Input validation (Zod)                                    │    │
│  │  • CSRF protection                                           │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                              │                                       │
│                              ▼                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    DATA LAYER                                │    │
│  │  • SQL injection prevention (Prisma ORM)                    │    │
│  │  • Password hashing (bcrypt)                                 │    │
│  │  • Encrypted connections (TLS)                               │    │
│  │  • Minimal data exposure                                     │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.2 Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────┐                                              ┌───────┐ │
│  │ Client  │                                              │  DB   │ │
│  └────┬────┘                                              └───┬───┘ │
│       │                                                       │     │
│       │  1. POST /api/auth/signin                             │     │
│       │     {email, password}                                 │     │
│       │ ─────────────────────────────────────────────────────►│     │
│       │                                                       │     │
│       │  2. Verify credentials                                │     │
│       │     bcrypt.compare(password, hash)                    │     │
│       │ ◄─────────────────────────────────────────────────────│     │
│       │                                                       │     │
│       │  3. Generate JWT                                      │     │
│       │     {userId, role, exp}                               │     │
│       │                                                       │     │
│       │  4. Set HTTP-only cookie                              │     │
│       │     next-auth.session-token                           │     │
│       │ ◄─────────────────────────────────────────────────────│     │
│       │                                                       │     │
│       │  5. Subsequent requests                               │     │
│       │     Cookie: next-auth.session-token=xxx               │     │
│       │ ─────────────────────────────────────────────────────►│     │
│       │                                                       │     │
│       │  6. Validate session                                  │     │
│       │     Middleware check                                  │     │
│       │                                                       │     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.3 Role-Based Access Control

```typescript
enum UserRole {
  TOURIST = 'TOURIST',
  VENDOR = 'VENDOR',
  ADMIN = 'ADMIN',
}

const permissions = {
  // Properties
  'property:read': [TOURIST, VENDOR, ADMIN],
  'property:create': [VENDOR, ADMIN],
  'property:update': [VENDOR, ADMIN],  // own only for VENDOR
  'property:delete': [VENDOR, ADMIN],  // own only for VENDOR

  // Bookings
  'booking:create': [TOURIST, VENDOR, ADMIN],
  'booking:read': [TOURIST, VENDOR, ADMIN],  // own only
  'booking:cancel': [TOURIST, VENDOR, ADMIN],  // own only

  // Admin
  'admin:access': [ADMIN],
  'user:manage': [ADMIN],
  'content:moderate': [ADMIN],
};
```

---

## 7. Производительность

### 7.1 Оптимизации

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PERFORMANCE OPTIMIZATIONS                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    FRONTEND                                  │    │
│  │                                                              │    │
│  │  ✓ Code splitting (automatic via Next.js)                   │    │
│  │  ✓ Image optimization (next/image, WebP/AVIF)               │    │
│  │  ✓ Lazy loading (dynamic imports)                           │    │
│  │  ✓ Font optimization (next/font)                            │    │
│  │  ✓ CSS purging (TailwindCSS)                                │    │
│  │  ✓ Bundle analysis (webpack-bundle-analyzer)                │    │
│  │  □ Service Worker (PWA) - future                            │    │
│  │                                                              │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    BACKEND                                   │    │
│  │                                                              │    │
│  │  ✓ Edge functions (Vercel Edge)                             │    │
│  │  ✓ Database connection pooling (Prisma)                     │    │
│  │  ✓ Query optimization (select/include)                      │    │
│  │  ✓ Pagination (cursor-based)                                │    │
│  │  □ Redis caching - future                                   │    │
│  │  □ Database read replicas - future                          │    │
│  │                                                              │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    INFRASTRUCTURE                            │    │
│  │                                                              │    │
│  │  ✓ Global CDN (Vercel Edge Network)                         │    │
│  │  ✓ Static asset caching                                     │    │
│  │  ✓ Gzip/Brotli compression                                  │    │
│  │  ✓ HTTP/2                                                   │    │
│  │  □ Multi-region deployment - future                         │    │
│  │                                                              │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 7.2 Caching Strategy

```
┌─────────────────────────────────────────────────────────────────────┐
│                      CACHING LAYERS                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Layer 1: Browser Cache                                              │
│  ├── Static assets: 1 year (immutable)                              │
│  ├── Images: 1 week (stale-while-revalidate)                        │
│  └── HTML: no-cache (always revalidate)                             │
│                                                                      │
│  Layer 2: CDN Cache (Vercel)                                         │
│  ├── Static pages: ISR with revalidation                            │
│  ├── API responses: Cache-Control headers                           │
│  └── Dynamic pages: Edge caching                                    │
│                                                                      │
│  Layer 3: Application Cache (Future)                                 │
│  ├── Redis: Session data                                            │
│  ├── Redis: API response caching                                    │
│  └── Redis: Database query caching                                  │
│                                                                      │
│  Layer 4: Database                                                   │
│  ├── PostgreSQL query cache                                         │
│  └── Connection pooling                                             │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 8. Мониторинг

### 8.1 Observability Stack

```
┌─────────────────────────────────────────────────────────────────────┐
│                    MONITORING & OBSERVABILITY                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    ERROR TRACKING                            │    │
│  │                       (Sentry)                               │    │
│  │                                                              │    │
│  │  • Frontend errors (React Error Boundaries)                 │    │
│  │  • Backend errors (API route exceptions)                    │    │
│  │  • Performance traces                                        │    │
│  │  • Release tracking                                          │    │
│  │  • User feedback collection                                  │    │
│  │                                                              │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                      ANALYTICS                               │    │
│  │                      (PostHog)                               │    │
│  │                                                              │    │
│  │  • Page views & navigation                                   │    │
│  │  • User identification                                       │    │
│  │  • Event tracking                                            │    │
│  │  • Session recordings                                        │    │
│  │  • Feature flags                                             │    │
│  │  • A/B testing                                               │    │
│  │                                                              │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    INFRASTRUCTURE                            │    │
│  │                   (Vercel Analytics)                         │    │
│  │                                                              │    │
│  │  • Web Vitals (LCP, FID, CLS)                               │    │
│  │  • Serverless function metrics                               │    │
│  │  • Deployment logs                                           │    │
│  │  • Edge network performance                                  │    │
│  │                                                              │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 8.2 Key Metrics

| Категория | Метрика | Целевое значение |
|-----------|---------|------------------|
| **Performance** | LCP | < 2.5s |
| | FID | < 100ms |
| | CLS | < 0.1 |
| | TTFB | < 200ms |
| **Availability** | Uptime | 99.9% |
| | Error Rate | < 0.1% |
| **API** | Response Time (p95) | < 500ms |
| | Success Rate | > 99.5% |
| **Business** | Conversion Rate | > 5% |
| | Bounce Rate | < 40% |

---

## 9. Deployment

### 9.1 CI/CD Pipeline

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CI/CD PIPELINE                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────────────┐   │
│  │  Push   │───►│  Build  │───►│  Test   │───►│    Deploy       │   │
│  │         │    │         │    │         │    │                 │   │
│  └─────────┘    └─────────┘    └─────────┘    └─────────────────┘   │
│                                                                      │
│  Feature Branch:                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  1. Push to feature/xxx                                      │    │
│  │  2. Vercel creates Preview URL                               │    │
│  │  3. Run Lint + Type check + Unit tests                       │    │
│  │  4. Deploy to preview environment                            │    │
│  │  5. Generate preview URL for review                          │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  Main Branch:                                                        │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  1. Merge PR to main                                         │    │
│  │  2. Run full test suite                                      │    │
│  │  3. Build production bundle                                  │    │
│  │  4. Run database migrations                                  │    │
│  │  5. Deploy to production                                     │    │
│  │  6. Run smoke tests                                          │    │
│  │  7. Notify team (Slack/Discord)                              │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 9.2 Environments

| Environment | URL | Branch | Database | Purpose |
|-------------|-----|--------|----------|---------|
| **Development** | localhost:3000 | any | Local/Dev | Local development |
| **Preview** | *.vercel.app | feature/* | Preview DB | PR testing |
| **Staging** | staging.phukethub.com | develop | Staging DB | Pre-production |
| **Production** | phukethub.com | main | Production DB | Live users |

---

## 10. Масштабирование

### 10.1 Roadmap масштабирования

```
┌─────────────────────────────────────────────────────────────────────┐
│                     SCALING ROADMAP                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Phase 1: Current (0-10K MAU)                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  • Single Vercel deployment                                  │    │
│  │  • Single PostgreSQL instance                                │    │
│  │  • Cloudflare R2 for files                                   │    │
│  │  • Basic monitoring (Sentry + PostHog)                       │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  Phase 2: Growth (10K-100K MAU)                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  • Add Redis caching layer                                   │    │
│  │  • PostgreSQL read replicas                                  │    │
│  │  • CDN for image optimization                                │    │
│  │  • Background job queue (inngest/trigger.dev)                │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  Phase 3: Scale (100K+ MAU)                                         │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  • Multi-region deployment                                   │    │
│  │  • Database sharding                                         │    │
│  │  • Dedicated search (Elasticsearch/Algolia)                  │    │
│  │  • Microservices extraction (if needed)                      │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 11. Приложения

### A. Диаграмма последовательности: Booking Flow

```
┌──────┐     ┌───────┐     ┌─────┐     ┌────────┐     ┌──────┐
│Client│     │NextJS │     │Prisma│    │ Stripe │     │ Email│
└──┬───┘     └───┬───┘     └──┬──┘     └───┬────┘     └──┬───┘
   │             │            │            │             │
   │ Select dates│            │            │             │
   │────────────►│            │            │             │
   │             │            │            │             │
   │             │ Check      │            │             │
   │             │ availability│           │             │
   │             │───────────►│            │             │
   │             │◄───────────│            │             │
   │◄────────────│ Price calc │            │             │
   │             │            │            │             │
   │ Confirm     │            │            │             │
   │────────────►│            │            │             │
   │             │            │            │             │
   │             │ Create     │            │             │
   │             │ booking    │            │             │
   │             │───────────►│            │             │
   │             │            │            │             │
   │             │ Create     │            │             │
   │             │ checkout   │            │             │
   │             │───────────────────────►│             │
   │             │◄───────────────────────│             │
   │◄────────────│ Redirect   │            │             │
   │             │            │            │             │
   │═══════════════════════════════════════│             │
   │         Stripe Checkout               │             │
   │═══════════════════════════════════════│             │
   │             │            │            │             │
   │             │◄───────────────────────│ Webhook     │
   │             │            │            │             │
   │             │ Update     │            │             │
   │             │ booking    │            │             │
   │             │───────────►│            │             │
   │             │            │            │             │
   │             │ Send       │            │             │
   │             │ confirmation│           │             │
   │             │─────────────────────────────────────►│
   │             │            │            │             │
   │◄────────────│ Success    │            │             │
   │             │            │            │             │
```

### B. Конфигурационные файлы

```typescript
// next.config.js
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { hostname: 'images.unsplash.com' },
      { hostname: 'res.cloudinary.com' },
      { hostname: '*.r2.cloudflarestorage.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

// Security headers
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
];
```

---

*Document maintained by PhuketHub Engineering Team*
