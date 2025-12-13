# Architecture Decision Records (ADR)
## PhuketHub — All-in-One Tourism Platform

Этот документ содержит записи архитектурных решений (ADR) для проекта PhuketHub. Каждое решение документирует контекст, рассмотренные варианты и обоснование выбора.

---

## Оглавление

1. [ADR-001: Выбор Frontend Framework](#adr-001-выбор-frontend-framework)
2. [ADR-002: Выбор базы данных](#adr-002-выбор-базы-данных)
3. [ADR-003: Выбор ORM](#adr-003-выбор-orm)
4. [ADR-004: Стратегия аутентификации](#adr-004-стратегия-аутентификации)
5. [ADR-005: Управление состоянием](#adr-005-управление-состоянием)
6. [ADR-006: CSS Framework](#adr-006-css-framework)
7. [ADR-007: Хостинг платформа](#adr-007-хостинг-платформа)
8. [ADR-008: Файловое хранилище](#adr-008-файловое-хранилище)
9. [ADR-009: Платежная система](#adr-009-платежная-система)
10. [ADR-010: Валидация данных](#adr-010-валидация-данных)
11. [ADR-011: Стратегия API](#adr-011-стратегия-api)
12. [ADR-012: Картографический сервис](#adr-012-картографический-сервис)

---

## ADR-001: Выбор Frontend Framework

**Дата:** December 2025
**Статус:** Accepted
**Авторы:** PhuketHub Team

### Контекст
Необходимо выбрать frontend framework для разработки веб-приложения туристического маркетплейса. Требуется:
- SEO-оптимизация для органического трафика
- Высокая производительность
- Современный DX (Developer Experience)
- Возможность SSR/SSG

### Рассмотренные варианты

| Вариант | Плюсы | Минусы |
|---------|-------|--------|
| **Next.js** | SSR/SSG из коробки, отличный DX, App Router, API Routes, Image optimization | Vendor lock-in Vercel (частично) |
| **Nuxt.js (Vue)** | Хороший SSR, простота | Меньший ecosystem, меньше специалистов |
| **Remix** | Отличная производительность, nested routes | Менее зрелый, меньше документации |
| **Astro** | Отличная производительность статики | Не подходит для динамических приложений |
| **Create React App** | Простота | Нет SSR, мертвый проект |

### Решение
**Выбран Next.js 16 (App Router)**

### Обоснование
1. **SEO:** Server-side rendering критичен для туристического бизнеса
2. **Performance:** Automatic code splitting, image optimization
3. **Developer Experience:** Hot reload, TypeScript support, file-based routing
4. **Ecosystem:** Крупнейшее React-сообщество, много готовых решений
5. **API Routes:** Серверная логика без отдельного бэкенда
6. **Deployment:** Бесшовный деплой на Vercel

### Последствия
- Команда должна изучить App Router (если знакома только с Pages Router)
- Необходимо следить за обновлениями Next.js
- Некоторые библиотеки могут требовать адаптации для SSR

---

## ADR-002: Выбор базы данных

**Дата:** December 2025
**Статус:** Accepted

### Контекст
Выбор основной базы данных для хранения всех данных приложения: пользователи, объявления, бронирования, отзывы.

### Рассмотренные варианты

| Вариант | Плюсы | Минусы |
|---------|-------|--------|
| **PostgreSQL** | ACID, JSON поддержка, расширения (PostGIS), зрелость | Требует администрирования |
| **MySQL** | Популярность, производительность | Слабее JSON, меньше extensions |
| **MongoDB** | Гибкая схема, горизонтальное масштабирование | Нет ACID транзакций (по умолчанию), консистентность |
| **SQLite** | Простота, zero config | Не подходит для production multi-user |
| **PlanetScale** | MySQL-совместимый, serverless | Vendor lock-in, стоимость |

### Решение
**Выбран PostgreSQL**

### Обоснование
1. **ACID транзакции:** Критично для booking и payment операций
2. **JSON поддержка:** Гибкость для amenities, images, schedule полей
3. **PostGIS (будущее):** Геопространственные запросы для карты
4. **Зрелость:** 30+ лет development, стабильность
5. **Managed options:** Neon, Supabase, AWS RDS — много вариантов
6. **Prisma support:** Отличная интеграция с выбранным ORM

### Последствия
- Необходим managed PostgreSQL provider
- Рекомендуется Neon для serverless или Supabase для дополнительных функций
- При масштабировании потребуются read replicas

---

## ADR-003: Выбор ORM

**Дата:** December 2025
**Статус:** Accepted

### Контекст
Выбор инструмента для работы с базой данных: query builder или полноценный ORM.

### Рассмотренные варианты

| Вариант | Плюсы | Минусы |
|---------|-------|--------|
| **Prisma** | Type-safe, auto-migrations, Prisma Studio | Overhead, N+1 queries если не следить |
| **Drizzle** | Легковесный, SQL-like, performance | Менее зрелый ecosystem |
| **TypeORM** | Mature, decorators | Сложный, проблемы с types |
| **Knex.js** | Гибкость, query builder | Нет type-safety из коробки |
| **Raw SQL** | Максимальный контроль | Нет type-safety, больше кода |

### Решение
**Выбран Prisma**

### Обоснование
1. **Type Safety:** Автогенерация TypeScript типов из схемы
2. **Developer Experience:** Declarative schema, auto-complete
3. **Migrations:** Автоматические миграции из схемы
4. **Prisma Studio:** Визуальный редактор для отладки
5. **NextAuth integration:** @auth/prisma-adapter
6. **Documentation:** Отличная документация и community

### Последствия
- Следить за N+1 queries (использовать include/select)
- Изучить Prisma Client API
- Migrations требуют внимания при production changes

---

## ADR-004: Стратегия аутентификации

**Дата:** December 2025
**Статус:** Accepted

### Контекст
Необходима система аутентификации для трех типов пользователей: Tourist, Vendor, Admin.

### Рассмотренные варианты

| Вариант | Плюсы | Минусы |
|---------|-------|--------|
| **NextAuth.js** | Интеграция с Next.js, много providers, session management | Сложность кастомизации |
| **Auth0** | Enterprise-grade, много функций | Стоимость, vendor lock-in |
| **Clerk** | Современный UI, easy setup | Стоимость, limited free tier |
| **Custom JWT** | Полный контроль | Нужно писать все с нуля, security risks |
| **Supabase Auth** | Интеграция с Supabase | Привязка к Supabase |

### Решение
**Выбран NextAuth.js v4**

### Обоснование
1. **Next.js интеграция:** Бесшовная работа с API Routes
2. **Flexibility:** Email/password + OAuth providers
3. **Database Adapter:** Prisma adapter из коробки
4. **Session management:** JWT или database sessions
5. **Free & Open Source:** Нет стоимости
6. **Security:** Проверенные security practices

### Последствия
- Использовать Prisma Adapter для хранения сессий
- JWT для stateless sessions
- Email verification через custom flow + Resend
- Role-based access через middleware

---

## ADR-005: Управление состоянием

**Дата:** December 2025
**Статус:** Accepted

### Контекст
Выбор решения для client-side state management.

### Рассмотренные варианты

| Вариант | Плюсы | Минусы |
|---------|-------|--------|
| **Zustand** | Легковесный, простой API, devtools | Меньше структуры |
| **Redux Toolkit** | Мощный, predictable, devtools | Boilerplate, сложность |
| **Jotai** | Atomic, простой | Другая ментальная модель |
| **React Context** | Встроенный, простой | Performance issues при частых updates |
| **Recoil** | Facebook, atomic | Менее активная разработка |

### Решение
**Выбран Zustand**

### Обоснование
1. **Простота:** Минимальный boilerplate
2. **Производительность:** Selective subscriptions
3. **Размер:** ~1KB gzipped
4. **TypeScript:** Отличная поддержка
5. **DevTools:** Redux DevTools compatible
6. **SSR:** Работает с Next.js

### Последствия
- Создать отдельные stores по доменам (user, search, booking)
- Использовать persist middleware для сохранения состояния
- Избегать чрезмерного использования global state

### Пример структуры
```typescript
// stores/useUserStore.ts
interface UserStore {
  user: User | null;
  setUser: (user: User | null) => void;
}

// stores/useSearchStore.ts
interface SearchStore {
  query: string;
  filters: Filters;
  setQuery: (q: string) => void;
}
```

---

## ADR-006: CSS Framework

**Дата:** December 2025
**Статус:** Accepted

### Контекст
Выбор подхода к стилизации компонентов.

### Рассмотренные варианты

| Вариант | Плюсы | Минусы |
|---------|-------|--------|
| **TailwindCSS** | Utility-first, быстрая разработка, production optimization | Verbose HTML, learning curve |
| **CSS Modules** | Scoped styles, простота | Больше файлов, меньше утилит |
| **Styled Components** | CSS-in-JS, dynamic styles | Runtime overhead, SSR сложности |
| **Emotion** | Flexible, performant | Setup complexity |
| **Sass/SCSS** | Мощный, привычный | Global namespace issues |

### Решение
**Выбран TailwindCSS**

### Обоснование
1. **Скорость разработки:** Не нужно придумывать имена классов
2. **Consistency:** Design tokens из коробки
3. **Production size:** PurgeCSS удаляет неиспользуемое
4. **Dark mode:** Встроенная поддержка
5. **Responsive:** Mobile-first utilities
6. **Community:** Огромное количество UI библиотек (Headless UI, Radix)

### Конфигурация
```typescript
// tailwind.config.ts
colors: {
  primary: {...},    // Sky blue (#0EA5E9)
  secondary: {...},  // Orange (#FB923C)
  accent: {...},     // Emerald (#10B981)
  navy: {...},       // Dark blue (#1E293B)
}
```

### Последствия
- Использовать @apply для повторяющихся паттернов
- Создать компонентную библиотеку с предустановленными стилями
- Использовать cn() утилиту для conditional classes

---

## ADR-007: Хостинг платформа

**Дата:** December 2025
**Статус:** Accepted

### Контекст
Выбор платформы для деплоя приложения.

### Рассмотренные варианты

| Вариант | Плюсы | Минусы |
|---------|-------|--------|
| **Vercel** | Next.js создатели, edge functions, preview deployments | Стоимость при масштабе |
| **AWS (ECS/Lambda)** | Полный контроль, масштабируемость | Сложность, DevOps overhead |
| **Netlify** | Простота, хороший free tier | Меньше Next.js оптимизаций |
| **Railway** | Developer-friendly, containers | Менее зрелый |
| **DigitalOcean App Platform** | Простота, предсказуемая цена | Меньше edge функций |

### Решение
**Выбран Vercel**

### Обоснование
1. **Next.js оптимизация:** Vercel создали Next.js
2. **Zero Config:** Автоматический деплой из Git
3. **Edge Network:** Глобальный CDN
4. **Preview Deployments:** Каждый PR получает URL
5. **Analytics:** Встроенная аналитика
6. **Serverless Functions:** API Routes работают из коробки

### Последствия
- Учитывать лимиты free tier (100GB bandwidth)
- Мониторить serverless function execution time
- При росте рассмотреть Enterprise план или миграцию

---

## ADR-008: Файловое хранилище

**Дата:** December 2025
**Статус:** Accepted

### Контекст
Хранение пользовательских файлов: изображения объектов, аватары, видео.

### Рассмотренные варианты

| Вариант | Плюсы | Минусы |
|---------|-------|--------|
| **Cloudflare R2** | S3-compatible, zero egress fees, global | Newer service |
| **AWS S3** | Industry standard, mature | Egress costs |
| **DigitalOcean Spaces** | Простота, S3-compatible | Меньше edge locations |
| **Uploadthing** | Developer-friendly, React integration | Vendor lock-in |
| **Vercel Blob** | Интеграция с Vercel | Стоимость |

### Решение
**Выбран Cloudflare R2**

### Обоснование
1. **Zero Egress Fees:** Критично для image-heavy платформы
2. **S3 Compatible:** Можно использовать AWS SDK
3. **Global Distribution:** Быстрая доставка контента
4. **Стоимость:** $0.015/GB storage, нет egress
5. **Workers integration:** Можно добавить image processing

### Последствия
- Настроить CORS для прямой загрузки
- Использовать signed URLs для private content
- Реализовать image optimization pipeline

---

## ADR-009: Платежная система

**Дата:** December 2025
**Статус:** Accepted

### Контекст
Обработка онлайн-платежей за бронирования.

### Рассмотренные варианты

| Вариант | Плюсы | Минусы |
|---------|-------|--------|
| **Stripe** | Developer-friendly, webhooks, documentation | Комиссия 2.9% + 30¢ |
| **PayPal** | Узнаваемость, buyer protection | Legacy API, UX |
| **Omise** | Тайские карты, PromptPay | Региональный |
| **2C2P** | SEA focused | Сложнее интеграция |
| **Square** | POS integration | Меньше для online |

### Решение
**Выбран Stripe**

### Обоснование
1. **Developer Experience:** Лучшая документация в индустрии
2. **Webhooks:** Надежные event notifications
3. **Payment Methods:** Cards, Apple Pay, Google Pay
4. **Stripe Connect:** Marketplace payouts для vendors
5. **Thailand support:** Работает с Thai banks
6. **Fraud protection:** Radar для fraud detection

### Последствия
- Реализовать webhook handlers
- Использовать Stripe Connect для vendor payouts
- Хранить только Stripe customer/payment IDs (не card data)

---

## ADR-010: Валидация данных

**Дата:** December 2025
**Статус:** Accepted

### Контекст
Валидация входящих данных на frontend и backend.

### Рассмотренные варианты

| Вариант | Плюсы | Минусы |
|---------|-------|--------|
| **Zod** | TypeScript-first, type inference, composable | Learning curve |
| **Yup** | Популярный, Formik integration | Не так type-safe |
| **Joi** | Mature, expressive | Node.js focused, runtime only |
| **Valibot** | Tiny bundle, modular | Newer, smaller ecosystem |
| **Class-validator** | Decorators | Class-based, больше кода |

### Решение
**Выбран Zod**

### Обоснование
1. **TypeScript Integration:** Автоматический type inference
2. **Composability:** Легко комбинировать схемы
3. **Reusability:** Одна схема для frontend и backend
4. **React Hook Form:** Официальный resolver
5. **Bundle Size:** Tree-shakeable
6. **Error Messages:** Кастомизируемые сообщения

### Пример использования
```typescript
const propertySchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters"),
  price: z.number().positive("Price must be positive"),
  type: z.enum(["VILLA", "CONDO", "APARTMENT"]),
});

type Property = z.infer<typeof propertySchema>;
```

### Последствия
- Создать shared schemas в lib/validators/
- Использовать с React Hook Form через @hookform/resolvers
- Валидировать на обоих концах (client и server)

---

## ADR-011: Стратегия API

**Дата:** December 2025
**Статус:** Accepted

### Контекст
Выбор архитектуры API для взаимодействия frontend-backend.

### Рассмотренные варианты

| Вариант | Плюсы | Минусы |
|---------|-------|--------|
| **Next.js API Routes (REST)** | Простота, no additional server | Менее structured |
| **GraphQL (Apollo)** | Flexible queries, type-safe | Complexity, caching |
| **tRPC** | End-to-end type safety | Next.js only (mostly) |
| **Separate Express/Fastify** | Full control | Additional deployment |
| **Serverless Functions** | Scalability | Cold starts |

### Решение
**Выбран Next.js API Routes с REST**

### Обоснование
1. **Simplicity:** Один codebase, один deployment
2. **Colocation:** API рядом с frontend кодом
3. **Serverless:** Автоматическое масштабирование
4. **Familiarity:** REST понятен всей команде
5. **Caching:** Легко кэшировать REST endpoints
6. **Tooling:** Swagger/OpenAPI для документации (будущее)

### REST Conventions
```
GET    /api/properties         # List
POST   /api/properties         # Create
GET    /api/properties/:id     # Read
PUT    /api/properties/:id     # Update
DELETE /api/properties/:id     # Delete
```

### Последствия
- Следовать REST conventions
- Использовать HTTP статусы корректно
- Документировать endpoints в API.md
- Рассмотреть tRPC при необходимости type-safety

---

## ADR-012: Картографический сервис

**Дата:** December 2025
**Статус:** Accepted

### Контекст
Отображение объектов на интерактивной карте.

### Рассмотренные варианты

| Вариант | Плюсы | Минусы |
|---------|-------|--------|
| **Mapbox** | Кастомизация, красивые карты, geocoding | Стоимость при масштабе |
| **Google Maps** | Узнаваемость, лучшие данные | Дорого, limitations |
| **Leaflet + OSM** | Бесплатно, open source | Базовый внешний вид |
| **HERE Maps** | Хорошие данные | Менее developer-friendly |
| **Apple Maps** | Красивый дизайн | Только Apple ecosystem |

### Решение
**Выбран Mapbox GL JS**

### Обоснование
1. **Визуальное качество:** Красивые, кастомизируемые карты
2. **Developer Experience:** Отличная документация
3. **Geocoding:** Поиск адресов из коробки
4. **Performance:** WebGL rendering
5. **Pricing:** Бесплатно до 50K loads/month
6. **React Support:** react-map-gl библиотека

### Использование
```typescript
import Map, { Marker } from 'react-map-gl';

<Map
  mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
  style={{ width: '100%', height: 400 }}
  mapStyle="mapbox://styles/mapbox/streets-v12"
>
  <Marker longitude={lng} latitude={lat} />
</Map>
```

### Последствия
- Мониторить usage для контроля стоимости
- Кэшировать geocoding результаты
- Использовать clustering для большого количества маркеров

---

## Шаблон для новых ADR

```markdown
## ADR-XXX: [Название решения]

**Дата:** [Date]
**Статус:** [Proposed | Accepted | Deprecated | Superseded]
**Авторы:** [Names]

### Контекст
[Описание проблемы или потребности]

### Рассмотренные варианты
| Вариант | Плюсы | Минусы |
|---------|-------|--------|
| **Option 1** | ... | ... |
| **Option 2** | ... | ... |

### Решение
**Выбран [решение]**

### Обоснование
1. [Причина 1]
2. [Причина 2]

### Последствия
- [Последствие 1]
- [Последствие 2]
```

---

*Document maintained by PhuketHub Engineering Team*
