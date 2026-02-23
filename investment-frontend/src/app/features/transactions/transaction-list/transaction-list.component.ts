import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TransactionService } from '../../../core/services/transaction.service';
import { VndPipe } from '../../../shared/pipes/vnd.pipe';

@Component({
  selector: 'app-transaction-list', standalone: true, imports: [CommonModule, FormsModule, RouterModule, VndPipe],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div><h5 class="fw-bold mb-1">Lịch sử Giao dịch</h5><p class="text-muted mb-0" style="font-size:0.82rem">Quản lý toàn bộ giao dịch mua/bán/cổ tức</p></div>
      <div class="d-flex gap-2">
        <button class="btn btn-ip-accent" routerLink="/transactions/new"><i class="bi bi-plus-lg me-1"></i>Nhập lệnh</button>
        <button class="btn btn-ip-outline" routerLink="/transactions/import"><i class="bi bi-upload me-1"></i>Import</button>
      </div>
    </div>
    <div class="ip-card p-3 mb-3">
      <div class="d-flex gap-2 mb-3">
        <input class="ip-input" placeholder="Tìm mã CK..." [(ngModel)]="searchSymbol" style="width:140px">
        <select class="form-select form-select-sm ip-input" [(ngModel)]="filterType" style="width:140px">
          <option value="">Tất cả loại</option><option value="buy">Mua</option><option value="sell">Bán</option><option value="dividend_cash">Cổ tức</option>
        </select>
      </div>
      <table class="ip-table">
        <thead><tr><th>Ngày</th><th>Mã</th><th>Loại</th><th class="text-end">SL</th><th class="text-end">Giá</th><th class="text-end">Phí</th><th class="text-end">Thuế</th><th class="text-end">Tổng GT</th><th>Ghi chú</th><th></th></tr></thead>
        <tbody>
          @for (t of filtered; track t.id) {
            <tr>
              <td class="mono" style="font-size:0.78rem">{{t.tradeDate}}</td>
              <td class="fw-bold">{{t.symbol}}</td>
              <td><span class="badge" [ngClass]="{'bg-success':t.type==='buy','bg-danger':t.type==='sell','bg-info':t.type==='dividend_cash','bg-warning text-dark':t.type==='dividend_stock'}">{{typeLabel(t.type)}}</span></td>
              <td class="text-end mono">{{t.quantity|number}}</td>
              <td class="text-end mono">{{t.price|number}}</td>
              <td class="text-end">{{t.fee|vnd:'short'}}</td>
              <td class="text-end">{{t.tax|vnd:'short'}}</td>
              <td class="text-end fw-semibold">{{t.totalValue|vnd:'million'}}</td>
              <td style="font-size:0.75rem;max-width:180px" class="text-truncate">{{t.note}}</td>
              <td><button class="btn btn-sm text-danger border-0" (click)="txService.deleteTransaction(t.id)"><i class="bi bi-trash"></i></button></td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `
})
export class TransactionListComponent {
  txService = inject(TransactionService);
  searchSymbol = ''; filterType = '';
  get filtered() {
    let list = this.txService.transactions();
    if (this.searchSymbol) list = list.filter(t => t.symbol.toLowerCase().includes(this.searchSymbol.toLowerCase()));
    if (this.filterType) list = list.filter(t => t.type === this.filterType);
    return list;
  }
  typeLabel(t: string): string { return {buy:'Mua',sell:'Bán',dividend_cash:'Cổ tức tiền',dividend_stock:'Cổ tức CP',rights:'Quyền mua',transfer:'Chuyển'}[t] || t; }
}
