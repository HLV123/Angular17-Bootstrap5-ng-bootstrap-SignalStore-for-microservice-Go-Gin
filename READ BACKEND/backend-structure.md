# BACKEND STRUCTURE — Investment Platform

**Stack:** Go 1.22+ · Gin · gRPC · MariaDB/Db2 · Redis · WebSocket · Protobuf
**Kiến trúc:** Microservices — 8 services + 1 API Gateway + 1 Realtime Gateway

---

## 1. CẤU TRÚC TỔNG QUAN

```
investment-backend/
│
├── go.work
├── go.work.sum
├── Makefile
├── docker-compose.yml
├── docker-compose.dev.yml
├── .env.example
├── .gitignore
├── README.md
│
├── proto/
│   ├── buf.yaml
│   ├── buf.gen.yaml
│   ├── market/
│   │   └── v1/
│   │       └── market.proto
│   ├── portfolio/
│   │   └── v1/
│   │       └── portfolio.proto
│   ├── analytics/
│   │   └── v1/
│   │       └── analytics.proto
│   └── notification/
│       └── v1/
│           └── notification.proto
│
├── pkg/
│   ├── config/
│   │   └── config.go
│   ├── logger/
│   │   └── logger.go
│   ├── database/
│   │   ├── mariadb.go
│   │   └── db2.go
│   ├── cache/
│   │   └── redis.go
│   ├── auth/
│   │   ├── jwt.go
│   │   ├── oauth2.go
│   │   ├── mfa.go
│   │   └── middleware.go
│   ├── middleware/
│   │   ├── cors.go
│   │   ├── ratelimit.go
│   │   ├── audit.go
│   │   └── recovery.go
│   ├── response/
│   │   └── response.go
│   ├── validator/
│   │   └── validator.go
│   └── utils/
│       ├── pagination.go
│       ├── time.go
│       └── export.go
│
├── api-gateway/
│   ├── go.mod
│   ├── go.sum
│   ├── Dockerfile
│   ├── main.go
│   └── internal/
│       ├── router/
│       │   └── router.go
│       └── proxy/
│           ├── auth.go
│           ├── portfolio.go
│           ├── market.go
│           ├── analytics.go
│           ├── risk.go
│           ├── report.go
│           ├── alert.go
│           └── config.go
│
├── realtime-gateway/
│   ├── go.mod
│   ├── go.sum
│   ├── Dockerfile
│   ├── main.go
│   └── internal/
│       ├── hub/
│       │   └── hub.go
│       ├── handler/
│       │   ├── market_ws.go
│       │   ├── portfolio_ws.go
│       │   ├── orderbook_ws.go
│       │   ├── alert_ws.go
│       │   └── news_ws.go
│       └── broadcaster/
│           └── broadcaster.go
│
├── services/
│   │
│   ├── auth-service/
│   │   ├── go.mod
│   │   ├── go.sum
│   │   ├── Dockerfile
│   │   ├── main.go
│   │   └── internal/
│   │       ├── handler/
│   │       │   ├── register.go
│   │       │   ├── login.go
│   │       │   ├── refresh.go
│   │       │   ├── logout.go
│   │       │   ├── profile.go
│   │       │   ├── password.go
│   │       │   └── mfa.go
│   │       ├── service/
│   │       │   └── auth_service.go
│   │       ├── repository/
│   │       │   └── user_repo.go
│   │       └── model/
│   │           └── user.go
│   │
│   ├── portfolio-service/
│   │   ├── go.mod
│   │   ├── go.sum
│   │   ├── Dockerfile
│   │   ├── main.go
│   │   └── internal/
│   │       ├── handler/
│   │       │   ├── account.go
│   │       │   ├── holding.go
│   │       │   ├── allocation.go
│   │       │   ├── transaction.go
│   │       │   ├── import.go
│   │       │   ├── corporate_action.go
│   │       │   ├── watchlist.go
│   │       │   └── export.go
│   │       ├── service/
│   │       │   ├── account_service.go
│   │       │   ├── holding_service.go
│   │       │   ├── allocation_service.go
│   │       │   ├── transaction_service.go
│   │       │   ├── import_service.go
│   │       │   ├── corporate_action_service.go
│   │       │   ├── watchlist_service.go
│   │       │   ├── cost_calculator.go
│   │       │   └── export_service.go
│   │       ├── repository/
│   │       │   ├── account_repo.go
│   │       │   ├── holding_repo.go
│   │       │   ├── transaction_repo.go
│   │       │   ├── corporate_action_repo.go
│   │       │   └── watchlist_repo.go
│   │       ├── model/
│   │       │   ├── account.go
│   │       │   ├── holding.go
│   │       │   ├── transaction.go
│   │       │   ├── corporate_action.go
│   │       │   └── watchlist.go
│   │       └── grpc/
│   │           ├── server.go
│   │           └── portfolio_grpc.go
│   │
│   ├── market-data-service/
│   │   ├── go.mod
│   │   ├── go.sum
│   │   ├── Dockerfile
│   │   ├── main.go
│   │   └── internal/
│   │       ├── handler/
│   │       │   ├── quote.go
│   │       │   ├── ohlcv.go
│   │       │   ├── index.go
│   │       │   └── indicator.go
│   │       ├── service/
│   │       │   ├── quote_service.go
│   │       │   ├── ohlcv_service.go
│   │       │   ├── index_service.go
│   │       │   └── indicator_service.go
│   │       ├── repository/
│   │       │   ├── quote_repo.go
│   │       │   └── ohlcv_repo.go
│   │       ├── model/
│   │       │   ├── quote.go
│   │       │   ├── ohlcv.go
│   │       │   └── index.go
│   │       ├── provider/
│   │       │   ├── provider.go
│   │       │   ├── hose_feed.go
│   │       │   ├── vndirect.go
│   │       │   ├── ssi_api.go
│   │       │   ├── cafef.go
│   │       │   └── yahoo.go
│   │       ├── grpc/
│   │       │   ├── server.go
│   │       │   └── market_grpc.go
│   │       └── realtime/
│   │           ├── price_engine.go
│   │           └── broadcast.go
│   │
│   ├── analytics-service/
│   │   ├── go.mod
│   │   ├── go.sum
│   │   ├── Dockerfile
│   │   ├── main.go
│   │   └── internal/
│   │       ├── handler/
│   │       │   ├── pattern.go
│   │       │   ├── backtest.go
│   │       │   ├── screener.go
│   │       │   └── fundamental.go
│   │       ├── service/
│   │       │   ├── pattern_service.go
│   │       │   ├── backtest_service.go
│   │       │   ├── screener_service.go
│   │       │   └── fundamental_service.go
│   │       ├── repository/
│   │       │   ├── fundamental_repo.go
│   │       │   ├── backtest_repo.go
│   │       │   └── screener_repo.go
│   │       ├── model/
│   │       │   ├── pattern.go
│   │       │   ├── backtest.go
│   │       │   ├── screener.go
│   │       │   ├── company_profile.go
│   │       │   └── financial_statement.go
│   │       ├── engine/
│   │       │   ├── indicator/
│   │       │   │   ├── ma.go
│   │       │   │   ├── ema.go
│   │       │   │   ├── rsi.go
│   │       │   │   ├── macd.go
│   │       │   │   ├── bollinger.go
│   │       │   │   ├── stochastic.go
│   │       │   │   ├── atr.go
│   │       │   │   ├── obv.go
│   │       │   │   ├── vwap.go
│   │       │   │   └── ichimoku.go
│   │       │   ├── pattern/
│   │       │   │   ├── candlestick.go
│   │       │   │   ├── chart_pattern.go
│   │       │   │   └── scanner.go
│   │       │   └── backtest/
│   │       │       ├── executor.go
│   │       │       ├── strategy.go
│   │       │       └── metrics.go
│   │       └── grpc/
│   │           ├── server.go
│   │           └── analytics_grpc.go
│   │
│   ├── risk-service/
│   │   ├── go.mod
│   │   ├── go.sum
│   │   ├── Dockerfile
│   │   ├── main.go
│   │   └── internal/
│   │       ├── handler/
│   │       │   ├── metrics.go
│   │       │   ├── var.go
│   │       │   ├── correlation.go
│   │       │   ├── drawdown.go
│   │       │   ├── limit.go
│   │       │   ├── stress_test.go
│   │       │   └── scenario.go
│   │       ├── service/
│   │       │   ├── risk_service.go
│   │       │   ├── var_calculator.go
│   │       │   ├── correlation_service.go
│   │       │   ├── stress_test_service.go
│   │       │   └── limit_service.go
│   │       ├── repository/
│   │       │   ├── risk_repo.go
│   │       │   ├── limit_repo.go
│   │       │   └── scenario_repo.go
│   │       ├── model/
│   │       │   ├── risk_metrics.go
│   │       │   ├── risk_limit.go
│   │       │   └── stress_scenario.go
│   │       └── engine/
│   │           ├── historical_var.go
│   │           ├── parametric_var.go
│   │           ├── monte_carlo.go
│   │           └── sharpe_beta.go
│   │
│   ├── report-service/
│   │   ├── go.mod
│   │   ├── go.sum
│   │   ├── Dockerfile
│   │   ├── main.go
│   │   └── internal/
│   │       ├── handler/
│   │       │   ├── performance.go
│   │       │   ├── returns.go
│   │       │   ├── attribution.go
│   │       │   ├── comparison.go
│   │       │   └── bi.go
│   │       ├── service/
│   │       │   ├── performance_service.go
│   │       │   ├── attribution_service.go
│   │       │   └── bi_service.go
│   │       ├── repository/
│   │       │   └── report_repo.go
│   │       ├── model/
│   │       │   ├── performance.go
│   │       │   └── attribution.go
│   │       └── bi/
│   │           ├── tableau.go
│   │           ├── powerbi.go
│   │           ├── cognos.go
│   │           └── odata.go
│   │
│   ├── notification-service/
│   │   ├── go.mod
│   │   ├── go.sum
│   │   ├── Dockerfile
│   │   ├── main.go
│   │   └── internal/
│   │       ├── handler/
│   │       │   ├── alert_config.go
│   │       │   ├── alert_history.go
│   │       │   └── audit_log.go
│   │       ├── service/
│   │       │   ├── alert_service.go
│   │       │   ├── alert_evaluator.go
│   │       │   ├── audit_service.go
│   │       │   └── notification_dispatcher.go
│   │       ├── repository/
│   │       │   ├── alert_repo.go
│   │       │   └── audit_repo.go
│   │       ├── model/
│   │       │   ├── alert_config.go
│   │       │   ├── alert_history.go
│   │       │   └── audit_log.go
│   │       ├── channel/
│   │       │   ├── inapp.go
│   │       │   ├── email.go
│   │       │   └── telegram.go
│   │       └── grpc/
│   │           ├── server.go
│   │           └── notification_grpc.go
│   │
│   └── config-service/
│       ├── go.mod
│       ├── go.sum
│       ├── Dockerfile
│       ├── main.go
│       └── internal/
│           ├── handler/
│           │   ├── user_settings.go
│           │   ├── dashboard_layout.go
│           │   ├── data_source.go
│           │   └── admin_user.go
│           ├── service/
│           │   ├── settings_service.go
│           │   ├── data_source_service.go
│           │   └── admin_service.go
│           ├── repository/
│           │   ├── settings_repo.go
│           │   ├── data_source_repo.go
│           │   └── admin_repo.go
│           └── model/
│               ├── user_settings.go
│               └── data_source.go
│
├── migrations/
│   ├── mariadb/
│   │   ├── 000001_create_users.up.sql
│   │   ├── 000001_create_users.down.sql
│   │   ├── 000002_create_investment_accounts.up.sql
│   │   ├── 000002_create_investment_accounts.down.sql
│   │   ├── 000003_create_holdings.up.sql
│   │   ├── 000003_create_holdings.down.sql
│   │   ├── 000004_create_transactions.up.sql
│   │   ├── 000004_create_transactions.down.sql
│   │   ├── 000005_create_corporate_actions.up.sql
│   │   ├── 000005_create_corporate_actions.down.sql
│   │   ├── 000006_create_watchlists.up.sql
│   │   ├── 000006_create_watchlists.down.sql
│   │   ├── 000007_create_alert_configs.up.sql
│   │   ├── 000007_create_alert_configs.down.sql
│   │   ├── 000008_create_alert_history.up.sql
│   │   ├── 000008_create_alert_history.down.sql
│   │   ├── 000009_create_backtest_strategies.up.sql
│   │   ├── 000009_create_backtest_strategies.down.sql
│   │   ├── 000010_create_backtest_results.up.sql
│   │   ├── 000010_create_backtest_results.down.sql
│   │   ├── 000011_create_user_settings.up.sql
│   │   ├── 000011_create_user_settings.down.sql
│   │   ├── 000012_create_data_sources.up.sql
│   │   ├── 000012_create_data_sources.down.sql
│   │   ├── 000013_create_audit_logs.up.sql
│   │   ├── 000013_create_audit_logs.down.sql
│   │   └── seed/
│   │       ├── 001_seed_users.sql
│   │       ├── 002_seed_accounts.sql
│   │       ├── 003_seed_holdings.sql
│   │       ├── 004_seed_data_sources.sql
│   │       └── 005_seed_settings.sql
│   └── db2/
│       ├── 000001_create_users.up.sql
│       └── ...
│
├── deployments/
│   ├── docker/
│   │   ├── api-gateway.Dockerfile
│   │   ├── realtime-gateway.Dockerfile
│   │   ├── auth-service.Dockerfile
│   │   ├── portfolio-service.Dockerfile
│   │   ├── market-data-service.Dockerfile
│   │   ├── analytics-service.Dockerfile
│   │   ├── risk-service.Dockerfile
│   │   ├── report-service.Dockerfile
│   │   ├── notification-service.Dockerfile
│   │   └── config-service.Dockerfile
│   ├── k8s/
│   │   ├── namespace.yaml
│   │   ├── api-gateway/
│   │   │   ├── deployment.yaml
│   │   │   └── service.yaml
│   │   ├── auth-service/
│   │   │   ├── deployment.yaml
│   │   │   └── service.yaml
│   │   ├── portfolio-service/
│   │   │   ├── deployment.yaml
│   │   │   └── service.yaml
│   │   ├── market-data-service/
│   │   │   ├── deployment.yaml
│   │   │   └── service.yaml
│   │   ├── analytics-service/
│   │   │   ├── deployment.yaml
│   │   │   └── service.yaml
│   │   ├── risk-service/
│   │   │   ├── deployment.yaml
│   │   │   └── service.yaml
│   │   ├── report-service/
│   │   │   ├── deployment.yaml
│   │   │   └── service.yaml
│   │   ├── notification-service/
│   │   │   ├── deployment.yaml
│   │   │   └── service.yaml
│   │   ├── config-service/
│   │   │   ├── deployment.yaml
│   │   │   └── service.yaml
│   │   ├── mariadb/
│   │   │   ├── statefulset.yaml
│   │   │   ├── service.yaml
│   │   │   └── pvc.yaml
│   │   ├── redis/
│   │   │   ├── deployment.yaml
│   │   │   └── service.yaml
│   │   └── ingress.yaml
│   └── terraform/
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
│
├── scripts/
│   ├── proto-gen.sh
│   ├── migrate.sh
│   ├── seed.sh
│   └── dev-up.sh
│
└── docs/
    ├── api-spec/
    │   └── openapi.yaml
    ├── architecture.md
    └── deployment.md
```

---

## 2. CHI TIẾT TỪNG SERVICE

### 2.1 api-gateway `:8080`

Điểm vào duy nhất cho Angular frontend. Nhận tất cả request REST `/api/v1/*`, xác thực JWT, route tới service tương ứng.

```
Request flow:

Angular → :8080/api/v1/accounts → JWT verify → proxy → portfolio-service:8081
Angular → :8080/api/v1/market/*  → JWT verify → proxy → market-data-service:8082
Angular → :8080/api/v1/auth/*    →             → proxy → auth-service:8083
```

Route map trong `router.go`:

```
/api/v1/auth/**                → auth-service:8083
/api/v1/accounts/**            → portfolio-service:8081
/api/v1/transactions/**        → portfolio-service:8081
/api/v1/corporate-actions/**   → portfolio-service:8081
/api/v1/watchlists/**          → portfolio-service:8081
/api/v1/export/**              → portfolio-service:8081
/api/v1/market/**              → market-data-service:8082
/api/v1/analytics/**           → analytics-service:8084
/api/v1/backtesting/**         → analytics-service:8084
/api/v1/screener/**            → analytics-service:8084
/api/v1/fundamentals/**        → analytics-service:8084
/api/v1/risk/**                → risk-service:8085
/api/v1/reports/**             → report-service:8086
/api/v1/bi/**                  → report-service:8086
/api/v1/alerts/**              → notification-service:8087
/api/v1/audit-logs/**          → notification-service:8087
/api/v1/settings/**            → config-service:8088
/api/v1/admin/**               → config-service:8088
```

### 2.2 realtime-gateway `:8090`

WebSocket server riêng, quản lý kết nối và broadcast:

```
wss://.../ws/market              → hub room "market"
wss://.../ws/portfolio           → hub room "portfolio:{userId}"
wss://.../ws/orderbook/{symbol}  → hub room "orderbook:{symbol}"
wss://.../ws/alerts              → hub room "alerts:{userId}"
wss://.../ws/news                → hub room "news"
```

Nhận message từ các service nội bộ qua gRPC streaming hoặc Redis Pub/Sub, broadcast tới các WebSocket client đã subscribe.

### 2.3 auth-service `:8083`

```
POST /auth/register         → handler/register.go
POST /auth/login            → handler/login.go         → JWT access + refresh token
POST /auth/refresh          → handler/refresh.go
POST /auth/logout           → handler/logout.go
GET  /auth/profile          → handler/profile.go
PUT  /auth/profile          → handler/profile.go
POST /auth/forgot-password  → handler/password.go
POST /auth/reset-password   → handler/password.go
POST /auth/mfa/enable       → handler/mfa.go           → TOTP secret
POST /auth/mfa/verify       → handler/mfa.go
```

DB tables: `users`

### 2.4 portfolio-service `:8081`

```
CRUD /accounts              → handler/account.go
GET  /accounts/{id}/summary → handler/account.go       → NAV, P&L via gRPC
GET  /accounts/{id}/holdings           → handler/holding.go
GET  /accounts/{id}/holdings/{symbol}  → handler/holding.go
GET  /accounts/{id}/holdings/summary   → handler/holding.go
GET  /accounts/{id}/allocation         → handler/allocation.go
POST /accounts/{id}/allocation/target  → handler/allocation.go
GET  /accounts/{id}/allocation/suggest → handler/allocation.go
POST /accounts/{id}/allocation/simulate→ handler/allocation.go
CRUD /transactions                     → handler/transaction.go
GET  /transactions/summary             → handler/transaction.go
POST /transactions/import/preview      → handler/import.go
POST /transactions/import/confirm      → handler/import.go
GET  /transactions/import/history      → handler/import.go
GET  /transactions/import/template     → handler/import.go
CRUD /corporate-actions                → handler/corporate_action.go
POST /corporate-actions/{id}/apply     → handler/corporate_action.go
GET  /corporate-actions/calendar       → handler/corporate_action.go
CRUD /watchlists                       → handler/watchlist.go
POST /watchlists/{id}/symbols          → handler/watchlist.go
DELETE /watchlists/{id}/symbols/{sym}  → handler/watchlist.go
GET  /export/portfolio/{id}            → handler/export.go
GET  /export/transactions/{id}         → handler/export.go
GET  /export/pnl/{id}                  → handler/export.go
GET  /export/tax/{id}/{year}           → handler/export.go
```

DB tables: `investment_accounts`, `holdings`, `transactions`, `corporate_actions`, `watchlists`, `watchlist_symbols`

gRPC server exposes: `PortfolioService.GetPositions()`, `CalcNAV()`, `CalcPnL()`

### 2.5 market-data-service `:8082`

```
GET /market/quotes              → handler/quote.go
GET /market/quotes/{symbol}     → handler/quote.go
GET /market/indices             → handler/index.go
GET /market/ohlcv/{symbol}      → handler/ohlcv.go
GET /market/indicators/{symbol} → handler/indicator.go
```

DB tables: quote cache (Redis), ohlcv history (MariaDB time-series table)

gRPC server exposes: `MarketDataService.StreamQuote()`, `GetHistoricalData()`, `GetOrderBook()`

Data providers trong `provider/`: HOSE feed, VNDirect API, SSI API, CafeF scraper, Yahoo Finance — chạy song song, ưu tiên theo `priority` trong `data_sources` table.

### 2.6 analytics-service `:8084`

```
GET  /analytics/patterns/{symbol}  → handler/pattern.go
POST /analytics/patterns/scan      → handler/pattern.go
POST /backtesting/run              → handler/backtest.go
GET  /backtesting/{id}             → handler/backtest.go
GET  /backtesting                  → handler/backtest.go
POST /backtesting/compare          → handler/backtest.go
POST /screener/run                 → handler/screener.go
GET  /screener/saved               → handler/screener.go
POST /screener/saved               → handler/screener.go
GET  /fundamentals/{sym}/profile        → handler/fundamental.go
GET  /fundamentals/{sym}/officers       → handler/fundamental.go
GET  /fundamentals/{sym}/events         → handler/fundamental.go
GET  /fundamentals/{sym}/financials/*   → handler/fundamental.go
GET  /fundamentals/{sym}/valuation      → handler/fundamental.go
GET  /fundamentals/{sym}/profitability  → handler/fundamental.go
GET  /fundamentals/{sym}/growth         → handler/fundamental.go
GET  /fundamentals/{sym}/liquidity      → handler/fundamental.go
```

DB tables: `backtest_strategies`, `backtest_results`, fundamental data tables

gRPC server exposes: `AnalyticsService.RunTechnicalIndicator()`, `GetRiskMetrics()`, `CalcCorrelation()`, `RunBacktest()`

Computation engine: `engine/indicator/` (MA, EMA, RSI, MACD, Bollinger, Stochastic, ATR, OBV, VWAP, Ichimoku), `engine/pattern/` (candlestick + chart patterns), `engine/backtest/` (strategy executor + metrics calculator)

### 2.7 risk-service `:8085`

```
GET  /risk/{id}/metrics      → handler/metrics.go
GET  /risk/{id}/var          → handler/var.go
GET  /risk/{id}/correlation  → handler/correlation.go
GET  /risk/{id}/drawdown     → handler/drawdown.go
CRUD /risk/{id}/limits       → handler/limit.go
GET  /risk/scenarios         → handler/scenario.go
POST /risk/scenarios         → handler/scenario.go
POST /risk/{id}/stress-test  → handler/stress_test.go
```

DB tables: risk limits, stress scenarios (MariaDB)

Engine: `engine/historical_var.go`, `parametric_var.go`, `monte_carlo.go`, `sharpe_beta.go`

### 2.8 report-service `:8086`

```
GET /reports/performance/{id}   → handler/performance.go
GET /reports/returns/{id}       → handler/returns.go
GET /reports/attribution/{id}   → handler/attribution.go
GET /reports/comparison/{id}    → handler/comparison.go
GET /reports/transactions/{id}  → handler/performance.go
GET /bi/tableau/token           → handler/bi.go → bi/tableau.go
GET /bi/powerbi/embed-token     → handler/bi.go → bi/powerbi.go
GET /bi/powerbi/reports         → handler/bi.go → bi/powerbi.go
GET /bi/cognos/tax-report/{y}   → handler/bi.go → bi/cognos.go
GET /bi/cognos/realized-pnl/{y} → handler/bi.go → bi/cognos.go
GET /bi/cognos/dividend-income/{y} → handler/bi.go → bi/cognos.go
GET /bi/data/portfolio-summary  → handler/bi.go → bi/tableau.go
GET /bi/data/transactions       → handler/bi.go → bi/tableau.go
GET /bi/data/performance        → handler/bi.go → bi/tableau.go
GET /bi/odata/transactions      → handler/bi.go → bi/odata.go
GET /bi/odata/portfolio         → handler/bi.go → bi/odata.go
```

### 2.9 notification-service `:8087`

```
CRUD /alerts                    → handler/alert_config.go
PUT  /alerts/{id}/toggle        → handler/alert_config.go
GET  /alerts/history            → handler/alert_history.go
PUT  /alerts/history/{id}/read  → handler/alert_history.go
GET  /audit-logs                → handler/audit_log.go
GET  /audit-logs/export         → handler/audit_log.go
```

DB tables: `alert_configs`, `alert_history`, `audit_logs`

gRPC server exposes: `NotificationService.SendAlert()`, `BroadcastEvent()`

Dispatch channels: `channel/inapp.go` (→ realtime-gateway), `channel/email.go` (SMTP), `channel/telegram.go` (Bot API webhook)

### 2.10 config-service `:8088`

```
GET  /settings/user              → handler/user_settings.go
PUT  /settings/user              → handler/user_settings.go
GET  /settings/user/dashboard    → handler/dashboard_layout.go
PUT  /settings/user/dashboard    → handler/dashboard_layout.go
GET  /admin/users                → handler/admin_user.go
GET  /admin/users/{id}           → handler/admin_user.go
PUT  /admin/users/{id}           → handler/admin_user.go
DELETE /admin/users/{id}         → handler/admin_user.go
GET  /admin/users/activity       → handler/admin_user.go
CRUD /admin/data-sources         → handler/data_source.go
POST /admin/data-sources/{id}/test → handler/data_source.go
```

DB tables: `user_settings`, `data_sources`

---

## 3. GIAO TIẾP GIỮA CÁC SERVICE

```
                        ┌──────────────────┐
          REST :8080    │   api-gateway    │    WSS :8090    ┌──────────────────┐
Angular ───────────────→│   (Gin router)   │←──────────────→ │ realtime-gateway │
                        │   JWT verify     │                 │ (WebSocket hub)  │
                        └──────┬───────────┘                 └────────┬─────────┘
                               │ HTTP proxy                           │
          ┌────────────────────┼───────────────────────────┐          │
          │                    │                           │          │
          ▼                    ▼                           ▼          │ Redis Pub/Sub
   ┌─────────────┐   ┌──────────────────┐   ┌──────────────────┐    │ + gRPC stream
   │ auth-service│   │portfolio-service │   │market-data-svc  │    │
   │    :8083    │   │     :8081        │   │     :8082        │────┘
   └─────────────┘   └───────┬──────────┘   └───────┬──────────┘
                              │ gRPC                  │ gRPC
                              ▼                       ▼
                     ┌──────────────────┐   ┌──────────────────┐
                     │analytics-service │   │ risk-service     │
                     │     :8084        │   │     :8085        │
                     └──────────────────┘   └──────────────────┘
                              │ gRPC                  │
                              ▼                       │
                     ┌──────────────────┐             │
                     │ report-service   │←────────────┘ gRPC
                     │     :8086        │
                     └──────────────────┘
                              │
                     ┌──────────────────┐   ┌──────────────────┐
                     │notification-svc  │   │ config-service   │
                     │     :8087        │   │     :8088        │
                     └──────────────────┘   └──────────────────┘
```

Giao thức nội bộ:
- **HTTP proxy:** api-gateway → tất cả services (REST forward)
- **gRPC:** portfolio ↔ analytics ↔ risk ↔ market-data (tính toán nặng, streaming)
- **Redis Pub/Sub:** market-data → realtime-gateway (broadcast giá), notification → realtime-gateway (push alert)

---

## 4. PROTOBUF DEFINITIONS

```
proto/market/v1/market.proto
├── service MarketDataService
│   ├── rpc StreamQuote(StreamQuoteRequest) returns (stream QuoteUpdate)
│   ├── rpc GetHistoricalData(HistDataRequest) returns (OHLCVResponse)
│   └── rpc GetOrderBook(OrderBookRequest) returns (OrderBookResponse)
├── message QuoteUpdate        { symbol, price, change, changePct, volume, bid[], ask[], timestamp }
├── message OHLCVBar           { timestamp, open, high, low, close, volume }
└── message OrderBookLevel     { price, volume }

proto/portfolio/v1/portfolio.proto
├── service PortfolioService
│   ├── rpc GetPositions(PositionsRequest) returns (PositionList)
│   ├── rpc CalcNAV(NAVRequest) returns (NAVResult)
│   └── rpc CalcPnL(PnLRequest) returns (PnLResult)
├── message Position           { symbol, quantity, avgCost, currentPrice, marketValue, unrealizedPnL }
└── message NAVResult          { totalNAV, totalCash, totalMarketValue, dayPnL, totalPnL }

proto/analytics/v1/analytics.proto
├── service AnalyticsService
│   ├── rpc RunTechnicalIndicator(IndicatorRequest) returns (IndicatorResult)
│   ├── rpc GetRiskMetrics(RiskRequest) returns (RiskMetrics)
│   ├── rpc CalcCorrelation(CorrelationRequest) returns (CorrelationMatrix)
│   └── rpc RunBacktest(BacktestConfig) returns (BacktestResult)
├── message IndicatorResult    { symbol, type, values[], timestamps[] }
├── message RiskMetrics        { var95, var99, cvar, sharpe, beta, maxDrawdown }
└── message CorrelationMatrix  { symbols[], matrix[][] }

proto/notification/v1/notification.proto
├── service NotificationService
│   ├── rpc SendAlert(AlertRequest) returns (SendResult)
│   └── rpc BroadcastEvent(EventRequest) returns (BroadcastResult)
├── message AlertRequest       { userId, alertId, severity, title, message, channels[] }
└── message EventRequest       { eventType, payload }
```

---

## 5. DATABASE SCHEMA

### MariaDB / Db2

```sql
users                     (id, email, password_hash, role, mfa_secret, created_at, updated_at)
investment_accounts       (id, user_id, name, broker, account_number, currency, type, cash_balance, created_at)
holdings                  (id, account_id, symbol, quantity, avg_cost, last_updated)
transactions              (id, account_id, symbol, type, quantity, price, fee, tax, trade_date, settlement_date, note, created_at)
corporate_actions         (id, symbol, type, ex_date, record_date, ratio, cash_amount, description)
watchlists                (id, user_id, name, created_at)
watchlist_symbols         (watchlist_id, symbol, sort_order)
alert_configs             (id, user_id, symbol, type, condition, threshold, channel, is_active, created_at)
alert_history             (id, alert_config_id, triggered_at, message, is_read)
backtest_strategies       (id, user_id, name, conditions_json, created_at)
backtest_results          (id, strategy_id, symbol, from_date, to_date, config_json, result_json, created_at)
user_settings             (user_id, cost_method, currency_display, language, theme, dashboard_layout_json, notification_channels_json)
data_sources              (id, name, type, config_json, is_active, priority)
audit_logs                (id, user_id, action, entity_type, entity_id, old_value_json, new_value_json, ip_address, created_at)
```

### Redis

```
quotes:{symbol}           → JSON     (latest quote, TTL 5s)
nav:{accountId}           → JSON     (cached NAV, TTL 10s)
session:{token}           → JSON     (user session)
ws:rooms:{roomName}       → SET      (connected client IDs)
pubsub:quote_updates      → channel  (market-data → realtime-gateway)
pubsub:alerts             → channel  (notification → realtime-gateway)
ratelimit:{ip}            → counter  (request count, TTL 60s)
```

---

## 6. DOCKER COMPOSE

```yaml
services:
  api-gateway:        ports: ["8080:8080"]     depends_on: [mariadb, redis]
  realtime-gateway:   ports: ["8090:8090"]     depends_on: [redis]
  auth-service:       ports: ["8083:8083"]     depends_on: [mariadb]
  portfolio-service:  ports: ["8081:8081"]     depends_on: [mariadb, redis]
  market-data-service:ports: ["8082:8082"]     depends_on: [mariadb, redis]
  analytics-service:  ports: ["8084:8084"]     depends_on: [mariadb]
  risk-service:       ports: ["8085:8085"]     depends_on: [mariadb]
  report-service:     ports: ["8086:8086"]     depends_on: [mariadb]
  notification-service:ports: ["8087:8087"]    depends_on: [mariadb, redis]
  config-service:     ports: ["8088:8088"]     depends_on: [mariadb]
  mariadb:            ports: ["3306:3306"]     volumes: [mariadb-data]
  redis:              ports: ["6379:6379"]
```

---

## 7. KHỞI CHẠY

```bash
# 1. Generate protobuf
./scripts/proto-gen.sh

# 2. Start infrastructure
docker compose up -d mariadb redis

# 3. Run migrations
./scripts/migrate.sh up

# 4. Seed demo data
./scripts/seed.sh

# 5. Start all services
docker compose up -d

# Hoặc chạy từng service riêng khi dev:
cd services/auth-service && go run main.go
cd services/portfolio-service && go run main.go
cd services/market-data-service && go run main.go
# ...
```

---

## 8. TƯƠNG THÍCH VỚI FRONTEND

Frontend `api.service.ts` dòng 9-10:

```typescript
const USE_MOCK = true;       // đổi thành false khi backend sẵn sàng
const API_BASE = '/api/v1';
```

Kết nối frontend ↔ backend:

```
Angular dev server (:4200)
    │
    ├── proxy.conf.json:  /api/v1/* → http://localhost:8080
    │
    └── websocket.service.ts:  ws://localhost:8090/ws/market
```

Mỗi TypeScript interface trong `core/models/index.ts` khớp 1:1 với Go struct trong `model/` của service tương ứng. JSON field names giữ nguyên camelCase cả hai phía nhờ Go struct tag `json:"fieldName"`.
