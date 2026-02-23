import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MOCK_COMPANY_PROFILES, MOCK_FINANCIAL_RATIOS } from '../../../core/mock-data';
import { VndPipe } from '../../../shared/pipes/vnd.pipe';

@Component({
  selector: 'app-company-profile', standalone: true, imports: [CommonModule, FormsModule, VndPipe],
  template: `
    <h5 class="fw-bold mb-1">Hồ sơ Doanh nghiệp</h5>
    <p class="text-muted mb-4" style="font-size:0.82rem">Thông tin cơ bản & chỉ số định giá</p>
    <div class="mb-3"><select class="form-select ip-input" [(ngModel)]="selectedSymbol" style="width:200px">
      @for (p of profiles; track p.symbol) { <option [value]="p.symbol">{{p.symbol}} - {{p.companyName}}</option> }
    </select></div>
    @if (profile) {
      <div class="row g-3 mb-3">
        <div class="col-lg-8">
          <div class="ip-card p-4">
            <h6 class="fw-bold">{{profile.companyName}}</h6>
            <div class="d-flex gap-2 mb-2"><span class="badge bg-primary">{{profile.exchange}}</span><span class="badge bg-light text-dark">{{profile.sector}}</span><span class="badge bg-light text-dark">{{profile.industry}}</span></div>
            <p style="font-size:0.85rem">{{profile.description}}</p>
            <div class="row g-2 mt-2">
              <div class="col-4"><span class="stat-label">Vốn hóa</span><div class="fw-bold">{{profile.marketCap|vnd:'short'}}</div></div>
              <div class="col-4"><span class="stat-label">KLCP Lưu hành</span><div class="fw-bold">{{(profile.sharesOutstanding/1e6)|number:'1.0-0'}}M</div></div>
              <div class="col-4"><span class="stat-label">Free Float</span><div class="fw-bold">{{profile.freeFloat}}%</div></div>
              <div class="col-4"><span class="stat-label">Room NN</span><div class="fw-bold">{{profile.foreignRoom}}%</div></div>
              <div class="col-4"><span class="stat-label">SH Nước ngoài</span><div class="fw-bold">{{profile.foreignOwnership}}%</div></div>
            </div>
          </div>
        </div>
        <div class="col-lg-4">
          @if (ratio) {
            <div class="ip-card p-3 mb-3">
              <h6 class="section-title mb-2"><i class="bi bi-calculator"></i>Chỉ số định giá</h6>
              <div class="d-flex justify-content-between py-1" style="border-bottom:1px solid #f1f5f9"><span>P/E</span><strong>{{ratio.pe}}</strong></div>
              <div class="d-flex justify-content-between py-1" style="border-bottom:1px solid #f1f5f9"><span>P/B</span><strong>{{ratio.pb}}</strong></div>
              <div class="d-flex justify-content-between py-1" style="border-bottom:1px solid #f1f5f9"><span>EV/EBITDA</span><strong>{{ratio.evEbitda}}</strong></div>
              <div class="d-flex justify-content-between py-1" style="border-bottom:1px solid #f1f5f9"><span>Dividend Yield</span><strong>{{ratio.dividendYield}}%</strong></div>
            </div>
            <div class="ip-card p-3">
              <h6 class="section-title mb-2"><i class="bi bi-percent"></i>Sinh lời</h6>
              <div class="d-flex justify-content-between py-1" style="border-bottom:1px solid #f1f5f9"><span>ROE</span><strong class="positive">{{ratio.roe}}%</strong></div>
              <div class="d-flex justify-content-between py-1" style="border-bottom:1px solid #f1f5f9"><span>ROA</span><strong>{{ratio.roa}}%</strong></div>
              <div class="d-flex justify-content-between py-1" style="border-bottom:1px solid #f1f5f9"><span>Biên LN ròng</span><strong>{{ratio.netMargin}}%</strong></div>
              <div class="d-flex justify-content-between py-1"><span>Tăng trưởng EPS</span><strong class="positive">+{{ratio.epsGrowth}}%</strong></div>
            </div>
          }
        </div>
      </div>
    }
  `
})
export class CompanyProfileComponent {
  profiles = MOCK_COMPANY_PROFILES;
  ratios = MOCK_FINANCIAL_RATIOS;
  selectedSymbol = 'VIC';
  get profile() { return this.profiles.find(p => p.symbol === this.selectedSymbol); }
  get ratio() { return this.ratios.find(r => r.symbol === this.selectedSymbol); }
}
