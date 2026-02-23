# BUSINESS FLOWS — Investment Platform

Các luồng nghiệp vụ chính, sequence diagram chi tiết.

---

## FLOW 1 — Đăng nhập & Phân quyền

```
Browser                  API Gateway :8080         auth-service :8083            MariaDB
  │                            │                          │                        │
  ├──POST /auth/login─────────→│                          │                        │
  │  {email, password}         ├──proxy──────────────────→│                        │
  │                            │                          ├──SELECT * FROM users──→│
  │                            │                          │  WHERE email = ?       │
  │                            │                          │←─user row─────────────┤
  │                            │                          │                        │
  │                            │                          ├──verify bcrypt(password, hash)
  │                            │                          │                        │
  │                            │                          │  [if MFA enabled]      │
  │                            │                          ├──return {require_mfa}──│
  │←─200 {require_mfa: true}──┤←─────────────────────────┤                        │
  │                            │                          │                        │
  ├──POST /auth/mfa/verify────→│──proxy──────────────────→│                        │
  │  {email, totp_code}        │                          ├──verify TOTP           │
  │                            │                          │                        │
  │                            │                          ├──sign JWT              │
  │                            │                          │  {userId, role, exp}   │
  │                            │                          │                        │
  │                            │                          ├──INSERT audit_logs─────→│
  │                            │                          │  action=LOGIN           │
  │←─200 {access_token,───────┤←─────────────────────────┤                        │
  │       refresh_token,       │                          │                        │
  │       user, role}          │                          │                        │
  │                            │                          │                        │
  ├──Mọi request sau đó───────→│                          │                        │
  │  Authorization: Bearer xxx │──verify JWT signature    │                        │
  │                            │──extract userId, role    │                        │
  │                            │──set X-User-ID header    │                        │
  │                            │──proxy to target service │                        │
  │                            │                          │                        │
```

**Quy tắc:**
- Access token: 15 phút, refresh token: 7 ngày
- Token hết hạn → frontend gọi `POST /auth/refresh` tự động (silent refresh)
- Role trong JWT quyết định sidebar hiện gì + API Gateway cho phép route nào

---

## FLOW 2 — Nhập lệnh giao dịch

```
Browser                 API Gateway        portfolio-service :8081              MariaDB
  │                         │                       │                             │
  ├──POST /transactions────→│──proxy──────────────→│                             │
  │  {symbol: "VIC",        │                      │                             │
  │   type: "buy",          │                      ├──VALIDATE:                  │
  │   quantity: 500,        │                      │  SL phải bội 100 (round lot)│
  │   price: 45000,         │                      │  Nếu sell: SL ≤ holdings.qty│
  │   tradeDate: "2026-02-20",                     │                             │
  │   accountId: "acc1"}    │                      │                             │
  │                         │                      ├──TÍNH:                      │
  │                         │                      │  fee = 0.15% × price × qty  │
  │                         │                      │  tax = (type==sell)          │
  │                         │                      │      ? 0.1% × price × qty   │
  │                         │                      │      : 0                    │
  │                         │                      │  total = price×qty + fee    │
  │                         │                      │  settlement = tradeDate + 2 │
  │                         │                      │                             │
  │                         │                      ├──BEGIN TRANSACTION──────────→│
  │                         │                      │  INSERT transactions         │
  │                         │                      │                             │
  │                         │                      │  [if BUY]:                  │
  │                         │                      │  UPSERT holdings            │
  │                         │                      │    new_qty = old_qty + 500  │
  │                         │                      │    new_avg = WAVG recalc    │
  │                         │                      │  UPDATE accounts            │
  │                         │                      │    cash -= total            │
  │                         │                      │                             │
  │                         │                      │  [if SELL]:                 │
  │                         │                      │  UPDATE holdings            │
  │                         │                      │    new_qty = old_qty - 500  │
  │                         │                      │  UPDATE accounts            │
  │                         │                      │    cash += (price×qty       │
  │                         │                      │            - fee - tax)     │
  │                         │                      │                             │
  │                         │                      ├──COMMIT─────────────────────→│
  │                         │                      │                             │
  │                         │                      ├──gRPC→ notification-service  │
  │                         │                      │  audit_log: CREATE_TRANSACTION│
  │                         │                      │                             │
  │←─201 {transaction}─────┤←─────────────────────┤                             │
```

**Công thức giá vốn bình quân (WAVG):**
```
new_avg_cost = (old_qty × old_avg_cost + buy_qty × buy_price) / (old_qty + buy_qty)
```

---

## FLOW 3 — Import giao dịch từ file Excel

```
Browser (SheetJS)        API Gateway        portfolio-service            MariaDB
  │                          │                      │                       │
  │  User chọn file .xlsx    │                      │                       │
  │  SheetJS parse trên      │                      │                       │
  │  browser (không upload   │                      │                       │
  │  raw file)               │                      │                       │
  │                          │                      │                       │
  │  User map columns:       │                      │                       │
  │  "Mã CP" → symbol        │                      │                       │
  │  "SL"    → quantity      │                      │                       │
  │  ...                     │                      │                       │
  │                          │                      │                       │
  ├──POST /transactions/─────→│──proxy─────────────→│                       │
  │  import/preview          │                      │                       │
  │  {rows: [...mapped data],│                      ├──VALIDATE mỗi dòng:  │
  │   fileName: "SSI.xlsx"}  │                      │  symbol exists?       │
  │                          │                      │  qty > 0, bội 100?   │
  │                          │                      │  price > 0?           │
  │                          │                      │  date hợp lệ?        │
  │                          │                      │                       │
  │                          │                      ├──CHECK DUPLICATE:     │
  │                          │                      │  unique(date+symbol   │
  │                          │                      │        +qty+price)    │
  │                          │                      │                       │
  │←─200 {preview: 10 rows,─┤←────────────────────┤                       │
  │       errors: [...],     │                      │                       │
  │       duplicates: 3,     │                      │                       │
  │       validCount: 42}    │                      │                       │
  │                          │                      │                       │
  │  User review, confirm    │                      │                       │
  │                          │                      │                       │
  ├──POST /transactions/─────→│──proxy─────────────→│                       │
  │  import/confirm          │                      ├──BEGIN TRANSACTION───→│
  │  {sessionId: "xxx"}      │                      │  INSERT 42 rows       │
  │                          │                      │  UPDATE holdings ×N   │
  │                          │                      │  UPDATE accounts ×N   │
  │                          │                      ├──COMMIT──────────────→│
  │                          │                      │                       │
  │←─200 {imported: 42}─────┤←────────────────────┤                       │
```

---

## FLOW 4 — Giá real-time → Dashboard update

```
Data Provider       market-data-service       Redis           realtime-gw          Browser
(HOSE/VNDirect)           :8082                :6379             :8090              :4200
     │                      │                    │                  │                  │
     │──price feed─────────→│                    │                  │                  │
     │  (poll mỗi 1-3s)    │                    │                  │                  │
     │                      ├──update in-memory  │                  │                  │
     │                      │  map[symbol]quote  │                  │                  │
     │                      │                    │                  │                  │
     │                      ├──SET quotes:VIC───→│                  │                  │
     │                      │  (cache TTL 5s)    │                  │                  │
     │                      │                    │                  │                  │
     │                      ├──PUBLISH──────────→│                  │                  │
     │                      │  "quote_updates"   ├──SUBSCRIBE      │                  │
     │                      │  {type:QUOTE_UPDATE│  "quote_updates" │                  │
     │                      │   symbol:VIC,      │                  │                  │
     │                      │   price:45200,...}  │──message───────→│                  │
     │                      │                    │                  ├──broadcast to    │
     │                      │                    │                  │  room "market"    │
     │                      │                    │                  │                  │
     │                      │                    │                  ├──WSS push───────→│
     │                      │                    │                  │  {type:QUOTE_     │
     │                      │                    │                  │   UPDATE,...}     │
     │                      │                    │                  │                  │
     │                      │                    │                  │      MarketService│
     │                      │                    │                  │      .quotes      │
     │                      │                    │                  │      .set(updated)│
     │                      │                    │                  │                  │
     │                      │                    │                  │      Signal auto  │
     │                      │                    │                  │      re-render UI │
```

---

## FLOW 5 — Cảnh báo giá chạm ngưỡng

```
market-data-svc      notification-service :8087         MariaDB        Redis        Browser
     │                        │                            │             │              │
     │──gRPC: QuoteUpdate────→│                            │             │              │
     │  {VIC: 50200}          │                            │             │              │
     │                        ├──SELECT alert_configs─────→│             │              │
     │                        │  WHERE symbol='VIC'        │             │              │
     │                        │  AND is_active=true         │             │              │
     │                        │←─configs[]────────────────┤             │              │
     │                        │                            │             │              │
     │                        ├──evaluate each config:     │             │              │
     │                        │  config: VIC >= 50000      │             │              │
     │                        │  current: 50200            │             │              │
     │                        │  result: TRIGGERED ✓       │             │              │
     │                        │                            │             │              │
     │                        ├──INSERT alert_history─────→│             │              │
     │                        │  {severity:HIGH,           │             │              │
     │                        │   message:"VIC đang GD     │             │              │
     │                        │   tại 50,200, vượt ngưỡng  │             │              │
     │                        │   50,000"}                 │             │              │
     │                        │                            │             │              │
     │                        ├──dispatch channels:        │             │              │
     │                        │                            │             │              │
     │                        │  [in_app]:                 │             │              │
     │                        ├──PUBLISH─────────────────────────────────→│              │
     │                        │  "alerts:{userId}"         │             │──WSS push───→│
     │                        │                            │             │  {type:ALERT} │
     │                        │  [email]:                  │             │              │
     │                        ├──SMTP send                 │             │              │
     │                        │                            │             │              │
     │                        │  [telegram]:               │             │              │
     │                        ├──POST telegram bot API     │             │              │
```

---

## FLOW 6 — Tính VaR & Stress Test

```
Browser              API Gateway       risk-service :8085     portfolio-svc    market-data-svc
  │                       │                  │                     │                 │
  ├──POST /risk/acc1/────→│──proxy──────────→│                     │                 │
  │  stress-test          │                  │                     │                 │
  │  {scenarios:[         │                  ├──gRPC: GetPositions─→│                 │
  │    {name:"VNI -20%",  │                  │                     │                 │
  │     changes:{...}}    │                  │←─positions[]────────┤                 │
  │  ]}                   │                  │                     │                 │
  │                       │                  ├──gRPC: GetHistData──────────────────→│
  │                       │                  │                     │                 │
  │                       │                  │←─OHLCV 1 year──────────────────────┤
  │                       │                  │                     │                 │
  │                       │                  ├──TÍNH:              │                 │
  │                       │                  │  daily returns[]    │                 │
  │                       │                  │  portfolio weights  │                 │
  │                       │                  │  covariance matrix  │                 │
  │                       │                  │                     │                 │
  │                       │                  │  VaR 95% (historical):               │
  │                       │                  │    sort returns → percentile 5th     │
  │                       │                  │                     │                 │
  │                       │                  │  VaR 99% (parametric):               │
  │                       │                  │    μ - 2.326 × σ × √t               │
  │                       │                  │                     │                 │
  │                       │                  │  Stress scenarios:  │                 │
  │                       │                  │    Σ(position × change%) per scenario│
  │                       │                  │                     │                 │
  │←─200 {var95, var99,──┤←────────────────┤                     │                 │
  │   cvar, scenarios[    │                  │                     │                 │
  │     {name, impact}]}  │                  │                     │                 │
```

---

## FLOW 7 — Corporate Action: Cổ tức cổ phiếu

```
Browser              API Gateway       portfolio-service :8081            MariaDB
  │                       │                     │                            │
  │  Admin/Investor nhập  │                     │                            │
  │  sự kiện cổ tức CP    │                     │                            │
  │                       │                     │                            │
  ├──POST /corporate-────→│──proxy────────────→│                            │
  │  actions              │                    │                            │
  │  {symbol: "HPG",      │                    ├──INSERT corporate_actions──→│
  │   type: "stock_div",  │                    │  status: "pending"          │
  │   ratio: 0.1,         │                    │                            │
  │   exDate: "2026-03-15"}                    │                            │
  │                       │                    │                            │
  │←─201 {id: "ca2"}─────┤←───────────────────┤                            │
  │                       │                    │                            │
  │  User review, click   │                    │                            │
  │  "Áp dụng"            │                    │                            │
  │                       │                    │                            │
  ├──POST /corporate-────→│──proxy────────────→│                            │
  │  actions/ca2/apply    │                    │                            │
  │                       │                    ├──BEGIN TRANSACTION─────────→│
  │                       │                    │                            │
  │                       │                    │  Cổ tức CP tỉ lệ 10:1      │
  │                       │                    │  ratio = 0.1               │
  │                       │                    │                            │
  │                       │                    │  SELECT holdings           │
  │                       │                    │  WHERE symbol='HPG'        │
  │                       │                    │  → qty=1000, avg=28500     │
  │                       │                    │                            │
  │                       │                    │  new_qty = 1000 + 1000×0.1 │
  │                       │                    │         = 1100             │
  │                       │                    │  new_avg = 28500×1000/1100 │
  │                       │                    │         = 25909            │
  │                       │                    │                            │
  │                       │                    │  UPDATE holdings           │
  │                       │                    │    qty=1100, avg=25909     │
  │                       │                    │  UPDATE corporate_actions  │
  │                       │                    │    status='applied'        │
  │                       │                    │                            │
  │                       │                    ├──COMMIT────────────────────→│
  │                       │                    │                            │
  │←─200 {applied}────────┤←───────────────────┤                            │
```

---

## FLOW 8 — Tái cân bằng danh mục (Rebalance)

```
Browser              API Gateway       portfolio-service          market-data-svc
  │                       │                   │                         │
  ├──GET /accounts/acc1/─→│──proxy───────────→│                         │
  │  allocation/suggest   │                   │                         │
  │                       │                   ├──get current holdings   │
  │                       │                   ├──gRPC: get current prices──→│
  │                       │                   │←─quotes[]──────────────┤
  │                       │                   │                         │
  │                       │                   ├──TÍNH:                  │
  │                       │                   │  current_weight[i] =    │
  │                       │                   │    (qty×price) / NAV    │
  │                       │                   │                         │
  │                       │                   │  target_weight[i] =     │
  │                       │                   │    allocation_targets[i]│
  │                       │                   │                         │
  │                       │                   │  deviation[i] =         │
  │                       │                   │    current - target      │
  │                       │                   │                         │
  │                       │                   │  for each deviation     │
  │                       │                   │    > threshold (2%):    │
  │                       │                   │    suggest BUY/SELL     │
  │                       │                   │    amount = deviation   │
  │                       │                   │            × NAV / price│
  │                       │                   │    round to lot 100     │
  │                       │                   │                         │
  │←─200 {suggestions:[──┤←──────────────────┤                         │
  │   {symbol, action,    │                   │                         │
  │    qty, reason},...]} │                   │                         │
```

---

## FLOW 9 — BI Report: Tableau Embed

```
Browser                API Gateway       report-service :8086        Tableau Server
  │                         │                    │                        │
  ├──GET /bi/tableau/──────→│──proxy────────────→│                        │
  │  token                  │                    │                        │
  │                         │                    ├──POST trusted ticket───→│
  │                         │                    │  {username, site}       │
  │                         │                    │                        │
  │                         │                    │←─{ticket: "abc123"}────┤
  │                         │                    │                        │
  │←─200 {embedToken:──────┤←───────────────────┤                        │
  │       "abc123",         │                    │                        │
  │       viewUrl: "..."}   │                    │                        │
  │                         │                    │                        │
  │  Angular loads:         │                    │                        │
  │  <tableau-viz           │                    │                        │
  │    src="viewUrl"        │                    │                        │
  │    token="abc123">      │                    │                        │
  │                         │                    │                        │
  │  Tableau JS SDK ────────────────────────────────────────────────────→│
  │  renders dashboard      │                    │            fetch data  │
  │  in iframe              │                    │            render viz  │
  │←─interactive dashboard──────────────────────────────────────────────┤
```

---

## FLOW 10 — Backtesting chiến lược

```
Browser              API Gateway       analytics-service :8084       market-data-svc
  │                       │                    │                          │
  ├──POST /backtesting/──→│──proxy────────────→│                          │
  │  run                  │                    │                          │
  │  {symbol: "VIC",      │                    ├──gRPC: GetHistoricalData─→│
  │   from: "2025-01-01", │                    │  {VIC, 1D, 2025-2026}    │
  │   to: "2025-12-31",   │                    │                          │
  │   conditions: [        │                    │←─OHLCV[] (250 bars)─────┤
  │     {buy: "EMA9 >     │                    │                          │
  │            EMA21"},    │                    ├──engine/backtest/executor:│
  │     {sell: "EMA9 <    │                    │                          │
  │            EMA21"}     │                    │  for each bar:           │
  │   ],                  │                    │    calc EMA9, EMA21      │
  │   capital: 100000000, │                    │    if buy_signal:        │
  │   positionSize: "10%",│                    │      open position       │
  │   commission: 0.15%}  │                    │    if sell_signal:       │
  │                       │                    │      close position      │
  │                       │                    │      record P&L          │
  │                       │                    │                          │
  │                       │                    ├──engine/backtest/metrics: │
  │                       │                    │  totalReturn             │
  │                       │                    │  annualizedReturn (CAGR) │
  │                       │                    │  maxDrawdown             │
  │                       │                    │  sharpeRatio             │
  │                       │                    │  winRate                 │
  │                       │                    │  profitFactor            │
  │                       │                    │  trades[]               │
  │                       │                    │  equityCurve[]          │
  │                       │                    │                          │
  │                       │                    ├──INSERT backtest_results  │
  │                       │                    │                          │
  │←─200 {result}─────────┤←───────────────────┤                          │
```
