// ============ AUTH ============
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'analyst' | 'investor';
  avatar?: string;
  mfaEnabled: boolean;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// ============ PORTFOLIO ============
export interface InvestmentAccount {
  id: string;
  userId: string;
  name: string;
  broker: string;
  accountNumber: string;
  currency: 'VND' | 'USD';
  type: 'trading' | 'holding' | 'paper';
  cashBalance: number;
  targetReturn?: number;
  stopLossThreshold?: number;
  maxPositionWeight?: number;
  createdAt: string;
}

export interface AccountSummary {
  accountId: string;
  nav: number;
  totalMarketValue: number;
  cashBalance: number;
  totalCost: number;
  unrealizedPnL: number;
  unrealizedPnLPct: number;
  realizedPnL: number;
  dayPnL: number;
  dayPnLPct: number;
}

export interface Holding {
  id: string;
  accountId: string;
  symbol: string;
  companyName: string;
  exchange: 'HOSE' | 'HNX' | 'UPCOM';
  quantity: number;
  avgCost: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPnL: number;
  unrealizedPnLPct: number;
  dayChange: number;
  dayChangePct: number;
  weight: number;
  sector: string;
  assetType: 'stock' | 'etf' | 'bond' | 'cw' | 'fund';
}

export interface AllocationTarget {
  category: string;
  targetWeight: number;
  currentWeight: number;
  deviation: number;
}

// ============ TRANSACTIONS ============
export interface Transaction {
  id: string;
  accountId: string;
  symbol: string;
  type: 'buy' | 'sell' | 'dividend_cash' | 'dividend_stock' | 'rights' | 'transfer';
  quantity: number;
  price: number;
  fee: number;
  tax: number;
  totalValue: number;
  tradeDate: string;
  settlementDate: string;
  note?: string;
  createdAt: string;
}

// ============ MARKET ============
export interface MarketQuote {
  symbol: string;
  companyName: string;
  exchange: 'HOSE' | 'HNX' | 'UPCOM';
  refPrice: number;
  ceilingPrice: number;
  floorPrice: number;
  currentPrice: number;
  change: number;
  changePct: number;
  volume: number;
  value: number;
  bid: [number, number][];
  ask: [number, number][];
  high: number;
  low: number;
  open: number;
  sharesOutstanding: number;
  marketCap: number;
  sector: string;
}

export interface MarketIndex {
  name: string;
  value: number;
  change: number;
  changePct: number;
  volume: number;
}

export interface OHLCVData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Watchlist {
  id: string;
  name: string;
  symbols: string[];
  createdAt: string;
}

// ============ TECHNICAL ANALYSIS ============
export interface TechnicalIndicator {
  name: string;
  type: 'overlay' | 'oscillator';
  values: { time: string; value: number }[];
  params: Record<string, number>;
}

export interface CandlePattern {
  symbol: string;
  pattern: string;
  type: 'bullish_reversal' | 'bearish_reversal' | 'continuation';
  confidence: 'high' | 'medium' | 'low';
  date: string;
  description: string;
}

export interface BacktestConfig {
  strategyName: string;
  symbol: string;
  fromDate: string;
  toDate: string;
  initialCapital: number;
  positionSize: number;
  commission: number;
  slippage: number;
  conditions: BacktestCondition[];
}

export interface BacktestCondition {
  indicator: string;
  operator: 'crosses_above' | 'crosses_below' | 'greater_than' | 'less_than';
  value: number | string;
  action: 'buy' | 'sell';
}

export interface BacktestResult {
  id: string;
  strategyName: string;
  totalReturn: number;
  annualizedReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  winRate: number;
  profitFactor: number;
  totalTrades: number;
  equityCurve: { date: string; value: number }[];
  trades: BacktestTrade[];
}

export interface BacktestTrade {
  entryDate: string;
  exitDate: string;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  pnlPct: number;
  type: 'long' | 'short';
}

// ============ FUNDAMENTAL ============
export interface CompanyProfile {
  symbol: string;
  companyName: string;
  exchange: string;
  sector: string;
  industry: string;
  description: string;
  sharesOutstanding: number;
  marketCap: number;
  freeFloat: number;
  foreignRoom: number;
  foreignOwnership: number;
}

export interface FinancialRatio {
  symbol: string;
  period: string;
  pe: number;
  pb: number;
  ps: number;
  evEbitda: number;
  dividendYield: number;
  roe: number;
  roa: number;
  grossMargin: number;
  netMargin: number;
  debtToEquity: number;
  currentRatio: number;
  epsGrowth: number;
  revenueGrowth: number;
}

export interface FinancialStatement {
  period: string;
  revenue: number;
  grossProfit: number;
  operatingIncome: number;
  netIncome: number;
  eps: number;
  totalAssets: number;
  totalEquity: number;
  totalDebt: number;
  cashFlow: number;
}

// ============ RISK ============
export interface RiskMetrics {
  accountId: string;
  var95: number;
  var99: number;
  cvar: number;
  maxDrawdown: number;
  sharpeRatio: number;
  beta: number;
  concentrationTop5: number;
  correlationMatrix?: { symbols: string[]; matrix: number[][] };
}

export interface StressScenario {
  id: string;
  name: string;
  description: string;
  changes: { symbol: string; changePct: number }[];
  impact?: number;
}

// ============ ALERTS ============
export interface AlertConfig {
  id: string;
  symbol: string;
  type: 'price' | 'pct_change' | 'volume' | 'pnl' | 'technical' | 'event';
  condition: string;
  threshold: number;
  channel: ('inapp' | 'email' | 'telegram')[];
  isActive: boolean;
  createdAt: string;
}

export interface AlertHistory {
  id: string;
  alertConfigId: string;
  title: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  triggeredAt: string;
  isRead: boolean;
}

// ============ CORPORATE ACTIONS ============
export interface CorporateAction {
  id: string;
  symbol: string;
  type: 'cash_dividend' | 'stock_dividend' | 'stock_split' | 'reverse_split' | 'rights_issue';
  exDate: string;
  recordDate: string;
  ratio?: number;
  cashAmount?: number;
  description: string;
  isApplied: boolean;
}

// ============ REPORTS ============
export interface PerformanceReport {
  accountId: string;
  period: string;
  totalReturn: number;
  annualizedReturn: number;
  benchmarkReturn: number;
  alpha: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  avgHoldingDays: number;
  totalTrades: number;
}

// ============ ADMIN ============
export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  ipAddress: string;
  createdAt: string;
  details?: string;
}

export interface DataSource {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  priority: number;
  lastSync: string;
  status: 'connected' | 'disconnected' | 'error';
}

// ============ SETTINGS ============
export interface UserSettings {
  costMethod: 'FIFO' | 'WAVG';
  currencyDisplay: 'million' | 'billion' | 'thousand';
  language: 'vi' | 'en';
  theme: 'light' | 'dark';
  defaultInterval: string;
  notificationChannels: string[];
}

// ===== Module 8.2: Risk Limits =====
export interface RiskLimit {
  id: string;
  accountId: string;
  type: 'stop_loss_portfolio' | 'stop_loss_symbol' | 'max_weight' | 'var_threshold' | 'drawdown_threshold' | 'margin_call';
  symbol?: string;
  threshold: number;
  currentValue?: number;
  isActive: boolean;
  createdAt: string;
}

// ===== Module 4.3: Corporate Action Extended =====
export interface CorporateActionEvent {
  id: string; symbol: string; type: string; exDate: string; recordDate: string;
  ratio?: number; cashAmount?: number; description: string; status: 'pending' | 'applied';
}

// ===== Module 12: Import =====
export interface ImportSession {
  id: string; fileName: string; totalRows: number; validRows: number; errorRows: number;
  status: 'preview' | 'confirmed' | 'error'; createdAt: string;
  errors?: { row: number; column: string; message: string }[];
}

// ===== Module 7.2: Balance Sheet & CashFlow =====
export interface BalanceSheet {
  period: string; symbol: string; totalAssets: number; currentAssets: number;
  longTermAssets: number; totalLiabilities: number; currentLiabilities: number;
  longTermDebt: number; totalEquity: number; retainedEarnings: number;
}

export interface CashFlow {
  period: string; symbol: string; operatingCF: number; investingCF: number;
  financingCF: number; netCF: number; beginCash: number; endCash: number;
}

// ===== Module 9.2: Report Details =====
export interface PnLByPeriod {
  period: string; realizedPnL: number; floatingPnL: number; dividend: number;
  fees: number; tax: number; netPnL: number;
}

export interface AttributionItem {
  symbol: string; companyName: string; weight: number;
  contribution: number; returnPct: number; sector: string;
}

// ===== Module 11: Alert Create Form =====
export interface AlertFormData {
  symbol: string; type: string; condition: string;
  threshold: number; channel: string[]; isActive: boolean;
}
