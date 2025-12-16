import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Check if user is authenticated
  if (authService.isAuthenticated()) {
    // Check role if specified in route data
    const allowedRoles = route.data['roles'] as Array<string>;
    if (allowedRoles) {
      const hasRole = authService.hasRole(allowedRoles);
      if (!hasRole) {
        // Redirect to unauthorized or dashboard based on user role
        if (authService.isCustomer()) {
          router.navigate(['/customer/dashboard']);
        } else {
          router.navigate(['/admin/dashboard']);
        }
        return false;
      }
    }
    return true;
  }

  // Not logged in, redirect to login page
  router.navigate(['/auth'], { queryParams: { returnUrl: state.url } });
  return false;
};