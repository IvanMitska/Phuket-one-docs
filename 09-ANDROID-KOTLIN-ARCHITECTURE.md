# Android Architecture Document
# Phuket App (Kotlin)

**Версия:** 1.0
**Дата:** 12 декабря 2025
**Автор:** Mobile Team (Android)
**Статус:** В разработке

---

## 1. Обзор архитектуры

### 1.1 Платформа и технологии

| Аспект | Описание |
|--------|----------|
| **Платформа** | Android 8.0+ (API 26+) |
| **Язык** | Kotlin 1.9+ |
| **UI Framework** | Jetpack Compose |
| **Архитектура** | MVVM + Clean Architecture |
| **Сеть** | Retrofit 2 + OkHttp + Kotlin Coroutines |
| **DI** | Hilt (Dagger) |
| **Хранилище** | Room + DataStore + EncryptedSharedPreferences |
| **Навигация** | Navigation Compose |
| **Безопасность** | SSL Pinning, EncryptedSharedPreferences |

### 1.2 Архитектурный стиль

Phuket App для Android использует **MVVM + Clean Architecture** с четким разделением слоев:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      ANDROID ARCHITECTURE OVERVIEW                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    PRESENTATION LAYER                                │   │
│  │                     (Jetpack Compose)                                │   │
│  │                                                                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │   │
│  │  │  HomeScreen  │  │TransportScreen│  │  ToursScreen │  ...         │   │
│  │  │              │  │              │  │              │               │   │
│  │  │  viewModel   │  │  viewModel   │  │  viewModel   │               │   │
│  │  │  (hiltViewModel)│ (hiltViewModel)│ (hiltViewModel)│              │   │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘               │   │
│  │         │                 │                 │                        │   │
│  └─────────┼─────────────────┼─────────────────┼────────────────────────┘   │
│            │                 │                 │                            │
│            │    StateFlow    │                 │                            │
│            │    + Events     │                 │                            │
│            ▼                 ▼                 ▼                            │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      VIEWMODEL LAYER                                 │   │
│  │                                                                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │   │
│  │  │HomeViewModel │  │TransportVM   │  │ ToursViewModel│  ...         │   │
│  │  │              │  │              │  │              │               │   │
│  │  │ _uiState     │  │ _uiState     │  │ _uiState     │               │   │
│  │  │ StateFlow    │  │ StateFlow    │  │ StateFlow    │               │   │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘               │   │
│  │         │                 │                 │                        │   │
│  └─────────┼─────────────────┼─────────────────┼────────────────────────┘   │
│            │                 │                 │                            │
│            │   UseCase       │                 │                            │
│            │   Injection     │                 │                            │
│            ▼                 ▼                 ▼                            │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                       DOMAIN LAYER                                   │   │
│  │                                                                      │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │                      UseCases                                │    │   │
│  │  │                                                              │    │   │
│  │  │  GetVehiclesUseCase                                         │    │   │
│  │  │  GetPropertiesUseCase                                       │    │   │
│  │  │  CreateBookingUseCase                                       │    │   │
│  │  │  LoginUseCase                                                │    │   │
│  │  └─────────────────────────────────────────────────────────────┘    │   │
│  │                               │                                      │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │                  Repository Interfaces                       │    │   │
│  │  │                                                              │    │   │
│  │  │  VehicleRepository (interface)                              │    │   │
│  │  │  PropertyRepository (interface)                             │    │   │
│  │  │  TourRepository (interface)                                 │    │   │
│  │  │  BookingRepository (interface)                              │    │   │
│  │  │  AuthRepository (interface)                                 │    │   │
│  │  └─────────────────────────────────────────────────────────────┘    │   │
│  │                                                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                               │                                             │
│                               ▼                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        DATA LAYER                                    │   │
│  │                                                                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │   │
│  │  │  Repository  │  │   Remote     │  │    Local     │               │   │
│  │  │   Impl       │  │  DataSource  │  │  DataSource  │               │   │
│  │  │              │  │  (Retrofit)  │  │   (Room)     │               │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │   │
│  │                                                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Структура проекта

### 2.1 Module Structure

```
PhuketApp/
│
├── app/                              # Main application module
│   ├── src/main/
│   │   ├── java/com/phuketapp/
│   │   │   ├── PhuketApplication.kt  # @HiltAndroidApp
│   │   │   ├── MainActivity.kt       # Single Activity
│   │   │   └── MainNavGraph.kt       # Navigation
│   │   │
│   │   ├── res/
│   │   └── AndroidManifest.xml
│   │
│   └── build.gradle.kts
│
├── core/                             # Core modules
│   ├── common/                       # Shared utilities
│   │   └── src/main/java/
│   │       ├── result/               # Result wrapper
│   │       ├── extensions/           # Kotlin extensions
│   │       └── utils/                # Helpers
│   │
│   ├── network/                      # Network layer
│   │   └── src/main/java/
│   │       ├── ApiService.kt         # Retrofit service
│   │       ├── NetworkModule.kt      # Hilt module
│   │       ├── SSLPinning.kt         # Certificate pinning
│   │       ├── AuthInterceptor.kt    # Token interceptor
│   │       └── NetworkMonitor.kt     # Connectivity
│   │
│   ├── database/                     # Local database
│   │   └── src/main/java/
│   │       ├── PhuketDatabase.kt     # Room database
│   │       ├── dao/                  # DAOs
│   │       └── entities/             # Room entities
│   │
│   ├── datastore/                    # DataStore preferences
│   │   └── src/main/java/
│   │       ├── UserPreferences.kt
│   │       └── DataStoreModule.kt
│   │
│   └── security/                     # Security utilities
│       └── src/main/java/
│           ├── TokenManager.kt       # EncryptedSharedPreferences
│           └── SecurityModule.kt
│
├── domain/                           # Domain layer
│   └── src/main/java/
│       ├── model/                    # Domain models
│       │   ├── User.kt
│       │   ├── Vehicle.kt
│       │   ├── Property.kt
│       │   ├── Tour.kt
│       │   ├── Booking.kt
│       │   └── ChatMessage.kt
│       │
│       ├── repository/               # Repository interfaces
│       │   ├── VehicleRepository.kt
│       │   ├── PropertyRepository.kt
│       │   ├── TourRepository.kt
│       │   ├── BookingRepository.kt
│       │   └── AuthRepository.kt
│       │
│       └── usecase/                  # Use cases
│           ├── vehicle/
│           │   ├── GetVehiclesUseCase.kt
│           │   └── GetVehicleDetailUseCase.kt
│           ├── property/
│           ├── tour/
│           ├── booking/
│           └── auth/
│
├── data/                             # Data layer
│   └── src/main/java/
│       ├── remote/                   # Remote data sources
│       │   ├── api/
│       │   │   └── PhuketApiService.kt
│       │   ├── dto/                  # DTOs
│       │   │   ├── UserDto.kt
│       │   │   ├── VehicleDto.kt
│       │   │   └── ...
│       │   └── mapper/               # DTO to Domain mappers
│       │
│       ├── local/                    # Local data sources
│       │   ├── dao/
│       │   └── entity/
│       │
│       └── repository/               # Repository implementations
│           ├── VehicleRepositoryImpl.kt
│           ├── PropertyRepositoryImpl.kt
│           └── ...
│
├── feature/                          # Feature modules
│   ├── home/
│   │   └── src/main/java/
│   │       ├── HomeScreen.kt
│   │       ├── HomeViewModel.kt
│   │       └── components/
│   │
│   ├── transport/
│   │   └── src/main/java/
│   │       ├── TransportScreen.kt
│   │       ├── TransportViewModel.kt
│   │       ├── VehicleDetailScreen.kt
│   │       ├── VehicleDetailViewModel.kt
│   │       └── components/
│   │
│   ├── accommodation/
│   │   └── src/main/java/
│   │       ├── AccommodationScreen.kt
│   │       ├── AccommodationViewModel.kt
│   │       └── ...
│   │
│   ├── tours/
│   │   └── src/main/java/
│   │       ├── ToursScreen.kt
│   │       ├── ToursViewModel.kt
│   │       └── ...
│   │
│   ├── auth/
│   │   └── src/main/java/
│   │       ├── LoginScreen.kt
│   │       ├── RegisterScreen.kt
│   │       ├── AuthViewModel.kt
│   │       └── ...
│   │
│   ├── profile/
│   │   └── src/main/java/
│   │       ├── ProfileScreen.kt
│   │       ├── ProfileViewModel.kt
│   │       ├── BookingsScreen.kt
│   │       └── ...
│   │
│   ├── currency/
│   │   └── src/main/java/
│   │       ├── CurrencyScreen.kt
│   │       └── CurrencyViewModel.kt
│   │
│   └── ai_assistant/
│       └── src/main/java/
│           ├── AIAssistantScreen.kt
│           ├── AIAssistantViewModel.kt
│           └── components/
│
└── designsystem/                     # Design system
    └── src/main/java/
        ├── theme/
        │   ├── Color.kt
        │   ├── Typography.kt
        │   ├── Theme.kt
        │   └── Shapes.kt
        │
        └── components/               # Reusable composables
            ├── PhuketButton.kt
            ├── PhuketCard.kt
            ├── PhuketTextField.kt
            ├── RatingBar.kt
            ├── SearchBar.kt
            ├── LoadingIndicator.kt
            └── EmptyState.kt
```

---

## 3. Ключевые компоненты

### 3.1 Network Layer (Retrofit + OkHttp)

```kotlin
// core/network/api/PhuketApiService.kt
interface PhuketApiService {

    // Auth
    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<AuthResponse>

    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>

    @POST("auth/refresh")
    suspend fun refreshToken(@Body request: RefreshTokenRequest): Response<AuthResponse>

    // Vehicles
    @GET("vehicles")
    suspend fun getVehicles(
        @Query("type") type: String? = null,
        @Query("min_price") minPrice: Double? = null,
        @Query("max_price") maxPrice: Double? = null,
        @Query("available_only") availableOnly: Boolean = false,
        @Query("page") page: Int = 1,
        @Query("per_page") perPage: Int = 20
    ): Response<PaginatedResponse<VehicleDto>>

    @GET("vehicles/{id}")
    suspend fun getVehicle(@Path("id") id: String): Response<VehicleDto>

    // Properties
    @GET("properties")
    suspend fun getProperties(
        @Query("type") type: String? = null,
        @Query("area") area: String? = null,
        @Query("bedrooms") bedrooms: Int? = null,
        @Query("min_price") minPrice: Double? = null,
        @Query("max_price") maxPrice: Double? = null,
        @Query("page") page: Int = 1,
        @Query("per_page") perPage: Int = 20
    ): Response<PaginatedResponse<PropertyDto>>

    @GET("properties/{id}")
    suspend fun getProperty(@Path("id") id: String): Response<PropertyDto>

    // Tours
    @GET("tours")
    suspend fun getTours(
        @Query("category") category: String? = null,
        @Query("min_price") minPrice: Double? = null,
        @Query("max_price") maxPrice: Double? = null,
        @Query("date") date: String? = null,
        @Query("page") page: Int = 1,
        @Query("per_page") perPage: Int = 20
    ): Response<PaginatedResponse<TourDto>>

    @GET("tours/{id}")
    suspend fun getTour(@Path("id") id: String): Response<TourDto>

    // Bookings
    @POST("bookings")
    suspend fun createBooking(@Body request: CreateBookingRequest): Response<BookingDto>

    @GET("bookings")
    suspend fun getUserBookings(): Response<List<BookingDto>>

    @GET("bookings/{id}")
    suspend fun getBooking(@Path("id") id: String): Response<BookingDto>

    @POST("bookings/{id}/cancel")
    suspend fun cancelBooking(
        @Path("id") id: String,
        @Body request: CancelBookingRequest? = null
    ): Response<BookingDto>

    // AI
    @POST("ai/chat")
    suspend fun sendAIMessage(@Body request: AIMessageRequest): Response<AIMessageResponse>

    // Currency
    @GET("currency/rates")
    suspend fun getCurrencyRates(): Response<CurrencyRatesResponse>

    // Weather
    @GET("weather")
    suspend fun getWeather(): Response<WeatherResponse>

    // Search
    @GET("search")
    suspend fun globalSearch(
        @Query("q") query: String,
        @Query("limit") limit: Int = 10
    ): Response<SearchResponse>

    // User
    @GET("users/me")
    suspend fun getCurrentUser(): Response<UserDto>

    @PUT("users/me")
    suspend fun updateProfile(@Body request: UpdateProfileRequest): Response<UserDto>

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
}
```

### 3.2 Network Module (Hilt)

```kotlin
// core/network/di/NetworkModule.kt
@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

    private const val BASE_URL = "https://api.phuket-app.com/v1/"

    @Provides
    @Singleton
    fun provideOkHttpClient(
        tokenManager: TokenManager,
        networkMonitor: NetworkMonitor
    ): OkHttpClient {
        return OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            // SSL Pinning
            .certificatePinner(createCertificatePinner())
            // Auth interceptor
            .addInterceptor(AuthInterceptor(tokenManager))
            // Logging
            .addInterceptor(HttpLoggingInterceptor().apply {
                level = if (BuildConfig.DEBUG) {
                    HttpLoggingInterceptor.Level.BODY
                } else {
                    HttpLoggingInterceptor.Level.NONE
                }
            })
            // Network connectivity interceptor
            .addInterceptor(ConnectivityInterceptor(networkMonitor))
            .build()
    }

    private fun createCertificatePinner(): CertificatePinner {
        return CertificatePinner.Builder()
            // Primary certificate
            .add("api.phuket-app.com", "sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=")
            // Backup certificate
            .add("api.phuket-app.com", "sha256/BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=")
            .build()
    }

    @Provides
    @Singleton
    fun provideRetrofit(okHttpClient: OkHttpClient): Retrofit {
        return Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create(
                GsonBuilder()
                    .setDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'")
                    .create()
            ))
            .build()
    }

    @Provides
    @Singleton
    fun providePhuketApiService(retrofit: Retrofit): PhuketApiService {
        return retrofit.create(PhuketApiService::class.java)
    }
}
```

### 3.3 Auth Interceptor

```kotlin
// core/network/interceptor/AuthInterceptor.kt
class AuthInterceptor @Inject constructor(
    private val tokenManager: TokenManager
) : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {
        val originalRequest = chain.request()

        // Skip auth for login/register endpoints
        if (originalRequest.url.encodedPath.contains("/auth/login") ||
            originalRequest.url.encodedPath.contains("/auth/register")) {
            return chain.proceed(originalRequest)
        }

        val accessToken = tokenManager.getAccessToken()

        val request = if (accessToken != null) {
            originalRequest.newBuilder()
                .header("Authorization", "Bearer $accessToken")
                .header("Content-Type", "application/json")
                .header("Accept", "application/json")
                .header("Accept-Language", Locale.getDefault().toLanguageTag())
                .build()
        } else {
            originalRequest
        }

        var response = chain.proceed(request)

        // Handle 401 - Token expired
        if (response.code == 401) {
            response.close()

            val refreshToken = tokenManager.getRefreshToken()
            if (refreshToken != null) {
                // Try to refresh token synchronously
                val newTokens = refreshTokenSync(refreshToken)
                if (newTokens != null) {
                    tokenManager.saveTokens(newTokens.accessToken, newTokens.refreshToken)

                    // Retry with new token
                    val newRequest = originalRequest.newBuilder()
                        .header("Authorization", "Bearer ${newTokens.accessToken}")
                        .build()
                    response = chain.proceed(newRequest)
                } else {
                    // Refresh failed - logout user
                    tokenManager.clearTokens()
                }
            }
        }

        return response
    }

    private fun refreshTokenSync(refreshToken: String): AuthResponse? {
        // Implementation of sync token refresh
        return null // Simplified
    }
}
```

### 3.4 Token Manager (Encrypted Storage)

```kotlin
// core/security/TokenManager.kt
@Singleton
class TokenManager @Inject constructor(
    @ApplicationContext private val context: Context
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

    companion object {
        private const val KEY_ACCESS_TOKEN = "access_token"
        private const val KEY_REFRESH_TOKEN = "refresh_token"
        private const val KEY_TOKEN_EXPIRY = "token_expiry"
    }

    fun saveTokens(accessToken: String, refreshToken: String, expiresIn: Long = 1800) {
        encryptedPrefs.edit()
            .putString(KEY_ACCESS_TOKEN, accessToken)
            .putString(KEY_REFRESH_TOKEN, refreshToken)
            .putLong(KEY_TOKEN_EXPIRY, System.currentTimeMillis() + (expiresIn * 1000))
            .apply()
    }

    fun getAccessToken(): String? {
        val expiry = encryptedPrefs.getLong(KEY_TOKEN_EXPIRY, 0)
        if (System.currentTimeMillis() > expiry) {
            return null // Token expired
        }
        return encryptedPrefs.getString(KEY_ACCESS_TOKEN, null)
    }

    fun getRefreshToken(): String? {
        return encryptedPrefs.getString(KEY_REFRESH_TOKEN, null)
    }

    fun clearTokens() {
        encryptedPrefs.edit()
            .remove(KEY_ACCESS_TOKEN)
            .remove(KEY_REFRESH_TOKEN)
            .remove(KEY_TOKEN_EXPIRY)
            .apply()
    }

    fun isLoggedIn(): Boolean {
        return getAccessToken() != null || getRefreshToken() != null
    }
}
```

### 3.5 Repository Implementation

```kotlin
// data/repository/VehicleRepositoryImpl.kt
@Singleton
class VehicleRepositoryImpl @Inject constructor(
    private val apiService: PhuketApiService,
    private val vehicleDao: VehicleDao,
    private val networkMonitor: NetworkMonitor
) : VehicleRepository {

    override fun getVehicles(
        type: VehicleType?,
        minPrice: Double?,
        maxPrice: Double?
    ): Flow<Result<List<Vehicle>>> = flow {
        emit(Result.Loading)

        // Try cache first
        val cachedVehicles = vehicleDao.getVehicles(type?.name)
        if (cachedVehicles.isNotEmpty()) {
            emit(Result.Success(cachedVehicles.map { it.toDomain() }))
        }

        // Fetch from network if online
        if (networkMonitor.isOnline()) {
            try {
                val response = apiService.getVehicles(
                    type = type?.name?.lowercase(),
                    minPrice = minPrice,
                    maxPrice = maxPrice
                )

                if (response.isSuccessful) {
                    val vehicles = response.body()?.data ?: emptyList()

                    // Cache results
                    vehicleDao.insertAll(vehicles.map { it.toEntity() })

                    emit(Result.Success(vehicles.map { it.toDomain() }))
                } else {
                    emit(Result.Error(parseApiError(response)))
                }
            } catch (e: Exception) {
                emit(Result.Error(e.toAppError()))
            }
        } else if (cachedVehicles.isEmpty()) {
            emit(Result.Error(AppError.NoConnection))
        }
    }.flowOn(Dispatchers.IO)

    override suspend fun getVehicle(id: String): Result<Vehicle> {
        return withContext(Dispatchers.IO) {
            try {
                // Try cache first
                vehicleDao.getVehicleById(id)?.let {
                    return@withContext Result.Success(it.toDomain())
                }

                // Fetch from network
                val response = apiService.getVehicle(id)
                if (response.isSuccessful) {
                    response.body()?.let { dto ->
                        vehicleDao.insert(dto.toEntity())
                        Result.Success(dto.toDomain())
                    } ?: Result.Error(AppError.NotFound)
                } else {
                    Result.Error(parseApiError(response))
                }
            } catch (e: Exception) {
                Result.Error(e.toAppError())
            }
        }
    }

    override fun searchVehicles(query: String): Flow<Result<List<Vehicle>>> = flow {
        emit(Result.Loading)

        try {
            val response = apiService.globalSearch(query)
            if (response.isSuccessful) {
                val vehicles = response.body()?.vehicles ?: emptyList()
                emit(Result.Success(vehicles.map { it.toDomain() }))
            } else {
                emit(Result.Error(parseApiError(response)))
            }
        } catch (e: Exception) {
            emit(Result.Error(e.toAppError()))
        }
    }.flowOn(Dispatchers.IO)
}
```

### 3.6 Use Case

```kotlin
// domain/usecase/vehicle/GetVehiclesUseCase.kt
class GetVehiclesUseCase @Inject constructor(
    private val vehicleRepository: VehicleRepository
) {
    operator fun invoke(
        type: VehicleType? = null,
        minPrice: Double? = null,
        maxPrice: Double? = null
    ): Flow<Result<List<Vehicle>>> {
        return vehicleRepository.getVehicles(type, minPrice, maxPrice)
    }
}
```

### 3.7 ViewModel

```kotlin
// feature/transport/TransportViewModel.kt
@HiltViewModel
class TransportViewModel @Inject constructor(
    private val getVehiclesUseCase: GetVehiclesUseCase,
    private val savedStateHandle: SavedStateHandle
) : ViewModel() {

    private val _uiState = MutableStateFlow(TransportUiState())
    val uiState: StateFlow<TransportUiState> = _uiState.asStateFlow()

    private val _events = Channel<TransportEvent>(Channel.BUFFERED)
    val events = _events.receiveAsFlow()

    init {
        loadVehicles()
    }

    fun loadVehicles() {
        viewModelScope.launch {
            getVehiclesUseCase(
                type = _uiState.value.selectedType,
                minPrice = _uiState.value.minPrice,
                maxPrice = _uiState.value.maxPrice
            ).collect { result ->
                when (result) {
                    is Result.Loading -> {
                        _uiState.update { it.copy(isLoading = true, error = null) }
                    }
                    is Result.Success -> {
                        _uiState.update {
                            it.copy(
                                isLoading = false,
                                vehicles = result.data,
                                error = null
                            )
                        }
                    }
                    is Result.Error -> {
                        _uiState.update {
                            it.copy(
                                isLoading = false,
                                error = result.error.toUiMessage()
                            )
                        }
                    }
                }
            }
        }
    }

    fun onTypeFilterChanged(type: VehicleType?) {
        _uiState.update { it.copy(selectedType = type) }
        loadVehicles()
    }

    fun onPriceFilterChanged(minPrice: Double?, maxPrice: Double?) {
        _uiState.update { it.copy(minPrice = minPrice, maxPrice = maxPrice) }
        loadVehicles()
    }

    fun onVehicleClicked(vehicle: Vehicle) {
        viewModelScope.launch {
            _events.send(TransportEvent.NavigateToDetail(vehicle.id))
        }
    }

    fun onRetry() {
        loadVehicles()
    }
}

data class TransportUiState(
    val isLoading: Boolean = false,
    val vehicles: List<Vehicle> = emptyList(),
    val selectedType: VehicleType? = null,
    val minPrice: Double? = null,
    val maxPrice: Double? = null,
    val error: String? = null
)

sealed interface TransportEvent {
    data class NavigateToDetail(val vehicleId: String) : TransportEvent
    data class ShowError(val message: String) : TransportEvent
}
```

### 3.8 Composable Screen

```kotlin
// feature/transport/TransportScreen.kt
@Composable
fun TransportScreen(
    viewModel: TransportViewModel = hiltViewModel(),
    onNavigateToDetail: (String) -> Unit
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    LaunchedEffect(Unit) {
        viewModel.events.collect { event ->
            when (event) {
                is TransportEvent.NavigateToDetail -> {
                    onNavigateToDetail(event.vehicleId)
                }
                is TransportEvent.ShowError -> {
                    // Show snackbar
                }
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Transport") },
                actions = {
                    IconButton(onClick = { /* Show filter */ }) {
                        Icon(Icons.Default.FilterList, contentDescription = "Filter")
                    }
                }
            )
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            when {
                uiState.isLoading && uiState.vehicles.isEmpty() -> {
                    LoadingIndicator(modifier = Modifier.align(Alignment.Center))
                }

                uiState.error != null && uiState.vehicles.isEmpty() -> {
                    ErrorState(
                        message = uiState.error!!,
                        onRetry = viewModel::onRetry,
                        modifier = Modifier.align(Alignment.Center)
                    )
                }

                uiState.vehicles.isEmpty() -> {
                    EmptyState(
                        message = "No vehicles found",
                        modifier = Modifier.align(Alignment.Center)
                    )
                }

                else -> {
                    VehicleList(
                        vehicles = uiState.vehicles,
                        onVehicleClick = viewModel::onVehicleClicked,
                        isLoading = uiState.isLoading
                    )
                }
            }
        }
    }
}

@Composable
private fun VehicleList(
    vehicles: List<Vehicle>,
    onVehicleClick: (Vehicle) -> Unit,
    isLoading: Boolean,
    modifier: Modifier = Modifier
) {
    LazyColumn(
        modifier = modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        items(vehicles, key = { it.id }) { vehicle ->
            VehicleCard(
                vehicle = vehicle,
                onClick = { onVehicleClick(vehicle) }
            )
        }

        if (isLoading) {
            item {
                Box(
                    modifier = Modifier.fillMaxWidth(),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(modifier = Modifier.padding(16.dp))
                }
            }
        }
    }
}

@Composable
fun VehicleCard(
    vehicle: Vehicle,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp)
        ) {
            // Vehicle image
            AsyncImage(
                model = vehicle.images.firstOrNull(),
                contentDescription = vehicle.model,
                modifier = Modifier
                    .size(100.dp)
                    .clip(RoundedCornerShape(8.dp)),
                contentScale = ContentScale.Crop
            )

            Spacer(modifier = Modifier.width(12.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "${vehicle.brand} ${vehicle.model}",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )

                Text(
                    text = vehicle.type.displayName,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )

                Spacer(modifier = Modifier.height(4.dp))

                // Rating
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        Icons.Default.Star,
                        contentDescription = null,
                        tint = Color(0xFFFFB800),
                        modifier = Modifier.size(16.dp)
                    )
                    Text(
                        text = "${vehicle.rating} (${vehicle.reviewsCount})",
                        style = MaterialTheme.typography.bodySmall
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    text = "฿${vehicle.pricePerDay}/day",
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.primary,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}
```

---

## 4. Domain Models

```kotlin
// domain/model/Vehicle.kt
data class Vehicle(
    val id: String,
    val type: VehicleType,
    val brand: String,
    val model: String,
    val year: Int,
    val pricePerDay: Double,
    val pricePerWeek: Double?,
    val pricePerMonth: Double?,
    val latitude: Double,
    val longitude: Double,
    val images: List<String>,
    val features: List<String>,
    val isAvailable: Boolean,
    val rating: Double,
    val reviewsCount: Int,
    val rentalCompany: String,
    val engineCapacity: Int?,
    val fuelType: String?,
    val transmission: String?
)

enum class VehicleType(val displayName: String) {
    SCOOTER("Scooter"),
    MOTORCYCLE("Motorcycle"),
    CAR("Car"),
    SUV("SUV"),
    VAN("Van")
}

// domain/model/Property.kt
data class Property(
    val id: String,
    val type: PropertyType,
    val title: String,
    val description: String,
    val pricePerNight: Double,
    val pricePerMonth: Double?,
    val latitude: Double,
    val longitude: Double,
    val address: String,
    val area: String,
    val images: List<String>,
    val amenities: List<String>,
    val bedrooms: Int,
    val bathrooms: Int,
    val maxGuests: Int,
    val minStay: Int,
    val rating: Double,
    val reviewsCount: Int,
    val hostName: String,
    val isSuperhost: Boolean,
    val isInstantBook: Boolean
)

enum class PropertyType(val displayName: String) {
    VILLA("Villa"),
    CONDO("Condo"),
    APARTMENT("Apartment"),
    HOUSE("House"),
    HOTEL("Hotel")
}

// domain/model/Tour.kt
data class Tour(
    val id: String,
    val title: String,
    val shortDescription: String,
    val description: String,
    val category: TourCategory,
    val price: Double,
    val duration: Long, // in seconds
    val durationFormatted: String,
    val maxParticipants: Int,
    val minParticipants: Int,
    val meetingPoint: String,
    val meetingLatitude: Double,
    val meetingLongitude: Double,
    val images: List<String>,
    val includes: List<String>,
    val excludes: List<String>,
    val rating: Double,
    val reviewsCount: Int,
    val operatorName: String,
    val isBestseller: Boolean,
    val availableDates: List<LocalDate>
)

enum class TourCategory(val displayName: String) {
    ISLAND("Island Tours"),
    ADVENTURE("Adventure"),
    CULTURAL("Cultural"),
    DIVING("Diving"),
    FOOD("Food Tours"),
    NATURE("Nature")
}

// domain/model/Booking.kt
data class Booking(
    val id: String,
    val userId: String,
    val itemId: String,
    val itemType: BookingItemType,
    val itemTitle: String,
    val itemImageUrl: String?,
    val startDate: LocalDate,
    val endDate: LocalDate,
    val totalPrice: Double,
    val currency: String,
    val status: BookingStatus,
    val paymentStatus: PaymentStatus,
    val guestsCount: Int,
    val notes: String?,
    val confirmationCode: String,
    val createdAt: Instant,
    val cancelledAt: Instant?,
    val cancellationReason: String?
)

enum class BookingItemType {
    VEHICLE, PROPERTY, TOUR
}

enum class BookingStatus {
    PENDING, CONFIRMED, COMPLETED, CANCELLED
}

enum class PaymentStatus {
    PENDING, PAID, REFUNDED, FAILED
}

// domain/model/User.kt
data class User(
    val id: String,
    val email: String,
    val name: String,
    val phone: String?,
    val avatarUrl: String?,
    val preferences: UserPreferences,
    val loyaltyLevel: LoyaltyLevel,
    val loyaltyPoints: Int,
    val favoriteVehicles: List<String>,
    val favoriteProperties: List<String>,
    val favoriteTours: List<String>,
    val isActive: Boolean,
    val createdAt: Instant
)

data class UserPreferences(
    val language: String = "en",
    val currency: String = "THB",
    val notificationsEnabled: Boolean = true,
    val darkModeEnabled: Boolean = false
)

enum class LoyaltyLevel(val discount: Int, val multiplier: Double) {
    BRONZE(0, 1.0),
    SILVER(3, 1.25),
    GOLD(5, 1.5),
    PLATINUM(10, 2.0)
}
```

---

## 5. Navigation

```kotlin
// app/navigation/MainNavGraph.kt
@Composable
fun MainNavGraph(
    navController: NavHostController = rememberNavController(),
    startDestination: String = Screen.Home.route
) {
    NavHost(
        navController = navController,
        startDestination = startDestination
    ) {
        // Home
        composable(route = Screen.Home.route) {
            HomeScreen(
                onNavigateToTransport = { navController.navigate(Screen.Transport.route) },
                onNavigateToAccommodation = { navController.navigate(Screen.Accommodation.route) },
                onNavigateToTours = { navController.navigate(Screen.Tours.route) },
                onNavigateToAI = { navController.navigate(Screen.AIAssistant.route) }
            )
        }

        // Transport
        composable(route = Screen.Transport.route) {
            TransportScreen(
                onNavigateToDetail = { vehicleId ->
                    navController.navigate(Screen.VehicleDetail.createRoute(vehicleId))
                }
            )
        }

        composable(
            route = Screen.VehicleDetail.route,
            arguments = listOf(navArgument("vehicleId") { type = NavType.StringType })
        ) {
            VehicleDetailScreen(
                onNavigateBack = { navController.popBackStack() },
                onNavigateToBooking = { vehicleId, startDate, endDate ->
                    navController.navigate(
                        Screen.CreateBooking.createRoute("vehicle", vehicleId, startDate, endDate)
                    )
                }
            )
        }

        // Accommodation
        composable(route = Screen.Accommodation.route) {
            AccommodationScreen(
                onNavigateToDetail = { propertyId ->
                    navController.navigate(Screen.PropertyDetail.createRoute(propertyId))
                }
            )
        }

        composable(
            route = Screen.PropertyDetail.route,
            arguments = listOf(navArgument("propertyId") { type = NavType.StringType })
        ) {
            PropertyDetailScreen(
                onNavigateBack = { navController.popBackStack() },
                onNavigateToBooking = { propertyId, startDate, endDate ->
                    navController.navigate(
                        Screen.CreateBooking.createRoute("property", propertyId, startDate, endDate)
                    )
                }
            )
        }

        // Tours
        composable(route = Screen.Tours.route) {
            ToursScreen(
                onNavigateToDetail = { tourId ->
                    navController.navigate(Screen.TourDetail.createRoute(tourId))
                }
            )
        }

        composable(
            route = Screen.TourDetail.route,
            arguments = listOf(navArgument("tourId") { type = NavType.StringType })
        ) {
            TourDetailScreen(
                onNavigateBack = { navController.popBackStack() },
                onNavigateToBooking = { tourId, date, guests ->
                    navController.navigate(
                        Screen.CreateBooking.createRoute("tour", tourId, date, date, guests)
                    )
                }
            )
        }

        // Booking
        composable(
            route = Screen.CreateBooking.route,
            arguments = listOf(
                navArgument("itemType") { type = NavType.StringType },
                navArgument("itemId") { type = NavType.StringType },
                navArgument("startDate") { type = NavType.StringType },
                navArgument("endDate") { type = NavType.StringType },
                navArgument("guests") { type = NavType.IntType; defaultValue = 1 }
            )
        ) {
            CreateBookingScreen(
                onNavigateBack = { navController.popBackStack() },
                onBookingCreated = { bookingId ->
                    navController.navigate(Screen.BookingDetail.createRoute(bookingId)) {
                        popUpTo(Screen.Home.route)
                    }
                }
            )
        }

        // Profile
        composable(route = Screen.Profile.route) {
            ProfileScreen(
                onNavigateToLogin = { navController.navigate(Screen.Login.route) },
                onNavigateToBookings = { navController.navigate(Screen.MyBookings.route) },
                onNavigateToFavorites = { navController.navigate(Screen.Favorites.route) },
                onNavigateToSettings = { navController.navigate(Screen.Settings.route) }
            )
        }

        composable(route = Screen.MyBookings.route) {
            MyBookingsScreen(
                onNavigateToDetail = { bookingId ->
                    navController.navigate(Screen.BookingDetail.createRoute(bookingId))
                },
                onNavigateBack = { navController.popBackStack() }
            )
        }

        // Auth
        composable(route = Screen.Login.route) {
            LoginScreen(
                onNavigateToRegister = { navController.navigate(Screen.Register.route) },
                onLoginSuccess = {
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                }
            )
        }

        composable(route = Screen.Register.route) {
            RegisterScreen(
                onNavigateToLogin = { navController.popBackStack() },
                onRegisterSuccess = {
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Register.route) { inclusive = true }
                    }
                }
            )
        }

        // AI Assistant
        composable(route = Screen.AIAssistant.route) {
            AIAssistantScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }

        // Currency
        composable(route = Screen.Currency.route) {
            CurrencyScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }
    }
}

sealed class Screen(val route: String) {
    object Home : Screen("home")
    object Transport : Screen("transport")
    object VehicleDetail : Screen("vehicle/{vehicleId}") {
        fun createRoute(vehicleId: String) = "vehicle/$vehicleId"
    }
    object Accommodation : Screen("accommodation")
    object PropertyDetail : Screen("property/{propertyId}") {
        fun createRoute(propertyId: String) = "property/$propertyId"
    }
    object Tours : Screen("tours")
    object TourDetail : Screen("tour/{tourId}") {
        fun createRoute(tourId: String) = "tour/$tourId"
    }
    object CreateBooking : Screen("booking/create/{itemType}/{itemId}/{startDate}/{endDate}?guests={guests}") {
        fun createRoute(
            itemType: String,
            itemId: String,
            startDate: String,
            endDate: String,
            guests: Int = 1
        ) = "booking/create/$itemType/$itemId/$startDate/$endDate?guests=$guests"
    }
    object BookingDetail : Screen("booking/{bookingId}") {
        fun createRoute(bookingId: String) = "booking/$bookingId"
    }
    object MyBookings : Screen("bookings")
    object Profile : Screen("profile")
    object Favorites : Screen("favorites")
    object Settings : Screen("settings")
    object Login : Screen("login")
    object Register : Screen("register")
    object AIAssistant : Screen("ai-assistant")
    object Currency : Screen("currency")
}
```

---

## 6. Room Database

```kotlin
// core/database/PhuketDatabase.kt
@Database(
    entities = [
        VehicleEntity::class,
        PropertyEntity::class,
        TourEntity::class,
        BookingEntity::class,
        CachedUserEntity::class
    ],
    version = 1,
    exportSchema = true
)
@TypeConverters(Converters::class)
abstract class PhuketDatabase : RoomDatabase() {

    abstract fun vehicleDao(): VehicleDao
    abstract fun propertyDao(): PropertyDao
    abstract fun tourDao(): TourDao
    abstract fun bookingDao(): BookingDao
    abstract fun userDao(): UserDao

    companion object {
        const val DATABASE_NAME = "phuket_db"
    }
}

// Vehicle Entity
@Entity(tableName = "vehicles")
data class VehicleEntity(
    @PrimaryKey
    val id: String,
    val type: String,
    val brand: String,
    val model: String,
    val year: Int,
    val pricePerDay: Double,
    val pricePerWeek: Double?,
    val pricePerMonth: Double?,
    val latitude: Double,
    val longitude: Double,
    val images: List<String>,
    val features: List<String>,
    val isAvailable: Boolean,
    val rating: Double,
    val reviewsCount: Int,
    val rentalCompany: String,
    val engineCapacity: Int?,
    val fuelType: String?,
    val transmission: String?,
    val cachedAt: Long = System.currentTimeMillis()
)

// Vehicle DAO
@Dao
interface VehicleDao {

    @Query("SELECT * FROM vehicles WHERE (:type IS NULL OR type = :type) ORDER BY pricePerDay ASC")
    suspend fun getVehicles(type: String?): List<VehicleEntity>

    @Query("SELECT * FROM vehicles WHERE id = :id")
    suspend fun getVehicleById(id: String): VehicleEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(vehicle: VehicleEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(vehicles: List<VehicleEntity>)

    @Query("DELETE FROM vehicles WHERE cachedAt < :threshold")
    suspend fun deleteOldCache(threshold: Long)

    @Query("DELETE FROM vehicles")
    suspend fun deleteAll()
}

// Type Converters
class Converters {

    @TypeConverter
    fun fromStringList(value: List<String>): String {
        return Gson().toJson(value)
    }

    @TypeConverter
    fun toStringList(value: String): List<String> {
        val listType = object : TypeToken<List<String>>() {}.type
        return Gson().fromJson(value, listType)
    }

    @TypeConverter
    fun fromLocalDate(date: LocalDate?): String? {
        return date?.toString()
    }

    @TypeConverter
    fun toLocalDate(value: String?): LocalDate? {
        return value?.let { LocalDate.parse(it) }
    }

    @TypeConverter
    fun fromInstant(instant: Instant?): Long? {
        return instant?.toEpochMilli()
    }

    @TypeConverter
    fun toInstant(value: Long?): Instant? {
        return value?.let { Instant.ofEpochMilli(it) }
    }
}
```

---

## 7. Error Handling

```kotlin
// core/common/result/Result.kt
sealed class Result<out T> {
    data class Success<T>(val data: T) : Result<T>()
    data class Error(val error: AppError) : Result<Nothing>()
    object Loading : Result<Nothing>()

    val isSuccess get() = this is Success
    val isError get() = this is Error
    val isLoading get() = this is Loading

    fun getOrNull(): T? = when (this) {
        is Success -> data
        else -> null
    }

    fun errorOrNull(): AppError? = when (this) {
        is Error -> error
        else -> null
    }
}

// core/common/error/AppError.kt
sealed class AppError : Exception() {
    object NoConnection : AppError()
    object Timeout : AppError()
    object ServerError : AppError()
    object NotFound : AppError()
    object Unauthorized : AppError()
    object Forbidden : AppError()
    object RateLimited : AppError()
    data class ValidationError(val field: String, override val message: String) : AppError()
    data class ApiError(val code: String, override val message: String) : AppError()
    data class Unknown(override val cause: Throwable?) : AppError()

    fun toUiMessage(): String = when (this) {
        is NoConnection -> "No internet connection. Please check your network."
        is Timeout -> "Request timed out. Please try again."
        is ServerError -> "Server error. Please try again later."
        is NotFound -> "Resource not found."
        is Unauthorized -> "Session expired. Please login again."
        is Forbidden -> "You don't have permission to perform this action."
        is RateLimited -> "Too many requests. Please wait a moment."
        is ValidationError -> message
        is ApiError -> message
        is Unknown -> "Something went wrong. Please try again."
    }
}

// Extension functions
fun Throwable.toAppError(): AppError = when (this) {
    is UnknownHostException, is ConnectException -> AppError.NoConnection
    is SocketTimeoutException -> AppError.Timeout
    is HttpException -> {
        when (code()) {
            401 -> AppError.Unauthorized
            403 -> AppError.Forbidden
            404 -> AppError.NotFound
            429 -> AppError.RateLimited
            in 500..599 -> AppError.ServerError
            else -> AppError.Unknown(this)
        }
    }
    else -> AppError.Unknown(this)
}

fun <T> Response<T>.parseApiError(): AppError {
    return try {
        val errorBody = errorBody()?.string()
        val errorResponse = Gson().fromJson(errorBody, ApiErrorResponse::class.java)
        AppError.ApiError(
            code = errorResponse.error.code,
            message = errorResponse.error.message
        )
    } catch (e: Exception) {
        when (code()) {
            401 -> AppError.Unauthorized
            403 -> AppError.Forbidden
            404 -> AppError.NotFound
            429 -> AppError.RateLimited
            in 500..599 -> AppError.ServerError
            else -> AppError.Unknown(null)
        }
    }
}

data class ApiErrorResponse(
    val error: ApiErrorDetail,
    val meta: ApiMeta?
)

data class ApiErrorDetail(
    val code: String,
    val message: String,
    val details: List<FieldError>?
)

data class FieldError(
    val field: String,
    val message: String
)

data class ApiMeta(
    val requestId: String?,
    val timestamp: String?
)
```

---

## 8. Push Notifications (Firebase)

```kotlin
// core/notification/PhuketFirebaseService.kt
@AndroidEntryPoint
class PhuketFirebaseService : FirebaseMessagingService() {

    @Inject
    lateinit var tokenManager: TokenManager

    @Inject
    lateinit var notificationHelper: NotificationHelper

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        // Send token to backend
        CoroutineScope(Dispatchers.IO).launch {
            try {
                // apiService.registerDeviceToken(token)
            } catch (e: Exception) {
                Log.e("FCM", "Failed to register token", e)
            }
        }
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)

        val data = remoteMessage.data
        val notification = remoteMessage.notification

        when (data["type"]) {
            "booking_confirmed" -> {
                notificationHelper.showBookingConfirmedNotification(
                    bookingId = data["booking_id"] ?: "",
                    title = notification?.title ?: "Booking Confirmed",
                    body = notification?.body ?: ""
                )
            }
            "booking_reminder" -> {
                notificationHelper.showBookingReminderNotification(
                    bookingId = data["booking_id"] ?: "",
                    title = notification?.title ?: "Reminder",
                    body = notification?.body ?: ""
                )
            }
            "tour_reminder" -> {
                notificationHelper.showTourReminderNotification(
                    bookingId = data["booking_id"] ?: "",
                    title = notification?.title ?: "Tour Tomorrow",
                    body = notification?.body ?: "",
                    meetingPoint = data["meeting_point"]
                )
            }
            else -> {
                notificationHelper.showGenericNotification(
                    title = notification?.title ?: "Phuket App",
                    body = notification?.body ?: ""
                )
            }
        }
    }
}

// NotificationHelper.kt
@Singleton
class NotificationHelper @Inject constructor(
    @ApplicationContext private val context: Context
) {
    companion object {
        const val CHANNEL_BOOKINGS = "bookings"
        const val CHANNEL_REMINDERS = "reminders"
        const val CHANNEL_GENERAL = "general"
    }

    init {
        createNotificationChannels()
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val notificationManager = context.getSystemService(NotificationManager::class.java)

            val bookingsChannel = NotificationChannel(
                CHANNEL_BOOKINGS,
                "Bookings",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Booking confirmations and updates"
            }

            val remindersChannel = NotificationChannel(
                CHANNEL_REMINDERS,
                "Reminders",
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = "Booking reminders"
            }

            val generalChannel = NotificationChannel(
                CHANNEL_GENERAL,
                "General",
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = "General notifications"
            }

            notificationManager.createNotificationChannels(
                listOf(bookingsChannel, remindersChannel, generalChannel)
            )
        }
    }

    fun showBookingConfirmedNotification(bookingId: String, title: String, body: String) {
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            putExtra("deep_link", "phuketapp://booking/$bookingId")
        }

        val pendingIntent = PendingIntent.getActivity(
            context, 0, intent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        val notification = NotificationCompat.Builder(context, CHANNEL_BOOKINGS)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle(title)
            .setContentText(body)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .build()

        NotificationManagerCompat.from(context)
            .notify(bookingId.hashCode(), notification)
    }

    // Other notification methods...
}
```

---

## 9. Testing

### 9.1 Testing Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          TESTING PYRAMID                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                              ┌────────┐                                    │
│                             /│  E2E   │\                                   │
│                            / │ Tests  │ \                                  │
│                           /  └────────┘  \                                 │
│                          /   (Espresso)   \                                │
│                         /                  \                               │
│                        /    ┌──────────┐    \                              │
│                       /     │Integration│    \                             │
│                      /      │  Tests   │     \                             │
│                     /       └──────────┘      \                            │
│                    /   (Repository + Network)  \                           │
│                   /                              \                         │
│                  /      ┌────────────────┐        \                        │
│                 /       │   Unit Tests   │         \                       │
│                /        │                │          \                      │
│               /         └────────────────┘           \                     │
│              /    (ViewModel, UseCase, Repository)    \                    │
│             /                                           \                  │
│            └─────────────────────────────────────────────┘                 │
│                                                                             │
│  Coverage Targets:                                                         │
│  • Unit Tests: 80%                                                        │
│  • Integration Tests: 60%                                                 │
│  • E2E Tests: Critical flows (auth, booking)                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 9.2 Unit Test Example

```kotlin
// feature/transport/TransportViewModelTest.kt
@OptIn(ExperimentalCoroutinesApi::class)
class TransportViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private lateinit var viewModel: TransportViewModel
    private lateinit var getVehiclesUseCase: GetVehiclesUseCase
    private lateinit var vehicleRepository: FakeVehicleRepository

    @Before
    fun setup() {
        vehicleRepository = FakeVehicleRepository()
        getVehiclesUseCase = GetVehiclesUseCase(vehicleRepository)
        viewModel = TransportViewModel(getVehiclesUseCase, SavedStateHandle())
    }

    @Test
    fun `loadVehicles success updates uiState with vehicles`() = runTest {
        // Given
        val vehicles = listOf(
            Vehicle(id = "1", brand = "Honda", model = "PCX", /* ... */),
            Vehicle(id = "2", brand = "Yamaha", model = "NMAX", /* ... */)
        )
        vehicleRepository.setVehicles(vehicles)

        // When
        viewModel.loadVehicles()

        // Then
        val uiState = viewModel.uiState.value
        assertFalse(uiState.isLoading)
        assertNull(uiState.error)
        assertEquals(2, uiState.vehicles.size)
        assertEquals("Honda", uiState.vehicles[0].brand)
    }

    @Test
    fun `loadVehicles error updates uiState with error message`() = runTest {
        // Given
        vehicleRepository.setShouldReturnError(true)

        // When
        viewModel.loadVehicles()

        // Then
        val uiState = viewModel.uiState.value
        assertFalse(uiState.isLoading)
        assertNotNull(uiState.error)
        assertTrue(uiState.vehicles.isEmpty())
    }

    @Test
    fun `onTypeFilterChanged updates filter and reloads vehicles`() = runTest {
        // Given
        val scooters = listOf(
            Vehicle(id = "1", type = VehicleType.SCOOTER, /* ... */)
        )
        vehicleRepository.setVehicles(scooters)

        // When
        viewModel.onTypeFilterChanged(VehicleType.SCOOTER)

        // Then
        val uiState = viewModel.uiState.value
        assertEquals(VehicleType.SCOOTER, uiState.selectedType)
        assertEquals(1, uiState.vehicles.size)
    }
}

// Fake Repository for testing
class FakeVehicleRepository : VehicleRepository {
    private var vehicles = emptyList<Vehicle>()
    private var shouldReturnError = false

    fun setVehicles(vehicles: List<Vehicle>) {
        this.vehicles = vehicles
    }

    fun setShouldReturnError(value: Boolean) {
        shouldReturnError = value
    }

    override fun getVehicles(
        type: VehicleType?,
        minPrice: Double?,
        maxPrice: Double?
    ): Flow<Result<List<Vehicle>>> = flow {
        emit(Result.Loading)
        delay(100)

        if (shouldReturnError) {
            emit(Result.Error(AppError.ServerError))
        } else {
            val filtered = vehicles.filter { vehicle ->
                (type == null || vehicle.type == type) &&
                (minPrice == null || vehicle.pricePerDay >= minPrice) &&
                (maxPrice == null || vehicle.pricePerDay <= maxPrice)
            }
            emit(Result.Success(filtered))
        }
    }

    override suspend fun getVehicle(id: String): Result<Vehicle> {
        if (shouldReturnError) return Result.Error(AppError.ServerError)
        return vehicles.find { it.id == id }
            ?.let { Result.Success(it) }
            ?: Result.Error(AppError.NotFound)
    }

    override fun searchVehicles(query: String): Flow<Result<List<Vehicle>>> = flow {
        emit(Result.Loading)
        val results = vehicles.filter {
            it.brand.contains(query, ignoreCase = true) ||
            it.model.contains(query, ignoreCase = true)
        }
        emit(Result.Success(results))
    }
}

// MainDispatcherRule for testing coroutines
@OptIn(ExperimentalCoroutinesApi::class)
class MainDispatcherRule(
    private val testDispatcher: TestDispatcher = UnconfinedTestDispatcher()
) : TestWatcher() {

    override fun starting(description: Description) {
        Dispatchers.setMain(testDispatcher)
    }

    override fun finished(description: Description) {
        Dispatchers.resetMain()
    }
}
```

---

## 10. Dependencies (build.gradle.kts)

```kotlin
// gradle/libs.versions.toml
[versions]
kotlin = "1.9.21"
agp = "8.2.0"
compose-bom = "2024.01.00"
compose-compiler = "1.5.7"
hilt = "2.50"
retrofit = "2.9.0"
okhttp = "4.12.0"
room = "2.6.1"
navigation = "2.7.6"
lifecycle = "2.7.0"
coroutines = "1.7.3"
coil = "2.5.0"
datastore = "1.0.0"
security-crypto = "1.1.0-alpha06"
firebase-bom = "32.7.0"

[libraries]
# Compose
compose-bom = { group = "androidx.compose", name = "compose-bom", version.ref = "compose-bom" }
compose-ui = { group = "androidx.compose.ui", name = "ui" }
compose-ui-graphics = { group = "androidx.compose.ui", name = "ui-graphics" }
compose-ui-tooling = { group = "androidx.compose.ui", name = "ui-tooling" }
compose-ui-tooling-preview = { group = "androidx.compose.ui", name = "ui-tooling-preview" }
compose-material3 = { group = "androidx.compose.material3", name = "material3" }
compose-material-icons = { group = "androidx.compose.material", name = "material-icons-extended" }

# Navigation
navigation-compose = { group = "androidx.navigation", name = "navigation-compose", version.ref = "navigation" }

# Hilt
hilt-android = { group = "com.google.dagger", name = "hilt-android", version.ref = "hilt" }
hilt-compiler = { group = "com.google.dagger", name = "hilt-compiler", version.ref = "hilt" }
hilt-navigation-compose = { group = "androidx.hilt", name = "hilt-navigation-compose", version = "1.1.0" }

# Lifecycle
lifecycle-runtime-ktx = { group = "androidx.lifecycle", name = "lifecycle-runtime-ktx", version.ref = "lifecycle" }
lifecycle-viewmodel-compose = { group = "androidx.lifecycle", name = "lifecycle-viewmodel-compose", version.ref = "lifecycle" }
lifecycle-runtime-compose = { group = "androidx.lifecycle", name = "lifecycle-runtime-compose", version.ref = "lifecycle" }

# Network
retrofit = { group = "com.squareup.retrofit2", name = "retrofit", version.ref = "retrofit" }
retrofit-gson = { group = "com.squareup.retrofit2", name = "converter-gson", version.ref = "retrofit" }
okhttp = { group = "com.squareup.okhttp3", name = "okhttp", version.ref = "okhttp" }
okhttp-logging = { group = "com.squareup.okhttp3", name = "logging-interceptor", version.ref = "okhttp" }

# Room
room-runtime = { group = "androidx.room", name = "room-runtime", version.ref = "room" }
room-ktx = { group = "androidx.room", name = "room-ktx", version.ref = "room" }
room-compiler = { group = "androidx.room", name = "room-compiler", version.ref = "room" }

# DataStore
datastore-preferences = { group = "androidx.datastore", name = "datastore-preferences", version.ref = "datastore" }

# Security
security-crypto = { group = "androidx.security", name = "security-crypto", version.ref = "security-crypto" }

# Firebase
firebase-bom = { group = "com.google.firebase", name = "firebase-bom", version.ref = "firebase-bom" }
firebase-messaging = { group = "com.google.firebase", name = "firebase-messaging-ktx" }
firebase-analytics = { group = "com.google.firebase", name = "firebase-analytics-ktx" }

# Image loading
coil-compose = { group = "io.coil-kt", name = "coil-compose", version.ref = "coil" }

# Coroutines
coroutines-core = { group = "org.jetbrains.kotlinx", name = "kotlinx-coroutines-core", version.ref = "coroutines" }
coroutines-android = { group = "org.jetbrains.kotlinx", name = "kotlinx-coroutines-android", version.ref = "coroutines" }

# Testing
junit = { group = "junit", name = "junit", version = "4.13.2" }
coroutines-test = { group = "org.jetbrains.kotlinx", name = "kotlinx-coroutines-test", version.ref = "coroutines" }
mockk = { group = "io.mockk", name = "mockk", version = "1.13.8" }
turbine = { group = "app.cash.turbine", name = "turbine", version = "1.0.0" }

[bundles]
compose = ["compose-ui", "compose-ui-graphics", "compose-ui-tooling-preview", "compose-material3", "compose-material-icons"]
lifecycle = ["lifecycle-runtime-ktx", "lifecycle-viewmodel-compose", "lifecycle-runtime-compose"]
network = ["retrofit", "retrofit-gson", "okhttp", "okhttp-logging"]
room = ["room-runtime", "room-ktx"]

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
android-library = { id = "com.android.library", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
kotlin-kapt = { id = "org.jetbrains.kotlin.kapt", version.ref = "kotlin" }
hilt = { id = "com.google.dagger.hilt.android", version.ref = "hilt" }
ksp = { id = "com.google.devtools.ksp", version = "1.9.21-1.0.16" }
```

---

## 11. Coding Standards

### 11.1 Kotlin Style Guide

```kotlin
// File naming: PascalCase.kt
// VehicleDetailScreen.kt, TransportViewModel.kt

// Package naming: lowercase
// com.phuketapp.feature.transport

// Class naming: PascalCase
class TransportViewModel
data class Vehicle
sealed class Result

// Function naming: camelCase
fun loadVehicles()
suspend fun getVehicle(id: String): Result<Vehicle>

// Property naming: camelCase
val isLoading: Boolean
private val _uiState = MutableStateFlow(UiState())

// Constants: SCREAMING_SNAKE_CASE or camelCase for companion object
companion object {
    private const val TAG = "TransportViewModel"
    const val MAX_RETRY_COUNT = 3
}

// MARK sections equivalent: region/endregion or comments
// region UI State
data class TransportUiState(...)
// endregion

// Composable naming: PascalCase
@Composable
fun TransportScreen() { }

@Composable
private fun VehicleCard() { }

// Use trailing lambdas
items.forEach { item ->
    processItem(item)
}

// Use scope functions appropriately
vehicle?.let { v ->
    cache.save(v)
}

viewModel.apply {
    loadVehicles()
    setFilter(type)
}
```

---

## 12. Сравнение iOS и Android архитектур

| Аспект | iOS (SwiftUI) | Android (Kotlin) |
|--------|---------------|------------------|
| **UI Framework** | SwiftUI | Jetpack Compose |
| **Архитектура** | MVVM + Repository | MVVM + Clean Architecture |
| **DI** | Manual / Swinject | Hilt (Dagger) |
| **State Management** | @Published, @StateObject | StateFlow, MutableStateFlow |
| **Networking** | URLSession + async/await | Retrofit + Coroutines |
| **Local DB** | SwiftData / Core Data | Room |
| **Secure Storage** | Keychain | EncryptedSharedPreferences |
| **Navigation** | NavigationStack | Navigation Compose |
| **Image Loading** | AsyncImage (native) | Coil |
| **Push Notifications** | APNs + Firebase | Firebase Cloud Messaging |
| **SSL Pinning** | URLSessionDelegate | OkHttp CertificatePinner |

---

**Согласовано:**

| Роль | Имя | Подпись | Дата |
|------|-----|---------|------|
| Android Lead | | | |
| Tech Lead | | | |
| iOS Lead | | | |
| QA Lead | | | |
