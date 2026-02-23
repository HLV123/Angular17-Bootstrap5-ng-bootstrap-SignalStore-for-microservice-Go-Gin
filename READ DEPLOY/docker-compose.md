# DOCKER COMPOSE — Investment Platform

Toàn bộ hạ tầng 1 file: 10 services + 2 gateways + MariaDB + Redis.

---

## 1. DOCKER COMPOSE DEVELOPMENT

```yaml
# docker-compose.yml
version: "3.9"

services:

  # ════════════════════════════════════════
  # INFRASTRUCTURE
  # ════════════════════════════════════════

  mariadb:
    image: mariadb:11
    container_name: inv-mariadb
    restart: unless-stopped
    ports:
      - "3306:3306"
    environment:
      MARIADB_ROOT_PASSWORD: ${DB_ROOT_PASSWORD:-root123}
      MARIADB_DATABASE: investment
      MARIADB_CHARACTER_SET: utf8mb4
      MARIADB_COLLATION: utf8mb4_unicode_ci
    volumes:
      - mariadb-data:/var/lib/mysql
      - ./migrations/mariadb/seed:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD", "healthcheck.sh", "--connect", "--innodb_initialized"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: inv-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    command: redis-server --requirepass ${REDIS_PASSWORD:-redis123} --maxmemory 256mb --maxmemory-policy allkeys-lru
    volumes:
      - redis-data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD:-redis123}", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  # ════════════════════════════════════════
  # GATEWAYS
  # ════════════════════════════════════════

  api-gateway:
    build:
      context: .
      dockerfile: deployments/docker/api-gateway.Dockerfile
    container_name: inv-api-gateway
    restart: unless-stopped
    ports:
      - "8080:8080"
    environment:
      PORT: 8080
      JWT_SECRET: ${JWT_SECRET:-super-secret-key-change-in-production}
      AUTH_SERVICE_URL: http://auth-service:8083
      PORTFOLIO_SERVICE_URL: http://portfolio-service:8081
      MARKET_SERVICE_URL: http://market-data-service:8082
      ANALYTICS_SERVICE_URL: http://analytics-service:8084
      RISK_SERVICE_URL: http://risk-service:8085
      REPORT_SERVICE_URL: http://report-service:8086
      NOTIFICATION_SERVICE_URL: http://notification-service:8087
      CONFIG_SERVICE_URL: http://config-service:8088
      CORS_ORIGINS: http://localhost:4200,http://localhost:4201
      RATE_LIMIT_RPS: 100
      LOG_LEVEL: debug
    depends_on:
      mariadb:
        condition: service_healthy
      redis:
        condition: service_healthy

  realtime-gateway:
    build:
      context: .
      dockerfile: deployments/docker/realtime-gateway.Dockerfile
    container_name: inv-realtime-gw
    restart: unless-stopped
    ports:
      - "8090:8090"
    environment:
      PORT: 8090
      JWT_SECRET: ${JWT_SECRET:-super-secret-key-change-in-production}
      REDIS_URL: redis://default:${REDIS_PASSWORD:-redis123}@redis:6379/0
      CORS_ORIGINS: http://localhost:4200,http://localhost:4201
    depends_on:
      redis:
        condition: service_healthy

  # ════════════════════════════════════════
  # SERVICES
  # ════════════════════════════════════════

  auth-service:
    build:
      context: .
      dockerfile: deployments/docker/auth-service.Dockerfile
    container_name: inv-auth
    restart: unless-stopped
    ports:
      - "8083:8083"
    environment:
      PORT: 8083
      DB_DSN: root:${DB_ROOT_PASSWORD:-root123}@tcp(mariadb:3306)/investment?parseTime=true&charset=utf8mb4
      JWT_SECRET: ${JWT_SECRET:-super-secret-key-change-in-production}
      JWT_ACCESS_TTL: 15m
      JWT_REFRESH_TTL: 168h
      BCRYPT_COST: 12
    depends_on:
      mariadb:
        condition: service_healthy

  portfolio-service:
    build:
      context: .
      dockerfile: deployments/docker/portfolio-service.Dockerfile
    container_name: inv-portfolio
    restart: unless-stopped
    ports:
      - "8081:8081"
      - "9081:9081"
    environment:
      PORT: 8081
      GRPC_PORT: 9081
      DB_DSN: root:${DB_ROOT_PASSWORD:-root123}@tcp(mariadb:3306)/investment?parseTime=true&charset=utf8mb4
      REDIS_URL: redis://default:${REDIS_PASSWORD:-redis123}@redis:6379/0
      MARKET_GRPC_ADDR: market-data-service:9082
      NOTIFICATION_GRPC_ADDR: notification-service:9087
    depends_on:
      mariadb:
        condition: service_healthy
      redis:
        condition: service_healthy

  market-data-service:
    build:
      context: .
      dockerfile: deployments/docker/market-data-service.Dockerfile
    container_name: inv-market
    restart: unless-stopped
    ports:
      - "8082:8082"
      - "9082:9082"
    environment:
      PORT: 8082
      GRPC_PORT: 9082
      DB_DSN: root:${DB_ROOT_PASSWORD:-root123}@tcp(mariadb:3306)/investment?parseTime=true&charset=utf8mb4
      REDIS_URL: redis://default:${REDIS_PASSWORD:-redis123}@redis:6379/0
      REDIS_PUBSUB_CHANNEL: quote_updates
      QUOTE_POLL_INTERVAL: 3s
    depends_on:
      mariadb:
        condition: service_healthy
      redis:
        condition: service_healthy

  analytics-service:
    build:
      context: .
      dockerfile: deployments/docker/analytics-service.Dockerfile
    container_name: inv-analytics
    restart: unless-stopped
    ports:
      - "8084:8084"
      - "9084:9084"
    environment:
      PORT: 8084
      GRPC_PORT: 9084
      DB_DSN: root:${DB_ROOT_PASSWORD:-root123}@tcp(mariadb:3306)/investment?parseTime=true&charset=utf8mb4
      MARKET_GRPC_ADDR: market-data-service:9082
    depends_on:
      mariadb:
        condition: service_healthy

  risk-service:
    build:
      context: .
      dockerfile: deployments/docker/risk-service.Dockerfile
    container_name: inv-risk
    restart: unless-stopped
    ports:
      - "8085:8085"
    environment:
      PORT: 8085
      DB_DSN: root:${DB_ROOT_PASSWORD:-root123}@tcp(mariadb:3306)/investment?parseTime=true&charset=utf8mb4
      PORTFOLIO_GRPC_ADDR: portfolio-service:9081
      MARKET_GRPC_ADDR: market-data-service:9082
      ANALYTICS_GRPC_ADDR: analytics-service:9084
    depends_on:
      mariadb:
        condition: service_healthy

  report-service:
    build:
      context: .
      dockerfile: deployments/docker/report-service.Dockerfile
    container_name: inv-report
    restart: unless-stopped
    ports:
      - "8086:8086"
    environment:
      PORT: 8086
      DB_DSN: root:${DB_ROOT_PASSWORD:-root123}@tcp(mariadb:3306)/investment?parseTime=true&charset=utf8mb4
      PORTFOLIO_GRPC_ADDR: portfolio-service:9081
      MARKET_GRPC_ADDR: market-data-service:9082
      TABLEAU_SERVER: ${TABLEAU_SERVER:-}
      TABLEAU_SITE: ${TABLEAU_SITE:-}
      TABLEAU_USERNAME: ${TABLEAU_USERNAME:-}
      TABLEAU_PASSWORD: ${TABLEAU_PASSWORD:-}
      POWERBI_CLIENT_ID: ${POWERBI_CLIENT_ID:-}
      POWERBI_TENANT_ID: ${POWERBI_TENANT_ID:-}
      COGNOS_API_URL: ${COGNOS_API_URL:-}
    depends_on:
      mariadb:
        condition: service_healthy

  notification-service:
    build:
      context: .
      dockerfile: deployments/docker/notification-service.Dockerfile
    container_name: inv-notification
    restart: unless-stopped
    ports:
      - "8087:8087"
      - "9087:9087"
    environment:
      PORT: 8087
      GRPC_PORT: 9087
      DB_DSN: root:${DB_ROOT_PASSWORD:-root123}@tcp(mariadb:3306)/investment?parseTime=true&charset=utf8mb4
      REDIS_URL: redis://default:${REDIS_PASSWORD:-redis123}@redis:6379/0
      SMTP_HOST: ${SMTP_HOST:-smtp.gmail.com}
      SMTP_PORT: ${SMTP_PORT:-587}
      SMTP_USER: ${SMTP_USER:-}
      SMTP_PASS: ${SMTP_PASS:-}
      SMTP_FROM: ${SMTP_FROM:-alerts@investment.vn}
    depends_on:
      mariadb:
        condition: service_healthy
      redis:
        condition: service_healthy

  config-service:
    build:
      context: .
      dockerfile: deployments/docker/config-service.Dockerfile
    container_name: inv-config
    restart: unless-stopped
    ports:
      - "8088:8088"
    environment:
      PORT: 8088
      DB_DSN: root:${DB_ROOT_PASSWORD:-root123}@tcp(mariadb:3306)/investment?parseTime=true&charset=utf8mb4
    depends_on:
      mariadb:
        condition: service_healthy

volumes:
  mariadb-data:
  redis-data:
```

---

## 2. .ENV FILE

```env
# .env (copy from .env.example)

# Database
DB_ROOT_PASSWORD=root123

# Redis
REDIS_PASSWORD=redis123

# JWT
JWT_SECRET=super-secret-key-change-in-production

# SMTP (optional - for email alerts)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=alerts@investment.vn

# BI Tools (optional)
TABLEAU_SERVER=
TABLEAU_SITE=
TABLEAU_USERNAME=
TABLEAU_PASSWORD=
POWERBI_CLIENT_ID=
POWERBI_TENANT_ID=
COGNOS_API_URL=
```

---

## 3. DOCKERFILE MẪU

```dockerfile
# deployments/docker/auth-service.Dockerfile
FROM golang:1.22-alpine AS builder
WORKDIR /build
COPY go.work go.work.sum ./
COPY pkg/ pkg/
COPY services/auth-service/ services/auth-service/
RUN cd services/auth-service && go build -o /app main.go

FROM alpine:3.19
RUN apk --no-cache add ca-certificates
COPY --from=builder /app /app
EXPOSE 8083
CMD ["/app"]
```

Tất cả service dùng pattern tương tự, chỉ thay path và port.

---

## 4. LỆNH THAO TÁC

```bash
# Khởi động tất cả
docker compose up -d

# Khởi động chỉ infra (dev từng service bằng `go run`)
docker compose up -d mariadb redis

# Xem logs
docker compose logs -f api-gateway
docker compose logs -f --tail 50 portfolio-service

# Restart 1 service
docker compose restart portfolio-service

# Rebuild sau khi sửa code
docker compose up -d --build portfolio-service

# Dừng tất cả
docker compose down

# Dừng + xóa data (reset DB)
docker compose down -v

# Xem trạng thái
docker compose ps

# Chạy migration
docker compose exec mariadb mysql -uroot -proot123 investment < migrations/mariadb/000001_create_users.up.sql

# Kết nối DB
docker compose exec mariadb mysql -uroot -proot123 investment

# Kết nối Redis
docker compose exec redis redis-cli -a redis123
```

---

## 5. PORT MAP

```
SERVICE                  REST    gRPC    INTERNAL ONLY
─────────────────────────────────────────────────────
mariadb                  3306    —       —
redis                    6379    —       —
api-gateway              8080    —       —
realtime-gateway         8090    —       —
auth-service             8083    —       ✓ (qua gateway)
portfolio-service        8081    9081    ✓
market-data-service      8082    9082    ✓
analytics-service        8084    9084    ✓
risk-service             8085    —       ✓
report-service           8086    —       ✓
notification-service     8087    9087    ✓
config-service           8088    —       ✓
─────────────────────────────────────────────────────
Angular dev server       4200    —       FE only
```

Production: chỉ expose 8080 (REST) và 8090 (WSS) qua Ingress, tất cả service khác internal-only.

---

## 6. HEALTH CHECK ENDPOINTS

Mỗi service expose `GET /health`:

```json
{
  "status": "ok",
  "service": "portfolio-service",
  "version": "1.0.0",
  "uptime": "2h15m",
  "checks": {
    "database": "ok",
    "redis": "ok",
    "grpc_market": "ok"
  }
}
```

Docker Compose dùng healthcheck để đảm bảo thứ tự khởi động: MariaDB + Redis sẵn sàng trước → services khởi động sau.
