import {
  User, InvestmentAccount, AccountSummary, Holding, Transaction, MarketQuote,
  MarketIndex, Watchlist, OHLCVData, CompanyProfile, FinancialRatio, FinancialStatement,
  RiskMetrics, AlertConfig, AlertHistory, CorporateAction, BacktestResult,
  PerformanceReport, AdminUser, AuditLog, DataSource, UserSettings, CandlePattern, StressScenario, AllocationTarget
} from '../models';

// ============ USERS ============
export const MOCK_USERS: User[] = [
  { id: '1', email: 'investor@investment.vn', fullName: 'Nguyễn Văn An', role: 'investor', mfaEnabled: false, createdAt: '2024-01-15' },
  { id: '2', email: 'admin@investment.vn', fullName: 'Trần Thị Bình', role: 'admin', mfaEnabled: true, createdAt: '2023-12-01' },
  { id: '3', email: 'analyst@investment.vn', fullName: 'Lê Minh Cường', role: 'analyst', mfaEnabled: false, createdAt: '2024-03-10' },
];

export const MOCK_CREDENTIALS = [
  { email: 'investor@investment.vn', password: '123456', userId: '1' },
  { email: 'admin@investment.vn', password: 'admin123', userId: '2' },
  { email: 'analyst@investment.vn', password: 'analyst123', userId: '3' },
];

// ============ ACCOUNTS ============
export const MOCK_ACCOUNTS: InvestmentAccount[] = [
  { id: 'acc1', userId: '1', name: 'Tài khoản SSI - Dài hạn', broker: 'SSI', accountNumber: '058C123456', currency: 'VND', type: 'holding', cashBalance: 285000000, targetReturn: 15, stopLossThreshold: 10, maxPositionWeight: 30, createdAt: '2024-01-20' },
  { id: 'acc2', userId: '1', name: 'Tài khoản VPS - Trading', broker: 'VPS', accountNumber: '068C789012', currency: 'VND', type: 'trading', cashBalance: 120000000, targetReturn: 25, stopLossThreshold: 7, maxPositionWeight: 20, createdAt: '2024-02-15' },
  { id: 'acc3', userId: '1', name: 'Paper Trading', broker: 'Virtual', accountNumber: 'PAPER001', currency: 'VND', type: 'paper', cashBalance: 500000000, createdAt: '2024-06-01' },
];

export const MOCK_ACCOUNT_SUMMARIES: AccountSummary[] = [
  { accountId: 'acc1', nav: 1284000000, totalMarketValue: 999000000, cashBalance: 285000000, totalCost: 920000000, unrealizedPnL: 79000000, unrealizedPnLPct: 8.59, realizedPnL: 45000000, dayPnL: 12400000, dayPnLPct: 1.02 },
  { accountId: 'acc2', nav: 456000000, totalMarketValue: 336000000, cashBalance: 120000000, totalCost: 310000000, unrealizedPnL: 26000000, unrealizedPnLPct: 8.39, realizedPnL: 18000000, dayPnL: -3200000, dayPnLPct: -0.72 },
  { accountId: 'acc3', nav: 520000000, totalMarketValue: 20000000, cashBalance: 500000000, totalCost: 18500000, unrealizedPnL: 1500000, unrealizedPnLPct: 8.11, realizedPnL: 0, dayPnL: 200000, dayPnLPct: 0.04 },
];

// ============ HOLDINGS ============
export const MOCK_HOLDINGS: Holding[] = [
  { id: 'h1', accountId: 'acc1', symbol: 'VIC', companyName: 'Vingroup', exchange: 'HOSE', quantity: 5000, avgCost: 42500, currentPrice: 45700, marketValue: 228500000, unrealizedPnL: 16000000, unrealizedPnLPct: 7.53, dayChange: 700, dayChangePct: 1.56, weight: 17.8, sector: 'Bất động sản', assetType: 'stock' },
  { id: 'h2', accountId: 'acc1', symbol: 'HPG', companyName: 'Hòa Phát', exchange: 'HOSE', quantity: 10000, avgCost: 25800, currentPrice: 27200, marketValue: 272000000, unrealizedPnL: 14000000, unrealizedPnLPct: 5.43, dayChange: -300, dayChangePct: -1.09, weight: 21.2, sector: 'Vật liệu', assetType: 'stock' },
  { id: 'h3', accountId: 'acc1', symbol: 'VNM', companyName: 'Vinamilk', exchange: 'HOSE', quantity: 3000, avgCost: 69500, currentPrice: 72900, marketValue: 218700000, unrealizedPnL: 10200000, unrealizedPnLPct: 4.89, dayChange: 900, dayChangePct: 1.25, weight: 17.0, sector: 'Tiêu dùng', assetType: 'stock' },
  { id: 'h4', accountId: 'acc1', symbol: 'FPT', companyName: 'FPT Corp', exchange: 'HOSE', quantity: 2000, avgCost: 118000, currentPrice: 128500, marketValue: 257000000, unrealizedPnL: 21000000, unrealizedPnLPct: 8.90, dayChange: 1500, dayChangePct: 1.18, weight: 20.0, sector: 'Công nghệ', assetType: 'stock' },
  { id: 'h5', accountId: 'acc1', symbol: 'MBB', companyName: 'MB Bank', exchange: 'HOSE', quantity: 8000, avgCost: 24200, currentPrice: 25600, marketValue: 204800000, unrealizedPnL: 11200000, unrealizedPnLPct: 5.79, dayChange: 200, dayChangePct: 0.79, weight: 15.9, sector: 'Ngân hàng', assetType: 'stock' },
  { id: 'h6', accountId: 'acc1', symbol: 'E1VFVN30', companyName: 'ETF VN30', exchange: 'HOSE', quantity: 5000, avgCost: 18200, currentPrice: 19000, marketValue: 95000000, unrealizedPnL: 4000000, unrealizedPnLPct: 4.40, dayChange: 100, dayChangePct: 0.53, weight: 7.4, sector: 'ETF', assetType: 'etf' },
  // Account 2
  { id: 'h7', accountId: 'acc2', symbol: 'MSN', companyName: 'Masan Group', exchange: 'HOSE', quantity: 2000, avgCost: 74000, currentPrice: 79000, marketValue: 158000000, unrealizedPnL: 10000000, unrealizedPnLPct: 6.76, dayChange: 3000, dayChangePct: 3.95, weight: 34.6, sector: 'Tiêu dùng', assetType: 'stock' },
  { id: 'h8', accountId: 'acc2', symbol: 'SSI', companyName: 'SSI Securities', exchange: 'HOSE', quantity: 5000, avgCost: 35200, currentPrice: 33500, marketValue: 167500000, unrealizedPnL: -8500000, unrealizedPnLPct: -4.83, dayChange: -1000, dayChangePct: -2.90, weight: 36.7, sector: 'Tài chính', assetType: 'stock' },
  { id: 'h9', accountId: 'acc2', symbol: 'VHM', companyName: 'Vinhomes', exchange: 'HOSE', quantity: 500, avgCost: 41500, currentPrice: 43800, marketValue: 21900000, unrealizedPnL: 1150000, unrealizedPnLPct: 5.54, dayChange: 800, dayChangePct: 1.86, weight: 4.8, sector: 'Bất động sản', assetType: 'stock' },
];

// ============ MARKET QUOTES ============
export const MOCK_QUOTES: MarketQuote[] = [
  { symbol: 'VIC', companyName: 'CTCP Tập đoàn Vingroup', exchange: 'HOSE', refPrice: 45000, ceilingPrice: 48150, floorPrice: 41850, currentPrice: 45700, change: 700, changePct: 1.56, volume: 1250000, value: 57125000000, bid: [[45600, 20000], [45500, 35000], [45400, 50000]], ask: [[45700, 15000], [45800, 25000], [45900, 40000]], high: 45900, low: 44800, open: 45100, sharesOutstanding: 3890000000, marketCap: 177823000000000, sector: 'Bất động sản' },
  { symbol: 'HPG', companyName: 'CTCP Tập đoàn Hòa Phát', exchange: 'HOSE', refPrice: 27500, ceilingPrice: 29425, floorPrice: 25575, currentPrice: 27200, change: -300, changePct: -1.09, volume: 3400000, value: 92480000000, bid: [[27100, 50000], [27000, 80000], [26900, 100000]], ask: [[27200, 30000], [27300, 45000], [27400, 60000]], high: 27600, low: 27000, open: 27500, sharesOutstanding: 5827000000, marketCap: 158494400000000, sector: 'Vật liệu' },
  { symbol: 'VNM', companyName: 'CTCP Sữa Việt Nam', exchange: 'HOSE', refPrice: 72000, ceilingPrice: 77040, floorPrice: 66960, currentPrice: 72900, change: 900, changePct: 1.25, volume: 890000, value: 64881000000, bid: [[72800, 12000], [72700, 18000], [72600, 25000]], ask: [[72900, 5000], [73000, 15000], [73100, 20000]], high: 73200, low: 71800, open: 72100, sharesOutstanding: 2089000000, marketCap: 152288100000000, sector: 'Tiêu dùng' },
  { symbol: 'FPT', companyName: 'CTCP FPT', exchange: 'HOSE', refPrice: 127000, ceilingPrice: 135890, floorPrice: 118110, currentPrice: 128500, change: 1500, changePct: 1.18, volume: 650000, value: 83525000000, bid: [[128400, 8000], [128300, 12000], [128200, 18000]], ask: [[128500, 6000], [128600, 10000], [128700, 14000]], high: 129000, low: 126500, open: 127200, sharesOutstanding: 1172000000, marketCap: 150602000000000, sector: 'Công nghệ' },
  { symbol: 'MBB', companyName: 'Ngân hàng TMCP Quân đội', exchange: 'HOSE', refPrice: 25400, ceilingPrice: 27178, floorPrice: 23622, currentPrice: 25600, change: 200, changePct: 0.79, volume: 2100000, value: 53760000000, bid: [[25500, 30000], [25400, 45000], [25300, 60000]], ask: [[25600, 20000], [25700, 35000], [25800, 50000]], high: 25800, low: 25200, open: 25400, sharesOutstanding: 5259000000, marketCap: 134630400000000, sector: 'Ngân hàng' },
  { symbol: 'MSN', companyName: 'CTCP Tập đoàn Masan', exchange: 'HOSE', refPrice: 76000, ceilingPrice: 81320, floorPrice: 70680, currentPrice: 79000, change: 3000, changePct: 3.95, volume: 2100000, value: 165900000000, bid: [[78900, 20000], [78800, 30000], [78700, 40000]], ask: [[79000, 10000], [79100, 15000], [79200, 25000]], high: 79200, low: 75800, open: 76200, sharesOutstanding: 1180000000, marketCap: 93220000000000, sector: 'Tiêu dùng' },
  { symbol: 'SSI', companyName: 'CTCP Chứng khoán SSI', exchange: 'HOSE', refPrice: 34500, ceilingPrice: 36915, floorPrice: 32085, currentPrice: 33500, change: -1000, changePct: -2.90, volume: 4000000, value: 134000000000, bid: [[33400, 100000], [33300, 120000], [33200, 150000]], ask: [[33500, 70000], [33600, 90000], [33700, 110000]], high: 34600, low: 33300, open: 34500, sharesOutstanding: 1556000000, marketCap: 52126000000000, sector: 'Tài chính' },
  { symbol: 'VHM', companyName: 'CTCP Vinhomes', exchange: 'HOSE', refPrice: 43000, ceilingPrice: 46010, floorPrice: 39990, currentPrice: 43800, change: 800, changePct: 1.86, volume: 1800000, value: 78840000000, bid: [[43700, 15000], [43600, 25000], [43500, 35000]], ask: [[43800, 10000], [43900, 20000], [44000, 30000]], high: 44100, low: 42800, open: 43100, sharesOutstanding: 3440000000, marketCap: 150672000000000, sector: 'Bất động sản' },
  { symbol: 'VCB', companyName: 'Ngân hàng Ngoại Thương VN', exchange: 'HOSE', refPrice: 88000, ceilingPrice: 94160, floorPrice: 81840, currentPrice: 88500, change: 500, changePct: 0.57, volume: 550000, value: 48675000000, bid: [[88400, 5000], [88300, 8000], [88200, 12000]], ask: [[88500, 4000], [88600, 7000], [88700, 10000]], high: 89000, low: 87500, open: 88000, sharesOutstanding: 5373000000, marketCap: 475508500000000, sector: 'Ngân hàng' },
  { symbol: 'TCB', companyName: 'Ngân hàng TMCP Techcombank', exchange: 'HOSE', refPrice: 52000, ceilingPrice: 55640, floorPrice: 48360, currentPrice: 52800, change: 800, changePct: 1.54, volume: 1500000, value: 79200000000, bid: [[52700, 20000], [52600, 30000], [52500, 40000]], ask: [[52800, 15000], [52900, 25000], [53000, 35000]], high: 53100, low: 51700, open: 52100, sharesOutstanding: 3525000000, marketCap: 186120000000000, sector: 'Ngân hàng' },
  { symbol: 'ACB', companyName: 'Ngân hàng TMCP Á Châu', exchange: 'HOSE', refPrice: 25000, ceilingPrice: 26750, floorPrice: 23250, currentPrice: 25200, change: 200, changePct: 0.80, volume: 3200000, value: 80640000000, bid: [[25100, 40000], [25000, 60000], [24900, 80000]], ask: [[25200, 30000], [25300, 45000], [25400, 55000]], high: 25500, low: 24800, open: 25000, sharesOutstanding: 3947000000, marketCap: 99464400000000, sector: 'Ngân hàng' },
  { symbol: 'GVR', companyName: 'Tập đoàn CN Cao su VN', exchange: 'HOSE', refPrice: 18500, ceilingPrice: 19795, floorPrice: 17205, currentPrice: 18200, change: -300, changePct: -1.62, volume: 1800000, value: 32760000000, bid: [[18100, 50000], [18000, 70000], [17900, 90000]], ask: [[18200, 40000], [18300, 55000], [18400, 65000]], high: 18600, low: 18100, open: 18500, sharesOutstanding: 4000000000, marketCap: 72800000000000, sector: 'Nông nghiệp' },
];

// ============ MARKET INDICES ============
export const MOCK_INDICES: MarketIndex[] = [
  { name: 'VN-INDEX', value: 1285.4, change: 5.2, changePct: 0.41, volume: 856000000 },
  { name: 'VN30', value: 1342.8, change: 7.8, changePct: 0.58, volume: 425000000 },
  { name: 'HNX-INDEX', value: 245.2, change: -0.3, changePct: -0.12, volume: 124000000 },
  { name: 'UPCOM', value: 98.6, change: 0.2, changePct: 0.20, volume: 45000000 },
];

// ============ TRANSACTIONS ============
export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', accountId: 'acc1', symbol: 'VIC', type: 'buy', quantity: 3000, price: 41500, fee: 186750, tax: 0, totalValue: 124686750, tradeDate: '2024-08-15', settlementDate: '2024-08-19', note: 'Mua tích lũy dài hạn', createdAt: '2024-08-15' },
  { id: 't2', accountId: 'acc1', symbol: 'VIC', type: 'buy', quantity: 2000, price: 44000, fee: 132000, tax: 0, totalValue: 88132000, tradeDate: '2024-10-20', settlementDate: '2024-10-22', note: 'DCA tăng vị thế', createdAt: '2024-10-20' },
  { id: 't3', accountId: 'acc1', symbol: 'HPG', type: 'buy', quantity: 10000, price: 25800, fee: 387000, tax: 0, totalValue: 258387000, tradeDate: '2024-07-10', settlementDate: '2024-07-12', note: 'Mua khi RSI < 30', createdAt: '2024-07-10' },
  { id: 't4', accountId: 'acc1', symbol: 'VNM', type: 'buy', quantity: 3000, price: 69500, fee: 312750, tax: 0, totalValue: 208812750, tradeDate: '2024-09-05', settlementDate: '2024-09-09', note: 'Cổ phiếu phòng thủ', createdAt: '2024-09-05' },
  { id: 't5', accountId: 'acc1', symbol: 'FPT', type: 'buy', quantity: 2000, price: 118000, fee: 354000, tax: 0, totalValue: 236354000, tradeDate: '2024-06-20', settlementDate: '2024-06-24', note: 'Long term tech play', createdAt: '2024-06-20' },
  { id: 't6', accountId: 'acc1', symbol: 'MBB', type: 'buy', quantity: 8000, price: 24200, fee: 290400, tax: 0, totalValue: 193890400, tradeDate: '2024-05-15', settlementDate: '2024-05-17', note: 'Ngân hàng giá tốt', createdAt: '2024-05-15' },
  { id: 't7', accountId: 'acc2', symbol: 'MSN', type: 'buy', quantity: 2000, price: 74000, fee: 222000, tax: 0, totalValue: 148222000, tradeDate: '2025-01-10', settlementDate: '2025-01-14', note: 'Short-term swing', createdAt: '2025-01-10' },
  { id: 't8', accountId: 'acc2', symbol: 'SSI', type: 'buy', quantity: 5000, price: 35200, fee: 264000, tax: 0, totalValue: 176264000, tradeDate: '2025-01-15', settlementDate: '2025-01-17', note: 'Trading momentum', createdAt: '2025-01-15' },
  { id: 't9', accountId: 'acc1', symbol: 'VNM', type: 'dividend_cash', quantity: 3000, price: 2000, fee: 0, tax: 300000, totalValue: 5700000, tradeDate: '2025-01-25', settlementDate: '2025-01-25', note: 'Cổ tức tiền mặt Q4/2024', createdAt: '2025-01-25' },
  { id: 't10', accountId: 'acc1', symbol: 'E1VFVN30', type: 'buy', quantity: 5000, price: 18200, fee: 136500, tax: 0, totalValue: 91136500, tradeDate: '2024-11-01', settlementDate: '2024-11-05', note: 'ETF đa dạng hóa', createdAt: '2024-11-01' },
];

// ============ WATCHLISTS ============
export const MOCK_WATCHLISTS: Watchlist[] = [
  { id: 'w1', name: 'Blue Chips', symbols: ['VIC', 'VNM', 'FPT', 'VCB', 'HPG', 'MBB'], createdAt: '2024-03-01' },
  { id: 'w2', name: 'Ngân hàng', symbols: ['VCB', 'TCB', 'MBB', 'ACB'], createdAt: '2024-04-15' },
  { id: 'w3', name: 'Theo dõi mua', symbols: ['MSN', 'VHM', 'GVR'], createdAt: '2024-06-01' },
];

// ============ OHLCV DATA (VIC 30 days) ============
export function generateOHLCV(symbol: string, days: number = 60): OHLCVData[] {
  const data: OHLCVData[] = [];
  let basePrice = symbol === 'VIC' ? 42000 : symbol === 'HPG' ? 25000 : symbol === 'VNM' ? 68000 : symbol === 'FPT' ? 115000 : 25000;
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    const change = (Math.random() - 0.48) * basePrice * 0.03;
    const open = basePrice + change * 0.3;
    const close = basePrice + change;
    const high = Math.max(open, close) + Math.random() * basePrice * 0.01;
    const low = Math.min(open, close) - Math.random() * basePrice * 0.01;
    const volume = Math.floor(500000 + Math.random() * 3000000);
    data.push({ time: d.toISOString().split('T')[0], open: Math.round(open), high: Math.round(high), low: Math.round(low), close: Math.round(close), volume });
    basePrice = close;
  }
  return data;
}

// ============ COMPANY PROFILES ============
export const MOCK_COMPANY_PROFILES: CompanyProfile[] = [
  { symbol: 'VIC', companyName: 'CTCP Tập đoàn Vingroup', exchange: 'HOSE', sector: 'Bất động sản', industry: 'Phát triển BĐS', description: 'Vingroup là tập đoàn tư nhân lớn nhất Việt Nam, hoạt động đa ngành: bất động sản, công nghệ, ô tô, y tế, giáo dục.', sharesOutstanding: 3890000000, marketCap: 177823000000000, freeFloat: 35, foreignRoom: 49, foreignOwnership: 22.5 },
  { symbol: 'HPG', companyName: 'CTCP Tập đoàn Hòa Phát', exchange: 'HOSE', sector: 'Vật liệu', industry: 'Thép', description: 'Hòa Phát là nhà sản xuất thép lớn nhất Việt Nam và Đông Nam Á.', sharesOutstanding: 5827000000, marketCap: 158494400000000, freeFloat: 40, foreignRoom: 49, foreignOwnership: 18.3 },
  { symbol: 'FPT', companyName: 'CTCP FPT', exchange: 'HOSE', sector: 'Công nghệ', industry: 'CNTT & Viễn thông', description: 'FPT là tập đoàn công nghệ hàng đầu Việt Nam, cung cấp dịch vụ outsourcing, viễn thông, giáo dục.', sharesOutstanding: 1172000000, marketCap: 150602000000000, freeFloat: 55, foreignRoom: 49, foreignOwnership: 47.2 },
];

// ============ FINANCIAL RATIOS ============
export const MOCK_FINANCIAL_RATIOS: FinancialRatio[] = [
  { symbol: 'VIC', period: '2024', pe: 16.2, pb: 2.5, ps: 4.8, evEbitda: 18.5, dividendYield: 0.8, roe: 18.0, roa: 4.2, grossMargin: 38.5, netMargin: 12.3, debtToEquity: 1.8, currentRatio: 1.2, epsGrowth: 15.2, revenueGrowth: 12.8 },
  { symbol: 'HPG', period: '2024', pe: 12.8, pb: 1.6, ps: 1.2, evEbitda: 8.5, dividendYield: 2.5, roe: 14.2, roa: 6.8, grossMargin: 18.5, netMargin: 8.5, debtToEquity: 0.6, currentRatio: 1.8, epsGrowth: 45.0, revenueGrowth: 22.5 },
  { symbol: 'FPT', period: '2024', pe: 22.5, pb: 5.2, ps: 3.8, evEbitda: 15.2, dividendYield: 1.5, roe: 25.8, roa: 10.5, grossMargin: 42.0, netMargin: 14.8, debtToEquity: 0.4, currentRatio: 2.1, epsGrowth: 20.5, revenueGrowth: 18.0 },
];

// ============ FINANCIAL STATEMENTS ============
export const MOCK_FINANCIALS: FinancialStatement[] = [
  { period: 'Q4/2024', revenue: 42500000000000, grossProfit: 16362000000000, operatingIncome: 8925000000000, netIncome: 5227000000000, eps: 1343, totalAssets: 485000000000000, totalEquity: 145000000000000, totalDebt: 260000000000000, cashFlow: 12500000000000 },
  { period: 'Q3/2024', revenue: 38200000000000, grossProfit: 14706000000000, operatingIncome: 7640000000000, netIncome: 4698000000000, eps: 1208, totalAssets: 478000000000000, totalEquity: 140000000000000, totalDebt: 255000000000000, cashFlow: 10200000000000 },
  { period: 'Q2/2024', revenue: 35800000000000, grossProfit: 13782000000000, operatingIncome: 7160000000000, netIncome: 4290000000000, eps: 1103, totalAssets: 472000000000000, totalEquity: 136000000000000, totalDebt: 250000000000000, cashFlow: 8900000000000 },
  { period: 'Q1/2024', revenue: 33500000000000, grossProfit: 12897000000000, operatingIncome: 6700000000000, netIncome: 3820000000000, eps: 982, totalAssets: 465000000000000, totalEquity: 132000000000000, totalDebt: 248000000000000, cashFlow: 7500000000000 },
];

// ============ RISK METRICS ============
export const MOCK_RISK_METRICS: RiskMetrics = {
  accountId: 'acc1', var95: 28500000, var99: 42300000, cvar: 35800000, maxDrawdown: -8.2,
  sharpeRatio: 1.45, beta: 1.15, concentrationTop5: 92.3,
  correlationMatrix: {
    symbols: ['VIC', 'HPG', 'VNM', 'FPT', 'MBB'],
    matrix: [
      [1.00, 0.65, 0.42, 0.38, 0.55],
      [0.65, 1.00, 0.35, 0.30, 0.48],
      [0.42, 0.35, 1.00, 0.28, 0.32],
      [0.38, 0.30, 0.28, 1.00, 0.40],
      [0.55, 0.48, 0.32, 0.40, 1.00],
    ]
  }
};

// ============ ALERTS ============
export const MOCK_ALERT_CONFIGS: AlertConfig[] = [
  { id: 'a1', symbol: 'VIC', type: 'price', condition: 'above', threshold: 50000, channel: ['inapp', 'email'], isActive: true, createdAt: '2025-01-10' },
  { id: 'a2', symbol: 'HPG', type: 'pct_change', condition: 'below', threshold: -5, channel: ['inapp'], isActive: true, createdAt: '2025-01-12' },
  { id: 'a3', symbol: 'VNM', type: 'technical', condition: 'RSI > 70', threshold: 70, channel: ['inapp', 'telegram'], isActive: true, createdAt: '2025-01-15' },
  { id: 'a4', symbol: '', type: 'pnl', condition: 'portfolio_loss', threshold: -5, channel: ['inapp', 'email'], isActive: false, createdAt: '2025-01-20' },
];

export const MOCK_ALERT_HISTORY: AlertHistory[] = [
  { id: 'ah1', alertConfigId: 'a3', title: 'VNM RSI(14) đạt 72', message: 'VNM đang ở vùng overbought với RSI(14) = 72. Cân nhắc chốt lời.', severity: 'medium', triggeredAt: '2025-02-22T10:30:00Z', isRead: false },
  { id: 'ah2', alertConfigId: 'a1', title: 'VIC tiếp cận ngưỡng 50,000', message: 'VIC đang giao dịch tại 45,700 VND, còn 9.4% đến ngưỡng cảnh báo.', severity: 'low', triggeredAt: '2025-02-22T09:15:00Z', isRead: false },
  { id: 'ah3', alertConfigId: 'a2', title: 'HPG giảm mạnh phiên sáng', message: 'HPG giảm -1.09% trong phiên sáng, tiếp cận ngưỡng stop loss.', severity: 'high', triggeredAt: '2025-02-21T11:00:00Z', isRead: true },
  { id: 'ah4', alertConfigId: 'a1', title: 'MSN tăng giá trần', message: 'MSN tăng +3.95% gần giá trần, khối lượng lớn 2.1M.', severity: 'medium', triggeredAt: '2025-02-21T14:30:00Z', isRead: true },
];

// ============ CORPORATE ACTIONS ============
export const MOCK_CORPORATE_ACTIONS: CorporateAction[] = [
  { id: 'ca1', symbol: 'VIC', type: 'cash_dividend', exDate: '2025-03-10', recordDate: '2025-03-11', cashAmount: 2000, description: 'Cổ tức tiền mặt 2,000 đ/cp', isApplied: false },
  { id: 'ca2', symbol: 'HPG', type: 'stock_split', exDate: '2025-04-15', recordDate: '2025-04-16', ratio: 2, description: 'Chia tách cổ phiếu tỉ lệ 2:1', isApplied: false },
  { id: 'ca3', symbol: 'VNM', type: 'stock_dividend', exDate: '2025-03-20', recordDate: '2025-03-21', ratio: 0.05, description: 'Cổ tức cổ phiếu 5%', isApplied: false },
  { id: 'ca4', symbol: 'FPT', type: 'cash_dividend', exDate: '2025-02-28', recordDate: '2025-03-01', cashAmount: 3000, description: 'Cổ tức tiền mặt 3,000 đ/cp', isApplied: false },
];

// ============ ALLOCATION TARGETS ============
export const MOCK_ALLOCATION_TARGETS: AllocationTarget[] = [
  { category: 'Cổ phiếu', targetWeight: 70, currentWeight: 78.2, deviation: 8.2 },
  { category: 'ETF', targetWeight: 10, currentWeight: 7.4, deviation: -2.6 },
  { category: 'Tiền mặt', targetWeight: 20, currentWeight: 14.4, deviation: -5.6 },
];

// ============ CANDLE PATTERNS ============
export const MOCK_PATTERNS: CandlePattern[] = [
  { symbol: 'VIC', pattern: 'Bullish Engulfing', type: 'bullish_reversal', confidence: 'high', date: '2025-02-20', description: 'Nến nuốt tăng tại vùng hỗ trợ 44,500' },
  { symbol: 'HPG', pattern: 'Doji', type: 'continuation', confidence: 'medium', date: '2025-02-21', description: 'Nến Doji thể hiện sự phân vân tại vùng 27,200' },
  { symbol: 'FPT', pattern: 'Morning Star', type: 'bullish_reversal', confidence: 'high', date: '2025-02-19', description: 'Mô hình Sao Mai - tín hiệu đảo chiều tăng' },
  { symbol: 'MSN', pattern: 'Three White Soldiers', type: 'bullish_reversal', confidence: 'high', date: '2025-02-22', description: 'Ba nến trắng liên tiếp - xu hướng tăng mạnh' },
];

// ============ BACKTEST RESULTS ============
export const MOCK_BACKTEST_RESULTS: BacktestResult[] = [
  {
    id: 'bt1', strategyName: 'EMA9/EMA21 Crossover', totalReturn: 28.5, annualizedReturn: 22.3,
    maxDrawdown: -12.5, sharpeRatio: 1.65, winRate: 58, profitFactor: 1.82, totalTrades: 24,
    equityCurve: Array.from({ length: 50 }, (_, i) => ({ date: `2024-${String(Math.floor(i / 4) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`, value: 100000000 + (i * 580000) + (Math.random() - 0.3) * 5000000 })),
    trades: [
      { entryDate: '2024-03-15', exitDate: '2024-04-02', entryPrice: 42000, exitPrice: 44500, quantity: 2000, pnl: 5000000, pnlPct: 5.95, type: 'long' },
      { entryDate: '2024-04-20', exitDate: '2024-05-05', entryPrice: 45000, exitPrice: 43200, quantity: 2000, pnl: -3600000, pnlPct: -4.0, type: 'long' },
      { entryDate: '2024-06-10', exitDate: '2024-07-01', entryPrice: 41500, exitPrice: 46000, quantity: 2000, pnl: 9000000, pnlPct: 10.84, type: 'long' },
    ]
  }
];

// ============ PERFORMANCE REPORTS ============
export const MOCK_PERFORMANCE: PerformanceReport = {
  accountId: 'acc1', period: '2024', totalReturn: 18.5, annualizedReturn: 18.5, benchmarkReturn: 12.3,
  alpha: 6.2, sharpeRatio: 1.45, maxDrawdown: -8.2, winRate: 72, avgHoldingDays: 45, totalTrades: 18
};

// ============ STRESS SCENARIOS ============
export const MOCK_STRESS_SCENARIOS: StressScenario[] = [
  { id: 'ss1', name: 'VN-Index giảm 10%', description: 'Kịch bản thị trường giảm vừa', changes: [], impact: -98500000 },
  { id: 'ss2', name: 'VN-Index giảm 20%', description: 'Kịch bản thị trường giảm mạnh', changes: [], impact: -197000000 },
  { id: 'ss3', name: 'COVID-2020', description: 'VN-Index giảm 35% trong 2 tháng', changes: [], impact: -345000000 },
  { id: 'ss4', name: 'Lãi suất tăng 2%', description: 'Tác động ngành BĐS, ngân hàng', changes: [], impact: -85000000 },
];

// ============ ADMIN USERS ============
export const MOCK_ADMIN_USERS: AdminUser[] = [
  { id: '1', email: 'investor@investment.vn', fullName: 'Nguyễn Văn An', role: 'investor', status: 'active', lastLogin: '2025-02-22T08:00:00Z', createdAt: '2024-01-15' },
  { id: '2', email: 'admin@investment.vn', fullName: 'Trần Thị Bình', role: 'admin', status: 'active', lastLogin: '2025-02-22T07:30:00Z', createdAt: '2023-12-01' },
  { id: '3', email: 'analyst@investment.vn', fullName: 'Lê Minh Cường', role: 'analyst', status: 'active', lastLogin: '2025-02-21T16:00:00Z', createdAt: '2024-03-10' },
  { id: '4', email: 'user4@investment.vn', fullName: 'Phạm Thị Dung', role: 'investor', status: 'inactive', lastLogin: '2025-01-15T10:00:00Z', createdAt: '2024-05-20' },
];

// ============ AUDIT LOGS ============
export const MOCK_AUDIT_LOGS: AuditLog[] = [
  { id: 'al1', userId: '1', userName: 'Nguyễn Văn An', action: 'LOGIN', entityType: 'session', entityId: '', ipAddress: '192.168.1.100', createdAt: '2025-02-22T08:00:00Z' },
  { id: 'al2', userId: '1', userName: 'Nguyễn Văn An', action: 'CREATE_TRANSACTION', entityType: 'transaction', entityId: 't10', ipAddress: '192.168.1.100', createdAt: '2025-02-22T09:15:00Z', details: 'Mua 5000 E1VFVN30 @ 18,200' },
  { id: 'al3', userId: '2', userName: 'Trần Thị Bình', action: 'UPDATE_USER', entityType: 'user', entityId: '4', ipAddress: '192.168.1.200', createdAt: '2025-02-21T16:30:00Z', details: 'Đổi trạng thái: active → inactive' },
  { id: 'al4', userId: '1', userName: 'Nguyễn Văn An', action: 'EXPORT_DATA', entityType: 'report', entityId: 'acc1', ipAddress: '192.168.1.100', createdAt: '2025-02-21T14:00:00Z', details: 'Export danh mục Excel' },
];

// ============ DATA SOURCES ============
export const MOCK_DATA_SOURCES: DataSource[] = [
  { id: 'ds1', name: 'HOSE Datafeed', type: 'exchange', isActive: true, priority: 1, lastSync: '2025-02-22T09:30:00Z', status: 'connected' },
  { id: 'ds2', name: 'VNDirect API', type: 'broker', isActive: true, priority: 2, lastSync: '2025-02-22T09:28:00Z', status: 'connected' },
  { id: 'ds3', name: 'SSI API', type: 'broker', isActive: true, priority: 3, lastSync: '2025-02-22T09:25:00Z', status: 'connected' },
  { id: 'ds4', name: 'Yahoo Finance', type: 'international', isActive: false, priority: 5, lastSync: '2025-02-20T00:00:00Z', status: 'disconnected' },
];

// ============ USER SETTINGS ============
export const MOCK_USER_SETTINGS: UserSettings = {
  costMethod: 'WAVG', currencyDisplay: 'million', language: 'vi', theme: 'light', defaultInterval: '1D', notificationChannels: ['inapp', 'email']
};

// ===== Module 8.2: Risk Limits =====
export const MOCK_RISK_LIMITS = [
  { id: 'rl1', accountId: 'acc1', type: 'stop_loss_portfolio', threshold: -5, currentValue: -2.1, isActive: true, createdAt: '2025-12-01' },
  { id: 'rl2', accountId: 'acc1', type: 'stop_loss_symbol', symbol: 'VIC', threshold: -10, currentValue: -3.5, isActive: true, createdAt: '2025-12-01' },
  { id: 'rl3', accountId: 'acc1', type: 'max_weight', threshold: 25, currentValue: 21.4, isActive: true, createdAt: '2025-12-01' },
  { id: 'rl4', accountId: 'acc1', type: 'var_threshold', threshold: -30000000, currentValue: -18500000, isActive: true, createdAt: '2025-12-01' },
  { id: 'rl5', accountId: 'acc1', type: 'drawdown_threshold', threshold: -15, currentValue: -8.2, isActive: false, createdAt: '2025-12-01' },
];

// ===== Module 7.2: Balance Sheet & CashFlow =====
export const MOCK_BALANCE_SHEETS = [
  { period: 'Q4/2025', symbol: 'VIC', totalAssets: 408000e9, currentAssets: 95000e9, longTermAssets: 313000e9, totalLiabilities: 260000e9, currentLiabilities: 120000e9, longTermDebt: 140000e9, totalEquity: 148000e9, retainedEarnings: 32000e9 },
  { period: 'Q3/2025', symbol: 'VIC', totalAssets: 395000e9, currentAssets: 88000e9, longTermAssets: 307000e9, totalLiabilities: 252000e9, currentLiabilities: 115000e9, longTermDebt: 137000e9, totalEquity: 143000e9, retainedEarnings: 28000e9 },
  { period: 'Q2/2025', symbol: 'VIC', totalAssets: 385000e9, currentAssets: 82000e9, longTermAssets: 303000e9, totalLiabilities: 248000e9, currentLiabilities: 110000e9, longTermDebt: 138000e9, totalEquity: 137000e9, retainedEarnings: 24000e9 },
  { period: 'Q1/2025', symbol: 'VIC', totalAssets: 378000e9, currentAssets: 79000e9, longTermAssets: 299000e9, totalLiabilities: 245000e9, currentLiabilities: 108000e9, longTermDebt: 137000e9, totalEquity: 133000e9, retainedEarnings: 20000e9 },
];

export const MOCK_CASH_FLOWS = [
  { period: 'Q4/2025', symbol: 'VIC', operatingCF: 8500e9, investingCF: -12000e9, financingCF: 5000e9, netCF: 1500e9, beginCash: 18500e9, endCash: 20000e9 },
  { period: 'Q3/2025', symbol: 'VIC', operatingCF: 7200e9, investingCF: -10500e9, financingCF: 4800e9, netCF: 1500e9, beginCash: 17000e9, endCash: 18500e9 },
  { period: 'Q2/2025', symbol: 'VIC', operatingCF: 6800e9, investingCF: -9800e9, financingCF: 4200e9, netCF: 1200e9, beginCash: 15800e9, endCash: 17000e9 },
  { period: 'Q1/2025', symbol: 'VIC', operatingCF: 6500e9, investingCF: -9200e9, financingCF: 3800e9, netCF: 1100e9, beginCash: 14700e9, endCash: 15800e9 },
];

// ===== Module 9.2: PnL by Period & Attribution =====
export const MOCK_PNL_BY_PERIOD = [
  { period: 'T1/2026', realizedPnL: 12500000, floatingPnL: 45000000, dividend: 8000000, fees: -1250000, tax: -1250000, netPnL: 63000000 },
  { period: 'T12/2025', realizedPnL: -5200000, floatingPnL: 22000000, dividend: 0, fees: -980000, tax: -520000, netPnL: 15300000 },
  { period: 'T11/2025', realizedPnL: 18000000, floatingPnL: 38000000, dividend: 12000000, fees: -1800000, tax: -1800000, netPnL: 64400000 },
  { period: 'T10/2025', realizedPnL: 8500000, floatingPnL: -15000000, dividend: 0, fees: -850000, tax: -850000, netPnL: -8200000 },
  { period: 'T9/2025', realizedPnL: 22000000, floatingPnL: 28000000, dividend: 5000000, fees: -2200000, tax: -2200000, netPnL: 50600000 },
  { period: 'T8/2025', realizedPnL: -8000000, floatingPnL: -32000000, dividend: 0, fees: -600000, tax: 0, netPnL: -40600000 },
];

export const MOCK_ATTRIBUTION = [
  { symbol: 'VIC', companyName: 'Vingroup', weight: 21.4, contribution: 2.8, returnPct: 13.1, sector: 'Bất động sản' },
  { symbol: 'HPG', companyName: 'Hòa Phát', weight: 16.5, contribution: -0.5, returnPct: -3.0, sector: 'Vật liệu' },
  { symbol: 'VNM', companyName: 'Vinamilk', weight: 13.7, contribution: 1.2, returnPct: 8.8, sector: 'Thực phẩm' },
  { symbol: 'FPT', companyName: 'FPT Corp', weight: 12.1, contribution: 3.5, returnPct: 28.9, sector: 'Công nghệ' },
  { symbol: 'MBB', companyName: 'MB Bank', weight: 11.2, contribution: 1.8, returnPct: 16.1, sector: 'Ngân hàng' },
  { symbol: 'E1VFVN30', companyName: 'ETF VN30', weight: 8.9, contribution: 0.9, returnPct: 10.1, sector: 'ETF' },
  { symbol: 'MSN', companyName: 'Masan', weight: 5.8, contribution: -0.3, returnPct: -5.2, sector: 'Hàng tiêu dùng' },
  { symbol: 'SSI', companyName: 'SSI', weight: 5.5, contribution: 0.4, returnPct: 7.3, sector: 'Chứng khoán' },
  { symbol: 'VHM', companyName: 'Vinhomes', weight: 4.9, contribution: 1.1, returnPct: 22.4, sector: 'Bất động sản' },
];

// ===== Module 4.3: Corporate Actions Extended =====
export const MOCK_CORPORATE_ACTIONS_EXTENDED = [
  { id: 'ca1', symbol: 'VNM', type: 'cash_dividend', exDate: '2026-03-05', recordDate: '2026-03-06', cashAmount: 1500, description: 'Cổ tức tiền mặt 1,500 VNĐ/CP', status: 'pending' },
  { id: 'ca2', symbol: 'HPG', type: 'stock_dividend', exDate: '2026-03-15', recordDate: '2026-03-16', ratio: 0.1, description: 'Cổ tức CP tỉ lệ 10:1', status: 'pending' },
  { id: 'ca3', symbol: 'FPT', type: 'stock_split', exDate: '2026-04-01', recordDate: '2026-04-02', ratio: 2, description: 'Chia tách 2:1', status: 'pending' },
  { id: 'ca4', symbol: 'VIC', type: 'rights_issue', exDate: '2026-04-10', recordDate: '2026-04-11', ratio: 0.2, cashAmount: 35000, description: 'Quyền mua thêm tỉ lệ 5:1, giá 35,000', status: 'pending' },
  { id: 'ca5', symbol: 'MBB', type: 'cash_dividend', exDate: '2026-02-28', recordDate: '2026-03-01', cashAmount: 800, description: 'Cổ tức đợt 1 năm 2025: 800 VNĐ/CP', status: 'applied' },
];

// ===== Module 7.1: Officers =====
export const MOCK_OFFICERS = [
  { name: 'Phạm Nhật Vượng', position: 'Chủ tịch HĐQT', since: '2002' },
  { name: 'Nguyễn Việt Quang', position: 'Phó CT kiêm TGĐ', since: '2018' },
  { name: 'Phạm Thị Thu Hằng', position: 'Phó TGĐ', since: '2015' },
];

// ===== Module 5.2: Trade History (order book) =====
export const MOCK_TRADE_HISTORY = [
  { time: '14:29:45', price: 45200, volume: 15000, side: 'buy' },
  { time: '14:29:30', price: 45100, volume: 8000, side: 'sell' },
  { time: '14:29:15', price: 45200, volume: 22000, side: 'buy' },
  { time: '14:29:00', price: 45100, volume: 5000, side: 'sell' },
  { time: '14:28:45', price: 45000, volume: 30000, side: 'buy' },
  { time: '14:28:30', price: 45000, volume: 12000, side: 'buy' },
  { time: '14:28:15', price: 44900, volume: 18000, side: 'sell' },
  { time: '14:28:00', price: 45000, volume: 9000, side: 'buy' },
  { time: '14:27:45', price: 44900, volume: 25000, side: 'sell' },
  { time: '14:27:30', price: 45000, volume: 11000, side: 'buy' },
  { time: '14:27:15', price: 44800, volume: 7000, side: 'sell' },
  { time: '14:27:00', price: 44900, volume: 14000, side: 'buy' },
  { time: '14:26:45', price: 44800, volume: 20000, side: 'sell' },
  { time: '14:26:30', price: 44900, volume: 6000, side: 'buy' },
  { time: '14:26:15', price: 44700, volume: 35000, side: 'sell' },
  { time: '14:26:00', price: 44800, volume: 10000, side: 'buy' },
  { time: '14:25:45', price: 44700, volume: 8000, side: 'sell' },
  { time: '14:25:30', price: 44800, volume: 16000, side: 'buy' },
  { time: '14:25:15', price: 44700, volume: 13000, side: 'sell' },
  { time: '14:25:00', price: 44700, volume: 21000, side: 'buy' },
];
