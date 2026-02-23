import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) return true;
  router.navigate(['/login']);
  return false;
};

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAdmin()) return true;
  router.navigate(['/dashboard']);
  return false;
};

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    
    if (!auth.isAuthenticated()) {
      router.navigate(['/login']);
      return false;
    }
    
    const currentUser = auth.user();
    if (currentUser && allowedRoles.includes(currentUser.role)) {
      return true;
    }
    
    router.navigate(['/dashboard']); // Redirect to dashboard if unauthorized
    return false;
  };
};
