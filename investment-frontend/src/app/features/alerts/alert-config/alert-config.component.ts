import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../core/services/alert.service';
import { MarketService } from '../../../core/services/market.service';

@Component({
  selector: 'app-alert-config', standalone: true, imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between mb-4">
      <div><h5 class="fw-bold mb-1">Cài đặt Cảnh báo</h5><p class="text-muted mb-0" style="font-size:0.82rem">WebSocket real-time · In-app / Email / Telegram</p></div>
      <button class="btn btn-ip-accent" (click)="showForm=!showForm"><i class="bi bi-plus-lg me-1"></i>Thêm cảnh báo</button>
    </div>

    @if (showForm) {
      <div class="ip-card p-4 mb-3">
        <h6 class="section-title mb-3"><i class="bi bi-bell-fill"></i>Tạo cảnh báo mới</h6>
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label fw-medium" style="font-size:0.82rem">Loại cảnh báo</label>
            <select class="form-select ip-input" [(ngModel)]="newAlert.type">
              <option value="price">Cảnh báo giá</option>
              <option value="price_change_pct">% thay đổi giá</option>
              <option value="volume_spike">Khối lượng đột biến</option>
              <option value="pnl_floating">P&L floating mã</option>
              <option value="pnl_portfolio">P&L danh mục</option>
              <option value="technical">Chỉ số kỹ thuật</option>
              <option value="pattern">Nhận dạng Pattern</option>
              <option value="corporate_event">Sự kiện cổ phiếu</option>
              <option value="vn_index">VN-Index</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label fw-medium" style="font-size:0.82rem">Mã CK (nếu có)</label>
            <select class="form-select ip-input" [(ngModel)]="newAlert.symbol">
              <option value="">Toàn danh mục</option>
              @for (q of market.quotes(); track q.symbol) { <option [value]="q.symbol">{{q.symbol}}</option> }
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label fw-medium" style="font-size:0.82rem">Điều kiện</label>
            <select class="form-select ip-input" [(ngModel)]="newAlert.condition">
              <option value="above">Vượt trên (>=)</option>
              <option value="below">Dưới ngưỡng (<=)</option>
              <option value="cross_up">Cắt lên</option>
              <option value="cross_down">Cắt xuống</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label fw-medium" style="font-size:0.82rem">Ngưỡng</label>
            <input type="number" class="form-control ip-input" [(ngModel)]="newAlert.threshold" placeholder="50000">
          </div>
          <div class="col-md-4">
            <label class="form-label fw-medium" style="font-size:0.82rem">Mức độ ưu tiên</label>
            <select class="form-select ip-input" [(ngModel)]="newAlert.severity">
              <option value="high">Cao</option><option value="medium">Trung bình</option><option value="low">Thấp</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label fw-medium" style="font-size:0.82rem">Kênh thông báo</label>
            <div class="d-flex gap-3 mt-1">
              <label class="form-check"><input type="checkbox" class="form-check-input" [(ngModel)]="channels.inapp"><span class="form-check-label" style="font-size:0.82rem">In-app</span></label>
              <label class="form-check"><input type="checkbox" class="form-check-input" [(ngModel)]="channels.email"><span class="form-check-label" style="font-size:0.82rem">Email</span></label>
              <label class="form-check"><input type="checkbox" class="form-check-input" [(ngModel)]="channels.telegram"><span class="form-check-label" style="font-size:0.82rem">Telegram</span></label>
            </div>
          </div>
        </div>
        <div class="mt-3 d-flex gap-2">
          <button class="btn btn-ip-accent" (click)="createAlert()"><i class="bi bi-check-lg me-1"></i>Tạo cảnh báo</button>
          <button class="btn btn-ip-outline" (click)="showForm=false">Hủy</button>
        </div>
      </div>
    }

    <div class="ip-card p-3">
      <h6 class="section-title mb-3"><i class="bi bi-list-check"></i>Danh sách cảnh báo ({{alertService.configs().length}})</h6>
      <table class="ip-table"><thead><tr><th>Mã CK</th><th>Loại</th><th>Điều kiện</th><th>Ngưỡng</th><th>Mức độ</th><th>Kênh</th><th>Trạng thái</th><th></th></tr></thead>
      <tbody>
        @for(a of alertService.configs(); track a.id) {
          <tr>
            <td class="fw-bold">{{a.symbol || 'Danh mục'}}</td>
            <td><span class="badge bg-light text-dark" style="font-size:0.68rem">{{typeLabel(a.type)}}</span></td>
            <td style="font-size:0.82rem">{{conditionLabel(a.condition)}}</td>
            <td class="fw-bold mono">{{a.threshold}}</td>
            <td><span class="badge" [ngClass]="{'bg-danger':a.severity==='high','bg-warning text-dark':a.severity==='medium','bg-info':a.severity==='low'}" style="font-size:0.6rem">{{a.severity|uppercase}}</span></td>
            <td>@for(c of a.channel; track c){<span class="badge bg-secondary me-1" style="font-size:0.58rem">{{c}}</span>}</td>
            <td><div class="form-check form-switch"><input class="form-check-input" type="checkbox" [checked]="a.isActive" (change)="alertService.toggleAlert(a.id)"></div></td>
            <td><button class="btn btn-sm text-danger border-0"><i class="bi bi-trash"></i></button></td>
          </tr>
        }
      </tbody></table>
    </div>
  `
})
export class AlertConfigComponent {
  alertService = inject(AlertService);
  market = inject(MarketService);
  showForm = false;
  newAlert = { type: 'price', symbol: '', condition: 'above', threshold: 0, severity: 'medium' };
  channels = { inapp: true, email: false, telegram: false };

  typeLabel(t: string) { return ({ price: 'Giá', price_change_pct: '% Giá', volume_spike: 'KL đột biến', pnl_floating: 'P&L mã', pnl_portfolio: 'P&L DM', technical: 'Kỹ thuật', pattern: 'Pattern', corporate_event: 'Sự kiện', vn_index: 'VN-Index' } as any)[t] || t; }
  conditionLabel(c: string) { return ({ above: 'Vượt trên ≥', below: 'Dưới ≤', cross_up: 'Cắt lên', cross_down: 'Cắt xuống' } as any)[c] || c; }

  createAlert() {
    const ch = [];
    if (this.channels.inapp) ch.push('in_app');
    if (this.channels.email) ch.push('email');
    if (this.channels.telegram) ch.push('telegram');
    // Mock add to list
    this.showForm = false;
  }
}
