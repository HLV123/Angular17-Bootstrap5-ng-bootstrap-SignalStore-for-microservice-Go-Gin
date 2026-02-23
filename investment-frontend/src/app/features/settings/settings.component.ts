import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MOCK_USER_SETTINGS } from '../../core/mock-data';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-settings', standalone: true, imports: [CommonModule, FormsModule],
  template: `
    <h5 class="fw-bold mb-4">Cài đặt Cá nhân</h5>
    <div class="row g-3">
      <div class="col-lg-8">
        <!-- Giao dịch -->
        <div class="ip-card p-4 mb-3">
          <h6 class="section-title mb-3"><i class="bi bi-gear-fill"></i>Cài đặt giao dịch</h6>
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label fw-medium" style="font-size:0.82rem">Phương pháp tính giá vốn</label>
              <select class="form-select ip-input" [(ngModel)]="s.costMethod">
                <option value="WAVG">WAVG (Bình quân gia quyền)</option><option value="FIFO">FIFO (Nhập trước xuất trước)</option>
              </select>
              <div style="font-size:0.72rem;color:var(--ip-text-muted)" class="mt-1">WAVG = Tổng(Giá mua × SL) / Tổng SL</div>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-medium" style="font-size:0.82rem">Đơn vị hiển thị số</label>
              <select class="form-select ip-input" [(ngModel)]="s.currencyDisplay">
                <option value="million">Triệu VND (12.5 tr)</option>
                <option value="billion">Tỉ VND (1.2 tỷ)</option>
                <option value="thousand">Ngàn VND (12,500K)</option>
                <option value="full">Đầy đủ (12,500,000)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Giao diện -->
        <div class="ip-card p-4 mb-3">
          <h6 class="section-title mb-3"><i class="bi bi-palette-fill"></i>Giao diện</h6>
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label fw-medium" style="font-size:0.82rem">Chế độ</label>
              <select class="form-select ip-input" [(ngModel)]="s.theme" (ngModelChange)="onThemeChange($event)">
                <option value="light">Light Mode</option><option value="dark">Dark Mode</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label fw-medium" style="font-size:0.82rem">Ngôn ngữ</label>
              <select class="form-select ip-input" [(ngModel)]="s.language">
                <option value="vi">Tiếng Việt</option><option value="en">English</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label fw-medium" style="font-size:0.82rem">Múi giờ</label>
              <select class="form-select ip-input" [(ngModel)]="timezone">
                <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (UTC+7)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (UTC+9)</option>
                <option value="America/New_York">America/New_York (UTC-5)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Biểu đồ -->
        <div class="ip-card p-4 mb-3">
          <h6 class="section-title mb-3"><i class="bi bi-graph-up"></i>Biểu đồ kỹ thuật</h6>
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label fw-medium" style="font-size:0.82rem">Khung thời gian mặc định</label>
              <select class="form-select ip-input" [(ngModel)]="s.defaultInterval">
                <option value="1m">1 Phút</option><option value="5m">5 Phút</option><option value="15m">15 Phút</option>
                <option value="1H">1 Giờ</option><option value="1D">1 Ngày</option><option value="1W">1 Tuần</option><option value="1M">1 Tháng</option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-medium" style="font-size:0.82rem">Loại biểu đồ mặc định</label>
              <select class="form-select ip-input" [(ngModel)]="defaultChartType">
                <option value="candlestick">Nến Nhật (Candlestick)</option>
                <option value="line">Đường (Line)</option>
                <option value="ohlc">OHLC Bar</option>
                <option value="heikin_ashi">Heikin-Ashi</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Thông báo -->
        <div class="ip-card p-4 mb-3">
          <h6 class="section-title mb-3"><i class="bi bi-bell-fill"></i>Kênh thông báo mặc định</h6>
          <div class="d-flex gap-4">
            <label class="form-check"><input type="checkbox" class="form-check-input" [(ngModel)]="notifChannels.inapp"><span class="form-check-label">In-app (bắt buộc)</span></label>
            <label class="form-check"><input type="checkbox" class="form-check-input" [(ngModel)]="notifChannels.email"><span class="form-check-label">Email</span></label>
            <label class="form-check"><input type="checkbox" class="form-check-input" [(ngModel)]="notifChannels.telegram"><span class="form-check-label">Telegram Bot</span></label>
          </div>
          @if (notifChannels.telegram) {
            <div class="mt-2"><label class="form-label" style="font-size:0.82rem">Telegram Webhook URL</label><input class="form-control ip-input" [(ngModel)]="telegramWebhook" placeholder="https://api.telegram.org/bot..."></div>
          }
        </div>

        <div class="d-flex gap-2">
          <button class="btn btn-ip-accent" (click)="save()"><i class="bi bi-check-lg me-1"></i>Lưu cài đặt</button>
          <button class="btn btn-ip-outline">Khôi phục mặc định</button>
        </div>
        @if (saved) { <div class="alert alert-success py-2 mt-2" style="font-size:0.82rem"><i class="bi bi-check-circle me-1"></i>Đã lưu cài đặt thành công!</div> }
      </div>

      <div class="col-lg-4">
        <div class="ip-card p-3 mb-3">
          <h6 class="section-title mb-2"><i class="bi bi-person-circle"></i>Thông tin tài khoản</h6>
          <div class="text-center mb-3"><div class="rounded-circle bg-primary d-inline-flex align-items-center justify-content-center" style="width:64px;height:64px;font-size:1.5rem;color:#fff">NV</div></div>
          <div class="d-flex justify-content-between py-2" style="border-bottom:1px solid #f1f5f9;font-size:0.85rem"><span>Tên</span><strong>Nguyễn Văn Investor</strong></div>
          <div class="d-flex justify-content-between py-2" style="border-bottom:1px solid #f1f5f9;font-size:0.85rem"><span>Email</span><strong>investor&#64;investment.vn</strong></div>
          <div class="d-flex justify-content-between py-2" style="border-bottom:1px solid #f1f5f9;font-size:0.85rem"><span>Vai trò</span><span class="badge bg-primary">Investor</span></div>
          <div class="d-flex justify-content-between py-2" style="font-size:0.85rem"><span>MFA</span><span class="badge bg-secondary">Chưa bật</span></div>
          <div class="mt-3 d-flex flex-column gap-2">
            <button class="btn btn-sm btn-ip-outline"><i class="bi bi-pencil me-1"></i>Cập nhật hồ sơ</button>
            <button class="btn btn-sm btn-ip-outline"><i class="bi bi-key me-1"></i>Đổi mật khẩu</button>
            <button class="btn btn-sm btn-ip-outline"><i class="bi bi-shield-check me-1"></i>Bật MFA (TOTP)</button>
          </div>
        </div>

        <div class="ip-card p-3">
          <h6 class="section-title mb-2"><i class="bi bi-info-circle"></i>API Reference</h6>
          <div style="font-size:0.72rem;color:var(--ip-text-muted)">
            <code>GET /api/v1/settings/user</code><br>
            <code>PUT /api/v1/settings/user</code><br>
            <code>GET /api/v1/settings/user/dashboard</code><br>
            <code>PUT /api/v1/settings/user/dashboard</code><br>
            <code>POST /api/v1/auth/mfa/enable</code><br>
            <code>POST /api/v1/auth/mfa/verify</code>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SettingsComponent {
  themeService = inject(ThemeService);
  s = { ...MOCK_USER_SETTINGS };
  timezone = 'Asia/Ho_Chi_Minh';
  defaultChartType = 'candlestick';
  notifChannels = { inapp: true, email: false, telegram: false };
  telegramWebhook = '';
  saved = false;

  constructor() {
    this.s.theme = this.themeService.currentTheme();
  }

  onThemeChange(newTheme: 'light' | 'dark') {
    this.themeService.setTheme(newTheme);
  }

  save() { this.saved = true; setTimeout(() => this.saved = false, 2000); }
}
