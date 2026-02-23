# gRPC CONTRACTS — Investment Platform

4 proto files, 12 RPC methods, timeout / retry / circuit breaker config.

---

## 1. TỔNG QUAN

```
proto/
├── buf.yaml
├── buf.gen.yaml
├── market/v1/market.proto             4 RPCs   (2 unary + 2 stream)
├── portfolio/v1/portfolio.proto       3 RPCs   (3 unary)
├── analytics/v1/analytics.proto       4 RPCs   (4 unary)
└── notification/v1/notification.proto 2 RPCs   (2 unary)
```

| Service | REST port | gRPC port |
|---------|-----------|-----------|
| market-data-service | :8082 | :9082 |
| portfolio-service | :8081 | :9081 |
| analytics-service | :8084 | :9084 |
| notification-service | :8087 | :9087 |

---

## 2. PROTO DEFINITIONS

### 2.1 market/v1/market.proto

```protobuf
syntax = "proto3";
package market.v1;
option go_package = "github.com/investment-platform/proto/market/v1;marketv1";
import "google/protobuf/timestamp.proto";

service MarketDataService {
  rpc StreamQuote(StreamQuoteRequest) returns (stream QuoteUpdate);
  rpc GetHistoricalData(HistDataRequest) returns (OHLCVResponse);
  rpc GetOrderBook(OrderBookRequest) returns (OrderBookResponse);
  rpc StreamOrderBook(OrderBookRequest) returns (stream OrderBookSnapshot);
}

message StreamQuoteRequest {
  repeated string symbols = 1;
}

message QuoteUpdate {
  string symbol        = 1;
  int64  current_price = 2;
  int64  change        = 3;
  double change_pct    = 4;
  int64  volume        = 5;
  int64  ref_price     = 6;
  int64  ceiling_price = 7;
  int64  floor_price   = 8;
  int64  open          = 9;
  int64  high          = 10;
  int64  low           = 11;
  repeated PriceLevel bids = 12;
  repeated PriceLevel asks = 13;
  google.protobuf.Timestamp updated_at = 14;
}

message PriceLevel {
  int64 price  = 1;
  int64 volume = 2;
}

message HistDataRequest {
  string symbol   = 1;
  string interval = 2;
  string from     = 3;
  string to       = 4;
  int32  limit    = 5;
}

message OHLCVResponse {
  string symbol          = 1;
  string interval        = 2;
  repeated OHLCVBar bars = 3;
}

message OHLCVBar {
  google.protobuf.Timestamp timestamp = 1;
  int64  open   = 2;
  int64  high   = 3;
  int64  low    = 4;
  int64  close  = 5;
  int64  volume = 6;
}

message OrderBookRequest {
  string symbol = 1;
  int32  depth  = 2;
}

message OrderBookResponse {
  string symbol              = 1;
  repeated PriceLevel bids   = 2;
  repeated PriceLevel asks   = 3;
  int64 total_bid_volume     = 4;
  int64 total_ask_volume     = 5;
  google.protobuf.Timestamp updated_at = 6;
}

message OrderBookSnapshot {
  string symbol              = 1;
  repeated PriceLevel bids   = 2;
  repeated PriceLevel asks   = 3;
  int64 last_trade_price     = 4;
  int64 last_trade_volume    = 5;
  string last_trade_side     = 6;
  google.protobuf.Timestamp timestamp = 7;
}
```

### 2.2 portfolio/v1/portfolio.proto

```protobuf
syntax = "proto3";
package portfolio.v1;
option go_package = "github.com/investment-platform/proto/portfolio/v1;portfoliov1";

service PortfolioService {
  rpc GetPositions(PositionsRequest) returns (PositionList);
  rpc CalcNAV(NAVRequest) returns (NAVResult);
  rpc CalcPnL(PnLRequest) returns (PnLResult);
}

message PositionsRequest { string account_id = 1; }

message PositionList {
  string account_id           = 1;
  repeated Position positions = 2;
}

message Position {
  string symbol             = 1;
  int32  quantity            = 2;
  int64  avg_cost            = 3;
  int64  current_price       = 4;
  int64  market_value        = 5;
  int64  unrealized_pnl      = 6;
  double unrealized_pnl_pct  = 7;
  double weight              = 8;
}

message NAVRequest { string account_id = 1; }

message NAVResult {
  string account_id        = 1;
  int64  total_nav          = 2;
  int64  cash_balance       = 3;
  int64  total_market_value = 4;
  int64  total_cost         = 5;
  int64  day_pnl            = 6;
  double day_pnl_pct        = 7;
  int64  total_pnl          = 8;
  double total_pnl_pct      = 9;
}

message PnLRequest {
  string account_id = 1;
  string from       = 2;
  string to         = 3;
}

message PnLResult {
  string account_id    = 1;
  int64  realized_pnl   = 2;
  int64  unrealized_pnl = 3;
  int64  dividend_income = 4;
  int64  total_fees     = 5;
  int64  total_tax      = 6;
  int64  net_pnl        = 7;
}
```

### 2.3 analytics/v1/analytics.proto

```protobuf
syntax = "proto3";
package analytics.v1;
option go_package = "github.com/investment-platform/proto/analytics/v1;analyticsv1";

service AnalyticsService {
  rpc RunTechnicalIndicator(IndicatorRequest) returns (IndicatorResult);
  rpc GetRiskMetrics(RiskRequest) returns (RiskMetrics);
  rpc CalcCorrelation(CorrelationRequest) returns (CorrelationMatrix);
  rpc RunBacktest(BacktestConfig) returns (BacktestResult);
}

message IndicatorRequest {
  string symbol   = 1;
  string type     = 2;
  int32  period   = 3;
  string interval = 4;
  map<string, string> extra_params = 5;
}

message IndicatorResult {
  string symbol              = 1;
  string type                = 2;
  int32  period              = 3;
  repeated double values     = 4;
  repeated string timestamps = 5;
  map<string, DoubleList> extra_series = 6;
}

message DoubleList { repeated double values = 1; }

message RiskRequest {
  string account_id    = 1;
  int32  lookback_days = 2;
  double confidence    = 3;
}

message RiskMetrics {
  double var_95             = 1;
  double var_99             = 2;
  double cvar               = 3;
  double sharpe_ratio       = 4;
  double beta               = 5;
  double max_drawdown       = 6;
  string max_dd_from        = 7;
  string max_dd_to          = 8;
  double concentration_top5 = 9;
}

message CorrelationRequest {
  repeated string symbols = 1;
  int32 period_days       = 2;
}

message CorrelationMatrix {
  repeated string symbols  = 1;
  repeated DoubleList rows = 2;
}

message BacktestConfig {
  string symbol = 1;
  string from   = 2;
  string to     = 3;
  repeated BacktestCondition conditions = 4;
  int64  initial_capital = 5;
  double position_size   = 6;
  double commission_pct  = 7;
  double slippage_pct    = 8;
}

message BacktestCondition {
  string type      = 1;
  string indicator = 2;
  map<string, string> params = 3;
  string signal    = 4;
}

message BacktestResult {
  string id                = 1;
  double total_return      = 2;
  double annualized_return = 3;
  double max_drawdown      = 4;
  double sharpe_ratio      = 5;
  double win_rate          = 6;
  double profit_factor     = 7;
  int32  total_trades      = 8;
  repeated BacktestTrade trades = 9;
  repeated EquityPoint equity_curve = 10;
}

message BacktestTrade {
  string entry_date  = 1;
  string exit_date   = 2;
  int64  entry_price = 3;
  int64  exit_price  = 4;
  int32  quantity    = 5;
  int64  pnl         = 6;
  double pnl_pct     = 7;
  int32  hold_days   = 8;
}

message EquityPoint {
  string date   = 1;
  int64  equity = 2;
}
```

### 2.4 notification/v1/notification.proto

```protobuf
syntax = "proto3";
package notification.v1;
option go_package = "github.com/investment-platform/proto/notification/v1;notificationv1";

service NotificationService {
  rpc SendAlert(AlertRequest) returns (SendResult);
  rpc BroadcastEvent(EventRequest) returns (BroadcastResult);
}

message AlertRequest {
  string user_id             = 1;
  string alert_id            = 2;
  string severity            = 3;
  string title               = 4;
  string message             = 5;
  repeated string channels   = 6;
}

message SendResult {
  bool   success                    = 1;
  string message                    = 2;
  map<string, bool> channel_results = 3;
}

message EventRequest {
  string event_type = 1;
  string payload    = 2;
  string room       = 3;
}

message BroadcastResult {
  bool  success          = 1;
  int32 recipients_count = 2;
}
```

---

## 3. TIMEOUT / RETRY / CIRCUIT BREAKER

### 3.1 Timeout

| RPC | Timeout | Lý do |
|-----|---------|-------|
| StreamQuote | ∞ (keepalive 30s) | Persistent stream |
| StreamOrderBook | ∞ (keepalive 30s) | Persistent stream |
| GetHistoricalData | 5s | DB query + format |
| GetOrderBook | 2s | In-memory |
| GetPositions | 3s | Simple query |
| CalcNAV | 5s | Query + calc |
| CalcPnL | 5s | Query + aggregation |
| RunTechnicalIndicator | 10s | Compute series |
| GetRiskMetrics | 15s | Monte Carlo / matrix |
| CalcCorrelation | 15s | NxN matrix |
| RunBacktest | 60s | 250+ bars × conditions |
| SendAlert | 10s | External SMTP/Telegram |
| BroadcastEvent | 5s | Redis publish |

### 3.2 Retry Policy

| Service | maxAttempts | Retryable codes | Ghi chú |
|---------|-------------|-----------------|---------|
| MarketDataService (unary) | 3 | UNAVAILABLE, DEADLINE_EXCEEDED | Idempotent reads |
| MarketDataService (stream) | 1 | — | Client tự reconnect |
| PortfolioService | 3 | UNAVAILABLE | Idempotent reads |
| AnalyticsService (indicator) | 2 | UNAVAILABLE | Medium compute |
| AnalyticsService (backtest) | 1 | — | Heavy compute, no retry |
| NotificationService | 2 | UNAVAILABLE | Important alerts |

### 3.3 Circuit Breaker (gobreaker)

| Circuit | Trigger | Open duration | Fallback |
|---------|---------|---------------|----------|
| market-data-grpc | ≥50% fail / 10 req | 30s | Redis cached quote |
| portfolio-grpc | ≥50% fail / 10 req | 30s | Redis cached NAV |
| analytics-grpc | ≥50% fail / 5 req | 60s | HTTP 503 |
| notification-grpc | ≥50% fail / 5 req | 30s | Queue and retry later |

### 3.4 Keepalive (Streaming)

```
Server: ping mỗi 30s, timeout pong 10s
Client: ping mỗi 20s, timeout pong 10s
```

---

## 4. DEPENDENCY MAP

```
market-data-service ──StreamQuote──────→ portfolio-service (CalcNAV)
market-data-service ──StreamQuote──────→ notification-service (alert evaluator)
market-data-service ──GetHistoricalData→ analytics-service (indicator, backtest)
portfolio-service   ──GetPositions─────→ risk-service (VaR, stress test)
portfolio-service   ──CalcNAV/CalcPnL──→ report-service (performance)
analytics-service   ──GetRiskMetrics───→ risk-service (dashboard)
analytics-service   ──CalcCorrelation──→ risk-service (correlation matrix)
notification-service──SendAlert────────→ realtime-gateway (WebSocket push)
```
