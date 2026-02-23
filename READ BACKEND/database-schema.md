# DATABASE SCHEMA — Investment Platform

MariaDB 11 DDL đầy đủ: CREATE TABLE, constraints, indexes, foreign keys, seed data.

---

## 1. KHỞI TẠO DATABASE

```sql
CREATE DATABASE IF NOT EXISTS investment
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE investment;
```

---

## 2. BẢNG DỮ LIỆU

### users

```sql
CREATE TABLE users (
  id            VARCHAR(36)   NOT NULL DEFAULT (UUID()),
  email         VARCHAR(255)  NOT NULL,
  password_hash VARCHAR(255)  NOT NULL,
  full_name     VARCHAR(255)  NOT NULL,
  role          ENUM('admin','analyst','investor') NOT NULL DEFAULT 'investor',
  mfa_secret    VARCHAR(64)   NULL,
  mfa_enabled   BOOLEAN       NOT NULL DEFAULT FALSE,
  is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
  last_login_at DATETIME      NULL,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uk_users_email (email),
  INDEX idx_users_role (role),
  INDEX idx_users_active (is_active)
) ENGINE=InnoDB;
```

### investment_accounts

```sql
CREATE TABLE investment_accounts (
  id             VARCHAR(36)   NOT NULL DEFAULT (UUID()),
  user_id        VARCHAR(36)   NOT NULL,
  name           VARCHAR(255)  NOT NULL,
  broker         VARCHAR(100)  NOT NULL,
  account_number VARCHAR(50)   NULL,
  currency       VARCHAR(3)    NOT NULL DEFAULT 'VND',
  type           ENUM('trading','holding','paper') NOT NULL DEFAULT 'trading',
  cash_balance   BIGINT        NOT NULL DEFAULT 0,
  created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_accounts_user (user_id),
  CONSTRAINT fk_accounts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
```

### holdings

```sql
CREATE TABLE holdings (
  id           VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  account_id   VARCHAR(36)  NOT NULL,
  symbol       VARCHAR(20)  NOT NULL,
  quantity     INT          NOT NULL DEFAULT 0,
  avg_cost     BIGINT       NOT NULL DEFAULT 0,
  last_updated DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uk_holdings_account_symbol (account_id, symbol),
  INDEX idx_holdings_symbol (symbol),
  CONSTRAINT fk_holdings_account FOREIGN KEY (account_id) REFERENCES investment_accounts(id) ON DELETE CASCADE,
  CONSTRAINT chk_holdings_qty CHECK (quantity >= 0)
) ENGINE=InnoDB;
```

### transactions

```sql
CREATE TABLE transactions (
  id              VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  account_id      VARCHAR(36)  NOT NULL,
  symbol          VARCHAR(20)  NOT NULL,
  type            ENUM('buy','sell','dividend_cash','dividend_stock','rights','split','transfer_in','transfer_out') NOT NULL,
  quantity        INT          NOT NULL,
  price           BIGINT       NOT NULL,
  fee             BIGINT       NOT NULL DEFAULT 0,
  tax             BIGINT       NOT NULL DEFAULT 0,
  total_value     BIGINT       NOT NULL,
  trade_date      DATE         NOT NULL,
  settlement_date DATE         NULL,
  note            TEXT         NULL,
  import_batch_id VARCHAR(36)  NULL,
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_txn_account (account_id),
  INDEX idx_txn_symbol (symbol),
  INDEX idx_txn_date (trade_date),
  INDEX idx_txn_account_symbol_date (account_id, symbol, trade_date),
  INDEX idx_txn_import (import_batch_id),
  CONSTRAINT fk_txn_account FOREIGN KEY (account_id) REFERENCES investment_accounts(id) ON DELETE CASCADE,
  CONSTRAINT chk_txn_qty CHECK (quantity > 0),
  CONSTRAINT chk_txn_price CHECK (price > 0)
) ENGINE=InnoDB;
```

### corporate_actions

```sql
CREATE TABLE corporate_actions (
  id           VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  symbol       VARCHAR(20)  NOT NULL,
  type         ENUM('cash_dividend','stock_dividend','stock_split','reverse_split','rights_issue','bonus','merger') NOT NULL,
  ex_date      DATE         NOT NULL,
  record_date  DATE         NULL,
  ratio        DECIMAL(10,4) NULL,
  cash_amount  BIGINT       NULL,
  description  TEXT         NULL,
  status       ENUM('pending','applied','cancelled') NOT NULL DEFAULT 'pending',
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_ca_symbol (symbol),
  INDEX idx_ca_exdate (ex_date),
  INDEX idx_ca_status (status)
) ENGINE=InnoDB;
```

### watchlists

```sql
CREATE TABLE watchlists (
  id         VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  user_id    VARCHAR(36)  NOT NULL,
  name       VARCHAR(100) NOT NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_wl_user (user_id),
  CONSTRAINT fk_wl_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE watchlist_symbols (
  watchlist_id VARCHAR(36) NOT NULL,
  symbol       VARCHAR(20) NOT NULL,
  sort_order   INT         NOT NULL DEFAULT 0,

  PRIMARY KEY (watchlist_id, symbol),
  CONSTRAINT fk_wls_watchlist FOREIGN KEY (watchlist_id) REFERENCES watchlists(id) ON DELETE CASCADE
) ENGINE=InnoDB;
```

### alert_configs

```sql
CREATE TABLE alert_configs (
  id         VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  user_id    VARCHAR(36)  NOT NULL,
  symbol     VARCHAR(20)  NULL,
  type       ENUM('price','price_change_pct','volume_spike','pnl_floating','pnl_portfolio','technical','pattern','corporate_event','vn_index') NOT NULL,
  condition  VARCHAR(20)  NOT NULL,
  threshold  DECIMAL(20,4) NOT NULL,
  severity   ENUM('high','medium','low') NOT NULL DEFAULT 'medium',
  channel    JSON         NOT NULL,
  is_active  BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_alert_user (user_id),
  INDEX idx_alert_symbol_active (symbol, is_active),
  CONSTRAINT fk_alert_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
```

### alert_history

```sql
CREATE TABLE alert_history (
  id              VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  alert_config_id VARCHAR(36)  NOT NULL,
  severity        ENUM('high','medium','low') NOT NULL,
  title           VARCHAR(255) NOT NULL,
  message         TEXT         NOT NULL,
  is_read         BOOLEAN      NOT NULL DEFAULT FALSE,
  triggered_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_alh_config (alert_config_id),
  INDEX idx_alh_read (is_read),
  INDEX idx_alh_triggered (triggered_at),
  CONSTRAINT fk_alh_config FOREIGN KEY (alert_config_id) REFERENCES alert_configs(id) ON DELETE CASCADE
) ENGINE=InnoDB;
```

### backtest_strategies

```sql
CREATE TABLE backtest_strategies (
  id              VARCHAR(36) NOT NULL DEFAULT (UUID()),
  user_id         VARCHAR(36) NOT NULL,
  name            VARCHAR(255) NOT NULL,
  conditions_json JSON        NOT NULL,
  created_at      DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_bts_user (user_id),
  CONSTRAINT fk_bts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
```

### backtest_results

```sql
CREATE TABLE backtest_results (
  id          VARCHAR(36) NOT NULL DEFAULT (UUID()),
  strategy_id VARCHAR(36) NOT NULL,
  symbol      VARCHAR(20) NOT NULL,
  from_date   DATE        NOT NULL,
  to_date     DATE        NOT NULL,
  config_json JSON        NOT NULL,
  result_json JSON        NOT NULL,
  created_at  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_btr_strategy (strategy_id),
  CONSTRAINT fk_btr_strategy FOREIGN KEY (strategy_id) REFERENCES backtest_strategies(id) ON DELETE CASCADE
) ENGINE=InnoDB;
```

### user_settings

```sql
CREATE TABLE user_settings (
  user_id                  VARCHAR(36) NOT NULL,
  cost_method              ENUM('FIFO','WAVG') NOT NULL DEFAULT 'WAVG',
  currency_display         ENUM('million','billion','thousand','full') NOT NULL DEFAULT 'million',
  language                 ENUM('vi','en') NOT NULL DEFAULT 'vi',
  theme                    ENUM('light','dark') NOT NULL DEFAULT 'light',
  default_interval         VARCHAR(5)  NOT NULL DEFAULT '1D',
  dashboard_layout_json    JSON        NULL,
  notification_channels_json JSON      NULL,
  telegram_webhook         VARCHAR(500) NULL,
  updated_at               DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (user_id),
  CONSTRAINT fk_settings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
```

### data_sources

```sql
CREATE TABLE data_sources (
  id          VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  name        VARCHAR(100) NOT NULL,
  type        ENUM('hose_feed','vndirect','ssi','cafef','yahoo','custom') NOT NULL,
  config_json JSON         NOT NULL,
  is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
  priority    INT          NOT NULL DEFAULT 0,
  last_sync   DATETIME     NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_ds_active_priority (is_active, priority)
) ENGINE=InnoDB;
```

### audit_logs

```sql
CREATE TABLE audit_logs (
  id             VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  user_id        VARCHAR(36)  NULL,
  action         VARCHAR(50)  NOT NULL,
  entity_type    VARCHAR(50)  NOT NULL,
  entity_id      VARCHAR(36)  NULL,
  old_value_json JSON         NULL,
  new_value_json JSON         NULL,
  ip_address     VARCHAR(45)  NULL,
  user_agent     VARCHAR(500) NULL,
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_audit_user (user_id),
  INDEX idx_audit_action (action),
  INDEX idx_audit_entity (entity_type, entity_id),
  INDEX idx_audit_date (created_at),
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;
```

### risk_limits

```sql
CREATE TABLE risk_limits (
  id            VARCHAR(36) NOT NULL DEFAULT (UUID()),
  account_id    VARCHAR(36) NOT NULL,
  type          ENUM('stop_loss_portfolio','stop_loss_symbol','max_weight','var_threshold','drawdown_threshold','margin_call') NOT NULL,
  symbol        VARCHAR(20) NULL,
  threshold     DECIMAL(20,4) NOT NULL,
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at    DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_rl_account (account_id),
  CONSTRAINT fk_rl_account FOREIGN KEY (account_id) REFERENCES investment_accounts(id) ON DELETE CASCADE
) ENGINE=InnoDB;
```

### stress_scenarios

```sql
CREATE TABLE stress_scenarios (
  id           VARCHAR(36) NOT NULL DEFAULT (UUID()),
  user_id      VARCHAR(36) NULL,
  name         VARCHAR(255) NOT NULL,
  description  TEXT        NULL,
  type         ENUM('preset','custom') NOT NULL DEFAULT 'preset',
  changes_json JSON        NOT NULL,
  created_at   DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_ss_user (user_id)
) ENGINE=InnoDB;
```

---

## 3. SEED DATA

```sql
-- Users (password hash for: 123456, admin123, analyst123)
INSERT INTO users (id, email, password_hash, full_name, role) VALUES
('usr_001', 'investor@investment.vn', '$2a$12$LJ3k...hashed_123456',      'Nguyễn Văn Investor', 'investor'),
('usr_002', 'admin@investment.vn',    '$2a$12$AB3k...hashed_admin123',     'Trần Thị Admin',     'admin'),
('usr_003', 'analyst@investment.vn',  '$2a$12$CD3k...hashed_analyst123',   'Lê Văn Analyst',     'analyst');

-- Accounts
INSERT INTO investment_accounts (id, user_id, name, broker, account_number, type, cash_balance) VALUES
('acc_001', 'usr_001', 'TK Chứng khoán SSI',  'SSI',  '058C123456', 'trading', 125000000),
('acc_002', 'usr_001', 'TK Đầu tư VPS',       'VPS',  '022C789012', 'holding', 280000000),
('acc_003', 'usr_001', 'TK Giả lập',          'Paper', NULL,         'paper',   500000000);

-- Holdings (acc_001)
INSERT INTO holdings (account_id, symbol, quantity, avg_cost) VALUES
('acc_001', 'VIC',      500,  42000),
('acc_001', 'HPG',      1000, 27500),
('acc_001', 'VNM',      200,  68000),
('acc_001', 'FPT',      300,  98000),
('acc_001', 'MBB',      800,  22000),
('acc_001', 'E1VFVN30', 500,  15500),
('acc_001', 'MSN',      400,  62000),
('acc_001', 'SSI',      600,  28000),
('acc_001', 'VHM',      300,  45000);

-- User settings
INSERT INTO user_settings (user_id) VALUES ('usr_001'), ('usr_002'), ('usr_003');

-- Data sources
INSERT INTO data_sources (name, type, config_json, is_active, priority) VALUES
('HOSE Direct Feed', 'hose_feed',  '{"endpoint":"wss://datafeed.hose.vn"}',   true,  1),
('VNDirect API',     'vndirect',   '{"apiKey":"xxx","baseUrl":"https://..."}', true,  2),
('SSI iBoard API',   'ssi',        '{"apiKey":"yyy","baseUrl":"https://..."}', true,  3),
('CafeF Scraper',    'cafef',      '{"baseUrl":"https://cafef.vn"}',           false, 4),
('Yahoo Finance',    'yahoo',      '{"baseUrl":"https://query1.finance.yahoo.com"}', true, 5);

-- Stress scenarios (presets)
INSERT INTO stress_scenarios (name, description, type, changes_json) VALUES
('VN-Index giảm 10%', 'Toàn thị trường giảm 10%',     'preset', '{"marketChange": -10}'),
('VN-Index giảm 20%', 'Toàn thị trường giảm 20%',     'preset', '{"marketChange": -20}'),
('VN-Index giảm 30%', 'Bear market nghiêm trọng',       'preset', '{"marketChange": -30}'),
('COVID-2020',        'VN-Index giảm 35% trong 2 tháng', 'preset', '{"marketChange": -35}');
```

---

## 4. NAMING CONVENTIONS

| Quy tắc | Ví dụ |
|---------|-------|
| Table name: `snake_case`, số nhiều | `investment_accounts`, `audit_logs` |
| Column name: `snake_case` | `user_id`, `cash_balance`, `created_at` |
| Primary key: `id` (UUID VARCHAR 36) | `id VARCHAR(36) DEFAULT (UUID())` |
| Foreign key: `{referenced_table_singular}_id` | `user_id`, `account_id` |
| FK constraint: `fk_{table}_{column}` | `fk_accounts_user` |
| Unique key: `uk_{table}_{columns}` | `uk_users_email` |
| Index: `idx_{table}_{columns}` | `idx_txn_account_symbol_date` |
| Check: `chk_{table}_{rule}` | `chk_holdings_qty` |
| Timestamp: `created_at`, `updated_at` | `DATETIME DEFAULT CURRENT_TIMESTAMP` |
| Boolean: `is_` prefix | `is_active`, `is_read` |
| JSON: `_json` suffix | `config_json`, `result_json` |
| Enum: inline ENUM type | `ENUM('buy','sell','dividend_cash')` |
