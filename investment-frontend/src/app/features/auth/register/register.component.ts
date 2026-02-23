import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="login-wrapper align-items-center justify-content-center">
      <div class="login-card p-5 m-3">
        <div class="text-center mb-4">
          <img src="assets/logo.png" alt="Logo" style="width:60px;height:60px;border-radius:14px;" class="mb-3">
          <h4 class="fw-bold mb-1" style="color:var(--ip-primary)">Đăng ký tài khoản</h4>
          <p class="text-muted mb-0" style="font-size:0.82rem">Investment Platform · Quản lý đầu tư chứng khoán</p>
        </div>

        @if (successMsg) {
          <div class="alert alert-success py-2 px-3" style="font-size:0.85rem;border-radius:8px">
            <i class="bi bi-check-circle me-1"></i>{{ successMsg }}
          </div>
        }
        @if (errorMsg) {
          <div class="alert alert-danger py-2 px-3" style="font-size:0.85rem;border-radius:8px">
            <i class="bi bi-exclamation-circle me-1"></i>{{ errorMsg }}
          </div>
        }

        <div class="mb-3">
          <label class="form-label fw-medium" style="font-size:0.82rem">Họ và tên</label>
          <input type="text" class="form-control ip-input" [(ngModel)]="form.fullName" placeholder="Nguyễn Văn A">
        </div>
        <div class="mb-3">
          <label class="form-label fw-medium" style="font-size:0.82rem">Email</label>
          <input type="email" class="form-control ip-input" [(ngModel)]="form.email" placeholder="email&#64;example.com">
        </div>
        <div class="mb-3">
          <label class="form-label fw-medium" style="font-size:0.82rem">Mật khẩu</label>
          <input type="password" class="form-control ip-input" [(ngModel)]="form.password" placeholder="Tối thiểu 6 ký tự">
        </div>
        <div class="mb-3">
          <label class="form-label fw-medium" style="font-size:0.82rem">Xác nhận mật khẩu</label>
          <input type="password" class="form-control ip-input" [(ngModel)]="form.confirmPassword" placeholder="Nhập lại mật khẩu">
        </div>
        <div class="mb-3">
          <label class="form-label fw-medium" style="font-size:0.82rem">Vai trò</label>
          <select class="form-select ip-input" [(ngModel)]="form.role">
            <option value="investor">Nhà đầu tư cá nhân</option>
            <option value="analyst">Analyst</option>
          </select>
        </div>
        <div class="mb-4">
          <label class="form-check" style="font-size:0.8rem">
            <input type="checkbox" class="form-check-input" [(ngModel)]="form.agree">
            <span class="form-check-label">Tôi đồng ý với <a href="#" class="text-decoration-none">Điều khoản sử dụng</a></span>
          </label>
        </div>

        <button class="btn btn-ip-accent w-100 py-2 fw-semibold" (click)="register()" [disabled]="loading">
          @if (loading) { <span class="spinner-border spinner-border-sm me-2"></span> }
          Đăng ký
        </button>

        <div class="text-center mt-3" style="font-size:0.85rem">
          Đã có tài khoản? <a routerLink="/login" class="text-decoration-none fw-medium" style="color:var(--ip-accent)">Đăng nhập</a>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  form = { fullName: '', email: '', password: '', confirmPassword: '', role: 'investor', agree: false };
  loading = false;
  errorMsg = '';
  successMsg = '';

  constructor(private router: Router) {}

  register(): void {
    this.errorMsg = '';
    this.successMsg = '';
    if (!this.form.fullName || !this.form.email || !this.form.password) {
      this.errorMsg = 'Vui lòng điền đầy đủ thông tin'; return;
    }
    if (this.form.password.length < 6) {
      this.errorMsg = 'Mật khẩu tối thiểu 6 ký tự'; return;
    }
    if (this.form.password !== this.form.confirmPassword) {
      this.errorMsg = 'Mật khẩu xác nhận không khớp'; return;
    }
    if (!this.form.agree) {
      this.errorMsg = 'Vui lòng đồng ý Điều khoản sử dụng'; return;
    }
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
      this.successMsg = 'Đăng ký thành công! Vui lòng đăng nhập.';
      setTimeout(() => this.router.navigate(['/login']), 1500);
    }, 800);
  }
}
