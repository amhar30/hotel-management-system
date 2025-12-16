import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // If user is already logged in, redirect to appropriate dashboard
  if (authService.isAuthenticated()) {
    const role = authService.getUserRole();
    
    if (role === 'customer') {
      router.navigate(['/customer/dashboard']);
    } else if (role === 'admin' || role === 'staff') {
      router.navigate(['/admin/dashboard']);
    }
    return false;
  }

  return true;
};