import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PortfolioService } from '../../../core/services/portfolio.service';
import { VndPipe } from '../../../shared/pipes/vnd.pipe';

@Component({
  selector: 'app-holdings',
  standalone: true,
  imports: [CommonModule, FormsModule, VndPipe],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h5 class="fw-bold mb-1">Danh mục Vị thế (Holdings)</h5>
        <p class="text-muted mb-0" style="font-size:0.82rem">Theo dõi tất cả vị thế đang nắm giữ · WAVG cost method</p>
      </div>
      <div class="d-flex gap-2">
        <select class="form-select form-select-sm ip-input" [(ngModel)]="selectedAccount" (ngModelChange)="filterHoldings()">
          @for (acc of portfolio.accounts(); track acc.id) {
            <option [value]="acc.id">{{ acc.name }}</option>
          }
          <option value="all">Tất cả tài khoản</option>
        </select>
        <button class="btn btn-sm btn-ip-outline"><i class="bi bi-file-earmark-excel me-1"></i>Export</button>
      </div>
    </div>

    <div class="ip-card p-3 mb-3">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div class="ip-tabs">
          <button class="ip-tab" [class.active]="groupBy==='none'" (click)="groupBy='none'">Danh sách</button>
          <button class="ip-tab" [class.active]="groupBy==='sector'" (click)="groupBy='sector'">Theo ngành</button>
          <button class="ip-tab" [class.active]="groupBy==='type'" (click)="groupBy='type'">Theo loại</button>
        </div>
        <span class="ws-indicator">Real-time</span>
      </div>

      <div class="table-responsive">
        <table class="ip-table">
          <thead>
            <tr>
              <th>Mã CK</th><th>Tên</th><th>Sàn</th><th class="text-end">SL</th>
              <th class="text-end">Giá vốn TB</th><th class="text-end">Giá hiện tại</th>
              <th class="text-end">GT Thị trường</th><th class="text-end">Lãi/Lỗ</th>
              <th class="text-end">%</th><th class="text-end">Phiên nay</th><th class="text-end">Tỉ trọng</th>
            </tr>
          </thead>
          <tbody>
            @for (h of filteredHoldings; track h.id) {
              <tr>
                <td><span class="fw-bold">{{ h.symbol }}</span></td>
                <td style="font-size:0.78rem;max-width:120px" class="text-truncate">{{ h.companyName }}</td>
                <td><span class="badge bg-light text-dark" style="font-size:0.65rem">{{ h.exchange }}</span></td>
                <td class="text-end mono">{{ h.quantity | number }}</td>
                <td class="text-end mono">{{ h.avgCost | number }}</td>
                <td class="text-end mono fw-semibold" [class]="h.dayChangePct > 0 ? 'text-vn-green' : h.dayChangePct < 0 ? 'text-vn-red' : ''">
                  {{ h.currentPrice | number }}
                </td>
                <td class="text-end mono">{{ h.marketValue | vnd:'million' }}</td>
                <td class="text-end" [class]="h.unrealizedPnL >= 0 ? 'positive' : 'negative'">{{ h.unrealizedPnL | vnd:'million' }}</td>
                <td class="text-end" [class]="h.unrealizedPnLPct >= 0 ? 'positive' : 'negative'">
                  {{ h.unrealizedPnLPct >= 0 ? '+' : '' }}{{ h.unrealizedPnLPct | number:'1.2-2' }}%
                </td>
                <td class="text-end" [class]="h.dayChangePct >= 0 ? 'text-vn-green' : 'text-vn-red'">
                  {{ h.dayChangePct >= 0 ? '+' : '' }}{{ h.dayChangePct | number:'1.2-2' }}%
                </td>
                <td class="text-end">{{ h.weight | number:'1.1-1' }}%</td>
              </tr>
            }
          </tbody>
          <tfoot>
            <tr style="font-weight:600;background:#F8FAFC">
              <td colspan="6">Tổng cộng</td>
              <td class="text-end">{{ totalMarketValue | vnd:'short' }}</td>
              <td class="text-end" [class]="totalPnL >= 0 ? 'positive' : 'negative'">{{ totalPnL | vnd:'million' }}</td>
              <td class="text-end" [class]="totalPnLPct >= 0 ? 'positive' : 'negative'">{{ totalPnLPct >= 0 ? '+' : '' }}{{ totalPnLPct | number:'1.2-2' }}%</td>
              <td colspan="2"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <div class="ip-card p-3" style="font-size:0.78rem;color:var(--ip-text-muted)">
      <i class="bi bi-info-circle me-1"></i>
      Giá vốn TB (WAVG) = Tổng(Giá mua × SL) / Tổng SL · API: <code>GET /api/v1/accounts/&#123;id&#125;/holdings</code> · gRPC: <code>PortfolioService.GetPositions()</code>
    </div>
  `
})
export class HoldingsComponent {
  portfolio = inject(PortfolioService);
  selectedAccount = 'acc1';
  groupBy = 'none';
  filteredHoldings = this.portfolio.getHoldingsByAccountId('acc1');

  get totalMarketValue() { return this.filteredHoldings.reduce((s, h) => s + h.marketValue, 0); }
  get totalPnL() { return this.filteredHoldings.reduce((s, h) => s + h.unrealizedPnL, 0); }
  get totalPnLPct() { const cost = this.filteredHoldings.reduce((s, h) => s + h.avgCost * h.quantity, 0); return cost > 0 ? (this.totalPnL / cost) * 100 : 0; }

  filterHoldings(): void {
    this.filteredHoldings = this.selectedAccount === 'all'
      ? this.portfolio.holdings()
      : this.portfolio.getHoldingsByAccountId(this.selectedAccount);
  }
}
