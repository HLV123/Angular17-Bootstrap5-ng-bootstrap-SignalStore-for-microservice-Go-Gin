import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarketService } from '../../../core/services/market.service';

@Component({
  selector: 'app-screener', standalone: true, imports: [CommonModule],
  template: `
    <h5 class="fw-bold mb-1">Stock Screener · Sàng lọc Cổ phiếu</h5>
    <p class="text-muted mb-4" style="font-size:0.82rem">Lọc cổ phiếu theo tiêu chí cơ bản & kỹ thuật</p>
    <div class="ip-card p-3 mb-3">
      <h6 class="section-title mb-3"><i class="bi bi-funnel-fill"></i>Bộ lọc</h6>
      <div class="d-flex flex-wrap gap-2 mb-3">
        <span class="badge bg-primary p-2">P/E < 15</span>
        <span class="badge bg-primary p-2">ROE > 15%</span>
        <span class="badge bg-primary p-2">KL > 1M</span>
        <span class="badge bg-primary p-2">Sàn: HOSE</span>
        <button class="badge bg-light text-dark p-2 border-0"><i class="bi bi-plus"></i> Thêm điều kiện</button>
      </div>
      <button class="btn btn-ip-accent btn-sm"><i class="bi bi-search me-1"></i>Chạy Screener</button>
    </div>
    <div class="ip-card p-3">
      <div class="d-flex justify-content-between mb-2"><h6 class="section-title mb-0"><i class="bi bi-list-check"></i>Kết quả ({{market.quotes().length}} mã)</h6><button class="btn btn-sm btn-ip-outline"><i class="bi bi-file-earmark-excel me-1"></i>Export</button></div>
      <table class="ip-table"><thead><tr><th>Mã</th><th>Tên</th><th>Sàn</th><th class="text-end">Giá</th><th class="text-end">%</th><th class="text-end">KL</th><th class="text-end">Vốn hóa</th></tr></thead>
      <tbody>
        @for(q of market.quotes(); track q.symbol) {
          <tr><td class="fw-bold">{{q.symbol}}</td><td style="font-size:0.78rem">{{q.companyName}}</td><td><span class="badge bg-light text-dark">{{q.exchange}}</span></td>
          <td class="text-end" [class]="q.changePct>0?'text-vn-green':'text-vn-red'">{{(q.currentPrice/1000)|number:'1.1-1'}}</td>
          <td class="text-end" [class]="q.changePct>=0?'positive':'negative'">{{q.changePct>=0?'+':''}}{{q.changePct|number:'1.2-2'}}%</td>
          <td class="text-end">{{q.volume>=1e6?(q.volume/1e6).toFixed(1)+'M':(q.volume/1e3).toFixed(0)+'K'}}</td>
          <td class="text-end" style="font-size:0.78rem">{{(q.marketCap/1e12)|number:'1.0-0'}}T</td></tr>
        }
      </tbody></table>
    </div>
  `
})
export class ScreenerComponent { market = inject(MarketService); }
