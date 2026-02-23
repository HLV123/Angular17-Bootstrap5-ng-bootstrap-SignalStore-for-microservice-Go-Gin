import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MOCK_PATTERNS } from '../../../core/mock-data';

@Component({
  selector: 'app-patterns', standalone: true, imports: [CommonModule],
  template: `
    <h5 class="fw-bold mb-1">Nhận dạng Pattern tự động</h5>
    <p class="text-muted mb-4" style="font-size:0.82rem">Scan mẫu hình nến Nhật & biểu đồ · gRPC: AnalyticsService</p>
    <div class="row g-3">
      @for (p of patterns; track p.symbol + p.pattern) {
        <div class="col-lg-6">
          <div class="ip-card p-3">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <span class="fw-bold me-2">{{p.symbol}}</span>
                <span class="badge" [ngClass]="{'bg-success':p.type==='bullish_reversal','bg-danger':p.type==='bearish_reversal','bg-warning text-dark':p.type==='continuation'}">{{p.pattern}}</span>
              </div>
              <span class="badge" [ngClass]="{'bg-success':p.confidence==='high','bg-warning text-dark':p.confidence==='medium','bg-secondary':p.confidence==='low'}">{{p.confidence}}</span>
            </div>
            <p class="mt-2 mb-1" style="font-size:0.82rem">{{p.description}}</p>
            <span style="font-size:0.72rem;color:var(--ip-text-muted)">{{p.date}}</span>
          </div>
        </div>
      }
    </div>
  `
})
export class PatternsComponent { patterns = MOCK_PATTERNS; }
