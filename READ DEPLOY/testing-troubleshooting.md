# TESTING & TROUBLESHOOTING — Investment Platform

---

# PHẦN A — TESTING GUIDE

## 1. TEST PYRAMID

```
          ╱ ╲
         ╱ E2E╲           5%    Cypress / Playwright
        ╱───────╲
       ╱ Integr. ╲       20%    API tests, gRPC tests
      ╱─────────────╲
     ╱   Unit Tests   ╲  70%    Go test, Jasmine/Karma
    ╱───────────────────╲
   ╱    Static Analysis   ╲ 5%  golangci-lint, ESLint, strict TS
  ╱─────────────────────────╲
```

## 2. BACKEND — GO TESTS

### 2.1 Unit Test (service layer)

```go
// services/portfolio-service/internal/service/cost_calculator_test.go
func TestCalcWAVG(t *testing.T) {
    tests := []struct {
        name     string
        oldQty   int
        oldAvg   int64
        buyQty   int
        buyPrice int64
        wantAvg  int64
    }{
        {"first buy", 0, 0, 500, 42000, 42000},
        {"second buy higher", 500, 42000, 300, 45000, 43125},
        {"second buy lower", 500, 42000, 500, 38000, 40000},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            got := CalcWAVG(tt.oldQty, tt.oldAvg, tt.buyQty, tt.buyPrice)
            if got != tt.wantAvg {
                t.Errorf("CalcWAVG() = %d, want %d", got, tt.wantAvg)
            }
        })
    }
}
```

### 2.2 Integration Test (handler + DB)

```go
// Dùng testcontainers-go cho MariaDB thật
func TestCreateTransaction_Integration(t *testing.T) {
    ctx := context.Background()
    container, _ := testcontainers.GenericContainer(ctx, testcontainers.GenericContainerRequest{
        ContainerRequest: testcontainers.ContainerRequest{
            Image: "mariadb:11",
            Env:   map[string]string{"MARIADB_ROOT_PASSWORD": "test"},
            ExposedPorts: []string{"3306/tcp"},
            WaitingFor: wait.ForHealthCheck(),
        },
        Started: true,
    })
    defer container.Terminate(ctx)

    // Run migrations, seed, test actual SQL queries
}
```

### 2.3 gRPC Test

```go
func TestCalcNAV(t *testing.T) {
    // Start in-memory gRPC server
    lis, _ := net.Listen("tcp", ":0")
    srv := grpc.NewServer()
    portfoliov1.RegisterPortfolioServiceServer(srv, &mockPortfolioServer{})
    go srv.Serve(lis)
    defer srv.Stop()

    // Create client, call CalcNAV
    conn, _ := grpc.Dial(lis.Addr().String(), grpc.WithInsecure())
    client := portfoliov1.NewPortfolioServiceClient(conn)
    resp, err := client.CalcNAV(ctx, &portfoliov1.NAVRequest{AccountId: "acc_001"})

    assert.NoError(t, err)
    assert.Greater(t, resp.TotalNav, int64(0))
}
```

### 2.4 Chạy tests

```bash
# Unit tests toàn bộ
cd services/portfolio-service && go test ./...

# Với coverage
go test ./... -coverprofile=coverage.out
go tool cover -html=coverage.out

# Chỉ 1 package
go test ./internal/service/... -v

# Integration tests (cần Docker)
go test ./... -tags=integration -count=1
```

### 2.5 Coverage targets

| Layer | Target | Enforce |
|-------|--------|---------|
| service/ | ≥80% | CI fail nếu dưới |
| engine/ | ≥90% | Tính toán tài chính cần chính xác |
| handler/ | ≥60% | Chủ yếu test qua integration |
| repository/ | ≥50% | Test qua testcontainers |

---

## 3. FRONTEND — ANGULAR TESTS

### 3.1 Unit Test (service)

```typescript
// src/app/core/services/portfolio.service.spec.ts
describe('PortfolioService', () => {
  let service: PortfolioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PortfolioService);
  });

  it('should calculate total NAV from holdings', () => {
    service.holdings.set(MOCK_HOLDINGS);
    const nav = service.totalNAV();
    expect(nav).toBeGreaterThan(0);
  });
});
```

### 3.2 Component Test

```typescript
describe('HoldingsComponent', () => {
  it('should render 9 holdings rows', async () => {
    const fixture = TestBed.createComponent(HoldingsComponent);
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(9);
  });
});
```

### 3.3 Chạy tests

```bash
ng test                    # Watch mode
ng test --no-watch --code-coverage    # CI mode + coverage
```

---

## 4. E2E TESTS

```bash
# Cypress
npx cypress open          # Interactive
npx cypress run           # Headless CI

# Test scenarios:
# 1. Login → Dashboard loads → NAV displayed
# 2. Create transaction → Holdings updated
# 3. Import Excel → Preview → Confirm → Transaction list updated
# 4. Change settings → Theme switches
```

---

# PHẦN B — TROUBLESHOOTING

## 1. STARTUP ISSUES

### Angular `ng serve` fails

| Triệu chứng | Nguyên nhân | Fix |
|-------------|-------------|-----|
| `Module not found: echarts` | Chưa npm install | `npm install` |
| `Port 4200 already in use` | Process cũ chưa kill | `npx kill-port 4200` hoặc `ng serve --port 4201` |
| `JavaScript heap out of memory` | Node RAM không đủ | `set NODE_OPTIONS=--max-old-space-size=4096` (Windows) |
| `Cannot find module '@angular/core'` | node_modules lỗi | `rm -rf node_modules && npm install` |
| `Version mismatch @angular/cli` | Global vs local khác | `npm install -g @angular/cli@17` |

### Go service không start

| Triệu chứng | Nguyên nhân | Fix |
|-------------|-------------|-----|
| `connection refused :3306` | MariaDB chưa ready | `docker compose up -d mariadb` → đợi healthcheck |
| `connection refused :6379` | Redis chưa start | `docker compose up -d redis` |
| `proto: not found` | Chưa generate proto | `./scripts/proto-gen.sh` |
| `go: module not found` | Go modules chưa download | `go mod download` |
| `listen tcp :8081: address already in use` | Port đã bị chiếm | `lsof -i :8081` hoặc đổi PORT trong .env |

### Docker issues

| Triệu chứng | Nguyên nhân | Fix |
|-------------|-------------|-----|
| `docker: Cannot connect to daemon` | Docker Desktop chưa mở | Mở Docker Desktop, đợi engine ready |
| `no space left on device` | Docker cache đầy | `docker system prune -a` |
| `mariadb exited (1)` | Password không khớp | `docker compose down -v && docker compose up -d` |
| Build rất chậm | Docker layer cache miss | Kiểm tra `.dockerignore`, đặt COPY go.sum trước COPY source |

---

## 2. RUNTIME ISSUES

### Frontend

| Triệu chứng | Nguyên nhân | Fix |
|-------------|-------------|-----|
| Trang trắng sau login | Guard redirect loop | Check `authGuard` → `localStorage.getItem('user')` |
| Chart không render | ECharts CDN chưa load | Check `<script>` tag trong `index.html`, mở DevTools → Console |
| AG Grid hiện trống | Data chưa set vào signal | Check `holdings.set(data)` trong service |
| WebSocket liên tục reconnect | Server chưa chạy | Bình thường khi `USE_MOCK = true`, WS simulation tự handle |
| Giá không cập nhật | Simulation chưa start | Check `MarketService.startRealtimeSimulation()` |
| Sidebar thiếu menu | Role không match guard | Login đúng role (investor thấy nhiều nhất) |
| Import Excel lỗi | SheetJS CDN blocked | Check network tab, thử offline: `npm install xlsx` |

### Backend

| Triệu chứng | Nguyên nhân | Fix |
|-------------|-------------|-----|
| 401 trên mọi request | JWT expired hoặc secret khác | Check JWT_SECRET giống nhau ở gateway và auth-service |
| 403 Forbidden | Role không đủ quyền | Check RBAC matrix, đúng role chưa |
| 500 khi tạo transaction | DB constraint fail | Check holdings.qty ≥ sell qty, cash ≥ buy value |
| gRPC UNAVAILABLE | Service target chưa start | Check container logs: `docker compose logs analytics-service` |
| Slow response (>5s) | Circuit breaker open | Check service health, restart service target |
| Duplicate key error | Import trùng dữ liệu | unique(date+symbol+qty+price) đã tồn tại |

---

## 3. DEBUG TOOLS

### Frontend

```
Chrome DevTools:
  Console    → JS errors, console.log
  Network    → API calls, status codes, response body
  Application → localStorage (JWT token, user)
  Performance → Component render timing

Angular DevTools (Chrome Extension):
  Component tree → Signal values
  Profiler → Change detection cycles
```

### Backend

```bash
# Xem logs real-time
docker compose logs -f api-gateway portfolio-service

# Kiểm tra DB
docker compose exec mariadb mysql -uroot -proot123 investment
> SELECT * FROM transactions ORDER BY created_at DESC LIMIT 5;

# Kiểm tra Redis
docker compose exec redis redis-cli -a redis123
> GET quotes:VIC
> PUBSUB CHANNELS *

# Test API endpoint
curl -H "Authorization: Bearer <token>" http://localhost:8080/api/v1/accounts

# Test gRPC
grpcurl -plaintext localhost:9081 list
grpcurl -plaintext -d '{"account_id":"acc_001"}' localhost:9081 portfolio.v1.PortfolioService/GetPositions
```

---

## 4. PERFORMANCE CHECKLIST

### Frontend

```
□ Lazy loading: mỗi route = 1 chunk (đã config trong app.routes.ts)
□ OnPush hoặc Signals: không dùng zone.js polling
□ trackBy trong @for: tránh re-render toàn bộ list
□ ECharts: dispose chart khi component destroy
□ AG Grid: dùng rowModelType='clientSide' cho <10K rows
□ Images: dùng WebP, lazy load
```

### Backend

```
□ DB indexes: mọi WHERE clause có index
□ Pagination: không SELECT * không LIMIT
□ Redis cache: quotes TTL 5s, NAV TTL 10s
□ gRPC: reuse connection, không dial mỗi request
□ Go: context.WithTimeout cho mọi DB/gRPC call
□ JSON: dùng sonic hoặc easyjson thay encoding/json nếu cần
```
