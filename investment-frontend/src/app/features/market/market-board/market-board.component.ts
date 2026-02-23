import { Component, inject, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridReadyEvent, ValueFormatterParams, CellClassParams } from 'ag-grid-community';
import { MarketService } from '../../../core/services/market.service';
import { VndPipe } from '../../../shared/pipes/vnd.pipe';

@Component({
  selector: 'app-market-board',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AgGridAngular, VndPipe],
  providers: [DecimalPipe, VndPipe],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h5 class="fw-bold mb-1">Bảng giá Thị trường</h5>
        <p class="text-muted mb-0" style="font-size:0.82rem">AG Grid · Real-time qua WebSocket · Chuẩn HOSE/HNX/UPCOM</p>
      </div>
      <div class="d-flex gap-2 align-items-center">
        <span class="ws-indicator"><span class="ws-dot"></span> WebSocket Active</span>
        <div class="ip-tabs">
          <button class="ip-tab" [class.active]="filter() === 'all'" (click)="setFilter('all')">Tất cả</button>
          <button class="ip-tab" [class.active]="filter() === 'HOSE'" (click)="setFilter('HOSE')">HOSE</button>
          <button class="ip-tab" [class.active]="filter() === 'HNX'" (click)="setFilter('HNX')">HNX</button>
        </div>
        <input class="ip-input" style="width:160px" placeholder="Tìm mã CK..." [(ngModel)]="searchTxt">
      </div>
    </div>
    <div class="ip-card p-3" style="height: calc(100vh - 200px); min-height: 500px;">
      <ag-grid-angular
        style="width: 100%; height: 100%;"
        class="ag-theme-alpine-dark"
        [columnDefs]="columnDefs"
        [rowData]="filteredQuotes()"
        [defaultColDef]="defaultColDef"
        [getRowId]="getRowId"
        [animateRows]="false"
        (gridReady)="onGridReady($event)">
      </ag-grid-angular>
    </div>
  `
})
export class MarketBoardComponent {
  market = inject(MarketService);
  private df = inject(DecimalPipe);
  private vndPipe = inject(VndPipe);

  filter = this.market.exchangeFilter;
  searchTxt = '';

  filteredQuotes = computed(() => {
    let q = this.market.quotes();
    const currentFilter = this.filter();
    if (currentFilter !== 'all') {
      q = q.filter(x => x.exchange === currentFilter);
    }
    if (this.searchTxt) {
      q = q.filter(x => x.symbol.toLowerCase().includes(this.searchTxt.toLowerCase()));
    }
    return q;
  });

  setFilter(exchange: string) {
    this.market.exchangeFilter.set(exchange);
  }

  getRowId = (params: any) => params.data.symbol;

  defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    enableCellChangeFlash: true
  };

  priceFormatter = (params: ValueFormatterParams) => {
    if (params.value == null) return '';
    return this.df.transform(params.value / 1000, '1.2-2') || '';
  };

  volFormatter = (params: ValueFormatterParams) => {
    if (params.value == null) return '';
    const v = params.value;
    return v >= 1e6 ? (v / 1e6).toFixed(1) + 'M' : v >= 1e3 ? (v / 1e3).toFixed(0) + 'K' : v.toString();
  };

  priceColorClass = (params: CellClassParams) => {
    const q = params.data;
    if (!q) return '';
    if (q.currentPrice >= q.ceilingPrice) return 'text-vn-gold mono fw-bold text-end';
    if (q.currentPrice <= q.floorPrice) return 'text-vn-purple mono fw-bold text-end';
    return q.changePct > 0 ? 'text-vn-green mono fw-bold text-end' : q.changePct < 0 ? 'text-vn-red mono fw-bold text-end' : 'text-vn-ref mono fw-bold text-end';
  };

  columnDefs: ColDef[] = [
    { field: 'symbol', headerName: 'Mã', width: 90, pinned: 'left', cellClass: 'fw-bold' },
    { field: 'companyName', headerName: 'Tên', width: 200, tooltipField: 'companyName' },
    { field: 'exchange', headerName: 'Sàn', width: 90 },
    { field: 'refPrice', headerName: 'TC', width: 90, valueFormatter: this.priceFormatter, cellClass: 'text-end mono text-vn-ref' },
    { field: 'ceilingPrice', headerName: 'Trần', width: 90, valueFormatter: this.priceFormatter, cellClass: 'text-end mono text-vn-gold' },
    { field: 'floorPrice', headerName: 'Sàn', width: 90, valueFormatter: this.priceFormatter, cellClass: 'text-end mono text-vn-purple' },
    { field: 'currentPrice', headerName: 'Giá', width: 100, valueFormatter: this.priceFormatter, cellClass: this.priceColorClass },
    {
      field: 'change', headerName: '±', width: 90,
      valueFormatter: (p) => (p.value > 0 ? '+' : '') + this.priceFormatter(p),
      cellClass: (p) => p.value > 0 ? 'text-vn-green text-end mono' : p.value < 0 ? 'text-vn-red text-end mono' : 'text-vn-ref text-end mono'
    },
    {
      field: 'changePct', headerName: '%', width: 90,
      valueFormatter: (p) => (p.value > 0 ? '+' : '') + this.df.transform(p.value, '1.2-2') + '%',
      cellClass: (p) => p.value > 0 ? 'text-vn-green text-end mono' : p.value < 0 ? 'text-vn-red text-end mono' : 'text-vn-ref text-end mono'
    },
    { field: 'volume', headerName: 'KL', width: 100, valueFormatter: this.volFormatter, cellClass: 'text-end mono' },
    { field: 'marketCap', headerName: 'Vốn hóa', width: 120, valueFormatter: (p) => this.vndPipe.transform(p.value, 'short'), cellClass: 'text-end' }
  ];

  onGridReady(params: GridReadyEvent) {
    params.api.sizeColumnsToFit();
  }
}
