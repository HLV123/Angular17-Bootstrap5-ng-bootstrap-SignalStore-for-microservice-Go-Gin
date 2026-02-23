import { Injectable, signal, computed } from '@angular/core';
import { AlertConfig, AlertHistory } from '../models';
import { MOCK_ALERT_CONFIGS, MOCK_ALERT_HISTORY } from '../mock-data';

@Injectable({ providedIn: 'root' })
export class AlertService {
  configs = signal<AlertConfig[]>(MOCK_ALERT_CONFIGS);
  history = signal<AlertHistory[]>(MOCK_ALERT_HISTORY);
  unreadCount = computed(() => this.history().filter(a => !a.isRead).length);

  markAsRead(id: string): void {
    this.history.update(list => list.map(a => a.id === id ? { ...a, isRead: true } : a));
  }

  markAllAsRead(): void {
    this.history.update(list => list.map(a => ({ ...a, isRead: true })));
  }

  toggleAlert(id: string): void {
    this.configs.update(list => list.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a));
  }
}
