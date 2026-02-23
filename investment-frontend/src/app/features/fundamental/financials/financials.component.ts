import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MOCK_FINANCIALS, MOCK_BALANCE_SHEETS, MOCK_CASH_FLOWS } from '../../../core/mock-data';
import { VndPipe } from '../../../shared/pipes/vnd.pipe';

@Component({
  selector: 'app-financials', standalone: true, imports: [CommonModule, FormsModule, VndPipe],
  template: `
    <h5 class="fw-bold mb-1">Báo cáo Tài chính</h5>
    <p class="text-muted mb-4" style="font-size:0.82rem">KQKD · BCĐKT · LCTT · So sánh QoQ/YoY</p>

    <div class="ip-card p-3 mb-3">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div class="ip-tabs">
          <button class="ip-tab" [class.active]="tab==='income'" (click)="tab='income'">Kết quả Kinh doanh</button>
          <button class="ip-tab" [class.active]="tab==='balance'" (click)="tab='balance'">Bảng Cân đối KT</button>
          <button class="ip-tab" [class.active]="tab==='cashflow'" (click)="tab='cashflow'">Lưu chuyển Tiền tệ</button>
        </div>
        <div class="d-flex gap-2">
          <label class="form-check mb-0" style="font-size:0.78rem"><input type="checkbox" class="form-check-input" [(ngModel)]="showYoY"><span class="form-check-label">Hiện YoY%</span></label>
          <button class="btn btn-sm btn-ip-outline"><i class="bi bi-file-earmark-excel me-1"></i>Export</button>
        </div>
      </div>

      @if (tab === 'income') {
        <table class="ip-table"><thead><tr><th style="min-width:180px">Chỉ tiêu</th>@for(f of income; track f.period){<th class="text-end">{{f.period}}</th>@if(showYoY && !$first){<th class="text-end" style="font-size:0.7rem;color:var(--ip-text-muted)">YoY</th>}}</tr></thead>
        <tbody>
          @for (item of incomeItems; track item.key) {
            <tr [style.font-weight]="item.bold ? '600' : '400'" [style.background]="item.bold ? '#F8FAFC' : ''">
              <td>{{item.label}}</td>
              @for (f of income; track f.period; let i = $index) {
                <td class="text-end mono">{{f[item.key] | vnd:'short'}}</td>
                @if (showYoY && i > 0) { <td class="text-end" [class]="yoy(income, item.key, i) >= 0 ? 'positive' : 'negative'" style="font-size:0.72rem">{{yoy(income, item.key, i) >= 0 ? '+' : ''}}{{yoy(income, item.key, i) | number:'1.1-1'}}%</td> }
              }
            </tr>
          }
        </tbody></table>
      }

      @if (tab === 'balance') {
        <table class="ip-table"><thead><tr><th style="min-width:180px">Chỉ tiêu</th>@for(f of balanceSheets; track f.period){<th class="text-end">{{f.period}}</th>@if(showYoY && !$first){<th class="text-end" style="font-size:0.7rem;color:var(--ip-text-muted)">YoY</th>}}</tr></thead>
        <tbody>
          @for (item of bsItems; track item.key) {
            <tr [style.font-weight]="item.bold ? '600' : '400'" [style.background]="item.bold ? '#F8FAFC' : ''">
              <td>{{item.label}}</td>
              @for (f of balanceSheets; track f.period; let i = $index) {
                <td class="text-end mono">{{f[item.key] | vnd:'short'}}</td>
                @if (showYoY && i > 0) { <td class="text-end" [class]="yoy(balanceSheets, item.key, i) >= 0 ? 'positive' : 'negative'" style="font-size:0.72rem">{{yoy(balanceSheets, item.key, i) >= 0 ? '+' : ''}}{{yoy(balanceSheets, item.key, i) | number:'1.1-1'}}%</td> }
              }
            </tr>
          }
        </tbody></table>
      }

      @if (tab === 'cashflow') {
        <table class="ip-table"><thead><tr><th style="min-width:180px">Chỉ tiêu</th>@for(f of cashFlows; track f.period){<th class="text-end">{{f.period}}</th>@if(showYoY && !$first){<th class="text-end" style="font-size:0.7rem;color:var(--ip-text-muted)">YoY</th>}}</tr></thead>
        <tbody>
          @for (item of cfItems; track item.key) {
            <tr [style.font-weight]="item.bold ? '600' : '400'" [style.background]="item.bold ? '#F8FAFC' : ''">
              <td>{{item.label}}</td>
              @for (f of cashFlows; track f.period; let i = $index) {
                <td class="text-end mono" [class]="f[item.key] >= 0 ? 'positive' : 'negative'">{{f[item.key] | vnd:'short'}}</td>
                @if (showYoY && i > 0) { <td class="text-end" [class]="yoy(cashFlows, item.key, i) >= 0 ? 'positive' : 'negative'" style="font-size:0.72rem">{{yoy(cashFlows, item.key, i) >= 0 ? '+' : ''}}{{yoy(cashFlows, item.key, i) | number:'1.1-1'}}%</td> }
              }
            </tr>
          }
        </tbody></table>
      }
    </div>

    <div class="ip-card p-3"><h6 class="section-title mb-2"><i class="bi bi-bar-chart"></i>Xu hướng doanh thu & lợi nhuận</h6><div id="financialChart" style="height:280px"></div></div>
  `
})
export class FinancialsComponent implements AfterViewInit {
  tab = 'income'; showYoY = true;
  income = [...MOCK_FINANCIALS].reverse();
  balanceSheets = MOCK_BALANCE_SHEETS;
  cashFlows = MOCK_CASH_FLOWS;

  incomeItems = [
    { key: 'revenue', label: 'Doanh thu thuần', bold: true },
    { key: 'grossProfit', label: 'Lợi nhuận gộp', bold: false },
    { key: 'operatingIncome', label: 'LN từ HĐKD', bold: false },
    { key: 'netIncome', label: 'Lợi nhuận ròng CĐTS', bold: true },
    { key: 'eps', label: 'EPS (VNĐ)', bold: false },
    { key: 'totalAssets', label: 'Tổng tài sản', bold: false },
    { key: 'totalEquity', label: 'Vốn chủ sở hữu', bold: false },
  ];
  bsItems = [
    { key: 'totalAssets', label: 'TỔNG TÀI SẢN', bold: true },
    { key: 'currentAssets', label: '  Tài sản ngắn hạn', bold: false },
    { key: 'longTermAssets', label: '  Tài sản dài hạn', bold: false },
    { key: 'totalLiabilities', label: 'TỔNG NỢ PHẢI TRẢ', bold: true },
    { key: 'currentLiabilities', label: '  Nợ ngắn hạn', bold: false },
    { key: 'longTermDebt', label: '  Nợ dài hạn', bold: false },
    { key: 'totalEquity', label: 'VỐN CHỦ SỞ HỮU', bold: true },
    { key: 'retainedEarnings', label: '  LN chưa phân phối', bold: false },
  ];
  cfItems = [
    { key: 'operatingCF', label: 'Dòng tiền HĐKD', bold: true },
    { key: 'investingCF', label: 'Dòng tiền đầu tư', bold: false },
    { key: 'financingCF', label: 'Dòng tiền tài chính', bold: false },
    { key: 'netCF', label: 'Thay đổi tiền ròng', bold: true },
    { key: 'beginCash', label: 'Tiền đầu kỳ', bold: false },
    { key: 'endCash', label: 'Tiền cuối kỳ', bold: true },
  ];

  yoy(data: any[], key: string, idx: number): number {
    const cur = data[idx]?.[key]; const prev = data[idx - 1]?.[key];
    if (!prev || prev === 0) return 0;
    return ((cur - prev) / Math.abs(prev)) * 100;
  }

  ngAfterViewInit() {
    const echarts = (window as any)['echarts']; if (!echarts) return;
    const c = echarts.init(document.getElementById('financialChart'));
    c.setOption({
      grid: { left: 80, right: 20, top: 30, bottom: 30 }, legend: { top: 0 },
      xAxis: { data: this.income.map(f => f.period) },
      yAxis: { axisLabel: { formatter: (v: number) => (v / 1e12).toFixed(0) + 'T' } },
      series: [
        { name: 'Doanh thu', type: 'bar', data: this.income.map(f => f.revenue), color: '#00B4D8' },
        { name: 'LN ròng', type: 'bar', data: this.income.map(f => f.netIncome), color: '#00C853' }
      ], tooltip: { trigger: 'axis' }
    });
    window.addEventListener('resize', () => c.resize());
  }
}
