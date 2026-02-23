import { Component, inject, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarketService } from '../../../core/services/market.service';

@Component({
  selector: 'app-price-chart', standalone: true, imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div><h5 class="fw-bold mb-1">Biểu đồ Kỹ thuật</h5><p class="text-muted mb-0" style="font-size:0.82rem">Apache ECharts · Candlestick + Indicators</p></div>
      <div class="d-flex gap-2">
        <select class="form-select form-select-sm ip-input" [(ngModel)]="symbol" (ngModelChange)="updateChart()" style="width:140px">
          @for (q of market.quotes(); track q.symbol) { <option [value]="q.symbol">{{q.symbol}}</option> }
        </select>
        <div class="ip-tabs">
          @for (tf of timeframes; track tf) { <button class="ip-tab" [class.active]="interval===tf" (click)="interval=tf;updateChart()">{{tf}}</button> }
        </div>
      </div>
    </div>
    <div class="ip-card p-3 mb-3">
      <div class="d-flex gap-2 mb-2">
        <span class="badge bg-light text-dark" style="cursor:pointer" [class.bg-primary]="showMA" [class.text-white]="showMA" (click)="showMA=!showMA;updateChart()">MA20</span>
        <span class="badge bg-light text-dark" style="cursor:pointer" [class.bg-primary]="showEMA" [class.text-white]="showEMA" (click)="showEMA=!showEMA;updateChart()">EMA9</span>
        <span class="badge bg-light text-dark" style="cursor:pointer" [class.bg-primary]="showBB" [class.text-white]="showBB" (click)="showBB=!showBB;updateChart()">Bollinger</span>
        <span class="badge bg-light text-dark" style="cursor:pointer" [class.bg-primary]="showVol" [class.text-white]="showVol" (click)="showVol=!showVol;updateChart()">Volume</span>
      </div>
      <div id="mainTAChart" style="height:450px"></div>
    </div>
    <div class="row g-3">
      <div class="col-md-6"><div class="ip-card p-3"><h6 class="section-title mb-2"><i class="bi bi-activity"></i>RSI(14)</h6><div id="rsiChart" style="height:150px"></div></div></div>
      <div class="col-md-6"><div class="ip-card p-3"><h6 class="section-title mb-2"><i class="bi bi-graph-down"></i>MACD(12,26,9)</h6><div id="macdChart" style="height:150px"></div></div></div>
    </div>
  `
})
export class PriceChartComponent implements AfterViewInit {
  market = inject(MarketService);
  symbol = 'VIC'; interval = '1D'; timeframes = ['1m','5m','15m','1H','1D','1W','1M'];
  showMA = true; showEMA = false; showBB = false; showVol = true;

  ngAfterViewInit() { setTimeout(() => this.updateChart(), 100); }

  updateChart() {
    const echarts = (window as any)['echarts']; if (!echarts) return;
    const data = this.market.getOHLCV(this.symbol, 60);
    const dates = data.map(d => d.time);
    const ohlc = data.map(d => [d.open, d.close, d.low, d.high]);
    const volumes = data.map(d => d.volume);
    const closes = data.map(d => d.close);

    // MA20
    const ma20 = closes.map((_, i) => { if (i < 19) return null; const s = closes.slice(i-19,i+1); return s.reduce((a,b)=>a+b)/20; });
    // EMA9
    const ema9: (number|null)[] = []; const k = 2/10;
    closes.forEach((c, i) => { if (i === 0) ema9.push(c); else ema9.push(c * k + (ema9[i-1]||c) * (1-k)); });
    // RSI
    const rsi: (number|null)[] = [null]; let avgGain = 0, avgLoss = 0;
    for (let i = 1; i < closes.length; i++) { const d = closes[i]-closes[i-1]; if (i<=14) { if(d>0) avgGain+=d; else avgLoss-=d; if(i===14){avgGain/=14;avgLoss/=14;rsi.push(100-100/(1+avgGain/Math.max(avgLoss,0.001)));} else rsi.push(null);} else { if(d>0){avgGain=(avgGain*13+d)/14;avgLoss=avgLoss*13/14;} else {avgGain=avgGain*13/14;avgLoss=(avgLoss*13-d)/14;} rsi.push(100-100/(1+avgGain/Math.max(avgLoss,0.001)));}}

    const series: any[] = [{ name: this.symbol, type: 'candlestick', data: ohlc, itemStyle: { color: '#00C853', color0: '#F44336', borderColor: '#00C853', borderColor0: '#F44336' } }];
    if (this.showMA) series.push({ name: 'MA20', type: 'line', data: ma20, smooth: true, lineStyle: { color: '#FF9800', width: 1.5 }, symbol: 'none' });
    if (this.showEMA) series.push({ name: 'EMA9', type: 'line', data: ema9, smooth: true, lineStyle: { color: '#00B4D8', width: 1.5 }, symbol: 'none' });

    const mainChart = echarts.init(document.getElementById('mainTAChart'));
    const grids: any[] = [{ left: 60, right: 30, top: 30, height: this.showVol ? '55%' : '80%' }];
    const xAxes: any[] = [{ data: dates, axisLabel: { fontSize: 9 }, gridIndex: 0 }];
    const yAxes: any[] = [{ scale: true, splitLine: { lineStyle: { type: 'dashed' } }, gridIndex: 0 }];

    if (this.showVol) {
      grids.push({ left: 60, right: 30, top: '72%', height: '18%' });
      xAxes.push({ data: dates, gridIndex: 1, axisLabel: { show: false } });
      yAxes.push({ gridIndex: 1, splitLine: { show: false }, axisLabel: { show: false } });
      series.push({ name: 'Volume', type: 'bar', data: volumes, xAxisIndex: 1, yAxisIndex: 1, itemStyle: { color: (p:any) => ohlc[p.dataIndex][1] >= ohlc[p.dataIndex][0] ? 'rgba(0,200,83,0.4)' : 'rgba(244,67,54,0.4)' } });
    }

    mainChart.setOption({ grid: grids, xAxis: xAxes, yAxis: yAxes, series, tooltip: { trigger: 'axis' }, dataZoom: [{ type: 'inside', xAxisIndex: this.showVol ? [0,1] : [0] }] }, true);

    // RSI Chart
    const rsiC = echarts.init(document.getElementById('rsiChart'));
    rsiC.setOption({ grid: { left: 50, right: 20, top: 10, bottom: 20 }, xAxis: { data: dates, axisLabel: { fontSize: 8, interval: 10 } }, yAxis: { min: 0, max: 100, splitLine: { lineStyle: { type: 'dashed' } } }, series: [{ type: 'line', data: rsi, smooth: true, lineStyle: { color: '#AA00FF', width: 1.5 }, symbol: 'none', markLine: { silent: true, data: [{ yAxis: 70, lineStyle: { color: '#F44336' } }, { yAxis: 30, lineStyle: { color: '#00C853' } }] } }], tooltip: { trigger: 'axis' } }, true);

    // MACD placeholder
    const macdC = echarts.init(document.getElementById('macdChart'));
    const macdLine = ema9.map((e, i) => e && ma20[i] ? (e as number) - (ma20[i] as number) : null);
    macdC.setOption({ grid: { left: 50, right: 20, top: 10, bottom: 20 }, xAxis: { data: dates, axisLabel: { fontSize: 8, interval: 10 } }, yAxis: { splitLine: { lineStyle: { type: 'dashed' } } }, series: [{ type: 'bar', data: macdLine, itemStyle: { color: (p:any) => (p.value||0) >= 0 ? '#00C853' : '#F44336' } }], tooltip: { trigger: 'axis' } }, true);

    window.addEventListener('resize', () => { mainChart.resize(); rsiC.resize(); macdC.resize(); });
  }
}
