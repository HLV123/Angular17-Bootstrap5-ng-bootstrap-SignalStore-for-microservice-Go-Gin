import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarketService } from '../../../core/services/market.service';

@Component({
  selector: 'app-watchlist', standalone: true, imports: [CommonModule],
  template: `
    <h5 class="fw-bold mb-1">Watchlist</h5>
    <p class="text-muted mb-4" style="font-size:0.82rem">Theo dõi nhanh các mã quan tâm · WebSocket real-time</p>
    <div class="row g-3">
      <div class="col-md-3">
        <div class="ip-card p-3">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h6 class="fw-semibold mb-0">Danh sách</h6>
            <button class="btn btn-sm btn-ip-accent"><i class="bi bi-plus"></i></button>
          </div>
          @for (w of market.watchlists(); track w.id) {
            <div class="p-2 mb-1 rounded-2 cursor-pointer" [style.background]="selectedWL===w.id?'var(--ip-accent-glow)':'transparent'" (click)="selectedWL=w.id" style="cursor:pointer">
              <div class="fw-medium" style="font-size:0.85rem">{{w.name}}</div>
              <div style="font-size:0.72rem;color:var(--ip-text-muted)">{{w.symbols.length}} mã</div>
            </div>
          }
        </div>
      </div>
      <div class="col-md-9">
        <div class="ip-card p-3">
          <div class="d-flex justify-content-between mb-3">
            <h6 class="section-title mb-0"><i class="bi bi-star-fill"></i>{{currentWL?.name}}</h6>
            <span class="ws-indicator">Real-time</span>
          </div>
          <table class="ip-table">
            <thead><tr><th>Mã</th><th>Tên</th><th class="text-end">Giá</th><th class="text-end">±%</th><th class="text-end">KL</th><th class="text-end">Cao</th><th class="text-end">Thấp</th><th></th></tr></thead>
            <tbody>
              @for (q of watchlistQuotes; track q.symbol) {
                <tr>
                  <td class="fw-bold">{{q.symbol}}</td><td style="font-size:0.78rem">{{q.companyName}}</td>
                  <td class="text-end fw-bold" [class]="q.changePct>0?'text-vn-green':q.changePct<0?'text-vn-red':''">{{(q.currentPrice/1000)|number:'1.1-1'}}</td>
                  <td class="text-end" [class]="q.changePct>=0?'positive':'negative'">{{q.changePct>=0?'+':''}}{{q.changePct|number:'1.2-2'}}%</td>
                  <td class="text-end">{{q.volume >= 1e6 ? (q.volume/1e6).toFixed(1)+'M' : (q.volume/1e3).toFixed(0)+'K'}}</td>
                  <td class="text-end">{{(q.high/1000)|number:'1.1-1'}}</td><td class="text-end">{{(q.low/1000)|number:'1.1-1'}}</td>
                  <td><button class="btn btn-sm text-danger border-0"><i class="bi bi-x-lg"></i></button></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class WatchlistComponent {
  market = inject(MarketService);
  selectedWL = 'w1';
  get currentWL() { return this.market.watchlists().find(w => w.id === this.selectedWL); }
  get watchlistQuotes() { return this.market.getQuotesBySymbols(this.currentWL?.symbols || []); }
}
