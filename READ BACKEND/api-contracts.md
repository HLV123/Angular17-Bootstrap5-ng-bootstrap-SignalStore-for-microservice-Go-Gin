# API CONTRACTS — Investment Platform

Chi tiết request/response JSON, pagination, error format, auth header cho toàn bộ REST endpoints.

---

## 1. QUY ƯỚC CHUNG

### 1.1 Base URL

```
Production:  https://api.investment.vn/api/v1
Development: http://localhost:8080/api/v1
```

### 1.2 Auth Header

Mọi request (trừ `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/reset-password`) phải gửi:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json
```

### 1.3 Response Envelope

Tất cả response đều bọc trong envelope thống nhất:

```json
// Thành công (single object)
{
  "success": true,
  "data": { ... },
  "message": "OK"
}

// Thành công (list + pagination)
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 156,
    "totalPages": 8
  }
}

// Lỗi
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Số lượng phải là bội số của 100",
    "details": [
      {"field": "quantity", "message": "must be multiple of 100"}
    ]
  }
}
```

### 1.4 Pagination Params

```
GET /api/v1/transactions?page=1&pageSize=20&sort=tradeDate&order=desc
```

| Param | Type | Default | Mô tả |
|-------|------|---------|-------|
| `page` | int | 1 | Trang hiện tại (1-based) |
| `pageSize` | int | 20 | Số item/trang (max 100) |
| `sort` | string | `createdAt` | Tên field sắp xếp |
| `order` | string | `desc` | `asc` hoặc `desc` |

### 1.5 Filter Params

```
GET /api/v1/transactions?symbol=VIC&type=buy&from=2026-01-01&to=2026-02-28&accountId=acc1
```

Date format: `YYYY-MM-DD` (ISO 8601).

### 1.6 Error Codes

| HTTP | Code | Mô tả |
|------|------|-------|
| 400 | `VALIDATION_ERROR` | Dữ liệu đầu vào không hợp lệ |
| 400 | `INVALID_QUANTITY` | SL không phải bội 100 |
| 400 | `INSUFFICIENT_QUANTITY` | SL bán > SL đang giữ |
| 400 | `INSUFFICIENT_CASH` | Tiền mặt không đủ mua |
| 400 | `DUPLICATE_IMPORT` | Dòng import trùng lặp |
| 401 | `UNAUTHORIZED` | Token thiếu hoặc hết hạn |
| 401 | `INVALID_CREDENTIALS` | Email/password sai |
| 401 | `MFA_REQUIRED` | Cần xác thực MFA |
| 403 | `FORBIDDEN` | Không có quyền truy cập resource |
| 404 | `NOT_FOUND` | Resource không tồn tại |
| 409 | `CONFLICT` | Trùng email khi đăng ký |
| 429 | `RATE_LIMITED` | Quá nhiều request (100/phút) |
| 500 | `INTERNAL_ERROR` | Lỗi server |

---

## 2. AUTH SERVICE

### POST `/auth/register`

```json
// Request
{
  "email": "investor@example.vn",
  "password": "securePass123",
  "fullName": "Nguyễn Văn A",
  "role": "investor"
}

// Response 201
{
  "success": true,
  "data": {
    "id": "usr_abc123",
    "email": "investor@example.vn",
    "fullName": "Nguyễn Văn A",
    "role": "investor",
    "createdAt": "2026-02-23T10:00:00Z"
  }
}

// Error 409
{
  "success": false,
  "error": {"code": "CONFLICT", "message": "Email đã được sử dụng"}
}
```

### POST `/auth/login`

```json
// Request
{
  "email": "investor@investment.vn",
  "password": "123456"
}

// Response 200 (no MFA)
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 900,
    "user": {
      "id": "usr_001",
      "email": "investor@investment.vn",
      "fullName": "Nguyễn Văn Investor",
      "role": "investor"
    }
  }
}

// Response 200 (MFA required)
{
  "success": true,
  "data": {
    "requireMfa": true,
    "mfaToken": "tmp_mfa_xxx"
  }
}
```

### POST `/auth/refresh`

```json
// Request
{"refreshToken": "eyJhbGciOiJIUzI1NiIs..."}

// Response 200
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...(new)",
    "expiresIn": 900
  }
}
```

### GET `/auth/profile`

```json
// Response 200
{
  "success": true,
  "data": {
    "id": "usr_001",
    "email": "investor@investment.vn",
    "fullName": "Nguyễn Văn Investor",
    "role": "investor",
    "mfaEnabled": false,
    "createdAt": "2025-01-15T08:00:00Z",
    "updatedAt": "2026-02-20T14:30:00Z"
  }
}
```

---

## 3. PORTFOLIO SERVICE

### GET `/accounts`

```json
// Response 200
{
  "success": true,
  "data": [
    {
      "id": "acc_001",
      "userId": "usr_001",
      "name": "TK Chứng khoán SSI",
      "broker": "SSI",
      "accountNumber": "058C123456",
      "currency": "VND",
      "type": "trading",
      "cashBalance": 125000000,
      "createdAt": "2025-06-01T00:00:00Z"
    }
  ]
}
```

### POST `/accounts`

```json
// Request
{
  "name": "TK Mới VPS",
  "broker": "VPS",
  "accountNumber": "022C789012",
  "currency": "VND",
  "type": "trading",
  "cashBalance": 50000000
}

// Response 201
{
  "success": true,
  "data": {"id": "acc_004", "name": "TK Mới VPS", ...}
}
```

### GET `/accounts/{id}/holdings`

```json
// Response 200
{
  "success": true,
  "data": [
    {
      "id": "hld_001",
      "accountId": "acc_001",
      "symbol": "VIC",
      "companyName": "Tập đoàn Vingroup",
      "quantity": 500,
      "avgCost": 42000,
      "currentPrice": 45200,
      "marketValue": 22600000,
      "unrealizedPnL": 1600000,
      "unrealizedPnLPct": 7.62,
      "weight": 17.5,
      "lastUpdated": "2026-02-23T14:30:00Z"
    }
  ]
}
```

### GET `/accounts/{id}/summary`

```json
// Response 200
{
  "success": true,
  "data": {
    "accountId": "acc_001",
    "totalNAV": 1284000000,
    "cashBalance": 125000000,
    "totalMarketValue": 1159000000,
    "totalCost": 1050000000,
    "unrealizedPnL": 109000000,
    "unrealizedPnLPct": 10.38,
    "dayPnL": 15600000,
    "dayPnLPct": 1.22,
    "holdingsCount": 9
  }
}
```

### POST `/transactions`

```json
// Request
{
  "accountId": "acc_001",
  "symbol": "VIC",
  "type": "buy",
  "quantity": 500,
  "price": 45000,
  "fee": 33750,
  "tradeDate": "2026-02-23",
  "note": "Mua thêm dài hạn"
}

// Response 201
{
  "success": true,
  "data": {
    "id": "txn_abc123",
    "accountId": "acc_001",
    "symbol": "VIC",
    "type": "buy",
    "quantity": 500,
    "price": 45000,
    "fee": 33750,
    "tax": 0,
    "totalValue": 22533750,
    "tradeDate": "2026-02-23",
    "settlementDate": "2026-02-25",
    "note": "Mua thêm dài hạn",
    "createdAt": "2026-02-23T10:15:00Z"
  }
}

// Error 400
{
  "success": false,
  "error": {
    "code": "INVALID_QUANTITY",
    "message": "Số lượng phải là bội số của 100",
    "details": [{"field": "quantity", "message": "550 is not multiple of 100"}]
  }
}
```

### GET `/transactions`

```
GET /transactions?accountId=acc_001&symbol=VIC&type=buy&from=2026-01-01&to=2026-02-28&page=1&pageSize=20
```

```json
// Response 200
{
  "success": true,
  "data": [
    {
      "id": "txn_001",
      "symbol": "VIC",
      "type": "buy",
      "quantity": 500,
      "price": 42000,
      "fee": 31500,
      "tax": 0,
      "totalValue": 21031500,
      "tradeDate": "2025-12-15",
      "settlementDate": "2025-12-17",
      "note": ""
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 45,
    "totalPages": 3
  }
}
```

### POST `/transactions/import/preview`

```json
// Request
{
  "fileName": "SSI_GD_T1_2026.xlsx",
  "rows": [
    {"symbol": "VIC", "type": "buy", "quantity": 500, "price": 45000, "tradeDate": "2026-01-10"},
    {"symbol": "HPG", "type": "sell", "quantity": 200, "price": 29000, "tradeDate": "2026-01-12"},
    {"symbol": "XXX", "type": "buy", "quantity": 150, "price": 10000, "tradeDate": "2026-01-15"}
  ],
  "accountId": "acc_001"
}

// Response 200
{
  "success": true,
  "data": {
    "sessionId": "imp_abc123",
    "totalRows": 3,
    "validRows": 1,
    "errorRows": 2,
    "duplicateRows": 0,
    "errors": [
      {"row": 2, "field": "quantity", "message": "SL bán (200) > SL giữ (0) cho mã HPG trong TK acc_001"},
      {"row": 3, "field": "symbol", "message": "Mã XXX không tồn tại"},
      {"row": 3, "field": "quantity", "message": "150 không phải bội số của 100"}
    ],
    "preview": [
      {"row": 1, "symbol": "VIC", "type": "buy", "quantity": 500, "price": 45000, "status": "valid"},
      {"row": 2, "symbol": "HPG", "type": "sell", "quantity": 200, "price": 29000, "status": "error"},
      {"row": 3, "symbol": "XXX", "type": "buy", "quantity": 150, "price": 10000, "status": "error"}
    ]
  }
}
```

---

## 4. MARKET DATA SERVICE

### GET `/market/quotes`

```
GET /market/quotes?exchange=HOSE
```

```json
{
  "success": true,
  "data": [
    {
      "symbol": "VIC",
      "companyName": "Tập đoàn Vingroup",
      "exchange": "HOSE",
      "currentPrice": 45200,
      "change": 700,
      "changePct": 1.57,
      "refPrice": 44500,
      "ceilingPrice": 47600,
      "floorPrice": 41400,
      "open": 44600,
      "high": 45500,
      "low": 44400,
      "volume": 4521300,
      "value": 203850000000,
      "marketCap": 168000000000000,
      "foreignBuy": 125000,
      "foreignSell": 89000,
      "bid": [[45200, 12500], [45100, 8300], [45000, 15200]],
      "ask": [[45300, 9800], [45400, 11200], [45500, 7600]],
      "updatedAt": "2026-02-23T14:29:45Z"
    }
  ]
}
```

### GET `/market/ohlcv/{symbol}`

```
GET /market/ohlcv/VIC?interval=1D&from=2025-12-01&to=2026-02-23&limit=60
```

```json
{
  "success": true,
  "data": [
    {
      "timestamp": "2026-02-23T00:00:00Z",
      "open": 44600,
      "high": 45500,
      "low": 44400,
      "close": 45200,
      "volume": 4521300
    }
  ]
}
```

Giá trị `interval`: `1m`, `5m`, `15m`, `1H`, `1D`, `1W`, `1M`

### GET `/market/indicators/{symbol}`

```
GET /market/indicators/VIC?type=RSI&period=14&interval=1D
```

```json
{
  "success": true,
  "data": {
    "symbol": "VIC",
    "type": "RSI",
    "period": 14,
    "values": [55.2, 58.1, 52.8, 61.3, 48.9],
    "timestamps": ["2026-02-19", "2026-02-20", "2026-02-21", "2026-02-22", "2026-02-23"]
  }
}
```

Giá trị `type`: `MA`, `EMA`, `WMA`, `RSI`, `MACD`, `STOCH`, `CCI`, `ATR`, `BB`, `OBV`, `VWAP`, `ICHIMOKU`, `SAR`, `SUPERTREND`

---

## 5. ANALYTICS SERVICE

### POST `/backtesting/run`

```json
// Request
{
  "symbol": "VIC",
  "from": "2025-01-01",
  "to": "2025-12-31",
  "conditions": [
    {"type": "entry", "indicator": "EMA", "params": {"fast": 9, "slow": 21}, "signal": "cross_up"},
    {"type": "exit", "indicator": "EMA", "params": {"fast": 9, "slow": 21}, "signal": "cross_down"}
  ],
  "config": {
    "initialCapital": 100000000,
    "positionSize": 10,
    "positionSizeType": "percent",
    "commission": 0.15,
    "slippage": 0.1
  }
}

// Response 200
{
  "success": true,
  "data": {
    "id": "bt_abc123",
    "totalReturn": 18.5,
    "annualizedReturn": 18.5,
    "maxDrawdown": -12.3,
    "sharpeRatio": 1.45,
    "winRate": 62.5,
    "profitFactor": 1.8,
    "totalTrades": 16,
    "equityCurve": [
      {"date": "2025-01-15", "equity": 100000000},
      {"date": "2025-02-20", "equity": 105200000}
    ],
    "trades": [
      {
        "entryDate": "2025-01-15",
        "exitDate": "2025-02-20",
        "entryPrice": 40000,
        "exitPrice": 42100,
        "quantity": 2500,
        "pnl": 5250000,
        "pnlPct": 5.25,
        "holdDays": 36
      }
    ]
  }
}
```

### POST `/screener/run`

```json
// Request
{
  "conditions": [
    {"field": "pe", "operator": "lt", "value": 15},
    {"field": "roe", "operator": "gt", "value": 15},
    {"field": "exchange", "operator": "eq", "value": "HOSE"},
    {"field": "marketCap", "operator": "gt", "value": 10000000000000}
  ]
}

// Response 200
{
  "success": true,
  "data": {
    "count": 12,
    "results": [
      {"symbol": "FPT", "companyName": "FPT Corp", "pe": 12.5, "roe": 22.3, "marketCap": 125000000000000}
    ]
  }
}
```

Giá trị `operator`: `eq`, `ne`, `gt`, `gte`, `lt`, `lte`, `between`, `in`

---

## 6. RISK SERVICE

### GET `/risk/{accountId}/metrics`

```json
{
  "success": true,
  "data": {
    "var95": -25500000,
    "var99": -38200000,
    "cvar": -42100000,
    "sharpeRatio": 1.45,
    "beta": 0.92,
    "maxDrawdown": -15.2,
    "maxDrawdownPeriod": {"from": "2025-09-15", "to": "2025-10-28"},
    "concentrationTop5": 75.3,
    "calculatedAt": "2026-02-23T14:00:00Z"
  }
}
```

### POST `/risk/{accountId}/stress-test`

```json
// Request
{
  "scenarios": [
    {"name": "VN-Index -20%", "type": "preset", "presetId": "vni_minus_20"},
    {
      "name": "Custom: Tech crash",
      "type": "custom",
      "changes": [
        {"symbol": "FPT", "changePct": -25},
        {"symbol": "VIC", "changePct": -15},
        {"symbol": "HPG", "changePct": -30}
      ]
    }
  ]
}

// Response 200
{
  "success": true,
  "data": {
    "results": [
      {
        "name": "VN-Index -20%",
        "totalImpact": -256800000,
        "impactPct": -20.0,
        "bySymbol": [
          {"symbol": "VIC", "impact": -90400000},
          {"symbol": "HPG", "impact": -57000000}
        ]
      },
      {
        "name": "Custom: Tech crash",
        "totalImpact": -185000000,
        "impactPct": -14.4,
        "bySymbol": [...]
      }
    ]
  }
}
```

---

## 7. REPORT & BI SERVICE

### GET `/reports/performance/{accountId}`

```
GET /reports/performance/acc_001?from=2025-06-01&to=2026-02-23
```

```json
{
  "success": true,
  "data": {
    "totalReturn": 18.5,
    "annualizedReturn": 15.2,
    "benchmarkReturn": 12.8,
    "alpha": 2.4,
    "sharpeRatio": 1.45,
    "maxDrawdown": -15.2,
    "winRate": 68.4,
    "totalTrades": 38,
    "avgHoldingDays": 45,
    "periodPnL": [
      {"period": "2026-01", "realizedPnL": 12500000, "floatingPnL": 45000000, "dividend": 8000000, "fees": -1250000, "tax": -1250000, "netPnL": 63000000},
      {"period": "2025-12", "realizedPnL": -5200000, "floatingPnL": 22000000, "dividend": 0, "fees": -980000, "tax": -520000, "netPnL": 15300000}
    ]
  }
}
```

### GET `/reports/attribution/{accountId}`

```json
{
  "success": true,
  "data": [
    {"symbol": "FPT", "companyName": "FPT Corp", "sector": "Công nghệ", "weight": 12.1, "returnPct": 28.9, "contribution": 3.5},
    {"symbol": "VIC", "companyName": "Vingroup", "sector": "Bất động sản", "weight": 21.4, "returnPct": 13.1, "contribution": 2.8}
  ]
}
```

### GET `/bi/tableau/token`

```json
{
  "success": true,
  "data": {
    "embedToken": "abc123xyz",
    "siteId": "investment-vn",
    "views": [
      {"id": "v1", "name": "Portfolio Performance Dashboard", "url": "https://tableau.investment.vn/views/portfolio-perf"},
      {"id": "v2", "name": "Sector Allocation Heatmap", "url": "https://tableau.investment.vn/views/sector-heatmap"}
    ]
  }
}
```

---

## 8. ALERT SERVICE

### POST `/alerts`

```json
// Request
{
  "symbol": "VIC",
  "type": "price",
  "condition": "above",
  "threshold": 50000,
  "severity": "high",
  "channel": ["in_app", "email", "telegram"],
  "isActive": true
}

// Response 201
{
  "success": true,
  "data": {
    "id": "alt_abc123",
    "symbol": "VIC",
    "type": "price",
    "condition": "above",
    "threshold": 50000,
    "severity": "high",
    "channel": ["in_app", "email", "telegram"],
    "isActive": true,
    "createdAt": "2026-02-23T10:00:00Z"
  }
}
```

### GET `/alerts/history`

```
GET /alerts/history?page=1&pageSize=20&isRead=false
```

```json
{
  "success": true,
  "data": [
    {
      "id": "alh_001",
      "alertConfigId": "alt_abc123",
      "symbol": "VIC",
      "severity": "high",
      "title": "VIC chạm ngưỡng giá",
      "message": "VIC đang giao dịch tại 50,200 VND, vượt ngưỡng cảnh báo 50,000 VND",
      "isRead": false,
      "triggeredAt": "2026-02-23T10:30:00Z"
    }
  ],
  "pagination": {"page": 1, "pageSize": 20, "totalItems": 8, "totalPages": 1}
}
```

---

## 9. CONFIG SERVICE

### GET `/settings/user`

```json
{
  "success": true,
  "data": {
    "costMethod": "WAVG",
    "currencyDisplay": "million",
    "language": "vi",
    "theme": "light",
    "defaultInterval": "1D",
    "notificationChannels": ["in_app", "email"],
    "telegramWebhook": null,
    "dashboardLayout": null
  }
}
```

### PUT `/settings/user`

```json
// Request (partial update)
{
  "costMethod": "FIFO",
  "theme": "dark",
  "notificationChannels": ["in_app", "email", "telegram"],
  "telegramWebhook": "https://api.telegram.org/bot123456/sendMessage"
}

// Response 200
{
  "success": true,
  "data": { ... updated settings ... }
}
```

---

## 10. WEBSOCKET MESSAGE FORMAT

Kết nối: `wss://api.investment.vn/ws/market?token=<JWT>`

```json
// Server → Client: Quote update
{"type": "QUOTE_UPDATE", "data": {"symbol": "VIC", "price": 45200, "change": 700, "changePct": 1.57, "volume": 4521300}, "timestamp": "2026-02-23T14:29:45Z"}

// Server → Client: NAV update
{"type": "NAV_UPDATE", "data": {"accountId": "acc_001", "nav": 1284000000, "pnlToday": 15600000}, "timestamp": "2026-02-23T14:29:45Z"}

// Server → Client: Position update
{"type": "POSITION_UPDATE", "data": {"symbol": "VIC", "price": 45200, "pnl": 1600000}, "timestamp": "2026-02-23T14:29:45Z"}

// Server → Client: Index update
{"type": "INDEX_UPDATE", "data": {"index": "VNINDEX", "value": 1280.5, "change": 5.2, "changePct": 0.41}, "timestamp": "2026-02-23T14:29:45Z"}

// Server → Client: Alert
{"type": "ALERT", "data": {"alertId": "alh_001", "severity": "HIGH", "title": "VIC chạm ngưỡng giá", "message": "VIC đang giao dịch tại 50,200 VND"}, "timestamp": "2026-02-23T10:30:00Z"}

// Server → Client: News
{"type": "NEWS_FEED", "data": {"title": "VIC công bố KQKD Q4/2025", "source": "CafeF", "url": "https://..."}, "timestamp": "2026-02-23T09:00:00Z"}
```
