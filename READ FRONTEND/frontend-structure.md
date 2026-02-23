# FRONTEND STRUCTURE — Investment Platform

---

## 1. CẤU TRÚC 

Mở bằng VSCode lần đầu, chưa chạy lệnh gì:

```
investment-frontend/
│
├── .editorconfig
├── .gitignore
├── angular.json
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.spec.json
│
├── .vscode/
│   ├── extensions.json
│   ├── launch.json
│   └── tasks.json
│
└── src/
    ├── index.html
    ├── main.ts
    ├── styles.scss
    ├── favicon.ico
    │
    ├── assets/
    │   ├── .gitkeep
    │   └── logo.png
    │
    └── app/
        ├── app.component.ts
        ├── app.component.html
        ├── app.component.scss
        ├── app.config.ts
        ├── app.routes.ts
        │
        ├── core/
        │   ├── guards/
        │   │   └── auth.guard.ts
        │   │
        │   ├── mock-data/
        │   │   └── index.ts
        │   │
        │   ├── models/
        │   │   └── index.ts
        │   │
        │   └── services/
        │       ├── alert.service.ts
        │       ├── api.service.ts
        │       ├── auth.service.ts
        │       ├── market.service.ts
        │       ├── portfolio.service.ts
        │       ├── theme.service.ts
        │       ├── transaction.service.ts
        │       └── websocket.service.ts
        │
        ├── shared/
        │   ├── components/
        │   │   ├── header/
        │   │   │   └── header.component.ts
        │   │   └── sidebar/
        │   │       └── sidebar.component.ts
        │   └── pipes/
        │       └── vnd.pipe.ts
        │
        ├── layouts/
        │   └── main-layout/
        │       └── main-layout.component.ts
        │
        └── features/
            ├── auth/
            │   ├── login/
            │   │   └── login.component.ts
            │   └── register/
            │       └── register.component.ts
            │
            ├── dashboard/
            │   └── dashboard.component.ts
            │
            ├── portfolio/
            │   ├── accounts/
            │   │   └── accounts.component.ts
            │   ├── holdings/
            │   │   └── holdings.component.ts
            │   └── allocation/
            │       └── allocation.component.ts
            │
            ├── transactions/
            │   ├── transaction-list/
            │   │   └── transaction-list.component.ts
            │   ├── transaction-form/
            │   │   └── transaction-form.component.ts
            │   └── import-export/
            │       └── import-export.component.ts
            │
            ├── market/
            │   ├── market-board/
            │   │   └── market-board.component.ts
            │   ├── order-book/
            │   │   └── order-book.component.ts
            │   └── watchlist/
            │       └── watchlist.component.ts
            │
            ├── technical-analysis/
            │   ├── price-chart/
            │   │   └── price-chart.component.ts
            │   ├── patterns/
            │   │   └── patterns.component.ts
            │   └── backtesting/
            │       └── backtesting.component.ts
            │
            ├── fundamental/
            │   ├── company-profile/
            │   │   └── company-profile.component.ts
            │   ├── financials/
            │   │   └── financials.component.ts
            │   └── screener/
            │       └── screener.component.ts
            │
            ├── risk/
            │   ├── risk-metrics/
            │   │   └── risk-metrics.component.ts
            │   └── stress-test/
            │       └── stress-test.component.ts
            │
            ├── reports/
            │   ├── performance/
            │   │   └── performance.component.ts
            │   └── bi-integration/
            │       └── bi-integration.component.ts
            │
            ├── alerts/
            │   ├── alert-config/
            │   │   └── alert-config.component.ts
            │   └── alert-history/
            │       └── alert-history.component.ts
            │
            ├── admin/
            │   ├── user-management/
            │   │   └── user-management.component.ts
            │   ├── system-config/
            │   │   └── system-config.component.ts
            │   └── audit-logs/
            │       └── audit-logs.component.ts
            │
            └── settings/
                └── settings.component.ts
```

**Tổng:** 65 files — 46 TypeScript, 28 standalone components, 8 services.

---

## 2. CHẠY LỆNH CÀI ĐẶT — CÁC FILE ĐƯỢC SINH THÊM

Mở Terminal trong VSCode chạy:

```bash
npm install
```

Lệnh này đọc `package.json` + `package-lock.json`, tải toàn bộ dependencies về. Sau khi chạy xong, thư mục gốc xuất hiện thêm:

```
investment-frontend/
│
├── node_modules/                          ← MỚI (hàng chục nghìn file)
│   ├── @angular/
│   │   ├── animations/
│   │   ├── common/
│   │   ├── compiler/
│   │   ├── compiler-cli/
│   │   ├── core/
│   │   ├── forms/
│   │   ├── platform-browser/
│   │   ├── platform-browser-dynamic/
│   │   ├── router/
│   │   └── cli/
│   ├── @angular-devkit/
│   │   └── build-angular/
│   ├── @ng-bootstrap/
│   │   └── ng-bootstrap/
│   ├── @ngrx/
│   │   └── signals/
│   ├── ag-grid-angular/
│   ├── ag-grid-community/
│   │   └── styles/
│   │       ├── ag-grid.css
│   │       └── ag-theme-quartz.css
│   ├── angular-oauth2-oidc/
│   ├── bootstrap/
│   │   └── dist/
│   │       ├── css/
│   │       │   └── bootstrap.min.css
│   │       └── js/
│   │           └── bootstrap.bundle.min.js
│   ├── bootstrap-icons/
│   │   └── font/
│   │       └── bootstrap-icons.css
│   ├── echarts/
│   ├── ngx-echarts/
│   ├── rxjs/
│   ├── typescript/
│   ├── xlsx/
│   ├── zone.js/
│   └── ... (hàng nghìn packages phụ thuộc khác)
│
├── .angular/                              ← MỚI (cache nội bộ Angular CLI)
│   └── cache/
│       └── 17.3.x/
│
└── (toàn bộ file gốc giữ nguyên)
```

**Lưu ý:** `node_modules/` và `.angular/` đều nằm trong `.gitignore`, không commit lên git.

---

## 3. CHẠY DEV SERVER — CÁC FILE ĐƯỢC SINH THÊM

```bash
ng serve
```

hoặc:

```bash
npm start
```

Angular CLI biên dịch TypeScript + SCSS, bundle tất cả thành JavaScript, tạo dev server tại `http://localhost:4200`. Trong quá trình này:

```
investment-frontend/
│
├── .angular/                              ← CẬP NHẬT
│   └── cache/
│       └── 17.3.x/
│           └── vite/
│               └── deps/                  ← Cache Vite pre-bundled deps
│
└── (không sinh file nào thêm vào src/, tất cả serve từ memory)
```

`ng serve` **không tạo file output trên ổ đĩa** — toàn bộ bundle nằm trong bộ nhớ, phục vụ qua HTTP.

Terminal hiển thị:

```
Application bundle generation complete.

Watch mode enabled. Watching for file changes...
  ➜  Local:   http://localhost:4200/
  ➜  Network: http://192.168.x.x:4200/
```

---

## 4. BUILD PRODUCTION — CÁC FILE ĐƯỢC SINH THÊM

```bash
ng build
```

hoặc:

```bash
npm run build
```

Sinh ra thư mục `dist/` chứa bản production đã tối ưu:

```
investment-frontend/
│
├── dist/                                  ← MỚI
│   └── investment-platform/
│       └── browser/
│           ├── index.html
│           ├── favicon.ico
│           ├── main-[hash].js
│           ├── polyfills-[hash].js
│           ├── styles-[hash].css
│           ├── chunk-[hash].js            ← lazy-loaded: dashboard
│           ├── chunk-[hash].js            ← lazy-loaded: login
│           ├── chunk-[hash].js            ← lazy-loaded: market-board
│           ├── chunk-[hash].js            ← lazy-loaded: price-chart
│           ├── chunk-[hash].js            ← (... ~30 lazy chunks, mỗi route 1 chunk)
│           ├── assets/
│           │   └── logo.png
│           ├── media/
│           │   └── bootstrap-icons-[hash].woff2
│           └── 3rdpartylicenses.txt
│
└── (toàn bộ file gốc giữ nguyên)
```

---

## 5. TRẢI NGHIỆM WEB TRÊN TRÌNH DUYỆT

### Bước 1 — Cài đặt

```bash
npm install
```

### Bước 2 — Khởi chạy

```bash
ng serve
```

### Bước 3 — Mở trình duyệt

```
http://localhost:4200
```

### Bước 4 — Đăng nhập với tài khoản demo

| Vai trò   | Email                     | Mật khẩu   |
|-----------|---------------------------|-------------|
| Investor  | investor@investment.vn    | 123456      |
| Admin     | admin@investment.vn       | admin123    |
| Analyst   | analyst@investment.vn     | analyst123  |

### Bước 5 — Điều hướng

Sau đăng nhập, sidebar bên trái chứa toàn bộ menu:

```
/dashboard                    Tổng quan
/portfolio/accounts           Tài khoản đầu tư
/portfolio/holdings           Danh mục vị thế
/portfolio/allocation         Phân bổ & Tái cân bằng
/transactions                 Lịch sử giao dịch
/transactions/new             Nhập lệnh mới
/transactions/import          Import/Export file
/market                       Bảng giá real-time
/market/orderbook             Sổ lệnh chuyên sâu
/market/watchlist             Watchlist
/analysis/chart               Biểu đồ kỹ thuật
/analysis/patterns            Nhận dạng Pattern
/analysis/backtest            Backtesting
/fundamental/profile          Hồ sơ doanh nghiệp
/fundamental/financials       Báo cáo tài chính
/fundamental/screener         Sàng lọc cổ phiếu
/risk                         Quản lý rủi ro
/risk/stress-test             Stress Testing
/reports                      Báo cáo hiệu suất
/reports/bi                   Tích hợp BI Tools
/alerts                       Cài đặt cảnh báo
/alerts/history               Lịch sử cảnh báo
/admin/users                  Quản lý người dùng (Admin)
/admin/config                 Nguồn dữ liệu (Admin)
/admin/audit                  Nhật ký hệ thống (Admin)
/settings                     Cài đặt cá nhân
/login                        Đăng nhập
/register                     Đăng ký
```

---

## 6. TƯƠNG THÍCH VỚI BACKEND

### 6.1 Tổng quan kết nối

```
┌────────────────────────┐       ┌────────────────────────┐
│   Angular Frontend     │       │   Go Backend           │
│   (localhost:4200)     │       │   (localhost:8080)      │
│                        │       │                        │
│  api.service.ts ───REST/HTTPS──→ API Gateway (Gin/Echo) │
│                        │       │   │                    │
│  websocket.service.ts ─WSS─────→ Real-time Service      │
│                        │       │   │                    │
│  BI embed (iframe) ──HTTPS─────→ Tableau / Power BI     │
│                        │       │   / Cognos Server      │
└────────────────────────┘       └────────────────────────┘
```

### 6.2 Cơ chế Mock ↔ Real

File `src/app/core/services/api.service.ts` dòng 9:

```typescript
const USE_MOCK = true;       // ← true  = dùng mock data, không gọi backend
const API_BASE = '/api/v1';  // ← false = gọi thật tới Go backend
```

Khi `USE_MOCK = true`, mọi hàm get/post/put/delete trả về `of(null)` và các service (portfolio, market, transaction, alert) đều đọc từ `core/mock-data/index.ts`.

Khi chuyển sang backend thật, chỉ cần:
1. Đổi `USE_MOCK = false`
2. Cấu hình proxy trong `angular.json` hoặc `proxy.conf.json` trỏ `/api/v1/*` về `http://localhost:8080`
3. Cấu hình WebSocket endpoint trong `websocket.service.ts` trỏ về `ws://localhost:8080/ws/market`

### 6.3 REST API Endpoints — Frontend gọi, Backend phục vụ

Tất cả đều qua prefix `/api/v1/`. Dưới đây là danh sách đầy đủ các endpoint mà `api.service.ts` gọi tới:

**Auth Service**
```
POST   /api/v1/auth/login
POST   /api/v1/auth/register
POST   /api/v1/auth/refresh
GET    /api/v1/auth/profile
```

**Portfolio Service**
```
GET    /api/v1/accounts
GET    /api/v1/accounts/{id}
POST   /api/v1/accounts
PUT    /api/v1/accounts/{id}
DELETE /api/v1/accounts/{id}
GET    /api/v1/accounts/{id}/summary
GET    /api/v1/accounts/{id}/holdings
GET    /api/v1/accounts/{id}/allocation
POST   /api/v1/accounts/{id}/allocation/target
```

**Transaction Service**
```
GET    /api/v1/transactions
POST   /api/v1/transactions
PUT    /api/v1/transactions/{id}
DELETE /api/v1/transactions/{id}
POST   /api/v1/transactions/import/preview
POST   /api/v1/transactions/import/confirm
```

**Market Data Service**
```
GET    /api/v1/market/quotes
GET    /api/v1/market/quotes/{symbol}
GET    /api/v1/market/indices
GET    /api/v1/market/ohlcv/{symbol}
GET    /api/v1/market/indicators/{symbol}
```

**Watchlist Service**
```
GET    /api/v1/watchlists
POST   /api/v1/watchlists
PUT    /api/v1/watchlists/{id}
DELETE /api/v1/watchlists/{id}
POST   /api/v1/watchlists/{id}/symbols
DELETE /api/v1/watchlists/{id}/symbols/{symbol}
```

**Fundamental Service**
```
GET    /api/v1/fundamentals/{symbol}/profile
GET    /api/v1/fundamentals/{symbol}/financials/{type}
GET    /api/v1/fundamentals/{symbol}/valuation
```

**Analytics Service**
```
GET    /api/v1/analytics/patterns/{symbol}
POST   /api/v1/analytics/patterns/scan
POST   /api/v1/backtesting/run
POST   /api/v1/screener/run
```

**Risk Service**
```
GET    /api/v1/risk/{accountId}/metrics
GET    /api/v1/risk/{accountId}/var
GET    /api/v1/risk/{accountId}/correlation
GET    /api/v1/risk/{accountId}/limits
POST   /api/v1/risk/{accountId}/limits
POST   /api/v1/risk/{accountId}/stress-test
```

**Report & BI Service**
```
GET    /api/v1/reports/performance/{accountId}
GET    /api/v1/reports/returns/{accountId}
GET    /api/v1/reports/attribution/{accountId}
GET    /api/v1/bi/tableau/token
GET    /api/v1/bi/powerbi/embed-token
GET    /api/v1/bi/cognos/tax-report/{year}
```

**Alert & Notification Service**
```
GET    /api/v1/alerts
POST   /api/v1/alerts
PUT    /api/v1/alerts/{id}
PUT    /api/v1/alerts/{id}/toggle
GET    /api/v1/alerts/history
PUT    /api/v1/alerts/history/{id}/read
```

**Corporate Action Service**
```
GET    /api/v1/corporate-actions
POST   /api/v1/corporate-actions
POST   /api/v1/corporate-actions/{id}/apply
GET    /api/v1/corporate-actions/calendar
```

**Export Service**
```
GET    /api/v1/export/portfolio/{accountId}
GET    /api/v1/export/transactions/{accountId}
GET    /api/v1/export/pnl/{accountId}
GET    /api/v1/export/tax/{accountId}/{year}
```

**Admin & Config Service**
```
GET    /api/v1/admin/users
PUT    /api/v1/admin/users/{id}
GET    /api/v1/admin/data-sources
POST   /api/v1/admin/data-sources/{id}/test
GET    /api/v1/audit-logs
GET    /api/v1/settings/user
PUT    /api/v1/settings/user
```

### 6.4 WebSocket Endpoints — Frontend lắng nghe, Backend đẩy

```
wss://api.domain.com/ws/market              Giá cổ phiếu real-time
wss://api.domain.com/ws/portfolio           NAV, P&L danh mục real-time
wss://api.domain.com/ws/orderbook/{symbol}  Sổ lệnh real-time
wss://api.domain.com/ws/alerts              Cảnh báo real-time
wss://api.domain.com/ws/news                Tin tức thị trường
```

Message format JSON mà frontend đã define sẵn trong `websocket.service.ts`:

```typescript
interface WsMessage {
  type: 'QUOTE_UPDATE' | 'NAV_UPDATE' | 'POSITION_UPDATE'
      | 'INDEX_UPDATE' | 'ALERT' | 'NEWS_FEED' | 'PNL_UPDATE';
  data: any;
  timestamp?: string;
}
```

### 6.5 Xác thực — JWT Bearer Token

Frontend gửi JWT trong header mỗi request REST:

```
Authorization: Bearer <access_token>
```

Token được lưu trong `localStorage` sau khi đăng nhập qua `POST /api/v1/auth/login`. Thư viện `angular-oauth2-oidc` đã cài sẵn, sẵn sàng cấu hình OAuth2/OIDC khi backend bật OAuth provider.

### 6.6 Phân quyền RBAC — Frontend guard ↔ Backend middleware

| Role     | Frontend Guard  | Backend Middleware   | Quyền truy cập                              |
|----------|-----------------|----------------------|----------------------------------------------|
| admin    | `adminGuard`    | `RequireAdmin()`     | Toàn quyền, quản lý user, config hệ thống   |
| analyst  | `roleGuard(['analyst'])` | `RequireRole("analyst")` | Xem tất cả, tạo báo cáo BI          |
| investor | `roleGuard(['investor'])` | `RequireRole("investor")` | Quản lý danh mục cá nhân             |

### 6.7 BI Tools Embed — Frontend nhúng, Backend cấp token

```
Frontend                         Backend                        BI Server
   │                                │                               │
   ├─GET /bi/tableau/token─────────→│                               │
   │                                ├─Request trusted ticket───────→│
   │                                │←─Return token────────────────┤
   │←─Return embed token───────────┤                               │
   │                                                                │
   ├─Load <tableau-viz> với token──────────────────────────────────→│
   │←─Render dashboard─────────────────────────────────────────────┤
```

Tương tự cho Power BI (JavaScript SDK + embed token) và Cognos (REST API).

### 6.8 Database ↔ TypeScript Models

Mỗi bảng trong MariaDB/Db2 đều có TypeScript interface tương ứng trong `core/models/index.ts`:

```
DB Table (MariaDB/Db2)          TypeScript Interface
─────────────────────           ────────────────────
users                      →   User
investment_accounts        →   InvestmentAccount
holdings                   →   Holding
transactions               →   Transaction
corporate_actions          →   CorporateAction
watchlists                 →   Watchlist
watchlist_symbols          →   (embedded in Watchlist.symbols[])
alert_configs              →   AlertConfig
alert_history              →   AlertHistory
backtest_strategies        →   BacktestConfig
backtest_results           →   BacktestResult
user_settings              →   UserSettings
data_sources               →   DataSource
audit_logs                 →   AuditLog
```
