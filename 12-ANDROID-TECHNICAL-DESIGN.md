# Technical Design Document
# Phuket App — Android

**Версия:** 1.0
**Дата:** 12 декабря 2025
**Автор:** Android Team
**Статус:** В разработке

---

## 1. Системные требования

### 1.1 Минимальные требования

| Параметр | Значение |
|----------|----------|
| **Min SDK** | API 26 (Android 8.0 Oreo) |
| **Target SDK** | API 34 (Android 14) |
| **Compile SDK** | API 34 |
| **Kotlin** | 1.9.21+ |
| **JVM Target** | 17 |
| **Gradle** | 8.2+ |
| **AGP** | 8.2.0+ |

### 1.2 Поддержка устройств

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      DEVICE SUPPORT MATRIX                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Android Version Distribution (Target Users):                              │
│                                                                             │
│  Android 14 (API 34)    ████████████████████  ~20%                        │
│  Android 13 (API 33)    ██████████████████████████  ~28%                  │
│  Android 12 (API 31-32) ████████████████████  ~22%                        │
│  Android 11 (API 30)    ████████████████  ~15%                            │
│  Android 10 (API 29)    ██████████  ~10%                                  │
│  Android 9  (API 28)    ████  ~4%                                         │
│  Android 8  (API 26-27) ██  ~1%                                           │
│                                                                             │
│  Total Coverage: ~100% of target market                                    │
│                                                                             │
│  Screen Sizes Supported:                                                   │
│  • Phones: 4.7" - 7.2"                                                    │
│  • Tablets: 7" - 12.9" (adaptive layouts)                                 │
│  • Foldables: Supported                                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Архитектура приложения

### 2.1 Слои архитектуры

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYERS                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                        APP MODULE                                      │ │
│  │                                                                        │ │
│  │  • Application class (@HiltAndroidApp)                                │ │
│  │  • MainActivity (Single Activity)                                      │ │
│  │  • Navigation Graph                                                    │ │
│  │  • App-level DI modules                                               │ │
│  │                                                                        │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                      │                                      │
│                                      ▼                                      │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                     FEATURE MODULES                                    │ │
│  │                                                                        │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │ │
│  │  │  :home   │ │:transport│ │:property │ │  :tours  │ │ :profile │   │ │
│  │  │          │ │          │ │          │ │          │ │          │   │ │
│  │  │ Screen   │ │ Screen   │ │ Screen   │ │ Screen   │ │ Screen   │   │ │
│  │  │ ViewModel│ │ ViewModel│ │ ViewModel│ │ ViewModel│ │ ViewModel│   │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘   │ │
│  │                                                                        │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐                 │ │
│  │  │  :auth   │ │:currency │ │:ai_chat  │ │ :booking │                 │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘                 │ │
│  │                                                                        │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                      │                                      │
│                                      ▼                                      │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                      DOMAIN MODULE                                     │ │
│  │                                                                        │ │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐    │ │
│  │  │      Models      │  │     UseCases     │  │   Repository     │    │ │
│  │  │                  │  │                  │  │   Interfaces     │    │ │
│  │  │ • Vehicle        │  │ • GetVehicles    │  │                  │    │ │
│  │  │ • Property       │  │ • GetProperties  │  │ • VehicleRepo    │    │ │
│  │  │ • Tour           │  │ • CreateBooking  │  │ • PropertyRepo   │    │ │
│  │  │ • Booking        │  │ • Login/Register │  │ • BookingRepo    │    │ │
│  │  │ • User           │  │ • SendAIMessage  │  │ • AuthRepo       │    │ │
│  │  └──────────────────┘  └──────────────────┘  └──────────────────┘    │ │
│  │                                                                        │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                      │                                      │
│                                      ▼                                      │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                       DATA MODULE                                      │ │
│  │                                                                        │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐ │ │
│  │  │                    Repository Implementations                     │ │ │
│  │  │                                                                   │ │ │
│  │  │  • VehicleRepositoryImpl                                         │ │ │
│  │  │  • PropertyRepositoryImpl                                        │ │ │
│  │  │  • BookingRepositoryImpl                                         │ │ │
│  │  │  • AuthRepositoryImpl                                            │ │ │
│  │  └──────────────────────────────────────────────────────────────────┘ │ │
│  │                              │                                         │ │
│  │           ┌──────────────────┴──────────────────┐                     │ │
│  │           │                                     │                     │ │
│  │           ▼                                     ▼                     │ │
│  │  ┌──────────────────┐              ┌──────────────────┐              │ │
│  │  │  Remote Source   │              │   Local Source   │              │ │
│  │  │                  │              │                  │              │ │
│  │  │ • DTOs           │              │ • Entities       │              │ │
│  │  │ • ApiService     │              │ • DAOs           │              │ │
│  │  │ • Mappers        │              │ • Database       │              │ │
│  │  └──────────────────┘              └──────────────────┘              │ │
│  │                                                                        │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                      │                                      │
│                                      ▼                                      │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                      CORE MODULES                                      │ │
│  │                                                                        │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │ │
│  │  │ :network │ │:database │ │:security │ │ :common  │ │:designsys│   │ │
│  │  │          │ │          │ │          │ │          │ │          │   │ │
│  │  │ Retrofit │ │  Room    │ │Encrypted │ │ Result   │ │ Theme    │   │ │
│  │  │ OkHttp   │ │  DAOs    │ │SharedPref│ │ Error    │ │Components│   │ │
│  │  │ SSL Pin  │ │Converters│ │ Token    │ │Extensions│ │ Icons    │   │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘   │ │
│  │                                                                        │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Gradle Module Dependencies

```kotlin
// settings.gradle.kts
dependencyResolutionManagement {
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "PhuketApp"

include(":app")
// Core
include(":core:common")
include(":core:network")
include(":core:database")
include(":core:security")
include(":core:designsystem")
// Domain
include(":domain")
// Data
include(":data")
// Features
include(":feature:home")
include(":feature:transport")
include(":feature:accommodation")
include(":feature:tours")
include(":feature:auth")
include(":feature:profile")
include(":feature:booking")
include(":feature:currency")
include(":feature:ai_assistant")
```

```
Module Dependency Graph:

:app
├── :feature:*
├── :domain
├── :data
└── :core:*

:feature:*
├── :domain
├── :core:common
└── :core:designsystem

:data
├── :domain
├── :core:network
├── :core:database
└── :core:security

:domain
└── :core:common

:core:network
├── :core:common
└── :core:security

:core:database
└── :core:common
```

---

## 3. Data Flow

### 3.1 Unidirectional Data Flow (UDF)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    UNIDIRECTIONAL DATA FLOW                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│     ┌──────────────────────────────────────────────────────────────────┐   │
│     │                                                                   │   │
│     │                           UI (Compose)                           │   │
│     │                                                                   │   │
│     │   ┌─────────────────────────────────────────────────────────┐   │   │
│     │   │                                                          │   │   │
│     │   │   val uiState by viewModel.uiState                      │   │   │
│     │   │       .collectAsStateWithLifecycle()                    │   │   │
│     │   │                                                          │   │   │
│     │   │   when (uiState) {                                       │   │   │
│     │   │       is Loading -> LoadingIndicator()                   │   │   │
│     │   │       is Success -> VehicleList(uiState.vehicles)        │   │   │
│     │   │       is Error -> ErrorState(uiState.error)              │   │   │
│     │   │   }                                                       │   │   │
│     │   │                                                          │   │   │
│     │   │   Button(onClick = { viewModel.onRefresh() })            │   │   │
│     │   │                                                          │   │   │
│     │   └─────────────────────────────────────────────────────────┘   │   │
│     │                                                                   │   │
│     └───────────────────────────┬───────────────────────────────────────┘   │
│                                 │                                           │
│                 Observes        │         User Actions                      │
│                 StateFlow       │         (Events)                          │
│                                 │                                           │
│                                 ▼                                           │
│     ┌───────────────────────────────────────────────────────────────────┐  │
│     │                                                                    │  │
│     │                        ViewModel                                   │  │
│     │                                                                    │  │
│     │   class TransportViewModel(                                       │  │
│     │       private val getVehiclesUseCase: GetVehiclesUseCase          │  │
│     │   ) : ViewModel() {                                               │  │
│     │                                                                    │  │
│     │       private val _uiState = MutableStateFlow(UiState())          │  │
│     │       val uiState: StateFlow<UiState> = _uiState.asStateFlow()    │  │
│     │                                                                    │  │
│     │       fun onRefresh() {                                           │  │
│     │           viewModelScope.launch {                                 │  │
│     │               getVehiclesUseCase()                                │  │
│     │                   .collect { result ->                            │  │
│     │                       _uiState.update { ... }                     │  │
│     │                   }                                               │  │
│     │           }                                                        │  │
│     │       }                                                            │  │
│     │   }                                                                │  │
│     │                                                                    │  │
│     └──────────────────────────────────────────────────────────────────┘   │
│                                 │                                           │
│                      Calls      │        Returns                            │
│                      UseCase    │        Flow<Result<T>>                    │
│                                 │                                           │
│                                 ▼                                           │
│     ┌───────────────────────────────────────────────────────────────────┐  │
│     │                                                                    │  │
│     │                       UseCase / Repository                         │  │
│     │                                                                    │  │
│     │   class GetVehiclesUseCase(                                       │  │
│     │       private val repository: VehicleRepository                   │  │
│     │   ) {                                                              │  │
│     │       operator fun invoke(): Flow<Result<List<Vehicle>>>          │  │
│     │           = repository.getVehicles()                              │  │
│     │   }                                                                │  │
│     │                                                                    │  │
│     └───────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 State Holder Pattern

```kotlin
// Sealed interface для UI State
sealed interface TransportUiState {
    data object Loading : TransportUiState
    data class Success(
        val vehicles: List<Vehicle>,
        val selectedFilter: VehicleType? = null,
        val isRefreshing: Boolean = false
    ) : TransportUiState
    data class Error(
        val message: String,
        val cachedVehicles: List<Vehicle> = emptyList()
    ) : TransportUiState
}

// One-time events через Channel
sealed interface TransportEvent {
    data class NavigateToDetail(val vehicleId: String) : TransportEvent
    data class ShowSnackbar(val message: String) : TransportEvent
    data object ScrollToTop : TransportEvent
}

// ViewModel
@HiltViewModel
class TransportViewModel @Inject constructor(
    private val getVehiclesUseCase: GetVehiclesUseCase
) : ViewModel() {

    private val _uiState = MutableStateFlow<TransportUiState>(TransportUiState.Loading)
    val uiState: StateFlow<TransportUiState> = _uiState.asStateFlow()

    private val _events = Channel<TransportEvent>(Channel.BUFFERED)
    val events: Flow<TransportEvent> = _events.receiveAsFlow()

    init {
        loadVehicles()
    }

    fun loadVehicles() {
        viewModelScope.launch {
            getVehiclesUseCase().collect { result ->
                _uiState.value = when (result) {
                    is Result.Loading -> TransportUiState.Loading
                    is Result.Success -> TransportUiState.Success(vehicles = result.data)
                    is Result.Error -> TransportUiState.Error(
                        message = result.error.toUiMessage()
                    )
                }
            }
        }
    }

    fun onVehicleClick(vehicleId: String) {
        viewModelScope.launch {
            _events.send(TransportEvent.NavigateToDetail(vehicleId))
        }
    }
}
```

---

## 4. API Layer

### 4.1 API Endpoints

```kotlin
// core/network/api/PhuketApiService.kt
interface PhuketApiService {

    // ═══════════════════════════════════════════════════════════════════════
    // AUTH ENDPOINTS
    // ═══════════════════════════════════════════════════════════════════════

    @POST("auth/register")
    suspend fun register(
        @Body request: RegisterRequest
    ): Response<AuthResponse>

    @POST("auth/login")
    suspend fun login(
        @Body request: LoginRequest
    ): Response<AuthResponse>

    @POST("auth/refresh")
    suspend fun refreshToken(
        @Body request: RefreshTokenRequest
    ): Response<AuthResponse>

    @POST("auth/logout")
    suspend fun logout(): Response<Unit>

    @POST("auth/password/reset")
    suspend fun requestPasswordReset(
        @Body request: PasswordResetRequest
    ): Response<MessageResponse>

    // ═══════════════════════════════════════════════════════════════════════
    // VEHICLE ENDPOINTS
    // ═══════════════════════════════════════════════════════════════════════

    @GET("vehicles")
    suspend fun getVehicles(
        @Query("type") type: String? = null,
        @Query("brand") brand: String? = null,
        @Query("min_price") minPrice: Double? = null,
        @Query("max_price") maxPrice: Double? = null,
        @Query("available_from") availableFrom: String? = null,
        @Query("available_to") availableTo: String? = null,
        @Query("sort_by") sortBy: String? = null,
        @Query("sort_order") sortOrder: String? = null,
        @Query("page") page: Int = 1,
        @Query("per_page") perPage: Int = 20
    ): Response<PaginatedResponse<VehicleDto>>

    @GET("vehicles/{id}")
    suspend fun getVehicle(
        @Path("id") id: String
    ): Response<VehicleDto>

    @GET("vehicles/{id}/availability")
    suspend fun getVehicleAvailability(
        @Path("id") id: String,
        @Query("start_date") startDate: String,
        @Query("end_date") endDate: String
    ): Response<AvailabilityResponse>

    @GET("vehicles/{id}/reviews")
    suspend fun getVehicleReviews(
        @Path("id") id: String,
        @Query("page") page: Int = 1,
        @Query("per_page") perPage: Int = 10
    ): Response<PaginatedResponse<ReviewDto>>

    // ═══════════════════════════════════════════════════════════════════════
    // PROPERTY ENDPOINTS
    // ═══════════════════════════════════════════════════════════════════════

    @GET("properties")
    suspend fun getProperties(
        @Query("type") type: String? = null,
        @Query("area") area: String? = null,
        @Query("bedrooms") bedrooms: Int? = null,
        @Query("bathrooms") bathrooms: Int? = null,
        @Query("min_price") minPrice: Double? = null,
        @Query("max_price") maxPrice: Double? = null,
        @Query("amenities") amenities: List<String>? = null,
        @Query("check_in") checkIn: String? = null,
        @Query("check_out") checkOut: String? = null,
        @Query("guests") guests: Int? = null,
        @Query("page") page: Int = 1,
        @Query("per_page") perPage: Int = 20
    ): Response<PaginatedResponse<PropertyDto>>

    @GET("properties/{id}")
    suspend fun getProperty(
        @Path("id") id: String
    ): Response<PropertyDto>

    @GET("properties/{id}/availability")
    suspend fun getPropertyAvailability(
        @Path("id") id: String,
        @Query("start_date") startDate: String,
        @Query("end_date") endDate: String
    ): Response<AvailabilityResponse>

    // ═══════════════════════════════════════════════════════════════════════
    // TOUR ENDPOINTS
    // ═══════════════════════════════════════════════════════════════════════

    @GET("tours")
    suspend fun getTours(
        @Query("category") category: String? = null,
        @Query("min_price") minPrice: Double? = null,
        @Query("max_price") maxPrice: Double? = null,
        @Query("date") date: String? = null,
        @Query("duration_min") durationMin: Int? = null,
        @Query("duration_max") durationMax: Int? = null,
        @Query("page") page: Int = 1,
        @Query("per_page") perPage: Int = 20
    ): Response<PaginatedResponse<TourDto>>

    @GET("tours/{id}")
    suspend fun getTour(
        @Path("id") id: String
    ): Response<TourDto>

    @GET("tours/{id}/available-dates")
    suspend fun getTourAvailableDates(
        @Path("id") id: String,
        @Query("month") month: String // Format: YYYY-MM
    ): Response<List<String>>

    // ═══════════════════════════════════════════════════════════════════════
    // BOOKING ENDPOINTS
    // ═══════════════════════════════════════════════════════════════════════

    @POST("bookings")
    suspend fun createBooking(
        @Body request: CreateBookingRequest
    ): Response<BookingDto>

    @GET("bookings")
    suspend fun getUserBookings(
        @Query("status") status: String? = null,
        @Query("page") page: Int = 1
    ): Response<PaginatedResponse<BookingDto>>

    @GET("bookings/{id}")
    suspend fun getBooking(
        @Path("id") id: String
    ): Response<BookingDto>

    @POST("bookings/{id}/cancel")
    suspend fun cancelBooking(
        @Path("id") id: String,
        @Body request: CancelBookingRequest? = null
    ): Response<BookingDto>

    @POST("bookings/{id}/review")
    suspend fun submitReview(
        @Path("id") id: String,
        @Body request: SubmitReviewRequest
    ): Response<ReviewDto>

    // ═══════════════════════════════════════════════════════════════════════
    // PAYMENT ENDPOINTS
    // ═══════════════════════════════════════════════════════════════════════

    @POST("payments/create-intent")
    suspend fun createPaymentIntent(
        @Body request: CreatePaymentIntentRequest
    ): Response<PaymentIntentResponse>

    @POST("payments/confirm")
    suspend fun confirmPayment(
        @Body request: ConfirmPaymentRequest
    ): Response<PaymentConfirmationResponse>

    // ═══════════════════════════════════════════════════════════════════════
    // AI ENDPOINTS
    // ═══════════════════════════════════════════════════════════════════════

    @POST("ai/chat")
    suspend fun sendAIMessage(
        @Body request: AIMessageRequest
    ): Response<AIMessageResponse>

    @GET("ai/history")
    suspend fun getAIChatHistory(
        @Query("limit") limit: Int = 50
    ): Response<List<AIChatMessageDto>>

    @DELETE("ai/history")
    suspend fun clearAIChatHistory(): Response<Unit>

    // ═══════════════════════════════════════════════════════════════════════
    // UTILITY ENDPOINTS
    // ═══════════════════════════════════════════════════════════════════════

    @GET("currency/rates")
    suspend fun getCurrencyRates(
        @Query("base") base: String = "THB"
    ): Response<CurrencyRatesResponse>

    @GET("weather")
    suspend fun getWeather(
        @Query("lat") lat: Double? = null,
        @Query("lon") lon: Double? = null
    ): Response<WeatherResponse>

    @GET("search")
    suspend fun globalSearch(
        @Query("q") query: String,
        @Query("limit") limit: Int = 10
    ): Response<SearchResponse>

    // ═══════════════════════════════════════════════════════════════════════
    // USER ENDPOINTS
    // ═══════════════════════════════════════════════════════════════════════

    @GET("users/me")
    suspend fun getCurrentUser(): Response<UserDto>

    @PUT("users/me")
    suspend fun updateProfile(
        @Body request: UpdateProfileRequest
    ): Response<UserDto>

    @Multipart
    @POST("users/me/avatar")
    suspend fun uploadAvatar(
        @Part image: MultipartBody.Part
    ): Response<AvatarResponse>

    @GET("users/me/favorites")
    suspend fun getFavorites(): Response<FavoritesResponse>

    @POST("users/me/favorites/{itemType}/{itemId}")
    suspend fun addToFavorites(
        @Path("itemType") itemType: String,
        @Path("itemId") itemId: String
    ): Response<Unit>

    @DELETE("users/me/favorites/{itemType}/{itemId}")
    suspend fun removeFromFavorites(
        @Path("itemType") itemType: String,
        @Path("itemId") itemId: String
    ): Response<Unit>

    @GET("users/me/loyalty")
    suspend fun getLoyaltyInfo(): Response<LoyaltyInfoResponse>

    // ═══════════════════════════════════════════════════════════════════════
    // NOTIFICATION ENDPOINTS
    // ═══════════════════════════════════════════════════════════════════════

    @POST("notifications/register-device")
    suspend fun registerDevice(
        @Body request: RegisterDeviceRequest
    ): Response<Unit>

    @DELETE("notifications/unregister-device")
    suspend fun unregisterDevice(
        @Body request: UnregisterDeviceRequest
    ): Response<Unit>

    @PUT("notifications/preferences")
    suspend fun updateNotificationPreferences(
        @Body request: NotificationPreferencesRequest
    ): Response<Unit>
}
```

### 4.2 DTO Models

```kotlin
// data/remote/dto/VehicleDto.kt
data class VehicleDto(
    @SerializedName("id")
    val id: String,

    @SerializedName("type")
    val type: String,

    @SerializedName("brand")
    val brand: String,

    @SerializedName("model")
    val model: String,

    @SerializedName("year")
    val year: Int,

    @SerializedName("price_per_day")
    val pricePerDay: Double,

    @SerializedName("price_per_week")
    val pricePerWeek: Double?,

    @SerializedName("price_per_month")
    val pricePerMonth: Double?,

    @SerializedName("location")
    val location: LocationDto,

    @SerializedName("images")
    val images: List<String>,

    @SerializedName("features")
    val features: List<String>,

    @SerializedName("is_available")
    val isAvailable: Boolean,

    @SerializedName("rating")
    val rating: Double,

    @SerializedName("reviews_count")
    val reviewsCount: Int,

    @SerializedName("rental_company")
    val rentalCompany: String,

    @SerializedName("specs")
    val specs: VehicleSpecsDto?,

    @SerializedName("created_at")
    val createdAt: String,

    @SerializedName("updated_at")
    val updatedAt: String
)

data class LocationDto(
    @SerializedName("latitude")
    val latitude: Double,

    @SerializedName("longitude")
    val longitude: Double,

    @SerializedName("address")
    val address: String?
)

data class VehicleSpecsDto(
    @SerializedName("engine_capacity")
    val engineCapacity: Int?,

    @SerializedName("fuel_type")
    val fuelType: String?,

    @SerializedName("transmission")
    val transmission: String?,

    @SerializedName("seats")
    val seats: Int?
)

// data/remote/dto/BookingDto.kt
data class BookingDto(
    @SerializedName("id")
    val id: String,

    @SerializedName("user_id")
    val userId: String,

    @SerializedName("item_id")
    val itemId: String,

    @SerializedName("item_type")
    val itemType: String,

    @SerializedName("item_title")
    val itemTitle: String,

    @SerializedName("item_image_url")
    val itemImageUrl: String?,

    @SerializedName("start_date")
    val startDate: String,

    @SerializedName("end_date")
    val endDate: String,

    @SerializedName("total_price")
    val totalPrice: Double,

    @SerializedName("currency")
    val currency: String,

    @SerializedName("status")
    val status: String,

    @SerializedName("payment_status")
    val paymentStatus: String,

    @SerializedName("guests_count")
    val guestsCount: Int,

    @SerializedName("notes")
    val notes: String?,

    @SerializedName("confirmation_code")
    val confirmationCode: String,

    @SerializedName("created_at")
    val createdAt: String,

    @SerializedName("cancelled_at")
    val cancelledAt: String?,

    @SerializedName("cancellation_reason")
    val cancellationReason: String?
)
```

### 4.3 Mapper Extensions

```kotlin
// data/remote/mapper/VehicleMapper.kt
fun VehicleDto.toDomain(): Vehicle {
    return Vehicle(
        id = id,
        type = VehicleType.valueOf(type.uppercase()),
        brand = brand,
        model = model,
        year = year,
        pricePerDay = pricePerDay,
        pricePerWeek = pricePerWeek,
        pricePerMonth = pricePerMonth,
        latitude = location.latitude,
        longitude = location.longitude,
        images = images,
        features = features,
        isAvailable = isAvailable,
        rating = rating,
        reviewsCount = reviewsCount,
        rentalCompany = rentalCompany,
        engineCapacity = specs?.engineCapacity,
        fuelType = specs?.fuelType,
        transmission = specs?.transmission
    )
}

fun VehicleDto.toEntity(): VehicleEntity {
    return VehicleEntity(
        id = id,
        type = type,
        brand = brand,
        model = model,
        year = year,
        pricePerDay = pricePerDay,
        pricePerWeek = pricePerWeek,
        pricePerMonth = pricePerMonth,
        latitude = location.latitude,
        longitude = location.longitude,
        images = images,
        features = features,
        isAvailable = isAvailable,
        rating = rating,
        reviewsCount = reviewsCount,
        rentalCompany = rentalCompany,
        engineCapacity = specs?.engineCapacity,
        fuelType = specs?.fuelType,
        transmission = specs?.transmission,
        cachedAt = System.currentTimeMillis()
    )
}

fun VehicleEntity.toDomain(): Vehicle {
    return Vehicle(
        id = id,
        type = VehicleType.valueOf(type.uppercase()),
        brand = brand,
        model = model,
        year = year,
        pricePerDay = pricePerDay,
        pricePerWeek = pricePerWeek,
        pricePerMonth = pricePerMonth,
        latitude = latitude,
        longitude = longitude,
        images = images,
        features = features,
        isAvailable = isAvailable,
        rating = rating,
        reviewsCount = reviewsCount,
        rentalCompany = rentalCompany,
        engineCapacity = engineCapacity,
        fuelType = fuelType,
        transmission = transmission
    )
}
```

---

## 5. UI Components

### 5.1 Design System

```kotlin
// core/designsystem/theme/Theme.kt
private val LightColorScheme = lightColorScheme(
    primary = PhuketBlue,
    onPrimary = Color.White,
    primaryContainer = PhuketBlueLight,
    onPrimaryContainer = PhuketBlueDark,
    secondary = TropicalTeal,
    onSecondary = Color.White,
    secondaryContainer = TropicalTealLight,
    onSecondaryContainer = TropicalTealDark,
    tertiary = SunsetOrange,
    onTertiary = Color.White,
    background = Color(0xFFFBFBFB),
    onBackground = Color(0xFF1C1B1F),
    surface = Color.White,
    onSurface = Color(0xFF1C1B1F),
    error = Color(0xFFB3261E),
    onError = Color.White
)

private val DarkColorScheme = darkColorScheme(
    primary = PhuketBlueLight,
    onPrimary = PhuketBlueDark,
    primaryContainer = PhuketBlue,
    onPrimaryContainer = Color.White,
    secondary = TropicalTealLight,
    onSecondary = TropicalTealDark,
    secondaryContainer = TropicalTeal,
    onSecondaryContainer = Color.White,
    tertiary = SunsetOrangeLight,
    onTertiary = SunsetOrangeDark,
    background = Color(0xFF1C1B1F),
    onBackground = Color(0xFFE6E1E5),
    surface = Color(0xFF1C1B1F),
    onSurface = Color(0xFFE6E1E5),
    error = Color(0xFFF2B8B5),
    onError = Color(0xFF601410)
)

@Composable
fun PhuketAppTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = true, // Android 12+ Material You
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context)
            else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = PhuketTypography,
        shapes = PhuketShapes,
        content = content
    )
}

// core/designsystem/theme/Color.kt
val PhuketBlue = Color(0xFF0066CC)
val PhuketBlueLight = Color(0xFF4D94DB)
val PhuketBlueDark = Color(0xFF004C99)

val TropicalTeal = Color(0xFF00897B)
val TropicalTealLight = Color(0xFF4DB6AC)
val TropicalTealDark = Color(0xFF00695C)

val SunsetOrange = Color(0xFFFF6B35)
val SunsetOrangeLight = Color(0xFFFF9A6C)
val SunsetOrangeDark = Color(0xFFE65100)

val GoldStar = Color(0xFFFFB800)
```

### 5.2 Reusable Components

```kotlin
// core/designsystem/components/PhuketButton.kt
@Composable
fun PhuketButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    isLoading: Boolean = false,
    icon: ImageVector? = null,
    style: PhuketButtonStyle = PhuketButtonStyle.Primary
) {
    val colors = when (style) {
        PhuketButtonStyle.Primary -> ButtonDefaults.buttonColors(
            containerColor = MaterialTheme.colorScheme.primary
        )
        PhuketButtonStyle.Secondary -> ButtonDefaults.buttonColors(
            containerColor = MaterialTheme.colorScheme.secondary
        )
        PhuketButtonStyle.Outline -> ButtonDefaults.outlinedButtonColors()
        PhuketButtonStyle.Text -> ButtonDefaults.textButtonColors()
    }

    Button(
        onClick = onClick,
        modifier = modifier.height(48.dp),
        enabled = enabled && !isLoading,
        colors = colors,
        shape = RoundedCornerShape(12.dp)
    ) {
        if (isLoading) {
            CircularProgressIndicator(
                modifier = Modifier.size(20.dp),
                strokeWidth = 2.dp,
                color = MaterialTheme.colorScheme.onPrimary
            )
        } else {
            icon?.let {
                Icon(
                    imageVector = it,
                    contentDescription = null,
                    modifier = Modifier.size(20.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
            }
            Text(text = text)
        }
    }
}

enum class PhuketButtonStyle {
    Primary, Secondary, Outline, Text
}

// core/designsystem/components/PhuketCard.kt
@Composable
fun PhuketCard(
    modifier: Modifier = Modifier,
    onClick: (() -> Unit)? = null,
    content: @Composable ColumnScope.() -> Unit
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .then(
                if (onClick != null) {
                    Modifier.clickable(onClick = onClick)
                } else {
                    Modifier
                }
            ),
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        )
    ) {
        Column(content = content)
    }
}

// core/designsystem/components/RatingBar.kt
@Composable
fun RatingBar(
    rating: Double,
    reviewsCount: Int,
    modifier: Modifier = Modifier,
    maxRating: Int = 5,
    showReviewsCount: Boolean = true
) {
    Row(
        modifier = modifier,
        verticalAlignment = Alignment.CenterVertically
    ) {
        repeat(maxRating) { index ->
            val starProgress = (rating - index).coerceIn(0.0, 1.0).toFloat()

            Box {
                Icon(
                    imageVector = Icons.Default.StarBorder,
                    contentDescription = null,
                    tint = GoldStar.copy(alpha = 0.3f),
                    modifier = Modifier.size(16.dp)
                )
                Icon(
                    imageVector = Icons.Default.Star,
                    contentDescription = null,
                    tint = GoldStar,
                    modifier = Modifier
                        .size(16.dp)
                        .clip(
                            RectangleShape.copy(
                                topEnd = CornerSize(0.dp),
                                bottomEnd = CornerSize(0.dp)
                            )
                        )
                        .fillMaxWidth(starProgress)
                )
            }
        }

        if (showReviewsCount) {
            Spacer(modifier = Modifier.width(4.dp))
            Text(
                text = "(${reviewsCount})",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

// core/designsystem/components/SearchBar.kt
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PhuketSearchBar(
    query: String,
    onQueryChange: (String) -> Unit,
    onSearch: (String) -> Unit,
    modifier: Modifier = Modifier,
    placeholder: String = "Search...",
    isActive: Boolean = false,
    onActiveChange: (Boolean) -> Unit = {}
) {
    SearchBar(
        query = query,
        onQueryChange = onQueryChange,
        onSearch = onSearch,
        active = isActive,
        onActiveChange = onActiveChange,
        modifier = modifier.fillMaxWidth(),
        placeholder = { Text(placeholder) },
        leadingIcon = {
            Icon(Icons.Default.Search, contentDescription = null)
        },
        trailingIcon = {
            if (query.isNotEmpty()) {
                IconButton(onClick = { onQueryChange("") }) {
                    Icon(Icons.Default.Clear, contentDescription = "Clear")
                }
            }
        }
    ) {
        // Search suggestions would go here
    }
}

// core/designsystem/components/EmptyState.kt
@Composable
fun EmptyState(
    title: String,
    message: String,
    modifier: Modifier = Modifier,
    icon: ImageVector = Icons.Default.SearchOff,
    action: (@Composable () -> Unit)? = null
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            modifier = Modifier.size(64.dp),
            tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f)
        )

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = title,
            style = MaterialTheme.typography.titleMedium,
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = message,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center
        )

        action?.let {
            Spacer(modifier = Modifier.height(24.dp))
            it()
        }
    }
}

// core/designsystem/components/LoadingIndicator.kt
@Composable
fun LoadingIndicator(
    modifier: Modifier = Modifier,
    message: String? = null
) {
    Column(
        modifier = modifier,
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        CircularProgressIndicator(
            color = MaterialTheme.colorScheme.primary
        )

        message?.let {
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = it,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}
```

---

## 6. ProGuard / R8 Configuration

```proguard
# proguard-rules.pro

# ═══════════════════════════════════════════════════════════════════════════
# KOTLIN
# ═══════════════════════════════════════════════════════════════════════════
-keep class kotlin.** { *; }
-keep class kotlin.Metadata { *; }
-dontwarn kotlin.**
-keepclassmembers class **$WhenMappings {
    <fields>;
}
-keepclassmembers class kotlin.Metadata {
    public <methods>;
}

# ═══════════════════════════════════════════════════════════════════════════
# RETROFIT & OKHTTP
# ═══════════════════════════════════════════════════════════════════════════
-keepattributes Signature
-keepattributes Exceptions
-keepattributes *Annotation*

-dontwarn retrofit2.**
-keep class retrofit2.** { *; }
-keepclasseswithmembers class * {
    @retrofit2.http.* <methods>;
}

-dontwarn okhttp3.**
-dontwarn okio.**
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }

# ═══════════════════════════════════════════════════════════════════════════
# GSON
# ═══════════════════════════════════════════════════════════════════════════
-keepattributes Signature
-keepattributes *Annotation*
-dontwarn sun.misc.**
-keep class com.google.gson.** { *; }
-keep class * extends com.google.gson.TypeAdapter
-keep class * implements com.google.gson.TypeAdapterFactory
-keep class * implements com.google.gson.JsonSerializer
-keep class * implements com.google.gson.JsonDeserializer

# Keep DTOs
-keep class com.phuketapp.data.remote.dto.** { *; }

# ═══════════════════════════════════════════════════════════════════════════
# ROOM
# ═══════════════════════════════════════════════════════════════════════════
-keep class * extends androidx.room.RoomDatabase
-keep @androidx.room.Entity class *
-dontwarn androidx.room.paging.**

# ═══════════════════════════════════════════════════════════════════════════
# HILT
# ═══════════════════════════════════════════════════════════════════════════
-keep class dagger.hilt.** { *; }
-keep class javax.inject.** { *; }
-keep class * extends dagger.hilt.android.internal.managers.ComponentSupplier { *; }
-keep class * extends dagger.hilt.android.internal.managers.ViewComponentManager$FragmentContextWrapper { *; }

# ═══════════════════════════════════════════════════════════════════════════
# FIREBASE
# ═══════════════════════════════════════════════════════════════════════════
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }

# ═══════════════════════════════════════════════════════════════════════════
# STRIPE
# ═══════════════════════════════════════════════════════════════════════════
-keep class com.stripe.android.** { *; }

# ═══════════════════════════════════════════════════════════════════════════
# DOMAIN MODELS (keep for reflection if needed)
# ═══════════════════════════════════════════════════════════════════════════
-keep class com.phuketapp.domain.model.** { *; }

# ═══════════════════════════════════════════════════════════════════════════
# COROUTINES
# ═══════════════════════════════════════════════════════════════════════════
-keepnames class kotlinx.coroutines.internal.MainDispatcherFactory {}
-keepnames class kotlinx.coroutines.CoroutineExceptionHandler {}
-keepclassmembers class kotlinx.coroutines.** {
    volatile <fields>;
}

# ═══════════════════════════════════════════════════════════════════════════
# SERIALIZATION
# ═══════════════════════════════════════════════════════════════════════════
-keepattributes *Annotation*, InnerClasses
-dontnote kotlinx.serialization.AnnotationsKt
-keepclassmembers @kotlinx.serialization.Serializable class ** {
    *** Companion;
    *** INSTANCE;
    kotlinx.serialization.KSerializer serializer(...);
}
```

---

## 7. Сравнение с iOS Technical Design

| Аспект | iOS (SwiftUI) | Android (Kotlin) |
|--------|---------------|------------------|
| **Min OS** | iOS 17.0 | Android 8.0 (API 26) |
| **UI Framework** | SwiftUI | Jetpack Compose |
| **State Management** | @StateObject, @Published | StateFlow, MutableStateFlow |
| **DI** | Manual / Factory | Hilt (Dagger) |
| **Network** | URLSession + async/await | Retrofit + Coroutines |
| **Local Storage** | SwiftData | Room |
| **Secure Storage** | Keychain Services | EncryptedSharedPreferences |
| **Image Loading** | AsyncImage (built-in) | Coil |
| **Navigation** | NavigationStack | Navigation Compose |
| **Code Protection** | N/A (compiled) | ProGuard/R8 |

---

**Согласовано:**

| Роль | Имя | Подпись | Дата |
|------|-----|---------|------|
| Android Lead | | | |
| Tech Lead | | | |
| QA Lead | | | |
| Security | | | |
