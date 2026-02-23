import { Component, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MOCK_RISK_METRICS } from '../../../core/mock-data';
import { VndPipe } from '../../../shared/pipes/vnd.pipe';

@Component({
  selector: 'app-risk-metrics', standalone: true, imports: [CommonModule, VndPipe],
  template: `
    <h5 class="fw-bold mb-1">Quản lý Rủi ro Danh mục</h5>
    <p class="text-muted mb-4" style="font-size:0.82rem">VaR · CVaR · Sharpe · Beta · Correlation</p>
    <div class="row g-3 mb-4">
      <div class="col-md-3"><div class="ip-card p-3 text-center"><div class="stat-label">VaR (95%)</div><div class="stat-value negative" style="font-size:1.3rem">{{risk.var95 | vnd:'million'}}</div></div></div>
      <div class="col-md-3"><div class="ip-card p-3 text-center"><div class="stat-label">Sharpe Ratio</div><div class="stat-value" style="font-size:1.3rem">{{risk.sharpeRatio}}</div></div></div>
      <div class="col-md-3"><div class="ip-card p-3 text-center"><div class="stat-label">Beta</div><div class="stat-value" style="font-size:1.3rem">{{risk.beta}}</div></div></div>
      <div class="col-md-3"><div class="ip-card p-3 text-center"><div class="stat-label">Max Drawdown</div><div class="stat-value negative" style="font-size:1.3rem">{{risk.maxDrawdown}}%</div></div></div>
    </div>
    <div class="row g-3">
      <div class="col-lg-6"><div class="ip-card p-3"><h6 class="section-title mb-3"><i class="bi bi-grid-3x3"></i>Ma trận tương quan</h6><div id="corrMatrix" style="height:320px"></div></div></div>
      <div class="col-lg-6"><div class="ip-card p-3">
        <h6 class="section-title mb-3"><i class="bi bi-shield-exclamation"></i>Chi tiết rủi ro</h6>
        <table class="ip-table"><tbody>
          <tr><td>VaR 95%</td><td class="text-end negative fw-bold">{{risk.var95 | vnd:'million'}}</td></tr>
          <tr><td>VaR 99%</td><td class="text-end negative fw-bold">{{risk.var99 | vnd:'million'}}</td></tr>
          <tr><td>CVaR</td><td class="text-end negative fw-bold">{{risk.cvar | vnd:'million'}}</td></tr>
          <tr><td>Concentration Top 5</td><td class="text-end fw-bold">{{risk.concentrationTop5}}%</td></tr>
          <tr><td>Beta</td><td class="text-end fw-bold">{{risk.beta}}</td></tr>
          <tr><td>Sharpe</td><td class="text-end positive fw-bold">{{risk.sharpeRatio}}</td></tr>
        </tbody></table>
      </div></div>
    </div>
  `
})
export class RiskMetricsComponent implements AfterViewInit {
  risk = MOCK_RISK_METRICS;
  ngAfterViewInit() {
    const echarts = (window as any)['echarts'];
    if (!echarts || !this.risk.correlationMatrix) return;
    const cm = this.risk.correlationMatrix;
    const data: any[] = [];
    cm.symbols.forEach((_: any, i: number) => cm.symbols.forEach((_: any, j: number) => data.push([i, j, cm.matrix[i][j]])));
    const c = echarts.init(document.getElementById('corrMatrix'));
    c.setOption({
      tooltip: {}, xAxis: { type: 'category', data: cm.symbols }, yAxis: { type: 'category', data: cm.symbols },
      visualMap: { min: 0, max: 1, calculable: true, orient: 'horizontal', left: 'center', bottom: 0, inRange: { color: ['#F5F7FA', '#00B4D8', '#1B2A4A'] } },
      series: [{ type: 'heatmap', data, label: { show: true, formatter: (p: any) => p.value[2].toFixed(2), fontSize: 11 } }]
    });
    window.addEventListener('resize', () => c.resize());
  }
}
