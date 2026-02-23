import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-alert-history', standalone: true, imports: [CommonModule],
  template: `
    <div class="d-flex justify-content-between mb-4">
      <div><h5 class="fw-bold mb-1">Lich su Canh bao</h5><p class="text-muted mb-0" style="font-size:0.82rem">{{alertService.unreadCount()}} chua doc</p></div>
      <button class="btn btn-sm btn-ip-outline" (click)="alertService.markAllAsRead()"><i class="bi bi-check-all me-1"></i>Doc tat ca</button>
    </div>
    @for(a of alertService.history(); track a.id) {
      <div class="ip-card p-3 mb-2" [style.border-left]="a.isRead?'':'3px solid var(--ip-accent)'">
        <div class="d-flex justify-content-between">
          <div class="d-flex align-items-center gap-2">
            <span class="badge" [ngClass]="{'bg-danger':a.severity==='high','bg-warning text-dark':a.severity==='medium','bg-info':a.severity==='low'}">{{a.severity|uppercase}}</span>
            <strong>{{a.title}}</strong>
          </div>
          <span style="font-size:0.72rem;color:var(--ip-text-muted)">{{a.triggeredAt}}</span>
        </div>
        <p class="mb-0 mt-1" style="font-size:0.82rem">{{a.message}}</p>
        @if(!a.isRead) { <button class="btn btn-sm btn-ip-outline mt-2" (click)="alertService.markAsRead(a.id)">Danh dau da doc</button> }
      </div>
    }
  `
})
export class AlertHistoryComponent { alertService = inject(AlertService); }
