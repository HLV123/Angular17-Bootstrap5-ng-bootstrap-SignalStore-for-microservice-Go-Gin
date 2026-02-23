import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MOCK_BACKTEST_RESULTS } from '../../../core/mock-data';

@Component({
  selector: 'app-backtesting', standalone: true, imports: [CommonModule],
  template: `
    <h5 class="fw-bold mb-1">Backtesting chiến lược</h5>
    <p class="text-muted mb-4" style="font-size:0.82rem">Kiểm thử chiến lược trên dữ liệu lịch sử · gRPC: AnalyticsService.RunBacktest()</p>
    <div class="row g-3 mb-4">
      <div class="col-md-3"><div class="ip-card p-3 text-center"><div class="stat-label">Total Return</div><div class="stat-value positive">+{{bt.totalReturn}}%</div></div></div>
      <div class="col-md-3"><div class="ip-card p-3 text-center"><div class="stat-label">Sharpe Ratio</div><div class="stat-value">{{bt.sharpeRatio}}</div></div></div>
      <div class="col-md-3"><div class="ip-card p-3 text-center"><div class="stat-label">Max Drawdown</div><div class="stat-value negative">{{bt.maxDrawdown}}%</div></div></div>
      <div class="col-md-3"><div class="ip-card p-3 text-center"><div class="stat-label">Win Rate</div><div class="stat-value">{{bt.winRate}}%</div></div></div>
    </div>
    <div class="ip-card p-3 mb-3"><h6 class="section-title mb-3"><i class="bi bi-graph-up-arrow"></i>Equity Curve · {{bt.strategyName}}</h6><div id="equityChart" style="height:300px"></div></div>
    <div class="ip-card p-3">
      <h6 class="section-title mb-3"><i class="bi bi-list-ul"></i>Danh sách lệnh ({{bt.totalTrades}} lệnh)</h6>
      <table class="ip-table"><thead><tr><th>Ngày vào</th><th>Ngày ra</th><th class="text-end">Giá vào</th><th class="text-end">Giá ra</th><th class="text-end">SL</th><th class="text-end">P&L</th><th class="text-end">%</th></tr></thead>
      <tbody>@for (t of bt.trades; track t.entryDate) {
        <tr><td class="mono" style="font-size:0.78rem">{{t.entryDate}}</td><td class="mono" style="font-size:0.78rem">{{t.exitDate}}</td><td class="text-end">{{t.entryPrice|number}}</td><td class="text-end">{{t.exitPrice|number}}</td><td class="text-end">{{t.quantity|number}}</td><td class="text-end" [class]="t.pnl>=0?'positive':'negative'">{{t.pnl|number}}</td><td class="text-end" [class]="t.pnlPct>=0?'positive':'negative'">{{t.pnlPct|number:'1.1-1'}}%</td></tr>
      }</tbody></table>
    </div>
  `
})
export class BacktestingComponent implements AfterViewInit {
  bt = MOCK_BACKTEST_RESULTS[0];
  ngAfterViewInit() {
    const echarts = (window as any)['echarts']; if (!echarts) return;
    const c = echarts.init(document.getElementById('equityChart'));
    c.setOption({ grid:{left:60,right:20,top:20,bottom:30}, xAxis:{data:this.bt.equityCurve.map(e=>e.date),axisLabel:{fontSize:8,interval:8}}, yAxis:{scale:true}, series:[{type:'line',data:this.bt.equityCurve.map(e=>e.value),smooth:true,lineStyle:{color:'#00B4D8',width:2},areaStyle:{color:{type:'linear',x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:'rgba(0,180,216,0.15)'},{offset:1,color:'rgba(0,180,216,0)'}]}},symbol:'none'}], tooltip:{trigger:'axis'} });
    window.addEventListener('resize', () => c.resize());
  }
}
