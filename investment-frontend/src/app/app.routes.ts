import { Routes } from '@angular/router';
import { authGuard, adminGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },
  {
    path: '',
    loadComponent: () => import('./layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },

      // Portfolio (Investor only)
      { path: 'portfolio/accounts', loadComponent: () => import('./features/portfolio/accounts/accounts.component').then(m => m.AccountsComponent), canActivate: [roleGuard(['investor'])] },
      { path: 'portfolio/holdings', loadComponent: () => import('./features/portfolio/holdings/holdings.component').then(m => m.HoldingsComponent), canActivate: [roleGuard(['investor'])] },
      { path: 'portfolio/allocation', loadComponent: () => import('./features/portfolio/allocation/allocation.component').then(m => m.AllocationComponent), canActivate: [roleGuard(['investor'])] },

      // Transactions (Investor only)
      { path: 'transactions', loadComponent: () => import('./features/transactions/transaction-list/transaction-list.component').then(m => m.TransactionListComponent), canActivate: [roleGuard(['investor'])] },
      { path: 'transactions/new', loadComponent: () => import('./features/transactions/transaction-form/transaction-form.component').then(m => m.TransactionFormComponent), canActivate: [roleGuard(['investor'])] },
      { path: 'transactions/import', loadComponent: () => import('./features/transactions/import-export/import-export.component').then(m => m.ImportExportComponent), canActivate: [roleGuard(['investor'])] },

      // Market (Analyst, Investor)
      { path: 'market', loadComponent: () => import('./features/market/market-board/market-board.component').then(m => m.MarketBoardComponent), canActivate: [roleGuard(['investor', 'analyst'])] },
      { path: 'market/orderbook', loadComponent: () => import('./features/market/order-book/order-book.component').then(m => m.OrderBookComponent), canActivate: [roleGuard(['investor', 'analyst'])] },
      { path: 'market/watchlist', loadComponent: () => import('./features/market/watchlist/watchlist.component').then(m => m.WatchlistComponent), canActivate: [roleGuard(['investor', 'analyst'])] },

      // Technical Analysis (Analyst, Investor)
      { path: 'analysis/chart', loadComponent: () => import('./features/technical-analysis/price-chart/price-chart.component').then(m => m.PriceChartComponent), canActivate: [roleGuard(['investor', 'analyst'])] },
      { path: 'analysis/patterns', loadComponent: () => import('./features/technical-analysis/patterns/patterns.component').then(m => m.PatternsComponent), canActivate: [roleGuard(['investor', 'analyst'])] },
      { path: 'analysis/backtest', loadComponent: () => import('./features/technical-analysis/backtesting/backtesting.component').then(m => m.BacktestingComponent), canActivate: [roleGuard(['investor', 'analyst'])] },

      // Fundamental (Analyst, Investor)
      { path: 'fundamental/profile', loadComponent: () => import('./features/fundamental/company-profile/company-profile.component').then(m => m.CompanyProfileComponent), canActivate: [roleGuard(['investor', 'analyst'])] },
      { path: 'fundamental/financials', loadComponent: () => import('./features/fundamental/financials/financials.component').then(m => m.FinancialsComponent), canActivate: [roleGuard(['investor', 'analyst'])] },
      { path: 'fundamental/screener', loadComponent: () => import('./features/fundamental/screener/screener.component').then(m => m.ScreenerComponent), canActivate: [roleGuard(['investor', 'analyst'])] },

      // Risk (Investor only)
      { path: 'risk', loadComponent: () => import('./features/risk/risk-metrics/risk-metrics.component').then(m => m.RiskMetricsComponent), canActivate: [roleGuard(['investor'])] },
      { path: 'risk/stress-test', loadComponent: () => import('./features/risk/stress-test/stress-test.component').then(m => m.StressTestComponent), canActivate: [roleGuard(['investor'])] },

      // Reports (Investor, Analyst)
      { path: 'reports', loadComponent: () => import('./features/reports/performance/performance.component').then(m => m.PerformanceComponent), canActivate: [roleGuard(['investor'])] },
      { path: 'reports/bi', loadComponent: () => import('./features/reports/bi-integration/bi-integration.component').then(m => m.BiIntegrationComponent), canActivate: [roleGuard(['analyst', 'investor'])] },

      // Alerts (Investor, Analyst)
      { path: 'alerts', loadComponent: () => import('./features/alerts/alert-config/alert-config.component').then(m => m.AlertConfigComponent), canActivate: [roleGuard(['investor', 'analyst'])] },
      { path: 'alerts/history', loadComponent: () => import('./features/alerts/alert-history/alert-history.component').then(m => m.AlertHistoryComponent), canActivate: [roleGuard(['investor', 'analyst'])] },

      // Admin (Admin only)
      { path: 'admin/users', loadComponent: () => import('./features/admin/user-management/user-management.component').then(m => m.UserManagementComponent), canActivate: [adminGuard] },
      { path: 'admin/config', loadComponent: () => import('./features/admin/system-config/system-config.component').then(m => m.SystemConfigComponent), canActivate: [adminGuard] },
      { path: 'admin/audit', loadComponent: () => import('./features/admin/audit-logs/audit-logs.component').then(m => m.AuditLogsComponent), canActivate: [adminGuard] },

      // Settings (All authenticated users)
      { path: 'settings', loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent) },
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
