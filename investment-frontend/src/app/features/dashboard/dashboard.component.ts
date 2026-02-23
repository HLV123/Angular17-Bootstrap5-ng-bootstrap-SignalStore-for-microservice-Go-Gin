import { Component, inject, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PortfolioService } from '../../core/services/portfolio.service';
import { MarketService } from '../../core/services/market.service';
import { AlertService } from '../../core/services/alert.service';
import { VndPipe } from '../../shared/pipes/vnd.pipe';
import { MOCK_CORPORATE_ACTIONS } from '../../core/mock-data';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, VndPipe],
  template: `
    <!-- Stat Cards Row -->
    <div class="row g-3 mb-4">
      <div class="col-xl-3 col-md-6">
        <div class="ip-card p-3">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <div class="stat-label">Tổng NAV</div>
              <div class="stat-value">{{ portfolio.getTotalNAV() | vnd:'short' }}</div>
              <div class="stat-change mt-1" [class]="portfolio.getTotalDayPnL() >= 0 ? 'positive' : 'negative'">
                <i class="bi" [ngClass]="portfolio.getTotalDayPnL() >= 0 ? 'bi-arrow-up-short' : 'bi-arrow-down-short'"></i>
                {{ portfolio.getTotalDayPnL() | vnd:'million' }} hôm nay
              </div>
            </div>
            <div class="stat-icon" style="background:rgba(0,180,216,0.1);color:var(--ip-accent)">
              <i class="bi bi-pie-chart-fill"></i>
            </div>
          </div>
        </div>
      </div>

      <div class="col-xl-3 col-md-6">
        <div class="ip-card p-3">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <div class="stat-label">P&L Thả nổi</div>
              <div class="stat-value" [class]="portfolio.getTotalUnrealizedPnL() >= 0 ? 'positive' : 'negative'">
                {{ portfolio.getTotalUnrealizedPnL() >= 0 ? '+' : '' }}{{ portfolio.getTotalUnrealizedPnL() | vnd:'million' }}
              </div>
              <div class="mt-1">
                <div class="progress" style="height:5px;border-radius:3px">
                  <div class="progress-bar bg-success" style="width:67%"></div>
                  <div class="progress-bar bg-danger" style="width:33%"></div>
                </div>
                <div class="d-flex justify-content-between mt-1" style="font-size:0.7rem;color:var(--ip-text-muted)">
                  <span>Lời: 67%</span><span>Lỗ: 33%</span>
                </div>
              </div>
            </div>
            <div class="stat-icon" style="background:rgba(0,200,83,0.1);color:var(--vn-green)">
              <i class="bi bi-graph-up-arrow"></i>
            </div>
          </div>
        </div>
      </div>

      <div class="col-xl-3 col-md-6">
        <div class="ip-card p-3">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <div class="stat-label">Chỉ số thị trường</div>
              @for (idx of market.indices().slice(0,2); track idx.name) {
                <div class="d-flex align-items-center gap-2 mt-1">
                  <span class="fw-semibold" style="font-size:0.78rem">{{ idx.name }}</span>
                  <span class="fw-bold" style="font-size:0.9rem">{{ idx.value | number:'1.1-1' }}</span>
                  <span [class]="idx.change >= 0 ? 'positive' : 'negative'" style="font-size:0.78rem">
                    {{ idx.change >= 0 ? '+' : '' }}{{ idx.change | number:'1.1-1' }}
                  </span>
                </div>
              }
            </div>
            <div class="stat-icon" style="background:rgba(255,214,0,0.1);color:var(--vn-gold)">
              <i class="bi bi-activity"></i>
            </div>
          </div>
        </div>
      </div>

      <div class="col-xl-3 col-md-6">
        <div class="ip-card p-3">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <div class="stat-label">Cảnh báo</div>
              @if (alertService.history().length > 0) {
                <div class="fw-semibold mt-1" style="font-size:0.85rem">{{ alertService.history()[0].title }}</div>
                <div style="font-size:0.75rem;color:var(--ip-text-muted)" class="mt-1">
                  <span class="badge" [ngClass]="{
                    'bg-danger': alertService.history()[0].severity === 'high',
                    'bg-warning text-dark': alertService.history()[0].severity === 'medium',
                    'bg-info': alertService.history()[0].severity === 'low'
                  }" style="font-size:0.65rem">{{ alertService.history()[0].severity | uppercase }}</span>
                </div>
              }
            </div>
            <div class="stat-icon" style="background:rgba(244,67,54,0.1);color:var(--vn-red)">
              <i class="bi bi-bell-fill"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Holdings Table & Allocation Chart -->
    <div class="row g-3 mb-4">
      <div class="col-xl-8">
        <div class="ip-card p-3">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h6 class="section-title mb-0"><i class="bi bi-table"></i>Danh mục vị thế · TK Dài hạn</h6>
            <div class="d-flex gap-2">
              <span class="ws-indicator">Real-time</span>
              <a routerLink="/portfolio/holdings" class="btn btn-sm btn-ip-outline">Xem tất cả</a>
            </div>
          </div>
          <div class="table-responsive">
            <table class="ip-table">
              <thead>
                <tr>
                  <th>Mã CK</th><th>Tên</th><th class="text-end">SL</th>
                  <th class="text-end">Giá vốn TB</th><th class="text-end">Giá hiện tại</th>
                  <th class="text-end">Lãi/Lỗ</th><th class="text-end">%</th><th class="text-end">Tỉ trọng</th>
                </tr>
              </thead>
              <tbody>
                @for (h of topHoldings; track h.id) {
                  <tr>
                    <td><span class="fw-bold">{{ h.symbol }}</span></td>
                    <td style="font-size:0.78rem;color:var(--ip-text-muted)">{{ h.companyName }}</td>
                    <td class="text-end mono">{{ h.quantity | number }}</td>
                    <td class="text-end mono">{{ h.avgCost | number }}</td>
                    <td class="text-end mono" [class]="h.dayChangePct > 0 ? 'text-vn-green' : h.dayChangePct < 0 ? 'text-vn-red' : ''">
                      {{ h.currentPrice | number }}
                    </td>
                    <td class="text-end mono" [class]="h.unrealizedPnL >= 0 ? 'positive' : 'negative'">
                      {{ h.unrealizedPnL | vnd:'million' }}
                    </td>
                    <td class="text-end" [class]="h.unrealizedPnLPct >= 0 ? 'positive' : 'negative'">
                      {{ h.unrealizedPnLPct >= 0 ? '+' : '' }}{{ h.unrealizedPnLPct | number:'1.2-2' }}%
                    </td>
                    <td class="text-end">
                      <div class="d-flex align-items-center justify-content-end gap-1">
                        <div class="progress" style="width:50px;height:4px;border-radius:2px">
                          <div class="progress-bar bg-primary" [style.width.%]="h.weight"></div>
                        </div>
                        <span style="font-size:0.75rem">{{ h.weight }}%</span>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <div class="d-flex gap-4 mt-2" style="font-size:0.75rem;color:var(--ip-text-muted)">
            <span>Beta danh mục: 1.15</span>
            <span>Max drawdown: -8.2%</span>
            <span>Sharpe: 1.45</span>
          </div>
        </div>
      </div>

      <div class="col-xl-4">
        <div class="ip-card p-3 mb-3">
          <h6 class="section-title mb-3"><i class="bi bi-pie-chart-fill"></i>Phân bổ tài sản</h6>
          <div id="allocationChart" style="height:220px"></div>
        </div>
        <div class="ip-card p-3">
          <h6 class="section-title mb-3"><i class="bi bi-graph-up"></i>NAV 3 tháng</h6>
          <div id="navChart" style="height:160px"></div>
        </div>
      </div>
    </div>

    <!-- Row 3: Market Board Mini + Top movers + Corporate Actions -->
    <div class="row g-3 mb-4">
      <div class="col-xl-5">
        <div class="ip-card p-3">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h6 class="section-title mb-0"><i class="bi bi-lightning-fill"></i>Bảng giá nhanh</h6>
            <a routerLink="/market" class="btn btn-sm btn-ip-outline">Bảng giá đầy đủ</a>
          </div>
          <div class="table-responsive">
            <table class="ip-table">
              <thead><tr><th>Mã</th><th class="text-end">Giá</th><th class="text-end">±%</th><th class="text-end">KL</th></tr></thead>
              <tbody>
                @for (q of market.quotes().slice(0, 8); track q.symbol) {
                  <tr>
                    <td class="fw-bold">{{ q.symbol }}</td>
                    <td class="text-end mono" [class]="getColorClass(q)">{{ (q.currentPrice / 1000) | number:'1.1-1' }}</td>
                    <td class="text-end" [class]="getColorClass(q)">
                      {{ q.changePct >= 0 ? '+' : '' }}{{ q.changePct | number:'1.2-2' }}%
                    </td>
                    <td class="text-end" style="font-size:0.78rem">{{ formatVolume(q.volume) }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="col-xl-4">
        <div class="ip-card p-3 mb-3">
          <h6 class="section-title mb-3"><i class="bi bi-trophy-fill"></i>Top Lãi/Lỗ trong DM</h6>
          @for (h of topGainers; track h.id) {
            <div class="d-flex justify-content-between align-items-center py-2" style="border-bottom:1px solid #F1F5F9">
              <div>
                <span class="fw-bold">{{ h.symbol }}</span>
                <span class="ms-2" style="font-size:0.75rem;color:var(--ip-text-muted)">{{ h.companyName }}</span>
              </div>
              <span [class]="h.unrealizedPnLPct >= 0 ? 'positive' : 'negative'" class="fw-bold">
                {{ h.unrealizedPnLPct >= 0 ? '+' : '' }}{{ h.unrealizedPnLPct | number:'1.2-2' }}%
              </span>
            </div>
          }
        </div>
        <div class="ip-card p-3">
          <h6 class="section-title mb-3"><i class="bi bi-calendar2-event"></i>Sự kiện sắp tới</h6>
          @for (ca of corporateActions; track ca.id) {
            <div class="d-flex justify-content-between py-2" style="border-bottom:1px solid #F1F5F9;font-size:0.82rem">
              <div>
                <span class="fw-bold">{{ ca.symbol }}</span>
                <span class="ms-1">{{ ca.description }}</span>
              </div>
              <span style="color:var(--ip-text-muted)">{{ ca.exDate }}</span>
            </div>
          }
        </div>
      </div>

      <div class="col-xl-3">
        <div class="ip-card p-3 mb-3">
          <h6 class="section-title mb-3"><i class="bi bi-bar-chart-steps"></i>Tableau · Hiệu suất</h6>
          <div class="bi-placeholder">
            <i class="bi bi-file-earmark-spreadsheet me-2"></i>Báo cáo P&L tích lũy
            <div class="mt-2" style="font-size:0.7rem">Embed token · trusted auth</div>
          </div>
        </div>
        <div class="ip-card p-3 mb-3">
          <h6 class="section-title mb-3"><i class="bi bi-cpu"></i>Power BI · Dashboard</h6>
          <div class="bi-placeholder">
            <i class="bi bi-graph-up me-2"></i>P&L Dashboard
            <div class="mt-2" style="font-size:0.7rem">Azure AD embed token</div>
          </div>
        </div>
        <div class="ip-card p-3">
          <h6 class="section-title mb-3"><i class="bi bi-file-ruled"></i>Cognos · Thuế</h6>
          <div class="d-flex justify-content-between" style="font-size:0.85rem">
            <span>Thuế đã nộp 2025</span>
            <span class="fw-bold">1,240,000₫</span>
          </div>
          <div style="font-size:0.75rem;color:var(--ip-text-muted)" class="mt-1">0.1% trên giá trị bán</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stat-icon {
      width: 44px; height: 44px; border-radius: 12px; display: flex;
      align-items: center; justify-content: center; font-size: 1.2rem;
    }
    .bi-placeholder {
      background: linear-gradient(145deg, #e9ecf3, #ffffff); border-radius: 10px;
      padding: 20px; text-align: center; color: #6b7280; font-size: 0.82rem;
    }
  `]
})
export class DashboardComponent implements AfterViewInit {
  topHoldings: any[] = [];
  topGainers: any[] = [];
  corporateActions: any[] = MOCK_CORPORATE_ACTIONS;
  portfolio: PortfolioService;
  market: MarketService;
  alertService: AlertService;

  constructor() {
    this.portfolio = inject(PortfolioService);
    this.market = inject(MarketService);
    this.alertService = inject(AlertService);
    this.topHoldings = this.portfolio.getHoldingsByAccountId('acc1');
    this.topGainers = [...this.topHoldings].sort((a: any, b: any) => b.unrealizedPnLPct - a.unrealizedPnLPct);
  }

  getColorClass(q: any): string {
    if (q.currentPrice >= q.ceilingPrice) return 'text-vn-gold';
    if (q.currentPrice <= q.floorPrice) return 'text-vn-purple';
    if (q.changePct > 0) return 'text-vn-green';
    if (q.changePct < 0) return 'text-vn-red';
    return 'text-vn-ref';
  }

  formatVolume(v: number): string {
    if (v >= 1e6) return (v / 1e6).toFixed(1) + 'M';
    if (v >= 1e3) return (v / 1e3).toFixed(0) + 'K';
    return v.toString();
  }

  ngAfterViewInit(): void {
    this.initAllocationChart();
    this.initNavChart();
  }

  private initAllocationChart(): void {
    const el = document.getElementById('allocationChart');
    if (!el) return;
    const echarts = (window as any)['echarts'];
    if (!echarts) { this.loadEcharts(() => this.initAllocationChart()); return; }
    const chart = echarts.init(el);
    const data: any[] = this.portfolio.getPortfolioAllocation();
    chart.setOption({
      tooltip: { trigger: 'item', formatter: '{b}: {d}%' },
      series: [{
        type: 'pie', radius: ['45%', '70%'], avoidLabelOverlap: false,
        label: { show: true, fontSize: 11, formatter: '{b}\n{d}%' },
        data: data.map(d => ({ value: d.value, name: d.name })),
        color: ['#00B4D8', '#F44336', '#00C853', '#FFD600', '#AA00FF', '#FF9800', '#607D8B']
      }]
    });
    window.addEventListener('resize', () => chart.resize());
  }

  private initNavChart(): void {
    const el = document.getElementById('navChart');
    if (!el) return;
    const echarts = (window as any)['echarts'];
    if (!echarts) return;
    const chart = echarts.init(el);
    const dates: string[] = [];
    const values: number[] = [];
    let nav = 1180;
    for (let i = 90; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      if (d.getDay() === 0 || d.getDay() === 6) continue;
      dates.push((d.getMonth() + 1) + '/' + d.getDate());
      nav += (Math.random() - 0.45) * 15;
      values.push(Math.round(nav * 10) / 10);
    }
    chart.setOption({
      grid: { left: 10, right: 10, top: 10, bottom: 20, containLabel: true },
      xAxis: { data: dates, axisLabel: { fontSize: 9, interval: Math.floor(dates.length / 5) }, axisLine: { show: false }, axisTick: { show: false } },
      yAxis: { show: false, scale: true },
      series: [{
        type: 'line', data: values, smooth: true, symbol: 'none',
        lineStyle: { color: '#00B4D8', width: 2 },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(0,180,216,0.2)' }, { offset: 1, color: 'rgba(0,180,216,0)' }] } }
      }],
      tooltip: { trigger: 'axis', formatter: (p: any) => p[0]?.name + ': ' + p[0]?.value + ' tr' }
    });
    window.addEventListener('resize', () => chart.resize());
  }

  private loadEcharts(cb: () => void): void {
    if ((window as any)['echarts']) { cb(); return; }
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/echarts@5.5.0/dist/echarts.min.js';
    s.onload = cb;
    document.head.appendChild(s);
  }
}
