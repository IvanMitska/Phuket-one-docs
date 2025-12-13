# Product Requirements Document (PRD)
## PhuketHub — All-in-One Tourism Platform

**Version:** 1.0
**Last Updated:** December 2025
**Status:** In Development
**Owner:** PhuketHub Team

---

## 1. Executive Summary

### 1.1 Product Vision
PhuketHub — единая платформа-маркетплейс для туристов, посещающих Пхукет. Платформа объединяет все необходимые сервисы: аренду недвижимости, транспорт, туры, обмен валют и другие услуги в одном месте.

### 1.2 Problem Statement
Туристы, планирующие поездку на Пхукет, сталкиваются с проблемами:
- Разрозненность сервисов (разные сайты для жилья, транспорта, туров)
- Языковой барьер при общении с локальными провайдерами
- Отсутствие единой системы проверенных отзывов
- Сложность сравнения цен и качества услуг
- Риск мошенничества при работе с непроверенными поставщиками

### 1.3 Solution
Централизованная платформа с:
- Единым каталогом всех туристических услуг
- Системой верификации поставщиков
- Мультиязычным интерфейсом
- Прозрачной системой отзывов и рейтингов
- Безопасными онлайн-платежами
- Мгновенным бронированием

---

## 2. Target Audience

### 2.1 Primary Users (Tourists)
| Сегмент | Описание | Потребности |
|---------|----------|-------------|
| **Самостоятельные путешественники** | 25-45 лет, планируют trip самостоятельно | Удобный поиск, сравнение цен, надежные отзывы |
| **Семьи с детьми** | Родители 30-50 лет | Безопасность, проверенные поставщики, детские опции |
| **Digital Nomads** | Удаленные работники, длительное пребывание | Долгосрочная аренда, WiFi, рабочие пространства |
| **Премиум туристы** | Высокий бюджет, ищут лучший сервис | VIP услуги, персонализация, качество |

### 2.2 Secondary Users (Vendors)
| Тип | Описание |
|-----|----------|
| **Собственники недвижимости** | Владельцы вилл, кондо, апартаментов |
| **Транспортные компании** | Прокат авто, мотоциклов, яхт |
| **Туроператоры** | Организаторы экскурсий и активностей |
| **Сервис-провайдеры** | Обмен валют, страхование, SIM-карты |

### 2.3 User Personas

#### Persona 1: Anna (Tourist)
- **Возраст:** 32 года
- **Профессия:** Маркетолог
- **Цель:** 2-недельный отпуск с мужем
- **Pain points:** Слишком много вкладок браузера, непонятные цены, языковой барьер
- **Needs:** Все в одном месте, прозрачные цены в своей валюте, надежные отзывы

#### Persona 2: Alex (Vendor)
- **Возраст:** 45 лет
- **Бизнес:** 3 виллы на Пхукете
- **Цель:** Увеличить заполняемость
- **Pain points:** Высокие комиссии других площадок, сложность управления календарем
- **Needs:** Простое управление бронированиями, доступ к качественным клиентам

---

## 3. Core Features

### 3.1 Feature Matrix

| Feature | MVP | v1.0 | v2.0 | Priority |
|---------|-----|------|------|----------|
| Property Search & Booking | ✅ | ✅ | ✅ | P0 |
| Vehicle Rentals | ✅ | ✅ | ✅ | P0 |
| Tours & Activities | ✅ | ✅ | ✅ | P0 |
| User Authentication | ✅ | ✅ | ✅ | P0 |
| Reviews & Ratings | ✅ | ✅ | ✅ | P1 |
| Currency Exchange | ✅ | ✅ | ✅ | P1 |
| Favorites/Wishlist | ✅ | ✅ | ✅ | P1 |
| Direct Messaging | - | ✅ | ✅ | P2 |
| Payment Processing | - | ✅ | ✅ | P0 |
| Vendor Dashboard | - | ✅ | ✅ | P1 |
| Admin Panel | - | ✅ | ✅ | P1 |
| Push Notifications | - | - | ✅ | P2 |
| Mobile App | - | - | ✅ | P2 |
| AI Recommendations | - | - | ✅ | P3 |

### 3.2 Detailed Feature Specifications

#### F1: Property Search & Booking
**Description:** Поиск и бронирование недвижимости
**User Stories:**
- Как турист, я хочу искать жилье по датам, локации и бюджету
- Как турист, я хочу видеть фото, amenities и отзывы
- Как турист, я хочу мгновенно забронировать понравившийся вариант

**Acceptance Criteria:**
- [ ] Фильтрация по: типу (Villa, Condo, Apartment, House, Studio), цене, спальням, удобствам
- [ ] Отображение на карте с кластеризацией
- [ ] Календарь доступности
- [ ] Галерея с 3D-турами
- [ ] Instant Booking для верифицированных объектов
- [ ] Расчет итоговой стоимости с учетом всех сборов

**Property Types:**
```
VILLA | CONDO | APARTMENT | HOUSE | STUDIO | RESORT | HOSTEL | HOTEL
```

**Rental Periods:**
```
DAILY | MONTHLY | YEARLY | SALE
```

---

#### F2: Vehicle Rentals
**Description:** Аренда транспорта
**User Stories:**
- Как турист, я хочу арендовать мотобайк/машину на время отдыха
- Как турист, я хочу видеть состояние и характеристики транспорта
- Как турист, я хочу получить транспорт в удобном месте

**Acceptance Criteria:**
- [ ] Каталог с фильтрами по типу, цене, году выпуска
- [ ] Фото и описание состояния
- [ ] Указание точки получения/возврата
- [ ] Информация о страховке и депозите
- [ ] Опция доставки к отелю

**Vehicle Types:**
```
MOTORBIKE | SCOOTER | CAR | VAN | BICYCLE | BOAT | YACHT
```

---

#### F3: Tours & Activities
**Description:** Экскурсии и активности
**User Stories:**
- Как турист, я хочу найти интересные экскурсии по категориям
- Как турист, я хочу видеть маршрут, длительность и что включено
- Как турист, я хочу бронировать тур на конкретную дату

**Acceptance Criteria:**
- [ ] Категоризация туров
- [ ] Отображение длительности, цены, макс. участников
- [ ] Доступные языки гида
- [ ] Точка встречи на карте
- [ ] Календарь расписания
- [ ] Групповые скидки

**Tour Categories:**
```
WATER_SPORTS | CULTURAL | NIGHTLIFE | SPA_WELLNESS | FOOD_DRINK |
ADVENTURE | ISLAND_HOPPING | SIGHTSEEING | WILDLIFE
```

---

#### F4: User Authentication
**Description:** Регистрация и авторизация
**Acceptance Criteria:**
- [ ] Email/Password регистрация
- [ ] OAuth (Google, Facebook) — future
- [ ] Email verification
- [ ] Password reset
- [ ] Role-based access (Tourist, Vendor, Admin)
- [ ] Profile management

---

#### F5: Reviews & Ratings
**Description:** Система отзывов
**Acceptance Criteria:**
- [ ] 5-звездочный рейтинг
- [ ] Текстовый отзыв с фото
- [ ] Бейдж "Verified Booking"
- [ ] "Helpful" голосование
- [ ] Модерация контента

---

#### F6: Currency Exchange
**Description:** Калькулятор обмена валют
**Acceptance Criteria:**
- [ ] Real-time курсы
- [ ] Калькулятор конвертации
- [ ] Карта обменных пунктов
- [ ] Рейтинги и часы работы обменников

---

#### F7: Booking Management
**Description:** Управление бронированиями
**Acceptance Criteria:**
- [ ] Просмотр активных бронирований
- [ ] История прошлых бронирований
- [ ] Отмена/изменение брони
- [ ] Статусы: PENDING → CONFIRMED → COMPLETED
- [ ] Email уведомления

**Booking Statuses:**
```
PENDING | CONFIRMED | CANCELLED | COMPLETED | NO_SHOW
```

**Payment Statuses:**
```
UNPAID | PARTIAL | PAID | REFUNDED
```

---

## 4. Non-Functional Requirements

### 4.1 Performance
| Metric | Target |
|--------|--------|
| Page Load Time | < 2s (LCP) |
| Time to Interactive | < 3s |
| API Response Time | < 200ms (p95) |
| Search Results | < 500ms |
| Uptime | 99.9% |

### 4.2 Security
- HTTPS everywhere
- Password hashing (bcrypt)
- JWT token authentication
- SQL injection prevention (Prisma ORM)
- XSS protection (React escaping)
- CSRF protection
- Rate limiting on APIs
- Input validation (Zod)

### 4.3 Scalability
- Horizontal scaling capability
- Database read replicas
- CDN for static assets
- Image optimization pipeline
- Caching strategy (Redis — future)

### 4.4 Accessibility
- WCAG 2.1 AA compliance
- Screen reader support
- Keyboard navigation
- Color contrast ratios
- Alt text for images

### 4.5 Internationalization
- Multi-language support (EN, RU, TH, ZH — future)
- Currency localization
- Date/time format localization
- RTL support (future)

---

## 5. Success Metrics (KPIs)

### 5.1 Business Metrics
| Metric | Target (6 months) |
|--------|-------------------|
| Monthly Active Users | 10,000 |
| Registered Users | 5,000 |
| Monthly Bookings | 500 |
| Gross Booking Value | $100,000 |
| Vendor Partners | 100 |

### 5.2 Product Metrics
| Metric | Target |
|--------|--------|
| Booking Conversion Rate | > 5% |
| Search-to-View Rate | > 30% |
| Return User Rate | > 40% |
| Average Session Duration | > 5 min |
| Bounce Rate | < 40% |

### 5.3 Quality Metrics
| Metric | Target |
|--------|--------|
| Customer Satisfaction (CSAT) | > 4.5/5 |
| Net Promoter Score (NPS) | > 50 |
| Support Ticket Resolution | < 24h |
| Bug Rate (prod) | < 1 per week |

---

## 6. Constraints & Assumptions

### 6.1 Constraints
- Initial focus on Phuket region only
- English as primary language (MVP)
- Web platform first, mobile later
- Bootstrap funding (limited budget)

### 6.2 Assumptions
- Vendors willing to pay commission for bookings
- Tourists prefer unified platforms
- Reliable internet connectivity in Phuket
- Payment gateway availability for Thailand

### 6.3 Dependencies
- Mapbox API for maps
- Stripe for payments
- Cloudflare R2/S3 for file storage
- External currency rate API
- Email delivery service (Resend)

---

## 7. Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Low vendor adoption | High | Medium | Competitive commission, easy onboarding |
| Payment gateway issues | High | Low | Multiple payment options |
| Competition from Booking.com, Airbnb | High | High | Niche focus, local services, better UX |
| Seasonal demand fluctuation | Medium | High | Diversify services, off-season promotions |
| Technical scalability | Medium | Low | Cloud infrastructure, monitoring |

---

## 8. Roadmap

> **Детальный план разработки:** [ROADMAP.md](./ROADMAP.md)

### Timeline Overview (6 месяцев)

```
    ЯНВ 2026      ФЕВ 2026      МАР 2026      АПР 2026      МАЙ 2026      ИЮН 2026
┌─────────────┬─────────────┬─────────────┬─────────────┬─────────────┬─────────────┐
│  Backend    │  Bookings   │  Payments   │   Vendor    │  Advanced   │   Polish    │
│   Core      │  & Reviews  │  & Notif.   │  Dashboard  │  Features   │  & Launch   │
├─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┤
│    MVP      │    v0.5     │    v0.7     │    v0.9     │    v1.0     │   RELEASE   │
└─────────────┴─────────────┴─────────────┴─────────────┴─────────────┴─────────────┘
```

### Phase 1: Backend Core (Январь 2026)
**Sprint 1-2 | Weeks 1-4**
- [ ] Properties API (CRUD, фильтры, пагинация)
- [ ] Vehicles API (CRUD)
- [ ] Tours API (CRUD)
- [ ] Интеграция frontend с реальным API
- [ ] API documentation (OpenAPI)
- [ ] Unit & E2E тесты

### Phase 2: Bookings & Reviews (Февраль 2026)
**Sprint 3-4 | Weeks 5-8**
- [ ] Booking flow (без оплаты)
- [ ] Календарь доступности
- [ ] Reviews & Ratings система
- [ ] Verified booking badges
- [ ] My Bookings в профиле
- [ ] Image upload для отзывов

### Phase 3: Payments & Notifications (Март 2026)
**Sprint 5-6 | Weeks 9-12**
- [ ] Stripe Checkout integration
- [ ] Webhook handlers
- [ ] Refund flow
- [ ] Email templates (React Email)
- [ ] Booking confirmation emails
- [ ] In-app notifications
- [ ] Background jobs (Inngest)

### Phase 4: Vendor Dashboard (Апрель 2026)
**Sprint 7-8 | Weeks 13-16**
- [ ] Vendor registration flow
- [ ] Listings management UI
- [ ] Image upload to R2
- [ ] Bookings management
- [ ] Availability calendar
- [ ] Basic analytics (views, earnings)
- [ ] Booking notifications to vendors

### Phase 5: Advanced Features (Май 2026)
**Sprint 9-10 | Weeks 17-20**
- [ ] Global search (full-text)
- [ ] Advanced filters
- [ ] Map clustering & search by bounds
- [ ] i18n (EN, RU, TH)
- [ ] Currency selector
- [ ] SEO optimization
- [ ] Recently viewed

### Phase 6: Launch (Июнь 2026)
**Sprint 11-12 | Weeks 21-24**
- [ ] E2E testing (Playwright)
- [ ] Performance optimization
- [ ] Security audit
- [ ] Production deployment
- [ ] Monitoring setup (Sentry, PostHog)
- [ ] Beta testing
- [ ] **PUBLIC LAUNCH**

### Post-Launch (Q3+ 2026)
- Mobile app (React Native)
- Push notifications
- AI recommendations
- Loyalty program
- Expand to other destinations
- B2B partnerships

---

## 9. Appendix

### A. Glossary
| Term | Definition |
|------|------------|
| **Instant Booking** | Бронирование без подтверждения хоста |
| **Vendor** | Поставщик услуг (собственник, оператор) |
| **Verified** | Прошедший проверку платформой |
| **GMV** | Gross Merchandise Value — общий объем транзакций |

### B. Related Documents
- [Development Roadmap (ROADMAP)](./ROADMAP.md) — детальный план на 6 месяцев
- [Technical Design Document (TDD)](./TDD.md)
- [Architecture Decision Records (ADR)](./ADR.md)
- [System Architecture](./ARCHITECTURE.md)
- [API Reference](./API.md)

---

*Document maintained by PhuketHub Development Team*
