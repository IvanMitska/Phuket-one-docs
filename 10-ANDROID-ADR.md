# Architecture Decision Records (ADR)
# Phuket App — Android

**Версия:** 1.0
**Дата:** 12 декабря 2025

---

## Оглавление

- [ADR-A01: Выбор Kotlin и Jetpack Compose](#adr-a01-выбор-kotlin-и-jetpack-compose)
- [ADR-A02: Clean Architecture + MVVM](#adr-a02-clean-architecture--mvvm)
- [ADR-A03: Hilt для Dependency Injection](#adr-a03-hilt-для-dependency-injection)
- [ADR-A04: Retrofit + OkHttp для сетевого слоя](#adr-a04-retrofit--okhttp-для-сетевого-слоя)
- [ADR-A05: Room для локальной базы данных](#adr-a05-room-для-локальной-базы-данных)
- [ADR-A06: StateFlow для управления состоянием](#adr-a06-stateflow-для-управления-состоянием)
- [ADR-A07: Navigation Compose для навигации](#adr-a07-navigation-compose-для-навигации)
- [ADR-A08: EncryptedSharedPreferences для безопасного хранения](#adr-a08-encryptedsharedpreferences-для-безопасного-хранения)
- [ADR-A09: Coil для загрузки изображений](#adr-a09-coil-для-загрузки-изображений)
- [ADR-A10: SSL Certificate Pinning через OkHttp](#adr-a10-ssl-certificate-pinning-через-okhttp)

---

## ADR-A01: Выбор Kotlin и Jetpack Compose

### Статус
**Принято** (12.12.2025)

### Контекст
Выбор языка программирования и UI framework для Android версии приложения Phuket App. Основные требования:
- Современный, поддерживаемый стек
- Декларативный UI (аналогично SwiftUI на iOS)
- Высокая производительность
- Продуктивность разработки
- Соответствие рекомендациям Google

### Рассмотренные варианты

#### Вариант 1: Kotlin + Jetpack Compose
- **Плюсы:**
  - Официально рекомендован Google
  - Декларативный UI, аналогичный SwiftUI
  - Kotlin-first подход
  - Отличная интеграция с Jetpack библиотеками
  - Live Preview в Android Studio
  - Меньше boilerplate кода
  - Поддержка Material 3
- **Минусы:**
  - Относительно новый (стабильный с 2021)
  - Некоторые компоненты еще развиваются
  - Требует минимум API 21+

#### Вариант 2: Kotlin + XML (View System)
- **Плюсы:**
  - Зрелая технология
  - Больше ресурсов и туториалов
  - Лучшая обратная совместимость
- **Минусы:**
  - Императивный подход
  - Больше boilerplate (ViewBinding, Adapters)
  - Сложнее state management
  - Google переходит на Compose

#### Вариант 3: Flutter (Dart)
- **Плюсы:**
  - Единая кодовая база iOS/Android
  - Быстрая разработка
  - Hot reload
- **Минусы:**
  - Не нативный UI
  - Dart менее популярен чем Kotlin
  - Большой размер приложения
  - iOS версия уже на SwiftUI

#### Вариант 4: React Native
- **Плюсы:**
  - Кросс-платформенность
  - JavaScript/TypeScript
  - Большое сообщество
- **Минусы:**
  - JavaScript bridge снижает производительность
  - Не нативный UI
  - iOS версия уже на SwiftUI

### Решение
Выбраны **Kotlin** как язык и **Jetpack Compose** как UI framework.

### Обоснование
1. **Консистентность**: Jetpack Compose декларативен как SwiftUI — единый подход на обеих платформах
2. **Google рекомендует**: Compose — будущее Android UI разработки
3. **Kotlin**: Официальный язык Android, null safety, coroutines
4. **Продуктивность**: Меньше кода, лучший DX, быстрый preview
5. **Material 3**: Нативная поддержка последнего дизайн-языка

### Последствия
- Минимальный API Level: 26 (Android 8.0)
- Команда должна знать Kotlin и Compose
- Некоторые кастомные компоненты могут требовать дополнительной работы

---

## ADR-A02: Clean Architecture + MVVM

### Статус
**Принято** (12.12.2025)

### Контекст
Выбор архитектурного паттерна для Android приложения. Требования:
- Testability
- Separation of concerns
- Масштабируемость
- Соответствие паттернам iOS версии (MVVM + Repository)

### Рассмотренные варианты

#### Вариант 1: Clean Architecture + MVVM
- **Плюсы:**
  - Четкое разделение слоев (presentation, domain, data)
  - Высокая testability
  - Независимость от frameworks
  - Масштабируется для больших проектов
  - Соответствует MVVM на iOS
- **Минусы:**
  - Больше boilerplate (UseCases, Mappers)
  - Крутая learning curve
  - Может быть overkill для простых фич

#### Вариант 2: MVVM без Clean Architecture
- **Плюсы:**
  - Проще структура
  - Меньше классов
  - Быстрее разработка
- **Минусы:**
  - Меньше тестируемость
  - ViewModel может стать "толстым"
  - Сложнее масштабировать

#### Вариант 3: MVI (Model-View-Intent)
- **Плюсы:**
  - Unidirectional data flow
  - Предсказуемое состояние
  - Хорошо логируется
- **Минусы:**
  - Больше boilerplate
  - Сложнее для простых экранов
  - Меньше соответствует iOS архитектуре

### Решение
Выбрана **Clean Architecture + MVVM**.

### Обоснование
1. **Слои**: Domain layer с UseCases изолирует бизнес-логику
2. **Testing**: Легко мокать репозитории и тестировать ViewModel
3. **iOS совместимость**: MVVM используется на обеих платформах
4. **Масштабируемость**: Чистая архитектура хорошо масштабируется

### Структура слоев
```
Presentation (UI)
    ↓ StateFlow
ViewModel
    ↓ UseCase
Domain (Business Logic)
    ↓ Repository Interface
Data (Repository Implementation)
    ↓
Remote (Retrofit) + Local (Room)
```

### Последствия
- Каждая фича имеет UseCases
- Репозитории определены как интерфейсы в domain слое
- Data слой содержит реализации и DTO/Entity маппинг

---

## ADR-A03: Hilt для Dependency Injection

### Статус
**Принято** (12.12.2025)

### Контекст
Выбор DI фреймворка для Android. Требования:
- Простота использования
- Интеграция с Android компонентами
- Compile-time проверка
- Поддержка Google

### Рассмотренные варианты

#### Вариант 1: Hilt
- **Плюсы:**
  - Официально от Google
  - Построен на Dagger
  - Простые аннотации (@Inject, @HiltViewModel)
  - Интеграция с ViewModel, Navigation
  - Compile-time DI
- **Минусы:**
  - Увеличивает время сборки
  - Генерация кода
  - Зависимость от Dagger

#### Вариант 2: Koin
- **Плюсы:**
  - Чистый Kotlin, без аннотаций
  - Простой синтаксис DSL
  - Быстрее собирается
  - Легче изучить
- **Минусы:**
  - Runtime DI (ошибки в runtime)
  - Медленнее Hilt в runtime
  - Меньше поддержки Google

#### Вариант 3: Manual DI
- **Плюсы:**
  - Нет зависимостей
  - Полный контроль
  - Нет магии
- **Минусы:**
  - Много boilerplate
  - Сложно поддерживать
  - Легко допустить ошибки

### Решение
Выбран **Hilt**.

### Обоснование
1. **Google рекомендует**: Официальный DI для Android
2. **Compile-time safety**: Ошибки ловятся при компиляции
3. **Integration**: Отличная интеграция с Jetpack (hiltViewModel())
4. **Scopes**: Встроенные скоупы (@Singleton, @ViewModelScoped)

### Пример использования
```kotlin
@HiltAndroidApp
class PhuketApplication : Application()

@HiltViewModel
class TransportViewModel @Inject constructor(
    private val getVehiclesUseCase: GetVehiclesUseCase
) : ViewModel()

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    @Provides
    @Singleton
    fun provideApiService(): PhuketApiService { ... }
}
```

### Последствия
- Kapt/KSP для генерации кода
- Все классы с зависимостями аннотированы @Inject
- Module для third-party зависимостей

---

## ADR-A04: Retrofit + OkHttp для сетевого слоя

### Статус
**Принято** (12.12.2025)

### Контекст
Выбор HTTP клиента для Android. Требования:
- Поддержка REST API
- Корутины (suspend functions)
- Interceptors для auth/logging
- SSL Pinning

### Рассмотренные варианты

#### Вариант 1: Retrofit + OkHttp
- **Плюсы:**
  - Стандарт де-факто для Android
  - Отличная поддержка корутин
  - Мощные interceptors
  - Certificate pinning из коробки
  - Большое сообщество
- **Минусы:**
  - Две зависимости
  - XML конфигурация (частично)

#### Вариант 2: Ktor Client
- **Плюсы:**
  - Kotlin-native
  - Мультиплатформенный
  - Современный API
- **Минусы:**
  - Меньше экосистема
  - Меньше примеров
  - Certificate pinning сложнее

#### Вариант 3: Volley
- **Плюсы:**
  - От Google
  - Простой для базовых случаев
- **Минусы:**
  - Устаревший
  - Нет нативной поддержки корутин
  - Меньше фич

### Решение
Выбраны **Retrofit 2** + **OkHttp**.

### Обоснование
1. **Стандарт**: Используется в большинстве Android проектов
2. **Coroutines**: Нативная поддержка suspend functions
3. **OkHttp**: Certificate pinning, logging, interceptors
4. **Gson/Moshi**: Легкая сериализация JSON

### Конфигурация
```kotlin
// OkHttp с SSL Pinning
OkHttpClient.Builder()
    .certificatePinner(
        CertificatePinner.Builder()
            .add("api.phuket-app.com", "sha256/AAAA...")
            .build()
    )
    .addInterceptor(AuthInterceptor(tokenManager))
    .addInterceptor(HttpLoggingInterceptor())
    .build()

// Retrofit
Retrofit.Builder()
    .baseUrl(BASE_URL)
    .client(okHttpClient)
    .addConverterFactory(GsonConverterFactory.create())
    .build()
```

### Последствия
- API интерфейс с suspend functions
- AuthInterceptor для JWT токенов
- Logging interceptor для debug
- Error handling через Response wrapper

---

## ADR-A05: Room для локальной базы данных

### Статус
**Принято** (12.12.2025)

### Контекст
Выбор локальной базы данных для кэширования и offline режима. Требования:
- ORM для Kotlin
- Поддержка корутин и Flow
- Compile-time проверка SQL
- Миграции

### Рассмотренные варианты

#### Вариант 1: Room
- **Плюсы:**
  - Официальная библиотека от Google
  - Compile-time проверка SQL
  - Kotlin coroutines + Flow
  - Простые миграции
  - Отличная интеграция с Jetpack
- **Минусы:**
  - Генерация кода (KSP/Kapt)
  - Немного boilerplate

#### Вариант 2: SQLDelight
- **Плюсы:**
  - Мультиплатформенный
  - Type-safe SQL
  - Генерирует Kotlin код из .sq файлов
- **Минусы:**
  - Другой подход (SQL-first)
  - Меньше интеграции с Android
  - Крутая learning curve

#### Вариант 3: Realm
- **Плюсы:**
  - NoSQL подход
  - Реактивные запросы
  - Синхронизация (MongoDB)
- **Минусы:**
  - Проприетарный формат
  - Больший размер библиотеки
  - Не SQL

### Решение
Выбран **Room**.

### Обоснование
1. **Google рекомендует**: Официальная часть Jetpack
2. **Type safety**: Compile-time проверка SQL
3. **Coroutines**: Flow для реактивных запросов
4. **Соответствие iOS**: Аналогично SwiftData концептуально

### Структура
```kotlin
@Entity(tableName = "vehicles")
data class VehicleEntity(
    @PrimaryKey val id: String,
    val brand: String,
    // ...
)

@Dao
interface VehicleDao {
    @Query("SELECT * FROM vehicles")
    fun getVehicles(): Flow<List<VehicleEntity>>
}

@Database(entities = [VehicleEntity::class], version = 1)
abstract class PhuketDatabase : RoomDatabase() {
    abstract fun vehicleDao(): VehicleDao
}
```

### Последствия
- Entity classes с @Entity аннотацией
- DAO интерфейсы с @Dao
- TypeConverters для сложных типов
- Migration strategy для версионирования

---

## ADR-A06: StateFlow для управления состоянием

### Статус
**Принято** (12.12.2025)

### Контекст
Выбор механизма управления состоянием в ViewModel. Требования:
- Реактивность
- Lifecycle-aware
- Thread-safe
- Совместимость с Compose

### Рассмотренные варианты

#### Вариант 1: StateFlow + MutableStateFlow
- **Плюсы:**
  - Kotlin-native (часть coroutines)
  - Thread-safe
  - Hot stream (всегда имеет значение)
  - Легко собирать в Compose
  - Аналог @Published в iOS
- **Минусы:**
  - Требует начальное значение
  - Нет distinctUntilChanged по умолчанию... (есть)

#### Вариант 2: LiveData
- **Плюсы:**
  - Lifecycle-aware из коробки
  - Простой API
  - Зрелая технология
- **Минусы:**
  - Java-first дизайн
  - Не так хорошо работает с корутинами
  - Google рекомендует StateFlow для новых проектов

#### Вариант 3: Compose State (mutableStateOf)
- **Плюсы:**
  - Нативен для Compose
  - Простой API
- **Минусы:**
  - Только для Compose
  - Не работает вне UI слоя
  - Сложнее тестировать

### Решение
Выбран **StateFlow** для ViewModel state.

### Обоснование
1. **Coroutines native**: Часть kotlinx.coroutines
2. **iOS соответствие**: Аналогичен @Published в Combine
3. **Thread-safe**: Безопасен для многопоточности
4. **Compose**: Легко собирается через collectAsStateWithLifecycle()

### Паттерн использования
```kotlin
class TransportViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(TransportUiState())
    val uiState: StateFlow<TransportUiState> = _uiState.asStateFlow()

    private val _events = Channel<TransportEvent>(Channel.BUFFERED)
    val events = _events.receiveAsFlow()

    fun updateFilter(type: VehicleType) {
        _uiState.update { it.copy(selectedType = type) }
    }
}

// В Compose
@Composable
fun TransportScreen(viewModel: TransportViewModel = hiltViewModel()) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    // ...
}
```

### Последствия
- Каждый ViewModel имеет StateFlow для UI state
- Channel для one-time events (navigation, snackbar)
- collectAsStateWithLifecycle() в Composables

---

## ADR-A07: Navigation Compose для навигации

### Статус
**Принято** (12.12.2025)

### Контекст
Выбор решения для навигации в Compose приложении. Требования:
- Type-safe аргументы
- Deep linking
- Back stack management
- Поддержка bottom navigation

### Рассмотренные варианты

#### Вариант 1: Navigation Compose
- **Плюсы:**
  - Официальное решение от Google
  - Type-safe с Safe Args
  - Deep links из коробки
  - Интеграция с Hilt (hiltViewModel())
  - Bottom navigation support
- **Минусы:**
  - Строковые route могут быть error-prone
  - Сложные аргументы требуют workarounds

#### Вариант 2: Voyager
- **Плюсы:**
  - Мультиплатформенный
  - Type-safe экраны
  - Простой API
- **Минусы:**
  - Third-party библиотека
  - Меньше интеграции с Jetpack

#### Вариант 3: Manual Navigation
- **Плюсы:**
  - Полный контроль
  - Нет зависимостей
- **Минусы:**
  - Много boilerplate
  - Нужно самому управлять back stack
  - Нет deep links

### Решение
Выбран **Navigation Compose**.

### Обоснование
1. **Официальный**: Часть Jetpack, поддержка Google
2. **Deep links**: Важно для push notifications
3. **Hilt integration**: hiltViewModel() работает из коробки
4. **iOS соответствие**: Аналогичен NavigationStack в SwiftUI

### Структура навигации
```kotlin
sealed class Screen(val route: String) {
    object Home : Screen("home")
    object Transport : Screen("transport")
    object VehicleDetail : Screen("vehicle/{vehicleId}") {
        fun createRoute(id: String) = "vehicle/$id"
    }
    // ...
}

@Composable
fun MainNavGraph(navController: NavHostController) {
    NavHost(navController, startDestination = Screen.Home.route) {
        composable(Screen.Home.route) { HomeScreen(...) }
        composable(
            route = Screen.VehicleDetail.route,
            arguments = listOf(navArgument("vehicleId") { type = NavType.StringType })
        ) { VehicleDetailScreen(...) }
    }
}
```

### Последствия
- Sealed class для route definitions
- NavArguments для параметров
- Deep link support для notifications

---

## ADR-A08: EncryptedSharedPreferences для безопасного хранения

### Статус
**Принято** (12.12.2025)

### Контекст
Выбор безопасного хранилища для JWT токенов и sensitive данных. Требования:
- Шифрование at-rest
- Простой API key-value
- Защита от root access
- Соответствие iOS Keychain

### Рассмотренные варианты

#### Вариант 1: EncryptedSharedPreferences
- **Плюсы:**
  - Официально от Google (Jetpack Security)
  - AES-256 шифрование
  - Простой API (как SharedPreferences)
  - Hardware-backed keys (если доступно)
- **Минусы:**
  - API 23+ (но мы уже на 26+)
  - Не такой безопасный как iOS Keychain

#### Вариант 2: Android Keystore напрямую
- **Плюсы:**
  - Максимальная безопасность
  - Hardware-backed
  - Защита от extraction
- **Минусы:**
  - Сложный API
  - Много boilerplate
  - Нестабильность на некоторых устройствах

#### Вариант 3: SQLCipher (encrypted Room)
- **Плюсы:**
  - Полное шифрование БД
  - Известная библиотека
- **Минусы:**
  - Overkill для key-value
  - Дополнительная зависимость

### Решение
Выбран **EncryptedSharedPreferences** из Jetpack Security.

### Обоснование
1. **Official**: Поддерживается Google
2. **Простота**: API идентичен SharedPreferences
3. **AES-256**: Достаточно сильное шифрование
4. **MasterKey**: Использует Android Keystore для ключей

### Реализация
```kotlin
@Singleton
class TokenManager @Inject constructor(
    @ApplicationContext context: Context
) {
    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val encryptedPrefs = EncryptedSharedPreferences.create(
        context,
        "secure_prefs",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    fun saveTokens(accessToken: String, refreshToken: String) {
        encryptedPrefs.edit()
            .putString("access_token", accessToken)
            .putString("refresh_token", refreshToken)
            .apply()
    }
}
```

### Последствия
- Токены зашифрованы на устройстве
- MasterKey управляется Android Keystore
- При root/compromise токены все еще защищены

---

## ADR-A09: Coil для загрузки изображений

### Статус
**Принято** (12.12.2025)

### Контекст
Выбор библиотеки для загрузки и кэширования изображений. Требования:
- Kotlin-first
- Интеграция с Compose
- Кэширование
- Placeholder/Error states

### Рассмотренные варианты

#### Вариант 1: Coil
- **Плюсы:**
  - Kotlin-first, coroutines
  - Нативная поддержка Compose (AsyncImage)
  - Легковесная
  - Disk + Memory cache
  - Аналог AsyncImage в SwiftUI
- **Минусы:**
  - Меньше сообщество чем Glide

#### Вариант 2: Glide
- **Плюсы:**
  - Зрелая, проверенная
  - Большое сообщество
  - Много функций
- **Минусы:**
  - Java-first
  - Compose integration не нативная
  - Больше размер

#### Вариант 3: Picasso
- **Плюсы:**
  - Простой API
  - От Square
- **Минусы:**
  - Устаревшая
  - Нет Compose support
  - Меньше фич

### Решение
Выбран **Coil**.

### Обоснование
1. **Kotlin-native**: Написан на Kotlin с корутинами
2. **Compose**: AsyncImage из коробки
3. **iOS соответствие**: Аналог AsyncImage в SwiftUI
4. **Легковесность**: Меньше чем Glide

### Использование
```kotlin
@Composable
fun VehicleImage(imageUrl: String, modifier: Modifier = Modifier) {
    AsyncImage(
        model = ImageRequest.Builder(LocalContext.current)
            .data(imageUrl)
            .crossfade(true)
            .build(),
        contentDescription = null,
        modifier = modifier,
        contentScale = ContentScale.Crop,
        placeholder = painterResource(R.drawable.placeholder),
        error = painterResource(R.drawable.error)
    )
}
```

### Последствия
- AsyncImage для всех сетевых изображений
- Автоматическое кэширование
- Placeholders при загрузке

---

## ADR-A10: SSL Certificate Pinning через OkHttp

### Статус
**Принято** (12.12.2025)

### Контекст
Защита от MITM атак на Android. Требования:
- Предотвращение перехвата трафика
- Поддержка certificate rotation
- Работа с OkHttp

### Рассмотренные варианты

#### Вариант 1: OkHttp CertificatePinner (Public Key)
- **Плюсы:**
  - Встроен в OkHttp
  - Public key пиннинг (реже меняется)
  - Поддержка backup pins
  - Простая конфигурация
- **Минусы:**
  - Нужно обновлять при смене ключей
  - Сложнее debugging

#### Вариант 2: Network Security Config (XML)
- **Плюсы:**
  - Декларативный (XML)
  - Не требует кода
  - Debug/Release конфигурации
- **Минусы:**
  - Менее гибкий
  - Full certificate pinning (чаще меняется)

#### Вариант 3: TrustManager вручную
- **Плюсы:**
  - Максимальный контроль
- **Минусы:**
  - Сложно и error-prone
  - Легко сделать небезопасно

### Решение
**OkHttp CertificatePinner** с public key pinning.

### Обоснование
1. **Гибкость**: Public key меняется реже чем сертификат
2. **Backup**: Можно добавить backup pin для rotation
3. **iOS соответствие**: Аналогичный подход на iOS
4. **OkHttp native**: Встроенная поддержка

### Реализация
```kotlin
fun createCertificatePinner(): CertificatePinner {
    return CertificatePinner.Builder()
        // Primary certificate
        .add("api.phuket-app.com", "sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=")
        // Backup certificate (для rotation)
        .add("api.phuket-app.com", "sha256/BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=")
        .build()
}

OkHttpClient.Builder()
    .certificatePinner(createCertificatePinner())
    .build()
```

### Последствия
- Пиннинг 2 ключей (primary + backup)
- Debug builds могут отключать pinning
- При rotation нужно app update заранее

---

## Сравнение ADR: iOS vs Android

| Решение | iOS (SwiftUI) | Android (Kotlin) |
|---------|---------------|------------------|
| UI Framework | SwiftUI (ADR-001) | Jetpack Compose (ADR-A01) |
| Architecture | MVVM + Repository (ADR-005) | Clean Architecture + MVVM (ADR-A02) |
| DI | Manual / Swinject | Hilt (ADR-A03) |
| Networking | URLSession + async/await | Retrofit + OkHttp (ADR-A04) |
| Local DB | SwiftData | Room (ADR-A05) |
| State | @Published, Combine | StateFlow (ADR-A06) |
| Navigation | NavigationStack | Navigation Compose (ADR-A07) |
| Secure Storage | Keychain | EncryptedSharedPreferences (ADR-A08) |
| Images | AsyncImage (native) | Coil (ADR-A09) |
| SSL Pinning | URLSessionDelegate | OkHttp CertificatePinner (ADR-A10) |

---

## Template для новых ADR (Android)

```markdown
## ADR-AXX: [Заголовок]

### Статус
[Предложено | Принято | Отклонено | Устарело | Заменено ADR-AYY]

### Контекст
[Описание проблемы и требований]

### Рассмотренные варианты

#### Вариант 1: [Название]
- **Плюсы:**
- **Минусы:**

#### Вариант 2: [Название]
- **Плюсы:**
- **Минусы:**

### Решение
[Какой вариант выбран]

### Обоснование
[Почему именно этот вариант]

### Последствия
[Что это означает для проекта]
```

---

**История изменений:**

| Дата | ADR | Изменение | Автор |
|------|-----|-----------|-------|
| 12.12.2025 | ADR-A01 to ADR-A10 | Initial creation | Android Team |
