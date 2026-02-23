import { Component, inject, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarketService } from '../../../core/services/market.service';
import { MOCK_TRADE_HISTORY } from '../../../core/mock-data';

@Component({
  selector: 'app-order-book', standalone: true, imports: [CommonModule, FormsModule],
  template: `
    <h5 class="fw-bold mb-1">Sổ lệnh chuyên sâu (Order Book / Market Depth)</h5>
    <p class="text-muted mb-4" style="font-size:0.82rem">Top 10 giá mua/bán · Lịch sử khớp lệnh · Biểu đồ Cumulative Depth · WebSocket: wss://api/ws/orderbook/&#123;symbol&#125;</p>
    <div class="row g-3">
      <div class="col-md-3">
        <div class="ip-card p-3">
          <label class="stat-label mb-2">Chọn mã CK</label>
          <select class="form-select ip-input" [(ngModel)]="selectedSymbol" (ngModelChange)="onSymbolChange()">
            @for (q of market.quotes(); track q.symbol) { <option [value]="q.symbol">{{q.symbol}} - {{q.companyName}}</option> }
          </select>
          @if (quote) {
            <div class="mt-3">
              <div class="d-flex justify-content-between mb-1"><span class="stat-label">Giá hiện tại</span><span class="fw-bold" style="font-size:1.3rem" [class]="quote.changePct>0?'text-vn-green':'text-vn-red'">{{(quote.currentPrice/1000)|number:'1.1-1'}}</span></div>
              <div class="d-flex justify-content-between mb-1"><span class="stat-label">±</span><span [class]="quote.changePct>=0?'positive':'negative'">{{quote.changePct>=0?'+':''}}{{quote.changePct|number:'1.2-2'}}% ({{quote.change>=0?'+':''}}{{(quote.change/1000)|number:'1.1-1'}})</span></div>
              <div class="d-flex justify-content-between mb-1"><span class="stat-label">Tham chiếu</span><span class="text-vn-ref">{{(quote.refPrice/1000)|number:'1.1-1'}}</span></div>
              <div class="d-flex justify-content-between mb-1"><span class="stat-label">Trần</span><span class="text-vn-gold">{{(quote.ceilingPrice/1000)|number:'1.1-1'}}</span></div>
              <div class="d-flex justify-content-between mb-1"><span class="stat-label">Sàn</span><span class="text-vn-purple">{{(quote.floorPrice/1000)|number:'1.1-1'}}</span></div>
              <hr class="my-2">
              <div class="d-flex justify-content-between mb-1"><span class="stat-label">KL khớp</span><span class="mono">{{formatVol(quote.volume)}}</span></div>
              <div class="d-flex justify-content-between mb-1"><span class="stat-label">Cao nhất</span><span class="mono">{{(quote.high/1000)|number:'1.1-1'}}</span></div>
              <div class="d-flex justify-content-between"><span class="stat-label">Thấp nhất</span><span class="mono">{{(quote.low/1000)|number:'1.1-1'}}</span></div>
            </div>
          }
        </div>
      </div>
      <div class="col-md-5">
        @if (quote) {
          <div class="ip-card p-3 mb-3">
            <h6 class="section-title mb-3"><i class="bi bi-book-half"></i>{{selectedSymbol}} · Top 10 Mua/Bán</h6>
            <div class="row">
              <div class="col-6">
                <div class="d-flex justify-content-between mb-2" style="font-size:0.72rem;font-weight:600"><span class="text-vn-green">BÊN MUA (BID)</span><span>KL</span></div>
                @for (b of bidLevels; track $index) {
                  <div class="d-flex justify-content-between py-1 px-2 mb-1" style="border-radius:4px;position:relative;overflow:hidden">
                    <div style="position:absolute;left:0;top:0;bottom:0;background:rgba(0,200,83,0.08);z-index:0" [style.width.%]="b.pct"></div>
                    <span class="fw-bold text-vn-green position-relative" style="font-size:0.82rem">{{(b.price/1000)|number:'1.1-1'}}</span>
                    <span class="position-relative mono" style="font-size:0.82rem">{{formatVol(b.vol)}}</span>
                  </div>
                }
              </div>
              <div class="col-6">
                <div class="d-flex justify-content-between mb-2" style="font-size:0.72rem;font-weight:600"><span class="text-vn-red">BÊN BÁN (ASK)</span><span>KL</span></div>
                @for (a of askLevels; track $index) {
                  <div class="d-flex justify-content-between py-1 px-2 mb-1" style="border-radius:4px;position:relative;overflow:hidden">
                    <div style="position:absolute;right:0;top:0;bottom:0;background:rgba(244,67,54,0.08);z-index:0" [style.width.%]="a.pct"></div>
                    <span class="fw-bold text-vn-red position-relative" style="font-size:0.82rem">{{(a.price/1000)|number:'1.1-1'}}</span>
                    <span class="position-relative mono" style="font-size:0.82rem">{{formatVol(a.vol)}}</span>
                  </div>
                }
              </div>
            </div>
            <hr class="my-2">
            <div class="d-flex justify-content-between align-items-center" style="font-size:0.8rem">
              <span>Tổng Mua: <strong class="text-vn-green">{{formatVol(totalBid)}}</strong></span>
              <div class="progress mx-2 flex-fill" style="height:8px;border-radius:4px">
                <div class="progress-bar" style="background:var(--vn-green)" [style.width.%]="bidPct"></div>
                <div class="progress-bar" style="background:var(--vn-red)" [style.width.%]="100-bidPct"></div>
              </div>
              <span>Tổng Bán: <strong class="text-vn-red">{{formatVol(totalAsk)}}</strong></span>
            </div>
            <div class="text-center mt-1" style="font-size:0.72rem">
              <span class="fw-bold" [class]="bidPct>50?'text-vn-green':'text-vn-red'">
                {{bidPct>50?'MUA mạnh hơn ('+bidPct.toFixed(0)+'%)':'BÁN mạnh hơn ('+(100-bidPct).toFixed(0)+'%)'}}
              </span>
            </div>
          </div>
          <div class="ip-card p-3">
            <h6 class="section-title mb-2"><i class="bi bi-graph-down-arrow"></i>Cumulative Depth Chart</h6>
            <div id="depthChart" style="height:200px"></div>
          </div>
        }
      </div>
      <div class="col-md-4">
        <div class="ip-card p-3">
          <h6 class="section-title mb-3"><i class="bi bi-clock-history"></i>Lịch sử khớp lệnh (20 gần nhất)</h6>
          <div style="max-height:500px;overflow-y:auto">
            <table class="ip-table" style="font-size:0.78rem">
              <thead><tr><th>Thời gian</th><th class="text-end">Giá</th><th class="text-end">KL</th><th></th></tr></thead>
              <tbody>
                @for (t of tradeHistory; track $index) {
                  <tr>
                    <td class="mono">{{t.time}}</td>
                    <td class="text-end mono fw-bold" [class]="t.side==='buy'?'text-vn-green':'text-vn-red'">{{(t.price/1000)|number:'1.1-1'}}</td>
                    <td class="text-end mono">{{formatVol(t.volume)}}</td>
                    <td><i class="bi" [ngClass]="t.side==='buy'?'bi-arrow-up text-vn-green':'bi-arrow-down text-vn-red'" style="font-size:0.65rem"></i></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class OrderBookComponent implements AfterViewInit {
  market = inject(MarketService);
  selectedSymbol = 'VIC';
  tradeHistory = MOCK_TRADE_HISTORY;
  bidLevels: any[] = [];
  askLevels: any[] = [];
  totalBid = 0; totalAsk = 0; bidPct = 50;

  get quote() { return this.market.getQuote(this.selectedSymbol); }

  ngAfterViewInit() { setTimeout(() => this.onSymbolChange(), 100); }

  onSymbolChange() {
    const q = this.quote; if (!q) return;
    // Generate 10 bid/ask levels from the 3 we have
    const maxVol = 150000;
    this.bidLevels = [];
    this.askLevels = [];
    for (let i = 0; i < 10; i++) {
      const bp = (q.bid[Math.min(i, 2)] || q.bid[2]);
      const ap = (q.ask[Math.min(i, 2)] || q.ask[2]);
      const bv = bp[1] * (1 + Math.random() * 0.5) * (i < 3 ? 1 : 0.7);
      const av = ap[1] * (1 + Math.random() * 0.5) * (i < 3 ? 1 : 0.7);
      this.bidLevels.push({ price: bp[0] - i * 100, vol: Math.round(bv), pct: (bv / maxVol) * 100 });
      this.askLevels.push({ price: ap[0] + i * 100, vol: Math.round(av), pct: (av / maxVol) * 100 });
    }
    this.totalBid = this.bidLevels.reduce((s: number, b: any) => s + b.vol, 0);
    this.totalAsk = this.askLevels.reduce((s: number, a: any) => s + a.vol, 0);
    this.bidPct = this.totalBid / (this.totalBid + this.totalAsk) * 100;
    this.renderDepthChart();
  }

  renderDepthChart() {
    const echarts = (window as any)['echarts']; if (!echarts) return;
    const el = document.getElementById('depthChart'); if (!el) return;
    const c = echarts.init(el);
    // Cumulative bid/ask
    const bidPrices = this.bidLevels.map((b: any) => (b.price / 1000).toFixed(1)).reverse();
    const askPrices = this.askLevels.map((a: any) => (a.price / 1000).toFixed(1));
    const prices = [...bidPrices, ...askPrices];
    let cumBid = 0;
    const bidData = this.bidLevels.map((b: any) => { cumBid += b.vol; return cumBid; }).reverse();
    let cumAsk = 0;
    const askData = this.askLevels.map((a: any) => { cumAsk += a.vol; return cumAsk; });
    const allBid = [...bidData, ...new Array(askPrices.length).fill(null)];
    const allAsk = [...new Array(bidPrices.length).fill(null), ...askData];
    c.setOption({
      grid: { left: 50, right: 20, top: 10, bottom: 25 },
      xAxis: { data: prices, axisLabel: { fontSize: 8 } },
      yAxis: { splitLine: { lineStyle: { type: 'dashed' } }, axisLabel: { fontSize: 8, formatter: (v: number) => (v / 1000).toFixed(0) + 'K' } },
      series: [
        { type: 'line', data: allBid, areaStyle: { color: 'rgba(0,200,83,0.15)' }, lineStyle: { color: '#00C853' }, symbol: 'none' },
        { type: 'line', data: allAsk, areaStyle: { color: 'rgba(244,67,54,0.15)' }, lineStyle: { color: '#F44336' }, symbol: 'none' }
      ],
      tooltip: { trigger: 'axis' }
    }, true);
    window.addEventListener('resize', () => c.resize());
  }

  formatVol(v: number): string { return v >= 1e6 ? (v / 1e6).toFixed(1) + 'M' : v >= 1e3 ? (v / 1e3).toFixed(0) + 'K' : v + ''; }
}
