import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface NavItem { label: string; icon: string; route: string; roles?: string[]; children?: NavItem[]; }

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="sidebar-inner">
      <div class="sidebar-brand">
        <img src="assets/logo.png" alt="Logo" class="sidebar-logo">
        <div class="brand-text">
          <span class="brand-name">Investment</span>
          <span class="brand-sub">Platform</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        @for (group of allowedNavGroups; track group.label) {
          <div class="nav-group">
            <span class="nav-group-label">{{ group.label }}</span>
            @for (item of group.items; track item.route) {
              <a [routerLink]="item.route" routerLinkActive="active" class="nav-item">
                <i class="bi" [ngClass]="item.icon"></i>
                <span>{{ item.label }}</span>
              </a>
            }
          </div>
        }
      </nav>

      <div class="sidebar-footer">
        <div class="ws-status">
          <span class="ws-dot"></span>
          <span>WebSocket Active</span>
        </div>
        <div class="api-info">REST API v1 · Go/Gin</div>
      </div>
    </div>
  `,
  styles: [`
    .sidebar-inner { display: flex; flex-direction: column; height: 100%; padding: 0; }
    .sidebar-brand {
      display: flex; align-items: center; gap: 12px; padding: 20px 20px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .sidebar-logo { width: 42px; height: 42px; border-radius: 10px; object-fit: cover; }
    .brand-name { display: block; font-size: 1rem; font-weight: 700; color: #E2E8F0; letter-spacing: -0.02em; }
    .brand-sub { display: block; font-size: 0.7rem; color: var(--ip-sidebar-text); font-weight: 400; }
    .sidebar-nav { flex: 1; overflow-y: auto; padding: 12px 12px; }
    .nav-group { margin-bottom: 8px; }
    .nav-group-label { display: block; font-size: 0.65rem; font-weight: 600; color: #4A5568; text-transform: uppercase; letter-spacing: 0.08em; padding: 12px 12px 6px; }
    .nav-item {
      display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 8px;
      color: var(--ip-sidebar-text); text-decoration: none; font-size: 0.82rem; font-weight: 400;
      transition: all 0.15s; margin-bottom: 2px;
      &:hover { background: rgba(255,255,255,0.05); color: #E2E8F0; }
      &.active { background: rgba(0,180,216,0.12); color: var(--ip-sidebar-active); font-weight: 500;
        i { color: var(--ip-sidebar-active); }
      }
      i { font-size: 1rem; width: 20px; text-align: center; }
    }
    .sidebar-footer {
      padding: 16px 20px; border-top: 1px solid rgba(255,255,255,0.06);
      font-size: 0.7rem; color: #4A5568;
    }
    .ws-status { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; color: var(--ip-sidebar-text); }
    .ws-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--vn-green); animation: pulse 2s infinite; }
    @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
    .api-info { color: #4A5568; }
  `]
})
export class SidebarComponent {
  auth = inject(AuthService);

  get allowedNavGroups() {
    const userRole = this.auth.user()?.role || '';
    return this.navGroups
      .map(group => {
        // Filter items within the group by checking if user role matches `roles` constraint or if `roles` is undefined.
        const filteredItems = group.items.filter(item => !item.roles || item.roles.includes(userRole));
        return { ...group, items: filteredItems };
      })
      // Only return groups that contain at least one allowed item
      .filter(group => group.items.length > 0);
  }

  navGroups = [
    {
      label: 'Tổng quan',
      items: [
        { label: 'Dashboard', icon: 'bi-grid-1x2-fill', route: '/dashboard' },
      ]
    },
    {
      label: 'Danh mục',
      items: [
        { label: 'Tài khoản ĐT', icon: 'bi-wallet2', route: '/portfolio/accounts', roles: ['investor'] },
        { label: 'Vị thế (Holdings)', icon: 'bi-pie-chart-fill', route: '/portfolio/holdings', roles: ['investor'] },
        { label: 'Phân bổ tài sản', icon: 'bi-diagram-3-fill', route: '/portfolio/allocation', roles: ['investor'] },
      ]
    },
    {
      label: 'Giao dịch',
      items: [
        { label: 'Lịch sử GD', icon: 'bi-receipt', route: '/transactions', roles: ['investor'] },
        { label: 'Nhập lệnh', icon: 'bi-plus-circle', route: '/transactions/new', roles: ['investor'] },
        { label: 'Import/Export', icon: 'bi-file-earmark-arrow-up', route: '/transactions/import', roles: ['investor'] },
      ]
    },
    {
      label: 'Thị trường',
      items: [
        { label: 'Bảng giá', icon: 'bi-table', route: '/market', roles: ['investor', 'analyst'] },
        { label: 'Sổ lệnh', icon: 'bi-book-half', route: '/market/orderbook', roles: ['investor', 'analyst'] },
        { label: 'Watchlist', icon: 'bi-star-fill', route: '/market/watchlist', roles: ['investor', 'analyst'] },
      ]
    },
    {
      label: 'Phân tích',
      items: [
        { label: 'Biểu đồ kỹ thuật', icon: 'bi-graph-up', route: '/analysis/chart', roles: ['investor', 'analyst'] },
        { label: 'Nhận dạng Pattern', icon: 'bi-lightning-fill', route: '/analysis/patterns', roles: ['investor', 'analyst'] },
        { label: 'Backtesting', icon: 'bi-arrow-repeat', route: '/analysis/backtest', roles: ['investor', 'analyst'] },
        { label: 'Hồ sơ DN', icon: 'bi-building', route: '/fundamental/profile', roles: ['investor', 'analyst'] },
        { label: 'BCTC', icon: 'bi-file-earmark-bar-graph', route: '/fundamental/financials', roles: ['investor', 'analyst'] },
        { label: 'Screener', icon: 'bi-funnel-fill', route: '/fundamental/screener', roles: ['investor', 'analyst'] },
      ]
    },
    {
      label: 'Rủi ro & Báo cáo',
      items: [
        { label: 'Quản lý rủi ro', icon: 'bi-shield-exclamation', route: '/risk', roles: ['investor'] },
        { label: 'Stress Test', icon: 'bi-speedometer2', route: '/risk/stress-test', roles: ['investor'] },
        { label: 'Báo cáo hiệu suất', icon: 'bi-bar-chart-line-fill', route: '/reports', roles: ['investor'] },
        { label: 'Tích hợp BI', icon: 'bi-cpu', route: '/reports/bi', roles: ['investor', 'analyst'] },
      ]
    },
    {
      label: 'Cảnh báo',
      items: [
        { label: 'Cài đặt cảnh báo', icon: 'bi-bell-fill', route: '/alerts', roles: ['investor', 'analyst'] },
        { label: 'Lịch sử cảnh báo', icon: 'bi-clock-history', route: '/alerts/history', roles: ['investor', 'analyst'] },
      ]
    },
    {
      label: 'Quản trị',
      items: [
        { label: 'Quản lý người dùng', icon: 'bi-people-fill', route: '/admin/users', roles: ['admin'] },
        { label: 'Nguồn dữ liệu', icon: 'bi-database-fill-gear', route: '/admin/config', roles: ['admin'] },
        { label: 'Nhật ký hệ thống', icon: 'bi-journal-text', route: '/admin/audit', roles: ['admin'] },
        { label: 'Cài đặt cá nhân', icon: 'bi-gear-fill', route: '/settings' },
      ]
    },
  ];
}
