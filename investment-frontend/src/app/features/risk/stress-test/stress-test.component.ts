import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MOCK_STRESS_SCENARIOS, MOCK_RISK_LIMITS } from '../../../core/mock-data';
import { VndPipe } from '../../../shared/pipes/vnd.pipe';

@Component({
  selector: 'app-stress-test', standalone: true, imports: [CommonModule, FormsModule, VndPipe],
  template: `
    <h5 class="fw-bold mb-1">Stress Testing & Giới hạn Rủi ro</h5>
    <p class="text-muted mb-4" style="font-size:0.82rem">Kịch bản thị trường · Cài đặt stop loss / tỉ trọng max / VaR ngưỡng</p>

    <div class="ip-tabs mb-3">
      <button class="ip-tab" [class.active]="tab==='stress'" (click)="tab='stress'">Stress Testing</button>
      <button class="ip-tab" [class.active]="tab==='limits'" (click)="tab='limits'">Giới hạn Rủi ro</button>
      <button class="ip-tab" [class.active]="tab==='custom'" (click)="tab='custom'">Kịch bản Tùy chỉnh</button>
    </div>

    @if (tab === 'stress') {
      <div class="row g-3">
        @for (s of scenarios; track s.id) {
          <div class="col-md-6">
            <div class="ip-card p-3">
              <div class="d-flex justify-content-between"><h6 class="fw-bold mb-1">{{s.name}}</h6><span class="negative fw-bold">{{s.impact | vnd:'million'}}</span></div>
              <p style="font-size:0.82rem;color:var(--ip-text-muted)" class="mb-2">{{s.description}}</p>
              <div class="progress mb-1" style="height:8px"><div class="progress-bar bg-danger" [style.width.%]="getImpactPct(s.impact)"></div></div>
              <div class="text-end" style="font-size:0.72rem;color:var(--ip-text-muted)">{{getImpactPct(s.impact)|number:'1.1-1'}}% NAV</div>
            </div>
          </div>
        }
      </div>
    }

    @if (tab === 'limits') {
      <div class="ip-card p-3 mb-3">
        <div class="d-flex justify-content-between mb-3">
          <h6 class="section-title mb-0"><i class="bi bi-shield-exclamation"></i>Giới hạn rủi ro đã cài đặt</h6>
          <button class="btn btn-sm btn-ip-accent" (click)="showLimitForm=!showLimitForm"><i class="bi bi-plus me-1"></i>Thêm giới hạn</button>
        </div>
        <table class="ip-table"><thead><tr><th>Loại</th><th>Mã</th><th class="text-end">Ngưỡng</th><th class="text-end">Hiện tại</th><th>Trạng thái</th><th></th></tr></thead>
        <tbody>
          @for (l of limits; track l.id) {
            <tr>
              <td><span class="badge bg-light text-dark">{{limitTypeLabel(l.type)}}</span></td>
              <td class="fw-bold">{{l.symbol || 'Toàn DM'}}</td>
              <td class="text-end mono">{{l.threshold}}{{l.type.includes('pct')||l.type.includes('weight')||l.type.includes('drawdown')||l.type==='stop_loss_portfolio'||l.type==='stop_loss_symbol'||l.type==='max_weight'?'%':''}}</td>
              <td class="text-end" [class]="isBreached(l)?'negative fw-bold':''" >{{l.currentValue}}{{l.type==='var_threshold'?'':'%'}}</td>
              <td>
                @if (isBreached(l)) { <span class="badge bg-danger">BREACH</span> }
                @else { <span class="badge bg-success">OK</span> }
              </td>
              <td><div class="form-check form-switch"><input class="form-check-input" type="checkbox" [checked]="l.isActive" (change)="l.isActive=!l.isActive"></div></td>
            </tr>
          }
        </tbody></table>
      </div>
    }

    @if (tab === 'custom') {
      <div class="ip-card p-4">
        <h6 class="section-title mb-3"><i class="bi bi-sliders"></i>Tạo kịch bản tùy chỉnh</h6>
        <p style="font-size:0.82rem;color:var(--ip-text-muted)" class="mb-3">Định nghĩa % thay đổi giá cho từng mã trong danh mục</p>
        <div class="row g-2 mb-3">
          <div class="col-md-4"><label class="form-label" style="font-size:0.82rem">Tên kịch bản</label><input class="form-control ip-input" [(ngModel)]="customName" placeholder="VD: Bear market Q2"></div>
          <div class="col-md-8"><label class="form-label" style="font-size:0.82rem">Mô tả</label><input class="form-control ip-input" [(ngModel)]="customDesc" placeholder="Mô tả kịch bản"></div>
        </div>
        <table class="ip-table" style="font-size:0.85rem"><thead><tr><th>Mã CK</th><th>Giá hiện tại</th><th>% Thay đổi</th><th>Giá sau stress</th><th>Tác động</th></tr></thead>
        <tbody>
          @for (s of customStocks; track s.symbol) {
            <tr>
              <td class="fw-bold">{{s.symbol}}</td>
              <td class="mono">{{s.price|number}}</td>
              <td><input type="number" class="form-control form-control-sm ip-input" style="width:80px" [(ngModel)]="s.changePct"></td>
              <td class="mono">{{(s.price * (1+s.changePct/100))|number:'1.0-0'}}</td>
              <td class="negative">{{(s.price * s.qty * s.changePct/100) | vnd:'million'}}</td>
            </tr>
          }
        </tbody></table>
        <div class="mt-3 d-flex justify-content-between">
          <span class="fw-bold negative">Tổng tác động: {{totalCustomImpact | vnd:'million'}}</span>
          <button class="btn btn-ip-accent"><i class="bi bi-play-fill me-1"></i>Chạy Stress Test</button>
        </div>
      </div>
    }
  `
})
export class StressTestComponent {
  tab = 'stress';
  scenarios = MOCK_STRESS_SCENARIOS;
  limits = MOCK_RISK_LIMITS;
  showLimitForm = false;
  customName = ''; customDesc = '';
  customStocks = [
    { symbol: 'VIC', price: 45200, qty: 500, changePct: -15 },
    { symbol: 'HPG', price: 28500, qty: 1000, changePct: -20 },
    { symbol: 'VNM', price: 72000, qty: 200, changePct: -10 },
    { symbol: 'FPT', price: 125000, qty: 300, changePct: -12 },
    { symbol: 'MBB', price: 24500, qty: 800, changePct: -18 },
  ];

  get totalCustomImpact() { return this.customStocks.reduce((s, c) => s + c.price * c.qty * c.changePct / 100, 0); }
  getImpactPct(impact: number | undefined) { return Math.min(Math.abs((impact || 0) / 1284000000 * 100), 100); }
  isBreached(l: any) { return l.isActive && Math.abs(l.currentValue) >= Math.abs(l.threshold); }
  limitTypeLabel(t: string) { return ({ stop_loss_portfolio: 'Stop Loss DM', stop_loss_symbol: 'Stop Loss Mã', max_weight: 'Tỉ trọng max', var_threshold: 'VaR ngưỡng', drawdown_threshold: 'Drawdown max', margin_call: 'Margin Call' } as any)[t] || t; }
}
