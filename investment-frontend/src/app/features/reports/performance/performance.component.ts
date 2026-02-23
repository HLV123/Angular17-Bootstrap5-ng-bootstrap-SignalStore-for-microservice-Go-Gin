import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MOCK_PERFORMANCE, MOCK_PNL_BY_PERIOD, MOCK_ATTRIBUTION } from '../../../core/mock-data';
import { VndPipe } from '../../../shared/pipes/vnd.pipe';

@Component({
  selector: 'app-performance', standalone: true, imports: [CommonModule, VndPipe],
  template: `
    <h5 class="fw-bold mb-1">Báo cáo Hiệu suất Đầu tư</h5>
    <p class="text-muted mb-4" style="font-size:0.82rem">P&L theo kỳ · Attribution Analysis · So sánh Benchmark · Export Tableau/Power BI</p>

    <div class="row g-3 mb-4">
      <div class="col-md-2"><div class="ip-card p-3 text-center"><div class="stat-label">Tổng lợi nhuận</div><div class="stat-value positive">+{{p.totalReturn}}%</div></div></div>
      <div class="col-md-2"><div class="ip-card p-3 text-center"><div class="stat-label">CAGR</div><div class="stat-value">{{p.annualizedReturn}}%</div></div></div>
      <div class="col-md-2"><div class="ip-card p-3 text-center"><div class="stat-label">Alpha</div><div class="stat-value positive">+{{p.alpha}}%</div></div></div>
      <div class="col-md-2"><div class="ip-card p-3 text-center"><div class="stat-label">Sharpe</div><div class="stat-value">{{p.sharpeRatio}}</div></div></div>
      <div class="col-md-2"><div class="ip-card p-3 text-center"><div class="stat-label">Max DD</div><div class="stat-value negative">{{p.maxDrawdown}}%</div></div></div>
      <div class="col-md-2"><div class="ip-card p-3 text-center"><div class="stat-label">Win Rate</div><div class="stat-value">{{p.winRate}}%</div></div></div>
    </div>

    <div class="ip-card p-3 mb-3">
      <div class="ip-tabs mb-3">
        <button class="ip-tab" [class.active]="tab==='pnl'" (click)="tab='pnl'">P&L theo kỳ</button>
        <button class="ip-tab" [class.active]="tab==='attr'" (click)="tab='attr'">Attribution Analysis</button>
        <button class="ip-tab" [class.active]="tab==='benchmark'" (click)="tab='benchmark'">So sánh Benchmark</button>
        <button class="ip-tab" [class.active]="tab==='stats'" (click)="tab='stats'">Thống kê GD</button>
      </div>

      @if (tab === 'pnl') {
        <h6 class="section-title mb-3"><i class="bi bi-calendar3"></i>Báo cáo P&L theo tháng</h6>
        <table class="ip-table">
          <thead><tr><th>Kỳ</th><th class="text-end">LN đã thực hiện</th><th class="text-end">LN floating</th><th class="text-end">Cổ tức</th><th class="text-end">Phí GD</th><th class="text-end">Thuế</th><th class="text-end">LN ròng</th></tr></thead>
          <tbody>
            @for (r of pnlPeriods; track r.period) {
              <tr>
                <td class="fw-medium">{{r.period}}</td>
                <td class="text-end" [class]="r.realizedPnL>=0?'positive':'negative'">{{r.realizedPnL | vnd:'million'}}</td>
                <td class="text-end" [class]="r.floatingPnL>=0?'positive':'negative'">{{r.floatingPnL | vnd:'million'}}</td>
                <td class="text-end positive">{{r.dividend | vnd:'million'}}</td>
                <td class="text-end negative">{{r.fees | vnd:'million'}}</td>
                <td class="text-end negative">{{r.tax | vnd:'million'}}</td>
                <td class="text-end fw-bold" [class]="r.netPnL>=0?'positive':'negative'">{{r.netPnL | vnd:'million'}}</td>
              </tr>
            }
          </tbody>
          <tfoot><tr style="font-weight:600;background:#F8FAFC">
            <td>Tổng cộng</td>
            <td class="text-end" [class]="totalRealized>=0?'positive':'negative'">{{totalRealized | vnd:'million'}}</td>
            <td class="text-end">—</td>
            <td class="text-end positive">{{totalDividend | vnd:'million'}}</td>
            <td class="text-end negative">{{totalFees | vnd:'million'}}</td>
            <td class="text-end negative">{{totalTax | vnd:'million'}}</td>
            <td class="text-end" [class]="totalNet>=0?'positive':'negative'">{{totalNet | vnd:'million'}}</td>
          </tr></tfoot>
        </table>
        <div id="pnlChart" style="height:250px" class="mt-3"></div>
      }

      @if (tab === 'attr') {
        <h6 class="section-title mb-3"><i class="bi bi-puzzle-fill"></i>Attribution Analysis — Đóng góp lợi nhuận theo mã</h6>
        <table class="ip-table">
          <thead><tr><th>Mã CK</th><th>Tên</th><th>Ngành</th><th class="text-end">Tỉ trọng</th><th class="text-end">Return</th><th class="text-end">Đóng góp</th><th></th></tr></thead>
          <tbody>
            @for (a of attribution; track a.symbol) {
              <tr>
                <td class="fw-bold">{{a.symbol}}</td><td style="font-size:0.78rem">{{a.companyName}}</td>
                <td><span class="badge bg-light text-dark" style="font-size:0.65rem">{{a.sector}}</span></td>
                <td class="text-end">{{a.weight | number:'1.1-1'}}%</td>
                <td class="text-end" [class]="a.returnPct>=0?'positive':'negative'">{{a.returnPct>=0?'+':''}}{{a.returnPct | number:'1.1-1'}}%</td>
                <td class="text-end fw-bold" [class]="a.contribution>=0?'positive':'negative'">{{a.contribution>=0?'+':''}}{{a.contribution | number:'1.1-1'}}%</td>
                <td><div class="progress" style="width:60px;height:6px"><div class="progress-bar" [ngClass]="a.contribution>=0?'bg-success':'bg-danger'" [style.width.%]="Math.min(Math.abs(a.contribution)*20,100)"></div></div></td>
              </tr>
            }
          </tbody>
        </table>
        <div id="attrChart" style="height:250px" class="mt-3"></div>
      }

      @if (tab === 'benchmark') {
        <h6 class="section-title mb-3"><i class="bi bi-graph-up-arrow"></i>Portfolio vs VN-Index vs VN30 (% base)</h6>
        <div id="benchmarkChart" style="height:350px"></div>
      }

      @if (tab === 'stats') {
        <h6 class="section-title mb-3"><i class="bi bi-clipboard-data"></i>Thống kê giao dịch chi tiết</h6>
        <div class="row g-3">
          <div class="col-md-6">
            <table class="ip-table"><tbody>
              <tr><td>Tổng lệnh</td><td class="text-end fw-bold">{{p.totalTrades}}</td></tr>
              <tr><td>Lệnh thắng</td><td class="text-end positive fw-bold">{{Math.round(p.totalTrades*p.winRate/100)}}</td></tr>
              <tr><td>Lệnh thua</td><td class="text-end negative fw-bold">{{p.totalTrades - Math.round(p.totalTrades*p.winRate/100)}}</td></tr>
              <tr><td>Win Rate</td><td class="text-end fw-bold">{{p.winRate}}%</td></tr>
              <tr><td>TB ngày giữ</td><td class="text-end fw-bold">{{p.avgHoldingDays}} ngày</td></tr>
            </tbody></table>
          </div>
          <div class="col-md-6">
            <table class="ip-table"><tbody>
              <tr><td>Benchmark (VN-Index)</td><td class="text-end fw-bold">+{{p.benchmarkReturn}}%</td></tr>
              <tr><td>Alpha (vượt benchmark)</td><td class="text-end positive fw-bold">+{{p.alpha}}%</td></tr>
              <tr><td>Sharpe Ratio</td><td class="text-end fw-bold">{{p.sharpeRatio}}</td></tr>
              <tr><td>Max Drawdown</td><td class="text-end negative fw-bold">{{p.maxDrawdown}}%</td></tr>
              <tr><td>CAGR</td><td class="text-end fw-bold">{{p.annualizedReturn}}%</td></tr>
            </tbody></table>
          </div>
        </div>
      }
    </div>
  `
})
export class PerformanceComponent implements AfterViewInit {
  p = MOCK_PERFORMANCE;
  pnlPeriods = MOCK_PNL_BY_PERIOD;
  attribution = MOCK_ATTRIBUTION;
  tab = 'pnl';
  Math = Math;

  get totalRealized() { return this.pnlPeriods.reduce((s, r) => s + r.realizedPnL, 0); }
  get totalDividend() { return this.pnlPeriods.reduce((s, r) => s + r.dividend, 0); }
  get totalFees() { return this.pnlPeriods.reduce((s, r) => s + r.fees, 0); }
  get totalTax() { return this.pnlPeriods.reduce((s, r) => s + r.tax, 0); }
  get totalNet() { return this.pnlPeriods.reduce((s, r) => s + r.netPnL, 0); }

  ngAfterViewInit() { setTimeout(() => this.renderCharts(), 200); }

  renderCharts() {
    const echarts = (window as any)['echarts']; if (!echarts) return;
    // P&L chart
    const el1 = document.getElementById('pnlChart');
    if (el1) {
      const c = echarts.init(el1);
      c.setOption({ grid: { left: 70, right: 20, top: 20, bottom: 30 }, xAxis: { data: this.pnlPeriods.map(r => r.period).reverse() },
        yAxis: { axisLabel: { formatter: (v: number) => (v / 1e6).toFixed(0) + 'tr' } },
        series: [{ type: 'bar', data: this.pnlPeriods.map(r => r.netPnL).reverse(), itemStyle: { color: (p: any) => p.value >= 0 ? '#00C853' : '#F44336' } }],
        tooltip: { trigger: 'axis' } });
      window.addEventListener('resize', () => c.resize());
    }
    // Benchmark
    const el3 = document.getElementById('benchmarkChart');
    if (el3) {
      const c = echarts.init(el3);
      const dates: string[] = []; let pf = 100, vni = 100, vn30 = 100;
      const pfData: number[] = [], vniData: number[] = [], vn30Data: number[] = [];
      for (let i = 180; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        if (d.getDay() === 0 || d.getDay() === 6) continue;
        dates.push((d.getMonth() + 1) + '/' + d.getDate());
        pf += (Math.random() - 0.42) * 1.5; vni += (Math.random() - 0.45) * 1.2; vn30 += (Math.random() - 0.44) * 1.3;
        pfData.push(Math.round(pf * 10) / 10); vniData.push(Math.round(vni * 10) / 10); vn30Data.push(Math.round(vn30 * 10) / 10);
      }
      c.setOption({ grid: { left: 50, right: 20, top: 30, bottom: 30 }, legend: { top: 0 },
        xAxis: { data: dates, axisLabel: { fontSize: 8, interval: Math.floor(dates.length / 8) } },
        yAxis: { axisLabel: { formatter: '{value}%' } },
        series: [
          { name: 'Danh mục', type: 'line', data: pfData.map(v => Math.round((v - 100) * 10) / 10), lineStyle: { color: '#00B4D8', width: 2.5 }, symbol: 'none' },
          { name: 'VN-Index', type: 'line', data: vniData.map(v => Math.round((v - 100) * 10) / 10), lineStyle: { color: '#FFD600', width: 1.5 }, symbol: 'none' },
          { name: 'VN30', type: 'line', data: vn30Data.map(v => Math.round((v - 100) * 10) / 10), lineStyle: { color: '#AA00FF', width: 1.5, type: 'dashed' }, symbol: 'none' }
        ], tooltip: { trigger: 'axis' } });
      window.addEventListener('resize', () => c.resize());
    }
    // Attribution chart
    const el2 = document.getElementById('attrChart');
    if (el2) {
      const c = echarts.init(el2);
      c.setOption({ grid: { left: 60, right: 20, top: 10, bottom: 40 },
        xAxis: { data: this.attribution.map(a => a.symbol), axisLabel: { fontSize: 10 } },
        yAxis: { axisLabel: { formatter: '{value}%' } },
        series: [{ type: 'bar', data: this.attribution.map(a => a.contribution), itemStyle: { color: (p: any) => p.value >= 0 ? '#00C853' : '#F44336' } }],
        tooltip: { trigger: 'axis' } });
      window.addEventListener('resize', () => c.resize());
    }
  }
}
