import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MOCK_AUDIT_LOGS } from '../../../core/mock-data';

@Component({
  selector: 'app-audit-logs', standalone: true, imports: [CommonModule],
  template: `
    <h5 class="fw-bold mb-4">Nhat ky He thong (Audit Log)</h5>
    <div class="ip-card p-3">
      <table class="ip-table"><thead><tr><th>Thoi gian</th><th>Nguoi dung</th><th>Hanh dong</th><th>Doi tuong</th><th>IP</th><th>Chi tiet</th></tr></thead>
      <tbody>@for(l of logs; track l.id) {
        <tr><td class="mono" style="font-size:0.78rem">{{l.createdAt}}</td><td class="fw-bold">{{l.userName}}</td>
        <td><span class="badge bg-light text-dark">{{l.action}}</span></td><td>{{l.entityType}}</td><td class="mono" style="font-size:0.75rem">{{l.ipAddress}}</td>
        <td style="font-size:0.78rem">{{l.details}}</td></tr>
      }</tbody></table>
    </div>
  `
})
export class AuditLogsComponent { logs = MOCK_AUDIT_LOGS; }
