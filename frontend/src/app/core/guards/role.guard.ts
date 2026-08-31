import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRole = route.data['role'] as string;
  const user = authService.currentUser();

  if (authService.isAuthenticated() && user?.role === expectedRole) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
