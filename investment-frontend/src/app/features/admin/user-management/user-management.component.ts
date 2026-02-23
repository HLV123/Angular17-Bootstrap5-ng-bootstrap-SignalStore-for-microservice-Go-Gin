import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MOCK_ADMIN_USERS } from '../../../core/mock-data';

@Component({
  selector: 'app-user-management', standalone: true, imports: [CommonModule],
  template: `
    <h5 class="fw-bold mb-4">Quan ly Nguoi dung (Admin)</h5>
    <div class="ip-card p-3">
      <table class="ip-table"><thead><tr><th>ID</th><th>Ho ten</th><th>Email</th><th>Vai tro</th><th>Trang thai</th><th>Dang nhap cuoi</th><th></th></tr></thead>
      <tbody>@for(u of users; track u.id) {
        <tr><td class="mono">{{u.id}}</td><td class="fw-bold">{{u.fullName}}</td><td>{{u.email}}</td>
        <td><span class="badge" [ngClass]="{'bg-danger':u.role==='admin','bg-primary':u.role==='investor','bg-warning text-dark':u.role==='analyst'}">{{u.role}}</span></td>
        <td><span class="badge" [ngClass]="u.status==='active'?'bg-success':'bg-secondary'">{{u.status}}</span></td>
        <td style="font-size:0.78rem">{{u.lastLogin}}</td>
        <td><button class="btn btn-sm btn-ip-outline"><i class="bi bi-pencil"></i></button></td></tr>
      }</tbody></table>
    </div>
  `
})
export class UserManagementComponent { users = MOCK_ADMIN_USERS; }
