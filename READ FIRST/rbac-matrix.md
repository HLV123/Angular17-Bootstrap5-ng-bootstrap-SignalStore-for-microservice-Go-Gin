# RBAC MATRIX — Investment Platform

Phân quyền 3 lớp: UI Sidebar → API Endpoint → Data Row/Column.

---

## LỚP 1 — UI SIDEBAR (Angular Route Guards)

| Menu | Route | investor | analyst | admin |
|------|-------|----------|---------|-------|
| Dashboard | `/dashboard` | ✅ | ✅ | ✅ |
| **Danh mục** | | | | |
| Tài khoản đầu tư | `/portfolio/accounts` | ✅ | ❌ | ❌ |
| Vị thế nắm giữ | `/portfolio/holdings` | ✅ | ❌ | ❌ |
| Phân bổ & Tái cân bằng | `/portfolio/allocation` | ✅ | ❌ | ❌ |
| **Giao dịch** | | | | |
| Lịch sử giao dịch | `/transactions` | ✅ | ❌ | ❌ |
| Nhập lệnh mới | `/transactions/new` | ✅ | ❌ | ❌ |
| Import / Export | `/transactions/import` | ✅ | ❌ | ❌ |
| **Thị trường** | | | | |
| Bảng giá | `/market` | ✅ | ✅ | ❌ |
| Sổ lệnh | `/market/orderbook` | ✅ | ✅ | ❌ |
| Watchlist | `/market/watchlist` | ✅ | ✅ | ❌ |
| **Phân tích KT** | | | | |
| Biểu đồ giá | `/analysis/chart` | ✅ | ✅ | ❌ |
| Nhận dạng Pattern | `/analysis/patterns` | ✅ | ✅ | ❌ |
| Backtesting | `/analysis/backtest` | ✅ | ✅ | ❌ |
| **Phân tích CB** | | | | |
| Hồ sơ doanh nghiệp | `/fundamental/profile` | ✅ | ✅ | ❌ |
| Báo cáo tài chính | `/fundamental/financials` | ✅ | ✅ | ❌ |
| Sàng lọc cổ phiếu | `/fundamental/screener` | ✅ | ✅ | ❌ |
| **Rủi ro** | | | | |
| Quản lý rủi ro | `/risk` | ✅ | ❌ | ❌ |
| Stress Testing | `/risk/stress-test` | ✅ | ❌ | ❌ |
| **Báo cáo** | | | | |
| Hiệu suất đầu tư | `/reports` | ✅ | ❌ | ❌ |
| Tích hợp BI | `/reports/bi` | ✅ | ✅ | ❌ |
| **Cảnh báo** | | | | |
| Cài đặt cảnh báo | `/alerts` | ✅ | ✅ | ❌ |
| Lịch sử cảnh báo | `/alerts/history` | ✅ | ✅ | ❌ |
| **Admin** | | | | |
| Quản lý người dùng | `/admin/users` | ❌ | ❌ | ✅ |
| Nguồn dữ liệu | `/admin/config` | ❌ | ❌ | ✅ |
| Nhật ký hệ thống | `/admin/audit` | ❌ | ❌ | ✅ |
| **Cài đặt** | | | | |
| Cài đặt cá nhân | `/settings` | ✅ | ✅ | ✅ |

Frontend guard trong `app.routes.ts`:
- `authGuard` — bắt buộc đăng nhập
- `roleGuard(['investor'])` — chỉ investor
- `roleGuard(['investor', 'analyst'])` — investor hoặc analyst
- `adminGuard` — chỉ admin

---

## LỚP 2 — API ENDPOINT (Backend Middleware)

### Auth Service

| Endpoint | Method | Public | investor | analyst | admin |
|----------|--------|--------|----------|---------|-------|
| `/auth/register` | POST | ✅ | — | — | — |
| `/auth/login` | POST | ✅ | — | — | — |
| `/auth/refresh` | POST | ✅ | — | — | — |
| `/auth/logout` | POST | 🔒 | ✅ | ✅ | ✅ |
| `/auth/profile` | GET | 🔒 | ✅ own | ✅ own | ✅ own |
| `/auth/profile` | PUT | 🔒 | ✅ own | ✅ own | ✅ own |
| `/auth/forgot-password` | POST | ✅ | — | — | — |
| `/auth/reset-password` | POST | ✅ | — | — | — |
| `/auth/mfa/enable` | POST | 🔒 | ✅ own | ✅ own | ✅ own |
| `/auth/mfa/verify` | POST | 🔒 | ✅ own | ✅ own | ✅ own |

### Portfolio Service

| Endpoint | Method | investor | analyst | admin |
|----------|--------|----------|---------|-------|
| `/accounts` | GET | ✅ own | ❌ | ❌ |
| `/accounts` | POST | ✅ | ❌ | ❌ |
| `/accounts/{id}` | GET | ✅ own | ❌ | ❌ |
| `/accounts/{id}` | PUT | ✅ own | ❌ | ❌ |
| `/accounts/{id}` | DELETE | ✅ own | ❌ | ❌ |
| `/accounts/{id}/summary` | GET | ✅ own | ❌ | ❌ |
| `/accounts/{id}/holdings` | GET | ✅ own | ❌ | ❌ |
| `/accounts/{id}/holdings/{sym}` | GET | ✅ own | ❌ | ❌ |
| `/accounts/{id}/holdings/summary` | GET | ✅ own | ❌ | ❌ |
| `/accounts/{id}/allocation` | GET | ✅ own | ❌ | ❌ |
| `/accounts/{id}/allocation/target` | POST | ✅ own | ❌ | ❌ |
| `/accounts/{id}/allocation/suggest` | GET | ✅ own | ❌ | ❌ |
| `/accounts/{id}/allocation/simulate` | POST | ✅ own | ❌ | ❌ |
| `/transactions` | GET | ✅ own | ❌ | ❌ |
| `/transactions` | POST | ✅ | ❌ | ❌ |
| `/transactions/{id}` | GET | ✅ own | ❌ | ❌ |
| `/transactions/{id}` | PUT | ✅ own | ❌ | ❌ |
| `/transactions/{id}` | DELETE | ✅ own | ❌ | ❌ |
| `/transactions/summary` | GET | ✅ own | ❌ | ❌ |
| `/transactions/import/preview` | POST | ✅ | ❌ | ❌ |
| `/transactions/import/confirm` | POST | ✅ | ❌ | ❌ |
| `/transactions/import/history` | GET | ✅ own | ❌ | ❌ |
| `/transactions/import/template` | GET | ✅ | ✅ | ❌ |
| `/corporate-actions` | GET | ✅ | ✅ read | ✅ |
| `/corporate-actions` | POST | ✅ | ❌ | ✅ |
| `/corporate-actions/{id}/apply` | POST | ✅ own | ❌ | ✅ |
| `/corporate-actions/calendar` | GET | ✅ | ✅ | ✅ |
| `/watchlists` | GET | ✅ own | ✅ own | ❌ |
| `/watchlists` | POST | ✅ | ✅ | ❌ |
| `/watchlists/{id}` | PUT | ✅ own | ✅ own | ❌ |
| `/watchlists/{id}` | DELETE | ✅ own | ✅ own | ❌ |
| `/watchlists/{id}/symbols` | POST | ✅ own | ✅ own | ❌ |
| `/watchlists/{id}/symbols/{sym}` | DELETE | ✅ own | ✅ own | ❌ |
| `/export/*` | GET | ✅ own | ✅ own | ❌ |

### Market Data Service

| Endpoint | Method | investor | analyst | admin |
|----------|--------|----------|---------|-------|
| `/market/quotes` | GET | ✅ | ✅ | ✅ |
| `/market/quotes/{symbol}` | GET | ✅ | ✅ | ✅ |
| `/market/indices` | GET | ✅ | ✅ | ✅ |
| `/market/ohlcv/{symbol}` | GET | ✅ | ✅ | ❌ |
| `/market/indicators/{symbol}` | GET | ✅ | ✅ | ❌ |

### Analytics Service

| Endpoint | Method | investor | analyst | admin |
|----------|--------|----------|---------|-------|
| `/analytics/patterns/{symbol}` | GET | ✅ | ✅ | ❌ |
| `/analytics/patterns/scan` | POST | ✅ | ✅ | ❌ |
| `/backtesting/run` | POST | ✅ | ✅ | ❌ |
| `/backtesting/{id}` | GET | ✅ own | ✅ own | ❌ |
| `/backtesting` | GET | ✅ own | ✅ own | ❌ |
| `/backtesting/compare` | POST | ✅ | ✅ | ❌ |
| `/screener/run` | POST | ✅ | ✅ | ❌ |
| `/screener/saved` | GET | ✅ own | ✅ own | ❌ |
| `/screener/saved` | POST | ✅ | ✅ | ❌ |
| `/fundamentals/{sym}/*` | GET | ✅ | ✅ | ❌ |

### Risk Service

| Endpoint | Method | investor | analyst | admin |
|----------|--------|----------|---------|-------|
| `/risk/{id}/metrics` | GET | ✅ own | ❌ | ❌ |
| `/risk/{id}/var` | GET | ✅ own | ❌ | ❌ |
| `/risk/{id}/correlation` | GET | ✅ own | ❌ | ❌ |
| `/risk/{id}/drawdown` | GET | ✅ own | ❌ | ❌ |
| `/risk/{id}/limits` | GET | ✅ own | ❌ | ❌ |
| `/risk/{id}/limits` | POST | ✅ own | ❌ | ❌ |
| `/risk/{id}/limits/{lid}` | PUT | ✅ own | ❌ | ❌ |
| `/risk/{id}/limits/{lid}` | DELETE | ✅ own | ❌ | ❌ |
| `/risk/scenarios` | GET | ✅ | ❌ | ❌ |
| `/risk/scenarios` | POST | ✅ | ❌ | ❌ |
| `/risk/{id}/stress-test` | POST | ✅ own | ❌ | ❌ |

### Report & BI Service

| Endpoint | Method | investor | analyst | admin |
|----------|--------|----------|---------|-------|
| `/reports/performance/{id}` | GET | ✅ own | ❌ | ❌ |
| `/reports/returns/{id}` | GET | ✅ own | ❌ | ❌ |
| `/reports/attribution/{id}` | GET | ✅ own | ❌ | ❌ |
| `/reports/comparison/{id}` | GET | ✅ own | ❌ | ❌ |
| `/reports/transactions/{id}` | GET | ✅ own | ❌ | ❌ |
| `/bi/tableau/token` | GET | ✅ | ✅ | ❌ |
| `/bi/powerbi/embed-token` | GET | ✅ | ✅ | ❌ |
| `/bi/powerbi/reports` | GET | ✅ | ✅ | ❌ |
| `/bi/cognos/*` | GET | ✅ | ✅ | ❌ |
| `/bi/data/*` | GET | ❌ | ✅ | ❌ |
| `/bi/odata/*` | GET | ❌ | ✅ | ❌ |

### Notification & Alert Service

| Endpoint | Method | investor | analyst | admin |
|----------|--------|----------|---------|-------|
| `/alerts` | GET | ✅ own | ✅ own | ❌ |
| `/alerts` | POST | ✅ | ✅ | ❌ |
| `/alerts/{id}` | PUT | ✅ own | ✅ own | ❌ |
| `/alerts/{id}` | DELETE | ✅ own | ✅ own | ❌ |
| `/alerts/{id}/toggle` | PUT | ✅ own | ✅ own | ❌ |
| `/alerts/history` | GET | ✅ own | ✅ own | ❌ |
| `/alerts/history/{id}/read` | PUT | ✅ own | ✅ own | ❌ |
| `/audit-logs` | GET | ❌ | ❌ | ✅ |
| `/audit-logs/export` | GET | ❌ | ❌ | ✅ |

### Config Service

| Endpoint | Method | investor | analyst | admin |
|----------|--------|----------|---------|-------|
| `/settings/user` | GET | ✅ own | ✅ own | ✅ own |
| `/settings/user` | PUT | ✅ own | ✅ own | ✅ own |
| `/settings/user/dashboard` | GET | ✅ own | ✅ own | ✅ own |
| `/settings/user/dashboard` | PUT | ✅ own | ✅ own | ✅ own |
| `/admin/users` | GET | ❌ | ❌ | ✅ |
| `/admin/users/{id}` | GET | ❌ | ❌ | ✅ |
| `/admin/users/{id}` | PUT | ❌ | ❌ | ✅ |
| `/admin/users/{id}` | DELETE | ❌ | ❌ | ✅ |
| `/admin/users/activity` | GET | ❌ | ❌ | ✅ |
| `/admin/data-sources` | GET | ❌ | ❌ | ✅ |
| `/admin/data-sources` | POST | ❌ | ❌ | ✅ |
| `/admin/data-sources/{id}` | PUT | ❌ | ❌ | ✅ |
| `/admin/data-sources/{id}/test` | POST | ❌ | ❌ | ✅ |

---

## LỚP 3 — DATA ROW / COLUMN (Database Level)

### Row-level security: "own" rule

Mọi endpoint đánh dấu `own` nghĩa là backend phải filter theo `user_id` từ JWT:

```go
// Middleware extract user từ JWT
userId := ctx.GetString("X-User-ID")

// Repository query luôn kèm WHERE user_id
func (r *AccountRepo) FindByUser(userId string) ([]Account, error) {
    return r.db.Where("user_id = ?", userId).Find(&accounts)
}
```

Investor A không bao giờ thấy data của Investor B, kể cả gọi trực tiếp API với ID của B → trả về 403.

### Bảng áp dụng row-level

| Table | Filter by | investor | analyst | admin |
|-------|-----------|----------|---------|-------|
| `investment_accounts` | `user_id` | own | ❌ | all |
| `holdings` | `account.user_id` | own | ❌ | all |
| `transactions` | `account.user_id` | own | ❌ | all |
| `watchlists` | `user_id` | own | own | all |
| `alert_configs` | `user_id` | own | own | all |
| `alert_history` | `config.user_id` | own | own | all |
| `backtest_strategies` | `user_id` | own | own | all |
| `backtest_results` | `strategy.user_id` | own | own | all |
| `user_settings` | `user_id` | own | own | own |
| `audit_logs` | — | ❌ | ❌ | all |
| `users` | — | ❌ | ❌ | all |
| `data_sources` | — | ❌ | ❌ | all |
| `corporate_actions` | — | read all | read all | all |

### Column-level: Thông tin nhạy cảm

| Table | Column | investor | analyst | admin |
|-------|--------|----------|---------|-------|
| `users` | `password_hash` | ❌ never | ❌ never | ❌ never |
| `users` | `mfa_secret` | ❌ never | ❌ never | ❌ never |
| `users` | `email` | own only | ❌ | ✅ |
| `data_sources` | `config_json` (API keys) | ❌ | ❌ | ✅ masked |

---

## TÓM TẮT — BẢNG SO SÁNH 3 ROLE

| Khả năng | investor | analyst | admin |
|----------|----------|---------|-------|
| Quản lý danh mục cá nhân | ✅ | ❌ | ❌ |
| Nhập/sửa/xóa giao dịch | ✅ | ❌ | ❌ |
| Import file Excel | ✅ | ❌ | ❌ |
| Xem bảng giá, biểu đồ | ✅ | ✅ | ❌ |
| Phân tích kỹ thuật & cơ bản | ✅ | ✅ | ❌ |
| Backtesting, screener | ✅ | ✅ | ❌ |
| Quản lý rủi ro (VaR, stress) | ✅ | ❌ | ❌ |
| Xem báo cáo hiệu suất | ✅ | ❌ | ❌ |
| Tích hợp BI (embed) | ✅ | ✅ | ❌ |
| BI data feeds (OData) | ❌ | ✅ | ❌ |
| Cài đặt cảnh báo | ✅ | ✅ | ❌ |
| Quản lý người dùng | ❌ | ❌ | ✅ |
| Cấu hình nguồn dữ liệu | ❌ | ❌ | ✅ |
| Xem audit logs | ❌ | ❌ | ✅ |
| Cài đặt cá nhân | ✅ own | ✅ own | ✅ own |
| Xem data user khác | ❌ | ❌ | ✅ |
