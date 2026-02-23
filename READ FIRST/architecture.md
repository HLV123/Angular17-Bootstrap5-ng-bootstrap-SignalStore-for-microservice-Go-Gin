# ARCHITECTURE — Investment Platform

---

## 1. SƠ ĐỒ TỔNG THỂ

```
                          ┌─────────────────────────────────────────────────────────┐
                          │                     INTERNET                            │
                          └───────────────┬──────────────────┬──────────────────────┘
                                          │                  │
                                    HTTPS :443          WSS :443
                                          │                  │
                          ┌───────────────▼──────────────────▼──────────────────────┐
                          │                   NGINX / Ingress                        │
                          │              TLS termination · rate limit                │
                          └───────┬──────────────────┬──────────────────┬───────────┘
                                  │                  │                  │
                             :4200               :8080             :8090
                                  │                  │                  │
                 ┌────────────────▼───┐  ┌───────────▼──────┐  ┌──────▼───────────┐
                 │  Angular Frontend  │  │   API Gateway    │  │ Realtime Gateway │
                 │  (SPA static)      │  │   (Go/Gin)       │  │ (Go/WebSocket)   │
                 │                    │  │   JWT verify      │  │ Hub + Rooms      │
                 │  - Bootstrap 5     │  │   Route proxy     │  │ Broadcast        │
                 │  - ECharts         │  │   CORS            │  │                  │
                 │  - AG Grid         │  │   Rate limit      │  │  5 WS channels:  │
                 │  - SheetJS         │  │   Audit log       │  │  /ws/market      │
                 │  - Signal Store    │  │                   │  │  /ws/portfolio   │
                 │                    │  │                   │  │  /ws/orderbook/* │
                 └────────────────────┘  └──────┬───────────┘  │  /ws/alerts      │
                                                │              │  /ws/news        │
                                     HTTP proxy │              └────────┬─────────┘
                          ┌─────────────────────┼───────────────────────┤
                          │                     │                       │
              ┌───────────▼───┐   ┌─────────────▼──────┐               │ Redis Pub/Sub
              │ auth-service  │   │ portfolio-service   │               │
              │    :8083      │   │      :8081          │               │
              │               │   │                     │               │
              │ register      │   │ accounts            │               │
              │ login → JWT   │   │ holdings            │               │
              │ refresh       │   │ transactions        │               │
              │ MFA (TOTP)    │   │ corporate actions   │               │
              │ password      │   │ watchlists          │               │
              └───────────────┘   │ allocation          │               │
                                  │ import/export       │               │
                                  └──────────┬──────────┘               │
                                             │ gRPC                     │
              ┌──────────────────────────────┐│┌────────────────────────┤
              │                              │││                        │
   ┌──────────▼──────┐            ┌──────────▼▼▼─────┐     ┌───────────▼──────┐
   │ market-data-svc │            │ analytics-service│     │notification-svc  │
   │    :8082        │◄──gRPC───►│      :8084       │     │     :8087        │
   │                 │            │                  │     │                  │
   │ quotes (cache)  │            │ indicators       │     │ alert configs    │
   │ OHLCV history   │            │ patterns         │     │ alert evaluator  │
   │ indices         │            │ backtesting      │     │ audit logs       │
   │ 5 data providers│            │ screener         │     │ email / telegram │
   │                 │            │ fundamentals     │     │                  │
   └────────┬────────┘            └────────┬─────────┘     └──────────────────┘
            │                              │
            │ gRPC                         │ gRPC
            │                              │
   ┌────────▼────────┐            ┌────────▼─────────┐     ┌──────────────────┐
   │  risk-service   │            │ report-service   │     │ config-service   │
   │    :8085        │            │     :8086        │     │     :8088        │
   │                 │            │                  │     │                  │
   │ VaR (3 methods) │            │ performance      │     │ user settings    │
   │ correlation     │            │ attribution      │     │ dashboard layout │
   │ stress test     │            │ benchmark        │     │ data sources     │
   │ risk limits     │            │ BI: Tableau      │     │ admin users      │
   │ drawdown        │            │ BI: Power BI     │     │                  │
   └─────────────────┘            │ BI: Cognos       │     └──────────────────┘
                                  │ OData feeds      │
                                  └──────┬───────────┘
                                         │ REST
                          ┌──────────────┼──────────────┐
                          │              │              │
                  ┌───────▼──┐   ┌───────▼──┐   ┌──────▼───┐
                  │ Tableau  │   │ Power BI │   │  Cognos  │
                  │ Server   │   │ Embedded │   │ Analytics│
                  └──────────┘   └──────────┘   └──────────┘

    ════════════════════════════════ DATA LAYER ════════════════════════════════

              ┌──────────────────┐          ┌──────────────────┐
              │    MariaDB 11    │          │    Redis 7       │
              │    :3306         │          │    :6379         │
              │                  │          │                  │
              │ 13 tables        │          │ quote cache      │
              │ (see schema)     │          │ NAV cache        │
              │                  │          │ sessions         │
              │ Alt: IBM Db2     │          │ Pub/Sub channels │
              │     :50000       │          │ rate limit       │
              └──────────────────┘          └──────────────────┘
```

---

## 2. QUYẾT ĐỊNH THIẾT KẾ

### 2.1 Tại sao Microservices thay vì Monolith?

| Tiêu chí | Quyết định | Lý do |
|-----------|------------|-------|
| Scaling | Microservices | market-data-service cần scale riêng khi lượng quote lớn, các service khác không cần |
| Team phân chia | Microservices | Mỗi service là 1 bounded context rõ ràng, dev có thể làm độc lập |
| Deploy độc lập | Microservices | Sửa alert logic không cần deploy lại portfolio hay market |
| Complexity trade-off | Chấp nhận | Docker Compose + gRPC giảm complexity vận hành, chấp nhận network overhead |

### 2.2 Tại sao Go thay vì Java/Node.js?

| Tiêu chí | Go | Java | Node.js |
|----------|----|------|---------|
| Concurrency (WebSocket, gRPC stream) | Goroutine native | Thread pool phức tạp | Single-thread event loop |
| Memory footprint mỗi service | ~10-30MB | ~200-500MB | ~50-100MB |
| gRPC first-class | Có (protoc-gen-go) | Có nhưng verbose | Có nhưng ít phổ biến |
| Deploy size (Docker image) | ~20MB (scratch) | ~200MB (JRE) | ~150MB (node_modules) |
| Startup time | <1s | 5-15s (Spring Boot) | 1-3s |
| Quyết định | ✅ Chọn Go | | |

### 2.3 Tại sao tách API Gateway và Realtime Gateway?

```
Vấn đề:  HTTP request-response và WebSocket persistent connection
          có lifecycle hoàn toàn khác nhau.

HTTP request:    client → gateway → service → response → done (ms)
WebSocket:       client → gateway → keep-alive → broadcast liên tục (hours)

Nếu gộp:  WebSocket connections chiếm goroutine + memory, ảnh hưởng
           throughput của REST requests.

Giải pháp: Tách thành 2 process:
           - api-gateway :8080      → stateless, scale horizontal dễ
           - realtime-gateway :8090 → stateful (maintain connections),
                                      scale bằng sticky sessions
```

### 2.4 Tại sao gRPC nội bộ thay vì REST nội bộ?

| Yếu tố | gRPC | REST nội bộ |
|---------|------|-------------|
| Latency | Binary protobuf, ~10x nhanh hơn JSON | JSON serialize/deserialize |
| Streaming | Server-stream, bi-directional native | Không có (phải polling) |
| Contract | .proto file = source of truth | OpenAPI nhưng dễ lệch |
| Use case chính | CalcNAV real-time, StreamQuote, RunBacktest | Không phù hợp cho streaming |

Tuy nhiên, **FE ↔ Gateway vẫn dùng REST** vì browser không support gRPC native, và REST dễ debug hơn qua DevTools.

### 2.5 Tại sao Redis cho real-time thay vì Kafka?

| Yếu tố | Redis Pub/Sub | Kafka |
|---------|---------------|-------|
| Latency | Sub-millisecond | 5-50ms |
| Complexity | Chỉ cần 1 Redis instance | Cần Kafka cluster + ZooKeeper |
| Use case | Broadcast giá real-time (fire-and-forget) | Event sourcing, replay |
| Durable? | Không (nếu subscriber offline thì mất) | Có (replay từ offset) |
| Quyết định | ✅ Đủ cho broadcast giá + alerts | Overkill cho project này |

Nếu sau này cần event sourcing (audit trail, replay), có thể thêm Kafka bên cạnh Redis mà không thay đổi kiến trúc hiện tại.

### 2.6 Tại sao MariaDB thay vì PostgreSQL?

| Tiêu chí | MariaDB | PostgreSQL |
|-----------|---------|------------|
| Ecosystem Việt Nam | Phổ biến hơn, nhiều hosting VN hỗ trợ | Ít phổ biến hơn tại VN |
| Compatibility | MySQL-compatible, dễ migrate | Khác syntax |
| JSON support | JSON column type, đủ cho config/layout | JSONB mạnh hơn |
| Quyết định | ✅ MariaDB (chính) + option Db2 (enterprise) | |

---

## 3. GIAO THỨC GIAO TIẾP — TÓM TẮT

```
Angular ←── REST/HTTPS ──→ api-gateway ←── HTTP proxy ──→ 8 services
Angular ←── WSS ──────────→ realtime-gateway ←── Redis Pub/Sub ──→ market-data, notification
Services ←── gRPC ────────→ Services (nội bộ, không qua gateway)
report-service ←── REST ──→ Tableau / Power BI / Cognos (external BI)
All services ←── SQL ─────→ MariaDB
market-data + notification ←── Redis ──→ realtime-gateway
```

| Kênh | Protocol | Format | Auth |
|------|----------|--------|------|
| FE → API Gateway | HTTPS REST | JSON | JWT Bearer |
| FE → Realtime GW | WSS | JSON (type field) | JWT trong query param |
| API GW → Services | HTTP | JSON (forwarded) | Internal header X-User-ID |
| Service ↔ Service | gRPC | Protobuf binary | mTLS (production) |
| Service → Redis | Redis protocol | JSON string | Password |
| Service → MariaDB | MySQL protocol | SQL | Username/password |
| Report → BI Tools | HTTPS REST | JSON / OData | API key / embed token |

---

## 4. DATA FLOW — CÁC LUỒNG CHÍNH

### 4.1 Giá real-time: Provider → Browser

```
HOSE/VNDirect ──poll──→ market-data-service ──Redis PUBLISH──→ realtime-gateway ──WSS──→ Angular
      5 providers           in-memory cache         "quote_updates"         hub.Broadcast()    MarketService signal()
      priority-based        update every 1-3s       pub/sub channel        room: "market"      UI auto-render
```

### 4.2 Tính NAV: Khi giá thay đổi

```
market-data-service ──gRPC StreamQuote──→ portfolio-service.CalcNAV()
                                              │
                                              ├── SUM(holdings.qty × currentPrice) + cash
                                              │
                                              └──→ Redis PUBLISH "nav_updates"
                                                         │
                                                         └──→ realtime-gateway ──WSS──→ Angular dashboard
```

### 4.3 Alert trigger: Khi điều kiện thỏa

```
market-data-service ──gRPC──→ notification-service.alert_evaluator
                                    │
                                    ├── loop all active alert_configs WHERE symbol = updated_symbol
                                    ├── evaluate condition (price >= threshold?)
                                    │
                                    ├── YES → INSERT alert_history
                                    │       → dispatch to channels:
                                    │           ├── inapp → Redis PUBLISH "alerts:{userId}" → WSS → Angular
                                    │           ├── email → SMTP
                                    │           └── telegram → Bot API webhook
                                    │
                                    └── NO → skip
```

---

## 5. DEPLOYMENT TOPOLOGY

### Development (docker-compose)

```
1 máy dev chạy tất cả:

Docker Desktop
├── mariadb:11          :3306
├── redis:7-alpine      :6379
├── api-gateway         :8080
├── realtime-gateway    :8090
├── auth-service        :8083
├── portfolio-service   :8081
├── market-data-service :8082
├── analytics-service   :8084
├── risk-service        :8085
├── report-service      :8086
├── notification-service:8087
└── config-service      :8088

Angular dev server      :4200  (ng serve, ngoài Docker)
```

### Production (Kubernetes)

```
K8s Cluster
├── Namespace: investment-prod
│   ├── Ingress (NGINX)           → TLS, routing
│   ├── Deployment: api-gateway   → 2 replicas, HPA
│   ├── Deployment: realtime-gw   → 2 replicas, sticky session
│   ├── Deployment: auth          → 2 replicas
│   ├── Deployment: portfolio     → 2 replicas
│   ├── Deployment: market-data   → 3 replicas (high traffic)
│   ├── Deployment: analytics     → 2 replicas
│   ├── Deployment: risk          → 1 replica
│   ├── Deployment: report        → 1 replica
│   ├── Deployment: notification  → 2 replicas
│   ├── Deployment: config        → 1 replica
│   ├── StatefulSet: mariadb      → 1 primary + 1 replica
│   ├── Deployment: redis         → 1 (or Redis Sentinel)
│   └── CronJob: market-data-sync → daily OHLCV sync
│
├── Namespace: investment-bi
│   ├── Tableau Server
│   ├── Power BI Gateway
│   └── Cognos Analytics
│
└── Namespace: monitoring
    ├── Prometheus
    ├── Grafana
    └── Jaeger (distributed tracing)
```
