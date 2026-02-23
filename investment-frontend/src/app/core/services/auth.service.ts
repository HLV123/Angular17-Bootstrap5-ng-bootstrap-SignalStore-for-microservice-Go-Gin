import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { User, LoginRequest, LoginResponse } from '../models';
import { MOCK_USERS, MOCK_CREDENTIALS } from '../mock-data';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser = signal<User | null>(null);
  private token = signal<string | null>(null);

  user = this.currentUser.asReadonly();
  isAuthenticated = computed(() => !!this.currentUser());
  isAdmin = computed(() => this.currentUser()?.role === 'admin');
  isAnalyst = computed(() => this.currentUser()?.role === 'analyst' || this.currentUser()?.role === 'admin');

  constructor(private router: Router) {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const stored = localStorage.getItem('ip_user');
    const storedToken = localStorage.getItem('ip_token');
    if (stored && storedToken) {
      try {
        this.currentUser.set(JSON.parse(stored));
        this.token.set(storedToken);
      } catch { this.logout(); }
    }
  }

  login(req: LoginRequest): { success: boolean; message: string } {
    const cred = MOCK_CREDENTIALS.find(c => c.email === req.email && c.password === req.password);
    if (!cred) return { success: false, message: 'Email hoặc mật khẩu không đúng' };
    const user = MOCK_USERS.find(u => u.id === cred.userId)!;
    const fakeToken = 'eyJ' + btoa(JSON.stringify({ userId: user.id, role: user.role, exp: Date.now() + 86400000 }));
    this.currentUser.set(user);
    this.token.set(fakeToken);
    localStorage.setItem('ip_user', JSON.stringify(user));
    localStorage.setItem('ip_token', fakeToken);
    return { success: true, message: 'Đăng nhập thành công' };
  }

  logout(): void {
    this.currentUser.set(null);
    this.token.set(null);
    localStorage.removeItem('ip_user');
    localStorage.removeItem('ip_token');
    this.router.navigate(['/login']);
  }

  getToken(): string | null { return this.token(); }
}
