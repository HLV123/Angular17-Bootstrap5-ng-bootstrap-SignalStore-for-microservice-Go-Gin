import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-wrapper align-items-center justify-content-center">
      <div class="login-card p-5 m-3">
        <div class="text-center mb-4">
          <img src="assets/logo.png" alt="Logo" style="width:72px;height:72px;border-radius:16px;" class="mb-3">
          <h4 class="fw-bold mb-1" style="color:var(--ip-primary)">Investment Platform</h4>
          <p class="text-muted mb-0" style="font-size:0.85rem">Hệ thống Quản lý & Phân tích Đầu tư Chứng khoán</p>
        </div>

        @if (errorMsg) {
          <div class="alert alert-danger py-2 px-3" style="font-size:0.85rem;border-radius:8px">
            <i class="bi bi-exclamation-circle me-1"></i>{{ errorMsg }}
          </div>
        }

        <div class="mb-3">
          <label class="form-label fw-medium" style="font-size:0.82rem">Email</label>
          <div class="input-group">
            <span class="input-group-text bg-light border-end-0"><i class="bi bi-envelope"></i></span>
            <input type="email" class="form-control border-start-0 ip-input" [(ngModel)]="email"
                   placeholder="investor&#64;investment.vn" (keyup.enter)="login()">
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label fw-medium" style="font-size:0.82rem">Mật khẩu</label>
          <div class="input-group">
            <span class="input-group-text bg-light border-end-0"><i class="bi bi-lock"></i></span>
            <input [type]="showPass ? 'text' : 'password'" class="form-control border-start-0 border-end-0 ip-input"
                   [(ngModel)]="password" placeholder="Nhập mật khẩu" (keyup.enter)="login()">
            <span class="input-group-text bg-light border-start-0 cursor-pointer" (click)="showPass=!showPass" style="cursor:pointer">
              <i class="bi" [ngClass]="showPass ? 'bi-eye-slash' : 'bi-eye'"></i>
            </span>
          </div>
        </div>

        <div class="d-flex justify-content-between align-items-center mb-4">
          <label class="form-check mb-0" style="font-size:0.8rem">
            <input type="checkbox" class="form-check-input" [(ngModel)]="remember">
            <span class="form-check-label">Ghi nhớ</span>
          </label>
          <a href="#" class="text-decoration-none" style="font-size:0.8rem;color:var(--ip-accent)">Quên mật khẩu?</a>
        </div>

        <button class="btn btn-ip-accent w-100 py-2 fw-semibold" (click)="login()" [disabled]="loading">
          @if (loading) {
            <span class="spinner-border spinner-border-sm me-2"></span>
          }
          Đăng nhập
        </button>

        <div class="mt-4 p-3" style="background:#F8FAFC;border-radius:10px;font-size:0.78rem">
          <div class="fw-semibold mb-2"><i class="bi bi-info-circle me-1"></i>Tài khoản demo:</div>
          <div class="d-flex flex-column gap-1">
            <div><span class="badge bg-primary me-1">Investor</span> investor&#64;investment.vn / 123456</div>
            <div><span class="badge bg-danger me-1">Admin</span> admin&#64;investment.vn / admin123</div>
            <div><span class="badge bg-warning text-dark me-1">Analyst</span> analyst&#64;investment.vn / analyst123</div>
          </div>
        </div>

        <div class="text-center mt-3" style="font-size:0.75rem;color:var(--ip-text-muted)">
          Angular 17+ · Go (Gin/Echo) · MariaDB · gRPC · WebSocket
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  email = 'investor@investment.vn';
  password = '123456';
  showPass = false;
  remember = true;
  loading = false;
  errorMsg = '';

  login(): void {
    this.loading = true;
    this.errorMsg = '';
    setTimeout(() => {
      const result = this.auth.login({ email: this.email, password: this.password });
      this.loading = false;
      if (result.success) {
        this.router.navigate(['/dashboard']);
      } else {
        this.errorMsg = result.message;
      }
    }, 600);
  }
}
