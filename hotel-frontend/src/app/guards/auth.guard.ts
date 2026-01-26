import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};

export const roleGuard = (allowedRoles: string[]) => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    
    if (!authService.isAuthenticated()) {
      router.navigate(['/login']);
      return false;
    }

    const userRole = authService.getUserRole();
    
    if (allowedRoles.includes(userRole)) {
      return true;
    }

    // Redirect based on role
    if (authService.isAdmin() || authService.isStaff()) {
      router.navigate(['/dashboard']);
    } else {
      router.navigate(['/customer/dashboard']);
    }
    
    return false;
  };
};