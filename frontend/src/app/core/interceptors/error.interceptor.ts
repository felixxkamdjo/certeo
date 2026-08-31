import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error) => {
      switch (error.status) {
        case 401:
          // Token expired or invalid — redirect to login
          router.navigate(['/login']);
          break;
        case 403:
          // Forbidden - insufficient permissions
          console.error('[HTTP 403] Accès refusé :', error.url);
          break;
        case 404:
          console.error('[HTTP 404] Ressource introuvable :', error.url);
          break;
        case 500:
          console.error('[HTTP 500] Erreur serveur :', error.url);
          break;
        default:
          console.error(`[HTTP ${error.status}] Erreur :`, error.message);
      }

      return throwError(() => error);
    })
  );
};
