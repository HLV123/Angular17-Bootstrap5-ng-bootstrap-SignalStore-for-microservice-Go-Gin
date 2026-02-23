import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MOCK_DATA_SOURCES } from '../../../core/mock-data';

@Component({
  selector: 'app-system-config', standalone: true, imports: [CommonModule],
  template: `
    <h5 class="fw-bold mb-4">Nguon Du lieu & Cau hinh</h5>
    <div class="ip-card p-3">
      <h6 class="section-title mb-3"><i class="bi bi-database-fill-gear"></i>Nguon du lieu thi truong</h6>
      <table class="ip-table"><thead><tr><th>Ten</th><th>Loai</th><th>Uu tien</th><th>Trang thai</th><th>Dong bo cuoi</th><th></th></tr></thead>
      <tbody>@for(d of sources; track d.id) {
        <tr><td class="fw-bold">{{d.name}}</td><td>{{d.type}}</td><td>{{d.priority}}</td>
        <td><span class="badge" [ngClass]="d.status==='connected'?'bg-success':d.status==='error'?'bg-danger':'bg-secondary'">{{d.status}}</span></td>
        <td style="font-size:0.78rem">{{d.lastSync}}</td>
        <td><button class="btn btn-sm btn-ip-outline">Test</button></td></tr>
      }</tbody></table>
    </div>
  `
})
export class SystemConfigComponent { sources = MOCK_DATA_SOURCES; }
