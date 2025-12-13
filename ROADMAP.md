# Development Roadmap
## PhuketHub — План разработки на 6 месяцев

**Период:** Январь 2026 — Июнь 2026
**Команда:** 2-3 Full-stack разработчика
**Last Updated:** December 2025

---

## Обзор

```
    ЯНВАРЬ        ФЕВРАЛЬ        МАРТ          АПРЕЛЬ         МАЙ           ИЮНЬ
┌─────────────┬─────────────┬─────────────┬─────────────┬─────────────┬─────────────┐
│   SPRINT    │   SPRINT    │   SPRINT    │   SPRINT    │   SPRINT    │   SPRINT    │
│    1-2      │    3-4      │    5-6      │    7-8      │    9-10     │   11-12     │
├─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┤
│  Backend    │  Bookings   │  Payments   │   Vendor    │  Advanced   │   Polish    │
│   Core      │  & Reviews  │  & Notif.   │  Dashboard  │  Features   │  & Launch   │
└─────────────┴─────────────┴─────────────┴─────────────┴─────────────┴─────────────┘
     MVP           v0.5          v0.7          v0.9          v1.0         RELEASE
```

---

## Sprint Calendar

| Sprint | Даты | Фаза | Milestone |
|--------|------|------|-----------|
| Sprint 1 | 06.01 — 19.01 | Backend Core | API Properties |
| Sprint 2 | 20.01 — 02.02 | Backend Core | API Vehicles & Tours |
| Sprint 3 | 03.02 — 16.02 | Bookings | Booking Flow |
| Sprint 4 | 17.02 — 02.03 | Reviews | Reviews & Ratings |
| Sprint 5 | 03.03 — 16.03 | Payments | Stripe Integration |
| Sprint 6 | 17.03 — 30.03 | Notifications | Email & Push |
| Sprint 7 | 31.03 — 13.04 | Vendor | Vendor Dashboard |
| Sprint 8 | 14.04 — 27.04 | Vendor | Vendor Analytics |
| Sprint 9 | 28.04 — 11.05 | Advanced | Search & Filters |
| Sprint 10 | 12.05 — 25.05 | Advanced | Maps & i18n |
| Sprint 11 | 26.05 — 08.06 | Polish | Testing & Fixes |
| Sprint 12 | 09.06 — 22.06 | Launch | Deploy & Monitor |

---

## Месяц 1: Январь 2026
### Backend Core Infrastructure

**Цель:** Полноценный backend с работающими API endpoints

#### Sprint 1 (06.01 — 19.01): Properties API

| Задача | Приоритет | Оценка | Ответственный |
|--------|-----------|--------|---------------|
| Настройка Prisma + PostgreSQL production | P0 | 2d | Backend |
| API: GET /properties (список, фильтры, пагинация) | P0 | 3d | Backend |
| API: GET /properties/:id (детали) | P0 | 1d | Backend |
| API: POST /properties (создание) | P0 | 2d | Backend |
| API: PUT/DELETE /properties/:id | P0 | 1d | Backend |
| Валидация Zod schemas для Properties | P0 | 1d | Backend |
| Unit tests для Properties API | P1 | 2d | Backend |
| Интеграция frontend с реальным API | P0 | 2d | Frontend |

**Deliverables:**
- [ ] Properties CRUD полностью работает
- [ ] Frontend показывает реальные данные из БД
- [ ] Фильтрация и пагинация работают
- [ ] Покрытие тестами > 70%

#### Sprint 2 (20.01 — 02.02): Vehicles & Tours API

| Задача | Приоритет | Оценка | Ответственный |
|--------|-----------|--------|---------------|
| API: Vehicles CRUD (все endpoints) | P0 | 3d | Backend |
| API: Tours CRUD (все endpoints) | P0 | 3d | Backend |
| Zod schemas для Vehicles & Tours | P0 | 1d | Backend |
| Интеграция Vehicles страницы | P0 | 2d | Frontend |
| Интеграция Tours страницы | P0 | 2d | Frontend |
| API documentation (Swagger/OpenAPI) | P1 | 1d | Backend |
| E2E tests для основных flows | P1 | 2d | QA |

**Deliverables:**
- [ ] Все три каталога работают с реальными данными
- [ ] API документация доступна
- [ ] E2E тесты проходят

**Milestone:** MVP Backend ✓

---

## Месяц 2: Февраль 2026
### Bookings & Reviews System

**Цель:** Пользователи могут бронировать и оставлять отзывы

#### Sprint 3 (03.02 — 16.02): Booking Flow

| Задача | Приоритет | Оценка | Ответственный |
|--------|-----------|--------|---------------|
| API: POST /bookings (создание брони) | P0 | 2d | Backend |
| API: GET /bookings (список броней пользователя) | P0 | 1d | Backend |
| API: PUT /bookings/:id (изменение статуса) | P0 | 1d | Backend |
| API: DELETE /bookings/:id (отмена) | P0 | 1d | Backend |
| Проверка доступности дат | P0 | 2d | Backend |
| UI: Booking Widget компонент | P0 | 3d | Frontend |
| UI: Date Picker с недоступными датами | P0 | 2d | Frontend |
| UI: Booking confirmation page | P0 | 1d | Frontend |
| UI: My Bookings страница в профиле | P0 | 2d | Frontend |

**Deliverables:**
- [ ] Полный flow бронирования (без оплаты)
- [ ] Календарь с доступностью
- [ ] История бронирований в профиле

#### Sprint 4 (17.02 — 02.03): Reviews & Ratings

| Задача | Приоритет | Оценка | Ответственный |
|--------|-----------|--------|---------------|
| API: Reviews CRUD | P0 | 2d | Backend |
| Связь Review с Booking (verified) | P0 | 1d | Backend |
| Расчет среднего рейтинга | P0 | 1d | Backend |
| API: POST /reviews/:id/helpful | P1 | 0.5d | Backend |
| UI: Review Form компонент | P0 | 2d | Frontend |
| UI: Reviews List с фильтрами | P0 | 2d | Frontend |
| UI: Rating Distribution виджет | P1 | 1d | Frontend |
| UI: Отображение рейтингов в карточках | P0 | 1d | Frontend |
| Image upload для отзывов | P1 | 2d | Full-stack |

**Deliverables:**
- [ ] Пользователи могут оставлять отзывы
- [ ] Verified booking badge работает
- [ ] Рейтинги отображаются везде

**Milestone:** Booking System v0.5 ✓

---

## Месяц 3: Март 2026
### Payments & Notifications

**Цель:** Онлайн-оплата и система уведомлений

#### Sprint 5 (03.03 — 16.03): Stripe Integration

| Задача | Приоритет | Оценка | Ответственный |
|--------|-----------|--------|---------------|
| Stripe account setup & configuration | P0 | 1d | Backend |
| API: Create Checkout Session | P0 | 2d | Backend |
| Webhook handler: payment_intent.succeeded | P0 | 2d | Backend |
| Webhook handler: checkout.session.completed | P0 | 1d | Backend |
| Обновление статуса бронирования после оплаты | P0 | 1d | Backend |
| UI: Redirect to Stripe Checkout | P0 | 1d | Frontend |
| UI: Success/Cancel pages | P0 | 1d | Frontend |
| UI: Payment status в бронированиях | P0 | 1d | Frontend |
| Тестирование в Stripe Test Mode | P0 | 2d | QA |
| Обработка refunds | P1 | 2d | Backend |

**Deliverables:**
- [ ] Полный payment flow работает
- [ ] Webhooks обрабатываются корректно
- [ ] Refund flow готов

#### Sprint 6 (17.03 — 30.03): Email & Notifications

| Задача | Приоритет | Оценка | Ответственный |
|--------|-----------|--------|---------------|
| Resend integration setup | P0 | 1d | Backend |
| Email templates (React Email) | P0 | 2d | Frontend |
| Email: Booking confirmation | P0 | 1d | Backend |
| Email: Payment receipt | P0 | 1d | Backend |
| Email: Booking reminder (1 day before) | P1 | 1d | Backend |
| Email: Review request (after checkout) | P1 | 1d | Backend |
| API: Notifications CRUD | P0 | 2d | Backend |
| UI: Notifications dropdown в header | P0 | 2d | Frontend |
| UI: Notifications page | P1 | 1d | Frontend |
| Background jobs setup (Inngest/Trigger.dev) | P1 | 2d | Backend |

**Deliverables:**
- [ ] Все транзакционные emails отправляются
- [ ] In-app notifications работают
- [ ] Background jobs для отложенных задач

**Milestone:** Payment System v0.7 ✓

---

## Месяц 4: Апрель 2026
### Vendor Dashboard

**Цель:** Vendors могут управлять своими листингами

#### Sprint 7 (31.03 — 13.04): Vendor Dashboard Core

| Задача | Приоритет | Оценка | Ответственный |
|--------|-----------|--------|---------------|
| Vendor role registration flow | P0 | 2d | Backend |
| UI: Vendor Dashboard layout | P0 | 2d | Frontend |
| UI: My Listings page (properties/vehicles/tours) | P0 | 3d | Frontend |
| UI: Add/Edit Property form | P0 | 3d | Frontend |
| UI: Add/Edit Vehicle form | P0 | 2d | Frontend |
| UI: Add/Edit Tour form | P0 | 2d | Frontend |
| Image upload to R2 (multiple) | P0 | 2d | Full-stack |
| Authorization middleware (vendor only) | P0 | 1d | Backend |

**Deliverables:**
- [ ] Vendors могут регистрироваться
- [ ] CRUD для всех типов листингов через UI
- [ ] Загрузка изображений работает

#### Sprint 8 (14.04 — 27.04): Vendor Analytics & Calendar

| Задача | Приоритет | Оценка | Ответственный |
|--------|-----------|--------|---------------|
| API: Vendor bookings list | P0 | 1d | Backend |
| API: Vendor earnings stats | P0 | 2d | Backend |
| API: Views/clicks analytics | P1 | 2d | Backend |
| UI: Bookings management table | P0 | 2d | Frontend |
| UI: Calendar view (availability) | P0 | 3d | Frontend |
| UI: Earnings dashboard | P1 | 2d | Frontend |
| UI: Block dates functionality | P0 | 1d | Frontend |
| Booking status management (confirm/reject) | P0 | 2d | Full-stack |
| Email: New booking notification to vendor | P0 | 1d | Backend |

**Deliverables:**
- [ ] Vendors видят свои бронирования
- [ ] Календарь доступности работает
- [ ] Базовая аналитика доступна

**Milestone:** Vendor Dashboard v0.9 ✓

---

## Месяц 5: Май 2026
### Advanced Features

**Цель:** Улучшенный поиск, карты, локализация

#### Sprint 9 (28.04 — 11.05): Search & Filters Enhancement

| Задача | Приоритет | Оценка | Ответственный |
|--------|-----------|--------|---------------|
| Global search API (все типы) | P0 | 2d | Backend |
| Full-text search (PostgreSQL) | P1 | 2d | Backend |
| UI: Global search в header | P0 | 2d | Frontend |
| UI: Search results page | P0 | 2d | Frontend |
| Advanced filters UI | P0 | 2d | Frontend |
| Filter by map bounds | P1 | 2d | Full-stack |
| Save search / Price alerts | P2 | 2d | Full-stack |
| Recently viewed | P1 | 1d | Frontend |
| Search suggestions (autocomplete) | P2 | 2d | Full-stack |

**Deliverables:**
- [ ] Глобальный поиск работает
- [ ] Расширенные фильтры
- [ ] Поиск по карте

#### Sprint 10 (12.05 — 25.05): Maps & Internationalization

| Задача | Приоритет | Оценка | Ответственный |
|--------|-----------|--------|---------------|
| Mapbox clustering для маркеров | P0 | 2d | Frontend |
| Map popup с информацией | P0 | 1d | Frontend |
| Directions to property | P1 | 2d | Frontend |
| i18n setup (next-intl) | P0 | 2d | Full-stack |
| Русский перевод | P0 | 2d | Content |
| Тайский перевод | P1 | 2d | Content |
| Currency selector | P0 | 1d | Frontend |
| Auto-detect language | P1 | 1d | Frontend |
| SEO: meta tags, sitemap | P0 | 2d | Full-stack |

**Deliverables:**
- [ ] Карта с кластеризацией
- [ ] 3 языка (EN, RU, TH)
- [ ] SEO оптимизация

**Milestone:** Feature Complete v1.0 ✓

---

## Месяц 6: Июнь 2026
### Polish & Launch

**Цель:** Стабильный production-ready продукт

#### Sprint 11 (26.05 — 08.06): Testing & Bug Fixes

| Задача | Приоритет | Оценка | Ответственный |
|--------|-----------|--------|---------------|
| E2E tests (Playwright) — все flows | P0 | 3d | QA |
| Performance audit (Lighthouse) | P0 | 1d | Frontend |
| Performance optimizations | P0 | 2d | Full-stack |
| Security audit | P0 | 2d | Backend |
| Bug fixes from testing | P0 | 3d | Full-stack |
| Mobile responsiveness fixes | P0 | 2d | Frontend |
| Cross-browser testing | P1 | 1d | QA |
| Load testing | P1 | 1d | Backend |

**Deliverables:**
- [ ] E2E coverage > 80%
- [ ] Lighthouse score > 90
- [ ] Все critical bugs fixed

#### Sprint 12 (09.06 — 22.06): Launch Preparation

| Задача | Приоритет | Оценка | Ответственный |
|--------|-----------|--------|---------------|
| Production environment setup | P0 | 2d | DevOps |
| Database migration to production | P0 | 1d | Backend |
| Stripe Live mode activation | P0 | 1d | Backend |
| DNS & SSL configuration | P0 | 1d | DevOps |
| Sentry production setup | P0 | 0.5d | Backend |
| PostHog production setup | P0 | 0.5d | Frontend |
| Seed initial content | P0 | 2d | Content |
| Documentation finalization | P1 | 1d | All |
| Soft launch (beta users) | P0 | 2d | All |
| Bug fixes from beta | P0 | 2d | Full-stack |
| Public launch | P0 | 1d | All |

**Deliverables:**
- [ ] Production deployed
- [ ] Monitoring configured
- [ ] Beta testing complete
- [ ] PUBLIC LAUNCH!

**Milestone:** v1.0 Release ✓

---

## Риски и митигация

| Риск | Вероятность | Импакт | Митигация |
|------|-------------|--------|-----------|
| Задержка Stripe approval | Средняя | Высокий | Начать процесс заранее (февраль) |
| Проблемы с производительностью | Низкая | Средний | Раннее профилирование, кэширование |
| Нехватка контента | Средняя | Средний | Партнерства с vendors параллельно |
| Баги в production | Высокая | Высокий | Тщательное тестирование, feature flags |
| Изменение требований | Средняя | Средний | Agile подход, еженедельные sync |

---

## Команда и роли

| Роль | Ответственности | Кол-во |
|------|-----------------|--------|
| **Tech Lead** | Архитектура, code review, технические решения | 1 |
| **Full-stack Dev** | Backend API, Frontend интеграция | 1-2 |
| **Frontend Dev** | UI компоненты, UX, анимации | 1 |
| **QA** | Тестирование, E2E, bug reports | 0.5 |
| **DevOps** | CI/CD, мониторинг, деплой | 0.5 |

---

## Ceremonies

| Церемония | Частота | Длительность | Участники |
|-----------|---------|--------------|-----------|
| Daily Standup | Ежедневно | 15 мин | Вся команда |
| Sprint Planning | Каждые 2 недели | 2 часа | Вся команда |
| Sprint Review | Каждые 2 недели | 1 час | Команда + Stakeholders |
| Retrospective | Каждые 2 недели | 1 час | Вся команда |
| Backlog Grooming | Еженедельно | 1 час | Tech Lead + PM |

---

## Definition of Done

### Для задачи:
- [ ] Код написан и прошел code review
- [ ] Unit/integration тесты написаны
- [ ] Документация обновлена (если нужно)
- [ ] QA проверил функциональность
- [ ] Нет blocker/critical багов
- [ ] Merged в develop

### Для спринта:
- [ ] Все задачи в статусе Done
- [ ] E2E тесты проходят
- [ ] Deploy на staging успешен
- [ ] Demo проведено
- [ ] Retrospective проведена

### Для релиза:
- [ ] Все фичи milestone готовы
- [ ] Regression testing пройден
- [ ] Performance targets достигнуты
- [ ] Security audit пройден
- [ ] Stakeholder approval получен

---

## Метрики прогресса

### Velocity Tracking

```
Sprint     | Planned | Completed | Velocity
-----------|---------|-----------|----------
Sprint 1   |   TBD   |    TBD    |   TBD
Sprint 2   |   TBD   |    TBD    |   TBD
...
```

### Burndown Chart Template

```
Story Points
    │
 40 │  ╲
    │    ╲
 30 │      ╲
    │        ╲    Ideal
 20 │          ╲
    │            ╲
 10 │              ╲
    │                ╲
  0 │──────────────────╲────
    └────────────────────────
      D1  D2  D3  ...  D14
```

---

## Контакты

| Роль | Имя | Контакт |
|------|-----|---------|
| Product Owner | TBD | - |
| Tech Lead | TBD | - |
| Scrum Master | TBD | - |

---

## Changelog

| Версия | Дата | Изменения |
|--------|------|-----------|
| 1.0 | Dec 2025 | Initial roadmap |

---

*Document maintained by PhuketHub Team*
