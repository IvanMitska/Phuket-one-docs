# Software Architecture Document
# Phuket App

**Версия:** 1.0
**Дата:** 12 декабря 2025
**Автор:** Engineering Team
**Статус:** В разработке

---

## 1. Обзор архитектуры

### 1.1 Архитектурный стиль

Phuket App использует **клиент-серверную архитектуру** с RESTful API:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ARCHITECTURAL OVERVIEW                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        PRESENTATION LAYER                            │   │
│  │                                                                      │   │
│  │   iOS (SwiftUI)      Android (Kotlin)      Web (React)              │   │
│  │        │                   │                   │                     │   │
│  │        └───────────────────┴───────────────────┘                     │   │
│  │                            │                                         │   │
│  │                     REST API (HTTPS)                                │   │
│  │                            │                                         │   │
│  └────────────────────────────┼─────────────────────────────────────────┘   │
│                               │                                             │
│  ┌────────────────────────────┼─────────────────────────────────────────┐   │
│  │                    API LAYER (FastAPI)                               │   │
│  │                               │                                      │   │
│  │  ┌───────────────────────────┴──────────────────────────────────┐   │   │
│  │  │                                                               │   │   │
│  │  │  Routers ──> Services ──> Repositories ──> Database          │   │   │
│  │  │     │                                                         │   │   │
│  │  │     └── Middleware (Auth, Rate Limit, CORS, Security)        │   │   │
│  │  │                                                               │   │   │
│  │  └───────────────────────────────────────────────────────────────┘   │   │
│  │                                                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                               │                                             │
│  ┌────────────────────────────┼─────────────────────────────────────────┐   │
│  │                     DATA LAYER                                       │   │
│  │                                                                      │   │
│  │  PostgreSQL (Primary)    Redis (Cache)    S3 (Media)               │   │
│  │                                                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Ключевые архитектурные принципы

| Принцип | Описание | Применение |
|---------|----------|------------|
| **Separation of Concerns** | Четкое разделение ответственности | Слои: Presentation, API, Data |
| **Single Responsibility** | Каждый модуль отвечает за одну вещь | Feature-based модульность |
| **Dependency Inversion** | Зависимость от абстракций | Protocols/Interfaces |
| **Open/Closed** | Открыто для расширения, закрыто для модификации | Plugin-like архитектура |
| **DRY** | Don't Repeat Yourself | Shared components, utils |

---

## 2. iOS Architecture (SwiftUI + MVVM)

### 2.1 Architectural Pattern: MVVM + Repository

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           iOS MVVM ARCHITECTURE                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         VIEW LAYER (SwiftUI)                        │   │
│  │                                                                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │   │
│  │  │  HomeView    │  │ TransportView│  │  ToursView   │  ...         │   │
│  │  │              │  │              │  │              │               │   │
│  │  │  @StateObject│  │  @StateObject│  │  @StateObject│               │   │
│  │  │  viewModel   │  │  viewModel   │  │  viewModel   │               │   │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘               │   │
│  │         │                 │                 │                        │   │
│  └─────────┼─────────────────┼─────────────────┼────────────────────────┘   │
│            │                 │                 │                            │
│            │    @Published   │                 │                            │
│            │    properties   │                 │                            │
│            ▼                 ▼                 ▼                            │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      VIEWMODEL LAYER                                 │   │
│  │                                                                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │   │
│  │  │HomeViewModel │  │TransportVM   │  │ ToursViewModel│  ...        │   │
│  │  │              │  │              │  │              │               │   │
│  │  │ @Published   │  │ @Published   │  │ @Published   │               │   │
│  │  │ state        │  │ vehicles     │  │ tours        │               │   │
│  │  │              │  │ isLoading    │  │ isLoading    │               │   │
│  │  │              │  │ error        │  │ error        │               │   │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘               │   │
│  │         │                 │                 │                        │   │
│  └─────────┼─────────────────┼─────────────────┼────────────────────────┘   │
│            │                 │                 │                            │
│            │   Dependency    │                 │                            │
│            │   Injection     │                 │                            │
│            ▼                 ▼                 ▼                            │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     REPOSITORY LAYER                                 │   │
│  │                                                                      │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │                  Protocol Definitions                        │    │   │
│  │  │                                                              │    │   │
│  │  │  VehicleRepositoryProtocol                                  │    │   │
│  │  │  PropertyRepositoryProtocol                                 │    │   │
│  │  │  TourRepositoryProtocol                                     │    │   │
│  │  │  BookingRepositoryProtocol                                  │    │   │
│  │  │  UserRepositoryProtocol                                     │    │   │
│  │  └─────────────────────────────────────────────────────────────┘    │   │
│  │                               │                                      │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │                  Implementations                             │    │   │
│  │  │                                                              │    │   │
│  │  │  NetworkVehicleRepository    MockVehicleRepository          │    │   │
│  │  │  NetworkPropertyRepository   MockPropertyRepository         │    │   │
│  │  │  NetworkTourRepository       MockTourRepository             │    │   │
│  │  └─────────────────────────────────────────────────────────────┘    │   │
│  │                                                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                               │                                             │
│                               ▼                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                       CORE LAYER                                     │   │
│  │                                                                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │   │
│  │  │NetworkManager│  │KeychainMgr   │  │ CacheManager │               │   │
│  │  │              │  │              │  │              │               │   │
│  │  │ SSL Pinning  │  │ Token Store  │  │ API Cache    │               │   │
│  │  │ Async/Await  │  │ Secure Store │  │ TTL Policies │               │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │   │
│  │                                                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Module Structure

```
PhuketApp/
│
├── App/                          # Application entry point
│   ├── PhuketApp.swift           # @main struct
│   ├── ContentView.swift         # Root TabView
│   └── AppState.swift            # Global app state
│
├── Core/                         # Core infrastructure
│   ├── DI/                       # Dependency Injection
│   │   ├── DIContainer.swift     # Factory for dependencies
│   │   ├── Repositories.swift    # Repository protocols
│   │   └── MockData.swift        # Mock implementations
│   │
│   ├── Network/
│   │   ├── NetworkManager.swift  # HTTP client + SSL pinning
│   │   ├── APIEndpoint.swift     # Endpoint definitions
│   │   ├── NetworkError.swift    # Error types
│   │   └── NetworkMonitor.swift  # Connectivity monitor
│   │
│   ├── Storage/
│   │   ├── KeychainManager.swift # Secure token storage
│   │   ├── CacheManager.swift    # API response cache
│   │   └── UserDefaultsManager.swift
│   │
│   └── Security/
│       └── SecurityManager.swift # Encryption, validation
│
├── Features/                     # Feature modules
│   ├── Home/
│   │   ├── ViewModels/
│   │   │   └── HomeViewModel.swift
│   │   └── Views/
│   │       ├── HomeView.swift
│   │       └── OnboardingView.swift
│   │
│   ├── Transport/
│   │   ├── ViewModels/
│   │   │   └── TransportViewModel.swift
│   │   └── Views/
│   │       ├── TransportView.swift
│   │       ├── VehicleDetailView.swift
│   │       └── VehicleFilterView.swift
│   │
│   ├── Accommodation/
│   │   ├── ViewModels/
│   │   │   └── AccommodationViewModel.swift
│   │   └── Views/
│   │       ├── AccommodationView.swift
│   │       └── PropertyDetailView.swift
│   │
│   ├── Tours/
│   │   ├── ViewModels/
│   │   │   └── ToursViewModel.swift
│   │   └── Views/
│   │       ├── ToursView.swift
│   │       └── TourDetailView.swift
│   │
│   ├── Auth/
│   │   ├── ViewModels/
│   │   │   └── AuthViewModel.swift
│   │   └── Views/
│   │       └── AuthViews.swift
│   │
│   ├── Profile/
│   │   ├── ViewModels/
│   │   │   └── ProfileViewModel.swift
│   │   └── Views/
│   │       ├── ProfileView.swift
│   │       ├── EditProfileView.swift
│   │       └── BookingDetailView.swift
│   │
│   ├── Currency/
│   │   ├── ViewModels/
│   │   │   └── CurrencyViewModel.swift
│   │   └── Views/
│   │       └── CurrencyView.swift
│   │
│   └── AIAssistant/
│       ├── ViewModels/
│       │   └── AIAssistantViewModel.swift
│       └── Views/
│           └── AIAssistantView.swift
│
└── Shared/                       # Shared components
    ├── Models/                   # Data models
    │   ├── User.swift
    │   ├── Vehicle.swift
    │   ├── Property.swift
    │   ├── Tour.swift
    │   ├── Booking.swift
    │   └── ChatMessage.swift
    │
    ├── Components/               # Reusable UI components
    │   ├── MapView.swift
    │   ├── RatingView.swift
    │   ├── SearchBar.swift
    │   ├── BookingView.swift
    │   └── EmptyStateView.swift
    │
    ├── Utils/                    # Utilities
    │   ├── HapticManager.swift
    │   ├── NotificationManager.swift
    │   └── LocationManager.swift
    │
    └── Styles/                   # Design tokens
        ├── AppColors.swift
        ├── AppFonts.swift
        └── AppStyles.swift
```

### 2.3 Key Components Implementation

#### 2.3.1 NetworkManager (Core)

```swift
@MainActor
final class NetworkManager: NSObject, URLSessionDelegate {
    static let shared = NetworkManager()

    private lazy var session: URLSession = {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        config.waitsForConnectivity = true
        return URLSession(configuration: config, delegate: self, delegateQueue: nil)
    }()

    // SSL Certificate Pinning
    func urlSession(_ session: URLSession,
                   didReceive challenge: URLAuthenticationChallenge,
                   completionHandler: @escaping (URLSession.AuthChallengeDisposition, URLCredential?) -> Void) {
        guard let serverTrust = challenge.protectionSpace.serverTrust,
              let certificate = SecTrustGetCertificateAtIndex(serverTrust, 0) else {
            completionHandler(.cancelAuthenticationChallenge, nil)
            return
        }

        // Compare certificate hash with pinned certificates
        let serverCertData = SecCertificateCopyData(certificate) as Data
        let serverCertHash = sha256(data: serverCertData)

        if pinnedCertificateHashes.contains(serverCertHash) {
            completionHandler(.useCredential, URLCredential(trust: serverTrust))
        } else {
            completionHandler(.cancelAuthenticationChallenge, nil)
        }
    }

    // Generic request method
    func request<T: Decodable>(_ endpoint: APIEndpoint) async throws -> T {
        var request = URLRequest(url: endpoint.url)
        request.httpMethod = endpoint.method.rawValue
        request.allHTTPHeaderFields = endpoint.headers

        if let body = endpoint.body {
            request.httpBody = try JSONEncoder().encode(body)
        }

        // Add auth token if available
        if let token = KeychainManager.shared.getAccessToken() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw NetworkError.invalidResponse
        }

        switch httpResponse.statusCode {
        case 200...299:
            return try JSONDecoder().decode(T.self, from: data)
        case 401:
            try await refreshToken()
            return try await request(endpoint) // Retry
        case 429:
            throw NetworkError.rateLimited
        default:
            throw NetworkError.httpError(code: httpResponse.statusCode)
        }
    }
}
```

#### 2.3.2 Repository Pattern

```swift
// Protocol Definition
protocol VehicleRepositoryProtocol {
    func fetchVehicles(type: VehicleType?) async throws -> [Vehicle]
    func fetchVehicle(id: UUID) async throws -> Vehicle
    func searchVehicles(query: String) async throws -> [Vehicle]
}

// Network Implementation
final class NetworkVehicleRepository: VehicleRepositoryProtocol {
    private let networkManager: NetworkManager
    private let cache: CacheManager

    init(networkManager: NetworkManager = .shared, cache: CacheManager = .shared) {
        self.networkManager = networkManager
        self.cache = cache
    }

    func fetchVehicles(type: VehicleType? = nil) async throws -> [Vehicle] {
        // Check cache first
        let cacheKey = "vehicles_\(type?.rawValue ?? "all")"
        if let cached: [Vehicle] = cache.get(key: cacheKey) {
            return cached
        }

        // Fetch from network
        let endpoint = APIEndpoint.vehicles(type: type)
        let vehicles: [Vehicle] = try await networkManager.request(endpoint)

        // Cache result
        cache.set(key: cacheKey, value: vehicles, ttl: 3600)

        return vehicles
    }

    func fetchVehicle(id: UUID) async throws -> Vehicle {
        let endpoint = APIEndpoint.vehicleDetail(id: id)
        return try await networkManager.request(endpoint)
    }

    func searchVehicles(query: String) async throws -> [Vehicle] {
        let endpoint = APIEndpoint.searchVehicles(query: query)
        return try await networkManager.request(endpoint)
    }
}

// Mock Implementation (for testing/preview)
final class MockVehicleRepository: VehicleRepositoryProtocol {
    func fetchVehicles(type: VehicleType?) async throws -> [Vehicle] {
        return MockData.vehicles.filter { vehicle in
            guard let type = type else { return true }
            return vehicle.type == type
        }
    }

    func fetchVehicle(id: UUID) async throws -> Vehicle {
        guard let vehicle = MockData.vehicles.first(where: { $0.id == id }) else {
            throw NetworkError.notFound
        }
        return vehicle
    }

    func searchVehicles(query: String) async throws -> [Vehicle] {
        return MockData.vehicles.filter { $0.brand.contains(query) || $0.model.contains(query) }
    }
}
```

#### 2.3.3 ViewModel

```swift
@MainActor
final class TransportViewModel: ObservableObject {
    // Published state
    @Published private(set) var vehicles: [Vehicle] = []
    @Published private(set) var isLoading = false
    @Published private(set) var error: Error?
    @Published var selectedType: VehicleType?
    @Published var searchQuery = ""

    // Dependencies
    private let repository: VehicleRepositoryProtocol

    // Initialization with DI
    init(repository: VehicleRepositoryProtocol = DIContainer.shared.vehicleRepository) {
        self.repository = repository
    }

    // Actions
    func loadVehicles() async {
        isLoading = true
        error = nil

        do {
            vehicles = try await repository.fetchVehicles(type: selectedType)
        } catch {
            self.error = error
        }

        isLoading = false
    }

    func search() async {
        guard searchQuery.count >= 2 else { return }

        isLoading = true
        error = nil

        do {
            vehicles = try await repository.searchVehicles(query: searchQuery)
        } catch {
            self.error = error
        }

        isLoading = false
    }

    func filterByType(_ type: VehicleType?) {
        selectedType = type
        Task {
            await loadVehicles()
        }
    }
}
```

#### 2.3.4 View

```swift
struct TransportView: View {
    @StateObject private var viewModel = TransportViewModel()
    @State private var showFilters = false

    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading {
                    ProgressView()
                } else if let error = viewModel.error {
                    ErrorView(error: error, retryAction: { Task { await viewModel.loadVehicles() } })
                } else if viewModel.vehicles.isEmpty {
                    EmptyStateView(message: "No vehicles found")
                } else {
                    vehicleList
                }
            }
            .navigationTitle("Transport")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showFilters.toggle() }) {
                        Image(systemName: "line.3.horizontal.decrease.circle")
                    }
                }
            }
            .sheet(isPresented: $showFilters) {
                VehicleFilterView(selectedType: $viewModel.selectedType)
            }
            .task {
                await viewModel.loadVehicles()
            }
            .searchable(text: $viewModel.searchQuery)
            .onSubmit(of: .search) {
                Task { await viewModel.search() }
            }
        }
    }

    private var vehicleList: some View {
        ScrollView {
            LazyVStack(spacing: 16) {
                ForEach(viewModel.vehicles) { vehicle in
                    NavigationLink(destination: VehicleDetailView(vehicle: vehicle)) {
                        VehicleCard(vehicle: vehicle)
                    }
                }
            }
            .padding()
        }
    }
}
```

### 2.4 Dependency Injection

```swift
@MainActor
final class DIContainer {
    static let shared = DIContainer()

    // Configuration
    private let useMockData: Bool

    init(useMockData: Bool = false) {
        #if DEBUG
        self.useMockData = ProcessInfo.processInfo.arguments.contains("-useMockData")
        #else
        self.useMockData = false
        #endif
    }

    // Repositories
    lazy var vehicleRepository: VehicleRepositoryProtocol = {
        useMockData ? MockVehicleRepository() : NetworkVehicleRepository()
    }()

    lazy var propertyRepository: PropertyRepositoryProtocol = {
        useMockData ? MockPropertyRepository() : NetworkPropertyRepository()
    }()

    lazy var tourRepository: TourRepositoryProtocol = {
        useMockData ? MockTourRepository() : NetworkTourRepository()
    }()

    lazy var bookingRepository: BookingRepositoryProtocol = {
        useMockData ? MockBookingRepository() : NetworkBookingRepository()
    }()

    lazy var authRepository: AuthRepositoryProtocol = {
        useMockData ? MockAuthRepository() : NetworkAuthRepository()
    }()
}
```

---

## 3. Backend Architecture (FastAPI)

### 3.1 Layered Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BACKEND ARCHITECTURE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      PRESENTATION LAYER                              │   │
│  │                         (Routers)                                    │   │
│  │                                                                      │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐        │   │
│  │  │  /auth     │ │ /vehicles  │ │/properties │ │  /tours    │        │   │
│  │  │  router    │ │  router    │ │   router   │ │  router    │        │   │
│  │  └─────┬──────┘ └─────┬──────┘ └─────┬──────┘ └─────┬──────┘        │   │
│  │        │              │              │              │                │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐        │   │
│  │  │ /bookings  │ │ /currency  │ │   /ai      │ │  /search   │        │   │
│  │  │  router    │ │  router    │ │  router    │ │  router    │        │   │
│  │  └─────┬──────┘ └─────┬──────┘ └─────┬──────┘ └─────┬──────┘        │   │
│  │        │              │              │              │                │   │
│  └────────┼──────────────┼──────────────┼──────────────┼────────────────┘   │
│           │              │              │              │                    │
│           └──────────────┴──────────────┴──────────────┘                    │
│                                   │                                         │
│  ┌────────────────────────────────┼─────────────────────────────────────┐   │
│  │                      MIDDLEWARE LAYER                                │   │
│  │                                │                                     │   │
│  │  ┌────────────┐ ┌────────────┐ │ ┌────────────┐ ┌────────────┐      │   │
│  │  │   CORS     │ │Rate Limit  │ │ │  Security  │ │   Auth     │      │   │
│  │  │ Middleware │ │ Middleware │ │ │ Middleware │ │ Middleware │      │   │
│  │  └────────────┘ └────────────┘ │ └────────────┘ └────────────┘      │   │
│  │                                │                                     │   │
│  └────────────────────────────────┼─────────────────────────────────────┘   │
│                                   │                                         │
│  ┌────────────────────────────────┼─────────────────────────────────────┐   │
│  │                      SERVICE LAYER                                   │   │
│  │                    (Business Logic)                                  │   │
│  │                                │                                     │   │
│  │  ┌────────────┐ ┌────────────┐ │ ┌────────────┐ ┌────────────┐      │   │
│  │  │   Auth     │ │  Booking   │ │ │  Search    │ │    AI      │      │   │
│  │  │  Service   │ │  Service   │ │ │  Service   │ │  Service   │      │   │
│  │  └────────────┘ └────────────┘ │ └────────────┘ └────────────┘      │   │
│  │                                │                                     │   │
│  └────────────────────────────────┼─────────────────────────────────────┘   │
│                                   │                                         │
│  ┌────────────────────────────────┼─────────────────────────────────────┐   │
│  │                      DATA LAYER                                      │   │
│  │                  (SQLAlchemy ORM)                                    │   │
│  │                                │                                     │   │
│  │  ┌────────────┐ ┌────────────┐ │ ┌────────────┐ ┌────────────┐      │   │
│  │  │   User     │ │  Vehicle   │ │ │  Property  │ │   Tour     │      │   │
│  │  │   Model    │ │   Model    │ │ │   Model    │ │   Model    │      │   │
│  │  └────────────┘ └────────────┘ │ └────────────┘ └────────────┘      │   │
│  │                                │                                     │   │
│  │  ┌────────────┐ ┌────────────┐ │                                    │   │
│  │  │  Booking   │ │ ExchRate   │ │                                    │   │
│  │  │   Model    │ │   Model    │ │                                    │   │
│  │  └────────────┘ └────────────┘ │                                    │   │
│  │                                │                                     │   │
│  └────────────────────────────────┼─────────────────────────────────────┘   │
│                                   │                                         │
│                                   ▼                                         │
│                           ┌────────────┐                                   │
│                           │ PostgreSQL │                                   │
│                           └────────────┘                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Project Structure

```
backend/
│
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── config.py            # Configuration
│   ├── database.py          # Database connection
│   ├── security.py          # Security middleware
│   │
│   ├── models/              # SQLAlchemy ORM models
│   │   ├── __init__.py
│   │   ├── base.py          # Base model class
│   │   ├── user.py          # User model
│   │   ├── vehicle.py       # Vehicle model
│   │   ├── property.py      # Property model
│   │   ├── tour.py          # Tour model
│   │   ├── booking.py       # Booking model
│   │   └── currency.py      # Exchange rate model
│   │
│   ├── schemas/             # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── user.py          # UserCreate, UserResponse
│   │   ├── vehicle.py       # VehicleResponse
│   │   ├── property.py      # PropertyResponse
│   │   ├── tour.py          # TourResponse
│   │   ├── booking.py       # BookingCreate, BookingResponse
│   │   ├── currency.py      # ExchangeRateResponse
│   │   └── common.py        # Pagination, Error schemas
│   │
│   ├── routers/             # API routes
│   │   ├── __init__.py
│   │   ├── auth.py          # Authentication endpoints
│   │   ├── users.py         # User profile endpoints
│   │   ├── vehicles.py      # Vehicles CRUD
│   │   ├── properties.py    # Properties CRUD
│   │   ├── tours.py         # Tours CRUD
│   │   ├── bookings.py      # Bookings CRUD
│   │   ├── currency.py      # Currency rates
│   │   ├── weather.py       # Weather endpoint
│   │   ├── ai.py            # AI chat endpoint
│   │   └── search.py        # Global search
│   │
│   ├── services/            # Business logic
│   │   ├── __init__.py
│   │   ├── auth.py          # JWT, password hashing
│   │   ├── booking.py       # Booking logic
│   │   ├── search.py        # Search logic
│   │   └── ai.py            # AI integration
│   │
│   └── seed_data.py         # Database seeding
│
├── tests/                   # Unit & integration tests
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_vehicles.py
│   └── test_bookings.py
│
├── alembic/                 # Database migrations
│   ├── versions/
│   └── env.py
│
├── requirements.txt         # Python dependencies
├── .env.example             # Environment template
└── README.md                # Backend documentation
```

### 3.3 Key Components

#### 3.3.1 FastAPI Application

```python
# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.config import settings
from app.database import engine, Base
from app.security import add_security_headers
from app.routers import auth, users, vehicles, properties, tours, bookings, currency, weather, ai, search

# Initialize limiter
limiter = Limiter(key_func=get_remote_address)

# Create FastAPI app
app = FastAPI(
    title="Phuket App API",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

# Add limiter to app state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Security headers middleware
@app.middleware("http")
async def security_middleware(request, call_next):
    response = await call_next(request)
    return add_security_headers(response)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(vehicles.router, prefix="/vehicles", tags=["Vehicles"])
app.include_router(properties.router, prefix="/properties", tags=["Properties"])
app.include_router(tours.router, prefix="/tours", tags=["Tours"])
app.include_router(bookings.router, prefix="/bookings", tags=["Bookings"])
app.include_router(currency.router, prefix="/currency", tags=["Currency"])
app.include_router(weather.router, prefix="/weather", tags=["Weather"])
app.include_router(ai.router, prefix="/ai", tags=["AI"])
app.include_router(search.router, prefix="/search", tags=["Search"])

# Health check
@app.get("/")
async def root():
    return {"name": "Phuket App API", "version": "1.0.0", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

# Startup event
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
```

#### 3.3.2 Database Configuration

```python
# app/database.py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base

from app.config import settings

# Async engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

# Session factory
async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Base model
Base = declarative_base()

# Dependency
async def get_db():
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
```

#### 3.3.3 SQLAlchemy Models

```python
# app/models/user.py
from sqlalchemy import Column, String, Boolean, DateTime, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from app.models.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    phone = Column(String(50))
    avatar_url = Column(String(500))

    # Preferences (stored as JSON)
    preferences = Column(JSON, default={
        "language": "en",
        "currency": "THB",
        "notifications_enabled": True,
        "dark_mode_enabled": False
    })

    # Loyalty program
    loyalty_level = Column(String(20), default="bronze")
    loyalty_points = Column(String(50), default="200")

    # Favorites (stored as JSON arrays)
    favorite_vehicles = Column(JSON, default=[])
    favorite_properties = Column(JSON, default=[])
    favorite_tours = Column(JSON, default=[])

    # Status
    is_active = Column(Boolean, default=True)
    verified_email = Column(Boolean, default=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

#### 3.3.4 Pydantic Schemas

```python
# app/schemas/user.py
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    name: str = Field(..., min_length=2, max_length=100)
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    preferences: Optional[dict] = None

class UserResponse(UserBase):
    id: UUID
    avatar_url: Optional[str] = None
    preferences: dict
    loyalty_level: str
    loyalty_points: str
    favorite_vehicles: List[UUID] = []
    favorite_properties: List[UUID] = []
    favorite_tours: List[UUID] = []
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class TokenPairResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse
```

#### 3.3.5 Router Example

```python
# app/routers/vehicles.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from uuid import UUID

from app.database import get_db
from app.models.vehicle import Vehicle
from app.schemas.vehicle import VehicleResponse

router = APIRouter()

@router.get("/", response_model=List[VehicleResponse])
async def get_vehicles(
    type: Optional[str] = Query(None, description="Vehicle type filter"),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    available_only: bool = Query(False),
    db: AsyncSession = Depends(get_db)
):
    """Get list of vehicles with optional filters."""
    query = select(Vehicle)

    if type:
        query = query.where(Vehicle.type == type)
    if min_price is not None:
        query = query.where(Vehicle.price_per_day >= min_price)
    if max_price is not None:
        query = query.where(Vehicle.price_per_day <= max_price)
    if available_only:
        query = query.where(Vehicle.is_available == True)

    query = query.order_by(Vehicle.price_per_day)

    result = await db.execute(query)
    vehicles = result.scalars().all()

    return [VehicleResponse.model_validate(v) for v in vehicles]

@router.get("/{vehicle_id}", response_model=VehicleResponse)
async def get_vehicle(
    vehicle_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get vehicle by ID."""
    result = await db.execute(
        select(Vehicle).where(Vehicle.id == vehicle_id)
    )
    vehicle = result.scalar_one_or_none()

    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    return VehicleResponse.model_validate(vehicle)
```

#### 3.3.6 Auth Service

```python
# app/services/auth.py
from datetime import datetime, timedelta
from typing import Optional
from uuid import uuid4
import secrets

from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config import settings
from app.models.user import User

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(user_id: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": user_id,
        "exp": expire,
        "jti": str(uuid4()),
        "type": "access"
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {
        "sub": user_id,
        "exp": expire,
        "jti": str(uuid4()),
        "type": "refresh"
    }
    return jwt.encode(payload, settings.REFRESH_SECRET_KEY, algorithm=settings.ALGORITHM)

def verify_access_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != "access":
            return None
        return payload.get("sub")
    except JWTError:
        return None

def verify_refresh_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, settings.REFRESH_SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != "refresh":
            return None
        return payload.get("sub")
    except JWTError:
        return None

async def get_current_user(token: str, db: AsyncSession) -> Optional[User]:
    user_id = verify_access_token(token)
    if not user_id:
        return None

    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()
```

---

## 4. Data Flow

### 4.1 Request Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            REQUEST FLOW                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. User Action                                                            │
│     └── SwiftUI View (button tap, pull-to-refresh)                         │
│                                                                             │
│  2. ViewModel                                                              │
│     └── viewModel.loadVehicles()                                           │
│     └── @Published state changes → View updates                            │
│                                                                             │
│  3. Repository                                                             │
│     └── repository.fetchVehicles()                                         │
│     └── Check cache → if miss, call network                                │
│                                                                             │
│  4. NetworkManager                                                         │
│     └── Build URLRequest with auth headers                                 │
│     └── SSL Pinning validation                                             │
│     └── Send request via URLSession                                        │
│                                                                             │
│  5. API Gateway (CloudFlare)                                               │
│     └── DDoS protection                                                    │
│     └── WAF rules                                                          │
│     └── Forward to origin                                                  │
│                                                                             │
│  6. Load Balancer                                                          │
│     └── Route to healthy API pod                                           │
│                                                                             │
│  7. FastAPI Middleware                                                     │
│     └── CORS check                                                         │
│     └── Rate limiting check                                                │
│     └── Security headers                                                   │
│     └── JWT validation                                                     │
│                                                                             │
│  8. Router                                                                 │
│     └── Path parameter validation                                          │
│     └── Query parameter parsing                                            │
│     └── Call service/repository                                            │
│                                                                             │
│  9. Database                                                               │
│     └── SQLAlchemy query execution                                         │
│     └── Return model instances                                             │
│                                                                             │
│  10. Response                                                              │
│      └── Pydantic schema validation                                        │
│      └── JSON serialization                                                │
│      └── Back through all layers                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 State Management (iOS)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         STATE MANAGEMENT                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      AppState (Global)                               │   │
│  │                                                                      │   │
│  │  @Published var isAuthenticated: Bool                               │   │
│  │  @Published var currentUser: User?                                  │   │
│  │  @Published var hasSeenOnboarding: Bool                            │   │
│  │  @Published var selectedTab: Tab                                   │   │
│  │                                                                      │   │
│  └────────────────────────────────┬────────────────────────────────────┘   │
│                                   │                                        │
│                    @EnvironmentObject                                      │
│                                   │                                        │
│     ┌─────────────────────────────┼─────────────────────────────────┐      │
│     │                             │                             │          │
│     ▼                             ▼                             ▼          │
│  ┌──────────────┐          ┌──────────────┐          ┌──────────────┐     │
│  │ HomeViewModel│          │TransportVM   │          │ProfileVM     │     │
│  │              │          │              │          │              │     │
│  │@Published    │          │@Published    │          │@Published    │     │
│  │ weather      │          │ vehicles     │          │ bookings     │     │
│  │ featured     │          │ filters      │          │ favorites    │     │
│  │ isLoading    │          │ isLoading    │          │ isLoading    │     │
│  └──────────────┘          └──────────────┘          └──────────────┘     │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      Persistence Layer                               │   │
│  │                                                                      │   │
│  │  UserDefaults          SwiftData           Keychain                 │   │
│  │  • Preferences         • Cached data       • Auth tokens            │   │
│  │  • Settings            • Offline data      • Sensitive data         │   │
│  │  • Flags               • User data         • Encryption keys        │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Error Handling

### 5.1 iOS Error Handling

```swift
// Error types
enum AppError: LocalizedError {
    case network(NetworkError)
    case validation(String)
    case authentication(String)
    case unknown(Error)

    var errorDescription: String? {
        switch self {
        case .network(let error): return error.localizedDescription
        case .validation(let message): return message
        case .authentication(let message): return message
        case .unknown(let error): return error.localizedDescription
        }
    }
}

enum NetworkError: LocalizedError {
    case noConnection
    case timeout
    case invalidResponse
    case httpError(code: Int)
    case decodingError
    case sslPinningFailed
    case rateLimited
    case notFound

    var errorDescription: String? {
        switch self {
        case .noConnection: return "No internet connection"
        case .timeout: return "Request timed out"
        case .invalidResponse: return "Invalid server response"
        case .httpError(let code): return "Server error: \(code)"
        case .decodingError: return "Failed to parse response"
        case .sslPinningFailed: return "Security verification failed"
        case .rateLimited: return "Too many requests. Please wait."
        case .notFound: return "Resource not found"
        }
    }
}

// Error handling in ViewModel
@MainActor
class BaseViewModel: ObservableObject {
    @Published var error: AppError?
    @Published var showError = false

    func handleError(_ error: Error) {
        if let networkError = error as? NetworkError {
            self.error = .network(networkError)
        } else {
            self.error = .unknown(error)
        }
        self.showError = true
    }
}
```

### 5.2 Backend Error Handling

```python
# app/exceptions.py
from fastapi import HTTPException, status

class AppException(HTTPException):
    def __init__(self, status_code: int, code: str, message: str):
        super().__init__(
            status_code=status_code,
            detail={"code": code, "message": message}
        )

class NotFoundError(AppException):
    def __init__(self, resource: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            code="NOT_FOUND",
            message=f"{resource} not found"
        )

class ValidationError(AppException):
    def __init__(self, message: str):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            code="VALIDATION_ERROR",
            message=message
        )

class AuthenticationError(AppException):
    def __init__(self, message: str = "Authentication required"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            code="AUTHENTICATION_ERROR",
            message=message
        )

class RateLimitError(AppException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            code="RATE_LIMIT_EXCEEDED",
            message="Too many requests. Please try again later."
        )

# Exception handler
@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "meta": {
                "requestId": request.headers.get("X-Request-ID"),
                "timestamp": datetime.utcnow().isoformat()
            }
        }
    )
```

---

## 6. Testing Strategy

### 6.1 iOS Testing

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          TESTING PYRAMID                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                              ┌────────┐                                    │
│                             /│  E2E   │\                                   │
│                            / │ Tests  │ \                                  │
│                           /  └────────┘  \                                 │
│                          /   (XCUITest)   \                                │
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
│              /    (ViewModels, Services, Utils)       \                    │
│             /                                           \                  │
│            └─────────────────────────────────────────────┘                 │
│                                                                             │
│  Coverage Targets:                                                         │
│  • Unit Tests: 80%                                                        │
│  • Integration Tests: 60%                                                 │
│  • E2E Tests: Critical paths (auth, booking)                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Backend Testing

```python
# tests/conftest.py
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from app.main import app
from app.database import Base, get_db

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

@pytest.fixture
async def async_client():
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client

@pytest.fixture
async def test_db():
    engine = create_async_engine(TEST_DATABASE_URL, echo=True)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSession(engine) as session:
        yield session

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

# tests/test_vehicles.py
import pytest

@pytest.mark.asyncio
async def test_get_vehicles(async_client):
    response = await async_client.get("/vehicles")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

@pytest.mark.asyncio
async def test_get_vehicle_not_found(async_client):
    response = await async_client.get("/vehicles/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404
```

---

## 7. Coding Standards

### 7.1 Swift Style Guide

```swift
// File header
//
//  VehicleDetailView.swift
//  PhuketApp
//
//  Created by Team on 12/12/2025.
//

// MARK: - Naming conventions
// Types: PascalCase
struct VehicleDetailView: View { }
class NetworkManager { }
enum VehicleType { }
protocol VehicleRepositoryProtocol { }

// Variables/Functions: camelCase
let vehicleId: UUID
func fetchVehicles() async throws -> [Vehicle]

// Constants: camelCase (static let) or SCREAMING_SNAKE_CASE for global
static let maxRetryCount = 3
let API_BASE_URL = "https://api.phuket-app.com"

// MARK: - Code organization
struct VehicleDetailView: View {
    // MARK: - Properties
    let vehicle: Vehicle

    // MARK: - State
    @State private var isLoading = false
    @StateObject private var viewModel = VehicleDetailViewModel()

    // MARK: - Body
    var body: some View {
        // ...
    }

    // MARK: - Private Views
    private var headerView: some View {
        // ...
    }

    // MARK: - Private Methods
    private func loadData() async {
        // ...
    }
}
```

### 7.2 Python Style Guide

```python
"""
Vehicle router module.

This module contains all vehicle-related API endpoints.
"""

# Standard library imports
from datetime import datetime
from typing import List, Optional
from uuid import UUID

# Third-party imports
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

# Local imports
from app.database import get_db
from app.models.vehicle import Vehicle
from app.schemas.vehicle import VehicleResponse


# Module-level constants
MAX_VEHICLES_PER_PAGE = 100


class VehicleService:
    """Service class for vehicle operations."""

    def __init__(self, db: AsyncSession):
        """Initialize with database session."""
        self._db = db

    async def get_vehicles(
        self,
        vehicle_type: Optional[str] = None,
        limit: int = 20
    ) -> List[Vehicle]:
        """
        Get list of vehicles with optional filtering.

        Args:
            vehicle_type: Filter by vehicle type
            limit: Maximum number of results

        Returns:
            List of Vehicle model instances
        """
        # Implementation
        pass


# Function naming: snake_case
def calculate_total_price(
    price_per_day: float,
    days: int,
    discount_percent: float = 0
) -> float:
    """Calculate total price with optional discount."""
    total = price_per_day * days
    return total * (1 - discount_percent / 100)
```

---

**Согласовано:**

| Роль | Имя | Подпись | Дата |
|------|-----|---------|------|
| Tech Lead | | | |
| iOS Lead | | | |
| Backend Lead | | | |
| QA Lead | | | |
