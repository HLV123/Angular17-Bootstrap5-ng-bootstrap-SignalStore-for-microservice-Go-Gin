import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TransactionService } from '../../../core/services/transaction.service';
import { PortfolioService } from '../../../core/services/portfolio.service';

@Component({
  selector: 'app-transaction-form', standalone: true, imports: [CommonModule, FormsModule],
  template: `
    <h5 class="fw-bold mb-4">Nhập lệnh Giao dịch</h5>
    <div class="row"><div class="col-lg-8">
      <div class="ip-card p-4">
        <div class="row g-3">
          <div class="col-md-6"><label class="form-label fw-medium">Tài khoản</label>
            <select class="form-select ip-input" [(ngModel)]="form.accountId">
              @for (a of portfolio.accounts(); track a.id) { <option [value]="a.id">{{a.name}}</option> }
            </select></div>
          <div class="col-md-6"><label class="form-label fw-medium">Loại lệnh</label>
            <select class="form-select ip-input" [(ngModel)]="form.type">
              <option value="buy">Mua</option><option value="sell">Bán</option><option value="dividend_cash">Cổ tức tiền</option>
            </select></div>
          <div class="col-md-4"><label class="form-label fw-medium">Mã chứng khoán</label><input class="form-control ip-input" [(ngModel)]="form.symbol" placeholder="VIC"></div>
          <div class="col-md-4"><label class="form-label fw-medium">Số lượng</label><input type="number" class="form-control ip-input" [(ngModel)]="form.quantity"></div>
          <div class="col-md-4"><label class="form-label fw-medium">Giá khớp</label><input type="number" class="form-control ip-input" [(ngModel)]="form.price"></div>
          <div class="col-md-4"><label class="form-label fw-medium">Phí GD</label><input type="number" class="form-control ip-input" [(ngModel)]="form.fee"></div>
          <div class="col-md-4"><label class="form-label fw-medium">Ngày giao dịch</label><input type="date" class="form-control ip-input" [(ngModel)]="form.tradeDate"></div>
          <div class="col-md-4"><label class="form-label fw-medium">Ngày thanh toán</label><input type="date" class="form-control ip-input" [(ngModel)]="form.settlementDate"></div>
          <div class="col-12"><label class="form-label fw-medium">Ghi chú</label><textarea class="form-control ip-input" rows="2" [(ngModel)]="form.note"></textarea></div>
        </div>
        <div class="mt-3 p-3 bg-light rounded-3">
          <div class="d-flex justify-content-between"><span>Giá trị GD:</span><strong>{{(form.quantity*form.price)|number}} VNĐ</strong></div>
          <div class="d-flex justify-content-between"><span>Thuế (0.1% bán):</span><strong>{{calcTax()|number}} VNĐ</strong></div>
          <div class="d-flex justify-content-between"><span>Tổng:</span><strong>{{calcTotal()|number}} VNĐ</strong></div>
        </div>
        <div class="mt-3 d-flex gap-2">
          <button class="btn btn-ip-accent" (click)="submit()"><i class="bi bi-check-lg me-1"></i>Lưu giao dịch</button>
          <button class="btn btn-ip-outline" (click)="router.navigate(['/transactions'])">Hủy</button>
        </div>
      </div>
    </div></div>
  `
})
export class TransactionFormComponent {
  txService = inject(TransactionService);
  portfolio = inject(PortfolioService);
  router = inject(Router);
  form = { accountId: 'acc1', symbol: '', type: 'buy' as any, quantity: 100, price: 0, fee: 0, tradeDate: new Date().toISOString().split('T')[0], settlementDate: '', note: '' };
  calcTax() { return this.form.type === 'sell' ? this.form.quantity * this.form.price * 0.001 : 0; }
  calcTotal() { return this.form.quantity * this.form.price + this.form.fee + this.calcTax(); }
  submit() {
    this.txService.addTransaction({ ...this.form, tax: this.calcTax(), totalValue: this.calcTotal() } as any);
    this.router.navigate(['/transactions']);
  }
}
