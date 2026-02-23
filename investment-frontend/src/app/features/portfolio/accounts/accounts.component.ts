import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PortfolioService } from '../../../core/services/portfolio.service';
import { VndPipe } from '../../../shared/pipes/vnd.pipe';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, RouterModule, VndPipe],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h5 class="fw-bold mb-1">Tài khoản Đầu tư</h5>
        <p class="text-muted mb-0" style="font-size:0.82rem">Quản lý các tài khoản chứng khoán trên nhiều sàn</p>
      </div>
      <button class="btn btn-ip-accent"><i class="bi bi-plus-lg me-1"></i>Thêm tài khoản</button>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-md-4">
        <div class="ip-card p-3 text-center">
          <div class="stat-label">Tổng NAV</div>
          <div class="stat-value" style="font-size:1.5rem">{{ totalNAV | vnd:'short' }}</div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="ip-card p-3 text-center">
          <div class="stat-label">Tổng P&L Floating</div>
          <div class="stat-value positive" style="font-size:1.5rem">{{ totalPnL | vnd:'million' }}</div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="ip-card p-3 text-center">
          <div class="stat-label">Số tài khoản</div>
          <div class="stat-value" style="font-size:1.5rem">{{ portfolio.accounts().length }}</div>
        </div>
      </div>
    </div>

    <div class="row g-3">
      @for (acc of portfolio.accounts(); track acc.id) {
        <div class="col-lg-4">
          <div class="ip-card p-4">
            <div class="d-flex justify-content-between mb-3">
              <div>
                <h6 class="fw-bold mb-1">{{ acc.name }}</h6>
                <span class="badge" [ngClass]="{'bg-primary':acc.type==='holding','bg-warning text-dark':acc.type==='trading','bg-secondary':acc.type==='paper'}">
                  {{ acc.type === 'holding' ? 'Dài hạn' : acc.type === 'trading' ? 'Trading' : 'Paper' }}
                </span>
              </div>
              <span style="font-size:0.78rem;color:var(--ip-text-muted)">{{ acc.broker }}</span>
            </div>
            @if (getSummary(acc.id); as s) {
              <div class="d-flex justify-content-between mb-2" style="font-size:0.85rem">
                <span style="color:var(--ip-text-muted)">NAV</span>
                <span class="fw-bold">{{ s.nav | vnd:'short' }}</span>
              </div>
              <div class="d-flex justify-content-between mb-2" style="font-size:0.85rem">
                <span style="color:var(--ip-text-muted)">P&L Floating</span>
                <span [class]="s.unrealizedPnL >= 0 ? 'positive' : 'negative'">{{ s.unrealizedPnL | vnd:'million' }} ({{ s.unrealizedPnLPct | number:'1.2-2' }}%)</span>
              </div>
              <div class="d-flex justify-content-between mb-2" style="font-size:0.85rem">
                <span style="color:var(--ip-text-muted)">Tiền mặt</span>
                <span>{{ s.cashBalance | vnd:'million' }}</span>
              </div>
              <div class="d-flex justify-content-between" style="font-size:0.85rem">
                <span style="color:var(--ip-text-muted)">P&L hôm nay</span>
                <span [class]="s.dayPnL >= 0 ? 'positive' : 'negative'">{{ s.dayPnL >= 0 ? '+' : '' }}{{ s.dayPnL | vnd:'million' }}</span>
              </div>
            }
            <div class="mt-3 d-flex gap-2">
              <button class="btn btn-sm btn-ip-outline flex-fill" routerLink="/portfolio/holdings">Xem vị thế</button>
              <button class="btn btn-sm btn-ip-outline"><i class="bi bi-pencil"></i></button>
            </div>
          </div>
        </div>
      }
    </div>

    <div class="mt-4 p-3 ip-card" style="font-size:0.78rem;color:var(--ip-text-muted)">
      <i class="bi bi-info-circle me-1"></i>
      API: <code>GET /api/v1/accounts</code> · <code>POST /api/v1/accounts</code> · WebSocket: <code>ws/portfolio</code> push NAV real-time
    </div>
  `
})
export class AccountsComponent {
  portfolio = inject(PortfolioService);
  totalNAV = this.portfolio.getTotalNAV();
  totalPnL = this.portfolio.getTotalUnrealizedPnL();
  getSummary(id: string) { return this.portfolio.getSummaryByAccountId(id); }
}
