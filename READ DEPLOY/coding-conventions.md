# CODING CONVENTIONS — Investment Platform

Quy tắc code Go · Angular · Git cho toàn bộ team.

---

## 1. GO BACKEND

### 1.1 Project Layout

```
services/{service-name}/
├── main.go                    Entrypoint: wire dependencies, start server
└── internal/
    ├── handler/               HTTP handlers (Gin context → service call → response)
    ├── service/               Business logic (pure Go, no framework dependency)
    ├── repository/            Database access (SQL queries, GORM)
    ├── model/                 Structs matching DB tables
    ├── grpc/                  gRPC server implementation
    └── engine/                Heavy computation (indicator, backtest, risk)
```

### 1.2 Naming

| Loại | Quy tắc | Ví dụ |
|------|---------|-------|
| Package | lowercase, 1 từ | `handler`, `service`, `model` |
| File | snake_case | `account_service.go`, `var_calculator.go` |
| Exported struct | PascalCase | `InvestmentAccount`, `RiskMetrics` |
| Unexported | camelCase | `calcWeightedAvg`, `validateQty` |
| Interface | -er suffix hoặc mô tả | `AccountRepository`, `PriceProvider` |
| Constant | PascalCase hoặc ALL_CAPS cho env | `MaxPageSize`, `DB_DSN` |
| JSON tag | camelCase | `json:"accountId"` |
| DB column | snake_case | `db:"account_id"` |

### 1.3 Error Handling

```go
// ✅ ĐÚNG: Wrap error với context
if err != nil {
    return fmt.Errorf("portfolio-service: get holdings for account %s: %w", accountId, err)
}

// ❌ SAI: Trả error trần
if err != nil {
    return err
}

// ✅ ĐÚNG: Custom error types cho business logic
type AppError struct {
    Code    string `json:"code"`
    Message string `json:"message"`
    Status  int    `json:"-"`
}

func ErrInvalidQuantity(qty int) *AppError {
    return &AppError{
        Code:    "INVALID_QUANTITY",
        Message: fmt.Sprintf("Số lượng %d không phải bội số của 100", qty),
        Status:  400,
    }
}
```

### 1.4 Handler Pattern

```go
// ✅ Mỗi handler: parse input → validate → call service → format response
func (h *TransactionHandler) Create(c *gin.Context) {
    // 1. Parse
    var req CreateTransactionRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        response.Error(c, 400, "VALIDATION_ERROR", err.Error())
        return
    }

    // 2. Get user from JWT (set by middleware)
    userId := c.GetString("X-User-ID")

    // 3. Call service
    txn, err := h.service.CreateTransaction(c.Request.Context(), userId, req)
    if err != nil {
        response.HandleError(c, err)  // AppError → proper status code
        return
    }

    // 4. Response
    response.Success(c, 201, txn)
}
```

### 1.5 Repository Pattern

```go
// Interface
type AccountRepository interface {
    FindByUser(ctx context.Context, userId string) ([]model.Account, error)
    FindById(ctx context.Context, id string) (*model.Account, error)
    Create(ctx context.Context, account *model.Account) error
    Update(ctx context.Context, account *model.Account) error
    Delete(ctx context.Context, id string) error
}

// ✅ LUÔN truyền context cho DB query (timeout, cancellation)
// ✅ LUÔN filter theo user_id cho row-level security
```

### 1.6 Model Struct Tags

```go
type Transaction struct {
    ID             string    `json:"id"             db:"id"`
    AccountID      string    `json:"accountId"      db:"account_id"`
    Symbol         string    `json:"symbol"         db:"symbol"`
    Type           string    `json:"type"           db:"type"`
    Quantity       int       `json:"quantity"       db:"quantity"`
    Price          int64     `json:"price"          db:"price"`
    Fee            int64     `json:"fee"            db:"fee"`
    Tax            int64     `json:"tax"            db:"tax"`
    TotalValue     int64     `json:"totalValue"     db:"total_value"`
    TradeDate      string    `json:"tradeDate"      db:"trade_date"`
    SettlementDate string    `json:"settlementDate" db:"settlement_date"`
    Note           string    `json:"note"           db:"note"`
    CreatedAt      time.Time `json:"createdAt"      db:"created_at"`
}
```

---

## 2. ANGULAR FRONTEND

### 2.1 File Structure

```
Mỗi component = 1 file .ts duy nhất (standalone component, inline template + styles)
Không tách riêng .html, .css, .spec.ts
```

### 2.2 Naming

| Loại | Quy tắc | Ví dụ |
|------|---------|-------|
| Component file | kebab-case + `.component.ts` | `market-board.component.ts` |
| Component class | PascalCase + `Component` | `MarketBoardComponent` |
| Service file | kebab-case + `.service.ts` | `portfolio.service.ts` |
| Service class | PascalCase + `Service` | `PortfolioService` |
| Pipe file | kebab-case + `.pipe.ts` | `vnd.pipe.ts` |
| Guard file | kebab-case + `.guard.ts` | `auth.guard.ts` |
| Interface | PascalCase, no prefix | `MarketQuote`, `Holding` (không dùng `IMarketQuote`) |
| Route path | kebab-case | `/portfolio/holdings`, `/risk/stress-test` |

### 2.3 Component Pattern

```typescript
// ✅ Standalone component + inline template
@Component({
  selector: 'app-holdings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid">
      <!-- template here -->
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class HoldingsComponent implements OnInit {
  // 1. Injections
  private portfolioService = inject(PortfolioService);

  // 2. Signals / State
  holdings = signal<Holding[]>([]);
  loading = signal(false);

  // 3. Computed
  totalValue = computed(() =>
    this.holdings().reduce((sum, h) => sum + h.marketValue, 0)
  );

  // 4. Lifecycle
  ngOnInit() { this.loadData(); }

  // 5. Methods
  private loadData() { ... }
}
```

### 2.4 State Management

```typescript
// ✅ Dùng Angular Signals cho component state
holdings = signal<Holding[]>([]);
loading = signal(false);
error = signal<string | null>(null);

// ✅ Dùng computed() cho derived state
totalNAV = computed(() => ...);

// ✅ Dùng effect() cho side effects
constructor() {
  effect(() => {
    const q = this.searchQuery();
    if (q) this.search(q);
  });
}

// ❌ KHÔNG dùng BehaviorSubject cho simple component state
// ❌ KHÔNG dùng NgRx Store cho project này (quá nặng)
// ✅ NgRx Signal Store chỉ dùng cho shared state nếu cần
```

### 2.5 Service Pattern

```typescript
// ✅ Service chỉ chứa API calls + shared state
@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private api = inject(ApiService);

  // Shared state (accessible across components)
  accounts = signal<InvestmentAccount[]>([]);
  selectedAccount = signal<string>('acc_001');

  loadAccounts() {
    // Mock mode: đọc từ MOCK_ACCOUNTS
    // Real mode: this.api.get('/accounts')
  }
}
```

### 2.6 Template Rules

```
✅ Dùng @if/@for (Angular 17 control flow)     @if (loading()) { ... }
❌ Không dùng *ngIf/*ngFor (cũ)                *ngIf="loading"

✅ Track trong @for                             @for (item of items(); track item.id)
❌ Thiếu track                                  @for (item of items())

✅ Bootstrap classes cho layout                  class="row g-3"
❌ Custom CSS cho grid                           display: grid; grid-template-columns: ...

✅ Bootstrap Icons                               <i class="bi bi-graph-up"></i>
❌ Font Awesome / Material Icons
```

---

## 3. GIT

### 3.1 Branch Strategy

```
main                 Production-ready, protected
├── develop          Integration branch
│   ├── feature/portfolio-rebalance     Feature branches
│   ├── feature/alert-telegram
│   ├── fix/nav-calculation-bug
│   └── refactor/market-service
└── release/v1.0.0   Release candidates
```

### 3.2 Commit Message

```
Format: <type>(<scope>): <subject>

type:     feat | fix | refactor | docs | style | test | chore | perf
scope:    portfolio | market | auth | risk | alert | config | fe | be | infra
subject:  lowercase, imperative, ≤72 chars

Ví dụ:
feat(portfolio): add FIFO cost calculation method
fix(market): correct ceiling/floor price color logic
refactor(be): extract risk engine into separate package
docs(api): update transaction endpoint response format
chore(infra): upgrade MariaDB to 11.4
perf(analytics): cache correlation matrix for 5 minutes
```

### 3.3 PR Checklist

```
□ Code compiles without errors (ng build / go build)
□ Follows naming conventions above
□ No console.log() or fmt.Println() left in code
□ API endpoint documented in api-contracts.md
□ Mock data updated if new interface added
□ Error handling follows AppError pattern (backend)
□ Row-level security: query filters by userId (backend)
□ Component uses signals, not BehaviorSubject (frontend)
□ Bootstrap classes only, no custom grid CSS (frontend)
```

---

## 4. API CONVENTIONS

```
URL:        /api/v1/{resource}              kebab-case, plural nouns
Method:     GET (read), POST (create), PUT (update), DELETE (delete)
Body:       camelCase JSON                  {"accountId": "acc_001"}
Response:   Envelope {success, data, error, pagination}
Dates:      ISO 8601                        "2026-02-23T10:00:00Z"
Money:      int64 VND                       45200 (không 45.200 hoặc 45200.00)
Pagination: ?page=1&pageSize=20&sort=createdAt&order=desc
```
