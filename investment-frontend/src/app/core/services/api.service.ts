import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

// This service is the bridge to Go backend REST API
// In mock mode, it returns mock data. When backend is ready, change USE_MOCK to false.

const USE_MOCK = true;
const API_BASE = '/api/v1';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  // ============ Generic CRUD ============
  get<T>(path: string, params?: any): Observable<T> {
    if (USE_MOCK) return of(null as any);
    let httpParams = new HttpParams();
    if (params) Object.keys(params).forEach(k => httpParams = httpParams.set(k, params[k]));
    return this.http.get<T>(`${API_BASE}${path}`, { params: httpParams }).pipe(catchError(this.handleError<T>('GET ' + path)));
  }

  post<T>(path: string, body: any): Observable<T> {
    if (USE_MOCK) return of(null as any);
    return this.http.post<T>(`${API_BASE}${path}`, body).pipe(catchError(this.handleError<T>('POST ' + path)));
  }

  put<T>(path: string, body: any): Observable<T> {
    if (USE_MOCK) return of(null as any);
    return this.http.put<T>(`${API_BASE}${path}`, body).pipe(catchError(this.handleError<T>('PUT ' + path)));
  }

  delete<T>(path: string): Observable<T> {
    if (USE_MOCK) return of(null as any);
    return this.http.delete<T>(`${API_BASE}${path}`).pipe(catchError(this.handleError<T>('DELETE ' + path)));
  }

  // ============ Specific API endpoints matching Go backend ============

  // Auth
  login(email: string, password: string) { return this.post('/auth/login', { email, password }); }
  register(data: any) { return this.post('/auth/register', data); }
  refreshToken() { return this.post('/auth/refresh', {}); }
  getProfile() { return this.get('/auth/profile'); }

  // Portfolio
  getAccounts() { return this.get('/accounts'); }
  getAccountById(id: string) { return this.get(`/accounts/${id}`); }
  createAccount(data: any) { return this.post('/accounts', data); }
  updateAccount(id: string, data: any) { return this.put(`/accounts/${id}`, data); }
  deleteAccount(id: string) { return this.delete(`/accounts/${id}`); }
  getAccountSummary(id: string) { return this.get(`/accounts/${id}/summary`); }
  getHoldings(accountId: string) { return this.get(`/accounts/${accountId}/holdings`); }
  getAllocation(accountId: string) { return this.get(`/accounts/${accountId}/allocation`); }
  setAllocationTarget(accountId: string, data: any) { return this.post(`/accounts/${accountId}/allocation/target`, data); }

  // Transactions
  getTransactions(params?: any) { return this.get('/transactions', params); }
  createTransaction(data: any) { return this.post('/transactions', data); }
  updateTransaction(id: string, data: any) { return this.put(`/transactions/${id}`, data); }
  deleteTransaction(id: string) { return this.delete(`/transactions/${id}`); }
  importPreview(data: any) { return this.post('/transactions/import/preview', data); }
  importConfirm(data: any) { return this.post('/transactions/import/confirm', data); }

  // Market Data
  getQuotes(params?: any) { return this.get('/market/quotes', params); }
  getQuote(symbol: string) { return this.get(`/market/quotes/${symbol}`); }
  getIndices() { return this.get('/market/indices'); }
  getOHLCV(symbol: string, interval: string, from?: string, to?: string) {
    return this.get(`/market/ohlcv/${symbol}`, { interval, from, to });
  }
  getIndicator(symbol: string, type: string, period: number) {
    return this.get(`/market/indicators/${symbol}`, { type, period });
  }

  // Watchlists
  getWatchlists() { return this.get('/watchlists'); }
  createWatchlist(data: any) { return this.post('/watchlists', data); }
  updateWatchlist(id: string, data: any) { return this.put(`/watchlists/${id}`, data); }
  deleteWatchlist(id: string) { return this.delete(`/watchlists/${id}`); }
  addSymbolToWatchlist(id: string, symbol: string) { return this.post(`/watchlists/${id}/symbols`, { symbol }); }
  removeSymbolFromWatchlist(id: string, symbol: string) { return this.delete(`/watchlists/${id}/symbols/${symbol}`); }

  // Fundamentals
  getCompanyProfile(symbol: string) { return this.get(`/fundamentals/${symbol}/profile`); }
  getFinancials(symbol: string, type: string) { return this.get(`/fundamentals/${symbol}/financials/${type}`); }
  getValuation(symbol: string) { return this.get(`/fundamentals/${symbol}/valuation`); }

  // Analytics
  getPatterns(symbol: string) { return this.get(`/analytics/patterns/${symbol}`); }
  scanPatterns(symbols: string[], patterns: string[]) { return this.post('/analytics/patterns/scan', { symbols, patterns }); }
  runBacktest(config: any) { return this.post('/backtesting/run', config); }
  runScreener(conditions: any[]) { return this.post('/screener/run', { conditions }); }

  // Risk
  getRiskMetrics(accountId: string) { return this.get(`/risk/${accountId}/metrics`); }
  getVaR(accountId: string, confidence: number) { return this.get(`/risk/${accountId}/var`, { confidence }); }
  getCorrelation(accountId: string) { return this.get(`/risk/${accountId}/correlation`); }
  runStressTest(accountId: string, scenarios: any[]) { return this.post(`/risk/${accountId}/stress-test`, { scenarios }); }
  getRiskLimits(accountId: string) { return this.get(`/risk/${accountId}/limits`); }
  setRiskLimit(accountId: string, data: any) { return this.post(`/risk/${accountId}/limits`, data); }

  // Reports
  getPerformance(accountId: string, from?: string, to?: string) { return this.get(`/reports/performance/${accountId}`, { from, to }); }
  getReturns(accountId: string) { return this.get(`/reports/returns/${accountId}`); }
  getAttribution(accountId: string) { return this.get(`/reports/attribution/${accountId}`); }

  // BI
  getTableauToken() { return this.get('/bi/tableau/token'); }
  getPowerBIEmbedToken() { return this.get('/bi/powerbi/embed-token'); }
  getCognosTaxReport(year: number) { return this.get(`/bi/cognos/tax-report/${year}`); }

  // Alerts
  getAlerts() { return this.get('/alerts'); }
  createAlert(data: any) { return this.post('/alerts', data); }
  updateAlert(id: string, data: any) { return this.put(`/alerts/${id}`, data); }
  toggleAlert(id: string) { return this.put(`/alerts/${id}/toggle`, {}); }
  getAlertHistory() { return this.get('/alerts/history'); }
  markAlertRead(id: string) { return this.put(`/alerts/history/${id}/read`, {}); }

  // Corporate Actions
  getCorporateActions(params?: any) { return this.get('/corporate-actions', params); }
  createCorporateAction(data: any) { return this.post('/corporate-actions', data); }
  applyCorporateAction(id: string) { return this.post(`/corporate-actions/${id}/apply`, {}); }
  getCorporateActionsCalendar() { return this.get('/corporate-actions/calendar'); }

  // Export
  exportPortfolio(accountId: string, format: string) { return this.get(`/export/portfolio/${accountId}`, { format }); }
  exportTransactions(accountId: string, format: string) { return this.get(`/export/transactions/${accountId}`, { format }); }
  exportPnL(accountId: string, format: string) { return this.get(`/export/pnl/${accountId}`, { format }); }
  exportTaxReport(accountId: string, year: number) { return this.get(`/export/tax/${accountId}/${year}`); }

  // Admin
  getUsers() { return this.get('/admin/users'); }
  updateUser(id: string, data: any) { return this.put(`/admin/users/${id}`, data); }
  getDataSources() { return this.get('/admin/data-sources'); }
  testDataSource(id: string) { return this.post(`/admin/data-sources/${id}/test`, {}); }
  getAuditLogs(params?: any) { return this.get('/audit-logs', params); }

  // Settings
  getUserSettings() { return this.get('/settings/user'); }
  updateUserSettings(data: any) { return this.put('/settings/user', data); }

  private handleError<T>(operation: string) {
    return (error: any): Observable<T> => {
      console.error(`[API] ${operation} failed:`, error);
      return of(null as any);
    };
  }
}
