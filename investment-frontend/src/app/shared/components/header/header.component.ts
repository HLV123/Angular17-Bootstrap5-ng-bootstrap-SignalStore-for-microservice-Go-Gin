import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AlertService } from '../../../core/services/alert.service';
import { MarketService } from '../../../core/services/market.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="topbar d-flex align-items-center justify-content-between px-4 py-2">
      <div class="d-flex align-items-center gap-3">
        <button class="btn btn-sm d-lg-none border-0" (click)="toggleSidebar()">
          <i class="bi bi-list fs-5"></i>
        </button>
        <div class="d-flex align-items-center gap-2">
          @for (idx of market.indices(); track idx.name) {
            <span class="index-chip">
              <span class="index-name">{{ idx.name }}</span>
              <span class="index-value">{{ idx.value | number:'1.1-1' }}</span>
              <span [class]="idx.change >= 0 ? 'positive' : 'negative'">
                {{ idx.change >= 0 ? '+' : '' }}{{ idx.change | number:'1.1-1' }}
                ({{ idx.changePct | number:'1.2-2' }}%)
              </span>
            </span>
          }
        </div>
      </div>

      <div class="d-flex align-items-center gap-3">
        <span class="ws-indicator">Real-time</span>

        <div class="position-relative" style="cursor:pointer" [routerLink]="['/alerts/history']">
          <i class="bi bi-bell fs-5"></i>
          @if (alertService.unreadCount() > 0) {
            <span class="badge-dot">{{ alertService.unreadCount() }}</span>
          }
        </div>

        <div class="user-menu" (click)="showUserMenu = !showUserMenu">
          <div class="user-avatar">{{ auth.user()?.fullName?.charAt(0) || 'U' }}</div>
          <div class="user-info d-none d-md-block">
            <span class="user-name">{{ auth.user()?.fullName }}</span>
            <span class="user-role">{{ auth.user()?.role | titlecase }}</span>
          </div>
          <i class="bi bi-chevron-down ms-1"></i>
        </div>

        @if (showUserMenu) {
          <div class="user-dropdown" (mouseleave)="showUserMenu = false">
            <a routerLink="/settings" class="dropdown-item"><i class="bi bi-gear me-2"></i>Cài đặt</a>
            <hr class="my-1">
            <a class="dropdown-item text-danger" (click)="auth.logout()"><i class="bi bi-box-arrow-right me-2"></i>Đăng xuất</a>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .topbar { min-height: 52px; }
    .index-chip {
      display: inline-flex; align-items: center; gap: 6px; font-size: 0.75rem;
      background: var(--ip-surface-alt); padding: 4px 10px; border-radius: 6px;
    }
    .index-name { font-weight: 600; color: var(--ip-text-muted); }
    .index-value { font-weight: 600; }
    .badge-dot {
      position: absolute; top: -4px; right: -6px; background: var(--vn-red); color: white;
      font-size: 0.6rem; font-weight: 700; width: 16px; height: 16px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
    }
    .user-menu {
      display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 4px 8px;
      border-radius: 8px; position: relative;
      &:hover { background: var(--ip-surface-alt); }
    }
    .user-avatar {
      width: 32px; height: 32px; border-radius: 8px; background: var(--ip-primary);
      color: white; display: flex; align-items: center; justify-content: center;
      font-weight: 600; font-size: 0.85rem;
    }
    .user-name { display: block; font-size: 0.8rem; font-weight: 500; }
    .user-role { display: block; font-size: 0.65rem; color: var(--ip-text-muted); }
    .user-dropdown {
      position: absolute; top: 52px; right: 16px; background: white; border-radius: 8px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.12); padding: 8px; min-width: 180px; z-index: 1001;
    }
    .dropdown-item {
      display: block; padding: 8px 12px; font-size: 0.82rem; border-radius: 6px;
      text-decoration: none; color: var(--ip-text); cursor: pointer;
      &:hover { background: var(--ip-surface-alt); }
    }
  `]
})
export class HeaderComponent {
  auth = inject(AuthService);
  alertService = inject(AlertService);
  market = inject(MarketService);
  showUserMenu = false;

  toggleSidebar(): void {
    document.querySelector('.sidebar-wrapper')?.classList.toggle('show');
  }
}
