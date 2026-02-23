# MOCK DATA — Investment Platform

Mô tả toàn bộ mock data trong frontend, dùng khi `USE_MOCK = true`.
File: `src/app/core/mock-data/index.ts`

---

## TỔNG QUAN

| # | Constant | Records | Mô tả |
|---|----------|---------|-------|
| 1 | MOCK_USERS | 3 | investor, admin, analyst |
| 2 | MOCK_CREDENTIALS | 3 | Email + password |
| 3 | MOCK_ACCOUNTS | 3 | TK SSI, VPS, Paper |
| 4 | MOCK_ACCOUNT_SUMMARIES | 3 | NAV, P&L mỗi TK |
| 5 | MOCK_HOLDINGS | 9 | 9 mã CK trong acc_001 |
| 6 | MOCK_QUOTES | 12 | Giá 12 mã real-time |
| 7 | MOCK_INDICES | 3 | VN-Index, VN30, HNX |
| 8 | MOCK_TRANSACTIONS | 20 | Lịch sử giao dịch |
| 9 | MOCK_WATCHLISTS | 3 | 3 watchlist |
| 10 | MOCK_COMPANY_PROFILES | 3 | VIC, FPT, HPG |
| 11 | MOCK_FINANCIAL_RATIOS | 3 | P/E, ROE, P/B |
| 12 | MOCK_FINANCIALS | 4 | KQKD 4 quý VIC |
| 13 | MOCK_BALANCE_SHEETS | 4 | BCĐKT 4 quý VIC |
| 14 | MOCK_CASH_FLOWS | 4 | LCTT 4 quý VIC |
| 15 | MOCK_RISK_METRICS | 1 | VaR, Sharpe, Beta |
| 16 | MOCK_RISK_LIMITS | 5 | 5 giới hạn rủi ro |
| 17 | MOCK_ALERT_CONFIGS | 4 | 4 cảnh báo đã cài |
| 18 | MOCK_ALERT_HISTORY | 6 | 6 cảnh báo trigger |
| 19 | MOCK_CORPORATE_ACTIONS | 3 | 3 sự kiện |
| 20 | MOCK_CORPORATE_ACTIONS_EXTENDED | 5 | 5 sự kiện chi tiết |
| 21 | MOCK_ALLOCATION_TARGETS | 6 | Mục tiêu 6 ngành |
| 22 | MOCK_PATTERNS | 4 | 4 candlestick patterns |
| 23 | MOCK_BACKTEST_RESULTS | 1 | EMA crossover VIC |
| 24 | MOCK_PERFORMANCE | 1 | Báo cáo hiệu suất |
| 25 | MOCK_STRESS_SCENARIOS | 6 | 6 kịch bản |
| 26 | MOCK_PNL_BY_PERIOD | 6 | P&L 6 tháng |
| 27 | MOCK_ATTRIBUTION | 9 | Đóng góp 9 mã |
| 28 | MOCK_OFFICERS | 3 | 3 lãnh đạo VIC |
| 29 | MOCK_TRADE_HISTORY | 20 | 20 lệnh khớp |
| 30 | MOCK_ADMIN_USERS | 5 | Trang admin |
| 31 | MOCK_AUDIT_LOGS | 8 | Nhật ký |
| 32 | MOCK_DATA_SOURCES | 5 | 5 nguồn dữ liệu |
| 33 | MOCK_USER_SETTINGS | 1 | Cài đặt mặc định |
| — | generateOHLCV() | fn | Sinh OHLCV N ngày |

---

## TÀI KHOẢN DEMO

| Email | Password | Role | Sidebar |
|-------|----------|------|---------|
| investor@investment.vn | 123456 | investor | Đầy đủ trừ Admin |
| admin@investment.vn | admin123 | admin | Dashboard + Admin |
| analyst@investment.vn | analyst123 | analyst | Thị trường + Phân tích + BI |

## DANH MỤC HOLDINGS (acc_001)

| Symbol | Tên | SL | Giá vốn | Giá hiện tại |
|--------|-----|----|---------|-------------|
| VIC | Vingroup | 500 | 42,000 | 45,200 |
| HPG | Hòa Phát | 1,000 | 27,500 | 28,900 |
| VNM | Vinamilk | 200 | 68,000 | 65,500 |
| FPT | FPT Corp | 300 | 98,000 | 112,000 |
| MBB | MB Bank | 800 | 22,000 | 23,500 |
| E1VFVN30 | ETF VN30 | 500 | 15,500 | 16,200 |
| MSN | Masan | 400 | 62,000 | 58,000 |
| SSI | SSI Securities | 600 | 28,000 | 31,200 |
| VHM | Vinhomes | 300 | 45,000 | 47,800 |

## BẢNG GIÁ (12 mã)

VIC, HPG, VNM, FPT, MBB, E1VFVN30, MSN, SSI, VHM, TCB, VCB, ACB — đầy đủ trần/sàn/TC, 3 bước giá mua/bán, KL, giá trị, vốn hóa.

## generateOHLCV(symbol, days)

Sinh mảng `{timestamp, open, high, low, close, volume}`. Base price lấy từ MOCK_QUOTES, random walk ±2%/ngày, volume ±50%.

## GHI CHÚ

- Giá trị tiền: VND nguyên (không chia 1000)
- Khớp 1:1 với `models/index.ts` interfaces
- `USE_MOCK = false` → chuyển sang backend thật
- WebSocket simulation: random ±0.5% giá mỗi 3 giây
