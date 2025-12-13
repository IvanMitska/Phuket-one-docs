# Solution Architecture Document
# Phuket App

**Версия:** 1.0
**Дата:** 12 декабря 2025
**Автор:** Architecture Team
**Статус:** В разработке

---

## 1. Executive Summary

### 1.1 Бизнес-контекст
Phuket App — это туристическая платформа, объединяющая сервисы аренды транспорта, бронирования жилья и экскурсий на острове Пхукет, Таиланд. Платформа нацелена на упрощение планирования отдыха для туристов и создание единой экосистемы с программой лояльности.

### 1.2 Архитектурное видение
Решение построено на принципах:
- **Mobile-first**: Основной фокус на мобильном приложении
- **API-centric**: Единый API для всех клиентов
- **Cloud-native**: Готовность к облачному развертыванию
- **Security by design**: Безопасность на всех уровнях

### 1.3 Ключевые архитектурные решения

| Решение | Выбор | Обоснование |
|---------|-------|-------------|
| Mobile Framework | SwiftUI (iOS) | Нативный UI, лучший UX, iOS 17+ |
| Backend Framework | FastAPI | Высокая производительность, async/await |
| Database | PostgreSQL | Надежность, JSON support, масштабируемость |
| Cache | Redis | Быстрый кэш, rate limiting |
| Cloud | AWS | Экосистема, регион в Singapore |

---

## 2. Solution Overview

### 2.1 Контекстная диаграмма (C4 Level 1)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SYSTEM CONTEXT                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                              ┌───────────────┐                             │
│                              │    Турист     │                             │
│                              │   (Клиент)    │                             │
│                              └───────┬───────┘                             │
│                                      │                                      │
│                        Просматривает, бронирует,                           │
│                        общается с AI                                        │
│                                      │                                      │
│                                      ▼                                      │
│         ┌─────────────────────────────────────────────────────────┐        │
│         │                                                         │        │
│         │                    PHUKET APP                          │        │
│         │                                                         │        │
│         │  Платформа для бронирования туристических услуг        │        │
│         │  на Пхукете: транспорт, жилье, экскурсии               │        │
│         │                                                         │        │
│         └────────────────────────┬────────────────────────────────┘        │
│                                  │                                          │
│           ┌──────────────────────┼──────────────────────┐                  │
│           │                      │                      │                  │
│           ▼                      ▼                      ▼                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │    OpenAI       │  │ OpenWeatherMap  │  │   Stripe        │             │
│  │                 │  │                 │  │  (Payments)     │             │
│  │ AI-ассистент    │  │ Прогноз погоды  │  │  Оплата         │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │   Firebase      │  │    SendGrid     │  │  Currency API   │             │
│  │                 │  │                 │  │                 │             │
│  │ Push-уведомл.   │  │ Email рассылки  │  │  Курсы валют    │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Контейнерная диаграмма (C4 Level 2)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CONTAINER DIAGRAM                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                      ┌───────────────────────────────┐                     │
│                      │          CLIENTS              │                     │
│                      │                               │                     │
│  ┌──────────────┐    │  ┌──────────────┐            │                     │
│  │   iOS App    │◄───┼──│   Web App    │            │                     │
│  │  (SwiftUI)   │    │  │   (React)    │            │                     │
│  │              │    │  │  [Planned]   │            │                     │
│  │ Native app   │    │  │              │            │                     │
│  │ for iPhone/  │    │  │ SPA for      │            │                     │
│  │ iPad         │    │  │ browsers     │            │                     │
│  └──────┬───────┘    │  └──────┬───────┘            │                     │
│         │            │         │                     │                     │
│         │            │         │                     │                     │
│         └────────────┼─────────┘                     │                     │
│                      │                               │                     │
│                      └───────────────────────────────┘                     │
│                                   │                                        │
│                                   │ HTTPS / REST API                       │
│                                   │                                        │
│                                   ▼                                        │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                           BACKEND                                     │ │
│  │                                                                       │ │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │ │
│  │  │                      API Gateway                                 │ │ │
│  │  │                    (CloudFlare/ALB)                             │ │ │
│  │  │                                                                  │ │ │
│  │  │  • SSL Termination  • Rate Limiting  • DDoS Protection         │ │ │
│  │  └─────────────────────────────┬───────────────────────────────────┘ │ │
│  │                                │                                     │ │
│  │                                ▼                                     │ │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │ │
│  │  │                    API Server (FastAPI)                          │ │ │
│  │  │                                                                  │ │ │
│  │  │  Python 3.13 + Uvicorn                                          │ │ │
│  │  │                                                                  │ │ │
│  │  │  Handles:                                                        │ │ │
│  │  │  • Authentication (JWT)                                          │ │ │
│  │  │  • Business logic                                                │ │ │
│  │  │  • Data validation                                               │ │ │
│  │  │  • External integrations                                         │ │ │
│  │  └──────────────────────┬──────────────────────────────────────────┘ │ │
│  │                         │                                            │ │
│  └─────────────────────────┼────────────────────────────────────────────┘ │
│                            │                                               │
│         ┌──────────────────┼──────────────────┐                           │
│         │                  │                  │                           │
│         ▼                  ▼                  ▼                           │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                   │
│  │ PostgreSQL  │    │    Redis    │    │     S3      │                   │
│  │             │    │             │    │             │                   │
│  │ Primary DB  │    │ Cache +     │    │ Media       │                   │
│  │ Users,      │    │ Sessions +  │    │ Storage     │                   │
│  │ Bookings,   │    │ Rate Limit  │    │ (Images,    │                   │
│  │ Catalog     │    │             │    │  Documents) │                   │
│  └─────────────┘    └─────────────┘    └─────────────┘                   │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Компонентная диаграмма (C4 Level 3)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       API SERVER COMPONENTS                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        MIDDLEWARE LAYER                              │   │
│  │                                                                      │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐     │   │
│  │  │    CORS    │  │Rate Limiter│  │  Security  │  │    Auth    │     │   │
│  │  │ Middleware │  │ Middleware │  │  Headers   │  │ Middleware │     │   │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘     │   │
│  │                                                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         ROUTER LAYER                                 │   │
│  │                                                                      │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐     │   │
│  │  │   Auth     │  │  Vehicles  │  │ Properties │  │   Tours    │     │   │
│  │  │  Router    │  │   Router   │  │   Router   │  │  Router    │     │   │
│  │  │            │  │            │  │            │  │            │     │   │
│  │  │ /auth/*    │  │ /vehicles/*│  │/properties/│  │ /tours/*   │     │   │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘     │   │
│  │                                                                      │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐     │   │
│  │  │  Bookings  │  │  Currency  │  │    AI      │  │   Search   │     │   │
│  │  │   Router   │  │   Router   │  │  Router    │  │   Router   │     │   │
│  │  │            │  │            │  │            │  │            │     │   │
│  │  │ /bookings/*│  │ /currency/*│  │  /ai/*     │  │ /search/*  │     │   │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘     │   │
│  │                                                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        SERVICE LAYER                                 │   │
│  │                                                                      │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐     │   │
│  │  │   Auth     │  │  Booking   │  │   Search   │  │    AI      │     │   │
│  │  │  Service   │  │  Service   │  │  Service   │  │  Service   │     │   │
│  │  │            │  │            │  │            │  │            │     │   │
│  │  │ JWT, Hash  │  │ Calculate  │  │ Full-text  │  │ OpenAI     │     │   │
│  │  │ Password   │  │ Price,     │  │ Search     │  │ Integration│     │   │
│  │  │ Validation │  │ Loyalty    │  │            │  │            │     │   │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘     │   │
│  │                                                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         DATA LAYER                                   │   │
│  │                                                                      │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐     │   │
│  │  │   User     │  │  Vehicle   │  │  Property  │  │   Tour     │     │   │
│  │  │   Model    │  │   Model    │  │   Model    │  │   Model    │     │   │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘     │   │
│  │                                                                      │   │
│  │  ┌────────────┐  ┌────────────┐                                     │   │
│  │  │  Booking   │  │ ExchRate   │                                     │   │
│  │  │   Model    │  │   Model    │                                     │   │
│  │  └────────────┘  └────────────┘                                     │   │
│  │                                                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Integration Architecture

### 3.1 Карта интеграций

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        INTEGRATION MAP                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                         ┌─────────────────┐                                │
│                         │   PHUKET APP    │                                │
│                         │     BACKEND     │                                │
│                         └────────┬────────┘                                │
│                                  │                                          │
│      ┌───────────────────────────┼───────────────────────────┐             │
│      │                           │                           │             │
│      │                           │                           │             │
│      ▼                           ▼                           ▼             │
│  ┌────────┐                 ┌────────┐                 ┌────────┐          │
│  │OpenAI  │                 │Firebase│                 │Stripe  │          │
│  │  API   │                 │  FCM   │                 │  API   │          │
│  └───┬────┘                 └───┬────┘                 └───┬────┘          │
│      │                          │                          │               │
│      │ HTTPS                    │ HTTPS                    │ HTTPS        │
│      │ REST                     │ gRPC                     │ REST         │
│      │                          │                          │               │
│      │ • Chat completions       │ • Push notifications     │ • Payments   │
│      │ • Context window         │ • Topic messaging        │ • Refunds    │
│      │ • Token usage            │ • Device tokens          │ • Webhooks   │
│      │                          │                          │               │
│      │ Rate: 10K req/min        │ Rate: Unlimited          │ Rate: 100/s  │
│      │ Latency: ~500ms          │ Latency: ~100ms          │ Latency: ~1s │
│      │                          │                          │               │
│      └──────────────────────────┴──────────────────────────┘               │
│                                                                             │
│      ┌───────────────────────────┬───────────────────────────┐             │
│      │                           │                           │             │
│      ▼                           ▼                           ▼             │
│  ┌────────┐                 ┌────────┐                 ┌────────┐          │
│  │OpenWea-│                 │Currency│                 │SendGrid│          │
│  │therMap │                 │  API   │                 │  API   │          │
│  └───┬────┘                 └───┬────┘                 └───┬────┘          │
│      │                          │                          │               │
│      │ HTTPS                    │ HTTPS                    │ HTTPS        │
│      │ REST                     │ REST                     │ REST         │
│      │                          │                          │               │
│      │ • Current weather        │ • Exchange rates         │ • Email send │
│      │ • 5-day forecast         │ • Historical data        │ • Templates  │
│      │ • Location based         │ • Multiple currencies    │ • Tracking   │
│      │                          │                          │               │
│      │ Rate: 1K/day (free)      │ Rate: 1K/day             │ Rate: 100/s  │
│      │ Latency: ~200ms          │ Latency: ~100ms          │ Latency: ~1s │
│      │                          │                          │               │
│      └──────────────────────────┴──────────────────────────┘               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Integration Patterns

| Интеграция | Pattern | Error Handling | Fallback |
|------------|---------|----------------|----------|
| OpenAI | Request-Response | Retry 3x, exponential backoff | Local knowledge base |
| Firebase | Fire-and-Forget | Queue + retry | Log for manual review |
| Stripe | Request-Response + Webhooks | Idempotency keys | Queue for retry |
| Weather | Request-Response | Cache + TTL | Return cached data |
| Currency | Request-Response | Cache + TTL | Return cached rates |
| SendGrid | Async Queue | Dead letter queue | Alternative provider |

### 3.3 Circuit Breaker Configuration

```yaml
integrations:
  openai:
    failure_threshold: 5
    recovery_timeout: 30s
    half_open_requests: 3

  stripe:
    failure_threshold: 3
    recovery_timeout: 60s
    half_open_requests: 2

  weather:
    failure_threshold: 10
    recovery_timeout: 300s
    half_open_requests: 5
```

---

## 4. Data Architecture

### 4.1 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DATA FLOW                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                        USER JOURNEY                                   │  │
│  │                                                                       │  │
│  │  [Browse] → [Search] → [View Detail] → [Book] → [Pay] → [Confirm]    │  │
│  │      │          │            │           │        │          │        │  │
│  └──────┼──────────┼────────────┼───────────┼────────┼──────────┼────────┘  │
│         │          │            │           │        │          │           │
│         ▼          ▼            ▼           ▼        ▼          ▼           │
│  ┌──────────┐ ┌────────┐ ┌──────────┐ ┌────────┐ ┌──────┐ ┌─────────┐      │
│  │  Cache   │ │ Search │ │   Read   │ │ Write  │ │Stripe│ │ Notif.  │      │
│  │  (Redis) │ │  Index │ │   DB     │ │   DB   │ │ API  │ │(Firebase│      │
│  └──────────┘ └────────┘ └──────────┘ └────────┘ └──────┘ └─────────┘      │
│                                                                             │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                     DATA SYNCHRONIZATION                              │  │
│  │                                                                       │  │
│  │                      ┌─────────────┐                                  │  │
│  │                      │  PostgreSQL │                                  │  │
│  │                      │   (Source   │                                  │  │
│  │                      │   of Truth) │                                  │  │
│  │                      └──────┬──────┘                                  │  │
│  │                             │                                         │  │
│  │           ┌─────────────────┼─────────────────┐                       │  │
│  │           │                 │                 │                       │  │
│  │           ▼                 ▼                 ▼                       │  │
│  │    ┌─────────────┐   ┌─────────────┐   ┌─────────────┐               │  │
│  │    │    Redis    │   │   Search    │   │   Backup    │               │  │
│  │    │   (Cache)   │   │   (future)  │   │    (S3)     │               │  │
│  │    │             │   │             │   │             │               │  │
│  │    │ TTL-based   │   │ Real-time   │   │ Scheduled   │               │  │
│  │    │ invalidation│   │ sync        │   │ (daily)     │               │  │
│  │    └─────────────┘   └─────────────┘   └─────────────┘               │  │
│  │                                                                       │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Data Ownership

| Domain | Owner | Data |
|--------|-------|------|
| User Management | Auth Team | Users, Sessions, Tokens |
| Catalog | Product Team | Vehicles, Properties, Tours |
| Booking | Booking Team | Bookings, Payments, Cancellations |
| Loyalty | Product Team | Points, Levels, Rewards |
| Analytics | Analytics Team | Events, Metrics, Reports |

### 4.3 Data Retention Policy

| Data Type | Retention | Archival | Deletion |
|-----------|-----------|----------|----------|
| User accounts | Active + 2 years | After 2 years inactive | On request (GDPR) |
| Bookings | 7 years | After 1 year | After 7 years |
| Payment data | 7 years | Encrypted archive | After 7 years |
| Session logs | 90 days | None | Auto-delete |
| API logs | 30 days | None | Auto-delete |
| Analytics | 3 years | Aggregated | After 3 years |

---

## 5. Security Architecture

### 5.1 Security Zones

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SECURITY ZONES                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                      UNTRUSTED ZONE (Internet)                        │  │
│  │                                                                       │  │
│  │  Users, Attackers, Bots, Scanners                                    │  │
│  │                                                                       │  │
│  └────────────────────────────────┬─────────────────────────────────────┘  │
│                                   │                                        │
│                           WAF + DDoS Protection                            │
│                                   │                                        │
│  ┌────────────────────────────────┼─────────────────────────────────────┐  │
│  │                      DMZ (Public Subnet)                              │  │
│  │                                │                                      │  │
│  │  ┌────────────────────────────────────────────────────────────────┐  │  │
│  │  │                   Load Balancer (ALB)                          │  │  │
│  │  │  • SSL Termination                                             │  │  │
│  │  │  • Certificate validation                                      │  │  │
│  │  │  • Request filtering                                           │  │  │
│  │  └───────────────────────────┬────────────────────────────────────┘  │  │
│  │                              │                                       │  │
│  └──────────────────────────────┼───────────────────────────────────────┘  │
│                                 │                                          │
│  ┌──────────────────────────────┼───────────────────────────────────────┐  │
│  │                    TRUSTED ZONE (Private Subnet)                      │  │
│  │                              │                                        │  │
│  │  ┌───────────────────────────┴───────────────────────────────────┐   │  │
│  │  │                    API Servers                                 │   │  │
│  │  │  • JWT validation                                              │   │  │
│  │  │  • Input sanitization                                          │   │  │
│  │  │  • Rate limiting                                               │   │  │
│  │  │  • Authorization checks                                        │   │  │
│  │  └───────────────────────────┬───────────────────────────────────┘   │  │
│  │                              │                                        │  │
│  │                   Security Group Rules                               │  │
│  │                              │                                        │  │
│  └──────────────────────────────┼───────────────────────────────────────┘  │
│                                 │                                          │
│  ┌──────────────────────────────┼───────────────────────────────────────┐  │
│  │                 RESTRICTED ZONE (Data Subnet)                         │  │
│  │                              │                                        │  │
│  │  ┌───────────────────────────┴───────────────────────────────────┐   │  │
│  │  │                  Databases                                     │   │  │
│  │  │  • Encryption at rest (AES-256)                               │   │  │
│  │  │  • Encrypted connections (TLS)                                │   │  │
│  │  │  • No public access                                           │   │  │
│  │  │  • VPC-only access                                            │   │  │
│  │  └───────────────────────────────────────────────────────────────┘   │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      AUTHENTICATION FLOW                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────┐        ┌───────────┐        ┌───────────┐                   │
│  │  Mobile   │        │   API     │        │ Database  │                   │
│  │   App     │        │  Server   │        │           │                   │
│  └─────┬─────┘        └─────┬─────┘        └─────┬─────┘                   │
│        │                    │                    │                          │
│        │  1. Login Request  │                    │                          │
│        │  (email, password) │                    │                          │
│        │───────────────────>│                    │                          │
│        │                    │                    │                          │
│        │                    │  2. Verify User    │                          │
│        │                    │───────────────────>│                          │
│        │                    │<───────────────────│                          │
│        │                    │                    │                          │
│        │                    │  3. Verify Password                           │
│        │                    │  (bcrypt)          │                          │
│        │                    │                    │                          │
│        │                    │  4. Generate Tokens                           │
│        │                    │  (access + refresh)│                          │
│        │                    │                    │                          │
│        │  5. Return Tokens  │                    │                          │
│        │<───────────────────│                    │                          │
│        │                    │                    │                          │
│        │  6. Store in       │                    │                          │
│        │     Keychain       │                    │                          │
│        │                    │                    │                          │
│        │═════════════════════════════════════════│                          │
│        │                    │                    │                          │
│        │  7. API Request    │                    │                          │
│        │  Authorization:    │                    │                          │
│        │  Bearer {token}    │                    │                          │
│        │───────────────────>│                    │                          │
│        │                    │                    │                          │
│        │                    │  8. Validate JWT   │                          │
│        │                    │  (signature, exp)  │                          │
│        │                    │                    │                          │
│        │                    │  9. Get User       │                          │
│        │                    │───────────────────>│                          │
│        │                    │<───────────────────│                          │
│        │                    │                    │                          │
│        │  10. Response      │                    │                          │
│        │<───────────────────│                    │                          │
│        │                    │                    │                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.3 Security Controls Matrix

| Control | Implementation | Layer |
|---------|----------------|-------|
| DDoS Protection | CloudFlare | Edge |
| WAF | CloudFlare Rules | Edge |
| SSL/TLS | TLS 1.3, Certificate pinning | Transport |
| Authentication | JWT + Refresh tokens | Application |
| Authorization | Role-based (RBAC) | Application |
| Input Validation | Pydantic schemas | Application |
| Rate Limiting | slowapi + Redis | Application |
| Password Storage | bcrypt (12 rounds) | Data |
| Encryption at Rest | AES-256 | Data |
| Audit Logging | CloudWatch | All layers |

---

## 6. Deployment Architecture

### 6.1 Environment Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      DEPLOYMENT ENVIRONMENTS                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                        DEVELOPMENT                                     │ │
│  │                                                                        │ │
│  │  Purpose: Local development and testing                               │ │
│  │  Database: SQLite (local)                                             │ │
│  │  API: localhost:8000                                                  │ │
│  │  Features: Hot reload, debug mode, mock data                          │ │
│  │                                                                        │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                    │                                        │
│                                    ▼                                        │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                         STAGING                                        │ │
│  │                                                                        │ │
│  │  Purpose: Integration testing, QA                                     │ │
│  │  Database: PostgreSQL (staging)                                       │ │
│  │  API: https://staging-api.phuket-app.com                             │ │
│  │  Features: Production-like, test data, debug logging                  │ │
│  │                                                                        │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                    │                                        │
│                                    ▼                                        │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                        PRODUCTION                                      │ │
│  │                                                                        │ │
│  │  Purpose: Live service                                                │ │
│  │  Database: PostgreSQL (Multi-AZ)                                      │ │
│  │  API: https://api.phuket-app.com                                     │ │
│  │  Features: Auto-scaling, monitoring, alerts                           │ │
│  │                                                                        │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 CI/CD Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CI/CD PIPELINE                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌────────────┐     ┌────────────┐     ┌────────────┐     ┌────────────┐  │
│  │   Commit   │────>│   Build    │────>│   Test     │────>│  Security  │  │
│  │            │     │            │     │            │     │   Scan     │  │
│  │ • Push to  │     │ • Docker   │     │ • Unit     │     │ • SAST     │  │
│  │   branch   │     │   build    │     │ • Integr.  │     │ • Deps     │  │
│  │ • PR       │     │ • Deps     │     │ • E2E      │     │ • Secrets  │  │
│  └────────────┘     └────────────┘     └────────────┘     └────────────┘  │
│                                                                  │         │
│                                                                  ▼         │
│  ┌────────────┐     ┌────────────┐     ┌────────────┐     ┌────────────┐  │
│  │ Production │<────│  Staging   │<────│   Deploy   │<────│   Review   │  │
│  │            │     │            │     │            │     │            │  │
│  │ • Blue/    │     │ • Auto     │     │ • Push to  │     │ • Manual   │  │
│  │   Green    │     │   deploy   │     │   ECR      │     │   approval │  │
│  │ • Canary   │     │ • Smoke    │     │ • Update   │     │ • Checks   │  │
│  │            │     │   tests    │     │   ECS      │     │   passed   │  │
│  └────────────┘     └────────────┘     └────────────┘     └────────────┘  │
│                                                                             │
│  Tools:                                                                     │
│  • GitHub Actions (CI)                                                     │
│  • AWS CodePipeline (CD)                                                   │
│  • Terraform (Infrastructure)                                              │
│  • Trivy (Security scanning)                                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.3 Infrastructure as Code

```hcl
# terraform/main.tf (simplified)

module "vpc" {
  source = "./modules/vpc"

  cidr_block = "10.0.0.0/16"
  azs        = ["ap-southeast-1a", "ap-southeast-1b"]

  public_subnets  = ["10.0.1.0/24", "10.0.2.0/24"]
  private_subnets = ["10.0.10.0/24", "10.0.20.0/24"]
  data_subnets    = ["10.0.100.0/24", "10.0.200.0/24"]
}

module "ecs" {
  source = "./modules/ecs"

  cluster_name = "phuket-app"
  vpc_id       = module.vpc.vpc_id
  subnets      = module.vpc.private_subnets

  services = {
    api = {
      image       = "${aws_ecr_repository.api.repository_url}:latest"
      cpu         = 512
      memory      = 1024
      desired_count = 2
      port        = 8000
    }
  }
}

module "rds" {
  source = "./modules/rds"

  identifier = "phuket-app-db"
  engine     = "postgres"
  version    = "16"

  instance_class = "db.r6g.large"
  multi_az       = true

  vpc_id  = module.vpc.vpc_id
  subnets = module.vpc.data_subnets
}

module "elasticache" {
  source = "./modules/elasticache"

  cluster_id = "phuket-app-cache"
  engine     = "redis"
  node_type  = "cache.r6g.large"

  vpc_id  = module.vpc.vpc_id
  subnets = module.vpc.data_subnets
}
```

---

## 7. Operational Architecture

### 7.1 Monitoring & Observability

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      OBSERVABILITY STACK                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         DATA COLLECTION                              │   │
│  │                                                                      │   │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐         │   │
│  │  │    Metrics     │  │     Logs       │  │    Traces      │         │   │
│  │  │  (Prometheus)  │  │  (CloudWatch)  │  │   (X-Ray)      │         │   │
│  │  │                │  │                │  │                │         │   │
│  │  │ • API latency  │  │ • App logs     │  │ • Request flow │         │   │
│  │  │ • Error rate   │  │ • Access logs  │  │ • Dependencies │         │   │
│  │  │ • CPU/Memory   │  │ • Error logs   │  │ • Bottlenecks  │         │   │
│  │  │ • Connections  │  │ • Audit logs   │  │                │         │   │
│  │  └────────┬───────┘  └────────┬───────┘  └────────┬───────┘         │   │
│  │           │                   │                   │                  │   │
│  └───────────┼───────────────────┼───────────────────┼──────────────────┘   │
│              │                   │                   │                      │
│              └───────────────────┴───────────────────┘                      │
│                                  │                                          │
│                                  ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        VISUALIZATION                                 │   │
│  │                                                                      │   │
│  │                    ┌─────────────────────┐                          │   │
│  │                    │       Grafana       │                          │   │
│  │                    │                     │                          │   │
│  │                    │  • Dashboards       │                          │   │
│  │                    │  • Alerts           │                          │   │
│  │                    │  • SLO tracking     │                          │   │
│  │                    └──────────┬──────────┘                          │   │
│  │                               │                                      │   │
│  └───────────────────────────────┼──────────────────────────────────────┘   │
│                                  │                                          │
│                                  ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         ALERTING                                     │   │
│  │                                                                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │   │
│  │  │  PagerDuty   │  │    Slack     │  │    Email     │               │   │
│  │  │  (Critical)  │  │  (Warning)   │  │   (Info)     │               │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │   │
│  │                                                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 SLIs/SLOs

| Service | SLI | SLO | Alert Threshold |
|---------|-----|-----|-----------------|
| API Availability | Successful requests / Total requests | 99.9% | < 99.5% |
| API Latency (p95) | Request duration | < 500ms | > 1000ms |
| Error Rate | 5xx responses / Total responses | < 0.1% | > 1% |
| Auth Success | Successful logins / Total login attempts | > 99% | < 95% |
| Booking Success | Completed bookings / Initiated bookings | > 95% | < 90% |

### 7.3 Incident Response

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      INCIDENT RESPONSE FLOW                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌────────────┐     ┌────────────┐     ┌────────────┐     ┌────────────┐  │
│  │   Alert    │────>│  Triage    │────>│  Respond   │────>│  Resolve   │  │
│  │  Detected  │     │            │     │            │     │            │  │
│  └────────────┘     └────────────┘     └────────────┘     └────────────┘  │
│        │                  │                  │                  │          │
│        ▼                  ▼                  ▼                  ▼          │
│  • PagerDuty       • Assess impact    • Mitigation      • Fix applied    │
│  • Auto-scale      • Assign owner     • Communication   • Verified       │
│                    • Set severity     • Escalation      • Post-mortem    │
│                                                                           │
│  Severity Levels:                                                         │
│  • P1 (Critical): Service down, data loss - 15 min response              │
│  • P2 (High): Major feature broken - 30 min response                     │
│  • P3 (Medium): Minor issue - 4 hour response                            │
│  • P4 (Low): Cosmetic issue - 24 hour response                           │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Cost Architecture

### 8.1 Cost Breakdown (Monthly Estimate)

| Component | Specification | Est. Cost (USD) |
|-----------|---------------|-----------------|
| EC2/ECS | 2 x t3.medium | $80 |
| RDS PostgreSQL | db.t3.medium Multi-AZ | $150 |
| ElastiCache | cache.t3.small | $30 |
| S3 | 100GB storage | $5 |
| CloudFront | 1TB transfer | $100 |
| Load Balancer | ALB | $30 |
| Route 53 | Hosted zone | $5 |
| CloudWatch | Logs + Metrics | $50 |
| **Total Infrastructure** | | **~$450/month** |

| Service | Usage | Est. Cost (USD) |
|---------|-------|-----------------|
| OpenAI API | 100K requests | $200 |
| Firebase | 50K notifications | $10 |
| SendGrid | 10K emails | $15 |
| Sentry | Error tracking | $30 |
| **Total Services** | | **~$255/month** |

**Total Estimated Monthly Cost: ~$705**

### 8.2 Cost Optimization Strategies

1. **Reserved Instances**: 1-year commitment for 30% savings
2. **Spot Instances**: For non-critical batch jobs
3. **Auto-scaling**: Scale down during low traffic
4. **S3 Lifecycle**: Move old data to Glacier
5. **CloudFront Caching**: Reduce origin requests
6. **Database Right-sizing**: Monitor and adjust

---

## 9. Technology Decisions Summary

| Decision Area | Choice | Alternatives Considered | Rationale |
|---------------|--------|------------------------|-----------|
| Mobile | SwiftUI | React Native, Flutter | Best iOS UX, native performance |
| Backend | FastAPI | Django, Flask, Node.js | Async, high performance, auto-docs |
| Database | PostgreSQL | MySQL, MongoDB | JSON support, reliability |
| Cache | Redis | Memcached | Rate limiting, pub/sub support |
| Cloud | AWS | GCP, Azure | Singapore region, mature ecosystem |
| CDN | CloudFlare | AWS CloudFront | DDoS protection, WAF included |
| AI | OpenAI GPT-4 | Claude, Gemini | Best quality, well-documented |
| Auth | JWT | Sessions, OAuth only | Stateless, mobile-friendly |

---

**Согласовано:**

| Роль | Имя | Подпись | Дата |
|------|-----|---------|------|
| Solution Architect | | | |
| Tech Lead | | | |
| DevOps Lead | | | |
| Security Architect | | | |
