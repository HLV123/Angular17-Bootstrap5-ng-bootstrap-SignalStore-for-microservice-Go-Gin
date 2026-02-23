import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bi-integration', standalone: true, imports: [CommonModule],
  template: `
    <h5 class="fw-bold mb-1">Tich hop BI Tools</h5>
    <p class="text-muted mb-4" style="font-size:0.82rem">Tableau, Power BI, Cognos - Embed reports</p>
    <div class="row g-3">
      <div class="col-md-4"><div class="ip-card p-4 text-center">
        <i class="bi bi-bar-chart-steps fs-1 text-primary mb-2"></i>
        <h6 class="fw-bold">Tableau</h6>
        <p style="font-size:0.82rem">Portfolio Performance Dashboard, Sector Heatmap</p>
        <span class="badge bg-success">Connected</span>
        <div class="mt-2" style="font-size:0.72rem;color:var(--ip-text-muted)">REST API + Embed SDK</div>
      </div></div>
      <div class="col-md-4"><div class="ip-card p-4 text-center">
        <i class="bi bi-cpu fs-1 text-warning mb-2"></i>
        <h6 class="fw-bold">Power BI</h6>
        <p style="font-size:0.82rem">P&L Dashboard, Attribution Analysis</p>
        <span class="badge bg-success">Connected</span>
        <div class="mt-2" style="font-size:0.72rem;color:var(--ip-text-muted)">REST API + Embed Token</div>
      </div></div>
      <div class="col-md-4"><div class="ip-card p-4 text-center">
        <i class="bi bi-file-ruled fs-1 text-danger mb-2"></i>
        <h6 class="fw-bold">Cognos</h6>
        <p style="font-size:0.82rem">Bao cao thue TNCN, Lai/Lo da thuc hien</p>
        <span class="badge bg-warning text-dark">Pending</span>
        <div class="mt-2" style="font-size:0.72rem;color:var(--ip-text-muted)">IBM Cognos Analytics API</div>
      </div></div>
    </div>
  `
})
export class BiIntegrationComponent {}
