# System Design Document
# Phuket App

**Версия:** 1.0
**Дата:** 12 декабря 2025
**Автор:** Engineering Team
**Статус:** В разработке

---

## 1. Обзор системы

### 1.1 Назначение документа
Данный документ описывает высокоуровневую архитектуру системы Phuket App, включая компоненты, их взаимодействия, потоки данных и инфраструктуру.

### 1.2 Scope
- iOS мобильное приложение
- Backend API сервер
- База данных
- Внешние интеграции
- Инфраструктура

---

## 2. Архитектура системы

### 2.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              КЛИЕНТЫ                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│  │   iOS App    │    │ Android App  │    │   Web App    │                  │
│  │  (SwiftUI)   │    │  (Kotlin)    │    │   (React)    │                  │
│  │   [READY]    │    │  [PLANNED]   │    │  [PLANNED]   │                  │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘                  │
│         │                   │                   │                          │
│         └───────────────────┴───────────────────┘                          │
│                             │                                              │
│                             │ HTTPS (TLS 1.3)                              │
│                             │ REST API                                     │
│                             ▼                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                           EDGE LAYER                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         CDN (CloudFlare)                             │   │
│  │  • SSL Termination                                                   │   │
│  │  • DDoS Protection                                                   │   │
│  │  • Static Assets Cache                                               │   │
│  │  • WAF (Web Application Firewall)                                    │   │
│  └────────────────────────────────┬────────────────────────────────────┘   │
│                                   │                                        │
│                                   ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      Load Balancer (AWS ALB)                         │   │
│  │  • Health Checks                                                     │   │
│  │  • SSL Certificate                                                   │   │
│  │  • Request Routing                                                   │   │
│  └────────────────────────────────┬────────────────────────────────────┘   │
│                                   │                                        │
├───────────────────────────────────┼─────────────────────────────────────────┤
│                        APPLICATION LAYER                                    │
├───────────────────────────────────┼─────────────────────────────────────────┤
│                                   │                                        │
│         ┌─────────────────────────┴─────────────────────────┐              │
│         │                                                   │              │
│         ▼                                                   ▼              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│  │   API Pod 1  │    │   API Pod 2  │    │   API Pod N  │                  │
│  │   (FastAPI)  │    │   (FastAPI)  │    │   (FastAPI)  │                  │
│  │   Uvicorn    │    │   Uvicorn    │    │   Uvicorn    │                  │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘                  │
│         │                   │                   │                          │
│         └───────────────────┴───────────────────┘                          │
│                             │                                              │
├─────────────────────────────┼───────────────────────────────────────────────┤
│                       DATA LAYER                                            │
├─────────────────────────────┼───────────────────────────────────────────────┤
│                             │                                              │
│         ┌───────────────────┼───────────────────┐                          │
│         │                   │                   │                          │
│         ▼                   ▼                   ▼                          │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│  │  PostgreSQL  │    │    Redis     │    │     S3       │                  │
│  │   (Primary)  │    │   (Cache)    │    │   (Media)    │                  │
│  │              │    │              │    │              │                  │
│  │  • Users     │    │  • Sessions  │    │  • Images    │                  │
│  │  • Bookings  │    │  • Rate Lim  │    │  • Documents │                  │
│  │  • Catalog   │    │  • API Cache │    │  • Backups   │                  │
│  └──────────────┘    └──────────────┘    └──────────────┘                  │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                      EXTERNAL SERVICES                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │  OpenAI    │  │  Stripe    │  │  Firebase  │  │  SendGrid  │            │
│  │  (AI Chat) │  │ (Payments) │  │   (Push)   │  │  (Email)   │            │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘            │
│                                                                             │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                            │
│  │ OpenWeather│  │  Currency  │  │   Sentry   │                            │
│  │  (Weather) │  │    API     │  │ (Monitoring│                            │
│  └────────────┘  └────────────┘  └────────────┘                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Компоненты системы

#### 2.2.1 Mobile Application (iOS)

| Аспект | Описание |
|--------|----------|
| **Платформа** | iOS 17.0+ |
| **Язык** | Swift 5.9 |
| **UI Framework** | SwiftUI |
| **Архитектура** | MVVM + Repository Pattern |
| **Сеть** | URLSession с async/await |
| **Хранилище** | SwiftData + Keychain |
| **Безопасность** | SSL Pinning, Secure Enclave |

**Основные модули:**
```
PhuketApp/
├── Core/
│   ├── DI/           # Dependency Injection
│   ├── Network/      # API клиент, SSL Pinning
│   ├── Storage/      # Keychain, Cache, UserDefaults
│   └── Security/     # Encryption, Secure Storage
│
├── Features/
│   ├── Auth/         # Регистрация, вход
│   ├── Home/         # Главный экран, погода
│   ├── Transport/    # Аренда транспорта
│   ├── Accommodation/# Бронирование жилья
│   ├── Tours/        # Экскурсии
│   ├── Profile/      # Профиль, бронирования
│   ├── Currency/     # Конвертер валют
│   └── AIAssistant/  # AI-чат
│
└── Shared/
    ├── Models/       # Data models
    ├── Components/   # Reusable UI
    └── Utils/        # Helpers
```

#### 2.2.2 Backend API Server

| Аспект | Описание |
|--------|----------|
| **Язык** | Python 3.13 |
| **Framework** | FastAPI 0.115+ |
| **ASGI Server** | Uvicorn |
| **ORM** | SQLAlchemy 2.0 (async) |
| **Validation** | Pydantic 2.10+ |
| **Auth** | JWT (python-jose) |

**Структура:**
```
backend/app/
├── main.py           # FastAPI application
├── config.py         # Configuration
├── database.py       # DB connection
├── security.py       # Security middleware
│
├── models/           # SQLAlchemy ORM models
├── schemas/          # Pydantic DTOs
├── routers/          # API endpoints
└── services/         # Business logic
```

#### 2.2.3 Database Layer

**Primary Database: PostgreSQL**
```
┌─────────────────────────────────────────────────────────┐
│                     PostgreSQL                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Tables:                                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   users     │  │  vehicles   │  │ properties  │     │
│  │ (accounts)  │  │ (transport) │  │  (housing)  │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   tours     │  │  bookings   │  │   rates     │     │
│  │(excursions) │  │ (orders)    │  │ (currency)  │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│                                                         │
│  Indexes:                                               │
│  • users.email (unique, btree)                         │
│  • bookings.user_id (btree)                            │
│  • bookings.status (btree)                             │
│  • vehicles.type (btree)                               │
│  • properties.area (btree)                             │
│  • tours.category (btree)                              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Cache Layer: Redis**
```
┌─────────────────────────────────────────────────────────┐
│                       Redis                             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Keys:                                                  │
│  ┌────────────────────────────────────────────────┐    │
│  │ rate_limit:{ip}           → counter (TTL 60s)  │    │
│  │ session:{user_id}         → session data       │    │
│  │ cache:vehicles            → JSON (TTL 1h)      │    │
│  │ cache:properties          → JSON (TTL 1h)      │    │
│  │ cache:tours               → JSON (TTL 1h)      │    │
│  │ cache:currency_rates      → JSON (TTL 1h)      │    │
│  │ cache:weather             → JSON (TTL 30m)     │    │
│  │ blacklist:token:{jti}     → 1 (TTL 7d)         │    │
│  └────────────────────────────────────────────────┘    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Потоки данных

### 3.1 Authentication Flow

```
┌────────┐          ┌────────┐          ┌────────┐          ┌────────┐
│  iOS   │          │  API   │          │  Redis │          │ Postgres│
│  App   │          │ Server │          │ Cache  │          │   DB   │
└───┬────┘          └───┬────┘          └───┬────┘          └───┬────┘
    │                   │                   │                   │
    │ POST /auth/login  │                   │                   │
    │ {email, password} │                   │                   │
    │──────────────────>│                   │                   │
    │                   │                   │                   │
    │                   │ Check rate limit  │                   │
    │                   │──────────────────>│                   │
    │                   │<──────────────────│                   │
    │                   │                   │                   │
    │                   │ SELECT user WHERE email = ?           │
    │                   │──────────────────────────────────────>│
    │                   │<──────────────────────────────────────│
    │                   │                   │                   │
    │                   │ Verify bcrypt     │                   │
    │                   │ password hash     │                   │
    │                   │                   │                   │
    │                   │ Generate JWT      │                   │
    │                   │ (access + refresh)│                   │
    │                   │                   │                   │
    │ 200 OK            │                   │                   │
    │ {access_token,    │                   │                   │
    │  refresh_token,   │                   │                   │
    │  user}            │                   │                   │
    │<──────────────────│                   │                   │
    │                   │                   │                   │
    │ Store tokens      │                   │                   │
    │ in Keychain       │                   │                   │
    │                   │                   │                   │
```

### 3.2 Booking Creation Flow

```
┌────────┐          ┌────────┐          ┌────────┐          ┌────────┐
│  iOS   │          │  API   │          │ Postgres│          │Firebase│
│  App   │          │ Server │          │   DB   │          │  Push  │
└───┬────┘          └───┬────┘          └───┬────┘          └───┬────┘
    │                   │                   │                   │
    │ POST /bookings    │                   │                   │
    │ Authorization:    │                   │                   │
    │  Bearer {token}   │                   │                   │
    │ {itemId, dates,   │                   │                   │
    │  guestsCount}     │                   │                   │
    │──────────────────>│                   │                   │
    │                   │                   │                   │
    │                   │ Verify JWT        │                   │
    │                   │                   │                   │
    │                   │ SELECT item       │                   │
    │                   │ (vehicle/property/│                   │
    │                   │  tour)            │                   │
    │                   │──────────────────>│                   │
    │                   │<──────────────────│                   │
    │                   │                   │                   │
    │                   │ Check availability│                   │
    │                   │ (no overlapping   │                   │
    │                   │  bookings)        │                   │
    │                   │──────────────────>│                   │
    │                   │<──────────────────│                   │
    │                   │                   │                   │
    │                   │ Calculate price   │                   │
    │                   │ (days * rate)     │                   │
    │                   │                   │                   │
    │                   │ INSERT booking    │                   │
    │                   │ status='pending'  │                   │
    │                   │──────────────────>│                   │
    │                   │<──────────────────│                   │
    │                   │                   │                   │
    │                   │ Send push notification                │
    │                   │──────────────────────────────────────>│
    │                   │                   │                   │
    │ 201 Created       │                   │                   │
    │ {booking,         │                   │                   │
    │  confirmationCode}│                   │                   │
    │<──────────────────│                   │                   │
    │                   │                   │                   │
```

### 3.3 AI Chat Flow

```
┌────────┐          ┌────────┐          ┌────────┐
│  iOS   │          │  API   │          │ OpenAI │
│  App   │          │ Server │          │  API   │
└───┬────┘          └───┬────┘          └───┬────┘
    │                   │                   │
    │ POST /ai/chat     │                   │
    │ {message,         │                   │
    │  history}         │                   │
    │──────────────────>│                   │
    │                   │                   │
    │                   │ Sanitize input    │
    │                   │ Check prompt      │
    │                   │ injection         │
    │                   │                   │
    │                   │ Build system      │
    │                   │ prompt + context  │
    │                   │                   │
    │                   │ POST /chat/       │
    │                   │ completions       │
    │                   │ {model, messages} │
    │                   │──────────────────>│
    │                   │                   │
    │                   │<──────────────────│
    │                   │ {content,         │
    │                   │  usage}           │
    │                   │                   │
    │ 200 OK            │                   │
    │ {content,         │                   │
    │  suggestedActions}│                   │
    │<──────────────────│                   │
    │                   │                   │
```

---

## 4. API Design

### 4.1 API Versioning

```
Base URL: https://api.phuket-app.com/v1

Versioning Strategy: URL-based
• /v1/ - текущая стабильная версия
• /v2/ - будущая версия (breaking changes)

Deprecation Policy:
• Минимум 6 месяцев поддержки старой версии
• Предупреждение в response headers
```

### 4.2 Request/Response Format

**Request Headers:**
```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer {access_token}
X-Request-ID: {uuid}
Accept-Language: ru-RU
```

**Response Format (Success):**
```json
{
  "data": { ... },
  "meta": {
    "requestId": "uuid",
    "timestamp": "2025-12-12T10:00:00Z"
  }
}
```

**Response Format (Error):**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is invalid",
    "details": [
      {
        "field": "email",
        "message": "Must be a valid email address"
      }
    ]
  },
  "meta": {
    "requestId": "uuid",
    "timestamp": "2025-12-12T10:00:00Z"
  }
}
```

### 4.3 HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate resource |
| 422 | Unprocessable | Business logic error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Error | Server error |

### 4.4 Pagination

```http
GET /vehicles?page=2&per_page=20

Response Headers:
X-Total-Count: 150
X-Page: 2
X-Per-Page: 20
X-Total-Pages: 8

Link: <...?page=1>; rel="first",
      <...?page=1>; rel="prev",
      <...?page=3>; rel="next",
      <...?page=8>; rel="last"
```

---

## 5. Безопасность

### 5.1 Security Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            SECURITY LAYERS                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      Layer 1: Edge Security                          │   │
│  │  • CloudFlare WAF (OWASP rules)                                     │   │
│  │  • DDoS protection                                                   │   │
│  │  • Rate limiting (IP-based)                                         │   │
│  │  • Geo-blocking (optional)                                          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      Layer 2: Transport Security                     │   │
│  │  • TLS 1.3 (minimum TLS 1.2)                                        │   │
│  │  • Certificate Pinning (mobile)                                      │   │
│  │  • HSTS headers                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      Layer 3: Application Security                   │   │
│  │  • JWT authentication                                               │   │
│  │  • Rate limiting (user-based)                                       │   │
│  │  • Input validation (Pydantic)                                      │   │
│  │  • Input sanitization (bleach)                                      │   │
│  │  • Security headers (CSP, X-Frame, etc.)                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      Layer 4: Data Security                          │   │
│  │  • Encryption at rest (AES-256)                                     │   │
│  │  • Encryption in transit (TLS)                                      │   │
│  │  • Password hashing (bcrypt, 12 rounds)                             │   │
│  │  • Secrets management (env vars, Vault)                             │   │
│  │  • PII data handling (GDPR)                                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Authentication & Authorization

**Token Lifecycle:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          TOKEN LIFECYCLE                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Login                                                                      │
│    │                                                                        │
│    ▼                                                                        │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │ Generate Access Token (30 min TTL)                                  │    │
│  │ • sub: user_id                                                      │    │
│  │ • exp: now + 30min                                                  │    │
│  │ • jti: unique_id (for blacklist)                                   │    │
│  │ • type: "access"                                                    │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│    │                                                                        │
│    ├── Generate Refresh Token (7 days TTL)                                 │
│    │   • sub: user_id                                                       │
│    │   • exp: now + 7d                                                      │
│    │   • jti: unique_id                                                    │
│    │   • type: "refresh"                                                   │
│    │                                                                        │
│    ▼                                                                        │
│  Store in Keychain (iOS)                                                   │
│    │                                                                        │
│    ▼                                                                        │
│  API Request with Bearer Token                                             │
│    │                                                                        │
│    ├── Token valid? ──Yes──> Process request                               │
│    │                                                                        │
│    └── Token expired? ──Yes──> Use Refresh Token                           │
│                                    │                                        │
│                                    ▼                                        │
│                              Token Rotation                                 │
│                              (new access + refresh)                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.3 Rate Limiting Strategy

| Endpoint Category | Limit | Window | Action |
|-------------------|-------|--------|--------|
| Auth (login, register) | 5 | 1 min | Block |
| AI Chat | 10 | 1 min | Queue |
| Search | 30 | 1 min | Throttle |
| Catalog (list) | 60 | 1 min | Throttle |
| Catalog (detail) | 120 | 1 min | Throttle |
| User operations | 30 | 1 min | Block |

---

## 6. Масштабируемость

### 6.1 Scaling Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SCALING APPROACH                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Phase 1: Vertical Scaling (Current)                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Single server                                                       │   │
│  │  • 4 vCPU, 8GB RAM                                                  │   │
│  │  • SQLite → PostgreSQL migration                                    │   │
│  │  • Target: 1,000 concurrent users                                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Phase 2: Horizontal Scaling (Q2 2026)                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Multiple API servers behind Load Balancer                          │   │
│  │  • 3 x 2 vCPU, 4GB RAM                                              │   │
│  │  • Redis for session/cache                                          │   │
│  │  • PostgreSQL with read replicas                                    │   │
│  │  • Target: 10,000 concurrent users                                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Phase 3: Full Scale (Q4 2026)                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Kubernetes cluster                                                  │   │
│  │  • Auto-scaling pods (2-20)                                         │   │
│  │  • Database sharding by region                                      │   │
│  │  • CDN for all static content                                       │   │
│  │  • Target: 100,000 concurrent users                                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Caching Strategy

| Layer | Technology | TTL | Data |
|-------|------------|-----|------|
| Edge (CDN) | CloudFlare | 1 day | Static assets, images |
| Application | Redis | 1 hour | API responses, sessions |
| Database | PostgreSQL | N/A | Query caching |
| Client | iOS Cache | 3 hours | API responses |

---

## 7. Мониторинг и наблюдаемость

### 7.1 Monitoring Stack

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          OBSERVABILITY STACK                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐                │
│  │    Metrics     │  │    Logging     │  │    Tracing     │                │
│  │   (Prometheus) │  │ (CloudWatch)   │  │   (Jaeger)     │                │
│  └───────┬────────┘  └───────┬────────┘  └───────┬────────┘                │
│          │                   │                   │                          │
│          └───────────────────┴───────────────────┘                          │
│                              │                                              │
│                              ▼                                              │
│                    ┌─────────────────────┐                                 │
│                    │      Grafana        │                                 │
│                    │   (Dashboards)      │                                 │
│                    └─────────────────────┘                                 │
│                              │                                              │
│                              ▼                                              │
│                    ┌─────────────────────┐                                 │
│                    │    PagerDuty /      │                                 │
│                    │    Slack Alerts     │                                 │
│                    └─────────────────────┘                                 │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                        Error Tracking                               │    │
│  │                         (Sentry)                                    │    │
│  │  • Exception tracking                                               │    │
│  │  • Performance monitoring                                           │    │
│  │  • Release tracking                                                 │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Key Metrics

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| API Response Time (p95) | < 500ms | > 1000ms |
| Error Rate | < 0.1% | > 1% |
| Uptime | 99.9% | < 99.5% |
| Database Connections | < 80% pool | > 90% pool |
| Memory Usage | < 70% | > 85% |
| CPU Usage | < 60% | > 80% |

---

## 8. Disaster Recovery

### 8.1 Backup Strategy

| Data | Frequency | Retention | Storage |
|------|-----------|-----------|---------|
| Database (full) | Daily | 30 days | S3 Glacier |
| Database (incremental) | Hourly | 7 days | S3 Standard |
| Media files | Real-time | 1 year | S3 IA |
| Configuration | On change | Forever | Git |
| Logs | Real-time | 90 days | CloudWatch |

### 8.2 Recovery Objectives

| Metric | Target |
|--------|--------|
| RTO (Recovery Time Objective) | < 1 hour |
| RPO (Recovery Point Objective) | < 1 hour |

### 8.3 Failover Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          FAILOVER PLAN                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. Database Failover                                                       │
│     Primary (ap-southeast-1a) ──fails──> Standby (ap-southeast-1b)         │
│     • Automatic failover via RDS Multi-AZ                                  │
│     • DNS update within 60 seconds                                         │
│                                                                             │
│  2. Application Failover                                                   │
│     Pod failure ──> Kubernetes restarts pod                                │
│     Node failure ──> Traffic routed to healthy nodes                       │
│                                                                             │
│  3. Region Failover (Future)                                               │
│     ap-southeast-1 ──fails──> ap-northeast-1                               │
│     • Route53 health checks                                                │
│     • Database replication lag < 1 minute                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Инфраструктура (Production)

### 9.1 AWS Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              AWS REGION                                     │
│                           ap-southeast-1                                    │
│                             (Singapore)                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                           VPC                                       │    │
│  │                      10.0.0.0/16                                   │    │
│  │                                                                     │    │
│  │  ┌─────────────────────┐    ┌─────────────────────┐                │    │
│  │  │   Public Subnet     │    │   Public Subnet     │                │    │
│  │  │   10.0.1.0/24      │    │   10.0.2.0/24      │                │    │
│  │  │   (AZ-1a)          │    │   (AZ-1b)          │                │    │
│  │  │                     │    │                     │                │    │
│  │  │  ┌─────────────┐   │    │  ┌─────────────┐   │                │    │
│  │  │  │     ALB     │   │    │  │   NAT GW    │   │                │    │
│  │  │  └─────────────┘   │    │  └─────────────┘   │                │    │
│  │  └─────────────────────┘    └─────────────────────┘                │    │
│  │                                                                     │    │
│  │  ┌─────────────────────┐    ┌─────────────────────┐                │    │
│  │  │   Private Subnet    │    │   Private Subnet    │                │    │
│  │  │   10.0.10.0/24     │    │   10.0.20.0/24     │                │    │
│  │  │   (AZ-1a)          │    │   (AZ-1b)          │                │    │
│  │  │                     │    │                     │                │    │
│  │  │  ┌─────────────┐   │    │  ┌─────────────┐   │                │    │
│  │  │  │  ECS Task   │   │    │  │  ECS Task   │   │                │    │
│  │  │  │  (API)      │   │    │  │  (API)      │   │                │    │
│  │  │  └─────────────┘   │    │  └─────────────┘   │                │    │
│  │  └─────────────────────┘    └─────────────────────┘                │    │
│  │                                                                     │    │
│  │  ┌─────────────────────┐    ┌─────────────────────┐                │    │
│  │  │   Data Subnet       │    │   Data Subnet       │                │    │
│  │  │   10.0.100.0/24    │    │   10.0.200.0/24    │                │    │
│  │  │   (AZ-1a)          │    │   (AZ-1b)          │                │    │
│  │  │                     │    │                     │                │    │
│  │  │  ┌─────────────┐   │    │  ┌─────────────┐   │                │    │
│  │  │  │ RDS Primary │◄──┼────┼──│ RDS Standby │   │                │    │
│  │  │  │ (Postgres)  │   │    │  │ (Postgres)  │   │                │    │
│  │  │  └─────────────┘   │    │  └─────────────┘   │                │    │
│  │  │                     │    │                     │                │    │
│  │  │  ┌─────────────┐   │    │                     │                │    │
│  │  │  │ElastiCache  │   │    │                     │                │    │
│  │  │  │ (Redis)     │   │    │                     │                │    │
│  │  │  └─────────────┘   │    │                     │                │    │
│  │  └─────────────────────┘    └─────────────────────┘                │    │
│  │                                                                     │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  External Services:                                                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                            │
│  │     S3     │  │   SES      │  │  Secrets   │                            │
│  │  (Media)   │  │  (Email)   │  │  Manager   │                            │
│  └────────────┘  └────────────┘  └────────────┘                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 10. Внешние интеграции

### 10.1 Integration Map

| Service | Purpose | Protocol | Auth | Fallback |
|---------|---------|----------|------|----------|
| OpenAI | AI Chat | REST | API Key | Offline knowledge |
| OpenWeatherMap | Weather | REST | API Key | Cached data |
| Currency API | Exchange rates | REST | API Key | Cached rates |
| Firebase | Push notifications | SDK | Service Account | Queue & retry |
| Stripe | Payments | REST | API Key | Manual payment |
| SendGrid | Email | REST | API Key | Queue & retry |
| Sentry | Error tracking | SDK | DSN | Local logs |
| S3 | Media storage | SDK | IAM Role | Error message |

### 10.2 Circuit Breaker Pattern

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CIRCUIT BREAKER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  States:                                                                    │
│                                                                             │
│  ┌─────────┐      5 failures      ┌─────────┐      timeout      ┌────────┐ │
│  │ CLOSED  │─────────────────────>│  OPEN   │──────────────────>│ HALF-  │ │
│  │         │                      │         │                   │  OPEN  │ │
│  │ (Normal)│<─────────────────────│(Failing)│<──────────────────│        │ │
│  └─────────┘      success         └─────────┘      failure      └────────┘ │
│       ▲                                                              │      │
│       │                                                              │      │
│       └──────────────────────────────────────────────────────────────┘      │
│                                 success                                     │
│                                                                             │
│  Configuration:                                                             │
│  • Failure threshold: 5 requests                                           │
│  • Timeout: 30 seconds                                                      │
│  • Half-open test requests: 3                                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 11. Требования к окружению

### 11.1 Development

| Component | Requirement |
|-----------|-------------|
| macOS | 14.0+ (for iOS dev) |
| Xcode | 15.0+ |
| Python | 3.13+ |
| Node.js | 20+ (for web) |
| Docker | 24+ |
| PostgreSQL | 16+ |
| Redis | 7+ |

### 11.2 Production

| Component | Specification |
|-----------|---------------|
| API Servers | 2 x 4 vCPU, 8GB RAM |
| Database | RDS db.r6g.large (2 vCPU, 16GB RAM) |
| Cache | ElastiCache cache.r6g.large |
| Storage | S3 Standard + Glacier |
| CDN | CloudFlare Pro |

---

**Согласовано:**

| Роль | Имя | Подпись | Дата |
|------|-----|---------|------|
| Tech Lead | | | |
| DevOps Lead | | | |
| Security Lead | | | |
| Product Owner | | | |
