# Request for Comments (RFC)
# Phuket App — Android

**Версия:** 1.0
**Дата:** 12 декабря 2025

---

## Оглавление

- [RFC-A01: Android Widgets для бронирований](#rfc-a01-android-widgets-для-бронирований)
- [RFC-A02: Google Pay интеграция](#rfc-a02-google-pay-интеграция)
- [RFC-A03: Offline режим с WorkManager](#rfc-a03-offline-режим-с-workmanager)
- [RFC-A04: Biometric Authentication](#rfc-a04-biometric-authentication)
- [RFC-A05: Google Maps SDK интеграция](#rfc-a05-google-maps-sdk-интеграция)

---

## RFC-A01: Android Widgets для бронирований

### Метаданные
| Поле | Значение |
|------|----------|
| **Статус** | Draft |
| **Автор** | Android Team |
| **Дата создания** | 12.12.2025 |
| **Deadline для комментариев** | 26.12.2025 |
| **Связанные PRD** | BOOK-001, PROF-002 |

### 1. Summary

Разработка Android App Widgets (Glance) для отображения предстоящих бронирований и быстрого доступа к приложению с домашнего экрана.

### 2. Motivation

**Текущее состояние:**
- Пользователи должны открывать приложение для просмотра бронирований
- Нет quick glance информации на домашнем экране
- iOS имеет аналогичный функционал (Widgets)

**Ожидаемые улучшения:**
- Быстрый доступ к информации о бронированиях
- Увеличение engagement с приложением
- Паритет функциональности с iOS версией
- Удобство для туристов в поездке

### 3. Detailed Design

#### 3.1 Widget Types

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         WIDGET DESIGNS                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  SMALL (2x2)                    MEDIUM (4x2)                               │
│  ┌───────────────┐              ┌────────────────────────────┐             │
│  │  Next Booking │              │  Upcoming Bookings          │             │
│  │               │              │                             │             │
│  │  Honda PCX    │              │  1. Honda PCX 160          │             │
│  │  Dec 15-22    │              │     Dec 15-22  ฿2,100      │             │
│  │               │              │                             │             │
│  │  [Open App]   │              │  2. Phi Phi Tour           │             │
│  └───────────────┘              │     Dec 18     ฿1,500      │             │
│                                 │                             │             │
│                                 │           [View All →]      │             │
│                                 └────────────────────────────┘             │
│                                                                             │
│  LARGE (4x4)                                                               │
│  ┌────────────────────────────────────────────┐                            │
│  │  Phuket App - Your Trip                    │                            │
│  │                                            │                            │
│  │  ┌──────────────────────────────────────┐ │                            │
│  │  │ Dec 15  Honda PCX 160    ฿2,100     │ │                            │
│  │  │         Patong Rentals               │ │                            │
│  │  └──────────────────────────────────────┘ │                            │
│  │  ┌──────────────────────────────────────┐ │                            │
│  │  │ Dec 18  Phi Phi Islands   ฿1,500    │ │                            │
│  │  │         9:00 AM Rassada Pier         │ │                            │
│  │  └──────────────────────────────────────┘ │                            │
│  │  ┌──────────────────────────────────────┐ │                            │
│  │  │ Dec 20  Sunset Villa      ฿3,200    │ │                            │
│  │  │         Check-in 2:00 PM             │ │                            │
│  │  └──────────────────────────────────────┘ │                            │
│  │                                            │                            │
│  │  [+ New Booking]        [View All →]      │                            │
│  └────────────────────────────────────────────┘                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 3.2 Implementation (Jetpack Glance)

```kotlin
// widget/BookingsWidget.kt
class BookingsWidget : GlanceAppWidget() {

    override val sizeMode = SizeMode.Responsive(
        setOf(
            DpSize(110.dp, 110.dp),  // Small
            DpSize(250.dp, 110.dp),  // Medium
            DpSize(250.dp, 250.dp)   // Large
        )
    )

    override suspend fun provideGlance(context: Context, id: GlanceId) {
        provideContent {
            val bookings = getUpcomingBookings()
            BookingsWidgetContent(bookings)
        }
    }

    @Composable
    private fun BookingsWidgetContent(bookings: List<Booking>) {
        val size = LocalSize.current

        GlanceTheme {
            when {
                size.width < 200.dp -> SmallWidget(bookings.firstOrNull())
                size.height < 200.dp -> MediumWidget(bookings.take(2))
                else -> LargeWidget(bookings.take(3))
            }
        }
    }

    @Composable
    private fun SmallWidget(booking: Booking?) {
        Column(
            modifier = GlanceModifier
                .fillMaxSize()
                .background(GlanceTheme.colors.surface)
                .padding(12.dp)
                .cornerRadius(16.dp)
        ) {
            Text(
                text = "Next Booking",
                style = TextStyle(
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp
                )
            )

            Spacer(modifier = GlanceModifier.height(8.dp))

            if (booking != null) {
                Text(text = booking.itemTitle)
                Text(
                    text = "${booking.startDate.format()} - ${booking.endDate.format()}",
                    style = TextStyle(fontSize = 12.sp)
                )
            } else {
                Text(
                    text = "No upcoming bookings",
                    style = TextStyle(fontSize = 12.sp)
                )
            }

            Spacer(modifier = GlanceModifier.defaultWeight())

            Button(
                text = "Open App",
                onClick = actionStartActivity<MainActivity>()
            )
        }
    }

    @Composable
    private fun MediumWidget(bookings: List<Booking>) {
        // Medium widget implementation
    }

    @Composable
    private fun LargeWidget(bookings: List<Booking>) {
        // Large widget implementation
    }

    private suspend fun getUpcomingBookings(): List<Booking> {
        return withContext(Dispatchers.IO) {
            // Fetch from Room database
            PhuketDatabase.getInstance(context)
                .bookingDao()
                .getUpcomingBookings()
                .map { it.toDomain() }
        }
    }
}

// widget/BookingsWidgetReceiver.kt
class BookingsWidgetReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = BookingsWidget()
}
```

#### 3.3 Widget Update Strategy

```kotlin
// widget/WidgetUpdateWorker.kt
class WidgetUpdateWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        return try {
            // Refresh data from API
            val bookings = fetchBookingsFromApi()

            // Update local database
            database.bookingDao().insertAll(bookings)

            // Update widget
            BookingsWidget().updateAll(applicationContext)

            Result.success()
        } catch (e: Exception) {
            if (runAttemptCount < 3) {
                Result.retry()
            } else {
                Result.failure()
            }
        }
    }

    companion object {
        fun schedule(context: Context) {
            val request = PeriodicWorkRequestBuilder<WidgetUpdateWorker>(
                15, TimeUnit.MINUTES
            )
                .setConstraints(
                    Constraints.Builder()
                        .setRequiredNetworkType(NetworkType.CONNECTED)
                        .build()
                )
                .build()

            WorkManager.getInstance(context)
                .enqueueUniquePeriodicWork(
                    "widget_update",
                    ExistingPeriodicWorkPolicy.KEEP,
                    request
                )
        }
    }
}
```

### 4. Estimated Effort

| Task | Effort |
|------|--------|
| Glance widget setup | 1 day |
| Small widget design | 1 day |
| Medium/Large widgets | 2 days |
| Data sync with Room | 1 day |
| WorkManager scheduling | 1 day |
| Testing | 2 days |
| **Total** | **8 days** |

### 5. Open Questions

1. Частота обновления виджета (15 min vs 30 min)?
2. Показывать ли погоду в виджете?
3. Нужен ли виджет для конвертера валют?

---

## RFC-A02: Google Pay интеграция

### Метаданные
| Поле | Значение |
|------|----------|
| **Статус** | Draft |
| **Автор** | Android Team |
| **Дата создания** | 12.12.2025 |
| **Deadline для комментариев** | 26.12.2025 |
| **Связанные PRD** | BOOK-001, BOOK-005 |

### 1. Summary

Интеграция Google Pay для быстрой и безопасной оплаты бронирований на Android, в дополнение к Stripe card payments.

### 2. Motivation

**Текущее состояние (после Stripe интеграции):**
- Оплата только картами через Stripe
- Нужно вводить данные карты

**Ожидаемые улучшения:**
- Оплата в 1 клик для пользователей Google Pay
- Увеличение конверсии (меньше friction)
- Паритет с Apple Pay на iOS
- Повышение доверия (Google брендинг)

### 3. Detailed Design

#### 3.1 Payment Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      GOOGLE PAY FLOW                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────┐        ┌───────────┐        ┌───────────┐        ┌────────┐ │
│  │  Android  │        │  Backend  │        │  Stripe   │        │ Google │ │
│  │    App    │        │           │        │           │        │  Pay   │ │
│  └─────┬─────┘        └─────┬─────┘        └─────┬─────┘        └────┬───┘ │
│        │                    │                    │                   │     │
│        │ 1. Check Google    │                    │                   │     │
│        │    Pay readiness   │                    │                   │     │
│        │────────────────────────────────────────────────────────────>│     │
│        │<────────────────────────────────────────────────────────────│     │
│        │    isReadyToPay    │                    │                   │     │
│        │                    │                    │                   │     │
│        │ 2. User taps       │                    │                   │     │
│        │    "Google Pay"    │                    │                   │     │
│        │                    │                    │                   │     │
│        │ 3. Request payment │                    │                   │     │
│        │    data            │                    │                   │     │
│        │────────────────────────────────────────────────────────────>│     │
│        │                    │                    │                   │     │
│        │<────────────────────────────────────────────────────────────│     │
│        │    Payment Token   │                    │                   │     │
│        │    (encrypted)     │                    │                   │     │
│        │                    │                    │                   │     │
│        │ 4. Send token to   │                    │                   │     │
│        │    backend         │                    │                   │     │
│        │───────────────────>│                    │                   │     │
│        │                    │                    │                   │     │
│        │                    │ 5. Create payment  │                   │     │
│        │                    │    with token      │                   │     │
│        │                    │───────────────────>│                   │     │
│        │                    │                    │                   │     │
│        │                    │<───────────────────│                   │     │
│        │                    │ PaymentIntent      │                   │     │
│        │                    │                    │                   │     │
│        │<───────────────────│                    │                   │     │
│        │ 6. Success         │                    │                   │     │
│        │                    │                    │                   │     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 3.2 Implementation

```kotlin
// payment/GooglePayManager.kt
class GooglePayManager(private val activity: Activity) {

    private val paymentsClient: PaymentsClient by lazy {
        Wallet.getPaymentsClient(
            activity,
            Wallet.WalletOptions.Builder()
                .setEnvironment(
                    if (BuildConfig.DEBUG) WalletConstants.ENVIRONMENT_TEST
                    else WalletConstants.ENVIRONMENT_PRODUCTION
                )
                .build()
        )
    }

    suspend fun isReadyToPay(): Boolean {
        val request = IsReadyToPayRequest.fromJson(
            """
            {
                "apiVersion": 2,
                "apiVersionMinor": 0,
                "allowedPaymentMethods": [{
                    "type": "CARD",
                    "parameters": {
                        "allowedAuthMethods": ["PAN_ONLY", "CRYPTOGRAM_3DS"],
                        "allowedCardNetworks": ["VISA", "MASTERCARD", "AMEX"]
                    },
                    "tokenizationSpecification": {
                        "type": "PAYMENT_GATEWAY",
                        "parameters": {
                            "gateway": "stripe",
                            "stripe:version": "2023-10-16",
                            "stripe:publishableKey": "${BuildConfig.STRIPE_PUBLISHABLE_KEY}"
                        }
                    }
                }]
            }
            """.trimIndent()
        )

        return suspendCoroutine { continuation ->
            paymentsClient.isReadyToPay(request)
                .addOnCompleteListener { task ->
                    continuation.resume(task.isSuccessful && task.result == true)
                }
        }
    }

    fun createPaymentDataRequest(
        price: String,
        currencyCode: String = "THB"
    ): PaymentDataRequest {
        return PaymentDataRequest.fromJson(
            """
            {
                "apiVersion": 2,
                "apiVersionMinor": 0,
                "allowedPaymentMethods": [{
                    "type": "CARD",
                    "parameters": {
                        "allowedAuthMethods": ["PAN_ONLY", "CRYPTOGRAM_3DS"],
                        "allowedCardNetworks": ["VISA", "MASTERCARD", "AMEX"]
                    },
                    "tokenizationSpecification": {
                        "type": "PAYMENT_GATEWAY",
                        "parameters": {
                            "gateway": "stripe",
                            "stripe:version": "2023-10-16",
                            "stripe:publishableKey": "${BuildConfig.STRIPE_PUBLISHABLE_KEY}"
                        }
                    }
                }],
                "transactionInfo": {
                    "totalPrice": "$price",
                    "totalPriceStatus": "FINAL",
                    "currencyCode": "$currencyCode"
                },
                "merchantInfo": {
                    "merchantName": "Phuket App"
                }
            }
            """.trimIndent()
        )
    }

    fun requestPayment(
        request: PaymentDataRequest,
        launcher: ActivityResultLauncher<Intent>
    ) {
        val task = paymentsClient.loadPaymentData(request)
        AutoResolveHelper.resolveTask(task, activity, LOAD_PAYMENT_DATA_REQUEST_CODE)
    }

    companion object {
        const val LOAD_PAYMENT_DATA_REQUEST_CODE = 991
    }
}
```

#### 3.3 Payment Screen Integration

```kotlin
// feature/payment/PaymentScreen.kt
@Composable
fun PaymentScreen(
    booking: Booking,
    viewModel: PaymentViewModel = hiltViewModel(),
    onPaymentSuccess: (String) -> Unit
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val context = LocalContext.current

    val googlePayLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.StartIntentSenderForResult()
    ) { result ->
        viewModel.handleGooglePayResult(result)
    }

    LaunchedEffect(Unit) {
        viewModel.checkGooglePayAvailability()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        // Order Summary
        BookingSummaryCard(booking)

        Spacer(modifier = Modifier.height(24.dp))

        // Payment Methods
        Text(
            text = "Payment Method",
            style = MaterialTheme.typography.titleMedium
        )

        Spacer(modifier = Modifier.height(12.dp))

        // Google Pay Button (if available)
        if (uiState.isGooglePayAvailable) {
            GooglePayButton(
                onClick = {
                    viewModel.initiateGooglePay(booking.totalPrice)
                },
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(12.dp))

            Text(
                text = "or pay with card",
                modifier = Modifier.align(Alignment.CenterHorizontally),
                style = MaterialTheme.typography.bodySmall
            )

            Spacer(modifier = Modifier.height(12.dp))
        }

        // Stripe Card Payment
        StripeCardForm(
            onCardComplete = { card ->
                viewModel.payWithCard(card, booking.totalPrice)
            }
        )
    }

    // Handle payment result
    LaunchedEffect(uiState.paymentResult) {
        when (val result = uiState.paymentResult) {
            is PaymentResult.Success -> onPaymentSuccess(result.bookingId)
            is PaymentResult.Error -> {
                // Show error snackbar
            }
            else -> {}
        }
    }
}

@Composable
fun GooglePayButton(
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Button(
        onClick = onClick,
        modifier = modifier.height(48.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = Color.Black
        )
    ) {
        Icon(
            painter = painterResource(R.drawable.ic_google_pay),
            contentDescription = null,
            tint = Color.White,
            modifier = Modifier.size(24.dp)
        )
        Spacer(modifier = Modifier.width(8.dp))
        Text(
            text = "Pay with Google Pay",
            color = Color.White
        )
    }
}
```

### 4. Estimated Effort

| Task | Effort |
|------|--------|
| Google Pay setup | 1 day |
| Payment flow implementation | 2 days |
| Stripe + Google Pay integration | 2 days |
| UI components | 1 day |
| Testing (sandbox) | 2 days |
| **Total** | **8 days** |

### 5. Open Questions

1. Поддерживать ли Samsung Pay отдельно?
2. Fallback если Google Pay недоступен?
3. Показывать ли saved cards из Google Pay?

---

## RFC-A03: Offline режим с WorkManager

### Метаданные
| Поле | Значение |
|------|----------|
| **Статус** | Draft |
| **Автор** | Android Team |
| **Дата создания** | 12.12.2025 |
| **Deadline для комментариев** | 26.12.2025 |

### 1. Summary

Реализация полноценного offline режима с использованием Room для кэширования и WorkManager для синхронизации данных.

### 2. Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      OFFLINE ARCHITECTURE                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                         Repository Layer                              │  │
│  │                                                                       │  │
│  │    ┌─────────────────────────────────────────────────────────────┐   │  │
│  │    │                  OfflineFirstRepository                      │   │  │
│  │    │                                                              │   │  │
│  │    │  1. Try local cache first                                   │   │  │
│  │    │  2. If online: fetch & update cache                         │   │  │
│  │    │  3. If offline: return cached data                          │   │  │
│  │    │  4. Queue writes for sync                                   │   │  │
│  │    │                                                              │   │  │
│  │    └─────────────────────────────────────────────────────────────┘   │  │
│  │                              │                                       │  │
│  │           ┌──────────────────┼──────────────────┐                   │  │
│  │           │                  │                  │                   │  │
│  │           ▼                  ▼                  ▼                   │  │
│  │    ┌────────────┐     ┌────────────┐     ┌────────────┐            │  │
│  │    │   Room     │     │  Retrofit  │     │ WorkManager│            │  │
│  │    │  Database  │     │   (API)    │     │   (Sync)   │            │  │
│  │    │            │     │            │     │            │            │  │
│  │    │ • Vehicles │     │ • GET/POST │     │ • Periodic │            │  │
│  │    │ • Properties│    │ • Network  │     │ • OneTime  │            │  │
│  │    │ • Bookings │     │   calls    │     │ • Retry    │            │  │
│  │    │ • Favorites│     │            │     │            │            │  │
│  │    └────────────┘     └────────────┘     └────────────┘            │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                        Pending Actions Queue                          │  │
│  │                                                                       │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │  │
│  │  │ pending_actions table                                           │ │  │
│  │  │                                                                  │ │  │
│  │  │ id | type           | payload      | created_at | retry_count  │ │  │
│  │  │ 1  | add_favorite   | {vehicle:1}  | ...        | 0            │ │  │
│  │  │ 2  | create_booking | {tour:5,...} | ...        | 1            │ │  │
│  │  │                                                                  │ │  │
│  │  └─────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3. Implementation

#### 3.1 Network Monitor

```kotlin
// core/network/NetworkMonitor.kt
@Singleton
class NetworkMonitor @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val connectivityManager = context.getSystemService<ConnectivityManager>()

    private val _isOnline = MutableStateFlow(checkNetworkStatus())
    val isOnline: StateFlow<Boolean> = _isOnline.asStateFlow()

    private val networkCallback = object : ConnectivityManager.NetworkCallback() {
        override fun onAvailable(network: Network) {
            _isOnline.value = true
        }

        override fun onLost(network: Network) {
            _isOnline.value = false
        }
    }

    init {
        val request = NetworkRequest.Builder()
            .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
            .build()
        connectivityManager?.registerNetworkCallback(request, networkCallback)
    }

    private fun checkNetworkStatus(): Boolean {
        val network = connectivityManager?.activeNetwork ?: return false
        val capabilities = connectivityManager.getNetworkCapabilities(network) ?: return false
        return capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
    }

    fun isOnline(): Boolean = _isOnline.value
}
```

#### 3.2 Offline-First Repository

```kotlin
// data/repository/OfflineFirstVehicleRepository.kt
@Singleton
class OfflineFirstVehicleRepository @Inject constructor(
    private val apiService: PhuketApiService,
    private val vehicleDao: VehicleDao,
    private val networkMonitor: NetworkMonitor,
    private val syncManager: SyncManager
) : VehicleRepository {

    override fun getVehicles(
        type: VehicleType?,
        minPrice: Double?,
        maxPrice: Double?
    ): Flow<Result<List<Vehicle>>> = flow {
        emit(Result.Loading)

        // 1. Emit cached data first (instant UI update)
        val cachedVehicles = vehicleDao.getVehicles(type?.name)
        if (cachedVehicles.isNotEmpty()) {
            emit(Result.Success(cachedVehicles.map { it.toDomain() }))
        }

        // 2. If online, fetch fresh data
        if (networkMonitor.isOnline()) {
            try {
                val response = apiService.getVehicles(
                    type = type?.name?.lowercase(),
                    minPrice = minPrice,
                    maxPrice = maxPrice
                )

                if (response.isSuccessful) {
                    val freshVehicles = response.body()?.data ?: emptyList()

                    // Update cache
                    vehicleDao.deleteAll()
                    vehicleDao.insertAll(freshVehicles.map { it.toEntity() })

                    // Emit fresh data
                    emit(Result.Success(freshVehicles.map { it.toDomain() }))
                } else {
                    // Network error but we have cache - don't emit error
                    if (cachedVehicles.isEmpty()) {
                        emit(Result.Error(parseApiError(response)))
                    }
                }
            } catch (e: Exception) {
                // Network exception but we have cache - don't emit error
                if (cachedVehicles.isEmpty()) {
                    emit(Result.Error(e.toAppError()))
                }
            }
        } else {
            // Offline - already emitted cache above
            if (cachedVehicles.isEmpty()) {
                emit(Result.Error(AppError.NoConnection))
            }
        }
    }.flowOn(Dispatchers.IO)

    override suspend fun addToFavorites(vehicleId: String): Result<Unit> {
        return withContext(Dispatchers.IO) {
            // Update local immediately
            vehicleDao.updateFavorite(vehicleId, true)

            if (networkMonitor.isOnline()) {
                try {
                    apiService.addToFavorites("vehicle", vehicleId)
                    Result.Success(Unit)
                } catch (e: Exception) {
                    // Queue for later sync
                    syncManager.queueAction(
                        PendingAction(
                            type = ActionType.ADD_FAVORITE,
                            payload = mapOf("itemType" to "vehicle", "itemId" to vehicleId)
                        )
                    )
                    Result.Success(Unit) // Still success - will sync later
                }
            } else {
                // Queue for later sync
                syncManager.queueAction(
                    PendingAction(
                        type = ActionType.ADD_FAVORITE,
                        payload = mapOf("itemType" to "vehicle", "itemId" to vehicleId)
                    )
                )
                Result.Success(Unit)
            }
        }
    }
}
```

#### 3.3 Sync Manager with WorkManager

```kotlin
// sync/SyncManager.kt
@Singleton
class SyncManager @Inject constructor(
    @ApplicationContext private val context: Context,
    private val pendingActionDao: PendingActionDao
) {
    suspend fun queueAction(action: PendingAction) {
        pendingActionDao.insert(action.toEntity())
        scheduleSyncWork()
    }

    fun scheduleSyncWork() {
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()

        val syncRequest = OneTimeWorkRequestBuilder<SyncWorker>()
            .setConstraints(constraints)
            .setBackoffCriteria(
                BackoffPolicy.EXPONENTIAL,
                WorkRequest.MIN_BACKOFF_MILLIS,
                TimeUnit.MILLISECONDS
            )
            .build()

        WorkManager.getInstance(context)
            .enqueueUniqueWork(
                "pending_sync",
                ExistingWorkPolicy.KEEP,
                syncRequest
            )
    }

    fun schedulePeriodicSync() {
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()

        val periodicRequest = PeriodicWorkRequestBuilder<PeriodicSyncWorker>(
            15, TimeUnit.MINUTES
        )
            .setConstraints(constraints)
            .build()

        WorkManager.getInstance(context)
            .enqueueUniquePeriodicWork(
                "periodic_sync",
                ExistingPeriodicWorkPolicy.KEEP,
                periodicRequest
            )
    }
}

// sync/SyncWorker.kt
@HiltWorker
class SyncWorker @AssistedInject constructor(
    @Assisted context: Context,
    @Assisted params: WorkerParameters,
    private val apiService: PhuketApiService,
    private val pendingActionDao: PendingActionDao
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        val pendingActions = pendingActionDao.getAll()

        if (pendingActions.isEmpty()) {
            return Result.success()
        }

        var allSucceeded = true

        pendingActions.forEach { action ->
            try {
                when (action.type) {
                    ActionType.ADD_FAVORITE -> {
                        apiService.addToFavorites(
                            action.payload["itemType"] as String,
                            action.payload["itemId"] as String
                        )
                    }
                    ActionType.REMOVE_FAVORITE -> {
                        apiService.removeFromFavorites(
                            action.payload["itemType"] as String,
                            action.payload["itemId"] as String
                        )
                    }
                    ActionType.UPDATE_PROFILE -> {
                        // Handle profile update
                    }
                }
                // Success - remove from queue
                pendingActionDao.delete(action)
            } catch (e: Exception) {
                allSucceeded = false
                // Increment retry count
                pendingActionDao.incrementRetryCount(action.id)

                // Remove if too many retries
                if (action.retryCount >= MAX_RETRIES) {
                    pendingActionDao.delete(action)
                }
            }
        }

        return if (allSucceeded) Result.success() else Result.retry()
    }

    companion object {
        private const val MAX_RETRIES = 5
    }
}
```

### 4. Estimated Effort

| Task | Effort |
|------|--------|
| Network monitor | 1 day |
| Room caching strategy | 2 days |
| Offline-first repositories | 3 days |
| Pending actions queue | 2 days |
| WorkManager sync | 2 days |
| UI offline indicators | 1 day |
| Testing | 2 days |
| **Total** | **13 days** |

---

## RFC-A04: Biometric Authentication

### Метаданные
| Поле | Значение |
|------|----------|
| **Статус** | Draft |
| **Автор** | Android Team |
| **Дата создания** | 12.12.2025 |
| **Deadline для комментариев** | 26.12.2025 |

### 1. Summary

Добавление биометрической аутентификации (отпечаток пальца, Face Unlock) для быстрого входа в приложение и подтверждения платежей.

### 2. Implementation

```kotlin
// auth/BiometricManager.kt
class BiometricAuthManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val biometricManager = BiometricManager.from(context)

    fun canAuthenticate(): BiometricStatus {
        return when (biometricManager.canAuthenticate(BIOMETRIC_STRONG)) {
            BiometricManager.BIOMETRIC_SUCCESS -> BiometricStatus.Available
            BiometricManager.BIOMETRIC_ERROR_NO_HARDWARE -> BiometricStatus.NoHardware
            BiometricManager.BIOMETRIC_ERROR_HW_UNAVAILABLE -> BiometricStatus.HardwareUnavailable
            BiometricManager.BIOMETRIC_ERROR_NONE_ENROLLED -> BiometricStatus.NotEnrolled
            else -> BiometricStatus.Unknown
        }
    }

    fun authenticate(
        activity: FragmentActivity,
        title: String = "Authentication Required",
        subtitle: String = "Use your fingerprint or face to authenticate",
        onSuccess: () -> Unit,
        onError: (String) -> Unit,
        onFailed: () -> Unit
    ) {
        val executor = ContextCompat.getMainExecutor(context)

        val callback = object : BiometricPrompt.AuthenticationCallback() {
            override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                super.onAuthenticationSucceeded(result)
                onSuccess()
            }

            override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                super.onAuthenticationError(errorCode, errString)
                onError(errString.toString())
            }

            override fun onAuthenticationFailed() {
                super.onAuthenticationFailed()
                onFailed()
            }
        }

        val biometricPrompt = BiometricPrompt(activity, executor, callback)

        val promptInfo = BiometricPrompt.PromptInfo.Builder()
            .setTitle(title)
            .setSubtitle(subtitle)
            .setNegativeButtonText("Use password")
            .setAllowedAuthenticators(BIOMETRIC_STRONG)
            .build()

        biometricPrompt.authenticate(promptInfo)
    }
}

sealed class BiometricStatus {
    object Available : BiometricStatus()
    object NoHardware : BiometricStatus()
    object HardwareUnavailable : BiometricStatus()
    object NotEnrolled : BiometricStatus()
    object Unknown : BiometricStatus()
}
```

### 3. Estimated Effort

| Task | Effort |
|------|--------|
| BiometricManager setup | 1 day |
| Login integration | 1 day |
| Payment confirmation | 1 day |
| Settings UI | 1 day |
| Testing | 1 day |
| **Total** | **5 days** |

---

## RFC-A05: Google Maps SDK интеграция

### Метаданные
| Поле | Значение |
|------|----------|
| **Статус** | Draft |
| **Автор** | Android Team |
| **Дата создания** | 12.12.2025 |
| **Deadline для комментариев** | 26.12.2025 |

### 1. Summary

Интеграция Google Maps SDK для отображения карт с маркерами транспорта, жилья и точек сбора экскурсий.

### 2. Implementation

```kotlin
// feature/maps/MapsScreen.kt
@Composable
fun MapScreen(
    items: List<MapItem>,
    onItemClick: (MapItem) -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val cameraPositionState = rememberCameraPositionState {
        // Default to Phuket center
        position = CameraPosition.fromLatLngZoom(
            LatLng(7.8804, 98.3923),
            12f
        )
    }

    GoogleMap(
        modifier = modifier.fillMaxSize(),
        cameraPositionState = cameraPositionState,
        properties = MapProperties(
            isMyLocationEnabled = hasLocationPermission(),
            mapType = MapType.NORMAL
        ),
        uiSettings = MapUiSettings(
            zoomControlsEnabled = true,
            myLocationButtonEnabled = true
        )
    ) {
        items.forEach { item ->
            Marker(
                state = MarkerState(position = LatLng(item.latitude, item.longitude)),
                title = item.title,
                snippet = item.subtitle,
                icon = BitmapDescriptorFactory.defaultMarker(
                    when (item.type) {
                        MapItemType.VEHICLE -> BitmapDescriptorFactory.HUE_BLUE
                        MapItemType.PROPERTY -> BitmapDescriptorFactory.HUE_GREEN
                        MapItemType.TOUR -> BitmapDescriptorFactory.HUE_ORANGE
                    }
                ),
                onClick = {
                    onItemClick(item)
                    true
                }
            )
        }
    }
}

data class MapItem(
    val id: String,
    val type: MapItemType,
    val title: String,
    val subtitle: String,
    val latitude: Double,
    val longitude: Double
)

enum class MapItemType {
    VEHICLE, PROPERTY, TOUR
}
```

### 3. Estimated Effort

| Task | Effort |
|------|--------|
| Maps SDK setup | 1 day |
| Map composable | 2 days |
| Custom markers | 1 day |
| Clustering | 2 days |
| Directions API | 2 days |
| Testing | 1 day |
| **Total** | **9 days** |

---

## Сводная таблица RFC

| RFC | Название | Effort | Приоритет |
|-----|----------|--------|-----------|
| RFC-A01 | Android Widgets | 8 days | Medium |
| RFC-A02 | Google Pay | 8 days | High |
| RFC-A03 | Offline Mode | 13 days | High |
| RFC-A04 | Biometric Auth | 5 days | Medium |
| RFC-A05 | Google Maps | 9 days | High |
| **Total** | | **43 days** | |

---

**Комментарии оставляйте в соответствующих тикетах или на tech meetings.**
