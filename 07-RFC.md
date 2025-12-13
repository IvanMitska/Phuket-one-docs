# Request for Comments (RFC)
# Phuket App

**Версия:** 1.0
**Дата:** 12 декабря 2025

---

## Оглавление

- [RFC-001: Реализация онлайн-оплаты](#rfc-001-реализация-онлайн-оплаты)
- [RFC-002: Push-уведомления и напоминания](#rfc-002-push-уведомления-и-напоминания)
- [RFC-003: Система отзывов и рейтингов](#rfc-003-система-отзывов-и-рейтингов)
- [RFC-004: Offline режим для iOS приложения](#rfc-004-offline-режим-для-ios-приложения)
- [RFC-005: B2B партнерская панель](#rfc-005-b2b-партнерская-панель)

---

## RFC-001: Реализация онлайн-оплаты

### Метаданные
| Поле | Значение |
|------|----------|
| **Статус** | Draft |
| **Автор** | Product Team |
| **Дата создания** | 12.12.2025 |
| **Deadline для комментариев** | 26.12.2025 |
| **Связанные PRD** | BOOK-001, BOOK-005 |

### 1. Summary

Предложение добавить онлайн-оплату бронирований через Stripe с поддержкой кредитных карт и локальных тайских методов оплаты (PromptPay, банковский перевод).

### 2. Motivation

**Текущее состояние:**
- Бронирования создаются без оплаты
- Оплата происходит при получении (cash/transfer)
- Высокий % no-show (~15%)
- Нет гарантии для партнеров

**Ожидаемые улучшения:**
- Снижение no-show до 5%
- Увеличение конверсии (instant booking)
- Автоматический revenue tracking
- Возможность частичной предоплаты

### 3. Detailed Design

#### 3.1 Платежный провайдер

**Рекомендация: Stripe**

| Критерий | Stripe | 2C2P | Omise |
|----------|--------|------|-------|
| Международные карты | ✅ | ✅ | ✅ |
| PromptPay | ✅ | ✅ | ✅ |
| API качество | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Документация | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Комиссия | 3.4% + $0.25 | 2.9% | 3.65% |
| iOS SDK | ✅ | ✅ | ✅ |

#### 3.2 Payment Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          PAYMENT FLOW                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────┐        ┌───────────┐        ┌───────────┐        ┌────────┐ │
│  │  iOS App  │        │  Backend  │        │  Stripe   │        │  Bank  │ │
│  └─────┬─────┘        └─────┬─────┘        └─────┬─────┘        └────┬───┘ │
│        │                    │                    │                   │     │
│        │ 1. Create Booking  │                    │                   │     │
│        │───────────────────>│                    │                   │     │
│        │                    │                    │                   │     │
│        │                    │ 2. Create Payment  │                   │     │
│        │                    │    Intent          │                   │     │
│        │                    │───────────────────>│                   │     │
│        │                    │                    │                   │     │
│        │                    │<───────────────────│                   │     │
│        │                    │ client_secret      │                   │     │
│        │                    │                    │                   │     │
│        │<───────────────────│                    │                   │     │
│        │ Booking + secret   │                    │                   │     │
│        │                    │                    │                   │     │
│        │ 3. Confirm Payment │                    │                   │     │
│        │    (Stripe SDK)    │                    │                   │     │
│        │────────────────────────────────────────>│                   │     │
│        │                    │                    │                   │     │
│        │                    │                    │ 4. Process        │     │
│        │                    │                    │───────────────────>     │
│        │                    │                    │                   │     │
│        │                    │                    │<──────────────────│     │
│        │                    │                    │                   │     │
│        │<────────────────────────────────────────│                   │     │
│        │ Payment result     │                    │                   │     │
│        │                    │                    │                   │     │
│        │                    │ 5. Webhook         │                   │     │
│        │                    │<───────────────────│                   │     │
│        │                    │ payment_intent.    │                   │     │
│        │                    │ succeeded          │                   │     │
│        │                    │                    │                   │     │
│        │                    │ 6. Update booking  │                   │     │
│        │                    │    status          │                   │     │
│        │                    │                    │                   │     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 3.3 API Changes

**New Endpoints:**

```
POST /payments/create-intent
Request:
{
  "booking_id": "uuid",
  "amount": 5000,
  "currency": "THB",
  "payment_method_types": ["card", "promptpay"]
}

Response:
{
  "client_secret": "pi_xxx_secret_yyy",
  "payment_intent_id": "pi_xxx"
}

---

POST /webhooks/stripe
Stripe webhook для обновления статуса платежа
```

**Database Changes:**

```sql
ALTER TABLE bookings ADD COLUMN payment_intent_id VARCHAR(255);
ALTER TABLE bookings ADD COLUMN payment_method VARCHAR(50);
ALTER TABLE bookings ADD COLUMN paid_at TIMESTAMP;

CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id),
  stripe_payment_intent_id VARCHAR(255),
  amount DECIMAL(10,2),
  currency VARCHAR(3),
  status VARCHAR(50),
  payment_method VARCHAR(50),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### 3.4 iOS Implementation

```swift
// Using Stripe iOS SDK
import StripePaymentSheet

class PaymentManager {
    var paymentSheet: PaymentSheet?

    func preparePaymentSheet(clientSecret: String) {
        var config = PaymentSheet.Configuration()
        config.merchantDisplayName = "Phuket App"
        config.allowsDelayedPaymentMethods = false

        paymentSheet = PaymentSheet(
            paymentIntentClientSecret: clientSecret,
            configuration: config
        )
    }

    func presentPaymentSheet(from viewController: UIViewController) async -> PaymentSheetResult {
        guard let paymentSheet else { return .failed(error: PaymentError.notInitialized) }

        return await withCheckedContinuation { continuation in
            paymentSheet.present(from: viewController) { result in
                continuation.resume(returning: result)
            }
        }
    }
}
```

### 4. Cancellation & Refund Policy

| Время до начала | Возврат |
|-----------------|---------|
| > 48 часов | 100% |
| 24-48 часов | 50% |
| < 24 часов | 0% |

### 5. Security Considerations

- PCI DSS compliance через Stripe (Level 1)
- Карточные данные никогда не проходят через наш сервер
- Webhook signature verification
- Idempotency keys для предотвращения двойных списаний

### 6. Estimated Effort

| Task | Effort |
|------|--------|
| Backend integration | 3 days |
| iOS Stripe SDK | 2 days |
| Webhook handling | 1 day |
| Refund logic | 1 day |
| Testing | 2 days |
| **Total** | **9 days** |

### 7. Open Questions

1. Нужна ли частичная предоплата (deposit)?
2. Поддерживать ли криптовалюты?
3. Как обрабатывать split payments (несколько методов)?

### 8. Alternatives Considered

- **PayPal**: Плохая поддержка в Таиланде
- **Direct bank integration**: Слишком сложно
- **2C2P**: Менее удобный API, но дешевле

---

## RFC-002: Push-уведомления и напоминания

### Метаданные
| Поле | Значение |
|------|----------|
| **Статус** | Draft |
| **Автор** | Mobile Team |
| **Дата создания** | 12.12.2025 |
| **Deadline для комментариев** | 26.12.2025 |

### 1. Summary

Внедрение системы push-уведомлений через Firebase Cloud Messaging (FCM) для напоминаний о бронированиях, промо-акций и персонализированных рекомендаций.

### 2. Notification Types

| Тип | Trigger | Timing |
|-----|---------|--------|
| Booking confirmation | После создания брони | Мгновенно |
| Booking reminder | Scheduled | За 24 часа до |
| Tour reminder | Scheduled | За 12 часов + location |
| Check-in reminder | Scheduled | День заезда утром |
| Check-out reminder | Scheduled | День выезда утром |
| Vehicle return | Scheduled | Последний день аренды |
| Currency alert | Rate change > 3% | Real-time |
| Loyalty milestone | Points threshold | Мгновенно |
| Promo/Marketing | Manual trigger | Scheduled |

### 3. Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      NOTIFICATION ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      NOTIFICATION SERVICE                            │   │
│  │                                                                      │   │
│  │  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │   │
│  │  │   Triggers   │───>│  Scheduler   │───>│    Queue     │          │   │
│  │  │              │    │   (Celery)   │    │   (Redis)    │          │   │
│  │  │ • Booking    │    │              │    │              │          │   │
│  │  │ • Schedule   │    │ • Cron jobs  │    │ • Priority   │          │   │
│  │  │ • Event      │    │ • Delayed    │    │ • Retry      │          │   │
│  │  └──────────────┘    └──────────────┘    └──────┬───────┘          │   │
│  │                                                  │                  │   │
│  └──────────────────────────────────────────────────┼──────────────────┘   │
│                                                     │                      │
│                                                     ▼                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      DELIVERY LAYER                                  │   │
│  │                                                                      │   │
│  │  ┌──────────────────────────────────────────────────────────────┐   │   │
│  │  │                    Firebase Cloud Messaging                   │   │   │
│  │  │                                                               │   │   │
│  │  │  • Device token management                                   │   │   │
│  │  │  • iOS APNs integration                                      │   │   │
│  │  │  • Topic subscriptions                                       │   │   │
│  │  │  • Analytics                                                 │   │   │
│  │  └──────────────────────────────────────────────────────────────┘   │   │
│  │                                                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│                              ┌───────────────┐                             │
│                              │               │                             │
│                              │   iOS App     │                             │
│                              │               │                             │
│                              └───────────────┘                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4. Data Model

```sql
CREATE TABLE device_tokens (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  token VARCHAR(500) NOT NULL,
  platform VARCHAR(20) NOT NULL, -- 'ios', 'android', 'web'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(user_id, token)
);

CREATE TABLE notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  booking_reminders BOOLEAN DEFAULT true,
  marketing BOOLEAN DEFAULT true,
  currency_alerts BOOLEAN DEFAULT false,
  quiet_hours_start TIME, -- e.g., '22:00'
  quiet_hours_end TIME,   -- e.g., '08:00'
  timezone VARCHAR(50) DEFAULT 'Asia/Bangkok'
);

CREATE TABLE notification_log (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  type VARCHAR(50),
  title VARCHAR(255),
  body TEXT,
  data JSONB,
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  opened_at TIMESTAMP,
  status VARCHAR(20) -- 'sent', 'delivered', 'opened', 'failed'
);
```

### 5. iOS Implementation

```swift
// AppDelegate.swift
class AppDelegate: NSObject, UIApplicationDelegate, UNUserNotificationCenterDelegate {

    func application(_ application: UIApplication,
                    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        FirebaseApp.configure()
        UNUserNotificationCenter.current().delegate = self
        registerForRemoteNotifications()
        return true
    }

    func application(_ application: UIApplication,
                    didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        Messaging.messaging().apnsToken = deviceToken
    }

    // Handle notification when app is in foreground
    func userNotificationCenter(_ center: UNUserNotificationCenter,
                               willPresent notification: UNNotification,
                               completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        completionHandler([.banner, .sound, .badge])
    }

    // Handle notification tap
    func userNotificationCenter(_ center: UNUserNotificationCenter,
                               didReceive response: UNNotificationResponse,
                               completionHandler: @escaping () -> Void) {
        let userInfo = response.notification.request.content.userInfo
        handleNotificationTap(userInfo: userInfo)
        completionHandler()
    }
}
```

### 6. Notification Content Examples

**Booking Confirmation:**
```json
{
  "title": "Booking Confirmed!",
  "body": "Your Honda PCX 160 is booked for Dec 15-22",
  "data": {
    "type": "booking_confirmed",
    "booking_id": "uuid",
    "deep_link": "phuketapp://booking/uuid"
  }
}
```

**Reminder:**
```json
{
  "title": "Reminder: Tour Tomorrow",
  "body": "Phi Phi Islands Day Trip starts at 8:00 AM. Meeting point: Rassada Pier",
  "data": {
    "type": "tour_reminder",
    "booking_id": "uuid",
    "meeting_point": { "lat": 7.86, "lng": 98.40 }
  }
}
```

### 7. Estimated Effort

| Task | Effort |
|------|--------|
| Firebase setup | 1 day |
| Backend notification service | 3 days |
| iOS integration | 2 days |
| Scheduler (Celery) | 2 days |
| Testing | 2 days |
| **Total** | **10 days** |

---

## RFC-003: Система отзывов и рейтингов

### Метаданные
| Поле | Значение |
|------|----------|
| **Статус** | Draft |
| **Автор** | Product Team |
| **Дата создания** | 12.12.2025 |
| **Deadline для комментариев** | 26.12.2025 |

### 1. Summary

Добавление системы отзывов и рейтингов для vehicles, properties и tours. Пользователи смогут оставлять отзывы после завершения бронирования.

### 2. Requirements

- Отзыв можно оставить только после completed booking
- Рейтинг 1-5 звезд
- Текстовый отзыв опционален
- Фото в отзывах (до 5)
- Ответы от владельцев/операторов
- Модерация перед публикацией
- Агрегированный рейтинг для каждого item

### 3. Data Model

```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  booking_id UUID REFERENCES bookings(id) UNIQUE,
  item_id UUID NOT NULL,
  item_type VARCHAR(20) NOT NULL, -- 'vehicle', 'property', 'tour'

  -- Rating
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(100),
  content TEXT,

  -- Detailed ratings (optional)
  cleanliness_rating INTEGER CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
  service_rating INTEGER CHECK (service_rating >= 1 AND service_rating <= 5),
  value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),

  -- Moderation
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  moderated_at TIMESTAMP,
  moderated_by UUID,
  rejection_reason TEXT,

  -- Engagement
  helpful_count INTEGER DEFAULT 0,
  reported_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);

CREATE TABLE review_photos (
  id UUID PRIMARY KEY,
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  photo_url VARCHAR(500) NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE review_responses (
  id UUID PRIMARY KEY,
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  responder_id UUID NOT NULL, -- partner/operator ID
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE review_helpful (
  user_id UUID REFERENCES users(id),
  review_id UUID REFERENCES reviews(id),
  PRIMARY KEY (user_id, review_id)
);

-- Indexes
CREATE INDEX idx_reviews_item ON reviews(item_id, item_type);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_status ON reviews(status);
```

### 4. API Endpoints

```
POST /reviews
Request:
{
  "booking_id": "uuid",
  "rating": 5,
  "title": "Great experience!",
  "content": "The scooter was in perfect condition...",
  "cleanliness_rating": 5,
  "service_rating": 5,
  "value_rating": 4,
  "photos": ["base64...", "base64..."]
}

GET /reviews?item_type=vehicle&item_id=uuid&page=1&sort=recent

GET /reviews/{id}

POST /reviews/{id}/helpful
Mark review as helpful

POST /reviews/{id}/report
Report inappropriate review
```

### 5. Moderation Flow

```
User submits review
        │
        ▼
   Auto-check
   (profanity, spam)
        │
   ┌────┴────┐
   │         │
   ▼         ▼
 Pass     Flagged
   │         │
   ▼         ▼
Approved   Manual
(auto)     Review
             │
        ┌────┴────┐
        │         │
        ▼         ▼
     Approve   Reject
```

### 6. Rating Aggregation

```python
def update_item_rating(item_id: UUID, item_type: str, db: AsyncSession):
    """Recalculate average rating for an item."""
    result = await db.execute(
        select(
            func.avg(Review.rating).label('avg_rating'),
            func.count(Review.id).label('reviews_count')
        )
        .where(Review.item_id == item_id)
        .where(Review.item_type == item_type)
        .where(Review.status == 'approved')
    )
    stats = result.first()

    # Update item table
    if item_type == 'vehicle':
        await db.execute(
            update(Vehicle)
            .where(Vehicle.id == item_id)
            .values(
                rating=round(stats.avg_rating, 1),
                reviews_count=stats.reviews_count
            )
        )
```

### 7. Estimated Effort

| Task | Effort |
|------|--------|
| Database schema | 1 day |
| Backend CRUD | 2 days |
| Photo upload (S3) | 1 day |
| Moderation system | 2 days |
| iOS UI | 3 days |
| Testing | 2 days |
| **Total** | **11 days** |

---

## RFC-004: Offline режим для iOS приложения

### Метаданные
| Поле | Значение |
|------|----------|
| **Статус** | Draft |
| **Автор** | Mobile Team |
| **Дата создания** | 12.12.2025 |
| **Deadline для комментариев** | 26.12.2025 |

### 1. Summary

Реализация offline режима для iOS приложения, позволяющего просматривать каталог и бронирования без интернета.

### 2. Scope

**Доступно offline:**
- Просмотр сохраненных vehicles/properties/tours
- Просмотр своих бронирований
- Просмотр избранного
- AI-ассистент (базовые ответы)

**Требует online:**
- Создание бронирований
- Оплата
- Актуальные курсы валют
- Актуальная погода
- Полноценный AI-чат

### 3. Implementation Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         OFFLINE ARCHITECTURE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         iOS App                                      │   │
│  │                                                                      │   │
│  │  ┌──────────────┐                        ┌──────────────┐          │   │
│  │  │   Network    │                        │  SwiftData   │          │   │
│  │  │   Manager    │                        │   (Local)    │          │   │
│  │  └──────┬───────┘                        └──────┬───────┘          │   │
│  │         │                                       │                  │   │
│  │         │                                       │                  │   │
│  │         └───────────────┬───────────────────────┘                  │   │
│  │                         │                                          │   │
│  │                         ▼                                          │   │
│  │               ┌──────────────────┐                                │   │
│  │               │   Repository     │                                │   │
│  │               │                  │                                │   │
│  │               │ • Check network  │                                │   │
│  │               │ • Return cached  │                                │   │
│  │               │   if offline     │                                │   │
│  │               │ • Sync when      │                                │   │
│  │               │   back online    │                                │   │
│  │               └──────────────────┘                                │   │
│  │                                                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4. SwiftData Models

```swift
import SwiftData

@Model
final class CachedVehicle {
    @Attribute(.unique) var id: UUID
    var type: String
    var brand: String
    var model: String
    var pricePerDay: Double
    var images: [String]
    var cachedAt: Date

    init(from vehicle: Vehicle) {
        self.id = vehicle.id
        self.type = vehicle.type.rawValue
        self.brand = vehicle.brand
        self.model = vehicle.model
        self.pricePerDay = vehicle.pricePerDay
        self.images = vehicle.images
        self.cachedAt = Date()
    }
}

@Model
final class CachedBooking {
    @Attribute(.unique) var id: UUID
    var itemTitle: String
    var startDate: Date
    var endDate: Date
    var status: String
    var confirmationCode: String
    var cachedAt: Date
}
```

### 5. Sync Strategy

```swift
class SyncManager {
    private let networkMonitor = NetworkMonitor.shared
    private let modelContext: ModelContext

    func startSync() {
        // Observe network changes
        networkMonitor.$isConnected
            .filter { $0 }
            .sink { [weak self] _ in
                Task { await self?.syncPendingChanges() }
            }
    }

    private func syncPendingChanges() async {
        // 1. Upload any offline-created data
        // 2. Fetch fresh data from server
        // 3. Update local cache
        // 4. Resolve conflicts (server wins)
    }

    func getCachedOrFetch<T: Cacheable>(
        _ type: T.Type,
        fetch: () async throws -> [T]
    ) async throws -> [T] {
        if networkMonitor.isConnected {
            let fresh = try await fetch()
            await cache(fresh)
            return fresh
        } else {
            return getCached(type)
        }
    }
}
```

### 6. UI Indicators

```swift
struct OfflineBanner: View {
    @ObservedObject var networkMonitor = NetworkMonitor.shared

    var body: some View {
        if !networkMonitor.isConnected {
            HStack {
                Image(systemName: "wifi.slash")
                Text("Offline mode")
                Spacer()
                Text("Data may be outdated")
                    .font(.caption)
            }
            .padding()
            .background(Color.orange.opacity(0.2))
        }
    }
}
```

### 7. Storage Limits

| Data | Max Size | TTL |
|------|----------|-----|
| Vehicles | 1000 items | 7 days |
| Properties | 500 items | 7 days |
| Tours | 500 items | 7 days |
| User bookings | All | 30 days |
| Favorites | All | No limit |
| Images | 100 MB | 7 days |

### 8. Estimated Effort

| Task | Effort |
|------|--------|
| SwiftData setup | 1 day |
| Cache models | 2 days |
| Sync manager | 3 days |
| Repository updates | 2 days |
| UI indicators | 1 day |
| Testing | 2 days |
| **Total** | **11 days** |

---

## RFC-005: B2B партнерская панель

### Метаданные
| Поле | Значение |
|------|----------|
| **Статус** | Draft |
| **Автор** | Product Team |
| **Дата создания** | 12.12.2025 |
| **Deadline для комментариев** | 26.12.2025 |

### 1. Summary

Создание веб-панели для партнеров (прокаты, виллы, туроператоры) для управления своими объявлениями, бронированиями и аналитикой.

### 2. User Roles

| Role | Permissions |
|------|-------------|
| Partner Admin | Full access to own listings |
| Partner Staff | View bookings, limited edit |
| Platform Admin | Full access to all |

### 3. Features

**Dashboard:**
- Revenue overview
- Booking statistics
- Occupancy rate
- Recent bookings

**Listings Management:**
- CRUD for vehicles/properties/tours
- Photo upload
- Pricing management
- Availability calendar

**Booking Management:**
- View all bookings
- Confirm/reject bookings
- Contact customers
- Process refunds

**Reviews:**
- View reviews
- Respond to reviews
- Report inappropriate reviews

**Analytics:**
- Revenue trends
- Popular items
- Customer demographics
- Conversion rates

### 4. Tech Stack (Proposed)

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Frontend | React + TypeScript | Team familiarity |
| UI Library | Tailwind + shadcn/ui | Fast development |
| State | React Query | Server state management |
| Auth | NextAuth.js | OAuth + credentials |
| Hosting | Vercel | Easy deployment |

### 5. Estimated Effort

| Task | Effort |
|------|--------|
| Auth & roles | 3 days |
| Dashboard | 5 days |
| Listings CRUD | 7 days |
| Booking management | 5 days |
| Reviews | 3 days |
| Analytics | 5 days |
| Testing | 4 days |
| **Total** | **32 days** |

### 6. Priority

**Phase 1 (MVP):**
- Login/Auth
- View bookings
- Basic listing edit
- Revenue summary

**Phase 2:**
- Full CRUD
- Reviews management
- Basic analytics

**Phase 3:**
- Advanced analytics
- Bulk operations
- API integration

---

## RFC Template

```markdown
## RFC-XXX: [Title]

### Метаданные
| Поле | Значение |
|------|----------|
| **Статус** | Draft / In Review / Accepted / Rejected |
| **Автор** | [Team/Person] |
| **Дата создания** | DD.MM.YYYY |
| **Deadline для комментариев** | DD.MM.YYYY |
| **Связанные документы** | PRD-X, ADR-X |

### 1. Summary
[Краткое описание предложения]

### 2. Motivation
[Почему это нужно? Какую проблему решаем?]

### 3. Detailed Design
[Техническое описание решения]

### 4. Alternatives Considered
[Какие альтернативы рассматривались?]

### 5. Security Considerations
[Влияние на безопасность]

### 6. Estimated Effort
[Оценка трудозатрат]

### 7. Open Questions
[Нерешенные вопросы]

### 8. References
[Ссылки на связанные документы]
```

---

## Процесс RFC

1. **Draft**: Автор создает RFC
2. **Review**: Команда комментирует (2 недели)
3. **Discussion**: Обсуждение на техническом митинге
4. **Decision**: Accept / Reject / Revise
5. **Implementation**: Если принято, создаются задачи в Jira

---

**Комментарии оставляйте в соответствующих тикетах или на tech meetings.**
