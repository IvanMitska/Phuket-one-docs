# API Reference
## PhuketHub REST API

**Version:** 1.0
**Base URL:** `https://phukethub.com/api`
**Last Updated:** December 2025

---

## Содержание

1. [Общая информация](#1-общая-информация)
2. [Аутентификация](#2-аутентификация)
3. [Properties API](#3-properties-api)
4. [Vehicles API](#4-vehicles-api)
5. [Tours API](#5-tours-api)
6. [Bookings API](#6-bookings-api)
7. [Reviews API](#7-reviews-api)
8. [Search API](#8-search-api)
9. [Currency API](#9-currency-api)
10. [Upload API](#10-upload-api)
11. [Коды ошибок](#11-коды-ошибок)

---

## 1. Общая информация

### 1.1 Формат запросов

Все запросы должны содержать заголовки:

```http
Content-Type: application/json
Accept: application/json
```

### 1.2 Формат ответов

Все ответы возвращаются в формате JSON:

```typescript
// Успешный ответ
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}

// Ответ с ошибкой
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "price",
      "reason": "Must be a positive number"
    }
  }
}
```

### 1.3 Пагинация

Списочные endpoints поддерживают пагинацию:

| Параметр | Тип | По умолчанию | Описание |
|----------|-----|--------------|----------|
| `page` | number | 1 | Номер страницы |
| `limit` | number | 20 | Элементов на странице (max: 100) |
| `sort` | string | createdAt | Поле сортировки |
| `order` | string | desc | Направление (asc/desc) |

### 1.4 Rate Limiting

- **Authenticated:** 1000 requests/hour
- **Unauthenticated:** 100 requests/hour

Заголовки rate limit:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

---

## 2. Аутентификация

### 2.1 NextAuth Endpoints

Аутентификация реализована через NextAuth.js. Стандартные endpoints:

| Endpoint | Метод | Описание |
|----------|-------|----------|
| `/api/auth/signin` | GET/POST | Страница/обработка входа |
| `/api/auth/signout` | POST | Выход из системы |
| `/api/auth/session` | GET | Текущая сессия |
| `/api/auth/callback/:provider` | GET | OAuth callback |

### 2.2 Регистрация

```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "phone": "+66123456789"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx1234567",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "TOURIST"
    },
    "message": "Verification email sent"
  }
}
```

### 2.3 Вход

```http
POST /api/auth/callback/credentials
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:** Устанавливает session cookie и редиректит.

### 2.4 Получение сессии

```http
GET /api/auth/session
```

**Response:**
```json
{
  "user": {
    "id": "clx1234567",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "TOURIST",
    "image": "https://..."
  },
  "expires": "2024-02-01T00:00:00.000Z"
}
```

---

## 3. Properties API

### 3.1 Получить список объектов

```http
GET /api/properties
```

**Query Parameters:**

| Параметр | Тип | Описание |
|----------|-----|----------|
| `type` | string | VILLA, CONDO, APARTMENT, HOUSE, STUDIO |
| `rentalType` | string | DAILY, MONTHLY, YEARLY, SALE |
| `minPrice` | number | Минимальная цена |
| `maxPrice` | number | Максимальная цена |
| `bedrooms` | number | Количество спален |
| `bathrooms` | number | Количество ванных |
| `amenities` | string | Удобства через запятую |
| `city` | string | Город |
| `featured` | boolean | Только featured |
| `instantBook` | boolean | Только с мгновенным бронированием |

**Example:**
```http
GET /api/properties?type=VILLA&minPrice=2000&maxPrice=10000&bedrooms=3&page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx1234567",
      "title": "Luxury Beach Villa with Ocean View",
      "description": "Beautiful 3-bedroom villa...",
      "type": "VILLA",
      "rentalType": "DAILY",
      "price": 4500,
      "currency": "THB",
      "bedrooms": 3,
      "bathrooms": 2,
      "area": 250,
      "address": "123 Beach Road, Kata",
      "city": "Phuket",
      "latitude": 7.8206,
      "longitude": 98.3388,
      "amenities": ["pool", "wifi", "aircon", "kitchen", "parking"],
      "images": [
        "https://storage.../image1.jpg",
        "https://storage.../image2.jpg"
      ],
      "videoUrl": "https://youtube.com/...",
      "status": "AVAILABLE",
      "featured": true,
      "instantBook": true,
      "verified": true,
      "viewCount": 1234,
      "rating": 4.8,
      "reviewCount": 24,
      "vendor": {
        "id": "clx7654321",
        "name": "Premium Villas Phuket",
        "image": "https://..."
      },
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-20T15:30:00.000Z"
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

### 3.2 Получить объект по ID

```http
GET /api/properties/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clx1234567",
    "title": "Luxury Beach Villa with Ocean View",
    // ... все поля из списка
    "reviews": [
      {
        "id": "clxr123",
        "rating": 5,
        "title": "Amazing stay!",
        "comment": "The villa exceeded our expectations...",
        "user": {
          "name": "Anna M.",
          "image": "https://..."
        },
        "createdAt": "2024-01-18T12:00:00.000Z"
      }
    ]
  }
}
```

### 3.3 Создать объект

```http
POST /api/properties
```

**Headers:**
```http
Authorization: Bearer {session_token}
```

**Request Body:**
```json
{
  "title": "Modern Condo in Patong",
  "description": "Spacious modern condo with sea view...",
  "type": "CONDO",
  "rentalType": "DAILY",
  "price": 2500,
  "currency": "THB",
  "bedrooms": 2,
  "bathrooms": 1,
  "area": 85,
  "address": "456 Beach Road, Patong",
  "city": "Phuket",
  "latitude": 7.8906,
  "longitude": 98.2962,
  "amenities": ["wifi", "aircon", "pool", "gym"],
  "images": ["https://..."],
  "instantBook": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clx9876543",
    "title": "Modern Condo in Patong",
    // ... все поля
  }
}
```

### 3.4 Обновить объект

```http
PUT /api/properties/:id
```

**Headers:**
```http
Authorization: Bearer {session_token}
```

**Request Body:** Поля для обновления (частичное обновление)
```json
{
  "price": 2800,
  "status": "BOOKED"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clx1234567",
    // ... обновленный объект
  }
}
```

### 3.5 Удалить объект

```http
DELETE /api/properties/:id
```

**Headers:**
```http
Authorization: Bearer {session_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Property deleted successfully"
  }
}
```

---

## 4. Vehicles API

### 4.1 Получить список транспорта

```http
GET /api/vehicles
```

**Query Parameters:**

| Параметр | Тип | Описание |
|----------|-----|----------|
| `type` | string | MOTORBIKE, SCOOTER, CAR, VAN, BICYCLE, BOAT, YACHT |
| `brand` | string | Бренд |
| `minPrice` | number | Мин. цена за день |
| `maxPrice` | number | Макс. цена за день |
| `year` | number | Год выпуска (минимум) |
| `delivery` | boolean | С доставкой |
| `featured` | boolean | Только featured |

**Example:**
```http
GET /api/vehicles?type=CAR&minPrice=1000&maxPrice=3000&delivery=true
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clxv123456",
      "title": "Honda Jazz 2023 - Automatic",
      "description": "Comfortable automatic car...",
      "type": "CAR",
      "brand": "Honda",
      "model": "Jazz",
      "year": 2023,
      "pricePerDay": 1500,
      "currency": "THB",
      "features": ["automatic", "aircon", "bluetooth", "gps"],
      "images": ["https://..."],
      "licensePlate": "ABC1234",
      "pickupAddress": "Phuket Airport",
      "latitude": 8.1132,
      "longitude": 98.3166,
      "status": "AVAILABLE",
      "featured": true,
      "instantBook": true,
      "deliveryAvailable": true,
      "insuranceIncluded": true,
      "rating": 4.9,
      "reviewCount": 45,
      "vendor": {
        "id": "clxv789",
        "name": "Phuket Car Rental"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 89,
    "totalPages": 5
  }
}
```

### 4.2 Получить транспорт по ID

```http
GET /api/vehicles/:id
```

### 4.3 Создать транспорт

```http
POST /api/vehicles
```

**Request Body:**
```json
{
  "title": "Yamaha NMAX 2024",
  "description": "Popular automatic scooter...",
  "type": "SCOOTER",
  "brand": "Yamaha",
  "model": "NMAX",
  "year": 2024,
  "pricePerDay": 350,
  "currency": "THB",
  "features": ["automatic", "storage", "usb"],
  "images": ["https://..."],
  "pickupAddress": "Patong Beach",
  "latitude": 7.8906,
  "longitude": 98.2962,
  "deliveryAvailable": true,
  "insuranceIncluded": true
}
```

### 4.4 Обновить транспорт

```http
PUT /api/vehicles/:id
```

### 4.5 Удалить транспорт

```http
DELETE /api/vehicles/:id
```

---

## 5. Tours API

### 5.1 Получить список туров

```http
GET /api/tours
```

**Query Parameters:**

| Параметр | Тип | Описание |
|----------|-----|----------|
| `category` | string | WATER_SPORTS, CULTURAL, NIGHTLIFE, SPA_WELLNESS, FOOD_DRINK, ADVENTURE, ISLAND_HOPPING, SIGHTSEEING, WILDLIFE |
| `minPrice` | number | Мин. цена |
| `maxPrice` | number | Макс. цена |
| `minDuration` | number | Мин. длительность (часы) |
| `maxDuration` | number | Макс. длительность (часы) |
| `language` | string | Язык гида (en, ru, th, zh) |
| `date` | string | Дата проведения (ISO) |
| `featured` | boolean | Только featured |

**Example:**
```http
GET /api/tours?category=ISLAND_HOPPING&language=en&minPrice=1000
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clxt123456",
      "title": "Phi Phi Islands Full Day Tour",
      "description": "Visit the famous Phi Phi Islands...",
      "category": "ISLAND_HOPPING",
      "duration": 10,
      "price": 2500,
      "currency": "THB",
      "maxParticipants": 30,
      "languages": ["en", "ru", "zh"],
      "includes": [
        "Hotel pickup",
        "Speedboat transfer",
        "Lunch",
        "Snorkeling equipment",
        "National park fee"
      ],
      "excludes": [
        "Personal expenses",
        "Tips"
      ],
      "images": ["https://..."],
      "videoUrl": "https://youtube.com/...",
      "meetingPoint": "Rassada Pier, Phuket",
      "latitude": 7.8674,
      "longitude": 98.3847,
      "schedule": [
        {
          "day": "Monday",
          "times": ["08:00", "09:00"]
        },
        {
          "day": "Tuesday",
          "times": ["08:00", "09:00"]
        }
      ],
      "status": "ACTIVE",
      "featured": true,
      "instantBook": true,
      "rating": 4.7,
      "reviewCount": 128,
      "vendor": {
        "id": "clxt789",
        "name": "Phuket Adventures"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 67,
    "totalPages": 4
  }
}
```

### 5.2 Получить тур по ID

```http
GET /api/tours/:id
```

### 5.3 Создать тур

```http
POST /api/tours
```

**Request Body:**
```json
{
  "title": "Thai Cooking Class",
  "description": "Learn to cook authentic Thai dishes...",
  "category": "FOOD_DRINK",
  "duration": 4,
  "price": 1800,
  "currency": "THB",
  "maxParticipants": 12,
  "languages": ["en", "th"],
  "includes": ["Ingredients", "Recipe book", "Certificate"],
  "excludes": ["Transportation"],
  "images": ["https://..."],
  "meetingPoint": "Cooking School, Old Town",
  "latitude": 7.8841,
  "longitude": 98.3881,
  "schedule": [
    {"day": "Monday", "times": ["10:00", "14:00"]},
    {"day": "Wednesday", "times": ["10:00", "14:00"]},
    {"day": "Friday", "times": ["10:00", "14:00"]}
  ]
}
```

### 5.4 Обновить тур

```http
PUT /api/tours/:id
```

### 5.5 Удалить тур

```http
DELETE /api/tours/:id
```

---

## 6. Bookings API

### 6.1 Получить бронирования пользователя

```http
GET /api/bookings
```

**Headers:**
```http
Authorization: Bearer {session_token}
```

**Query Parameters:**

| Параметр | Тип | Описание |
|----------|-----|----------|
| `status` | string | PENDING, CONFIRMED, CANCELLED, COMPLETED, NO_SHOW |
| `type` | string | property, vehicle, tour |
| `fromDate` | string | С даты (ISO) |
| `toDate` | string | По дату (ISO) |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clxb123456",
      "userId": "clxu123",
      "propertyId": "clxp123",
      "vehicleId": null,
      "tourId": null,
      "startDate": "2024-02-01T14:00:00.000Z",
      "endDate": "2024-02-05T11:00:00.000Z",
      "totalPrice": 18000,
      "currency": "THB",
      "guestCount": 2,
      "specialRequests": "Late checkout if possible",
      "status": "CONFIRMED",
      "paymentStatus": "PAID",
      "paymentId": "pi_xxx",
      "createdAt": "2024-01-20T10:00:00.000Z",
      "property": {
        "id": "clxp123",
        "title": "Luxury Beach Villa",
        "images": ["https://..."],
        "address": "123 Beach Road"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

### 6.2 Получить бронирование по ID

```http
GET /api/bookings/:id
```

### 6.3 Создать бронирование

```http
POST /api/bookings
```

**Request Body (Property):**
```json
{
  "propertyId": "clxp123456",
  "startDate": "2024-02-01T14:00:00.000Z",
  "endDate": "2024-02-05T11:00:00.000Z",
  "guestCount": 2,
  "specialRequests": "Late checkout if possible"
}
```

**Request Body (Vehicle):**
```json
{
  "vehicleId": "clxv123456",
  "startDate": "2024-02-01T09:00:00.000Z",
  "endDate": "2024-02-05T18:00:00.000Z",
  "specialRequests": "Delivery to airport"
}
```

**Request Body (Tour):**
```json
{
  "tourId": "clxt123456",
  "startDate": "2024-02-01T08:00:00.000Z",
  "guestCount": 4,
  "specialRequests": "Vegetarian lunch"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "clxb789",
      "status": "PENDING",
      "totalPrice": 18000,
      // ...
    },
    "checkoutUrl": "https://checkout.stripe.com/c/pay/..."
  }
}
```

### 6.4 Обновить бронирование

```http
PUT /api/bookings/:id
```

**Request Body:**
```json
{
  "specialRequests": "Updated request",
  "guestCount": 3
}
```

### 6.5 Отменить бронирование

```http
DELETE /api/bookings/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clxb123456",
    "status": "CANCELLED",
    "refundAmount": 18000,
    "message": "Booking cancelled. Refund will be processed within 5-10 business days."
  }
}
```

---

## 7. Reviews API

### 7.1 Получить отзывы

```http
GET /api/reviews
```

**Query Parameters:**

| Параметр | Тип | Описание |
|----------|-----|----------|
| `propertyId` | string | ID объекта |
| `vehicleId` | string | ID транспорта |
| `tourId` | string | ID тура |
| `rating` | number | Фильтр по рейтингу (1-5) |
| `verified` | boolean | Только verified bookings |

**Example:**
```http
GET /api/reviews?propertyId=clxp123456&verified=true
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clxr123456",
      "rating": 5,
      "title": "Perfect vacation!",
      "comment": "The villa was amazing. Clean, beautiful views...",
      "images": ["https://..."],
      "verifiedBooking": true,
      "helpful": 12,
      "user": {
        "id": "clxu123",
        "name": "John D.",
        "image": "https://..."
      },
      "createdAt": "2024-01-18T12:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 24,
    "totalPages": 2,
    "averageRating": 4.8,
    "ratingDistribution": {
      "5": 18,
      "4": 4,
      "3": 1,
      "2": 1,
      "1": 0
    }
  }
}
```

### 7.2 Создать отзыв

```http
POST /api/reviews
```

**Headers:**
```http
Authorization: Bearer {session_token}
```

**Request Body:**
```json
{
  "propertyId": "clxp123456",
  "rating": 5,
  "title": "Amazing experience!",
  "comment": "Everything was perfect...",
  "images": ["https://..."]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clxr789",
    "rating": 5,
    "verifiedBooking": true,
    // ...
  }
}
```

### 7.3 Обновить отзыв

```http
PUT /api/reviews/:id
```

### 7.4 Удалить отзыв

```http
DELETE /api/reviews/:id
```

### 7.5 Отметить отзыв полезным

```http
POST /api/reviews/:id/helpful
```

**Response:**
```json
{
  "success": true,
  "data": {
    "helpful": 13
  }
}
```

---

## 8. Search API

### 8.1 Глобальный поиск

```http
GET /api/search
```

**Query Parameters:**

| Параметр | Тип | Описание |
|----------|-----|----------|
| `q` | string | Поисковый запрос |
| `type` | string | property, vehicle, tour, all |
| `minPrice` | number | Мин. цена |
| `maxPrice` | number | Макс. цена |
| `location` | string | Локация |
| `startDate` | string | Дата начала |
| `endDate` | string | Дата окончания |
| `guests` | number | Количество гостей |

**Example:**
```http
GET /api/search?q=villa+pool&type=property&minPrice=2000&startDate=2024-02-01
```

**Response:**
```json
{
  "success": true,
  "data": {
    "properties": [
      {
        "id": "clxp123",
        "title": "Luxury Villa with Pool",
        "type": "VILLA",
        "price": 4500,
        "images": ["https://..."],
        "rating": 4.8
      }
    ],
    "vehicles": [],
    "tours": []
  },
  "meta": {
    "query": "villa pool",
    "totalResults": 15,
    "breakdown": {
      "properties": 15,
      "vehicles": 0,
      "tours": 0
    }
  }
}
```

---

## 9. Currency API

### 9.1 Получить курсы валют

```http
GET /api/currency
```

**Query Parameters:**

| Параметр | Тип | Описание |
|----------|-----|----------|
| `base` | string | Базовая валюта (default: THB) |
| `currencies` | string | Валюты через запятую |

**Example:**
```http
GET /api/currency?base=THB&currencies=USD,EUR,RUB,CNY
```

**Response:**
```json
{
  "success": true,
  "data": {
    "base": "THB",
    "rates": {
      "USD": 0.029,
      "EUR": 0.027,
      "RUB": 2.65,
      "CNY": 0.21
    },
    "updatedAt": "2024-01-20T12:00:00.000Z"
  }
}
```

### 9.2 Конвертировать валюту

```http
GET /api/currency/convert
```

**Query Parameters:**

| Параметр | Тип | Описание |
|----------|-----|----------|
| `from` | string | Исходная валюта |
| `to` | string | Целевая валюта |
| `amount` | number | Сумма |

**Example:**
```http
GET /api/currency/convert?from=THB&to=USD&amount=10000
```

**Response:**
```json
{
  "success": true,
  "data": {
    "from": "THB",
    "to": "USD",
    "amount": 10000,
    "result": 290,
    "rate": 0.029,
    "updatedAt": "2024-01-20T12:00:00.000Z"
  }
}
```

### 9.3 Получить обменные пункты

```http
GET /api/currency/offices
```

**Query Parameters:**

| Параметр | Тип | Описание |
|----------|-----|----------|
| `lat` | number | Широта |
| `lng` | number | Долгота |
| `radius` | number | Радиус в км (default: 5) |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clxo123",
      "name": "Super Rich Exchange",
      "address": "Jungceylon Shopping Center",
      "latitude": 7.8906,
      "longitude": 98.2962,
      "phone": "+66761234567",
      "rating": 4.5,
      "operatingHours": {
        "monday": "10:00-21:00",
        "tuesday": "10:00-21:00",
        // ...
      },
      "distance": 0.5
    }
  ]
}
```

---

## 10. Upload API

### 10.1 Загрузить файл

```http
POST /api/upload
```

**Headers:**
```http
Authorization: Bearer {session_token}
Content-Type: multipart/form-data
```

**Form Data:**

| Поле | Тип | Описание |
|------|-----|----------|
| `file` | File | Файл для загрузки |
| `type` | string | image, video, document |
| `folder` | string | properties, vehicles, tours, avatars |

**Example (cURL):**
```bash
curl -X POST https://phukethub.com/api/upload \
  -H "Authorization: Bearer xxx" \
  -F "file=@/path/to/image.jpg" \
  -F "type=image" \
  -F "folder=properties"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://r2.phukethub.com/properties/abc123.jpg",
    "key": "properties/abc123.jpg",
    "size": 245678,
    "mimeType": "image/jpeg"
  }
}
```

### 10.2 Ограничения загрузки

| Тип | Макс. размер | Форматы |
|-----|--------------|---------|
| image | 10 MB | jpg, jpeg, png, webp, avif |
| video | 100 MB | mp4, mov, webm |
| document | 5 MB | pdf |

---

## 11. Коды ошибок

### 11.1 HTTP Status Codes

| Код | Описание |
|-----|----------|
| `200` | OK — успешный запрос |
| `201` | Created — ресурс создан |
| `400` | Bad Request — неверные данные |
| `401` | Unauthorized — требуется аутентификация |
| `403` | Forbidden — доступ запрещен |
| `404` | Not Found — ресурс не найден |
| `409` | Conflict — конфликт (например, дубликат) |
| `422` | Unprocessable Entity — ошибка валидации |
| `429` | Too Many Requests — rate limit |
| `500` | Internal Server Error — ошибка сервера |

### 11.2 Application Error Codes

| Код | HTTP | Описание |
|-----|------|----------|
| `AUTH_REQUIRED` | 401 | Требуется аутентификация |
| `AUTH_INVALID` | 401 | Неверные учетные данные |
| `AUTH_EXPIRED` | 401 | Сессия истекла |
| `FORBIDDEN` | 403 | Недостаточно прав |
| `NOT_FOUND` | 404 | Ресурс не найден |
| `VALIDATION_ERROR` | 400 | Ошибка валидации данных |
| `DUPLICATE_ENTRY` | 409 | Ресурс уже существует |
| `RATE_LIMITED` | 429 | Превышен лимит запросов |
| `BOOKING_UNAVAILABLE` | 409 | Даты недоступны для бронирования |
| `PAYMENT_FAILED` | 402 | Ошибка платежа |
| `UPLOAD_ERROR` | 400 | Ошибка загрузки файла |
| `SERVER_ERROR` | 500 | Внутренняя ошибка сервера |

### 11.3 Пример ошибки

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      },
      {
        "field": "password",
        "message": "Password must be at least 8 characters"
      }
    ]
  }
}
```

---

## Webhook Events

### Stripe Webhooks

Endpoint: `POST /api/webhooks/stripe`

| Event | Описание |
|-------|----------|
| `checkout.session.completed` | Оплата завершена |
| `payment_intent.succeeded` | Платеж успешен |
| `payment_intent.payment_failed` | Платеж неуспешен |
| `charge.refunded` | Возврат средств |

---

## SDK & Libraries

### JavaScript/TypeScript Client

```typescript
// Пример использования с fetch
const api = {
  baseUrl: 'https://phukethub.com/api',

  async getProperties(params: PropertyParams) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${this.baseUrl}/properties?${query}`);
    return res.json();
  },

  async createBooking(data: BookingData, token: string) {
    const res = await fetch(`${this.baseUrl}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};
```

---

*API Documentation maintained by PhuketHub Engineering Team*
